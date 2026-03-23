const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rhbyjukrymnbqzbyniij.supabase.co',
  'sb_secret_kVyJGaEH1fy8JQQdwPs2wg_oM70I4z1'
);

async function check() {
  const { data: users, error: err1 } = await supabase.auth.admin.listUsers();
  console.log("Auth Users:", users?.users?.map(u => ({ id: u.id, email: u.email })));
  
  const { data: profiles, error: err2 } = await supabase.from('user_profiles').select('*');
  console.log("Profiles:", profiles);
  console.log("Profile Error:", err2);
  
  const { data: tenants, error: err3 } = await supabase.from('tenants').select('*');
  console.log("Tenants:", tenants);
}

check();
