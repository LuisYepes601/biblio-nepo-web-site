import { API_CONFIG } from '../../core/config/api.config.js';

/**
 * Solicita el enlace de restauración de contraseña vía correo.
 * @param {string} email
 */
export async function requestPasswordReset(email) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECOVERY_PASSWORD}?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'No se pudo enviar el enlace de recuperación.');
    }

    return await response.json().catch(() => ({ success: true }));
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    throw error;
  }
}

/**
 * Consulta el nombre de usuario asociado a un documento y correo.
 * @param {string} documentNumber
 * @param {string} email
 */
export async function requestUsernameRecovery(documentNumber, email) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECOVER_USERNAME || '/auth/recover-username'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroDocumento: documentNumber, email })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Los datos proporcionados no coinciden con nuestros registros.');
    }

    return await response.json().catch(() => ({ success: true }));
  } catch (error) {
    console.error('Error en requestUsernameRecovery:', error);
    throw error;
  }
}