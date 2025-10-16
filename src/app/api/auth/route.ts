// src/app/api/auth/route.ts (Modificado)
import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth-utils'

const SESSION_DURATION_SECONDS = 1 // 5 minutos de sesión

export async function POST(request: Request) {
  if (isAuthenticated(request)) {
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
    }) // Establecer cookie HttpOnly con duración limitada

    response.cookies.set({
      name: 'admin-access',
      value: 'true',
      path: '/admin', // <--- Aplica solo a /admin y sus subrutas
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: SESSION_DURATION_SECONDS, // ¡La cookie expira después de este tiempo!
    })

    return response
  }

  return NextResponse.json(
    { success: false, message: 'Unauthorized: Invalid Admin Key' },
    { status: 401 }
  )
}
