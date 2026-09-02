import { API_CONFIG } from '../../core/config/api.config.js';

export async function fetchCategorias({ page = 0, size = 20 } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('size', size);

  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIAS_LIBROS}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener categorías: ${response.status}`);
  }

  return response.json();
}

export async function fetchIdiomas({ page = 0, size = 150 } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('size', size);

  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IDIOMAS}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener idiomas: ${response.status}`);
  }

  return response.json();
}

export async function fetchTiposLibro({ page = 0, size = 50 } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('size', size);

  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TIPO_LIBROS}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener tipos de libro: ${response.status}`);
  }

  return response.json();
}

export async function fetchGeneros({ page = 0, size = 50 } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('size', size);

  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENEROS_LIBROS}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener géneros: ${response.status}`);
  }

  return response.json();
}

export async function fetchLibros({ id_cat, nombre, nombre_autor, id_idiom, id_tipo_libro, id_genero, page = 0, size = 20 } = {}) {
  const params = new URLSearchParams();
  
  if (id_cat !== undefined && id_cat !== null && id_cat !== '') params.set('id_cat', id_cat);
  if (nombre) params.set('nombre', nombre);
  if (nombre_autor) params.set('nombre_autor', nombre_autor);
  if (id_idiom !== undefined && id_idiom !== null && id_idiom !== '') params.set('id_idiom', id_idiom);
  if (id_tipo_libro !== undefined && id_tipo_libro !== null && id_tipo_libro !== '') params.set('id_tipo_libro', id_tipo_libro);
  if (id_genero !== undefined && id_genero !== null && id_genero !== '') params.set('id_genero', id_genero);
  
  params.set('page', page);
  params.set('size', size);

  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIBROS_ADMIN}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener libros: ${response.status}`);
  }

  return response.json();
}

export async function fetchLibroDetalles(id) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/libros/${id}/details`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener detalles del libro: ${response.status}`);
  }

  const data = await response.json();

  if (data) {
    const urlArchivo = data.archivoUrl || data.url || data.archivo || data.fileUrl || data.enlace;
    if (urlArchivo && urlArchivo.includes('res.cloudinary.com')) {
      console.log('Enlace de Cloudinary detectado en API:', urlArchivo);
    }
  }

  return data;
}

/**
 * Función de servicio pura para obtener los libros recomendados por autor
 * (excluyendo el libro actual que se está viendo).
 */
export async function fetchLibrosRecomendados(autorNombre, currentBookId, limit = 5) {
  if (!autorNombre) return [];

  try {
    const data = await fetchLibros({ 
      nombre_autor: autorNombre, 
      page: 0, 
      size: 10 
    });

    const allBooks = Array.isArray(data) ? data : (data.content || []);

    return allBooks
      .filter(b => String(b.id) !== String(currentBookId))
      .slice(0, limit);

  } catch (err) {
    console.warn('Error al obtener libros recomendados en la API:', err);
    return [];
  }
}