// src/app/api/schemas/[project]/[section]/route.ts

import { NextResponse } from 'next/server'
// ⚠️ CAMBIAR ESTA LÍNEA por las nuevas funciones:
import { getSectionSchema, setSectionSchema } from '@/lib/schema-utils-firebase'
import { isAuthenticated } from '@/lib/auth-utils'

type Params = { params: { project: string; section: string } } // Corregir el tipo para simplificar el await

// GET: Leer el esquema de la sección (PÚBLICO)
export async function GET(request: Request, { params }: Params) {
  const { project, section } = params

  try {
    // 🔹 AWAIT es necesario porque la función de Firebase es asíncrona
    const schemaData = await getSectionSchema(project, section)

    // Firestore devuelve { fields: [...] }, ajustamos la respuesta si es necesario
    // Si no existe, devolvemos un objeto vacío o null, según cómo lo maneje tu frontend
    return NextResponse.json(schemaData || { fields: [] })
  } catch (error) {
    console.error(`Error en GET del esquema:`, error)
    return NextResponse.json(
      { message: 'Server error fetching schema' },
      { status: 500 }
    )
  }
}

// POST: Actualizar el esquema de la sección (PRIVADO, requiere Auth)
export async function POST(request: Request, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid Admin Key' },
      { status: 401 }
    )
  }

  const { project, section } = params

  try {
    // newSchema es el array de campos (IField[]) que enviaste desde el frontend.
    const newFields = await request.json()

    console.log(
      '[SCHEMA-UPDATE] Intentando actualizar el esquema en Firebase...'
    )

    // 🔹 AWAIT es esencial. Llama a la nueva función de Firebase.
    const updatedSchema = await setSectionSchema(project, section, newFields)

    // Si setSectionSchema devuelve null, algo salió mal en Firebase
    if (!updatedSchema) {
      throw new Error('Firestore failed to save the schema.')
    }

    console.log('[SCHEMA-UPDATE] Esquema actualizado con éxito.')

    return NextResponse.json(updatedSchema) // Devolverá { fields: [...] }
  } catch (error) {
    console.error(
      '[SCHEMA-UPDATE] FALLO FATAL AL ESCRIBIR EN FIRESTORE:',
      error
    )

    // Devolvemos el 500 para notificar al cliente del fallo
    return NextResponse.json(
      { message: 'Error updating schema (Firebase write failure)' },
      { status: 500 }
    )
  }
}
