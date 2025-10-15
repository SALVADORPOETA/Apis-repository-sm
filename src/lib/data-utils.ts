// src/lib/data-utils.ts
import fs from 'fs'
import path from 'path'

// Definición de tipo base para la data (puedes expandirla por proyecto)
export interface IDataItem {
  id: number
  [key: string]: any // Permite propiedades adicionales
}

// Ruta base donde se encuentran todos los datos
// process.cwd() apunta a la raíz del proyecto (adminpanel-sm)
const dataDir = path.join(process.cwd(), 'data')

// -----------------------------------------------------
// 1. UTILIDADES BÁSICAS (LOAD / SAVE)
// -----------------------------------------------------

/**
 * Obtiene la ruta completa al archivo JSON específico.
 */
const getFilePath = (project: string, section: string): string => {
  // Ej: /ruta/absoluta/a/adminpanel-sm/data/mayapan/home.json
  return path.join(dataDir, project, `${section}.json`)
}

/**
 * Lee el contenido de un archivo JSON específico.
 * @returns {IDataItem[]} El array de objetos del JSON.
 */
const loadData = (project: string, section: string): IDataItem[] => {
  const filePath = getFilePath(project, section)
  try {
    const dataBuffer = fs.readFileSync(filePath, 'utf-8')
    // Usamos el tipo IDataItem[]
    return JSON.parse(dataBuffer) as IDataItem[]
  } catch (error) {
    // Si el archivo no existe o falla la lectura, devuelve un array vacío
    return []
  }
}

/**
 * Escribe el array de data en el archivo JSON.
 */
const saveData = (
  project: string,
  section: string,
  data: IDataItem[]
): void => {
  const filePath = getFilePath(project, section)

  // Asegura que la carpeta del proyecto exista antes de guardar
  const projectDir = path.join(dataDir, project)
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true })
  }

  const dataJSON = JSON.stringify(data, null, 2)
  fs.writeFileSync(filePath, dataJSON)
}

// -----------------------------------------------------
// 2. OPERACIONES CRUD
// -----------------------------------------------------

/**
 * READ (GET): Obtiene toda la data de una sección.
 */
export const getSectionData = (
  project: string,
  section: string
): IDataItem[] => {
  return loadData(project, section)
}

/**
 * READ (GET): Obtiene un único item por ID.
 */
export const getDataItem = (
  project: string,
  section: string,
  id: string | number
): IDataItem | undefined => {
  const data = loadData(project, section)
  const numericId = Number(id)
  return data.find((item) => item.id === numericId)
}

/**
 * CREATE (POST): Agrega un nuevo item.
 */
export const createDataItem = (
  project: string,
  section: string,
  newItem: Omit<IDataItem, 'id'>
): IDataItem => {
  const data = loadData(project, section)

  // Genera un nuevo ID (el mayor actual + 1)
  const newId =
    data.length > 0 ? Math.max(...data.map((item) => item.id)) + 1 : 1

  const createdItem: IDataItem = { ...newItem, id: newId }
  data.push(createdItem)
  saveData(project, section, data)

  return createdItem
}

/**
 * UPDATE (PATCH): Actualiza un item existente por ID.
 * @returns {IDataItem | null} El item actualizado o null si no se encuentra.
 */
export const updateDataItem = (
  project: string,
  section: string,
  id: string | number,
  updates: Partial<IDataItem>
): IDataItem | null => {
  let data = loadData(project, section)
  const numericId = Number(id)
  const index = data.findIndex((item) => item.id === numericId)

  if (index === -1) return null

  // Asegura que el ID no se pueda sobrescribir y aplica los cambios
  data[index] = { ...data[index], ...updates, id: numericId }

  saveData(project, section, data)
  return data[index]
}

/**
 * DELETE (DELETE): Elimina un item por ID.
 * @returns {boolean} True si se eliminó, false si no se encontró.
 */
export const deleteDataItem = (
  project: string,
  section: string,
  id: string | number
): boolean => {
  let data = loadData(project, section)
  const initialLength = data.length
  const numericId = Number(id)

  // Filtra la data excluyendo el item con el ID
  data = data.filter((item) => item.id !== numericId)

  if (data.length < initialLength) {
    saveData(project, section, data)
    return true
  }
  return false
}
