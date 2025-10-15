// src/lib/schema-utils-firebase.ts
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

/**
 * 🔹 Obtener el schema completo de una sección
 */
export async function getSectionSchema(project: string, section: string) {
  try {
    const schemaDocRef = doc(
      db,
      'projects',
      project,
      'sections',
      section,
      'schema'
    )
    const snap = await getDoc(schemaDocRef)
    if (!snap.exists()) return null
    return snap.data() // { fields: [...] }
  } catch (err) {
    console.error(`Firestore GET schema error for ${project}/${section}:`, err)
    return null
  }
}

/**
 * 🔹 Crear o reemplazar un schema completo para una sección
 */
export async function setSectionSchema(
  project: string,
  section: string,
  fields: any[]
) {
  try {
    const schemaDocRef = doc(
      db,
      'projects',
      project,
      'sections',
      section,
      'schema'
    )
    await setDoc(schemaDocRef, { fields })
    return { fields }
  } catch (err) {
    console.error(`Firestore SET schema error for ${project}/${section}:`, err)
    return null
  }
}

/**
 * 🔹 Actualizar parcialmente un schema (por ejemplo, agregar o editar algunos campos)
 */
export async function updateSectionSchema(
  project: string,
  section: string,
  updates: Record<string, any>
) {
  try {
    const schemaDocRef = doc(
      db,
      'projects',
      project,
      'sections',
      section,
      'schema'
    )
    await updateDoc(schemaDocRef, updates)
    const snap = await getDoc(schemaDocRef)
    return snap.data()
  } catch (err) {
    console.error(
      `Firestore UPDATE schema error for ${project}/${section}:`,
      err
    )
    return null
  }
}
