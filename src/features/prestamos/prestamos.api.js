import { API_CONFIG } from '../../core/config/api.config.js';

function getAuthToken() {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  return token.replace(/^["']|["']$/g, '');
}

/**
 * Genera el payload para el registro del préstamo (7 días exactos en hora local)
 */
export function buildPrestamoPayload(userId, bookId, diasPrestamo = 7) {
  const ahora = new Date();
  
  // Fecha en formato local YYYY-MM-DD (evita desfase UTC)
  const fechaPrestamo = ahora.toLocaleDateString('sv-SE');
  const hora_prestamo = ahora.toTimeString().split(' ')[0];

  const fechaVenc = new Date(ahora);
  fechaVenc.setDate(fechaVenc.getDate() + diasPrestamo);
  const fecha_venciimiento = fechaVenc.toLocaleDateString('sv-SE');
  const hora_vencimiento = hora_prestamo;

  return {
    id_user: Number(userId),
    id_libro: Number(bookId),
    fechaPrestamo,
    fecha_venciimiento,
    hora_prestamo,
    hora_vencimiento
  };
}

/**
 * Crear un préstamo
 */
export async function createLoan(bookId) {
  const userId = localStorage.getItem('userId') || 1;
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay una sesión activa. Por favor, vuelve a iniciar sesión.');
  }

  const payload = buildPrestamoPayload(userId, bookId, 7);

  const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/prestamos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 403) {
      throw new Error('No tienes permisos suficientes o el servidor denegó la solicitud (403).');
    }
    throw new Error(err.message || 'El libro ya se encuentra prestado o sin disponibilidad.');
  }

  return await response.json();
}

/**
 * Obtener lista paginada de préstamos del usuario: GET /api/v1/prestamos/{id_user}
 */
export async function fetchUserLoans(userId, page = 0, size = 20) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay una sesión activa.');
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/prestamos/${userId}?page=${page}&size=${size}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 403) {
    throw new Error('Error 403: Acceso denegado. Revisa los permisos del endpoint en Spring Security.');
  }

  if (response.status === 401) {
    throw new Error('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
  }

  if (!response.ok) {
    throw new Error('Error al obtener la lista de préstamos.');
  }

  return await response.json();
}

/**
 * Registrar la devolución de un préstamo
 * DELETE /api/v1/prestamos/{id_prestamo}
 */
export async function returnLoan(loanId) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay una sesión activa.');
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/prestamos/${loanId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 403) {
      throw new Error('No tienes permisos suficientes o el servidor denegó la devolución (403).');
    }
    throw new Error(err.message || 'Error al registrar la devolución del libro.');
  }

  return await response.json();
}