import { API_CONFIG } from '../../core/config/api.config.js';

// Endpoint base fallback por si no existe aún en API_CONFIG
const ROLES_ENDPOINT = API_CONFIG.ENDPOINTS?.ROLES || '/api/v1/roles';
const ROLES_ADMIN_ENDPOINT = API_CONFIG.ENDPOINTS?.ROLES_ADMIN || ROLES_ENDPOINT;

/**
 * Obtiene la lista paginada de roles.
 */
export async function fetchRoles(page = 0, size = 10, search = '') {
  try {
    const params = new URLSearchParams({ page, size, name: search });
    const response = await fetch(`${API_CONFIG.BASE_URL}${ROLES_ENDPOINT}?${params.toString()}`);
    if (!response.ok) throw new Error('Error al obtener la lista de roles.');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchRoles:', error);
    throw error;
  }
}

/**
 * Obtiene un rol específico por su ID.
 */
export async function fetchRoleById(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ROLES_ADMIN_ENDPOINT}/${id}/details`);
    if (!response.ok) throw new Error('Error al obtener la información del rol.');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchRoleById:', error);
    throw error;
  }
}

/**
 * Crea un nuevo rol en el sistema.
 */
export async function createRole(data) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ROLES_ADMIN_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo registrar el nuevo rol.');
    return await response.json();
  } catch (error) {
    console.error('Error en createRole:', error);
    throw error;
  }
}

/**
 * Actualiza los datos de un rol existente.
 */
export async function updateRole(id, data) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ROLES_ADMIN_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo actualizar el rol.');
    return await response.json();
  } catch (error) {
    console.error('Error en updateRole:', error);
    throw error;
  }
}

/**
 * Elimina un rol por su ID.
 */
export async function deleteRole(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ROLES_ADMIN_ENDPOINT}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('No se pudo eliminar el rol.');
    return true;
  } catch (error) {
    console.error('Error en deleteRole:', error);
    throw error;
  }
}