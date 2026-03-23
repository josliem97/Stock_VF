import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logoutAction } from './actions'
import { SuperAdminClient } from './superadmin-client'

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    redirect('/dashboard')
  }

  // Fetch all tenants
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all master cars
  const { data: masterCars } = await supabase
    .from('master_cars')
    .select('*')
    .order('car_type', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="px-5 md:px-8 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-20 sticky top-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-lg shadow-lg shadow-fuchsia-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
             <h1 className="text-xl font-bold text-white tracking-tight">SaaS Super Admin</h1>
             <p className="text-[10px] md:text-xs text-fuchsia-400 font-medium uppercase tracking-wider mt-0.5">System Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right flex flex-col items-end hidden sm:flex">
             <span className="text-sm font-semibold text-slate-200">{profile.full_name || user.email}</span>
             <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 uppercase tracking-widest shadow-inner">
               SUPER ADMIN
             </span>
           </div>
           <div className="w-px h-8 bg-slate-800 mx-1 md:mx-4 hidden sm:block"></div>
           <form action={logoutAction}>
             <button className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700 active:scale-95">
              <span>Sign Out</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
             </button>
           </form>
        </div>
      </header>

      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full z-10 relative">
         <div className="absolute top-0 right-[-10%] -z-10 w-[70%] h-[50%] bg-fuchsia-900/10 blur-[120px] rounded-full pointer-events-none" />
         <div className="absolute bottom-[-20%] left-[-10%] -z-10 w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />
         
         <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">System Infrastructure</h2>
            <p className="text-slate-400 text-sm font-medium">Manage dealership access and global VinFast product lines.</p>
         </div>

         <SuperAdminClient initialTenants={tenants || []} initialCars={masterCars || []} />
      </main>
    </div>
  )
}
