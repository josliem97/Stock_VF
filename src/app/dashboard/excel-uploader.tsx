'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { syncInventoryFromExcel } from './actions'

export function ExcelUploader() {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(worksheet)
      const plainJson = JSON.parse(JSON.stringify(json))
      
      const res = await syncInventoryFromExcel(plainJson)
      if (res?.error) {
        alert("Error: " + res.error)
      } else {
        alert("Import successful!")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to parse Excel file.")
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl text-sm shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all flex items-center gap-2"
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        )}
        {loading ? 'Importing...' : 'Import Excel'}
      </button>
    </>
  )
}
