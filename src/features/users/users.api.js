import { API_CONFIG } from '../../core/config/api.config.js';

/**
 * Obtiene el listado de usuarios aplicando los filtros recibidos.
 * @param {Object} filters - Objeto con filtros (nombre, primer_apellido, email, num_identificacion, id_rol, isDelete)
 */
export async function getAllUsers(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.nombre) params.append('nombre', filters.nombre);
    if (filters.primer_apellido) params.append('primer_apellido', filters.primer_apellido);
    if (filters.email) params.append('email', filters.email);
    if (filters.num_identificacion) params.append('num_identificacion', filters.num_identificacion);
    if (filters.id_rol !== undefined && filters.id_rol !== '' && filters.id_rol !== null) {
      params.append('id_rol', filters.id_rol);
    }
    if (filters.isDelete !== undefined && filters.isDelete !== '' && filters.isDelete !== null) {
      params.append('isDelete', filters.isDelete);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS_ADMIN || '/usuarios'}${queryString}`;

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Error al obtener la lista de usuarios');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || data.content || []);
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    throw error;
  }
}

export async function getUserById(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS_ADMIN || '/usuarios'}/${id}`);
    if (!response.ok) throw new Error(`Error al obtener el usuario con ID ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error en getUserById (${id}):`, error);
    throw error;
  }
}

/**
 * Registra un usuario enviando FormData con las partes "body" e "imgPerfil".
 */
export async function createUser(formData) {
  try {
    const endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER || '/api/v1/register'}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ DETALLES DE VALIDACIÓN DEL BACKEND:', errorData);
      let errorMsg = errorData.message || errorData.error || 'Los datos enviados no son válidos';
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createUser:', error);
    throw error;
  }
}

/**
 * Actualiza los datos básicos de un usuario por ID (PUT)
 */
export async function updateUser(id_user, userData) {
  try {
    const isFormData = userData instanceof FormData;
    const endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USUARIOS}/${id_user}`;

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? userData : JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar el usuario');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en updateUser (${id}):`, error);
    throw error;
  }
}

export async function deleteUser(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS_ADMIN || '/usuarios'}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al eliminar el usuario');
    }

    return true;
  } catch (error) {
    console.error(`Error en deleteUser (${id}):`, error);
    throw error;
  }
}

export async function getUserDetails(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/users/admin/${id}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('No se pudo obtener el detalle del usuario.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getUserDetails:', error);
    throw error;
  }
}