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
export async function fetchPerfilDatosBasicos(userId) {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERFIL}/${userId}/datos-basicos`, {
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
}