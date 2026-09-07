import { 
  fetchIdentificationTypes, 
  fetchIdentificationTypeById, 
  createIdentificationType, 
  updateIdentificationType, 
  deleteIdentificationType 
} from './identification-types.api.js';

let currentPage = 0;
let totalPages = 1;
let currentSearchQuery = '';
let currentIdTypes = [];

export async function loadIdentificationTypesView() {
  const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="view-header">
      <h1>Tipos de Identificación</h1>
      <p>Administra los tipos de documentos de identidad permitidos en el sistema.</p>
    </div>

    <section class="idtypes-module-container">
      <div class="idtypes-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="margin: 0; font-size: 1.15rem; color: #1e293b;">Documentos Registrados</h3>
          <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b;">Parámetros para la creación y validación de usuarios.</p>
        </div>
        <button class="btn-primary" id="btnNewIdType" style="padding: 10px 18px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-address-card"></i> Nuevo Documento
        </button>
      </div>

      <div class="idtypes-search-bars" style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <input type="text" id="searchIdTypeName" placeholder="Buscar tipo de documento por nombre..." 
               style="flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0); outline: none; font-size: 0.875rem;">
      </div>

      <div class="idtypes-grid" id="idTypesGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
        <p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">Cargando tipos de identificación...</p>
      </div>

      <div id="idTypesPagination"></div>
    </section>

    <!-- Modal General -->
    <div id="idTypeModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 28px; border-radius: 16px; width: 100%; max-width: 540px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 id="idTypeModalTitle" style="margin: 0; font-size: 1.25rem; color: #1e293b;">Detalles del Documento</h3>
          <button id="closeIdTypeModalBtn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="idTypeModalBody"></div>
      </div>
    </div>

    <!-- Modal Status de Carga -->
    <div id="loadingIdTypeModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1100;">
      <div style="background: white; padding: 24px 36px; border-radius: 12px; display: flex; align-items: center; gap: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; color: #6366f1;"></i>
        <div>
          <h4 id="loadingIdTypeText" style="margin: 0; font-size: 1rem; color: #1e293b;">Procesando solicitud...</h4>
          <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #64748b;">Por favor, espera un momento.</p>
        </div>
      </div>
    </div>
  `;

  initSearchListeners();
  initModalListeners();
  initNewIdTypeButtonListener();

  currentPage = 0;
  currentSearchQuery = '';
  await loadAndRenderIdTypes();
}

function getPageSizeByDevice() {
  const width = window.innerWidth;
  if (width < 768) return 6;
  if (width < 1024) return 8;
  return 8;
}

async function loadAndRenderIdTypes(query = currentSearchQuery, page = currentPage) {
  currentSearchQuery = query;
  currentPage = page;
  const pageSize = getPageSizeByDevice();

  const grid = document.getElementById('idTypesGrid');
  if (grid) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">Cargando tipos de documento...</p>`;
  }

  try {
    const response = await fetchIdentificationTypes(currentPage, pageSize, currentSearchQuery);

    if (Array.isArray(response)) {
      totalPages = Math.ceil(response.length / pageSize) || 1;
      const start = currentPage * pageSize;
      currentIdTypes = response.slice(start, start + pageSize);
    } else if (response?.content) {
      currentIdTypes = response.content;
      totalPages = response.totalPages || 1;
      currentPage = response.number ?? currentPage;
    } else {
      currentIdTypes = [];
    }

    renderIdTypes(currentIdTypes);
    renderPaginationControls(totalPages, currentPage);
  } catch (error) {
    console.error('Error al cargar tipos de documento:', error);
    currentIdTypes = [];
    renderIdTypes([]);
    renderPaginationControls(0, 0);
  }
}

