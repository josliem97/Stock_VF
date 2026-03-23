import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { UserManagementClient } from './user-management-client'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('user_profiles').select('role, tenant_id').eq('id', user.id).single()
  
  if (profile?.role !== 'admin') {
    return (
      <div className="p-8 text-center min-h-screen bg-slate-950 text-white">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Unauthorized</h1>
        <p>You must be an admin to view this page.</p>
        <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">Return to Dashboard</Link>
      </div>
    )
  }

  // Get all sales profiles for this tenant
  const { data: salesProfiles } = await supabaseAdmin
    .from('user_profiles')
    .select('id, full_name, role, created_at')
    .eq('tenant_id', profile.tenant_id)
    .eq('role', 'sales')
    .order('created_at', { ascending: false })

  // We need to fetch ban status from admin API to show if they are active
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
  
  const salesUsersWithStatus = salesProfiles?.map(sp => {
    const authUser = authUsers?.users.find(u => u.id === sp.id)
    return {
      ...sp,
      email: authUser?.email || 'N/A',
      isBanned: !!authUser?.banned_until
    }
  }) || []

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative">
      <header className="px-8 py-5 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center shadow-lg z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back
          </Link>
          <div className="w-px h-6 bg-slate-800 mx-2"></div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              User Management
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full z-10">
        <div className="mb-10 mt-4 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Sales Team</h2>
            <p className="text-slate-400 text-sm font-medium">Manage dealership sales accounts and access.</p>
          </div>
        </div>

        <UserManagementClient salesUsers={salesUsersWithStatus} />
      </main>
    </div>
  )
}
