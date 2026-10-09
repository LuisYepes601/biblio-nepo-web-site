import { 
  fetchFormats, 
  fetchFormatById, 
  createFormat, 
  updateFormat, 
  deleteFormat 
} from './formats.api.js';
import { navigateToView } from '../admin/admin.navigation.js';

let currentPage = 0;
let totalPages = 1;
let currentSearchQuery = '';
let currentFormats = [];

export async function loadFormatsView() {
  const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="formats-page-wrapper">
      
      <!-- BARRA SUPERIOR CON BOTÓN REGRESAR -->
      <div class="formats-top-bar" style="margin-bottom: 16px;">
        <button class="btn-back-dashboard" id="btnBackToDashboard" style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; color: #334155; padding: 8px 14px; border-radius: 8px; font-size: 0.825rem; font-weight: 600; cursor: pointer; transition: background 0.15s, border-color 0.15s;">
          <i class="fa-solid fa-arrow-left"></i> Regresar al Dashboard
        </button>
      </div>

      <!-- CARRUSEL HERO AUTOMÁTICO -->
      <div class="carousel-hero-container" id="formatsHeroCarousel" style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 28px; border: 1px solid #e2e8f0; background: #0f172a;">
        <div class="carousel-track" id="formatsCarouselTrack" style="display: flex; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); width: 100%;">
          
          <div class="carousel-slide" style="flex: 0 0 100%; min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Catálogo & Medios</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Formatos de Libros</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Administra las presentaciones físicas y digitales de los recursos registrados.</p>
            </div>
          </div>

          <div class="carousel-slide" style="flex: 0 0 100%; min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Soportes de Lectura</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Físico y Digital</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Clasifica el material en PDF, Epub, Audiolibros o tomos impresos para préstamo.</p>
            </div>
          </div>

        </div>

        <div class="carousel-controls" style="position: absolute; bottom: 16px; right: 20px; z-index: 3; display: flex; align-items: center; gap: 8px;">
          <div class="carousel-dots" style="display: flex; gap: 6px; margin-right: 6px;">
            <span class="carousel-dot active" style="width: 20px; height: 7px; border-radius: 10px; background: #ffffff; cursor: pointer;"></span>
            <span class="carousel-dot" style="width: 7px; height: 7px; border-radius: 50%; background: rgba(255, 255, 255, 0.4); cursor: pointer;"></span>
          </div>
          <button class="carousel-arrow" id="formatsPrevBtn" title="Anterior" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="carousel-arrow" id="formatsNextBtn" title="Siguiente" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>

      <!-- MÓDULO DE FORMATOS -->
      <section class="formats-module-container" style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px;">
        <div class="formats-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a;">Listado de Formatos</h3>
            <p style="margin: 2px 0 0 0; font-size: 0.825rem; color: #64748b;">Tipos de medios disponibles (ej. Físico, PDF, Audiolibro, Epub).</p>
          </div>
          <button class="btn-primary" id="btnNewFormat" style="padding: 9px 16px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-plus"></i> Nuevo Formato
          </button>
        </div>

        <div class="formats-search-bars" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
          <input type="text" id="searchFormatName" placeholder="Buscar formato por nombre..." 
                 style="flex: 1; min-width: 220px; padding: 9px 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.85rem; color: #0f172a; background: #ffffff;">
        </div>

        <div class="formats-grid" id="formatsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">
          <p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">Cargando formatos...</p>
        </div>

        <div id="formatsPagination"></div>
      </section>

    </div>

    <!-- Modal General para Crear / Editar / Detalles -->
    <div id="formatModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 24px; border-radius: 12px; width: 100%; max-width: 520px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 id="formatModalTitle" style="margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">Detalles del Formato</h3>
          <button id="closeFormatModalBtn" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="formatModalBody"></div>
      </div>
    </div>

    <!-- Modal Status de Carga -->
    <div id="loadingFormatModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); align-items: center; justify-content: center; z-index: 1100;">
      <div style="background: white; padding: 20px 28px; border-radius: 10px; display: flex; align-items: center; gap: 14px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #6366f1;"></i>
        <div>
          <h4 id="loadingFormatText" style="margin: 0; font-size: 0.95rem; color: #0f172a;">Procesando solicitud...</h4>
          <p style="margin: 2px 0 0 0; font-size: 0.785rem; color: #64748b;">Por favor espera.</p>
        </div>
      </div>
    </div>
  `;

  // Evento del botón de regreso
  const btnBack = document.getElementById('btnBackToDashboard');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      navigateToView('dashboard');
    });
  }

  // Inicializar carrusel
  initFormatsCarousel();

  initSearchListeners();
  initModalListeners();
  initNewFormatButtonListener();

  currentPage = 0;
  currentSearchQuery = '';
  await loadAndRenderFormats();
}

/**
 * Control automático de movimiento continuo para el carrusel de Formatos
 */
function initFormatsCarousel() {
  const track = document.getElementById('formatsCarouselTrack');
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];
  const dots = document.querySelectorAll('#formatsHeroCarousel .carousel-dot');
  const prevBtn = document.getElementById('formatsPrevBtn');
  const nextBtn = document.getElementById('formatsNextBtn');
  const container = document.getElementById('formatsHeroCarousel');

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

function getPageSizeByDevice() {
  const width = window.innerWidth;
  if (width < 768) return 6;
  if (width < 1024) return 8;
  return 8;
}

async function loadAndRenderFormats(query = currentSearchQuery, page = currentPage) {
  currentSearchQuery = query;
  currentPage = page;
  const pageSize = getPageSizeByDevice();

  const grid = document.getElementById('formatsGrid');
  if (grid) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">Cargando formatos...</p>`;
  }

  try {
    const response = await fetchFormats(currentPage, pageSize, currentSearchQuery);

    if (Array.isArray(response)) {
      totalPages = Math.ceil(response.length / pageSize) || 1;
      const start = currentPage * pageSize;
      currentFormats = response.slice(start, start + pageSize);
    } else if (response?.content) {
      currentFormats = response.content;
      totalPages = response.totalPages || 1;
      currentPage = response.number ?? currentPage;
    } else {
      currentFormats = [];
    }

    renderFormats(currentFormats);
    renderPaginationControls(totalPages, currentPage);
  } catch (error) {
    console.error('Error al cargar formatos:', error);
    currentFormats = [];
    renderFormats([]);
    renderPaginationControls(0, 0);
  }
}

