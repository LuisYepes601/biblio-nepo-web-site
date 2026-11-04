import { API_CONFIG } from '../../core/config/api.config.js';

function getAuthToken() {
  return localStorage.getItem('authToken')?.replace(/^["']|["']$/g, '');
}

/**
 * Genera el payload para el registro del préstamo (7 días exactos)
 */
export function buildPrestamoPayload(userId, bookId, diasPrestamo = 7) {
  const ahora = new Date();
  const fechaPrestamo = ahora.toISOString().split('T')[0];
  const hora_prestamo = ahora.toTimeString().split(' ')[0];

  const fechaVenc = new Date(ahora);
  fechaVenc.setDate(fechaVenc.getDate() + diasPrestamo);
  const fecha_venciimiento = fechaVenc.toISOString().split('T')[0];
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
    throw new Error(err.message || 'El libro ya se encuentra prestado o sin disponibilidad.');
  }

  return await response.json();
}

/**
 * Obtener lista paginada de préstamos del usuario: GET /api/v1/prestamos/{id_user}
 */
export async function fetchUserLoans(userId, page = 0, size = 20) {
  const token = getAuthToken();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/prestamos/${userId}?page=${page}&size=${size}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Error al obtener la lista de préstamos.');
  return await response.json();
}

/**
 * Registrar devolución
 */
export async function returnLoan(loanId) {
  const token = getAuthToken();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/prestamos/${loanId}/devolver`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Error al registrar la devolución del libro.');
  return await response.json();
}