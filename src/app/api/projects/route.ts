import { NextResponse } from 'next/server'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/projects-utils-firebase'
import { IProject } from '@/lib/project-utils'

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY

const isAuthenticated = (request: Request): boolean => {
  const providedKey = request.headers.get('X-Admin-Key')
  return !!ADMIN_KEY && providedKey === ADMIN_KEY
}

// GET
export async function GET() {
  try {
    const projects = await getProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error on GET /api/projects:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// POST
export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: IProject = await request.json()
    const newProject = await createProject(body)
    return NextResponse.json(
      { message: `Project ${newProject.name} created`, project: newProject },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

// PATCH
export async function PATCH(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const key = url.searchParams.get('key')
  if (!key) {
    return NextResponse.json(
      { message: 'Missing project key' },
      { status: 400 }
    )
  }

  try {
    const updates = await request.json()
    const updated = await updateProject(key, updates)
    if (!updated) {
      return NextResponse.json(
        { message: `Project ${key} not found` },
        { status: 404 }
      )
    }
    return NextResponse.json({
      message: `Project ${key} updated`,
      project: updated,
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating project' },
      { status: 500 }
    )
  }
}

// DELETE
export async function DELETE(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const key = url.searchParams.get('key')
  if (!key) {
    return NextResponse.json(
      { message: 'Missing project key' },
      { status: 400 }
    )
  }

  try {
    const deleted = await deleteProject(key)
    if (!deleted) {
      return NextResponse.json(
        { message: `Project ${key} not found` },
        { status: 404 }
      )
    }
    return NextResponse.json({
      message: `Project ${key} deleted successfully`,
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error deleting project' },
      { status: 500 }
    )
  }
}
