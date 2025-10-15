// src/lib/schema-utils.ts

import * as fs from 'fs'
import * as path from 'path'
import { IField } from '@/components/ManageSectionClient' // Usamos la interfaz que ya definiste

// --------------------------------------------------------------------------
// NOTA: Este es un mockup simple. En producción, usarías una base de datos real.
// --------------------------------------------------------------------------

// Ruta donde se guardarán los archivos JSON de esquemas
const SCHEMAS_DIR = path.join(process.cwd(), 'schema-db')

// Asegura que el directorio exista
if (!fs.existsSync(SCHEMAS_DIR)) {
  fs.mkdirSync(SCHEMAS_DIR, { recursive: true })
}

/**
 * Genera el nombre de archivo basado en el proyecto y la sección.
 * Ejemplo: mayapan-home.json
 */
const getFilePath = (project: string, section: string): string => {
  return path.join(SCHEMAS_DIR, `${project}-${section}.json`)
}

/**
 * Lee el esquema guardado para una sección específica.
 */
export const getSchema = (
  project: string,
  section: string
): IField[] | null => {
  const filePath = getFilePath(project, section)
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent) as IField[]
  } catch (error) {
    // Si el archivo no existe o hay un error de lectura, significa que no hay esquema guardado.
    return null
  }
}

/**
 * Guarda y sobrescribe el esquema para una sección.
 */
export const updateSchema = (
  project: string,
  section: string,
  schema: IField[]
): IField[] => {
  const filePath = getFilePath(project, section)

  // Validaciones básicas de la estructura antes de guardar (opcional pero recomendado)
  if (!Array.isArray(schema) || schema.some((f) => !f.key || !f.type)) {
    throw new Error('Esquema inválido proporcionado.')
  }

  // Guardar el nuevo esquema
  fs.writeFileSync(filePath, JSON.stringify(schema, null, 2), 'utf-8')

  return schema
}
