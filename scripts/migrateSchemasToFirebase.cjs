// scripts/migrateSchemasToFirebase.cjs
const fs = require('fs')
const path = require('path')
const admin = require('firebase-admin')

// =====================
// CONFIGURACIÓN DINÁMICA
// =====================
const PROJECT = 'bharat' // Nombre del proyecto en Firestore
const SECTION = 'history' // Nombre de la sección dentro del proyecto
const JSON_FILE = `${PROJECT}-${SECTION}.json` // Archivo JSON en /schema-db/

// =====================
// INICIALIZACIÓN DE FIREBASE
// =====================
const serviceAccount = require(path.join(
  __dirname,
  '..',
  'serviceAccountKey.json'
))

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()

// =====================
// CARGA DE JSON
// =====================
const schemaPath = path.join(__dirname, '..', 'schema-db', JSON_FILE)
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

// =====================
// VALIDACIÓN DE CAMPOS
// =====================
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
      if (key.includes('.') || key.includes('/')) return false
      return isValidFirestoreValue(val)
    })
  }

  return true
}

// =====================
// MIGRACIÓN A FIRESTORE
// =====================
;(async () => {
  try {
    const invalidFields = []

    for (const [index, field] of schema.entries()) {
      for (const [key, value] of Object.entries(field)) {
        if (!isValidFirestoreValue(value)) invalidFields.push(key)
      }
    }

    if (invalidFields.length > 0) {
      console.log(`❌ Schema has invalid fields:`, invalidFields)
      return
    }

    // Guardar el schema como un solo documento dentro de la sección
    const ref = db
      .collection('projects')
      .doc(PROJECT)
      .collection('sections')
      .doc(SECTION)
      .collection('schema')
      .doc('fields') // documento único que contiene el schema

    await ref.set({ fields: schema })
    console.log(`✅ Schema migrated successfully for ${PROJECT}/${SECTION}`)
    console.log('🎉 Migration completed!')
  } catch (err) {
    console.error('❌ Failed to migrate schema:', err.message)
  }
})()
