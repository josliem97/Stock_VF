'use client'

import { useState } from 'react'
import { processReservation } from './actions'

type Reservation = {
  id: string
  status: string
  created_at: string
  user_profiles: {
    full_name: string
  }
  inventory: {
    master_cars: {
      car_type: string
      exterior_color: string
    }
  }
}

export function AdminReservations({ pendingReservations }: { pendingReservations: Reservation[] }) {
  const [processing, setProcessing] = useState<string | null>(null)

  const handleProcess = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id)
    await processReservation(id, action)
    setProcessing(null)
  }

  if (pendingReservations.length === 0) return null

  return (
    <div className="mb-10 bg-slate-900/50 border border-amber-500/30 rounded-2xl p-6 shadow-lg shadow-amber-500/5 backdrop-blur-md">
      <h3 className="text-lg font-bold text-amber-500 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        Yêu cầu giữ xe ({pendingReservations.length})
      </h3>
      <div className="space-y-3">
        {pendingReservations.map(res => (
          <div key={res.id} className="flex justify-between items-center bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">
                {res.inventory.master_cars.car_type} • <span className="text-slate-400 font-normal">{res.inventory.master_cars.exterior_color}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Yêu cầu bởi: <span className="text-slate-300 font-medium">{res.user_profiles.full_name}</span></p>
            </div>
            <div className="flex gap-2">
              <button 
                disabled={processing === res.id}
                onClick={() => handleProcess(res.id, 'reject')}
                className="px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-bold uppercase transition-colors"
              >
                Từ chối
              </button>
              <button 
                disabled={processing === res.id}
                onClick={() => handleProcess(res.id, 'approve')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase shadow-lg shadow-emerald-600/20 transition-all font-semibold"
              >
                {processing === res.id ? 'Đang xử lý...' : 'Duyệt'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
