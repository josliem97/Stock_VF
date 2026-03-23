import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '../actions'
import { BillingClient } from './billing-client'
import Script from 'next/script'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name, tenant_id, tenants(*)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const tenant = profile.tenants as any
  const isExpired = tenant.status === 'EXPIRED' || (tenant.expiry_date && new Date(tenant.expiry_date) < new Date())

  // Use service role to bypass RLS for reading billing data
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get invoices
  const { data: invoices } = await serviceSupabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })

  const pendingInvoice = invoices?.find(inv => inv.status === 'PENDING')

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative">
      <Script src="https://cdn.payos.vn/payos-checkout/v1/stable/payos-initialize.js" strategy="afterInteractive" />
      {/* Background Decor */}
      <div className="absolute top-0 right-[-10%] -z-10 w-[70%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] -z-10 w-[50%] h-[50%] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />
      
      <header className="px-8 py-5 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center shadow-lg z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-90">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Thanh toán & Gói cước</h1>
        </div>
        <form action={logout}>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all border border-slate-800">
            Sign Out
          </button>
        </form>
      </header>

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full z-10">
        {/* Hero Section */}
        <div className="mb-12">
            <h2 className="text-4xl font-black text-white italic tracking-tighter mb-4">DỊCH VỤ ĐẠI LÝ</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-3xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Đại lý hiện tại</p>
                    <p className="text-xl font-black text-white">{tenant.name}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-3xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gói cước</p>
                    <span className="text-xl font-black text-indigo-400 uppercase">{tenant.plan_type || 'BASIC'}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-3xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ngày hết hạn</p>
                    <p className={`text-xl font-black ${isExpired ? 'text-red-400 px-2 rounded-lg' : 'text-white'}`}>
                        {tenant.expiry_date ? new Date(tenant.expiry_date).toLocaleDateString('vi-VN') : '31/12/2024 (Dùng thử)'}
                    </p>
                </div>
            </div>
        </div>

        {/* Dynamic Billing UI */}
        <BillingClient pendingInvoice={pendingInvoice} />

        {/* History Section */}
        <div className="mt-20 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-10 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-white italic tracking-tighter">LỊCH SỬ GIAO DỊCH</h3>
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-500 italic">
                Cập nhật lần cuối: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
                        <tr className="border-b border-slate-800">
                            <th className="px-6 py-4">Ngày tạo</th>
                            <th className="px-6 py-4">Mã đơn hàng</th>
                            <th className="px-6 py-4 text-right">Giá trị</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-800/30 transition-all group">
                                <td className="px-6 py-5 text-slate-400 italic font-medium">{new Date(inv.created_at).toLocaleString('vi-VN')}</td>
                                <td className="px-6 py-5 font-black text-white uppercase tracking-wider">{inv.order_id}</td>
                                <td className="px-6 py-5 text-right font-black text-indigo-400 text-lg">{Number(inv.amount).toLocaleString('vi-VN')} đ</td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                        {inv.status === 'PAID' ? 'Đã thanh toán' : 'Đang xử lý'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-950/50 rounded-3xl border border-dashed border-slate-800">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <p className="text-slate-600 font-bold italic uppercase tracking-widest text-xs">Không có dữ liệu thanh toán</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
