// src/app/api/schemas/[project]/[section]/route.ts
import { NextResponse } from 'next/server'
import { getSchema, updateSchema } from '@/lib/schema-utils'
import { isAuthenticated } from '@/lib/auth-utils'

type Params = Promise<{ project: string; section: string }>

// GET: Leer el esquema de la sección (PÚBLICO)
export async function GET(request: Request, context: { params: Params }) {
  // ✅ CORRECCIÓN: Await params antes de desestructurar
  const params = await context.params
  const { project, section } = params

  try {
    const schema = getSchema(project, section)
    return NextResponse.json(schema || [])
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// POST/PUT/PATCH: Actualizar el esquema de la sección (PRIVADO, requiere Auth)
export async function POST(request: Request, context: { params: Params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid Admin Key' },
      { status: 401 }
    )
  }

  // ✅ CORRECCIÓN: Await params antes de desestructurar
  const params = await context.params
  const { project, section } = params

  try {
    const newSchema = await request.json()
    const updatedSchema = updateSchema(project, section, newSchema)
    return NextResponse.json(updatedSchema)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating schema' },
      { status: 500 }
    )
  }
}
