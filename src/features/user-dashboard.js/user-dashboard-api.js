import { API_CONFIG } from '../../core/config/api.config.js';

/**
 * Actualiza la foto de perfil de un usuario en el servidor usando FormData.
 * @param {string|number} userId - ID del usuario.
 * @param {File} imageFile - Archivo de imagen seleccionado.
 */
export async function updateProfilePhoto(userId, imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERFIL}/${userId}/foto-perfil`, {
    method: 'PUT',
    headers: {
      // 'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Error al actualizar la foto de perfil');
  }

  return await response.json();
}

/**
 * Obtiene los datos básicos de un perfil de usuario.
 * @param {string|number} userId - ID del usuario.
 * @returns {Promise<Object>} Objeto con la información básica del perfil.
 */
export async function fetchPerfilDatosBasicos(id_user) {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERFIL}/${id_user}/datos-basicos`, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
      // 'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener los datos básicos del perfil');
  }

  return await response.json();
}/**
 * Actualiza los datos de un usuario por su ID
 * @param {number|string} id_user - ID del usuario a actualizar
 * @param {Object} userData - Objeto con los campos a actualizar (nombre, email, etc.)
 */
export async function updateUser(id_user, userData) {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USUARIOS}/${id_user}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Si tu API requiere token de autenticación, descomenta la siguiente línea:
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error al actualizar el usuario (Código: ${response.status})`);
        }

        // Si el backend retorna datos en formato JSON tras actualizar
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error en updateUser:', error);
        throw error;
    }
}