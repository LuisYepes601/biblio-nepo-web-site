import { API_CONFIG } from '../../core/config/api.config.js';

/**
 * Obtiene las cabeceras básicas con el Token de autenticación.
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Consulta la lista de libros con filtros y paginación.
 */
export async function fetchBooks(page = 0, size = 20, nombre = '', nombre_autor = '', id_idiom = '', id_autor = '') {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });

    if (nombre) params.append('nombre', nombre);
    if (nombre_autor) params.append('nombre_autor', nombre_autor);
    if (id_idiom) params.append('id_idiom', id_idiom);
    
    if (id_autor !== '' && id_autor !== null && id_autor !== undefined && id_autor !== 'undefined') {
      params.append('id_autor', String(id_autor));
    }

    const targetUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIBROS_ADMIN}?${params.toString()}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al obtener el catálogo de libros');
    return await response.json();
  } catch (error) {
    console.error("Error en fetchBooks:", error);
    return { content: [] };
  }
}

/**
 * Consulta los detalles de un libro por ID.
 */
export async function fetchBookDetails(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/libros/${id}/details`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) throw new Error('Error al obtener los detalles del libro');
    return await response.json();
  } catch (error) {
    console.error("Error en fetchBookDetails:", error);
    return null;
  }
}

/**
 * Crea un nuevo libro enviando FormData Multipart.
 * @param {FormData} formData - Objeto FormData con los blobs JSON y archivos (portada, libro, fotoAutor, etc.).
 * @param {string|number|null} idAutor - ID del autor existente (opcional).
 */
export async function createBook(formData, idAutor = null) {
  try {
    let targetUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIBROS_ADMIN}`;
    
    // Evita enviar 'undefined', 'null' o cadenas vacías como parámetro de URL
    if (idAutor !== null && idAutor !== undefined && idAutor !== '' && idAutor !== 'null' && idAutor !== 'undefined') {
      targetUrl += `?id_autor=${encodeURIComponent(idAutor)}`;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: getAuthHeaders(), // Conserva la cabecera 'Authorization: Bearer' sin fijar 'Content-Type'
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Captura respuestas de validación complejas de Spring Boot (message, errors o error)
      let errorMessage = errorData.message;
      if (Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.map(err => err.defaultMessage || err.message).join(', ');
      } else if (!errorMessage) {
        errorMessage = errorData.error || `Error ${response.status}`;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createBook:", error);
    throw error;
  }
}

/**
 * Consulta la lista de categorías.
 */
export async function fetchCategorias(pageNumber = 0, pageSize = 100) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIAS}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) throw new Error('Error al cargar categorías');
    return await response.json();
  } catch (error) {
    console.error("Error en fetchCategorias:", error);
    return { content: [] };
  }
}

/**
 * Consulta la lista de tipos de libro.
 */
export async function fetchTiposLibro(page = 0, size = 100) {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/v1/tipos-libro?page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) throw new Error('Error al consultar tipos de libro');
    return await response.json();
  } catch (error) {
    console.error("Error en fetchTiposLibro:", error);
    return { content: [] };
  }
}/**
 * Consulta la lista de formatos de libro.
 */
export async function fetchFormatosLibro(page = 0, size = 100) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORMATO_LIBROS}?page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) throw new Error('Error al consultar formatos de libro');
    return await response.json();
  } catch (error) {
    console.error("Error en fetchFormatosLibro:", error);
    return { content: [] };
  }
}