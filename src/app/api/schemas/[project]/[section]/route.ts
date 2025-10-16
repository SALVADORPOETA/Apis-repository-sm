import { NextResponse, NextRequest } from 'next/server'
import { getSectionSchema, setSectionSchema } from '@/lib/schema-utils-firebase'
import { isAuthenticated } from '@/lib/auth-utils'
import { DocumentData } from 'firebase/firestore'

// ✅ Firma de compilación correcta
type Params = Promise<{ project: string; section: string }>

// Tipos unificados para la respuesta
type SchemaResponse = { fields: any[] } | { message: string }

// GET: Leer el esquema de la sección (PÚBLICO)
export async function GET(
  request: Request,
  context: { params: Params }
): Promise<NextResponse<SchemaResponse>> {
  // Usamos el tipo corregido

  const params = await context.params
  const { project, section } = params

  try {
    const schemaData = await getSectionSchema(project, section)

    // ✅ CORRECCIÓN GET: Devolvemos el objeto { fields: ... } para coincidir con la firma.
    const fields = schemaData && schemaData.fields ? schemaData.fields : []

    return NextResponse.json({ fields: fields })
  } catch (error) {
    console.error(`Error en GET del esquema:`, error)
    return NextResponse.json(
      { message: 'Server error fetching schema' },
      { status: 500 }
    )
  }
}

// POST: Actualizar el esquema de la sección (PRIVADO, requiere Auth)
export async function POST(
  request: Request,
  context: { params: Params }
): Promise<NextResponse<SchemaResponse>> {
  // Usamos el tipo corregido

  // 1. AUTENTICACIÓN
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid Admin Key' },
      { status: 401 }
    )
  }

  // 2. DESESTRUCTURACIÓN DE PARÁMETROS
  const params = await context.params
  const { project, section } = params

  try {
    const newFields = await request.json()

    console.log(
      '[SCHEMA-UPDATE] Intentando actualizar el esquema en Firebase...'
    )

    const updatedSchema = await setSectionSchema(project, section, newFields)

    if (!updatedSchema) {
      throw new Error('Firestore failed to save the schema.')
    }

    console.log('[SCHEMA-UPDATE] Esquema actualizado con éxito.')

    // ✅ CORRECCIÓN POST: Devolvemos el objeto { fields: ... } para coincidir con la firma.
    return NextResponse.json({ fields: updatedSchema.fields })
  } catch (error) {
    // 6. MANEJO DE ERRORES
    console.error(
      '[SCHEMA-UPDATE] FALLO FATAL AL ESCRIBIR EN FIRESTORE:',
      error
    )

    return NextResponse.json(
      { message: 'Error updating schema (Firebase write failure)' },
      { status: 500 }
    )
  }
}