function renderFormats(formats) {
  const grid = document.getElementById('formatsGrid');
  if (!grid) return;

  if (!formats || formats.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">No se encontraron formatos registrados.</p>`;
    return;
  }

  grid.innerHTML = formats.map(item => {
    const id = item.id || item.idFormato || item.formatId;
    const nombre = item.nombre || item.name || item.nombreFormato || 'Formato sin nombre';
    const descripcion = item.descripcion || item.description || 'Sin descripción asignada.';

    return `
      <div class="format-card" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.725rem; font-weight: 700; color: #6366f1; background: #eef2ff; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">
              ${nombre}
            </span>
            <div style="display: flex; gap: 4px;">
              <button class="icon-btn btn-format-details" data-id="${id}" title="Ver Auditoría" style="background: none; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #6366f1; padding: 5px 8px; font-size: 0.8rem;"><i class="fa-solid fa-eye"></i></button>
              <button class="icon-btn btn-format-edit" data-id="${id}" title="Editar" style="background: none; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #475569; padding: 5px 8px; font-size: 0.8rem;"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-btn btn-format-delete" data-id="${id}" data-nombre="${nombre}" title="Eliminar" style="background: none; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #ef4444; padding: 5px 8px; font-size: 0.8rem;"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; font-weight: 700; color: #0f172a;">ID #${id}</h4>
          <p style="margin: 0; font-size: 0.825rem; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;" title="${descripcion}">
            ${descripcion}
          </p>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.btn-format-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openFormatDetailsModal(id);
    });
  });

  document.querySelectorAll('.btn-format-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openFormatEditModal(id);
    });
  });

  document.querySelectorAll('.btn-format-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-nombre');
      if (confirm(`¿Estás seguro de eliminar el formato "${name}"?`)) {
        await handleFormatDelete(id);
      }
    });
  });
}

async function openFormatDetailsModal(id) {
  const modal = document.getElementById('formatModal');
  const title = document.getElementById('formatModalTitle');
  const body = document.getElementById('formatModalBody');
  if (!modal || !body) return;

  title.textContent = "Auditoría del Formato";
  modal.style.display = 'flex';

  body.innerHTML = `
    <div style="text-align: center; padding: 24px; color: #64748b;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #6366f1; margin-bottom: 8px;"></i>
      <p style="margin: 0; font-size: 0.85rem;">Cargando información...</p>
    </div>
  `;

  try {
    const format = await fetchFormatById(id);

    if (!format) {
      body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontraron datos.</p>`;
      return;
    }

    const createBy = format.createBy || 'N/A';
    const creatorName = format.creatorName || 'N/A';

    const updateBy = format.updateBy || 'N/A';
    const updateName = format.updateName || 'N/A';

    const deleteBy = format.deleteBy || 'N/A';
    const deleteName = format.deleteName || 'N/A';
    const deleteAt = format.deleteAt ? new Date(format.deleteAt).toLocaleString() : 'N/A';

    const isDelete = format.isDelete ?? false;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.85rem;">
        
        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #64748b; font-weight: 600;">Estado de registro:</span>
          <span style="padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; background: ${isDelete ? '#fee2e2' : '#dcfce7'}; color: ${isDelete ? '#dc2626' : '#166534'};">
            ${isDelete ? 'Eliminado' : 'Activo'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Creador ID</span>
            <span style="color: #0f172a; font-weight: 600;">${createBy}</span>
          </div>
          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Nombre Creador</span>
            <span style="color: #0f172a; font-weight: 600;">${creatorName}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Modificador ID</span>
            <span style="color: #0f172a; font-weight: 600;">${updateBy}</span>
          </div>
          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Nombre Modificador</span>
            <span style="color: #0f172a; font-weight: 600;">${updateName}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Eliminado por</span>
            <span style="color: #0f172a; font-weight: 600;">${deleteName} (${deleteBy})</span>
          </div>
          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Fecha Eliminación</span>
            <span style="color: #0f172a; font-weight: 600;">${deleteAt}</span>
          </div>
        </div>

      </div>
    `;
  } catch (error) {
    console.error("Error al consultar la auditoría del formato:", error);
    body.innerHTML = `
      <div style="text-align: center; padding: 16px; color: #ef4444;">
        <p style="margin: 0; font-size: 0.85rem;">No se pudo consultar la información.</p>
      </div>
    `;
  }
}

function openFormatEditModal(id) {
  const modal = document.getElementById('formatModal');
  const title = document.getElementById('formatModalTitle');
  const body = document.getElementById('formatModalBody');
  if (!modal || !body) return;

  const format = currentFormats.find(f => (f.id || f.idFormato || f.formatId) == id);

  title.textContent = "Editar Formato";
  modal.style.display = 'flex';

  if (!format) {
    body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontró el elemento.</p>`;
    return;
  }

  const nombreVal = format.nombre || format.name || format.nombreFormato || '';
  const descVal = format.descripcion || format.description || '';

  body.innerHTML = `
    <form id="editFormatForm" style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nombre del Formato *</label>
        <input type="text" id="editFormatNombre" value="${nombreVal}" required style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
      </div>

      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Descripción</label>
        <textarea id="editFormatDescripcion" rows="3" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; resize: vertical;">${descVal}</textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
        <button type="button" id="cancelEditFormatBtn" style="padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem;">Cancelar</button>
        <button type="submit" style="padding: 8px 16px; border-radius: 6px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600;">Guardar Cambios</button>
      </div>
    </form>
  `;

  document.getElementById('cancelEditFormatBtn').addEventListener('click', closeFormatModal);

  document.getElementById('editFormatForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('editFormatNombre').value.trim();
    const descripcion = document.getElementById('editFormatDescripcion').value.trim();

    if (!nombre) {
      alert('El nombre es obligatorio.');
      return;
    }

    showFormatLoading('Guardando...');

    const payload = {
      nombre: nombre,
      descripcion: descripcion || null
    };

    try {
      await updateFormat(id, payload);
      hideFormatLoading();
      closeFormatModal();
      await loadAndRenderFormats(currentSearchQuery, currentPage);
    } catch (err) {
      hideFormatLoading();
      alert(err.message || 'Error al actualizar.');
    }
  });
}

