import { API_CONFIG } from '../../core/config/api.config.js';

export async function fetchAuthors(page = 0, size = 10, name = '', nameBook = '') {
  try {
    const token = localStorage.getItem('token');
    let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTORES_ADMIN}?page=${page}&size=${size}`;
    
    if (name && name.trim() !== '') {
      url += `&name=${encodeURIComponent(name)}`;
    }
    if (nameBook && nameBook.trim() !== '') {
      url += `&name_boock=${encodeURIComponent(nameBook)}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': '*/*', 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`Error al obtener los autores: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error en fetchAuthors:', error);
    return { content: [], totalPages: 0 };
  }
}

export async function fetchAuthorDetails(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTORES_ADMIN}/${id}/details`, {
      method: 'GET',
      headers: { 'Accept': '*/*', 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Error al obtener detalles: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error en fetchAuthorDetails:', error);
    return null;
  }
}

export async function createAuthor(authorData, imageFile = null) {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    if (imageFile) {
      formData.append('imgAutor', imageFile);
    }

    formData.append('body', new Blob([JSON.stringify(authorData)], { type: 'application/json' }));

    const targetUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTORES_ADMIN}`;
    console.log("👉 URL evaluada para crear autor:", targetUrl); // Para validar que apunte a localhost:8080

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error al crear el autor: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error en createAuthor:', error);
    return false;
  }
}

export async function updateAuthor(id, authorData, imageFile = null) {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    // Adjuntar la imagen si el usuario seleccionó una nueva (Opcional)
    if (imageFile) {
      formData.append('imgAutor', imageFile);
    }

    // Adjuntar el DTO mapeado como 'body' en formato JSON con Blob
    formData.append('body', new Blob([JSON.stringify(authorData)], { type: 'application/json' }));

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTORES_ADMIN}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
        // IMPORTANTE: No incluyas 'Content-Type': 'application/json'. 
        // El navegador asigna automáticamente el 'multipart/form-data' con su respectivo boundary.
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar el autor: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error en updateAuthor:', error);
    return false;
  }
}

export async function fetchPaises() {
  try {
    const token = localStorage.getItem('token');
    // Verificamos si en API_CONFIG.ENDPOINTS existe PAISES, de lo contrario usamos la ruta estándar por defecto
    const endpointPais = API_CONFIG.ENDPOINTS.PAISES || '/api/v1/paises';
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpointPais}`, {
      method: 'GET',
      headers: { 'Accept': '*/*', 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Error al obtener países');
    const data = await response.json();
    
    // Aseguramos retornar siempre un arreglo plano de países
    return Array.isArray(data) ? data : (data.content || [{ id: 1, nombre: 'Colombia' }]);
  } catch (error) {
    console.error('Error en fetchPaises:', error);
    return [{ id: 1, nombre: 'Colombia' }];
  }
}