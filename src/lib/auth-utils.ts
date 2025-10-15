// src/lib/auth-utils.ts

// Obtén la clave secreta del entorno (ADMIN_SECRET_KEY de tu .env.local)
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY

/**
 * Verifica si la clave de administrador provista en el header es correcta.
 * Se espera que el cliente envíe la clave en el header 'X-Admin-Key'.
 */
export const isAuthenticated = (request: Request): boolean => {
  // Usamos el header X-Admin-Key para enviar la clave.
  const providedKey = request.headers.get('X-Admin-Key')
  // Verifica que la clave exista en el entorno y coincida.
  return !!ADMIN_KEY && providedKey === ADMIN_KEY
}
