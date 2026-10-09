import { 
  fetchBookGenres, 
  fetchBookGenreById, 
  createBookGenre, 
  updateBookGenre, 
  deleteBookGenre 
} from './book-genres.api.js';

let currentPage = 0;
let totalPages = 1;
let currentSearchQuery = '';
let currentGenres = [];

export async function loadBookGenresView() {
  const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <!-- CARRUSEL HERO SUPERIOR -->
    <div class="carousel-hero-container" id="genresCarouselContainer">
      <div class="carousel-track" id="genresCarouselTrack">
        
        <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1200&q=80');">
          <div class="carousel-slide-overlay"></div>
          <div class="carousel-slide-content">
            <span class="carousel-slide-tag">Módulo de Géneros</span>
            <h2 class="carousel-slide-title">Explora los Géneros Literarios</h2>
            <p class="carousel-slide-desc">Organiza y clasifica la colección de libros según su estilo, narrativa o temática.</p>
          </div>
        </div>

        <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80');">
          <div class="carousel-slide-overlay"></div>
          <div class="carousel-slide-content">
            <span class="carousel-slide-tag">Administración</span>
            <h2 class="carousel-slide-title">Clasificación Estructurada</h2>
            <p class="carousel-slide-desc">Crea nuevos géneros o edita los existentes para mantener actualizado el catálogo.</p>
          </div>
        </div>

      </div>

      <div class="carousel-controls">
        <div class="carousel-dots">
          <span class="carousel-dot active"></span>
          <span class="carousel-dot"></span>
        </div>
        <button class="carousel-arrow" id="prevGenresCarouselBtn" title="Anterior"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="carousel-arrow" id="nextGenresCarouselBtn" title="Siguiente"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
    </div>

    <div class="view-header" style="margin-bottom: 20px;">
      <h1 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Géneros de Libro</h1>
      <p style="font-size: 0.875rem; color: #64748b; margin: 0;">Administra las categorías y géneros literarios disponibles en la biblioteca.</p>
    </div>

    <section class="genres-module-container">
      <div class="genres-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="margin: 0; font-size: 1.15rem; color: #1e293b;">Géneros Registrados</h3>
          <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b;">Clasificación temática para los libros del catálogo.</p>
        </div>
        <button class="btn-primary" id="btnNewGenre" style="padding: 10px 18px; border-radius: 8px; border: none; background: #2563eb; color: white; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-tags"></i> Nuevo Género
        </button>
      </div>

      <div class="genres-search-bars" style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <input type="text" id="searchGenreName" placeholder="Buscar género por nombre..." 
               style="flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0); outline: none; font-size: 0.875rem;">
      </div>

      <div class="genres-grid" id="genresGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
        <p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">Cargando géneros de libro...</p>
      </div>

      <div id="genresPagination"></div>
    </section>

    <!-- Modal General -->
    <div id="genreModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 28px; border-radius: 16px; width: 100%; max-width: 540px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 id="genreModalTitle" style="margin: 0; font-size: 1.25rem; color: #1e293b;">Detalles del Género</h3>
          <button id="closeGenreModalBtn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="genreModalBody"></div>
      </div>
    </div>

    <!-- Modal Status de Carga -->
    <div id="loadingGenreModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1100;">
      <div style="background: white; padding: 24px 36px; border-radius: 12px; display: flex; align-items: center; gap: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; color: #2563eb;"></i>
        <div>
          <h4 id="loadingGenreText" style="margin: 0; font-size: 1rem; color: #1e293b;">Procesando solicitud...</h4>
          <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #64748b;">Por favor, espera un momento.</p>
        </div>
      </div>
    </div>
  `;

  initGenresCarousel();
  initSearchListeners();
  initModalListeners();
  initNewGenreButtonListener();

  currentPage = 0;
  currentSearchQuery = '';
  await loadAndRenderGenres();
}

function initGenresCarousel() {
  const track = document.getElementById('genresCarouselTrack');
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];
  const dots = document.querySelectorAll('#genresCarouselContainer .carousel-dot');
  const prevBtn = document.getElementById('prevGenresCarouselBtn');
  const nextBtn = document.getElementById('nextGenresCarouselBtn');
  const container = document.getElementById('genresCarouselContainer');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;

  function updateCarousel(index) {
    if (index < 0) currentIndex = slides.length - 1;
    else if (index >= slides.length) currentIndex = 0;
    else currentIndex = index;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      updateCarousel(currentIndex + 1);
    }, 4000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { updateCarousel(currentIndex - 1); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { updateCarousel(currentIndex + 1); startAutoplay(); });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => { updateCarousel(idx); startAutoplay(); });
  });

  if (container) {
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
  }

  startAutoplay();
}

function getPageSizeByDevice() {
  const width = window.innerWidth;
  if (width < 768) return 6;
  if (width < 1024) return 8;
  return 8;
}

async function loadAndRenderGenres(query = currentSearchQuery, page = currentPage) {
  currentSearchQuery = query;
  currentPage = page;
  const pageSize = getPageSizeByDevice();

  const grid = document.getElementById('genresGrid');
  if (grid) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">Cargando géneros...</p>`;
  }

  try {
    const response = await fetchBookGenres(currentPage, pageSize, currentSearchQuery);

    if (Array.isArray(response)) {
      totalPages = Math.ceil(response.length / pageSize) || 1;
      const start = currentPage * pageSize;
      currentGenres = response.slice(start, start + pageSize);
    } else if (response?.content) {
      currentGenres = response.content;
      totalPages = response.totalPages || 1;
      currentPage = response.number ?? currentPage;
    } else {
      currentGenres = [];
    }

    renderGenres(currentGenres);
    renderPaginationControls(totalPages, currentPage);
  } catch (error) {
    console.error('Error al cargar géneros:', error);
    currentGenres = [];
    renderGenres([]);
    renderPaginationControls(0, 0);
  }
}

