import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MasterCarsClient } from './master-cars-client'
import { logout } from '../actions'

export default async function MasterCarsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name, tenants(name)')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: masterCars } = await supabase
    .from('master_cars')
    .select('*')
    .order('car_type', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative">
      <header className="px-5 md:px-8 py-4 md:py-5 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center shadow-lg z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 mb-0.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-90">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
              Quản lý Catalog
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{(profile as any).tenants?.name || 'Admin Portal'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="text-right flex flex-col items-end hidden sm:flex">
            <p className="text-sm font-semibold text-slate-200">{profile.full_name || user.email}</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest shadow-inner">
              ADMIN
            </span>
          </div>
           <div className="w-px h-8 bg-slate-800 mx-1 md:mx-4 hidden sm:block"></div>
           <form action={logout}>
            <button className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700 active:scale-95">
              <span className="hidden sm:inline">Sign Out</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full z-10 relative">
         <div className="absolute top-0 right-[-10%] -z-10 w-[70%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />
         <div className="absolute bottom-[-20%] left-[-10%] -z-10 w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />
         
         <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Master Catalog Management</h2>
            <p className="text-slate-400 font-medium">Thêm mới hoặc chỉnh sửa danh mục các mẫu xe VinFast dùng chung cho hệ thống.</p>
         </div>

         <MasterCarsClient initialCars={masterCars || []} />
      </main>
    </div>
  )
}
