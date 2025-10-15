// src/lib/firebase-utils.ts
import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

// ---------------------------
// CRUD para los ítems
// ---------------------------

// Obtener todos los ítems de una sección
export async function getSectionData(project: string, section: string) {
  try {
    const sectionRef = collection(
      db,
      'projects',
      project,
      'sections',
      section,
      'items'
    )
    const snap = await getDocs(sectionRef)
    if (!snap.docs.length) return []

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error(`Firestore GET error for ${project}/${section}:`, err)
    return []
  }
}

// Obtener un solo ítem por ID (Firestore doc id)
export async function getDataItem(
  project: string,
  section: string,
  id: string
) {
  try {
    const docRef = doc(
      db,
      'projects',
      project,
      'sections',
      section,
      'items',
      id
    )
    const snap = await getDoc(docRef)
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() }
  } catch (err) {
    console.error(
      `Firestore GET item error for ${project}/${section} id=${id}:`,
      err
    )
    return null
  }
}

// Crear un nuevo ítem
export async function createDataItem(
  project: string,
  section: string,
  data: Record<string, any>
) {
  let docRef

  // Firestore genera un ID automáticamente
  const sectionRef = collection(
    db,
    'projects',
    project,
    'sections',
    section,
    'items'
  )
  docRef = await addDoc(sectionRef, data)

  const snap = await getDoc(docRef)
  return { id: docRef.id, ...snap.data() }
}

// Actualizar un ítem (por Firestore doc id)
export async function updateDataItem(
  project: string,
  section: string,
  id: string,
  updates: Record<string, any>
) {
  const docRef = doc(db, 'projects', project, 'sections', section, 'items', id)
  const existsSnap = await getDoc(docRef)
  if (!existsSnap.exists()) return null

  await updateDoc(docRef, updates)
  const snap = await getDoc(docRef)
  return { id: snap.id, ...snap.data() }
}

// Eliminar un ítem (por Firestore doc id)
export async function deleteDataItem(
  project: string,
  section: string,
  id: string
) {
  const docRef = doc(db, 'projects', project, 'sections', section, 'items', id)
  const existsSnap = await getDoc(docRef)
  if (!existsSnap.exists()) return false

  await deleteDoc(docRef)
  return true
}
