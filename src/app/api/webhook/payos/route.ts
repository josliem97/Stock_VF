import { NextRequest, NextResponse } from "next/server";
import { payos } from "@/lib/payos";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // 1. Verify Checksum
    let webhookData;
    try {
      // In @payos/node version 2.x, the method is verifyPaymentWebhookData
      webhookData = (payos as any).verifyPaymentWebhookData(body);
    } catch (err) {
      console.error('Checksum verification failed:', err);
      // Still return 200 for PayOS "pings" that might not have a checksum
      return NextResponse.json({ success: true, message: "Ping received (or checksum failed)" });
    }
    
    if (!webhookData) {
      return NextResponse.json({ error: "Invalid checksum" }, { status: 400 });
    }

    // 2. Only process if payment is successful
    if (webhookData.code === '00' || webhookData.desc === 'success') {
      const orderCode = webhookData.orderCode;
      const amount = webhookData.amount;

      // Initialize Supabase with Service Role
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 3. Find invoice
      let { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('tenant_id, status')
        .eq('order_id', String(orderCode))
        .maybeSingle();

      let targetTenantId = invoice?.tenant_id;

      if (!invoice) {
          console.warn('Invoice record missing for orderCode:', orderCode);
          const parts = (webhookData.description || "").split(' ');
          if (parts.length >= 2) {
              const partialId = parts[1].replace(/-/g, '');
              const { data: tenants } = await supabase.from('tenants').select('id');
              const foundTenant = tenants?.find(t => t.id.replace(/-/g, '').startsWith(partialId));
              if (foundTenant) {
                  targetTenantId = foundTenant.id;
                  console.log('Recovery Success: Found tenant via description match:', targetTenantId);
              }
          }
      }

      if (!targetTenantId) {
          console.error('CRITICAL: Transaction identified but no tenant found for order:', orderCode);
          return NextResponse.json({ success: true, message: "Tenant not found, ignored." });
      }

      if (invoice && invoice.status === 'PAID') {
          return NextResponse.json({ success: true, message: "Already processed" });
      }

      // 4. Update/Create Invoice status
      if (invoice) {
        await supabase.from('invoices').update({ status: 'PAID' }).eq('order_id', String(orderCode));
      } else {
        await supabase.from('invoices').insert({
          tenant_id: targetTenantId,
          order_id: String(orderCode),
          amount: amount,
          status: 'PAID'
        });
      }

      // 5. Calculate New Expiry Date
      const { data: tenant } = await supabase
        .from('tenants')
        .select('expiry_date')
        .eq('id', targetTenantId)
        .single();

      let daysToAdd = 0;
      if (amount <= 210000) daysToAdd = 7;
      else if (amount <= 1100000) daysToAdd = 30;
      else if (amount >= 9000000) daysToAdd = 365;

      let currentExpiry = tenant?.expiry_date ? new Date(tenant.expiry_date) : new Date();
      if (currentExpiry < new Date()) {
          currentExpiry = new Date();
      }
      
      currentExpiry.setDate(currentExpiry.getDate() + daysToAdd);

      // 6. Update Tenant Expiry
      await supabase
        .from('tenants')
        .update({ 
          expiry_date: currentExpiry.toISOString(),
          status: 'ACTIVE',
          plan_type: amount >= 1000000 ? 'PRO' : 'BASIC'
        })
        .eq('id', targetTenantId);

      console.log(`Successfully extended subscription for tenant ${targetTenantId} by ${daysToAdd} days.`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    // Return 200 anyway to prevent PayOS from retrying infinitely on minor internal errors, 
    // but log it so we can see what's wrong.
    return NextResponse.json({ error: err.message }, { status: 200 }); 
  }
}