function renderIdTypes(items) {
  const grid = document.getElementById('idTypesGrid');
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">No se encontraron tipos de identificación registrados.</p>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const id = item.id || item.idTipoIdentificacion || item.typeId;
    const nombre = item.nombre || item.name || item.tipo || 'Sin nombre';
    const descripcion = item.descripcion || item.description || 'Sin descripción asignada.';

    return `
      <div class="idtype-card" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
              ${nombre}
            </span>
            <div style="display: flex; gap: 4px;">
              <button class="icon-btn btn-idtype-details" data-id="${id}" title="Ver Auditoría" style="background: none; border: none; cursor: pointer; color: #6366f1; padding: 4px; font-size: 0.9rem;"><i class="fa-solid fa-eye"></i></button>
              <button class="icon-btn btn-idtype-edit" data-id="${id}" title="Editar" style="background: none; border: none; cursor: pointer; color: #475569; padding: 4px; font-size: 0.9rem;"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-btn btn-idtype-delete" data-id="${id}" data-nombre="${nombre}" title="Eliminar" style="background: none; border: none; cursor: pointer; color: #ef4444; padding: 4px; font-size: 0.9rem;"><i class="fa-solid fa-trash"></i></button>
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

  document.querySelectorAll('.btn-idtype-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openIdTypeDetailsModal(id);
    });
  });

  document.querySelectorAll('.btn-idtype-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openIdTypeEditModal(id);
    });
  });

  document.querySelectorAll('.btn-idtype-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-nombre');
      if (confirm(`¿Estás seguro de eliminar el tipo de documento "${name}"?`)) {
        await handleIdTypeDelete(id);
      }
    });
  });
}

async function openIdTypeDetailsModal(id) {
  const modal = document.getElementById('idTypeModal');
  const title = document.getElementById('idTypeModalTitle');
  const body = document.getElementById('idTypeModalBody');
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
    const idType = await fetchIdentificationTypeById(id);

    if (!idType) {
      body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontraron datos para este tipo de documento.</p>`;
      return;
    }

    const createBy = idType.createBy || 'N/A';
    const creatorName = idType.creatorName || 'N/A';

    const updateBy = idType.updateBy || 'N/A';
    const updateName = idType.updateName || 'N/A';

    const deleteBy = idType.deleteBy || 'N/A';
    const deleteName = idType.deleteName || 'N/A';
    const deleteAt = idType.deleteAt ? new Date(idType.deleteAt).toLocaleString() : 'N/A';

    const isDelete = idType.isDelete ?? false;

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
    console.error("Error al consultar auditoría del tipo de documento:", error);
    body.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #ef4444;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 1.8rem; margin-bottom: 8px;"></i>
        <p style="margin: 0; font-size: 0.9rem;">Ocurrió un error al consultar el servidor.</p>
      </div>
    `;
  }
}

function openIdTypeEditModal(id) {
  const modal = document.getElementById('idTypeModal');
  const title = document.getElementById('idTypeModalTitle');
  const body = document.getElementById('idTypeModalBody');
  if (!modal || !body) return;

  const item = currentIdTypes.find(f => (f.id || f.idTipoIdentificacion || f.typeId) == id);

  title.textContent = "Editar Tipo de Identificación";
  modal.style.display = 'flex';

  if (!item) {
    body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontró el tipo de documento seleccionado.</p>`;
    return;
  }

  const nombreVal = item.nombre || item.name || item.tipo || '';
  const descVal = item.descripcion || item.description || '';

  body.innerHTML = `
    <form id="editIdTypeForm" style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nombre del Documento *</label>
        <input type="text" id="editIdTypeNombre" value="${nombreVal}" required placeholder="Ej. Cédula de Ciudadanía" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
      </div>

      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción / Notas</label>
        <textarea id="editIdTypeDescripcion" rows="4" placeholder="Especificaciones sobre el uso de este documento..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;">${descVal}</textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelEditIdTypeBtn" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
        <button type="submit" style="padding: 10px 20px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-weight: 600;">Guardar Cambios</button>
      </div>
    </form>
  `;

  document.getElementById('cancelEditIdTypeBtn').addEventListener('click', closeIdTypeModal);

  document.getElementById('editIdTypeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('editIdTypeNombre').value.trim();
    const descripcion = document.getElementById('editIdTypeDescripcion').value.trim();

    if (!nombre) {
      alert('El nombre del documento es obligatorio.');
      return;
    }

    showIdTypeLoading('Guardando cambios...');

    const payload = {
      nombre,
      descripcion: descripcion || null
    };

    try {
      await updateIdentificationType(id, payload);
      hideIdTypeLoading();
      closeIdTypeModal();
      await loadAndRenderIdTypes(currentSearchQuery, currentPage);
    } catch (err) {
      hideIdTypeLoading();
      alert(err.message || 'Error al actualizar el tipo de documento.');
    }
  });
}

