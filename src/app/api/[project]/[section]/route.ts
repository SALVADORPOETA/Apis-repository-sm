// src/app/api/[project]/[section]/route.ts
import { NextResponse } from 'next/server'
import {
  getSectionData,
  getDataItem,
  createDataItem,
  updateDataItem,
  deleteDataItem,
} from '@/lib/firebase-utils' // <-- ahora apunta a firebase-utils

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY

const isAuthenticated = (request: Request): boolean => {
  const providedKey = request.headers.get('X-Admin-Key')
  return !!ADMIN_KEY && providedKey === ADMIN_KEY
}

type Params = Promise<{ project: string; section: string }>

// GET
export async function GET(request: Request, context: { params: Params }) {
  const params = await context.params
  const { project, section } = params

  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  try {
    let response

    if (id) {
      const item = await getDataItem(project, section, id)
      if (!item) {
        response = NextResponse.json(
          { message: `Item with id ${id} not found` },
          { status: 404 }
        )
      } else {
        response = NextResponse.json(item)
      }
    } else {
      const data = await getSectionData(project, section)
      response = NextResponse.json(data)
    }

    // 👉 Agregamos cabeceras CORS
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response
  } catch (error) {
    console.error(`API Error on GET ${project}/${section}:`, error)
    return NextResponse.json(
      { message: 'Server error processing request' },
      { status: 500 }
    )
  }
}

// Necesario para preflight (opcional pero recomendable)
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return res
}

// // GET
// export async function GET(request: Request, context: { params: Params }) {
//   const params = await context.params
//   const { project, section } = params

//   const url = new URL(request.url)
//   const id = url.searchParams.get('id')

//   try {
//     if (id) {
//       const item = await getDataItem(project, section, id)
//       if (!item) {
//         return NextResponse.json(
//           { message: `Item with id ${id} not found` },
//           { status: 404 }
//         )
//       }
//       return NextResponse.json(item)
//     } else {
//       const data = await getSectionData(project, section)
//       return NextResponse.json(data)
//     }
//   } catch (error) {
//     console.error(`API Error on GET ${project}/${section}:`, error)
//     return NextResponse.json(
//       { message: 'Server error processing request' },
//       { status: 500 }
//     )
//   }
// }

// POST
export async function POST(request: Request, context: { params: Params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid Admin Key' },
      { status: 401 }
    )
  }

  const params = await context.params
  const { project, section } = params

  try {
    const body = await request.json()
    const newItem = await createDataItem(project, section, body)
    return NextResponse.json(
      { message: `Item created in ${project}/${section}`, item: newItem },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { message: 'Error creating item' },
      { status: 500 }
    )
  }
}

// PATCH
export async function PATCH(request: Request, context: { params: Params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid Admin Key' },
      { status: 401 }
    )
  }

  const params = await context.params
  const { project, section } = params

  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { message: 'Missing ID parameter for update' },
      { status: 400 }
    )
  }

  try {
    const updates = await request.json()
    const updatedItem = await updateDataItem(project, section, id, updates)

    if (!updatedItem) {
      return NextResponse.json(
        { message: `Item with id ${id} not found to update` },
        { status: 404 }
      )
    }
    return NextResponse.json({
      message: `Item ${id} updated`,
      item: updatedItem,
    })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { message: 'Error updating item' },
      { status: 500 }
    )
  }
}

// DELETE
export async function DELETE(request: Request, context: { params: Params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid Admin Key' },
      { status: 401 }
    )
  }

  const params = await context.params
  const { project, section } = params

  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { message: 'Missing ID parameter for deletion' },
      { status: 400 }
    )
  }

  try {
    const deleted = await deleteDataItem(project, section, id)
    if (!deleted) {
      return NextResponse.json(
        { message: `Item with id ${id} not found to delete` },
        { status: 404 }
      )
    }
    return NextResponse.json({
      message: `Item with id ${id} deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { message: 'Error deleting item' },
      { status: 500 }
    )
  }
}
