import { API_CONFIG } from '../../core/config/api.config.js';

/**
 * Obtiene la lista paginada de géneros de libro.
 */

export async function fetchBookGenres(page = 0, size = 10, search = '') {
  try {
    const params = new URLSearchParams({ page, size, nombre: search });
    
    // Recuperamos el token y limpiamos comillas extras por seguridad
    let token = localStorage.getItem('authToken');
    if (token) {
      token = token.replace(/^["']|["']$/g, '');
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENEROS_LIBRO_ADMIN}?${params.toString()}`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) throw new Error('Error al obtener los géneros de libro.');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchBookGenres:', error);
    throw error;
  }
}

/**
 * Obtiene un género de libro por su ID (detalles de auditoría).
 */
export async function fetchBookGenreById(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENEROS_LIBRO_ADMIN}/${id}/details`);
    if (!response.ok) throw new Error('Error al consultar el género de libro.');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchBookGenreById:', error);
    throw error;
  }
}

/**
 * Crea un nuevo género de libro (Nombre y Descripción).
 */
export async function createBookGenre(data) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENEROS_LIBRO_ADMIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo registrar el género de libro.');
    return await response.json();
  } catch (error) {
    console.error('Error en createBookGenre:', error);
    throw error;
  }
}

/**
 * Actualiza un género de libro existente (Nombre y Descripción).
 */
export async function updateBookGenre(id, data) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENEROS_LIBRO_ADMIN}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo actualizar el género de libro.');
    return await response.json();
  } catch (error) {
    console.error('Error en updateBookGenre:', error);
    throw error;
  }
}

/**
 * Elimina un género de libro por su ID.
 */
export async function deleteBookGenre(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENEROS_LIBRO_ADMIN}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('No se pudo eliminar el género de libro.');
    return true;
  } catch (error) {
    console.error('Error en deleteBookGenre:', error);
    throw error;
  }
}