function openIdTypeCreateModal() {
  const modal = document.getElementById('idTypeModal');
  const title = document.getElementById('idTypeModalTitle');
  const body = document.getElementById('idTypeModalBody');
  if (!modal || !body) return;

  title.textContent = "Nuevo Tipo de Identificación";
  modal.style.display = 'flex';

  body.innerHTML = `
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
      <div style="width: 44px; height: 44px; border-radius: 12px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
        <i class="fa-solid fa-address-card"></i>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1rem; color: #1e293b;">Nuevo Documento de Identidad</h4>
        <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: #64748b;">Registra un tipo de identificación para los usuarios.</p>
      </div>
    </div>

    <form id="createIdTypeForm" style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nombre del Documento *</label>
        <input type="text" id="createIdTypeNombre" required placeholder="Ej. Cédula de Ciudadanía, Pasaporte" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
      </div>

      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción / Notas</label>
        <textarea id="createIdTypeDescripcion" rows="4" placeholder="Detalles de la validación o uso de este documento..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelCreateIdTypeBtn" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
        <button type="submit" style="padding: 10px 20px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-weight: 600;">Registrar</button>
      </div>
    </form>
  `;

  document.getElementById('cancelCreateIdTypeBtn').addEventListener('click', closeIdTypeModal);

  document.getElementById('createIdTypeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('createIdTypeNombre').value.trim();
    const descripcion = document.getElementById('createIdTypeDescripcion').value.trim();

    if (!nombre) {
      alert('El nombre del documento es obligatorio.');
      return;
    }

    showIdTypeLoading('Registrando tipo de documento...');

    const payload = {
      nombre,
      descripcion: descripcion || null
    };

    try {
      await createIdentificationType(payload);
      hideIdTypeLoading();
      closeIdTypeModal();
      await loadAndRenderIdTypes(currentSearchQuery, currentPage);
    } catch (err) {
      hideIdTypeLoading();
      alert(err.message || 'Error al crear el tipo de documento.');
    }
  });
}

async function handleIdTypeDelete(id) {
  showIdTypeLoading('Eliminando tipo de documento...');
  try {
    await deleteIdentificationType(id);
    hideIdTypeLoading();
    await loadAndRenderIdTypes(currentSearchQuery, currentPage);
  } catch (err) {
    hideIdTypeLoading();
    alert(err.message || 'No se pudo eliminar el tipo de documento.');
  }
}

function renderPaginationControls(total, page) {
  const container = document.getElementById('idTypesPagination');
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
        <button class="idtype-page-btn" data-page="${i}" 
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
      <button id="btnIdTypePrev" ${isFirst ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isFirst ? 'not-allowed' : 'pointer'}; font-size: 0.85rem; color: #475569; opacity: ${isFirst ? '0.4' : '1'};">
        <i class="fa-solid fa-chevron-left"></i> Anterior
      </button>

      <div style="display: flex; gap: 4px; align-items: center;">${pageBtns}</div>

      <button id="btnIdTypeNext" ${isLast ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isLast ? 'not-allowed' : 'pointer'}; font-size: 0.85rem; color: #475569; opacity: ${isLast ? '0.4' : '1'};">
        Siguiente <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;

  const btnPrev = document.getElementById('btnIdTypePrev');
  const btnNext = document.getElementById('btnIdTypeNext');

  if (btnPrev && !isFirst) {
    btnPrev.addEventListener('click', () => loadAndRenderIdTypes(currentSearchQuery, page - 1));
  }
  if (btnNext && !isLast) {
    btnNext.addEventListener('click', () => loadAndRenderIdTypes(currentSearchQuery, page + 1));
  }

  document.querySelectorAll('.idtype-page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetPage = parseInt(e.currentTarget.getAttribute('data-page'), 10);
      if (targetPage !== page) {
        loadAndRenderIdTypes(currentSearchQuery, targetPage);
      }
    });
  });
}

function initSearchListeners() {
  const input = document.getElementById('searchIdTypeName');
  let timer;
  if (input) {
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        currentPage = 0;
        loadAndRenderIdTypes(input.value.trim(), 0);
      }, 400);
    });
  }
}

function initNewIdTypeButtonListener() {
  const btn = document.getElementById('btnNewIdType');
  if (btn) {
    btn.addEventListener('click', openIdTypeCreateModal);
  }
}

function initModalListeners() {
  const modal = document.getElementById('idTypeModal');
  const closeBtn = document.getElementById('closeIdTypeModalBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeIdTypeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeIdTypeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeIdTypeModal();
  });
}

export function closeIdTypeModal() {
  const modal = document.getElementById('idTypeModal');
  if (modal) modal.style.display = 'none';
}

function showIdTypeLoading(message = 'Procesando...') {
  const modal = document.getElementById('loadingIdTypeModal');
  const text = document.getElementById('loadingIdTypeText');
  if (text) text.textContent = message;
  if (modal) modal.style.display = 'flex';
}

function hideIdTypeLoading() {
  const modal = document.getElementById('loadingIdTypeModal');
  if (modal) modal.style.display = 'none';
}