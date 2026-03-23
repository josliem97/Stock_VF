'use client'

import { useState } from 'react'
import { extendTenantExpiry, createTenant, addMasterCar, deleteMasterCar } from './actions'

export function SuperAdminClient({ initialTenants, initialCars }: { initialTenants: any[], initialCars: any[] }) {
  const [tab, setTab] = useState<'tenants'|'cars'>('tenants')

  const isExpired = (dateString: string | null) => {
    if (!dateString) return true;
    return new Date(dateString) < new Date();
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-800">
        <button 
          onClick={() => setTab('tenants')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${tab === 'tenants' ? 'border-fuchsia-500 text-fuchsia-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Tenants Management
        </button>
        <button 
          onClick={() => setTab('cars')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${tab === 'cars' ? 'border-fuchsia-500 text-fuchsia-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Global Master Cars
        </button>
      </div>

      {tab === 'tenants' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
             <h2 className="text-lg font-bold text-white mb-4">Register New Dealership (Tenant)</h2>
             <form action={createTenant} className="flex flex-col sm:flex-row gap-4 items-end">
               <div className="flex-1 w-full">
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dealership Name</label>
                 <input name="name" required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500" placeholder="VinFast..." />
               </div>
               <div className="w-full sm:w-48">
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Initial Days</label>
                 <input name="days" type="number" defaultValue="30" required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500" />
               </div>
               <button className="w-full sm:w-auto px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-medium rounded-lg transition-colors whitespace-nowrap">
                 Create Tenant
               </button>
             </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tenant Name</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Expiry Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {initialTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{t.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isExpired(t.expiry_date) ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {isExpired(t.expiry_date) ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {t.expiry_date ? new Date(t.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => extendTenantExpiry(t.id, 30)} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded transition-colors border border-emerald-500/20">
                          +30 Days
                        </button>
                        <button onClick={() => extendTenantExpiry(t.id, 365)} className="px-3 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 text-xs font-semibold rounded transition-colors border border-fuchsia-500/20">
                          +1 Year
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'cars' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
             <h2 className="text-lg font-bold text-white mb-4">Add Global Master Car</h2>
             <form action={addMasterCar} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
               <div className="col-span-2 md:col-span-1">
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Model</label>
                 <input name="car_type" required placeholder="VF 8" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
               </div>
               <div className="col-span-1">
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year</label>
                 <input name="model_year" type="number" defaultValue="2024" required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
               </div>
               <div className="col-span-1 md:col-span-1">
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trim</label>
                 <input name="trim_level" required placeholder="Plus" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
               </div>
               <div className="col-span-1 md:col-span-1">
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ext Color</label>
                 <input name="exterior_color" required placeholder="Trắng" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
               </div>
               <div className="col-span-1 md:col-span-1">
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Int Color</label>
                 <input name="interior_color" required placeholder="Đen" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
               </div>
               <button className="col-span-2 md:col-span-1 w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors">
                 Add Car
               </button>
             </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {initialCars.map((car) => (
                <div key={car.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between group hover:border-slate-700 transition-all shadow-lg hover:shadow-xl">
                   <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-lg font-black text-white">{car.car_type}</span>
                        <span className="text-xs font-bold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">{car.model_year}</span>
                      </div>
                      <p className="text-purple-400 font-semibold text-sm mb-3 uppercase tracking-wide">{car.trim_level}</p>
                      <div className="flex gap-2 text-xs text-slate-300">
                        <span className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700/50">Ngoại: {car.exterior_color}</span>
                        <span className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700/50">Nội: {car.interior_color}</span>
                      </div>
                   </div>
                   <button onClick={() => deleteMasterCar(car.id)} className="mt-4 w-full py-1.5 text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 border border-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                     Xóa
                   </button>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  )
}
