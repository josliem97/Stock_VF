'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateInventoryStock(id: string, field: string, value: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return;
  
  const allowedFields = ['beginning_stock', 'in_transit', 'pending_delivery', 'continuous_contract'];
  if (!allowedFields.includes(field)) return;

  const { data: oldData } = await supabase.from('inventory').select('*').eq('id', id).single()
  const oldValue = oldData ? (oldData as any)[field] : null;

  if (oldValue === value) return;

  await supabase
    .from('inventory')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)

  await supabase.from('inventory_logs').insert({
    tenant_id: oldData?.tenant_id,
    inventory_id: id,
    user_id: user.id,
    action_type: 'inline_edit',
    field_changed: field,
    old_value: oldValue,
    new_value: value
  })

  revalidatePath('/dashboard')
}

export async function syncInventoryFromExcel(rows: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single()
  const tenant_id = profile?.tenant_id
  if (!tenant_id) return { error: 'No tenant linked to user' }

  const { data: masterCars } = await supabase.from('master_cars').select('*')
  if (!masterCars || masterCars.length === 0) return { error: 'Danh mục xe trống. Hãy thêm xe trên SaaS Super Admin.' }

  const logEntries = [];
  const unmatchedCars: string[] = [];
  let processedCount = 0;

  for (const row of rows) {
    const carType = String(row['Loại xe'] || row['type'] || '')
    const year = String(row['Năm sản xuất'] || row['Năm SX'] || row['year'] || '')
    
    let trim = String(row['Phiên bản'] || '')
    let extColor = String(row['Màu ngoại thất'] || '')
    
    const combinedVariant = row['Tên kiểu xe - màu xe'] || row['variant'];
    if (combinedVariant) {
       const parts = String(combinedVariant).split('-');
       trim = parts[0]?.trim() || '';
       extColor = parts.slice(1).join('-').trim() || '';
    }

    const intColor = String(row['Màu nội thất'] || row['interior'] || '')

    const matchedCar = masterCars.find(c => 
      c.car_type?.toLowerCase() === carType.toLowerCase() &&
      c.model_year?.toString() === year &&
      c.trim_level?.toLowerCase() === trim.toLowerCase() &&
      c.exterior_color?.toLowerCase() === extColor.toLowerCase() &&
      c.interior_color?.toLowerCase() === intColor.toLowerCase()
    )

    if (matchedCar) {
      processedCount++;
      const { data: existing } = await supabase
        .from('inventory')
        .select('id, beginning_stock, in_transit, pending_delivery, continuous_contract')
        .eq('tenant_id', tenant_id)
        .eq('master_car_id', matchedCar.id)
        .maybeSingle()

      const beginning_stock = parseInt(row['Tồn đầu'] || row['stock']) || 0
      const in_transit = parseInt(row['Xe đi đường'] || row['transit']) || 0
      const pending_delivery = parseInt(row['Ký chờ'] || row['booked']) || 0
      const continuous_contract = parseInt(row['Xe HĐ nối'] || row['contract']) || 0

      if (existing) {
        await supabase.from('inventory').update({
          beginning_stock, in_transit, pending_delivery, continuous_contract, updated_at: new Date().toISOString()
        }).eq('id', existing.id)

        const fields = ['beginning_stock', 'in_transit', 'pending_delivery', 'continuous_contract'] as const;
        const newValues = { beginning_stock, in_transit, pending_delivery, continuous_contract } as any;
        
        for (const f of fields) {
          if (existing[f] !== newValues[f]) {
            logEntries.push({
              tenant_id, inventory_id: existing.id, user_id: user.id,
              action_type: 'excel_import', field_changed: f,
              old_value: existing[f], new_value: newValues[f]
            })
          }
        }
      } else {
        const { data: newInv } = await supabase.from('inventory').insert({
          tenant_id,
          master_car_id: matchedCar.id,
          beginning_stock, in_transit, pending_delivery, continuous_contract
        }).select('id').single()

        if (newInv) {
            logEntries.push({
              tenant_id, inventory_id: newInv.id, user_id: user.id,
              action_type: 'excel_import', field_changed: 'beginning_stock',
              old_value: 0, new_value: beginning_stock
            })
        }
      }
    } else {
      unmatchedCars.push(`${carType} ${trim} (${extColor})`);
    }
  }

  if (processedCount === 0 && unmatchedCars.length > 0) {
    return { error: `Không thể khớp dữ liệu. Các mẫu xe sau chưa tồn tại trong Danh mục: ${unmatchedCars.join(', ')}. Hãy thêm chúng vào Master Catalog trước.` }
  }

  if (unmatchedCars.length > 0) {
    // Some success, some fail
    const errorMsg = `Đã nhập thành công ${processedCount} dòng. Tuy nhiên, có ${unmatchedCars.length} mẫu xe bị bỏ qua do chưa có trong Danh mục: ${unmatchedCars.join(', ')}.`;
    if (logEntries.length > 0) await supabase.from('inventory_logs').insert(logEntries)
    revalidatePath('/dashboard')
    return { error: errorMsg }
  }

  if (logEntries.length > 0) {
    await supabase.from('inventory_logs').insert(logEntries)
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function requestReservation(inventoryId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single()
  const tenant_id = profile?.tenant_id
  if (!tenant_id) return { error: 'No tenant linked to user' }

  const { error } = await supabase.from('reservations').insert({
    tenant_id,
    sales_id: user.id,
    inventory_id: inventoryId,
    status: 'pending'
  })

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { success: true }
}

export async function processReservation(reservationId: string, action: 'approve' | 'reject') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('user_profiles').select('role, tenant_id').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const { data: reservation } = await supabase.from('reservations').select('id, inventory_id, status').eq('id', reservationId).single()
  if (!reservation || reservation.status !== 'pending') return { error: 'Invalid reservation' }

  if (action === 'approve') {
    await supabase.from('reservations').update({ status: 'approved' }).eq('id', reservationId)
    
    const { data: inv } = await supabase.from('inventory').select('pending_delivery').eq('id', reservation.inventory_id).single()
    const oldVal = inv?.pending_delivery || 0;
    const newVal = oldVal + 1;
    
    await supabase.from('inventory').update({ pending_delivery: newVal }).eq('id', reservation.inventory_id)

    await supabase.from('inventory_logs').insert({
      tenant_id: profile.tenant_id,
      inventory_id: reservation.inventory_id,
      user_id: user.id,
      action_type: 'reservation_approval',
      field_changed: 'pending_delivery',
      old_value: oldVal,
      new_value: newVal
    })

  } else {
    await supabase.from('reservations').update({ status: 'rejected' }).eq('id', reservationId)
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function quickAddInventory(masterCarId: string, stock: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single()
  const tenant_id = profile?.tenant_id
  if (!tenant_id) return { error: 'No tenant linked to user' }

  const { data: existing } = await supabase
    .from('inventory')
    .select('id, beginning_stock')
    .eq('tenant_id', tenant_id)
    .eq('master_car_id', masterCarId)
    .maybeSingle()

  if (existing) {
    const newVal = (existing.beginning_stock || 0) + stock;
    await supabase.from('inventory').update({ beginning_stock: newVal }).eq('id', existing.id)
    
    await supabase.from('inventory_logs').insert({
      tenant_id, inventory_id: existing.id, user_id: user.id,
      action_type: 'manual_add', field_changed: 'beginning_stock',
      old_value: existing.beginning_stock, new_value: newVal
    })
  } else {
    const { data: newInv } = await supabase.from('inventory').insert({
      tenant_id,
      master_car_id: masterCarId,
      beginning_stock: stock
    }).select('id').single()

    if (newInv) {
      await supabase.from('inventory_logs').insert({
        tenant_id, inventory_id: newInv.id, user_id: user.id,
        action_type: 'manual_add', field_changed: 'beginning_stock',
        old_value: 0, new_value: stock
      })
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function upsertMasterCarForAdmin(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string | null
  
  const car = {
    car_type: formData.get('car_type'),
    model_year: parseInt(formData.get('model_year') as string),
    trim_level: formData.get('trim_level'),
    exterior_color: formData.get('exterior_color'),
    interior_color: formData.get('interior_color')
  }

  let error;
  if (id) {
    ({ error } = await supabase.from('master_cars').update(car).eq('id', id))
  } else {
    ({ error } = await supabase.from('master_cars').insert(car))
  }

  if (!error) {
    revalidatePath('/dashboard')
    return { success: true }
  }
  return { error: error.message }
}

export async function deleteMasterCarForAdmin(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('master_cars').delete().eq('id', id)
  if (!error) {
    revalidatePath('/dashboard')
    return { success: true }
  }
  return { error: error.message }
}