function openFormatCreateModal() {
  const modal = document.getElementById('formatModal');
  const title = document.getElementById('formatModalTitle');
  const body = document.getElementById('formatModalBody');
  if (!modal || !body) return;

  title.textContent = "Crear Nuevo Formato";
  modal.style.display = 'flex';

  body.innerHTML = `
    <form id="createFormatForm" style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nombre del Formato *</label>
        <input type="text" id="createFormatNombre" required placeholder="Ej. Audiolibro, Pasta Dura, PDF" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
      </div>

      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Descripción</label>
        <textarea id="createFormatDescripcion" rows="3" placeholder="Especificaciones sobre las características del formato..." style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
        <button type="button" id="cancelCreateFormatBtn" style="padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem;">Cancelar</button>
        <button type="submit" style="padding: 8px 16px; border-radius: 6px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600;">Guardar</button>
      </div>
    </form>
  `;

  document.getElementById('cancelCreateFormatBtn').addEventListener('click', closeFormatModal);

  document.getElementById('createFormatForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('createFormatNombre').value.trim();
    const descripcion = document.getElementById('createFormatDescripcion').value.trim();

    if (!nombre) {
      alert('El nombre es obligatorio.');
      return;
    }

    showFormatLoading('Guardando...');

    const payload = {
      nombre: nombre,
      descripcion: descripcion || null
    };

    try {
      await createFormat(payload);
      hideFormatLoading();
      closeFormatModal();
      await loadAndRenderFormats(currentSearchQuery, currentPage);
    } catch (err) {
      hideFormatLoading();
      alert(err.message || 'Error al guardar.');
    }
  });
}

