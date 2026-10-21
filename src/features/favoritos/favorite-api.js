import { API_CONFIG } from '../../core/config/api.config.js';

/**
 * Obtiene el ID del usuario activo buscando en claves simples y en objetos JSON guardados en storage.
 */
function getUserId() {
  // 1. Intentar buscar en claves directas
  const directId = localStorage.getItem('userId') || 
                   localStorage.getItem('id_user') || 
                   localStorage.getItem('id_usuario') || 
                   localStorage.getItem('id') ||
                   sessionStorage.getItem('userId') || 
                   sessionStorage.getItem('id_user');
  if (directId) return directId;

  // 2. Si se guarda como un objeto JSON (ej. 'user', 'usuario', 'currentUser')
  const possibleObjectKeys = ['user', 'usuario', 'currentUser', 'adminUser', 'userData', 'auth'];
  for (const key of possibleObjectKeys) {
    try {
      const rawData = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (rawData) {
        const parsed = JSON.parse(rawData);
        const foundId = parsed.id || parsed.id_user || parsed.id_usuario || parsed.userId || parsed.idUsuario;
        if (foundId) return foundId;
      }
    } catch (e) {
      // No es JSON válido, ignorar
    }
  }

  return 1; // Fallback por defecto
}

/**
 * Obtiene el token JWT buscando en claves simples y en objetos JSON estructurados.
 */
function getToken() {
  // 1. Intentar buscar en claves directas
  const directToken = localStorage.getItem('authToken') || 
                      localStorage.getItem('token') || 
                      localStorage.getItem('adminToken') || 
                      localStorage.getItem('jwt') || 
                      sessionStorage.getItem('authToken') || 
                      sessionStorage.getItem('token');
  if (directToken) return directToken;

  // 2. Buscar dentro de objetos de sesión guardados
  const possibleObjectKeys = ['user', 'usuario', 'currentUser', 'adminUser', 'userData', 'auth'];
  for (const key of possibleObjectKeys) {
    try {
      const rawData = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (rawData) {
        const parsed = JSON.parse(rawData);
        const foundToken = parsed.token || parsed.authToken || parsed.jwt || parsed.accessToken;
        if (foundToken) return foundToken;
      }
    } catch (e) {
      // Ignorar
    }
  }

  return null;
}

/**
 * Genera los encabezados HTTP comunes
 */
function getHeaders() {
  const token = getToken();
  return {
    'Accept': '*/*',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Obtiene la lista paginada de libros favoritos del usuario.
 * Endpoint: GET /api/v1/libros/favoritos?id_user={userId}&page={page}&size={size}
 */
export async function fetchUserFavorites(userId = null, page = 0, size = 20) {
  const targetUserId = userId || getUserId();
  const url = `${API_CONFIG.BASE_URL}/api/v1/libros/favoritos?id_user=${targetUserId}&page=${page}&size=${size}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (response.status === 404) {
      return { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, empty: true };
    }

    if (!response.ok) {
      throw new Error(`Error al obtener favoritos (Código HTTP: ${response.status})`);
    }

    const data = await response.json();

    return {
      content: Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []),
      pageNumber: data.pageNumber ?? 0,
      pageSize: data.pageSize ?? size,
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      empty: data.empty ?? true
    };
  } catch (error) {
    console.error('Error en fetchUserFavorites:', error);
    throw error;
  }
}

/**
 * Asigna un libro a la lista de favoritos del usuario.
 * Endpoint: PUT /api/v1/libros/asignar-favorito?id_libro={bookId}&id_usuario={userId}
 */
export async function addFavoriteApi(bookId, userId = null) {
  const targetUserId = userId || getUserId();
  const url = `${API_CONFIG.BASE_URL}/api/v1/libros/asignar-favorito?id_libro=${bookId}&id_usuario=${targetUserId}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error al asignar libro a favoritos (Código HTTP: ${response.status})`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return { success: true };
  } catch (error) {
    console.error('Error en addFavoriteApi:', error);
    throw error;
  }
}

/**
 * Elimina un libro de los favoritos del usuario.
 * Endpoint: DELETE /api/v1/libros/favorite?id_libro={bookId}&id_user={userId}
 */
export async function removeFavoriteApi(bookId, userId = null) {
  const targetUserId = userId || getUserId();
  const url = `${API_CONFIG.BASE_URL}/api/v1/libros/favorite?id_libro=${bookId}&id_user=${targetUserId}`;

  console.log(`[FAVORITES] Eliminando favorito -> Libro: ${bookId}, Usuario: ${targetUserId}`);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al eliminar favorito (Código HTTP: ${response.status}) - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error en removeFavoriteApi:', error);
    throw error;
  }
}