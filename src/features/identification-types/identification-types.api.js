import { API_CONFIG } from '../../core/config/api.config.js';

/**
 * Obtiene la lista paginada de tipos de identificación.
 */
export async function fetchIdentificationTypes(page = 0, size = 10, search = '') {
  try {
    const params = new URLSearchParams({ page, size, nombre: search });
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TIPO_IDENTIFICACIONES}?${params.toString()}`);
    if (!response.ok) throw new Error('Error al obtener los tipos de identificación.');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchIdentificationTypes:', error);
    throw error;
  }
}

/**
 * Obtiene un tipo de identificación por su ID (detalles de auditoría).
 */
export async function fetchIdentificationTypeById(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TIPO_IDENTIFICACIONES}/${id}/details`);
    if (!response.ok) throw new Error('Error al consultar el tipo de identificación.');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchIdentificationTypeById:', error);
    throw error;
  }
}

/**
 * Crea un nuevo tipo de identificación (Nombre y Descripción).
 */
export async function createIdentificationType(data) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TIPO_IDENTIFICACIONES}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo registrar el tipo de identificación.');
    return await response.json();
  } catch (error) {
    console.error('Error en createIdentificationType:', error);
    throw error;
  }
}

/**
 * Actualiza un tipo de identificación existente (Nombre y Descripción).
 */
export async function updateIdentificationType(id, data) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TIPO_IDENTIFICACIONES}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo actualizar el tipo de identificación.');
    return await response.json();
  } catch (error) {
    console.error('Error en updateIdentificationType:', error);
    throw error;
  }
}

/**
 * Elimina un tipo de identificación por su ID.
 */
export async function deleteIdentificationType(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TIPO_IDENTIFICACIONES}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('No se pudo eliminar el tipo de identificación.');
    return true;
  } catch (error) {
    console.error('Error en deleteIdentificationType:', error);
    throw error;
  }
}