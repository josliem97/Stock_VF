'use client'

import { useState, useEffect } from 'react'
import { updateInventoryStock } from './actions'

type InventoryItem = {
  id: string
  master_car_id: string
  beginning_stock: number
  in_transit: number
  pending_delivery: number
  continuous_contract: number
  master_cars: {
    car_type: string
    model_year: number
    trim_level: string
    exterior_color: string
    interior_color: string
  }
}

export function InventoryTable({ initialData }: { initialData: InventoryItem[] }) {
  const [data, setData] = useState(initialData)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleUpdate = async (id: string, field: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    
    // Optimistic UI update
    setData((prev) => 
      prev.map(row => row.id === id ? { ...row, [field]: numValue } : row)
    );

    setUpdating(id);
    await updateInventoryStock(id, field, numValue);
    setUpdating(null);
  }

  if (data.length === 0) {
    return (
      <div className="p-16 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        </div>
        <p className="text-slate-300 font-semibold mb-1 text-lg">No vehicles found in inventory.</p>
        <p className="text-sm text-slate-500 max-w-sm">Use the Excel import feature or add new records.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-900 border-b border-slate-700/50 uppercase text-[10px] font-bold tracking-wider">
          <tr>
            <th className="px-6 py-4 text-slate-400">Vehicle Model</th>
            <th className="px-6 py-4 text-slate-400">Details</th>
            <th className="px-6 py-4 bg-slate-800/40 text-blue-400 border-l border-slate-700/50">Tồn đầu</th>
            <th className="px-6 py-4 bg-slate-800/40 text-indigo-400">Xe đi đường</th>
            <th className="px-6 py-4 bg-slate-800/20 text-purple-400">Ký chờ</th>
            <th className="px-6 py-4 bg-slate-800/20 text-fuchsia-400">Xe HĐ nối</th>
            <th className="px-6 py-4 text-emerald-400 border-l border-slate-700/50 bg-emerald-500/10">Tồn Có Thể Bán</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {data.map((row) => {
            const saleableStock = (row.beginning_stock + row.in_transit) - (row.pending_delivery + row.continuous_contract);
            
            return (
              <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-200 text-base">{row.master_cars.car_type}</div>
                  <div className="text-slate-500 font-medium">Model {row.master_cars.model_year} • {row.master_cars.trim_level}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-600 shadow-inner" style={{ backgroundColor: row.master_cars.exterior_color.toLowerCase() }}></span>
                      <span className="text-slate-300">{row.master_cars.exterior_color}</span>
                    </div>
                    <div className="text-slate-500 text-xs">Int: {row.master_cars.interior_color}</div>
                  </div>
                </td>
                <td className="px-4 py-4 bg-slate-800/20 border-l border-slate-700/50">
                  <input 
                    type="number"
                    defaultValue={row.beginning_stock}
                    onBlur={(e) => handleUpdate(row.id, 'beginning_stock', e.target.value)}
                    className="w-16 bg-slate-900 border border-slate-700 hover:border-blue-500 rounded-lg p-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center font-medium transition-all"
                  />
                </td>
                <td className="px-4 py-4 bg-slate-800/20">
                  <input 
                    type="number"
                    defaultValue={row.in_transit}
                    onBlur={(e) => handleUpdate(row.id, 'in_transit', e.target.value)}
                    className="w-16 bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-lg p-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-center font-medium transition-all"
                  />
                </td>
                <td className="px-4 py-4 bg-slate-800/10">
                  <input 
                    type="number"
                    defaultValue={row.pending_delivery}
                    onBlur={(e) => handleUpdate(row.id, 'pending_delivery', e.target.value)}
                    className="w-16 bg-slate-900 border border-slate-700 hover:border-purple-500 rounded-lg p-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-center font-medium transition-all"
                  />
                </td>
                <td className="px-4 py-4 bg-slate-800/10">
                  <input 
                    type="number"
                    defaultValue={row.continuous_contract}
                    onBlur={(e) => handleUpdate(row.id, 'continuous_contract', e.target.value)}
                    className="w-16 bg-slate-900 border border-slate-700 hover:border-fuchsia-500 rounded-lg p-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 text-center font-medium transition-all"
                  />
                </td>
                <td className="px-6 py-4 font-bold text-lg border-l border-slate-700/50 bg-emerald-500/10 text-center">
                  <span className={saleableStock > 0 ? 'text-emerald-400' : saleableStock < 0 ? 'text-red-400' : 'text-slate-400'}>
                    {saleableStock}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
