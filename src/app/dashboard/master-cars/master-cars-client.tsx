'use client'

import { useState } from 'react'
import { upsertMasterCarForAdmin, deleteMasterCarForAdmin } from '../actions'
import Link from 'next/link'

export function MasterCarsClient({ initialCars }: { initialCars: any[] }) {
  const [loading, setLoading] = useState(false)
  const [editingCar, setEditingCar] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget  // Lưu tham chiếu trước khi await
    setLoading(true)
    const formData = new FormData(form)
    const res = await upsertMasterCarForAdmin(formData)
    setLoading(false)
    if (res?.success) {
      setEditingCar(null)
      form.reset()
    } else {
      alert(res?.error || 'Lỗi khi lưu danh mục')
    }
  }

  const filteredCars = initialCars.filter(car => 
    car.car_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.trim_level.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Form Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          {editingCar ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Chỉnh sửa dòng xe: <span className="text-indigo-400">{editingCar.car_type} {editingCar.trim_level}</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Thêm dòng xe mới vào danh mục
            </>
          )}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
          {editingCar && <input type="hidden" name="id" value={editingCar.id} />}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Loại xe</label>
            <input name="car_type" defaultValue={editingCar?.car_type} required placeholder="VD: VF 6" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Năm sản xuất</label>
            <input name="model_year" type="number" defaultValue={editingCar?.model_year || 2024} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Phiên bản (Trim)</label>
            <input name="trim_level" defaultValue={editingCar?.trim_level} required placeholder="VD: Plus" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Màu ngoại thất</label>
            <input name="exterior_color" defaultValue={editingCar?.exterior_color} required placeholder="VD: Trắng" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Màu nội thất</label>
            <input name="interior_color" defaultValue={editingCar?.interior_color} required placeholder="VD: Đen" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : editingCar ? 'Cập Nhật' : 'Thêm Xe'}
            </button>
            {editingCar && (
              <button type="button" onClick={() => setEditingCar(null)} className="px-4 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-all">
                Hủy
              </button>
            )}
          </div>
        </form>
      </section>

      {/* List Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           <h3 className="text-xl font-bold text-white self-start">Danh sách Master Catalog ({filteredCars.length})</h3>
           <div className="relative w-full md:w-72">
             <input 
               type="text" 
               placeholder="Tìm kiếm mẫu xe..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
             />
             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCars.map((car) => (
            <div key={car.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 group hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                   <span className="text-2xl font-black text-white tracking-tighter uppercase">{car.car_type}</span>
                   <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{car.trim_level}</span>
                </div>
                <span className="bg-slate-950 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg border border-slate-800">
                  {car.model_year}
                </span>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 w-12 lowercase italic">Ngoại:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-slate-700 shadow-inner" style={{ backgroundColor: car.exterior_color.toLowerCase() }}></div>
                    <span className="text-slate-200 font-semibold">{car.exterior_color}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 w-12 lowercase italic">Nội:</span>
                  <span className="text-slate-200 font-semibold">{car.interior_color}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/50 flex gap-2">
                <button 
                  onClick={() => { setEditingCar(car); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex-1 py-2 bg-slate-950 hover:bg-indigo-600 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-800 hover:border-indigo-500 transition-all"
                >
                  Chỉnh Sửa
                </button>
                <button 
                  onClick={() => { if(confirm('Lưu ý: Bạn chỉ được xóa xe nếu chưa có ai nhập kho mẫu xe này. Chắc chắn xóa?')) deleteMasterCarForAdmin(car.id) }} 
                  className="px-3 py-2 bg-slate-950 hover:bg-red-600 text-slate-500 hover:text-white rounded-lg border border-slate-800 hover:border-red-500 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
