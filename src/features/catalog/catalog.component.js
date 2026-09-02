import { fetchLibros, fetchCategorias, fetchIdiomas, fetchTiposLibro, fetchGeneros, fetchLibroDetalles } from './catalog.api.js';
import { getStateMessageHTML } from '../../core/components/state-message.js';

const PALETTE = ['#6E2A2A', '#1C2536', '#9A6A34', '#3B5B45', '#4A3B6B', '#7A4A2A', '#2E4A5E', '#5C2E4A'];

function getPageSizeByDevice() {
  const width = window.innerWidth;
  if (width < 640) return 8;
  if (width < 1024) return 15;
  return 20;
}

function bookCardHTML(b, i) {
  const color = PALETTE[i % PALETTE.length];
  const titulo = b.titulo || 'Sin título';
  const subtitulo = b.subtitulo ? `<div class="subtitle" title="${b.subtitulo}">${b.subtitulo}</div>` : '';
  const autor = b.autor || b.nombre_autor || 'Autor no especificado';
  const editorial = b.editorial || 'Sin editorial';
  const formato = b.formatoLibro || 'Digital';
  const anio = b.fechaPublicacion ? new Date(b.fechaPublicacion).getFullYear() : '';
  const portada = b.portadaUrl;

  const rawData = JSON.stringify(b).replace(/'/g, "&apos;");

  const coverHTML = portada
    ? `<img src="${portada}" alt="${titulo}" class="book-cover-img" onerror="this.outerHTML='<div class=\\'book-cover-fallback\\'><span class=\\'fallback-title\\'>${titulo}</span></div>'">`
    : `<div class="book-cover-fallback">
        <span class="fallback-title">${titulo}</span>
       </div>`;

  return `
    <div class="book-card" data-book='${rawData}'>
      <button class="btn-favorite" data-id="${b.id || ''}" aria-label="Agregar a favoritos">
        <svg class="heart-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <div class="book-cover" style="background: ${color}; padding: 12px 12px 6px 12px; display: flex; align-items: center; justify-content: center; position: relative;">
        <span class="badge-format">${formato}</span>
        ${coverHTML}
      </div>
      <div class="book-meta" style="background: #ffffff;">
        <div class="title" title="${titulo}">${titulo}</div>
        ${subtitulo}
        <div class="author">${autor}</div>
        <div class="footer-info">
          <span>${editorial}</span>
          ${anio ? `<span>• ${anio}</span>` : ''}
        </div>
      </div>
    </div>`;
}

function renderFilterBar(categorias, idiomas, tiposLibro, generos, filterTabs, activeCategoryId = '') {
  const isAllActive = activeCategoryId === '' ? 'class="active"' : '';
  const allTab = `<button ${isAllActive} data-id="">TODOS</button>`;

  const dynamicTabs = categorias.map(cat => {
    const isActive = String(cat.id) === String(activeCategoryId) ? 'class="active"' : '';
    return `<button ${isActive} data-id="${cat.id}">${cat.nombre ? cat.nombre.toUpperCase() : ''}</button>`;
  }).join('');

  const idiomaOptions = idiomas.map(lang => 
    `<option value="${lang.id}">${lang.nombre}</option>`
  ).join('');

  const tipoOptions = tiposLibro.map(tipo => 
    `<option value="${tipo.id}">${tipo.nombre ? tipo.nombre.toUpperCase() : ''}</option>`
  ).join('');

  const generoOptions = generos.map(gen => 
    `<option value="${gen.id}">${gen.nombre ? gen.nombre.toUpperCase() : ''}</option>`
  ).join('');

  filterTabs.innerHTML = `
    <div class="filter-bar-header">
      <div class="filter-title-group">
        <span class="filter-label">CATÁLOGO</span>
        <span class="filter-badge">${categorias.length + 1} CATEGORIAS</span>
      </div>

      <div class="search-inputs-group">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="searchInput" placeholder="Título del libro..." autocomplete="off">
        </div>

        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <input type="text" id="authorInput" placeholder="Autor..." autocomplete="off">
        </div>

        <div class="search-box select-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          <select id="genreSelect">
            <option value="">Todos los géneros</option>
            ${generoOptions}
          </select>
        </div>

        <div class="search-box select-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <select id="typeSelect">
            <option value="">Todos los tipos</option>
            ${tipoOptions}
          </select>
        </div>

        <div class="search-box select-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <select id="languageSelect">
            <option value="">Todos los idiomas</option>
            ${idiomaOptions}
          </select>
        </div>
      </div>
    </div>

    <div class="filter-chips-slim">
      ${allTab}
      ${dynamicTabs}
    </div>
  `;
}

export function initCatalog() {
  const bookGrid = document.getElementById('bookGrid');
  const filterTabs = document.getElementById('filterTabs');

  if (!bookGrid || !filterTabs) return;

  let activeCategoryId = '';
  let activeLanguageId = '';
  let activeTypeId = '';
  let activeGenreId = '';
  let titleQuery = '';
  let authorQuery = '';
  let searchTimeout = null;

  let currentPage = 0;
  let totalPages = 0;

  function resetFiltersAndFetchAll() {
    activeCategoryId = '';
    activeLanguageId = '';
    activeTypeId = '';
    activeGenreId = '';
    titleQuery = '';
    authorQuery = '';
    currentPage = 0;

    const searchInput = document.getElementById('searchInput');
    const authorInput = document.getElementById('authorInput');
    const genreSelect = document.getElementById('genreSelect');
    const typeSelect = document.getElementById('typeSelect');
    const languageSelect = document.getElementById('languageSelect');

    if (searchInput) searchInput.value = '';
    if (authorInput) authorInput.value = '';
    if (genreSelect) genreSelect.value = '';
    if (typeSelect) typeSelect.value = '';
    if (languageSelect) languageSelect.value = '';

    filterTabs.querySelectorAll('.filter-chips-slim button').forEach(b => {
      if (b.dataset.id === '') {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    renderBooks();
  }

  function switchToOnlyCatalogView() {
    resetFiltersAndFetchAll();

    const sectionsToHide = [
      document.getElementById('inicio'),
      document.getElementById('comunidad'),
      document.getElementById('nosotros'),
      document.getElementById('contacto'),
      document.querySelector('.catalog-cta-banner')
    ];

    sectionsToHide.forEach(section => {
      if (section) section.style.display = 'none';
    });

    const catalogoSection = document.getElementById('catalogo') || document.querySelector('.catalogo');
    if (catalogoSection) catalogoSection.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function renderBooks() {
    bookGrid.innerHTML = `<p style="color:var(--muted); font-size:0.9rem; grid-column: 1/-1;">Cargando catálogo…</p>`;

    const size = getPageSizeByDevice();
    const id_cat = activeCategoryId !== '' ? activeCategoryId : undefined;
    const id_idiom = activeLanguageId !== '' ? activeLanguageId : undefined;
    const id_tipo_libro = activeTypeId !== '' ? activeTypeId : undefined;
    const id_genero = activeGenreId !== '' ? activeGenreId : undefined;
    const nombre = titleQuery.trim() !== '' ? titleQuery.trim() : undefined;
    const nombre_autor = authorQuery.trim() !== '' ? authorQuery.trim() : undefined;

    try {
      const data = await fetchLibros({ id_cat, id_idiom, id_tipo_libro, id_genero, nombre, nombre_autor, page: currentPage, size });
      const items = data.content || [];
      
      totalPages = data.totalPages ?? data.page?.totalPages ?? data.total_pages ?? 1;

      renderPaginationControls();

      if (items.length === 0) {
        const hasFilters = nombre || nombre_autor || id_idiom || id_tipo_libro || id_genero || id_cat;
        bookGrid.innerHTML = getStateMessageHTML({
          type: 'empty',
          title: hasFilters ? 'Sin coincidencias' : 'Categoría vacía',
          message: hasFilters 
            ? 'No se encontraron libros con los criterios de búsqueda seleccionados.' 
            : 'No hay libros registrados en esta sección por el momento.'
        });
        return;
      }

      bookGrid.innerHTML = items.map(bookCardHTML).join('');

    } catch (err) {
      console.warn('Error al consultar libros:', err);
      const is404 = err.message.includes('404');

      bookGrid.innerHTML = getStateMessageHTML({
        type: is404 ? '404' : 'error',
        title: is404 ? 'Libros no encontrados' : 'Fallo de conexión',
        message: is404 
          ? 'La búsqueda solicitada no arrojó resultados.' 
          : 'No se pudo cargar el catálogo. Verifica la conexión con el servidor.',
        buttonText: 'Reintentar',
        buttonId: 'btnRetry'
      });

      const btnRetry = document.getElementById('btnRetry');
      if (btnRetry) {
        btnRetry.addEventListener('click', () => renderBooks());
      }
    }
  }

  function renderPaginationControls() {
    let paginationContainer = document.getElementById('paginationContainer');
    
    if (!paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.id = 'paginationContainer';
      paginationContainer.className = 'pagination-container';
      if (bookGrid && bookGrid.parentNode) {
        bookGrid.parentNode.insertBefore(paginationContainer, bookGrid.nextSibling);
      }
    }

    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage >= totalPages - 1 || totalPages === 0;

    paginationContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 12px; margin: 30px 0; grid-column: 1 / -1; width: 100%;';

    paginationContainer.innerHTML = `
      <button id="prevPageBtn" ${isFirstPage ? 'disabled' : ''} style="padding: 8px 16px; border-radius: 6px; border: 1px solid #ccc; background: ${isFirstPage ? '#e5e7eb' : '#ffffff'}; cursor: ${isFirstPage ? 'not-allowed' : 'pointer'}; color: #333; font-weight: 600;">
        ◄ Anterior
      </button>
      <span style="font-size: 0.9rem; color: #374151; font-weight: 500;">
        Página <strong>${currentPage + 1}</strong> de <strong>${Math.max(totalPages, 1)}</strong>
      </span>
      <button id="nextPageBtn" ${isLastPage ? 'disabled' : ''} style="padding: 8px 16px; border-radius: 6px; border: 1px solid #ccc; background: ${isLastPage ? '#e5e7eb' : '#ffffff'}; cursor: ${isLastPage ? 'not-allowed' : 'pointer'}; color: #333; font-weight: 600;">
        Siguiente ►
      </button>
    `;

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (prevBtn && !isFirstPage) {
      prevBtn.onclick = () => {
        currentPage--;
        renderBooks();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    if (nextBtn && !isLastPage) {
      nextBtn.onclick = () => {
        currentPage++;
        renderBooks();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
  }

  async function loadInitialData() {
    try {
      const [catData, langData, typeData, genData] = await Promise.all([
        fetchCategorias({ page: 0, size: 50 }),
        fetchIdiomas({ page: 0, size: 150 }),
        fetchTiposLibro({ page: 0, size: 50 }),
        fetchGeneros({ page: 0, size: 50 })
      ]);

      const categorias = catData.content || [];
      const idiomas = langData.content || [];
      const tiposLibro = typeData.content || [];
      const generos = genData.content || [];

      renderFilterBar(categorias, idiomas, tiposLibro, generos, filterTabs, activeCategoryId);
      bindFilterEvents();
    } catch (err) {
      console.warn('Error al cargar datos iniciales de filtros:', err);
      renderFilterBar([], [], [], [], filterTabs, activeCategoryId);
      bindFilterEvents();
    }

    renderBooks();
  }

  function bindFilterEvents() {
    const searchInput = document.getElementById('searchInput');
    const authorInput = document.getElementById('authorInput');
    const languageSelect = document.getElementById('languageSelect');
    const typeSelect = document.getElementById('typeSelect');
    const genreSelect = document.getElementById('genreSelect');

    const handleInput = () => {
      clearTimeout(searchTimeout);
      titleQuery = searchInput ? searchInput.value : '';
      authorQuery = authorInput ? authorInput.value : '';
      currentPage = 0;

      searchTimeout = setTimeout(() => {
        renderBooks();
      }, 350);
    };

    if (searchInput) searchInput.addEventListener('input', handleInput);
    if (authorInput) authorInput.addEventListener('input', handleInput);

    if (genreSelect) {
      genreSelect.addEventListener('change', (e) => {
        activeGenreId = e.target.value;
        currentPage = 0;
        renderBooks();
      });
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        activeTypeId = e.target.value;
        currentPage = 0;
        renderBooks();
      });
    }

    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        activeLanguageId = e.target.value;
        currentPage = 0;
        renderBooks();
      });
    }

    const catalogTriggers = document.querySelectorAll('#btnSeeAllBooks, .btn-empezar-leer, a[href="#catalogo"], .nav-catalog');
    catalogTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        switchToOnlyCatalogView();
      });
    });
  }

  filterTabs.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    
    activeCategoryId = e.target.dataset.id;
    currentPage = 0;

    filterTabs.querySelectorAll('.filter-chips-slim button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    renderBooks();
  });

  bookGrid.addEventListener('click', async (e) => {
    const favoriteBtn = e.target.closest('.btn-favorite');
    if (favoriteBtn) {
      e.stopPropagation();
      const bookId = favoriteBtn.getAttribute('data-id');
      
      favoriteBtn.classList.toggle('is-favorite');
      const esFavorito = favoriteBtn.classList.contains('is-favorite');
      
      if (esFavorito) {
        console.log(`Libro ${bookId} agregado a favoritos`);
      } else {
        console.log(`Libro ${bookId} eliminado de favoritos`);
      }
      return;
    }

    const card = e.target.closest('.book-card');
    if (!card) return;

    const bookDataRaw = card.getAttribute('data-book');
    if (!bookDataRaw) return;

    try {
      const basicBook = JSON.parse(bookDataRaw.replace(/&apos;/g, "'"));
      
      openBookModal({ ...basicBook, descripcion: 'Cargando detalles adicionales...', cargando: true });

      if (basicBook.id) {
        try {
          const details = await fetchLibroDetalles(basicBook.id);
          const fullBook = { ...basicBook, ...details };
          openBookModal(fullBook);
        } catch (detailErr) {
          console.warn('No se pudieron obtener los detalles extendidos:', detailErr);
        }
      }
    } catch (err) {
      console.error('Error al leer los datos del libro:', err);
    }
  });

  function openBookModal(book) {
    let modal = document.getElementById('bookModal');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'bookModal';
      modal.className = 'book-modal-overlay';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="book-modal-content" style="max-width: 1100px; width: 95%; max-height: 95vh; display: flex; flex-direction: column; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); position: relative;">
          <button id="closeModal" class="modal-close-btn" style="position: absolute; right: 20px; top: 15px; background: none; border: none; font-size: 1.8rem; cursor: pointer; z-index: 20; color: #4b5563;">&times;</button>
          <div id="modalBody" style="overflow-y: auto; flex: 1; padding: 24px; position: relative;"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#closeModal').addEventListener('click', () => {
        modal.style.display = 'none';
      });
      modal.addEventListener('click', (ev) => {
        if (ev.target === modal) modal.style.display = 'none';
      });
    }

    const modalBody = modal.querySelector('#modalBody');
    const titulo = book.titulo || 'Sin título';
    const subtitulo = book.subtitulo ? `<h3>${book.subtitulo}</h3>` : '';
    const autor = book.autor || book.nombre_autor || 'Autor no especificado';
    const editorial = book.editorial || 'Sin editorial';
    const anio = book.fechaPublicacion ? new Date(book.fechaPublicacion).getFullYear() : 'No especificado';
    const formato = book.formatoLibro || 'Digital';
    const descripcion = book.descripcion || 'No hay una descripción detallada disponible para este libro.';
    const idioma = book.idioma ? `<p class="modal-idioma"><strong>Idioma:</strong> ${book.idioma}</p>` : '';
    const pais = book.paisPublicacion ? `<p class="modal-pais"><strong>País de publicación:</strong> ${book.paisPublicacion}</p>` : '';
    
    const portadaImgUrl = book.portadaUrl;
    const portada = portadaImgUrl 
      ? `<img src="${portadaImgUrl}" alt="${titulo}" class="modal-cover" style="width: 100%; max-height: 320px; object-fit: cover; border-radius: 8px;">` 
      : `<div class="modal-cover-fallback" style="width: 100%; height: 250px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; border-radius: 8px;"><span>Sin portada</span></div>`;

    const archivoFinalUrl = book.archivoUrl || book.url || book.archivo || book.fileUrl || book.enlace;

    let visualizadorHTML = '';
    if (archivoFinalUrl) {
      const urlLower = archivoFinalUrl.toLowerCase();
      const esImagen = /\.(jpeg|jpg|png|gif|webp)$/.test(urlLower);
      const esPdf = /\.pdf$/.test(urlLower);
      const esEpub = /\.epub$/.test(urlLower);
      
      if (esImagen) {
        visualizadorHTML = `
          <div class="modal-viewer-section" style="margin-top: 24px; border-top: 1px solid var(--line, #e5e7eb); padding-top: 20px;">
            <strong style="display: block; margin-bottom: 10px;">Visualizador de Imagen:</strong>
            <div style="text-align: center; background: #f9fafb; border-radius: 8px; padding: 10px;">
              <img src="${archivoFinalUrl}" alt="Archivo visualizable" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 6px;">
            </div>
          </div>
        `;
      } else if (esPdf) {
        visualizadorHTML = `
          <div class="modal-viewer-section" style="margin-top: 24px; border-top: 1px solid var(--line, #e5e7eb); padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong>Lector Digital:</strong>
              <button id="btnFullscreenReader" style="background: var(--primary, #2563eb); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; cursor: pointer;">Pantalla completa</button>
            </div>
            
            <div id="readerContainer" style="width: 100%; height: 500px; background: #2d3748; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--line, #e5e7eb); position: relative;">
              <div style="background: rgba(15, 23, 42, 0.9); padding: 10px 15px; display: flex; justify-content: center; gap: 15px; align-items: center; color: white; border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 10;">
                <button id="btnPrevPage" style="background: #4a5568; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.85rem;">◀ Anterior</button>
                <span id="pageInfo" style="font-size: 0.85rem; color: #e2e8f0;">Página <span id="pageNum">1</span> de <span id="pageCount">--</span></span>
                <button id="btnNextPage" style="background: #4a5568; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.85rem;">Siguiente ▶</button>
              </div>
              <div style="flex: 1; overflow: auto; display: flex; justify-content: center; align-items: center; padding: 15px;">
                <canvas id="pdfCanvas" style="box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 100%; background: white;"></canvas>
              </div>
            </div>
          </div>
        `;
      } else if (esEpub) {
        visualizadorHTML = `
          <div class="modal-viewer-section" style="margin-top: 24px; border-top: 1px solid var(--line, #e5e7eb); padding-top: 20px;">
            <strong>Libro Digital (EPUB):</strong>
            <div style="margin-top: 10px; padding: 15px; background: #f9fafb; border-radius: 8px; text-align: center;">
              <p style="color: var(--muted, #666); margin-bottom: 5px; font-size: 0.9rem;">Este formato está protegido para lectura exclusiva en línea.</p>
            </div>
          </div>
        `;
      } else {
        visualizadorHTML = `
          <div class="modal-viewer-section" style="margin-top: 24px; border-top: 1px solid var(--line, #e5e7eb); padding-top: 20px; text-align: center;">
            <p style="color: var(--muted, #888); font-size: 0.85rem; font-style: italic;">Visualización restringida.</p>
          </div>
        `;
      }
    } else {
      visualizadorHTML = `
        <div style="margin-top: 24px; border-top: 1px solid var(--line, #e5e7eb); padding-top: 20px; text-align: center;">
          <p style="color: var(--muted, #888); font-size: 0.85rem; font-style: italic;">Este libro no tiene un archivo digital disponible.</p>
        </div>
      `;
    }

    modalBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start;">
        <div>
          ${portada}
          <div style="margin-top: 10px; text-align: center;">
            <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${formato}</span>
          </div>
        </div>
        <div>
          <h2 style="font-size: 1.5rem; margin-bottom: 8px; color: #111827;">${titulo}</h2>
          ${subtitulo}
          <p style="margin: 6px 0; color: #4b5563;"><strong>Autor:</strong> ${autor}</p>
          <p style="margin: 6px 0; color: #4b5563;"><strong>Editorial:</strong> ${editorial} (${anio})</p>
          ${idioma}
          ${pais}
          <div style="margin-top: 14px;">
            <strong style="color: #111827; display: block; margin-bottom: 4px;">Descripción:</strong>
            <p style="color: #4b5563; font-size: 0.95rem; line-height: 1.5;">${descripcion}</p>
          </div>
        </div>
      </div>
      ${visualizadorHTML}

      <div style="margin-top: 32px; border-top: 1px solid var(--line, #e5e7eb); padding-top: 20px;">
        <h4 style="font-size: 1.1rem; margin-bottom: 14px; font-family: 'Fraunces', serif; color: #1f2937;">Libros recomendados de este autor</h4>
        <div id="modalRecommendedGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">
          <p style="color: var(--muted, #666); font-size: 0.85rem; grid-column: 1 / -1; text-align: center;">Buscando recomendaciones...</p>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const autorLibro = book.autor || book.nombre_autor;
    if (autorLibro && book.id) {
      loadModalRecommendations(book, book.id);
    } else {
      const recContainer = modal.querySelector('#modalRecommendedGrid');
      if (recContainer) recContainer.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem; grid-column: 1 / -1; text-align: center;">No hay recomendaciones disponibles para este autor.</p>';
    }

    const pdfCanvas = modal.querySelector('#pdfCanvas');
    if (pdfCanvas && archivoFinalUrl) {
      loadPdfViewerScript(archivoFinalUrl, modal);
    }

    const btnFullscreen = modal.querySelector('#btnFullscreenReader');
    const readerContainer = modal.querySelector('#readerContainer');
    if (btnFullscreen && readerContainer) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          readerContainer.requestFullscreen().catch(err => {
            console.warn("Error al intentar activar pantalla completa:", err);
          });
        } else {
          document.exitFullscreen();
        }
      });
    }
  }

  async function loadModalRecommendations(bookOrAuthorData, currentBookId) {
    const container = document.getElementById('modalRecommendedGrid');
    if (!container) return;

    const autorNombre = typeof bookOrAuthorData === 'object' && bookOrAuthorData !== null
      ? (bookOrAuthorData.autor || bookOrAuthorData.nombre_autor)
      : bookOrAuthorData;

    if (!autorNombre) {
      container.innerHTML = '<p style="color: var(--muted, #666); font-size: 0.85rem; grid-column: 1 / -1; text-align: center;">No hay autor asociado para mostrar recomendaciones.</p>';
      return;
    }

    try {
      const data = await fetchLibros({ 
        nombre_autor: autorNombre, 
        page: 0, 
        size: 10 
      });

      const allBooks = Array.isArray(data) ? data : (data.content || []);

      const books = allBooks
        .filter(b => String(b.id) !== String(currentBookId))
        .slice(0, 5);

      if (books.length === 0) {
        container.innerHTML = '<p style="color: var(--muted, #666); font-size: 0.85rem; grid-column: 1 / -1; text-align: center;">No hay más libros de este autor.</p>';
        return;
      }

      const PALETTE = window.PALETTE || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

      container.innerHTML = books.map((recBook, idx) => {
        const color = PALETTE[idx % PALETTE.length];
        const rTitle = recBook.titulo || 'Sin título';
        const rAuthor = recBook.autor || recBook.nombre_autor || 'Autor desconocido';
        const rPortada = recBook.portadaUrl;

        const rCoverHTML = rPortada
          ? `<img src="${rPortada}" alt="${rTitle}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 4px; margin-bottom: 6px;">`
          : `<div style="width: 100%; height: 110px; background: ${color}; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.7rem; text-align: center; padding: 4px; margin-bottom: 6px;">${rTitle}</div>`;

        const rawRecData = JSON.stringify(recBook).replace(/'/g, "&apos;");

        return `
          <div class="recommended-mini-card" data-book='${rawRecData}' style="cursor: pointer; background: #f9fafb; border: 1px solid var(--border-color, #e5e7eb); border-radius: 8px; padding: 8px; text-align: center; transition: transform 0.2s ease;">
            ${rCoverHTML}
            <h5 style="font-size: 0.75rem; font-weight: 600; margin: 0 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${rTitle}">${rTitle}</h5>
            <span style="font-size: 0.68rem; color: var(--muted, #6b7280); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${rAuthor}</span>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.recommended-mini-card').forEach(card => {
        card.addEventListener('click', async () => {
          const recRaw = card.getAttribute('data-book');
          if (!recRaw) return;
          try {
            const basicRec = JSON.parse(recRaw.replace(/&apos;/g, "'"));
            
            // Llamada directa corregida sin 'window.' para que abra el modal localmente
            openBookModal({ ...basicRec, descripcion: 'Cargando detalles adicionales...' });
            
            if (basicRec.id) {
              const details = await fetchLibroDetalles(basicRec.id);
              openBookModal({ ...basicRec, ...details });
              loadModalRecommendations(details, basicRec.id);
            }
          } catch (e) {
            console.error('Error al abrir libro recomendado:', e);
          }
        });
      });

    } catch (err) {
      console.warn('Error al cargar recomendaciones:', err);
      container.innerHTML = '<p style="color: var(--danger-color, #dc2626); font-size: 0.85rem; grid-column: 1 / -1; text-align: center;">No se pudieron cargar las recomendaciones.</p>';
    }
  }

  function loadPdfViewerScript(pdfUrl, modal) {
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        initPdfRenderer(pdfUrl, modal);
      };
      document.head.appendChild(script);
    } else {
      initPdfRenderer(pdfUrl, modal);
    }
  }

  function initPdfRenderer(url, modal) {
    let pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        scale = 1.2;

    const canvas = modal.querySelector('#pdfCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function renderPage(num) {
      pageRendering = true;
      pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        const renderTask = page.render(renderContext);

        renderTask.promise.then(function() {
          pageRendering = false;
          if (pageNumPending !== null) {
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        });
      });

      const pageNumEl = modal.querySelector('#pageNum');
      if (pageNumEl) pageNumEl.textContent = num;
    }

    function queueRenderPage(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage(num);
      }
    }

    function onPrevPage() {
      if (pageNum <= 1) return;
      pageNum--;
      queueRenderPage(pageNum);
    }

    function onNextPage() {
      if (pageNum >= pdfDoc.numPages) return;
      pageNum++;
      queueRenderPage(pageNum);
    }

    const btnPrev = modal.querySelector('#btnPrevPage');
    const btnNext = modal.querySelector('#btnNextPage');
    if (btnPrev) btnPrev.addEventListener('click', onPrevPage);
    if (btnNext) btnNext.addEventListener('click', onNextPage);

    window.pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
      pdfDoc = pdfDoc_;
      const pageCountEl = modal.querySelector('#pageCount');
      if (pageCountEl) pageCountEl.textContent = pdfDoc.numPages;
      renderPage(pageNum);
    }).catch(err => {
      console.error("Error al cargar el archivo PDF con PDF.js:", err);
      const readerContainer = modal.querySelector('#readerContainer');
      if (readerContainer) {
        readerContainer.innerHTML = '<p style="color: white; padding: 20px; text-align: center;">No se pudo cargar el documento PDF.</p>';
      }
    });
  }

  loadInitialData();
}