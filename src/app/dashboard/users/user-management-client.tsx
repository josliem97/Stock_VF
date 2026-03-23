'use client'

import { useState } from 'react'
import { createSalesUser, toggleUserStatus } from './actions'

type UserInfo = {
  id: string
  full_name: string
  email: string
  role: string
  isBanned: boolean
}

export function UserManagementClient({ salesUsers }: { salesUsers: UserInfo[] }) {
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    const formData = new FormData(form)
    const res = await createSalesUser(formData)
    setLoading(false)
    if (res?.error) {
      alert("Error: " + res.error)
    } else {
      alert("User created!")
      form.reset()
    }
  }

  const handleToggle = async (id: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'Unlock' : 'Lock'
    if (!confirm(`Are you sure you want to ${action} this account?`)) return
    
    setLoading(true)
    const res = await toggleUserStatus(id, currentlyBanned)
    setLoading(false)
    if (res?.error) {
      alert("Error: " + res.error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create User Form */}
      <div className="lg:col-span-1">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
          <h3 className="text-lg font-bold text-slate-200 mb-6">Create Sales Account</h3>
          <form className="flex flex-col gap-4" onSubmit={handleCreate}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input name="fullName" required className="rounded-xl px-4 py-3 bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white" placeholder="John Doe" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <input name="email" type="email" required className="rounded-xl px-4 py-3 bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white" placeholder="sales@dealership.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <input name="password" type="password" required className="rounded-xl px-4 py-3 bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white" placeholder="••••••••" />
            </div>
            <button disabled={loading} className="mt-4 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all">
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>

      {/* Users List */}
      <div className="lg:col-span-2">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="p-6 border-b border-slate-800/80 bg-slate-900/50">
            <h3 className="text-lg font-bold text-slate-200">Sales Representatives</h3>
          </div>
          {salesUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400">No sales accounts created yet.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/80 border-b border-slate-700/50 uppercase text-[10px] font-bold tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {salesUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{u.full_name}</div>
                      <div className="text-slate-500 text-xs mt-1">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {u.isBanned ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">Locked</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleToggle(u.id, u.isBanned)} disabled={loading} className={`px-4 py-2 border rounded-lg text-xs font-semibold transition-all ${u.isBanned ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}>
                          {u.isBanned ? 'Unlock Account' : 'Lock Account'}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
