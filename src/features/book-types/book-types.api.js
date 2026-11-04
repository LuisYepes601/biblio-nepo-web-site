import { API_CONFIG } from '../../core/config/api.config.js';

function getAuthToken() {
  return localStorage.getItem('authToken')?.replace(/^["']|["']$/g, '');
}

/**
 * Obtener lista paginada y filtrada de tipos de libro
 */
export async function fetchBookTypes(page = 0, size = 10, nombre = '') {
  try {
    const token = getAuthToken();
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(nombre && { nombre })
    });

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/tipo-libros?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Error al obtener los tipos de libro');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchBookTypes:', error);
    throw error;
  }
}

/**
 * Obtener detalle de un tipo de libro por ID
 */
export async function fetchBookTypeById(id) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/tipo-libros/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Error al obtener detalle del tipo de libro');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchBookTypeById:', error);
    throw error;
  }
}

/**
 * Crear un nuevo tipo de libro
 */
export async function createBookType(data) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/tipo-libros/admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Error al crear el tipo de libro');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createBookType:', error);
    throw error;
  }
}

/**
 * Actualizar un tipo de libro existente
 */
export async function updateBookType(id, data) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/tipo-libros/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Error al actualizar el tipo de libro');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en updateBookType:', error);
    throw error;
  }
}

/**
 * Eliminar un tipo de libro por ID
 */
export async function deleteBookType(id) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/tipo-libros/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Error al eliminar el tipo de libro');
    }

    return true;
  } catch (error) {
    console.error('Error en deleteBookType:', error);
    throw error;
  }
}