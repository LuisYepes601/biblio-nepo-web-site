import { API_CONFIG } from '../../core/config/api.config.js';

const FORMATS_ADMIN_ENDPOINT = API_CONFIG.ENDPOINTS?.FORMATS_ADMIN || '/api/v1/formato-libros/admin';

/**
 * Obtiene la lista paginada de formatos de libros.
 */
export async function fetchFormats(page = 0, size = 10, search = '') {
const token = localStorage.getItem('authToken')?.replace(/^["']|["']$/g, '');
  if (!token) {
    throw new Error('No se encontró el token de autenticación.');
  }

  try {
    const params = new URLSearchParams({ page, size, nombre: search });
    const response = await fetch(`${API_CONFIG.BASE_URL}${FORMATS_ADMIN_ENDPOINT}?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al obtener la lista de formatos.');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchFormats:', error);
    throw error;
  }
}

/**
 * Obtiene la información detallada de un formato por su ID.
 */
export async function fetchFormatById(id) {
  const token = localStorage.getItem('authToken')?.replace(/^["']|["']$/g, '');
  if (!token) {
    throw new Error('No se encontró el token de autenticación.');
  }
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${FORMATS_ADMIN_ENDPOINT}/${id}/details`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al obtener el formato especificado.');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchFormatById:', error);
    throw error;
  }
}

/**
 * Crea un nuevo formato de libro.
 */
export async function createFormat(data) {
  const token = localStorage.getItem('authToken')?.replace(/^["']|["']$/g, '');
  if (!token) {
    throw new Error('No se encontró el token de autenticación.');
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${FORMATS_ADMIN_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo registrar el nuevo formato.');
    return await response.json();
  } catch (error) {
    console.error('Error en createFormat:', error);
    throw error;
  }
}

/**
 * Actualiza los datos de un formato existente.
 */
export async function updateFormat(id, data) {
  const token = localStorage.getItem('authToken')?.replace(/^["']|["']$/g, '');
  if (!token) {
    throw new Error('No se encontró el token de autenticación.');
  }
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${FORMATS_ADMIN_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo actualizar el formato.');
    return await response.json();
  } catch (error) {
    console.error('Error en updateFormat:', error);
    throw error;
  }
}

/**
 * Elimina un formato por su ID.
 */
export async function deleteFormat(id) {

  const token = localStorage.getItem('authToken')?.replace(/^["']|["']$/g, '');
  if (!token) {
    throw new Error('No se encontró el token de autenticación.');
  }
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${FORMATS_ADMIN_ENDPOINT}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No se pudo eliminar el formato.');
    return true;
  } catch (error) {
    console.error('Error en deleteFormat:', error);
    throw error;
  }
}