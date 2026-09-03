import { fetchBooks, createBook, fetchBookDetails, fetchFormatosLibro } from './books.api.js';
import { fetchIdiomas, fetchCategorias, fetchGeneros, fetchTiposLibro } from '../catalog/catalog.api.js';
import { fetchAuthors } from '../autors/authors.api.js';

let currentPage = 0;
let currentSearchNombre = '';
let currentSearchAutor = '';
let currentSearchIdioma = '';
let currentLimit = getDefaultLimit();
// Variable para guardar la lista de libros y extraer el título/autor después
let currentBooksList = [];

function getDefaultLimit() {
  const width = window.innerWidth;
  if (width < 768) return 8;
  if (width < 1024) return 12;
  return 20;
}

export async function loadBooksView() {
  const container = document.getElementById('admin-content-container');
  if (!container) return;

  currentPage = 0;
  currentSearchNombre = '';
  currentSearchAutor = '';
  currentSearchIdioma = '';
  currentLimit = getDefaultLimit();

  container.innerHTML = `
    <div class="view-header">
      <h1>Catálogo de Libros</h1>
      <p>Administra los ejemplares, inventario y registros bibliotecarios.</p>
    </div>

    <section class="authors-module-container">
      <div class="authors-header">
        <div>
          <h3>Inventario de Libros</h3>
          <p>Control de títulos, autores asociados, stock y estado.</p>
        </div>
        <button class="btn-primary" id="btnNewBook">
          <i class="fa-solid fa-book-medical"></i> Nuevo Libro
        </button>
      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <div class="authors-search-bars" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
        <input type="text" id="searchBookTitle" placeholder="Buscar por título..." 
               style="flex: 1; min-width: 180px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0); outline: none; font-size: 0.875rem;">
        
        <input type="text" id="searchBookAuthor" placeholder="Buscar por autor..." 
               style="flex: 1; min-width: 180px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0); outline: none; font-size: 0.875rem;">

        <!-- Selector de Idioma Dinámico -->
        <select id="searchBookIdioma" style="min-width: 160px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0); outline: none; font-size: 0.875rem; background: white; cursor: pointer;">
          <option value="">Todos los idiomas</option>
        </select>

        <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
          <label for="limitSelector" style="font-size: 0.85rem; color: #475569; font-weight: 500;">Mostrar:</label>
          <select id="limitSelector" style="border: none; outline: none; background: transparent; font-size: 0.85rem; font-weight: 600; color: #1e293b; cursor: pointer;">
            <option value="8" ${currentLimit === 8 ? 'selected' : ''}>8</option>
            <option value="12" ${currentLimit === 12 ? 'selected' : ''}>12</option>
            <option value="20" ${currentLimit === 20 ? 'selected' : ''}>20</option>
          </select>
        </div>
      </div>

      <div class="authors-grid" id="booksGrid">
        <p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Cargando libros...</p>
      </div>

      <div id="booksPagination"></div>
    </section>

    <!-- Modal General para Libros -->
    <div id="bookModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 28px; border-radius: 16px; width: 100%; max-width: 640px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 id="bookModalTitle" style="margin: 0; font-size: 1.25rem;">Nuevo Libro</h3>
          <button id="closeBookModalBtn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="bookModalBody"></div>
      </div>
    </div>
  `;

  await populateLanguageFilter();
  initBookListeners();
  await loadAndRenderBooks(currentSearchNombre, currentSearchAutor, currentSearchIdioma, 0, currentLimit);
}

async function populateLanguageFilter() {
  try {
    const langRes = await fetchIdiomas();
    const languages = langRes.content || langRes || [];
    const selectFilter = document.getElementById('searchBookIdioma');

    if (selectFilter && Array.isArray(languages)) {
      languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.id;
        option.textContent = lang.nombre || lang.idioma;
        selectFilter.appendChild(option);
      });
    }
  } catch (e) {
    console.error("No se pudieron cargar los idiomas para el filtro", e);
  }
}

