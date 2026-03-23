'use server'

import { createClient } from "@/utils/supabase/server";
import { payos } from "@/lib/payos";

export async function createPaymentLink(plan: '7DAYS' | '1MONTH' | '1YEAR') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return { error: "No tenant linked" };

  let amount = 0;
  let description = `GIAHAN ${profile.tenant_id}`;

  if (plan === '7DAYS') amount = 200000;
  else if (plan === '1MONTH') amount = 1000000;
  else if (plan === '1YEAR') amount = 10000000;

  try {
    const orderCode = Number(String(Date.now()).slice(-9));
    const requestData = {
      orderCode,
      amount,
      description: description.slice(0, 25), // PayOS limit
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
    };

    const paymentLinkRes = await payos.paymentRequests.create(requestData);
    console.log('PayOS Payment Link Created:', paymentLinkRes);
    
    // Log the intent in Invoices
    const { error: insertError } = await supabase.from('invoices').insert({
        tenant_id: profile.tenant_id,
        amount,
        order_id: String(orderCode),
        status: 'PENDING'
    });

    if (insertError) console.error('Error inserting invoice:', insertError);

    return { 
      checkoutUrl: paymentLinkRes.checkoutUrl,
      qrCode: paymentLinkRes.qrCode,
      accountNumber: paymentLinkRes.accountNumber,
      accountName: paymentLinkRes.accountName,
      bin: paymentLinkRes.bin,
      amount: paymentLinkRes.amount,
      description: paymentLinkRes.description,
      orderCode: paymentLinkRes.orderCode
    };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to create payment link" };
  }
}
