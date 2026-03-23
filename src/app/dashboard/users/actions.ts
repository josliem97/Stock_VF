'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

export async function createSalesUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: adminProfile } = await supabase.from('user_profiles').select('role, tenant_id').eq('id', user.id).single()
  
  if (adminProfile?.role !== 'admin') {
    return { error: 'Unauthorized: Admins only' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const tenantId = adminProfile.tenant_id

  // 1. Create auth user via admin API
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authUser.user) {
    return { error: authError?.message || 'Failed to create user' }
  }

  // 2. Create user_profile record
  const { error: profileError } = await supabaseAdmin.from('user_profiles').insert({
    id: authUser.user.id,
    tenant_id: tenantId,
    role: 'sales',
    full_name: fullName
  })

  if (profileError) {
    // rollback user creation if profile fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return { error: profileError.message }
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: adminProfile } = await supabase.from('user_profiles').select('role, tenant_id').eq('id', user.id).single()
  
  if (adminProfile?.role !== 'admin') {
    return { error: 'Unauthorized: Admins only' }
  }

  // To toggle ban, we ban them for 100 years or unban them
  const banDuration = !currentStatus ? "876000h" : "none" // 100 years in hours
  
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: banDuration
  })

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/users')
  return { success: true }
}