async function loadAndRenderBooks(nombre = '', nombre_autor = '', id_idioma = '', page = 0, size = currentLimit) {
  currentSearchNombre = nombre;
  currentSearchAutor = nombre_autor;
  currentSearchIdioma = id_idioma;
  currentPage = page;
  currentLimit = size;

  const response = await fetchBooks(page, size, nombre, nombre_autor, id_idioma);
  currentBooksList = response.content || []; // Guardamos la lista en memoria
  renderBooks(currentBooksList);
  renderPagination(response);
}

function renderBooks(books) {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  if (!books || books.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">No se encontraron libros registrados.</p>`;
    return;
  }

  grid.innerHTML = books.map(book => `
    <div class="author-card book-card-item" data-id="${book.id}" style="cursor: pointer; transition: transform 0.2s ease;">
      <div class="author-card-top">
        <img src="${book.portadaUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&h=100&fit=crop'}" alt="${book.titulo}" class="author-avatar" style="border-radius: 8px;">
      </div>
      <div class="author-info">
        <h4>${book.titulo}</h4>
        <p><i class="fa-solid fa-feather" style="margin-right: 4px; color: #6366f1;"></i> ${book.autor || 'Autor desconocido'}</p>
        <p><i class="fa-solid fa-barcode" style="margin-right: 4px;"></i> ISBN: ${book.isbn || 'N/A'}</p>
        <p style="font-size: 0.75rem; color: #64748b; margin-top: 4px;"><i class="fa-solid fa-building" style="margin-right: 4px;"></i> ${book.editorial || 'Editorial N/D'} • <span style="font-weight: 600; color: #4f46e5;">${book.formatoLibro || 'Estándar'}</span></p>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.book-card-item').forEach(card => {
    card.addEventListener('click', () => {
      const bookId = card.getAttribute('data-id');
      openBookDetailsView(bookId);
    });
  });
}

async function openBookDetailsView(bookId) {
  const container = document.getElementById('admin-content-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
      <button id="backToBooksBtn" style="padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.9rem;">
        <i class="fa-solid fa-arrow-left"></i> Volver al Catálogo
      </button>
      <h2 style="margin: 0; font-size: 1.5rem;">Detalles del Libro</h2>
    </div>
    <div style="text-align: center; padding: 40px; color: #64748b;">Cargando información del libro...</div>
  `;

  document.getElementById('backToBooksBtn').addEventListener('click', loadBooksView);

  const details = await fetchBookDetails(bookId);

  if (!details) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <button id="backToBooksBtn" style="padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.9rem;">
          <i class="fa-solid fa-arrow-left"></i> Volver
        </button>
      </div>
      <p style="text-align: center; color: #ef4444; padding: 40px;">No se pudieron cargar los detalles de este libro.</p>
    `;
    document.getElementById('backToBooksBtn').addEventListener('click', loadBooksView);
    return;
  }

  // MAGIA: Buscar info básica en la memoria y fusionarla con los detalles de la API
  const basicInfo = currentBooksList.find(b => String(b.id) === String(bookId)) || {};
  const book = { ...basicInfo, ...details };

  // Usamos 'book' (que ahora tiene título y autor) para mostrar los datos
  const authorId = book.id_autor || book.idAutor || book.autorId || null;
  const authorName = book.autor || book.nombreAutor || book.nombre_autor || '';
  const displayName = typeof authorName === 'object' ? (authorName.nombre || 'este autor') : (authorName || 'este autor');

  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
      <button id="backToBooksBtn" style="padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.9rem;">
        <i class="fa-solid fa-arrow-left"></i> Volver al Catálogo
      </button>
      <h2 style="margin: 0; font-size: 1.5rem;">Detalles del Libro</h2>
    </div>

    <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; gap: 32px; flex-wrap: wrap; box-shadow: 0 4px 6px rgba(0,0,0,0.02); margin-bottom: 32px;">
      <div style="flex: 0 0 240px; max-width: 100%; text-align: center;">
        <img src="${book.portadaUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop'}" alt="Portada" style="width: 100%; max-height: 350px; object-fit: cover; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        ${book.archivoUrl ? `
          <a href="${book.archivoUrl}" target="_blank" class="btn-primary" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; width: 100%; padding: 10px; border-radius: 8px; text-decoration: none; background: #6366f1; color: white; font-size: 0.9rem;">
            <i class="fa-solid fa-download"></i> Descargar Archivo
          </a>
        ` : ''}
      </div>

      <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 16px;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6366f1; background: #e0e7ff; padding: 4px 10px; border-radius: 20px;">${book.formatoLibro || 'Formato Estándar'}</span>
          <h3 style="margin: 10px 0 6px 0; font-size: 1.75rem; color: #1e293b;">${book.titulo || 'Sin Título'}</h3>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; background: #f8fafc; padding: 16px; border-radius: 10px; border: 1px solid #f1f5f9;">
          <div>
            <span style="display: block; font-size: 0.75rem; color: #64748b; font-weight: 500;">Idioma</span>
            <strong style="font-size: 0.95rem; color: #334155;"><i class="fa-solid fa-language" style="color: #6366f1; margin-right: 4px;"></i> ${book.idioma || 'N/D'}</strong>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; color: #64748b; font-weight: 500;">País de Publicación</span>
            <strong style="font-size: 0.95rem; color: #334155;"><i class="fa-solid fa-globe" style="color: #6366f1; margin-right: 4px;"></i> ${book.paisPublicacion || 'N/D'}</strong>
          </div>
        </div>

        <div>
          <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; color: #475569;">Descripción</h4>
          <p style="margin: 0; font-size: 0.95rem; line-height: 1.6; color: #334155;">${book.descripcion || 'No hay descripción disponible para este ejemplar.'}</p>
        </div>
      </div>
    </div>

    <!-- Contenedor dinámico de libros relacionados -->
    <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      <h3 style="margin: 0 0 4px 0; font-size: 1.2rem; color: #1e293b;">Más obras de ${displayName}</h3>
      <p style="margin: 0 0 16px 0; font-size: 0.85rem; color: #64748b;">Explora otros títulos relacionados escritos por este autor.</p>
      <div id="relatedBooksList" style="text-align: center; padding: 20px; color: #64748b; font-size: 0.9rem;">Cargando obras del autor...</div>
    </div>
  `;

  document.getElementById('backToBooksBtn').addEventListener('click', loadBooksView);

  // Llamamos a la función pasando explícitamente el authorId capturado
  await loadAndRenderRelatedBooks(authorId, typeof authorName === 'string' ? authorName : '', bookId);
}

async function loadAndRenderRelatedBooks(authorId, authorNameQuery, currentBookId) {
  const listContainer = document.getElementById('relatedBooksList');
  if (!listContainer) return;

  let authorBooks = [];
  try {
    const response = await fetchBooks(0, 10, '', '', '', authorId);

    const items = response.content || response;
    authorBooks = Array.isArray(items) ? items.filter(b => String(b.id) !== String(currentBookId)) : [];
  } catch (e) {
    console.error("Error al cargar los libros del autor:", e);
  }

  if (authorBooks.length > 0) {
    listContainer.innerHTML = `
      <div class="horizontal-books-scroll" style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 12px; scroll-snap-type: x mandatory;">
        ${authorBooks.map(b => `
          <div class="author-card related-book-item" 
               data-id="${b.id}" 
               data-id-autor="${b.id_autor || authorId}" 
               style="flex: 0 0 160px; scroll-snap-align: start; cursor: pointer; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px; transition: transform 0.2s;">
            <img src="${b.portadaUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&h=200&fit=crop'}" alt="${b.titulo}" style="width: 100%; height: 130px; object-fit: cover; border-radius: 8px;">
            <div style="overflow: hidden;">
              <h5 style="margin: 0; font-size: 0.85rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${b.titulo}">${b.titulo}</h5>
              <span style="font-size: 0.7rem; color: #64748b; display: block; margin-top: 2px;">${b.formatoLibro || 'Libro'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    listContainer.querySelectorAll('.related-book-item').forEach(card => {
      card.addEventListener('click', () => {
        const nextBookId = card.getAttribute('data-id');
        openBookDetailsView(nextBookId);
      });
    });
  } else {
    listContainer.innerHTML = `<p style="font-size: 0.9rem; color: #64748b; font-style: italic; margin: 0;">No se encontraron más libros registrados de este autor.</p>`;
  }
}

function renderPagination(pageData) {
  const paginationContainer = document.getElementById('booksPagination');
  if (!paginationContainer) return;

  const number = pageData.number !== undefined ? pageData.number : (pageData.pageNumber || 0);
  const totalPages = pageData.totalPages || 1;
  const totalElements = pageData.totalElements || 0;

  paginationContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding: 16px; border-top: 1px solid #e2e8f0; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); flex-wrap: wrap; gap: 10px;">
      <span style="font-size: 0.85rem; color: #64748b; font-weight: 500;">Página ${number + 1} de ${totalPages} (Total: ${totalElements} libros)</span>
      <div style="display: flex; gap: 8px;">
        <button id="prevPageBtn" ${number === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="padding: 6px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.85rem; font-weight: 500;">Anterior</button>
        <button id="nextPageBtn" ${number >= totalPages - 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="padding: 6px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.85rem; font-weight: 500;">Siguiente</button>
      </div>
    </div>
  `;

  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (prevBtn && number > 0) {
    prevBtn.addEventListener('click', () => loadAndRenderBooks(currentSearchNombre, currentSearchAutor, currentSearchIdioma, number - 1, currentLimit));
  }
  if (nextBtn && number < totalPages - 1) {
    nextBtn.addEventListener('click', () => loadAndRenderBooks(currentSearchNombre, currentSearchAutor, currentSearchIdioma, number + 1, currentLimit));
  }
}

function initBookListeners() {
  const btnNewBook = document.getElementById('btnNewBook');
  if (btnNewBook) {
    btnNewBook.addEventListener('click', openCreateBookModal);
  }

  const modal = document.getElementById('bookModal');
  const closeBtn = document.getElementById('closeBookModalBtn');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  const searchTitleInput = document.getElementById('searchBookTitle');
  const searchAuthorInput = document.getElementById('searchBookAuthor');
  const searchIdiomaSelect = document.getElementById('searchBookIdioma');

  const triggerSearch = () => {
    const titleVal = searchTitleInput ? searchTitleInput.value.trim() : '';
    const authorVal = searchAuthorInput ? searchAuthorInput.value.trim() : '';
    const idiomaVal = searchIdiomaSelect ? searchIdiomaSelect.value : '';
    loadAndRenderBooks(titleVal, authorVal, idiomaVal, 0, currentLimit);
  };

  if (searchTitleInput) searchTitleInput.addEventListener('input', triggerSearch);
  if (searchAuthorInput) searchAuthorInput.addEventListener('input', triggerSearch);
  if (searchIdiomaSelect) searchIdiomaSelect.addEventListener('change', triggerSearch);

  const limitSelector = document.getElementById('limitSelector');
  if (limitSelector) {
    limitSelector.addEventListener('change', async (e) => {
      const newSize = Number(e.target.value);
      await loadAndRenderBooks(currentSearchNombre, currentSearchAutor, currentSearchIdioma, 0, newSize);
    });
  }
}

async function openCreateBookModal() {
  const modal = document.getElementById('bookModal');
  const bodyContent = document.getElementById('bookModalBody');
  if (!modal || !bodyContent) return;

  modal.style.display = 'flex';
  bodyContent.innerHTML = `<p style="text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando formulario...</p>`;

  let authors = [];
  let languages = [];
  let categories = [];
  let genres = [];
  let bookTypes = [];
  let bookFormats = [];

  try {
    // Carga paralela de datos de las APIs
    const [authorRes, langRes, catRes, genRes, typeRes, formatRes] = await Promise.allSettled([
      fetchAuthors(0, 100),
      fetchIdiomas(),
      fetchCategorias(0, 100),
      fetchGeneros({ page: 0, size: 100 }),
      fetchTiposLibro(0, 100),
      fetchFormatosLibro(0, 100)
    ]);

    if (authorRes.status === 'fulfilled' && authorRes.value) {
      const val = authorRes.value;
      authors = Array.isArray(val) ? val : (val.content || []);
    }

    if (langRes.status === 'fulfilled' && langRes.value) {
      const val = langRes.value;
      languages = Array.isArray(val) ? val : (val.content || []);
    }

    if (catRes.status === 'fulfilled' && catRes.value) {
      const val = catRes.value;
      categories = Array.isArray(val) ? val : (val.content || []);
    }

    if (genRes.status === 'fulfilled' && genRes.value) {
      const val = genRes.value;
      genres = Array.isArray(val) ? val : (val.content || []);
    }

    if (typeRes.status === 'fulfilled' && typeRes.value) {
      const val = typeRes.value;
      bookTypes = Array.isArray(val) ? val : (val.content || []);
    }

    if (formatRes.status === 'fulfilled' && formatRes.value) {
      const val = formatRes.value;
      bookFormats = Array.isArray(val) ? val : (val.content || []);
    }

  } catch (e) {
    console.error("Error al cargar datos para el modal:", e);
  }

  const authorOptions = authors.map(a =>
    `<option value="${a.id}">${a.nombre} ${a.primerApellido || ''}</option>`
  ).join('');

  const languageOptions = languages.map(l =>
    `<option value="${l.id}">${l.nombre}</option>`
  ).join('');

  const bookTypeOptions = bookTypes.map(t =>
    `<option value="${t.id}">${t.nombre}</option>`
  ).join('');

  const bookFormatOptions = bookFormats.map(f =>
    `<option value="${f.id}">${f.nombre}</option>`
  ).join('');

  const categoryCheckboxes = categories.length > 0
    ? categories.map(c => {
      const catId = c.id || c.idCategoria;
      const catName = c.nombre || c.categoria || 'Sin nombre';
      return `
          <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; background: #ffffff; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer;">
            <input type="checkbox" class="cat-checkbox" value="${catId}"> ${catName}
          </label>
        `;
    }).join('')
    : '<p style="font-size: 0.8rem; color: #64748b;">No se encontraron categorías.</p>';

  const genreCheckboxes = genres.length > 0
    ? genres.map(g => {
      const genId = g.id || g.idGenero;
      const genName = g.nombre || g.genero || 'Sin nombre';
      return `
          <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; background: #ffffff; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer;">
            <input type="checkbox" class="gen-checkbox" value="${genId}" data-nombre="${genName}"> ${genName}
          </label>
        `;
    }).join('')
    : '<p style="font-size: 0.8rem; color: #64748b;">No hay géneros cargados.</p>';

  bodyContent.innerHTML = `
    <form id="createBookForm" style="display: flex; flex-direction: column; gap: 14px; max-height: 75vh; overflow-y: auto; padding-right: 4px;">
      
      <!-- Título y Subtítulo -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="flex: 2; min-width: 200px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Título del Libro *</label>
          <input type="text" id="b_titulo" required placeholder="Ej. Cien años de soledad" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Subtítulo</label>
          <input type="text" id="b_subtitulo" placeholder="Opcional" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
      </div>

      <!-- ISBN, Editorial, Tipo de Libro y Formato de Libro -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 130px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">ISBN *</label>
          <input type="text" id="b_isbn" required placeholder="978-3-16-148410-0" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1; min-width: 130px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Editorial *</label>
          <input type="text" id="b_editorial" required placeholder="Nombre de editorial" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1; min-width: 130px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Tipo de Libro *</label>
          <select id="b_id_tipo_libro" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: white;">
            <option value="">Seleccione tipo</option>
            ${bookTypeOptions}
          </select>
        </div>
        <div style="flex: 1; min-width: 130px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Formato *</label>
          <select id="b_id_formato_libro" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: white;">
            <option value="">Seleccione formato</option>
            ${bookFormatOptions}
          </select>
        </div>
      </div>

      <!-- Autor -->
      <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc;">
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 8px;">Autor *</label>
        <div style="display: flex; gap: 16px; margin-bottom: 10px; font-size: 0.85rem;">
          <label style="cursor: pointer;"><input type="radio" name="authorType" value="existing" checked> Autor Existente</label>
          <label style="cursor: pointer;"><input type="radio" name="authorType" value="new"> Registrar Nuevo Autor</label>
        </div>

        <div id="section_existing_author">
          <select id="b_id_autor" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: white;">
            <option value="">Selecciona un autor</option>
            ${authorOptions}
          </select>
        </div>

        <div id="section_new_author" style="display: none; grid-template-columns: 1fr 1fr; gap: 8px;">
          <input type="text" id="a_nombre" placeholder="Nombre *" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
          <input type="text" id="a_segundoNombre" placeholder="Segundo Nombre" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
          <input type="text" id="a_primerApellido" placeholder="Primer Apellido *" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
          <input type="text" id="a_segundoApellido" placeholder="Segundo Apellido" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
          <input type="date" id="a_fechaNacimiento" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
          <div>
            <label style="font-size: 0.75rem; color: #64748b;">Foto del Autor</label>
            <input type="file" id="a_fotoAutorFile" accept="image/*" style="padding: 4px; font-size: 0.8rem; width: 100%;">
          </div>
        </div>
      </div>

      <!-- Idioma y País -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Idioma *</label>
          <select id="b_id_idioma" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: white;">
            <option value="">Seleccione un idioma</option>
            ${languageOptions}
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">País de Origen *</label>
          <input type="text" id="b_paisOrigen" required placeholder="Ej. Colombia" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
      </div>

      <!-- Categorías -->
      <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc;">
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 8px;">Categorías *</label>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${categoryCheckboxes}
        </div>
      </div>

      <!-- Géneros -->
      <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc;">
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 8px;">Géneros <span style="font-weight: normal; color: #64748b;">(Opcional)</span></label>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${genreCheckboxes}
        </div>
      </div>

      <!-- Archivos Multimedia -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 180px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Portada del Libro * (Imagen)</label>
          <input type="file" id="bookImgFile" required accept="image/*" style="width: 100%; padding: 6px; border-radius: 8px; border: 1px dashed #cbd5e1; font-size: 0.8rem; background: #ffffff;">
        </div>
        <div style="flex: 1; min-width: 180px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Documento del Libro * (PDF)</label>
          <input type="file" id="bookPdfFile" required accept=".pdf" style="width: 100%; padding: 6px; border-radius: 8px; border: 1px dashed #cbd5e1; font-size: 0.8rem; background: #ffffff;">
        </div>
      </div>

      <!-- Descripción -->
      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción / Sinopsis *</label>
        <textarea id="b_descripcion" required rows="3" placeholder="Sinopsis o detalles del libro..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;"></textarea>
      </div>

      <!-- Botones -->
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelCreateBook" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500; font-size: 0.9rem;">Cancelar</button>
        <button type="submit" class="btn-primary" style="padding: 10px 20px; border-radius: 8px; background: #6366f1; color: white; border: none; cursor: pointer; font-weight: 600; font-size: 0.9rem;">Guardar Libro</button>
      </div>

    </form>
  `;

  // Cambio de pestaña Autor Existente / Nuevo
  const radioAuthorType = modal.querySelectorAll('input[name="authorType"]');
  const sectionExisting = document.getElementById('section_existing_author');
  const sectionNew = document.getElementById('section_new_author');

  radioAuthorType.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'existing') {
        sectionExisting.style.display = 'block';
        sectionNew.style.display = 'none';
        document.getElementById('b_id_autor').required = true;
        document.getElementById('a_nombre').required = false;
        document.getElementById('a_primerApellido').required = false;
      } else {
        sectionExisting.style.display = 'none';
        sectionNew.style.display = 'grid';
        document.getElementById('b_id_autor').required = false;
        document.getElementById('a_nombre').required = true;
        document.getElementById('a_primerApellido').required = true;
      }
    });
  });

  document.getElementById('cancelCreateBook').addEventListener('click', () => modal.style.display = 'none');

  // Submit del Formulario
  const form = document.getElementById('createBookForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const selectedCatCheckboxes = Array.from(document.querySelectorAll('.cat-checkbox:checked'));
      if (selectedCatCheckboxes.length === 0) {
        alert("Por favor selecciona al menos una categoría para el libro.");
        return;
      }

      const selectedGenCheckboxes = Array.from(document.querySelectorAll('.gen-checkbox:checked'));
      const portadaFile = document.getElementById('bookImgFile').files[0];
      const pdfFile = document.getElementById('bookPdfFile').files[0];

      if (!portadaFile || !pdfFile) {
        alert("Debes seleccionar tanto la portada como el documento PDF del libro.");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

      try {
        const formData = new FormData();

        // DTO principal del libro
        const libroDtoReq = {
          titulo: document.getElementById('b_titulo').value.trim(),
          subtitulo: document.getElementById('b_subtitulo').value.trim(),
          isbn: document.getElementById('b_isbn').value.trim(),
          editorial: document.getElementById('b_editorial').value.trim(),
          id_tipo_libro: Number(document.getElementById('b_id_tipo_libro').value),
          id_idioma: Number(document.getElementById('b_id_idioma').value),
          id_formato_libro: Number(document.getElementById('b_id_formato_libro').value),
          paisOrigen: document.getElementById('b_paisOrigen').value.trim(),
          descripcion: document.getElementById('b_descripcion').value.trim()
        };
        formData.append('libroDtoReq', new Blob([JSON.stringify(libroDtoReq)], { type: 'application/json' }));

        // Archivos multimedia obligatorios
        formData.append('portada', portadaFile);
        formData.append('libro', pdfFile);

        // Categorías seleccionadas
        const categoriasList = selectedCatCheckboxes.map(cb => ({ id: Number(cb.value) }));
        formData.append('categorias', new Blob([JSON.stringify(categoriasList)], { type: 'application/json' }));

        // Géneros seleccionados con el nombre capturado en dataset
        const generosList = selectedGenCheckboxes.map(cb => ({
          id: Number(cb.value),
          nombre: cb.dataset.nombre || ''
        }));
        formData.append('generos', new Blob([JSON.stringify(generosList)], { type: 'application/json' }));

        // Gestión del Autor
        const authorTypeVal = form.querySelector('input[name="authorType"]:checked').value;
        let idAutorParam = null;

        if (authorTypeVal === 'existing') {
          idAutorParam = document.getElementById('b_id_autor').value;
          if (!idAutorParam) {
            alert("Por favor selecciona un autor de la lista.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
          }
        } else {
          const autorDtoReq = {
            nombre: document.getElementById('a_nombre').value.trim(),
            segundoNombre: document.getElementById('a_segundoNombre').value.trim(),
            primerApellido: document.getElementById('a_primerApellido').value.trim(),
            segundoApellido: document.getElementById('a_segundoApellido').value.trim(),
            fechaNacimiento: document.getElementById('a_fechaNacimiento').value || null
          };

          formData.append('autorDtoReq', new Blob([JSON.stringify(autorDtoReq)], { type: 'application/json' }));

          const fotoAutorFile = document.getElementById('a_fotoAutorFile').files[0];
          if (fotoAutorFile) {
            formData.append('fotoAutor', fotoAutorFile);
          }
        }

        await createBook(formData, idAutorParam);

        modal.style.display = 'none';
        if (typeof loadAndRenderBooks === 'function') {
          await loadAndRenderBooks('', '', '', 0, typeof currentLimit !== 'undefined' ? currentLimit : 20);
        }
        alert("¡El libro se ha creado correctamente!");

      } catch (error) {
        console.error("Error al crear el libro:", error);
        alert(error.message || "Ocurrió un error al guardar el libro.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
}