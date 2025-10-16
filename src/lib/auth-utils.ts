// src/lib/auth-utils.ts

// ⚠️ CORRECCIÓN CLAVE 1: Accede a process.env DENTRO de la función.
// Next.js (y Node.js) solo carga variables de entorno en la carga inicial del módulo.
// Para asegurar que ADMIN_KEY está disponible, es más seguro obtenerlo en cada llamada
// si es una variable de entorno de 'runtime' que podría no estar disponible
// en el momento en que se define la constante global (fuera del handler).

/**
 * Verifica si la clave de administrador provista en el header es correcta.
 * Se espera que el cliente envíe la clave en el header 'X-Admin-Key'.
 */
export const isAuthenticated = (request: Request): boolean => {
  // 1. Obtener la clave esperada del entorno.
  // Usamos 'ADMIN_KEY' para consistencia con tu .env.local
  const expectedKey = process.env.ADMIN_SECRET_KEY

  // ⚠️ CORRECCIÓN CLAVE 2: Los headers son case-insensitive, pero request.headers.get()
  // los devuelve en minúsculas en el entorno de Next.js (Web Standard Request).
  const providedKey = request.headers.get('x-admin-key') // <--- USAR MINÚSCULAS

  // --- DEBUGGING ---
  console.log('--- AUTHENTICATION DEBUG START ---')
  console.log(
    `[AUTH-SERVER] Clave recibida (header): ${
      providedKey ? providedKey.substring(0, 8) + '...' : 'No enviada'
    }`
  )
  console.log(
    `[AUTH-SERVER] Clave esperada (env): ${
      expectedKey ? expectedKey.substring(0, 8) + '...' : 'NO DEFINIDA!'
    }`
  )

  if (!expectedKey) {
    console.error(
      '[AUTH-SERVER] FATAL: ADMIN_SECRET_KEY no está definida en el entorno del servidor.'
    )
    console.log('--- AUTHENTICATION DEBUG END ---')
    return false
  }
  // --- FIN DEBUGGING ---

  // 2. Realizar la comparación.
  const isValid = providedKey === expectedKey

  // --- DEBUGGING ---
  console.log(`[AUTH-SERVER] Clave válida: ${isValid}`)
  console.log('--- AUTHENTICATION DEBUG END ---')
  // --- FIN DEBUGGING ---

  return isValid
}

// // src/lib/auth-utils.ts

// // Obtén la clave secreta del entorno (ADMIN_SECRET_KEY de tu .env.local)
// const ADMIN_KEY = process.env.ADMIN_SECRET_KEY

// /**
//  * Verifica si la clave de administrador provista en el header es correcta.
//  * Se espera que el cliente envíe la clave en el header 'X-Admin-Key'.
//  */
// export const isAuthenticated = (request: Request): boolean => {
//   // Usamos el header X-Admin-Key para enviar la clave.
//   const providedKey = request.headers.get('X-Admin-Key')
//   // Verifica que la clave exista en el entorno y coincida.
//   return !!ADMIN_KEY && providedKey === ADMIN_KEY
// }
