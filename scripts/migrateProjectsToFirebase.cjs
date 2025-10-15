// scripts/migrateProjectsToFirebase.cjs
const fs = require('fs')
const path = require('path')
const admin = require('firebase-admin')

// Carga tu archivo de service account
const serviceAccount = require(path.join(
  __dirname,
  '..',
  'serviceAccountKey.json'
))

// Inicializa Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

// Carga JSON con los proyectos
const projectsPath = path.join(__dirname, '..', 'data', 'projects.json')
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'))

// Función para validar valores de Firestore
function isValidFirestoreValue(value) {
  if (
    value === undefined ||
    value === null ||
    typeof value === 'function' ||
    typeof value === 'bigint'
  )
    return false

  if (Array.isArray(value)) return value.every(isValidFirestoreValue)

  if (value && typeof value === 'object') {
    return Object.entries(value).every(([key, val]) => {
      if (key.includes('.') || key.includes('/')) return false // No permite puntos ni slashes
      return isValidFirestoreValue(val)
    })
  }

  return true
}

// Migración
;(async () => {
  for (const [index, p] of projects.entries()) {
    const invalidFields = []

    for (const [key, value] of Object.entries(p)) {
      if (!isValidFirestoreValue(value)) invalidFields.push(key)
    }

    if (!p.key || typeof p.key !== 'string' || p.key.includes('/')) {
      invalidFields.push('key (invalid document ID)')
    }

    if (invalidFields.length > 0) {
      console.log(
        `❌ Project index ${index} (${
          p.name || 'Unnamed'
        }) has invalid fields:`,
        invalidFields
      )
      continue // Saltar proyecto inválido
    }

    // Limpiar datos explícitamente
    const cleanProject = {
      key: p.key,
      name: p.name,
      sections: p.sections,
    }

    const ref = db.collection('projects').doc(p.key)

    try {
      await ref.set(cleanProject)
      console.log(`✅ Migrated project index ${index} (${p.name})`)
    } catch (err) {
      console.error(
        `❌ Failed project index ${index} (${p.name}):`,
        err.message
      )
    }
  }

  console.log('🎉 Migration completed!')
})()
