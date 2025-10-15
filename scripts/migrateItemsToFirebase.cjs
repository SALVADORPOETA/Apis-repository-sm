// scripts/migrateItemsToFirebase.cjs
const fs = require('fs')
const path = require('path')
const admin = require('firebase-admin')

// =====================
// CONFIGURACIÓN DINÁMICA
// =====================
const PROJECT = 'kemet' // Nombre del proyecto en Firestore
const SECTION = 'gods' // Nombre de la sección dentro del proyecto
const JSON_FILE = `${SECTION}.json` // Nombre del archivo JSON en /data/<project>/

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
const itemsPath = path.join(__dirname, '..', 'data', PROJECT, JSON_FILE)
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'))

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
  for (const [index, item] of items.entries()) {
    const invalidFields = []

    for (const [key, value] of Object.entries(item)) {
      if (!isValidFirestoreValue(value)) invalidFields.push(key)
    }

    if (invalidFields.length > 0) {
      console.log(`❌ Item index ${index} has invalid fields:`, invalidFields)
      continue
    }

    try {
      // Crea un doc con id automático dentro de la subcolección "items"
      const ref = db
        .collection('projects')
        .doc(PROJECT)
        .collection('sections')
        .doc(SECTION)
        .collection('items')

      await ref.add(item)
      console.log(`✅ Migrated item index ${index}`)
    } catch (err) {
      console.error(`❌ Failed item index ${index}:`, err.message)
    }
  }

  console.log('🎉 Migration completed!')
})()
