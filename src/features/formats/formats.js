import { 
  fetchFormats, 
  fetchFormatById, 
  createFormat, 
  updateFormat, 
  deleteFormat 
} from './formats.api.js';

let currentPage = 0;
let totalPages = 1;
let currentSearchQuery = '';
let currentFormats = [];

export async function loadFormatsView() {
  const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="view-header">
      <h1>Formatos de Libros</h1>
      <p>Administra las presentaciones físicas y digitales de los recursos del catálogo.</p>
    </div>

    <section class="formats-module-container">
      <div class="formats-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="margin: 0; font-size: 1.15rem; color: #1e293b;">Listado de Formatos</h3>
          <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b;">Tipos de medios disponibles (ej. Físico, PDF, Audiolibro, Epub).</p>
        </div>
        <button class="btn-primary" id="btnNewFormat" style="padding: 10px 18px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-swatchbook"></i> Nuevo Formato
        </button>
      </div>

      <div class="formats-search-bars" style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <input type="text" id="searchFormatName" placeholder="Buscar formato por nombre..." 
               style="flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0); outline: none; font-size: 0.875rem;">
      </div>

      <div class="formats-grid" id="formatsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
        <p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">Cargando formatos...</p>
      </div>

      <div id="formatsPagination"></div>
    </section>

    <!-- Modal General para Crear / Editar / Detalles -->
    <div id="formatModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 28px; border-radius: 16px; width: 100%; max-width: 540px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 id="formatModalTitle" style="margin: 0; font-size: 1.25rem; color: #1e293b;">Detalles del Formato</h3>
          <button id="closeFormatModalBtn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="formatModalBody"></div>
      </div>
    </div>

    <!-- Modal Status de Carga -->
    <div id="loadingFormatModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1100;">
      <div style="background: white; padding: 24px 36px; border-radius: 12px; display: flex; align-items: center; gap: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; color: #6366f1;"></i>
        <div>
          <h4 id="loadingFormatText" style="margin: 0; font-size: 1rem; color: #1e293b;">Procesando solicitud...</h4>
          <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #64748b;">Por favor, espera un momento.</p>
        </div>
      </div>
    </div>
  `;

  initSearchListeners();
  initModalListeners();
  initNewFormatButtonListener();

  currentPage = 0;
  currentSearchQuery = '';
  await loadAndRenderFormats();
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
      <div class="format-card" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #4f46e5; background: #e0e7ff; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
              ${nombre}
            </span>
            <div style="display: flex; gap: 4px;">
              <button class="icon-btn btn-format-details" data-id="${id}" title="Ver Auditoría" style="background: none; border: none; cursor: pointer; color: #6366f1; padding: 4px; font-size: 0.9rem;"><i class="fa-solid fa-eye"></i></button>
              <button class="icon-btn btn-format-edit" data-id="${id}" title="Editar" style="background: none; border: none; cursor: pointer; color: #475569; padding: 4px; font-size: 0.9rem;"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-btn btn-format-delete" data-id="${id}" data-nombre="${nombre}" title="Eliminar" style="background: none; border: none; cursor: pointer; color: #ef4444; padding: 4px; font-size: 0.9rem;"><i class="fa-solid fa-trash"></i></button>
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

  title.textContent = "Auditoría y Trazabilidad";
  modal.style.display = 'flex';

  body.innerHTML = `
    <div style="text-align: center; padding: 30px; color: #64748b;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #6366f1; margin-bottom: 12px;"></i>
      <p style="margin: 0; font-size: 0.9rem;">Cargando datos de auditoría...</p>
    </div>
  `;

  try {
    const format = await fetchFormatById(id);

    if (!format) {
      body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontraron datos para este formato.</p>`;
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
      <div style="display: flex; flex-direction: column; gap: 14px;">
        
        <!-- Estado isDelete -->
        <div style="background: #f8fafc; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">Estado (isDelete):</span>
          <span style="padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: ${isDelete ? '#fee2e2' : '#dcfce7'}; color: ${isDelete ? '#dc2626' : '#166534'};">
            ${isDelete ? 'true (Eliminado)' : 'false (Activo)'}
          </span>
        </div>

        <!-- Creador -->
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

        <!-- Modificador -->
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

        <!-- Eliminación -->
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
    console.error("Error al consultar la auditoría del formato:", error);
    body.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #ef4444;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 1.8rem; margin-bottom: 8px;"></i>
        <p style="margin: 0; font-size: 0.9rem;">Ocurrió un error al consultar el servidor.</p>
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
    body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontró el formato seleccionado.</p>`;
    return;
  }

  const nombreVal = format.nombre || format.name || format.nombreFormato || '';
  const descVal = format.descripcion || format.description || '';

  body.innerHTML = `
    <form id="editFormatForm" style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nombre del Formato *</label>
        <input type="text" id="editFormatNombre" value="${nombreVal}" required placeholder="Ej. Impreso, PDF, Epub" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
      </div>

      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción / Notas</label>
        <textarea id="editFormatDescripcion" rows="4" placeholder="Especificaciones sobre las características del formato..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;">${descVal}</textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelEditFormatBtn" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
        <button type="submit" style="padding: 10px 20px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-weight: 600;">Guardar Cambios</button>
      </div>
    </form>
  `;

  document.getElementById('cancelEditFormatBtn').addEventListener('click', closeFormatModal);

  document.getElementById('editFormatForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('editFormatNombre').value.trim();
    const descripcion = document.getElementById('editFormatDescripcion').value.trim();

    if (!nombre) {
      alert('El nombre del formato es obligatorio.');
      return;
    }

    showFormatLoading('Guardando cambios...');

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
      alert(err.message || 'Error al actualizar el formato.');
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
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
      <div style="width: 44px; height: 44px; border-radius: 12px; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
        <i class="fa-solid fa-swatchbook"></i>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1rem; color: #1e293b;">Nuevo Formato de Medio</h4>
        <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: #64748b;">Registra un nuevo formato para el catálogo.</p>
      </div>
    </div>

    <form id="createFormatForm" style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nombre del Formato *</label>
        <input type="text" id="createFormatNombre" required placeholder="Ej. Audiolibro, Pasta Dura, Digital" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
      </div>

      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción / Notas</label>
        <textarea id="createFormatDescripcion" rows="4" placeholder="Detalles de la presentación o requerimientos..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelCreateFormatBtn" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
        <button type="submit" style="padding: 10px 20px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-weight: 600;">Registrar Formato</button>
      </div>
    </form>
  `;

  document.getElementById('cancelCreateFormatBtn').addEventListener('click', closeFormatModal);

  document.getElementById('createFormatForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('createFormatNombre').value.trim();
    const descripcion = document.getElementById('createFormatDescripcion').value.trim();

    if (!nombre) {
      alert('El nombre del formato es obligatorio.');
      return;
    }

    showFormatLoading('Registrando formato...');

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
      alert(err.message || 'Error al crear el formato.');
    }
  });
}

