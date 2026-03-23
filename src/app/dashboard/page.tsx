import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { AdminDashboard } from './admin-dashboard'
import { SalesDashboard } from './sales-dashboard'
import { logout } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      role,
      full_name,
      tenants (
        id,
        name,
        expiry_date
      )
    `)
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return (
      <div className="p-10 text-white bg-red-950 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">LỖI TRUY VẤN DATABASE</h1>
        <pre className="bg-black/50 p-6 rounded-xl max-w-4xl overflow-auto text-red-300 border border-red-500/30">
          {JSON.stringify(profileError, null, 2)}
        </pre>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-10 text-white bg-slate-900 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-amber-500 mb-4">KHÔNG TÌM THẤY PROFILE</h1>
        <p className="text-slate-300 mb-2">Hệ thống nhận diện bạn là: <span className="font-mono text-emerald-400">{user.email}</span></p>
        <p className="text-slate-300 mb-6">Mã ID của bạn: <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{user.id}</span></p>
        <p className="max-w-xl text-center text-slate-400">
          Nếu mã ID trên khớp với mã trong bảng user_profiles mà vẫn ra lỗi này, 100% là do cài đặt Row Level Security trên Supabase vẫn đang chặn truy cập.
        </p>
      </div>
    )
  }

  // Handle Super Admin
  if (profile?.role === 'superadmin') {
    redirect('/superadmin')
  }

  // Handle License Expiry
  const tenant: any = profile?.tenants;
  if (tenant && tenant.expiry_date) {
    const isExpired = new Date(tenant.expiry_date) < new Date();
    if (isExpired) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-950/40 border border-red-500/20 p-8 md:p-12 rounded-3xl max-w-md shadow-2xl relative overflow-hidden backdrop-blur-xl">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-rose-400"></div>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
             <h1 className="text-2xl font-bold text-white mb-2">Truy cập đã hết hạn</h1>
             <p className="text-slate-400 mb-6">Đại lý <strong className="text-white">{tenant.name}</strong> đã hết hạn bản quyền phần mềm. Vui lòng liên hệ nhà cung cấp (Super Admin) để gia hạn.</p>
             <form action={logout}>
              <button className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors border border-slate-700">Đăng xuất</button>
             </form>
          </div>
        </div>
      )
    }
  }

  if (profile?.role === 'admin') {
    return <AdminDashboard profile={profile} user={user} />
  }

  return <SalesDashboard profile={profile} user={user} />
}
