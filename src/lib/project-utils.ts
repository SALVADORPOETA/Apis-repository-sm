import * as fs from 'fs'
import * as path from 'path'

// Definición de tipos
export interface IProject {
  key: string // Clave única y URL amigable (ej: 'mayapan')
  name: string // Nombre legible (ej: 'Proyecto Mayapan')
  sections: string[] // Array de claves de sección (ej: ['home', 'history', 'cities'])
}

// Ruta al archivo JSON central que almacenará todos los proyectos
const PROJECTS_FILE_PATH = path.join(process.cwd(), 'data', 'projects.json')

// ------------------------------------------------------------------------
// LECTURA (READ)
// ------------------------------------------------------------------------

/**
 * Lee el archivo JSON y devuelve la lista de todos los proyectos.
 * Si el archivo no existe, devuelve un array vacío.
 */
export const getProjects = (): IProject[] => {
  try {
    const data = fs.readFileSync(PROJECTS_FILE_PATH, 'utf-8')
    return JSON.parse(data) as IProject[]
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      // Si el archivo no existe, crea el directorio y devuelve un array vacío
      const dir = path.dirname(PROJECTS_FILE_PATH)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      return []
    }
    console.error('Error reading projects file:', error)
    return []
  }
}

/**
 * Encuentra un proyecto por su clave única (key).
 */
export const getProjectByKey = (projectKey: string): IProject | undefined => {
  const projects = getProjects()
  return projects.find((p) => p.key === projectKey)
}

// ------------------------------------------------------------------------
// ESCRITURA (WRITE) - Funciión interna
// ------------------------------------------------------------------------

/**
 * Escribe la lista completa de proyectos de vuelta al archivo.
 */
const saveProjects = (projects: IProject[]): void => {
  try {
    fs.writeFileSync(
      PROJECTS_FILE_PATH,
      JSON.stringify(projects, null, 2),
      'utf-8'
    )
  } catch (error) {
    console.error('Error writing projects file:', error)
    throw new Error('Failed to save projects to file system.')
  }
}

// ------------------------------------------------------------------------
// CREACIÓN (CREATE)
// ------------------------------------------------------------------------

/**
 * Crea un nuevo proyecto.
 * @param newProjectData Datos del nuevo proyecto (key, name, sections)
 */
export const createProject = (
  newProjectData: Omit<IProject, 'key'> & { key: string }
): IProject => {
  let projects = getProjects()

  // 1. Validar unicidad de la clave
  const projectKey = newProjectData.key.toLowerCase().replace(/[^a-z0-9_]/g, '')
  if (projects.some((p) => p.key === projectKey)) {
    throw new Error(`Project key "${projectKey}" already exists.`)
  }

  // 2. Crear y añadir el nuevo proyecto
  const newProject: IProject = {
    key: projectKey,
    name: newProjectData.name,
    sections: newProjectData.sections.map((s) =>
      s.toLowerCase().replace(/[^a-z0-9_]/g, '')
    ), // Sanitizar secciones
  }

  projects.push(newProject)
  saveProjects(projects)
  return newProject
}

// ------------------------------------------------------------------------
// ACTUALIZACIÓN (UPDATE)
// ------------------------------------------------------------------------

/**
 * Actualiza un proyecto existente.
 * @param projectKey Clave del proyecto a actualizar
 * @param updates Los campos a actualizar (puede incluir name y sections)
 */
export const updateProject = (
  projectKey: string,
  updates: Partial<IProject>
): IProject | null => {
  let projects = getProjects()
  const index = projects.findIndex((p) => p.key === projectKey)

  if (index === -1) {
    return null // Proyecto no encontrado
  }

  // Sanitizar y mapear secciones si se proporcionan
  if (updates.sections) {
    updates.sections = updates.sections.map((s) =>
      s.toLowerCase().replace(/[^a-z0-9_]/g, '')
    )
  }

  // Aplicar las actualizaciones
  const updatedProject = {
    ...projects[index],
    ...updates,
  }

  // Asegurar que la clave no se pueda cambiar (o si se intenta cambiar, no se usa)
  updatedProject.key = projectKey

  projects[index] = updatedProject
  saveProjects(projects)
  return updatedProject
}

// ------------------------------------------------------------------------
// ELIMINACIÓN (DELETE)
// ------------------------------------------------------------------------

/**
 * Elimina un proyecto por su clave.
 * @returns true si fue eliminado, false si no fue encontrado.
 */
export const deleteProject = (projectKey: string): boolean => {
  let projects = getProjects()
  const initialLength = projects.length

  projects = projects.filter((p) => p.key !== projectKey)

  if (projects.length === initialLength) {
    return false // No se encontró el proyecto
  }

  saveProjects(projects)
  return true
}
