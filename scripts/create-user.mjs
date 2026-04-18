import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.USER_EMAIL
const password = process.env.USER_PASSWORD

if (!supabaseUrl || !serviceRoleKey || !email || !password) {
  console.error('Variables manquantes: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, USER_EMAIL, USER_PASSWORD')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log(`Création du compte pour: ${email}`)

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true
})

if (error) {
  console.error('Erreur:', error.message)
  process.exit(1)
}

console.log(`Compte créé avec succès!`)
console.log(`User ID: ${data.user.id}`)
console.log(`Email: ${data.user.email}`)
