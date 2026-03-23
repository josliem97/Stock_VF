import { InventoryTable } from './inventory-table'
import { ExcelUploader } from './excel-uploader'
import { QuickAddInventory } from './quick-add-inventory'
import Link from 'next/link'
import { logout } from './actions'
import { createClient } from '@/utils/supabase/server'
import { AdminReservations } from './admin-reservations'

export async function AdminDashboard({ profile, user }: { profile: any, user: any }) {
  const supabase = await createClient();
  const tenantName = profile?.tenants?.name;

  const { data: masterCars } = await supabase
    .from('master_cars')
    .select('*')
    .order('car_type', { ascending: true });

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

  const stats = (inventoryData || []).reduce(
    (acc, row) => {
      acc.beginning_stock += row.beginning_stock || 0
      acc.in_transit += row.in_transit || 0
      acc.pending_delivery += row.pending_delivery || 0
      acc.continuous_contract += row.continuous_contract || 0
      return acc
    },
    { beginning_stock: 0, in_transit: 0, pending_delivery: 0, continuous_contract: 0 }
  )

  const { data: rawReservations } = await supabase
    .from('reservations')
    .select(`
      id,
      status,
      created_at,
      sales_id,
      inventory:inventory_id(
        master_cars(car_type, exterior_color)
      )
    `)
    .eq('tenant_id', profile?.tenants?.id || '')
    .eq('status', 'pending');

  const pendingReservations = [];
  if (rawReservations && rawReservations.length > 0) {
    const salesIds = rawReservations.map(r => r.sales_id);
    const { data: salesProfiles } = await supabase.from('user_profiles').select('id, full_name').in('id', salesIds);
    
    for (const r of rawReservations) {
       const userProfile = salesProfiles?.find(p => p.id === r.sales_id);
       pendingReservations.push({
         ...r,
         user_profiles: { full_name: userProfile?.full_name || 'Unknown' }
       });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative">
      <header className="px-5 md:px-8 py-4 md:py-5 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center shadow-lg z-20 sticky top-0">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="3" ry="3"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight">
              {tenantName || 'Unknown Dealership'}
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Admin Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="text-right flex flex-col items-end hidden sm:flex">
            <p className="text-sm font-semibold text-slate-200">{profile?.full_name || user.email}</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest shadow-inner">
              ADMIN
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800 mx-1 md:mx-2 hidden sm:block"></div>
          <Link href="/dashboard/master-cars" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 border border-slate-700 bg-slate-800/50 rounded-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Master Catalog
          </Link>
          <Link href="/dashboard/billing" className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all font-bold text-xs uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Gói cước
          </Link>
          <Link href="/dashboard/users" className="hidden md:flex text-sm font-medium text-slate-300 hover:text-white transition-colors mr-2 px-3 py-1.5 border border-slate-700 bg-slate-800/50 rounded-lg">
            Quản lý Sales
          </Link>
          <form action={logout}>
            <button className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700 active:scale-95">
              <span className="hidden sm:inline">Sign Out</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full z-10">
        <div className="absolute top-0 right-[-10%] -z-10 w-[70%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
        <AdminReservations pendingReservations={pendingReservations as any} />
        <div className="absolute bottom-[-20%] left-[-10%] -z-10 w-[60%] h-[60%] bg-indigo-900/15 blur-[150px] rounded-full pointer-events-none" />

        <div className="mb-8 md:mb-10 mt-2 md:mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">Inventory Dashboard</h2>
            <p className="text-slate-400 text-sm font-medium">Manage cars, monitor stock levels, and coordinate deliveries.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <ExcelUploader />
            <QuickAddInventory masterCars={masterCars || []} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[
            { label: 'Tồn đầu', value: stats.beginning_stock.toString(), color: 'from-blue-500/10 to-transparent', borderColor: 'border-blue-500/20' },
            { label: 'Xe đi đường', value: stats.in_transit.toString(), color: 'from-indigo-500/10 to-transparent', borderColor: 'border-indigo-500/20' },
            { label: 'Ký chờ', value: stats.pending_delivery.toString(), color: 'from-purple-500/10 to-transparent', borderColor: 'border-purple-500/20' },
            { label: 'Xe HĐ nối', value: stats.continuous_contract.toString(), color: 'from-fuchsia-500/10 to-transparent', borderColor: 'border-fuchsia-500/20' },
          ].map((stat, i) => (
            <div key={i} className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border ${stat.borderColor} bg-gradient-to-b ${stat.color} bg-slate-900/40 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-slate-600 transition-colors`}>
              <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 md:mb-2">{stat.label}</p>
              <p className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          <div className="p-4 md:p-6 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-base md:text-lg font-bold text-slate-200">Current Stock</h3>
          </div>
          <InventoryTable initialData={inventoryData as any || []} />
        </div>
      </main>
    </div>
  )
}