async function handleFormatDelete(id) {
  showFormatLoading('Eliminando...');
  try {
    await deleteFormat(id);
    hideFormatLoading();
    await loadAndRenderFormats(currentSearchQuery, currentPage);
  } catch (err) {
    hideFormatLoading();
    alert(err.message || 'No se pudo eliminar.');
  }
}

function renderPaginationControls(total, page) {
  const container = document.getElementById('formatsPagination');
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
        <button class="format-page-btn" data-page="${i}" 
                style="padding: 6px 10px; border-radius: 6px; border: 1px solid ${active ? '#6366f1' : '#cbd5e1'}; background: ${active ? '#6366f1' : 'white'}; color: ${active ? 'white' : '#475569'}; cursor: pointer; font-size: 0.8rem; font-weight: ${active ? '700' : '500'}; min-width: 32px;">
          ${i + 1}
        </button>
      `;
    } else if (i === page - 2 || i === page + 2) {
      pageBtns += `<span style="color: #94a3b8; font-size: 0.8rem;">...</span>`;
    }
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0; flex-wrap: wrap;">
      <button id="btnFormatPrev" ${isFirst ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isFirst ? 'not-allowed' : 'pointer'}; font-size: 0.8rem; color: #475569; opacity: ${isFirst ? '0.4' : '1'};">
        <i class="fa-solid fa-chevron-left"></i> Anterior
      </button>

      <div style="display: flex; gap: 4px; align-items: center;">${pageBtns}</div>

      <button id="btnFormatNext" ${isLast ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isLast ? 'not-allowed' : 'pointer'}; font-size: 0.8rem; color: #475569; opacity: ${isLast ? '0.4' : '1'};">
        Siguiente <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;

  const btnPrev = document.getElementById('btnFormatPrev');
  const btnNext = document.getElementById('btnFormatNext');

  if (btnPrev && !isFirst) {
    btnPrev.addEventListener('click', () => loadAndRenderFormats(currentSearchQuery, page - 1));
  }
  if (btnNext && !isLast) {
    btnNext.addEventListener('click', () => loadAndRenderFormats(currentSearchQuery, page + 1));
  }

  document.querySelectorAll('.format-page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetPage = parseInt(e.currentTarget.getAttribute('data-page'), 10);
      if (targetPage !== page) {
        loadAndRenderFormats(currentSearchQuery, targetPage);
      }
    });
  });
}

function initSearchListeners() {
  const input = document.getElementById('searchFormatName');
  let timer;
  if (input) {
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        currentPage = 0;
        loadAndRenderFormats(input.value.trim(), 0);
      }, 400);
    });
  }
}

function initNewFormatButtonListener() {
  const btn = document.getElementById('btnNewFormat');
  if (btn) {
    btn.addEventListener('click', openFormatCreateModal);
  }
}

function initModalListeners() {
  const modal = document.getElementById('formatModal');
  const closeBtn = document.getElementById('closeFormatModalBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeFormatModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeFormatModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFormatModal();
  });
}

export function closeFormatModal() {
  const modal = document.getElementById('formatModal');
  if (modal) modal.style.display = 'none';
}

function showFormatLoading(message = 'Procesando...') {
  const modal = document.getElementById('loadingFormatModal');
  const text = document.getElementById('loadingFormatText');
  if (text) text.textContent = message;
  if (modal) modal.style.display = 'flex';
}

function hideFormatLoading() {
  const modal = document.getElementById('loadingFormatModal');
  if (modal) modal.style.display = 'none';
}