import { API_CONFIG } from '../../core/config/api.config.js';

/**
 * Obtiene la lista paginada de categorías.
 */
export async function fetchCategorias(page = 0, size = 10, nombre = '') {
  try {
    const params = new URLSearchParams({ page, size, nombre });
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIAS_LIBROS}?${params.toString()}`);
    if (!response.ok) throw new Error('Error al obtener las categorías.');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchCategorias:', error);
    throw error;
  }
}

/**
 * Obtiene una categoría por su ID.
 */
export async function fetchCategoriaById(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIAS_LIBROS}/${id}`);
    if (!response.ok) throw new Error('Error al obtener la categoría.');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchCategoriaById:', error);
    throw error;
  }
}

/**
 * Crea una nueva categoría.
 */
export async function createCategoria(data) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIAS_LIBROS_ADMIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo crear la categoría.');
    return await response.json();
  } catch (error) {
    console.error('Error en createCategoria:', error);
    throw error;
  }
}

/**
 * Actualiza una categoría existente.
 */
export async function updateCategoria(id, data) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIAS_LIBROS_ADMIN}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo actualizar la categoría.');
    return await response.json();
  } catch (error) {
    console.error('Error en updateCategoria:', error);
    throw error;
  }
}

/**
 * Elimina una categoría por ID.
 */
export async function deleteCategoria(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIAS_LIBROS_ADMIN}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('No se pudo eliminar la categoría.');
    return true;
  } catch (error) {
    console.error('Error en deleteCategoria:', error);
    throw error;
  }
}