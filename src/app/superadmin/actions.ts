'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function extendTenantExpiry(tenantId: string, days: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') return { error: 'Unauthorized' }

  const { data: tenant } = await supabase.from('tenants').select('expiry_date').eq('id', tenantId).single()
  
  let baseDate = new Date()
  if (tenant?.expiry_date && new Date(tenant.expiry_date) > baseDate) {
    baseDate = new Date(tenant.expiry_date)
  }

  const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)

  const { error } = await supabase
    .from('tenants')
    .update({ expiry_date: newExpiry.toISOString() })
    .eq('id', tenantId)

  if (!error) revalidatePath('/superadmin')
  return { error }
}

export async function createTenant(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const days = parseInt(formData.get('days') as string || '30')
  
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + days)

  const { error } = await supabase
    .from('tenants')
    .insert({ name, expiry_date: expiry.toISOString() })

  if (!error) revalidatePath('/superadmin')
  return { error }
}

export async function addMasterCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') return { error: 'Unauthorized' }
  
  const car = {
    car_type: formData.get('car_type'),
    model_year: parseInt(formData.get('model_year') as string),
    trim_level: formData.get('trim_level'),
    exterior_color: formData.get('exterior_color'),
    interior_color: formData.get('interior_color')
  }

  const { error } = await supabase.from('master_cars').insert(car)
  if (!error) revalidatePath('/superadmin')
  return { error }
}

export async function deleteMasterCar(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') return { error: 'Unauthorized' }

  const { error } = await supabase.from('master_cars').delete().eq('id', id)
  if (!error) revalidatePath('/superadmin')
  return { error }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
