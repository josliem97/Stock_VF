import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rhbyjukrymnbqzbyniij.supabase.co',
  'sb_secret_kVyJGaEH1fy8JQQdwPs2wg_oM70I4z1'
);

const data = [
  {"type": "VF 3", "year": 2026, "variant": "Plus - Xám xi măng", "interior": "Đen", "stock": 3, "transit": 2, "booked": 2, "contract": 2},
  {"type": "VF 3", "year": 2026, "variant": "Plus - Trắng", "interior": "Đen", "stock": 0, "transit": 2, "booked": 4, "contract": 0},
  {"type": "VF 3", "year": 2026, "variant": "Eco - Trắng", "interior": "Đen", "stock": 10, "transit": 3, "booked": 1, "contract": 0},
  {"type": "VF 5", "year": 2026, "variant": "PLUS - Trắng", "interior": "Đen", "stock": 11, "transit": 3, "booked": 5, "contract": 0},
  {"type": "VF 8", "year": 2026, "variant": "ECO US - Trắng", "interior": "Đen", "stock": 1, "transit": 3, "booked": 0, "contract": 1},
  {"type": "Limo", "year": 2025, "variant": "Tiêu chuẩn - Bạc", "interior": "Đen", "stock": 12, "transit": 0, "booked": 5, "contract": 0}
];

const TENANT_ID = '6d5b1948-bbb3-47eb-ab07-bc571ee2e7be';

async function seed() {
  console.log('Starting Supabase Seeding...');
  for (const item of data) {
    const parts = item.variant.split(' - ');
    const trim_level = parts[0];
    const exterior_color = parts[1] || '';
    
    console.log(`Working on: ${item.type} ${trim_level} ${exterior_color}`);
    
    // Insert into master_cars
    const { data: car, error: carError } = await supabase
      .from('master_cars')
      .insert({
        car_type: item.type,
        model_year: item.year,
        trim_level: trim_level,
        exterior_color: exterior_color,
        interior_color: item.interior
      })
      .select('id')
      .single();

    if (carError) {
      console.error('  Failed to insert master row:', carError.message);
      continue;
    }

    // Insert into inventory
    const { error: invError } = await supabase
      .from('inventory')
      .insert({
        tenant_id: TENANT_ID,
        master_car_id: car.id,
        beginning_stock: item.stock,
        in_transit: item.transit,
        pending_delivery: item.booked,
        continuous_contract: item.contract
      });

    if (invError) {
      console.error('  Failed to insert inventory row:', invError.message);
    } else {
      console.log('  Successfully added to Inventory!');
    }
  }
  
  console.log('\nSeed Successfully Completed.');
}

seed();
