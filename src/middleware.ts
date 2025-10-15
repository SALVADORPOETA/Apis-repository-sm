// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // const { pathname } = request.nextUrl
  // const cookie = request.cookies.get('admin-access') // 1. Si intenta acceder a cualquier ruta /admin/*

  // if (pathname.startsWith('/admin')) {
  //   // 2. Si no tiene la cookie o la cookie no es válida
  //   if (!cookie || cookie.value !== 'true') {
  //     // Redirige a /admin, pero solo si no está ya en la ruta base /admin
  //     // Esto ayuda a evitar un bucle de redireccionamiento si tu página /admin
  //     // es donde se muestra el AuthModal.
  //     if (pathname !== '/admin') {
  //       return NextResponse.redirect(new URL('/admin', request.url))
  //     }
  //   }
  // }

  return NextResponse.next()
}

// Indica a Next.js que se aplique a todas las rutas bajo /admin/*
export const config = {
  // matcher: ['/admin/:path*'],
  matcher: [],
}