function renderGenres(items) {
  const grid = document.getElementById('genresGrid');
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">No se encontraron géneros de libro registrados.</p>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const id = item.id || item.idGeneroLibro || item.genreId;
    const nombre = item.nombre || item.name || 'Sin nombre';
    const descripcion = item.descripcion || item.description || 'Sin descripción asignada.';

    return `
      <div class="genre-card" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
              ${nombre}
            </span>
            <div style="display: flex; gap: 4px;">
              <button class="icon-btn btn-genre-details" data-id="${id}" title="Ver Auditoría" style="background: none; border: none; cursor: pointer; color: #2563eb; padding: 4px; font-size: 0.9rem;"><i class="fa-solid fa-eye"></i></button>
              <button class="icon-btn btn-genre-edit" data-id="${id}" title="Editar" style="background: none; border: none; cursor: pointer; color: #475569; padding: 4px; font-size: 0.9rem;"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-btn btn-genre-delete" data-id="${id}" data-nombre="${nombre}" title="Eliminar" style="background: none; border: none; cursor: pointer; color: #ef4444; padding: 4px; font-size: 0.9rem;"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 1rem; font-weight: 600; color: #1e293b;">ID #${id}</h4>
          <p style="margin: 0; font-size: 0.85rem; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;" title="${descripcion}">
            ${descripcion}
          </p>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.btn-genre-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openGenreDetailsModal(id);
    });
  });

  document.querySelectorAll('.btn-genre-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openGenreEditModal(id);
    });
  });

  document.querySelectorAll('.btn-genre-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-nombre');
      if (confirm(`¿Estás seguro de eliminar el género "${name}"?`)) {
        await handleGenreDelete(id);
      }
    });
  });
}

async function openGenreDetailsModal(id) {
  const modal = document.getElementById('genreModal');
  const title = document.getElementById('genreModalTitle');
  const body = document.getElementById('genreModalBody');
  if (!modal || !body) return;

  title.textContent = "Auditoría y Trazabilidad";
  modal.style.display = 'flex';

  body.innerHTML = `
    <div style="text-align: center; padding: 30px; color: #64748b;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #2563eb; margin-bottom: 12px;"></i>
      <p style="margin: 0; font-size: 0.9rem;">Cargando datos de auditoría...</p>
    </div>
  `;

  try {
    const genre = await fetchBookGenreById(id);

    if (!genre) {
      body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontraron datos para este género.</p>`;
      return;
    }

    const createBy = genre.createBy || 'N/A';
    const creatorName = genre.creatorName || 'N/A';

    const updateBy = genre.updateBy || 'N/A';
    const updateName = genre.updateName || 'N/A';

    const deleteBy = genre.deleteBy || 'N/A';
    const deleteName = genre.deleteName || 'N/A';
    const deleteAt = genre.deleteAt ? new Date(genre.deleteAt).toLocaleString() : 'N/A';

    const isDelete = genre.isDelete ?? false;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        
        <div style="background: #f8fafc; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">Estado (isDelete):</span>
          <span style="padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: ${isDelete ? '#fee2e2' : '#dcfce7'}; color: ${isDelete ? '#dc2626' : '#166534'};">
            ${isDelete ? 'true (Eliminado)' : 'false (Activo)'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.725rem; color: #64748b; text-transform: uppercase; font-weight: 700;">createBy</span>
            <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: 600; font-size: 0.9rem;">${createBy}</p>
          </div>
          <div style="background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.725rem; color: #64748b; text-transform: uppercase; font-weight: 700;">creatorName</span>
            <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: 600; font-size: 0.9rem;">${creatorName}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.725rem; color: #64748b; text-transform: uppercase; font-weight: 700;">updateBy</span>
            <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: 600; font-size: 0.9rem;">${updateBy}</p>
          </div>
          <div style="background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.725rem; color: #64748b; text-transform: uppercase; font-weight: 700;">updateName</span>
            <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: 600; font-size: 0.9rem;">${updateName}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.725rem; color: #64748b; text-transform: uppercase; font-weight: 700;">deleteBy</span>
            <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: 600; font-size: 0.9rem;">${deleteBy}</p>
          </div>
          <div style="background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.725rem; color: #64748b; text-transform: uppercase; font-weight: 700;">deleteName</span>
            <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: 600; font-size: 0.9rem;">${deleteName}</p>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <span style="font-size: 0.725rem; color: #64748b; text-transform: uppercase; font-weight: 700;">deleteAt</span>
          <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: 600; font-size: 0.9rem;">${deleteAt}</p>
        </div>

      </div>
    `;
  } catch (error) {
    console.error("Error al consultar auditoría del género:", error);
    body.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #ef4444;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 1.8rem; margin-bottom: 8px;"></i>
        <p style="margin: 0; font-size: 0.9rem;">Ocurrió un error al consultar el servidor.</p>
      </div>
    `;
  }
}