async function handleFormatDelete(id) {
  showFormatLoading('Eliminando formato...');
  try {
    await deleteFormat(id);
    hideFormatLoading();
    await loadAndRenderFormats(currentSearchQuery, currentPage);
  } catch (err) {
    hideFormatLoading();
    alert(err.message || 'No se pudo eliminar el formato.');
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
                style="padding: 6px 12px; border-radius: 6px; border: 1px solid ${active ? '#6366f1' : '#cbd5e1'}; background: ${active ? '#6366f1' : 'white'}; color: ${active ? 'white' : '#475569'}; cursor: pointer; font-size: 0.85rem; font-weight: ${active ? '700' : '500'}; min-width: 34px;">
          ${i + 1}
        </button>
      `;
    } else if (i === page - 2 || i === page + 2) {
      pageBtns += `<span style="color: #94a3b8; font-size: 0.85rem;">...</span>`;
    }
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 18px; padding-top: 14px; border-top: 1px solid #e2e8f0; flex-wrap: wrap;">
      <button id="btnFormatPrev" ${isFirst ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isFirst ? 'not-allowed' : 'pointer'}; font-size: 0.85rem; color: #475569; opacity: ${isFirst ? '0.4' : '1'};">
        <i class="fa-solid fa-chevron-left"></i> Anterior
      </button>

      <div style="display: flex; gap: 4px; align-items: center;">${pageBtns}</div>

      <button id="btnFormatNext" ${isLast ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isLast ? 'not-allowed' : 'pointer'}; font-size: 0.85rem; color: #475569; opacity: ${isLast ? '0.4' : '1'};">
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