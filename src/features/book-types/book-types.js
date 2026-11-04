import { fetchBookTypes, createBookType } from './book-types.api.js';
import { navigateToView, hablarTexto } from '../admin/admin.navigation.js';

let currentPage = 0;
let currentSearchNombre = '';
let currentLimit = 10;

export async function loadBookTypesView() {
  const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
  if (!container) return;

  currentPage = 0;
  currentSearchNombre = '';

  container.innerHTML = `
    <div class="book-types-page-wrapper">
      
      <div class="books-top-bar" style="margin-bottom: 16px;">
        <button class="btn-back-dashboard" id="btnBackToDashboard" style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; color: #334155; padding: 8px 14px; border-radius: 8px; font-size: 0.825rem; font-weight: 600; cursor: pointer;">
          <i class="fa-solid fa-arrow-left"></i> Regresar al Dashboard
        </button>
      </div>

      <!-- CARRUSEL HERO -->
      <div class="carousel-hero-container" id="typesHeroCarousel" style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 24px; border: 1px solid #e2e8f0; background: #0f172a;">
        <div class="carousel-track" id="typesCarouselTrack" style="display: flex; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); width: 100%;">
          
          <div class="carousel-slide" style="flex: 0 0 100%; min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Clasificación Literaria</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Tipos de Libro</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Organiza las publicaciones según su naturaleza editorial, formato técnico o estructura académica.</p>
            </div>
          </div>

          <div class="carousel-slide" style="flex: 0 0 100%; min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Estructuración de Acervo</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Gestión de Categorías Técnicas</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Clasifica obras generales, monografías, enciclopedias y manuales dentro del catálogo.</p>
            </div>
          </div>

        </div>

        <div class="carousel-controls" style="position: absolute; bottom: 16px; right: 20px; z-index: 3; display: flex; align-items: center; gap: 8px;">
          <div class="carousel-dots" style="display: flex; gap: 6px; margin-right: 6px;">
            <span class="carousel-dot active" style="width: 20px; height: 7px; border-radius: 10px; background: #ffffff; cursor: pointer;"></span>
            <span class="carousel-dot" style="width: 7px; height: 7px; border-radius: 50%; background: rgba(255, 255, 255, 0.4); cursor: pointer;"></span>
          </div>
          <button class="carousel-arrow" id="typesPrevBtn" title="Anterior" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="carousel-arrow" id="typesNextBtn" title="Siguiente" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>

      <section class="types-module-container">
        <div class="types-header">
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #0f172a;">Tipos Registrados</h3>
            <p style="margin: 3px 0 0 0; font-size: 0.825rem; color: #64748b;">Clasificación temática y de formato para los libros del catálogo.</p>
          </div>
          <button class="btn-primary" id="btn-add-book-type" style="padding: 9px 16px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-plus"></i> Nuevo Tipo
          </button>
        </div>

        <div class="types-search-bars">
          <input type="text" id="searchTypeNombre" placeholder="Buscar tipo por nombre..." 
                 style="flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.85rem; background: white;">

          <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <label for="limitTypeSelector" style="font-size: 0.825rem; color: #475569; font-weight: 500;">Mostrar:</label>
            <select id="limitTypeSelector" style="border: none; outline: none; background: transparent; font-size: 0.85rem; font-weight: 600; color: #1e293b; cursor: pointer;">
              <option value="5">5</option>
              <option value="10" selected>10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>

        <div class="types-table-wrapper">
          <table class="types-table">
            <thead>
              <tr>
                <th style="width: 35%;">NOMBRE DEL TIPO</th>
                <th style="width: 65%;">DESCRIPCIÓN</th>
              </tr>
            </thead>
            <tbody id="bookTypesTableBody">
              <tr>
                <td colspan="2" style="text-align: center; color: #64748b; padding: 24px;">Cargando tipos de libro...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div id="typesPagination"></div>
      </section>

    </div>

    <!-- MODAL REGISTRO -->
    <div id="typeModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); align-items: center; justify-content: center; z-index: 1000; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 24px; border-radius: 12px; width: 100%; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 id="typeModalTitle" style="margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">Nuevo Tipo de Libro</h3>
          <button id="closeTypeModalBtn" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        
        <form id="typeForm" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nombre del Tipo *</label>
            <input type="text" id="typeName" required placeholder="Ej. Novela, Monografía, Manual..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
          </div>

          <div>
            <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción / Detalle</label>
            <textarea id="typeDescription" rows="3" placeholder="Descripción breve del tipo de publicación..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" id="cancelTypeModalBtn" style="padding: 9px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500; font-size: 0.85rem;">Cancelar</button>
            <button type="submit" class="btn-primary" style="padding: 9px 18px; border-radius: 8px; background: #6366f1; color: white; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem;">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btnBackToDashboard')?.addEventListener('click', () => {
    navigateToView('dashboard');
  });

  initTypesCarousel();
  initTypeListeners();
  await loadAndRenderTypes();
}

function initTypesCarousel() {
  const track = document.getElementById('typesCarouselTrack');
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];
  const dots = document.querySelectorAll('#typesHeroCarousel .carousel-dot');
  const prevBtn = document.getElementById('typesPrevBtn');
  const nextBtn = document.getElementById('typesNextBtn');
  const container = document.getElementById('typesHeroCarousel');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;

  function updateCarousel(index) {
    if (index < 0) currentIndex = slides.length - 1;
    else if (index >= slides.length) currentIndex = 0;
    else currentIndex = index;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.style.width = '20px';
        dot.style.borderRadius = '10px';
        dot.style.background = '#ffffff';
      } else {
        dot.style.width = '7px';
        dot.style.borderRadius = '50%';
        dot.style.background = 'rgba(255, 255, 255, 0.4)';
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      updateCarousel(currentIndex + 1);
    }, 3500);
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

async function loadAndRenderTypes(nombre = '', page = 0, size = currentLimit) {
  currentSearchNombre = nombre;
  currentPage = page;
  currentLimit = size;

  try {
    const response = await fetchBookTypes(page, size, nombre);
    const typesList = response.content || response || [];
    renderTypesTable(typesList);
    renderTypesPagination(response);
  } catch (error) {
    const tbody = document.getElementById('bookTypesTableBody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #dc2626; padding: 20px;">No se pudieron cargar los tipos de libro.</td></tr>`;
    }
  }
}

