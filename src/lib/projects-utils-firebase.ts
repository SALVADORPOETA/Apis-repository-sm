// src/lib/projects-utils-firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { IProject } from './project-utils'

// --------------------------------------------------------------------------
//  Inicializar Firebase (usa tus credenciales del .env.local)
// --------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

const db = getFirestore()
const projectsRef = collection(db, 'projects')

// --------------------------------------------------------------------------
// READ: obtener todos los proyectos
// --------------------------------------------------------------------------
export const getProjects = async (): Promise<IProject[]> => {
  const snapshot = await getDocs(projectsRef)
  return snapshot.docs.map((doc) => doc.data() as IProject)
}

// --------------------------------------------------------------------------
// READ: obtener un proyecto por clave
// --------------------------------------------------------------------------
// export const getProjectByKey = async (
//   key: string
// ): Promise<IProject | null> => {
//   const ref = doc(projectsRef, key)
//   const snapshot = await getDoc(ref)
//   return snapshot.exists() ? (snapshot.data() as IProject) : null
// }

export const getProjectByKey = async (
  key: string
): Promise<IProject | null> => {
  const ref = doc(projectsRef, key)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return null

  const data = snapshot.data() as IProject
  return data // ya incluye key
}

// --------------------------------------------------------------------------
// CREATE: crear un nuevo proyecto
// --------------------------------------------------------------------------
export const createProject = async (
  newProject: IProject
): Promise<IProject> => {
  const key = newProject.key.toLowerCase().replace(/[^a-z0-9_]/g, '')
  const ref = doc(projectsRef, key)
  const snapshot = await getDoc(ref)

  if (snapshot.exists()) {
    throw new Error(`Project key "${key}" already exists.`)
  }

  const project: IProject = {
    key,
    name: newProject.name,
    sections: newProject.sections.map((s) =>
      s.toLowerCase().replace(/[^a-z0-9_]/g, '')
    ),
  }

  await setDoc(ref, project)
  return project
}

// --------------------------------------------------------------------------
// UPDATE: actualizar un proyecto existente
// --------------------------------------------------------------------------
export const updateProject = async (
  key: string,
  updates: Partial<IProject>
): Promise<IProject | null> => {
  const ref = doc(projectsRef, key)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return null

  if (updates.sections) {
    updates.sections = updates.sections.map((s) =>
      s.toLowerCase().replace(/[^a-z0-9_]/g, '')
    )
  }

  await updateDoc(ref, updates)
  const updated = await getDoc(ref)
  return updated.data() as IProject
}

// --------------------------------------------------------------------------
// DELETE: eliminar un proyecto
// --------------------------------------------------------------------------
export const deleteProject = async (key: string): Promise<boolean> => {
  const ref = doc(projectsRef, key)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return false

  await deleteDoc(ref)
  return true
}
