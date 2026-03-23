'use client'

import { useState, useMemo } from 'react'
import { requestReservation } from './actions'

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

export function SalesDashboardClient({ initialData }: { initialData: InventoryItem[] }) {
  const [filterType, setFilterType] = useState('All')
  const [filterColor, setFilterColor] = useState('All')
  const [reserving, setReservations] = useState<string[]>([])

  const handleReserve = async (id: string) => {
    if (!confirm('Gửi thông báo "Yêu cầu giữ xe" cho Admin?')) return;
    
    setReservations(prev => [...prev, id])
    const res = await requestReservation(id)
    if (res?.error) {
      alert("Lỗi: " + res.error)
      setReservations(prev => prev.filter(r => r !== id))
    } else {
      alert("Đã gửi yêu cầu giữ xe thành công!")
    }
  }

  // Unique lists for filters
  const carTypes = useMemo(() => Array.from(new Set(initialData.map(item => item.master_cars.car_type))), [initialData])
  const colors = useMemo(() => Array.from(new Set(initialData.map(item => item.master_cars.exterior_color))), [initialData])

  const filteredData = initialData.filter(item => {
    const saleableStock = (item.beginning_stock + item.in_transit) - (item.pending_delivery + item.continuous_contract);
    if (saleableStock <= 0) return false; // Only show available cars
    
    if (filterType !== 'All' && item.master_cars.car_type !== filterType) return false
    if (filterColor !== 'All' && item.master_cars.exterior_color !== filterColor) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md sticky top-[72px] z-10 shadow-xl">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Bộ lọc xe có sẵn</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[120px]">
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
            >
              <option value="All">Tất cả loại xe</option>
              {carTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <select 
              value={filterColor} 
              onChange={e => setFilterColor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
            >
              <option value="All">Tất cả màu</option>
              {colors.map(color => <option key={color} value={color}>{color}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.length === 0 ? (
           <div className="col-span-full p-12 text-center border border-dashed border-slate-800 rounded-3xl mt-4">
             <p className="text-slate-400 text-lg">Không tìm thấy xe nào có sẵn phù hợp với bộ lọc.</p>
           </div>
        ) : (
          filteredData.map(item => {
            const saleableStock = (item.beginning_stock + item.in_transit) - (item.pending_delivery + item.continuous_contract);
            const isReserving = reserving.includes(item.id)

            return (
              <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 backdrop-blur-sm hover:bg-slate-800/40 transition-colors flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[40px]"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{item.master_cars.car_type}</h3>
                      <p className="text-sm text-slate-400 font-medium">Model {item.master_cars.model_year} • {item.master_cars.trim_level}</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-center">
                      <p className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-wider leading-none">Tồn Bán</p>
                      <p className="text-xl font-black text-emerald-400 leading-tight">{saleableStock}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-5 mb-6">
                    <div className="flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                      <span className="w-4 h-4 rounded-full border-2 border-slate-700 shadow-inner" style={{ backgroundColor: item.master_cars.exterior_color.toLowerCase() }}></span>
                      <span className="text-sm text-slate-300 font-medium">Ngoại thất: {item.master_cars.exterior_color}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                      <span className="w-4 h-4 rounded-full border-2 border-slate-700 shadow-inner" style={{ backgroundColor: item.master_cars.interior_color.toLowerCase() }}></span>
                      <span className="text-sm text-slate-300 font-medium">Nội thất: {item.master_cars.interior_color}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleReserve(item.id)}
                  disabled={isReserving}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isReserving ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                      Yêu cầu giữ xe
                    </>
                  )}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