function renderTypesTable(types) {
  const tbody = document.getElementById('bookTypesTableBody');
  if (!tbody) return;

  if (!types || types.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #64748b; padding: 24px;">No hay tipos de libro registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = types.map(t => {
    const nombre = t.nombre || 'Sin nombre';
    const descripcion = t.descripcion || 'Sin descripción disponible.';

    return `
      <tr>
        <td class="type-name-cell">${nombre}</td>
        <td class="type-desc-cell">${descripcion}</td>
      </tr>
    `;
  }).join('');
}

function renderTypesPagination(pageData) {
  const container = document.getElementById('typesPagination');
  if (!container) return;

  const number = pageData.number !== undefined ? pageData.number : (pageData.pageNumber || 0);
  const totalPages = pageData.totalPages || 1;
  const totalElements = pageData.totalElements || 0;

  const prevDisabled = number === 0 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : '';
  const nextDisabled = number >= totalPages - 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : '';

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding-top: 14px; border-top: 1px solid #e2e8f0; flex-wrap: wrap; gap: 10px;">
      <span style="font-size: 0.825rem; color: #64748b; font-weight: 500;">Página ${number + 1} de ${totalPages} (Total: ${totalElements})</span>
      <div style="display: flex; gap: 8px;">
        <button id="prevTypePageBtn" ${prevDisabled} style="padding: 6px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem; color: #475569; font-weight: 500;">Anterior</button>
        <button id="nextTypePageBtn" ${nextDisabled} style="padding: 6px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem; color: #475569; font-weight: 500;">Siguiente</button>
      </div>
    </div>
  `;

  document.getElementById('prevTypePageBtn')?.addEventListener('click', () => {
    if (number > 0) loadAndRenderTypes(currentSearchNombre, number - 1, currentLimit);
  });

  document.getElementById('nextTypePageBtn')?.addEventListener('click', () => {
    if (number < totalPages - 1) loadAndRenderTypes(currentSearchNombre, number + 1, currentLimit);
  });
}

function initTypeListeners() {
  const modal = document.getElementById('typeModal');
  const btnAdd = document.getElementById('btn-add-book-type');
  const btnClose = document.getElementById('closeTypeModalBtn');
  const btnCancel = document.getElementById('cancelTypeModalBtn');
  const form = document.getElementById('typeForm');

  const closeModal = () => { if (modal) modal.style.display = 'none'; };

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      document.getElementById('typeName').value = '';
      document.getElementById('typeDescription').value = '';
      if (modal) modal.style.display = 'flex';
    });
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  const searchInput = document.getElementById('searchTypeNombre');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      loadAndRenderTypes(searchInput.value.trim(), 0, currentLimit);
    });
  }

  const limitSelect = document.getElementById('limitTypeSelector');
  if (limitSelect) {
    limitSelect.addEventListener('change', (e) => {
      loadAndRenderTypes(currentSearchNombre, 0, Number(e.target.value));
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('typeName').value.trim();
      const descripcion = document.getElementById('typeDescription').value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!submitBtn) return;

      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.75';
      submitBtn.style.cursor = 'not-allowed';
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

      const payload = { nombre, descripcion };

      try {
        await createBookType(payload);
        hablarTexto(`Tipo de libro ${nombre} creado correctamente.`);
        closeModal();
        await loadAndRenderTypes(currentSearchNombre, currentPage, currentLimit);
      } catch (err) {
        alert(err.message || "Ocurrió un error al guardar el tipo de libro.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        submitBtn.innerHTML = originalText;
      }
    });
  }
}