function openGenreEditModal(id) {
  const modal = document.getElementById('genreModal');
  const title = document.getElementById('genreModalTitle');
  const body = document.getElementById('genreModalBody');
  if (!modal || !body) return;

  const item = currentGenres.find(f => (f.id || f.idGeneroLibro || f.genreId) == id);

  title.textContent = "Editar Género de Libro";
  modal.style.display = 'flex';

  if (!item) {
    body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontró el género seleccionado.</p>`;
    return;
  }

  const nombreVal = item.nombre || item.name || '';
  const descVal = item.descripcion || item.description || '';

  body.innerHTML = `
    <form id="editGenreForm" style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nombre del Género *</label>
        <input type="text" id="editGenreNombre" value="${nombreVal}" required placeholder="Ej. Novela Histórica, Ciencia Ficción" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
      </div>

      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción / Notas</label>
        <textarea id="editGenreDescripcion" rows="4" placeholder="Breve descripción del género literario..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;">${descVal}</textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelEditGenreBtn" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
        <button type="submit" style="padding: 10px 20px; border-radius: 8px; border: none; background: #2563eb; color: white; cursor: pointer; font-weight: 600;">Guardar Cambios</button>
      </div>
    </form>
  `;

  document.getElementById('cancelEditGenreBtn').addEventListener('click', closeGenreModal);

  document.getElementById('editGenreForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('editGenreNombre').value.trim();
    const descripcion = document.getElementById('editGenreDescripcion').value.trim();

    if (!nombre) {
      alert('El nombre del género es obligatorio.');
      return;
    }

    showGenreLoading('Guardando cambios...');

    const payload = {
      nombre,
      descripcion: descripcion || null
    };

    try {
      await updateBookGenre(id, payload);
      hideGenreLoading();
      closeGenreModal();
      await loadAndRenderGenres(currentSearchQuery, currentPage);
    } catch (err) {
      hideGenreLoading();
      alert(err.message || 'Error al actualizar el género.');
    }
  });
}

function openGenreCreateModal() {
  const modal = document.getElementById('genreModal');
  const title = document.getElementById('genreModalTitle');
  const body = document.getElementById('genreModalBody');
  if (!modal || !body) return;

  title.textContent = "Nuevo Género de Libro";
  modal.style.display = 'flex';

  body.innerHTML = `
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
      <div style="width: 44px; height: 44px; border-radius: 12px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
        <i class="fa-solid fa-tags"></i>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1rem; color: #1e293b;">Nuevo Género Literario</h4>
        <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: #64748b;">Registra una categoría temática para clasificar libros.</p>
      </div>
    </div>

    <form id="createGenreForm" style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nombre del Género *</label>
        <input type="text" id="createGenreNombre" required placeholder="Ej. Fantasía, Biografía, Poesía" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
      </div>

      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción / Notas</label>
        <textarea id="createGenreDescripcion" rows="4" placeholder="Detalles o temática de esta clasificación..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelCreateGenreBtn" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
        <button type="submit" style="padding: 10px 20px; border-radius: 8px; border: none; background: #2563eb; color: white; cursor: pointer; font-weight: 600;">Registrar</button>
      </div>
    </form>
  `;

  document.getElementById('cancelCreateGenreBtn').addEventListener('click', closeGenreModal);

  document.getElementById('createGenreForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('createGenreNombre').value.trim();
    const descripcion = document.getElementById('createGenreDescripcion').value.trim();

    if (!nombre) {
      alert('El nombre del género es obligatorio.');
      return;
    }

    showGenreLoading('Registrando género...');

    const payload = {
      nombre,
      descripcion: descripcion || null
    };

    try {
      await createBookGenre(payload);
      hideGenreLoading();
      closeGenreModal();
      await loadAndRenderGenres(currentSearchQuery, currentPage);
    } catch (err) {
      hideGenreLoading();
      alert(err.message || 'Error al crear el género.');
    }
  });
}

async function handleGenreDelete(id) {
  showGenreLoading('Eliminando género...');
  try {
    await deleteBookGenre(id);
    hideGenreLoading();
    await loadAndRenderGenres(currentSearchQuery, currentPage);
  } catch (err) {
    hideGenreLoading();
    alert(err.message || 'No se pudo eliminar el género.');
  }
}

function renderPaginationControls(total, page) {
  const container = document.getElementById('genresPagination');
  if (!container) return;

  if (total <= 1) {
    container.innerHTML = '';
    return;
  }

  const isFirst = page === 0;
  const isLast = page >= total - 1;

  let pageBtns = '';
  for (let i = 0; i < total; i++) {
    if (i === 0 || i === total - 1 || (i >= page - 1 && i <= page + 1)) {
      const active = i === page;
      pageBtns += `
        <button class="genre-page-btn" data-page="${i}" 
                style="padding: 6px 12px; border-radius: 6px; border: 1px solid ${active ? '#2563eb' : '#cbd5e1'}; background: ${active ? '#2563eb' : 'white'}; color: ${active ? 'white' : '#475569'}; cursor: pointer; font-size: 0.85rem; font-weight: ${active ? '700' : '500'}; min-width: 34px;">
          ${i + 1}
        </button>
      `;
    } else if (i === page - 2 || i === page + 2) {
      pageBtns += `<span style="color: #94a3b8; font-size: 0.85rem;">...</span>`;
    }
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 18px; padding-top: 14px; border-top: 1px solid #e2e8f0; flex-wrap: wrap;">
      <button id="btnGenrePrev" ${isFirst ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isFirst ? 'not-allowed' : 'pointer'}; font-size: 0.85rem; color: #475569; opacity: ${isFirst ? '0.4' : '1'};">
        <i class="fa-solid fa-chevron-left"></i> Anterior
      </button>

      <div style="display: flex; gap: 4px; align-items: center;">${pageBtns}</div>

      <button id="btnGenreNext" ${isLast ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isLast ? 'not-allowed' : 'pointer'}; font-size: 0.85rem; color: #475569; opacity: ${isLast ? '0.4' : '1'};">
        Siguiente <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;

  const btnPrev = document.getElementById('btnGenrePrev');
  const btnNext = document.getElementById('btnGenreNext');

  if (btnPrev && !isFirst) {
    btnPrev.addEventListener('click', () => loadAndRenderGenres(currentSearchQuery, page - 1));
  }
  if (btnNext && !isLast) {
    btnNext.addEventListener('click', () => loadAndRenderGenres(currentSearchQuery, page + 1));
  }

  document.querySelectorAll('.genre-page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetPage = parseInt(e.currentTarget.getAttribute('data-page'), 10);
      if (targetPage !== page) {
        loadAndRenderGenres(currentSearchQuery, targetPage);
      }
    });
  });
}

function initSearchListeners() {
  const input = document.getElementById('searchGenreName');
  let timer;
  if (input) {
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        currentPage = 0;
        loadAndRenderGenres(input.value.trim(), 0);
      }, 400);
    });
  }
}

function initNewGenreButtonListener() {
  const btn = document.getElementById('btnNewGenre');
  if (btn) {
    btn.addEventListener('click', openGenreCreateModal);
  }
}

function initModalListeners() {
  const modal = document.getElementById('genreModal');
  const closeBtn = document.getElementById('closeGenreModalBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeGenreModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeGenreModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGenreModal();
  });
}

export function closeGenreModal() {
  const modal = document.getElementById('genreModal');
  if (modal) modal.style.display = 'none';
}

function showGenreLoading(message = 'Procesando...') {
  const modal = document.getElementById('loadingGenreModal');
  const text = document.getElementById('loadingGenreText');
  if (text) text.textContent = message;
  if (modal) modal.style.display = 'flex';
}

function hideGenreLoading() {
  const modal = document.getElementById('loadingGenreModal');
  if (modal) modal.style.display = 'none';
}