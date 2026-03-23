import { createClient } from '@/utils/supabase/server'
import { logout } from './actions'
import { SalesDashboardClient } from './sales-dashboard-client'

export async function SalesDashboard({ profile, user }: { profile: any, user: any }) {
  const supabase = await createClient();
  const tenantName = profile?.tenants?.name;

  const { data: inventoryData } = await supabase
    .from('inventory')
    .select(`
      id,
      master_car_id,
      beginning_stock,
      in_transit,
      pending_delivery,
      continuous_contract,
      master_cars (
        car_type,
        model_year,
        trim_level,
        exterior_color,
        interior_color
      )
    `)
    .eq('tenant_id', profile?.tenants?.id || '')
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative">
      <header className="px-5 md:px-8 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center shadow-lg z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg border border-teal-400/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4-4-4 4M12 8v8"></path></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight">
              {tenantName || 'Unknown Dealership'}
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Sales Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right flex flex-col items-end hidden sm:flex">
            <p className="text-sm font-semibold text-slate-200">{profile?.full_name || user.email}</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
              SALES
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800 mx-1 hidden sm:block"></div>
          <form action={logout}>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full z-10">
         <div className="mb-6 mt-2">
            <h2 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Tra Cứu Kho Xe</h2>
            <p className="text-slate-400 text-xs font-medium">Danh sách các xe hiện có sẵn để báo khách và tư vấn.</p>
          </div>
        <SalesDashboardClient initialData={inventoryData as any || []} />
      </main>
    </div>
  )
}
