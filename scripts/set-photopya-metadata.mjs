import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Variables manquantes: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const TARGET_EMAIL = 'michaelmitwari@gmail.com'
const COMPANY_NAME = 'Photopya'

const { data: users, error: listError } = await supabase.auth.admin.listUsers()

if (listError) {
  console.error('Erreur récupération utilisateurs:', listError.message)
  process.exit(1)
}

const target = users.users.find(u => u.email === TARGET_EMAIL)

if (!target) {
  console.error(`Utilisateur ${TARGET_EMAIL} introuvable`)
  process.exit(1)
}

const { error } = await supabase.auth.admin.updateUserById(target.id, {
  user_metadata: { ...target.user_metadata, company_name: COMPANY_NAME }
})

if (error) {
  console.error('Erreur mise à jour:', error.message)
  process.exit(1)
}

console.log(`Métadonnées mises à jour: ${TARGET_EMAIL} → company_name = "${COMPANY_NAME}"`)
