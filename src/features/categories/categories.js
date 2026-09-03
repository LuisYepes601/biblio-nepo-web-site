import {
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
} from '../categories/categories.api.js';

let currentPage = 0;
let totalPages = 1;
let currentSearchQuery = '';
let currentCategories = [];

export async function loadCategoriesView() {
    const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
    if (!container) return;

    container.innerHTML = `
    <div class="view-header">
      <h1>Gestión de Categorías</h1>
      <p>Administra las clasificaciones y géneros literarios registrados en el sistema.</p>
    </div>

    <section class="categories-module-container">
      <div class="categories-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h3>Listado de Categorías</h3>
          <p>Control de taxonomías y organización del catálogo de libros.</p>
        </div>
        <button class="btn-primary" id="btnNewCategory">
          <i class="fa-solid fa-plus"></i> Nueva Categoría
        </button>
      </div>

      <div class="categories-search-bars" style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <input type="text" id="searchCategoryName" placeholder="Buscar categoría por nombre..." 
               style="flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0); outline: none; font-size: 0.875rem;">
      </div>

      <div class="categories-grid" id="categoriesGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
        <p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 20px;">Cargando categorías...</p>
      </div>

      <div id="categoriesPagination"></div>
    </section>

    <!-- Modal General -->
    <div id="categoryModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 28px; border-radius: 16px; width: 100%; max-width: 580px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 id="categoryModalTitle" style="margin: 0; font-size: 1.25rem;">Detalles de la Categoría</h3>
          <button id="closeCategoryModalBtn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="categoryModalBody"></div>
      </div>
    </div>

    <!-- Modal de Carga -->
    <div id="loadingModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1100;">
      <div style="background: white; padding: 24px 36px; border-radius: 12px; display: flex; align-items: center; gap: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; color: #6366f1;"></i>
        <div>
          <h4 id="loadingText" style="margin: 0; font-size: 1rem; color: #1e293b;">Procesando solicitud...</h4>
          <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #64748b;">Por favor, espera un momento.</p>
        </div>
      </div>
    </div>
  `;

    initSearchListeners();
    initModalListeners();
    initNewCategoryButtonListener();

    currentPage = 0;
    currentSearchQuery = '';
    await loadAndRenderCategories();
}

function getPageSizeByDevice() {
    const width = window.innerWidth;
    if (width < 768) return 9;
    if (width < 1024) return 15;
    return 29;
}

async function loadAndRenderCategories(categoryName = currentSearchQuery, page = currentPage) {
    currentSearchQuery = categoryName;
    currentPage = page;
    const pageSize = getPageSizeByDevice();

    const grid = document.getElementById('categoriesGrid');
    if (grid) {
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 20px;">Cargando categorías...</p>`;
    }

    try {
        const response = await fetchCategorias(currentPage, pageSize, currentSearchQuery);

        if (Array.isArray(response)) {
            totalPages = Math.ceil(response.length / pageSize) || 1;
            const start = currentPage * pageSize;
            currentCategories = response.slice(start, start + pageSize);
        } else if (response?.content) {
            currentCategories = response.content;
            totalPages = response.totalPages || 1;
            currentPage = response.number ?? currentPage;
        } else {
            currentCategories = [];
        }

        renderCategories(currentCategories);
        renderPaginationControls(totalPages, currentPage);
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        currentCategories = [];
        renderCategories([]);
        renderPaginationControls(0, 0);
    }
}

function renderCategories(categories) {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    if (!categories || categories.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 20px;">No se encontraron categorías registradas.</p>`;
        return;
    }

    grid.innerHTML = categories.map(cat => {
        const id = cat.id || cat.idCategoria;
        const nombre = cat.nombre || cat.categoria || 'Sin nombre';
        const descripcion = cat.descripcion || 'Sin descripción';

        return `
      <div class="category-card" style="background: white; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 0.7rem; font-weight: 700; color: #4f46e5; background: #e0e7ff; padding: 2px 6px; border-radius: 4px;">#${id}</span>
            <div style="display: flex; gap: 2px;">
              <button class="icon-btn btn-details" data-id="${id}" title="Ver Detalles" style="background: none; border: none; cursor: pointer; color: #6366f1; padding: 2px 4px; font-size: 0.8rem;"><i class="fa-solid fa-eye"></i></button>
              <button class="icon-btn btn-edit" data-id="${id}" title="Editar" style="background: none; border: none; cursor: pointer; color: #475569; padding: 2px 4px; font-size: 0.8rem;"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-btn btn-delete" data-id="${id}" data-nombre="${nombre}" title="Eliminar" style="background: none; border: none; cursor: pointer; color: #ef4444; padding: 2px 4px; font-size: 0.8rem;"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
          <h4 style="margin: 0 0 2px 0; font-size: 0.9rem; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${nombre}">${nombre}</h4>
          <p style="margin: 0; font-size: 0.78rem; color: #64748b; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${descripcion}">${descripcion}</p>
        </div>
      </div>
    `;
    }).join('');

    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const catId = e.currentTarget.getAttribute('data-id');
            openDetailsModal(catId);
        });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const catId = e.currentTarget.getAttribute('data-id');
            openEditModal(catId);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const catId = e.currentTarget.getAttribute('data-id');
            const name = e.currentTarget.getAttribute('data-nombre');
            if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"?`)) {
                await handleDeleteCategory(catId);
            }
        });
    });
}

function openDetailsModal(id) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const bodyContent = document.getElementById('categoryModalBody');
    if (!modal || !bodyContent) return;

    const details = currentCategories.find(c => (c.id || c.idCategoria) == id);

    title.textContent = "Detalles de la Categoría";
    modal.style.display = 'flex';

    if (!details) {
        bodyContent.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontró la categoría seleccionada.</p>`;
        return;
    }

    const nombre = details.nombre || details.categoria || 'Sin nombre';
    const descripcion = details.descripcion || 'Sin descripción registrada.';

    bodyContent.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Identificador</span>
        <h3 style="margin: 4px 0 0 0; color: #1e293b; font-size: 1.1rem;">#${details.id || details.idCategoria || id}</h3>
      </div>

      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Nombre</span>
        <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: 600; font-size: 1rem;">${nombre}</p>
      </div>

      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Descripción</span>
        <p style="margin: 4px 0 0 0; color: #334155; font-size: 0.9rem; line-height: 1.5;">${descripcion}</p>
      </div>
    </div>
  `;
}

function openEditModal(id) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const bodyContent = document.getElementById('categoryModalBody');
    if (!modal || !bodyContent) return;

    const details = currentCategories.find(c => (c.id || c.idCategoria) == id);

    title.textContent = "Editar Categoría";
    modal.style.display = 'flex';

    if (!details) {
        bodyContent.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontró la categoría para editar.</p>`;
        return;
    }

    bodyContent.innerHTML = `
    <form id="editCategoryForm" style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nombre de la Categoría *</label>
        <input type="text" id="editCatNombre" value="${details.nombre || details.categoria || ''}" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
      </div>

      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción (Opcional)</label>
        <textarea id="editCatDescripcion" rows="4" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;">${details.descripcion || ''}</textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelEditCatBtn" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
        <button type="submit" class="btn-primary" style="padding: 10px 20px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-weight: 600;">Guardar Cambios</button>
      </div>
    </form>
  `;

    document.getElementById('cancelEditCatBtn').addEventListener('click', closeCategoryModal);

    document.getElementById('editCategoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('editCatNombre').value.trim();
        const descripcion = document.getElementById('editCatDescripcion').value.trim();

        if (!nombre) {
            alert('El nombre de la categoría es obligatorio.');
            return;
        }

        const loadingModal = document.getElementById('loadingModal');
        const loadingText = document.getElementById('loadingText');
        if (loadingText) loadingText.textContent = "Guardando cambios...";
        if (loadingModal) loadingModal.style.display = 'flex';

        const payload = {
            nombre: nombre,
            descripcion: descripcion || null
        };

        try {
            await updateCategoria(id, payload);
            if (loadingModal) loadingModal.style.display = 'none';
            closeCategoryModal();
            await loadAndRenderCategories(currentSearchQuery, currentPage);
        } catch (err) {
            if (loadingModal) loadingModal.style.display = 'none';
            alert(err.message || 'Hubo un error al actualizar la categoría.');
        }
    });
}

function renderPaginationControls(total, page) {
    const container = document.getElementById('categoriesPagination');
    if (!container) return;

    if (total <= 1) {
        container.innerHTML = '';
        return;
    }

    const isFirstPage = page === 0;
    const isLastPage = page >= total - 1;

    let pageButtonsHTML = '';
    for (let i = 0; i < total; i++) {
        if (i === 0 || i === total - 1 || (i >= page - 1 && i <= page + 1)) {
            const isActive = i === page;
            pageButtonsHTML += `
        <button class="page-num-btn" data-page="${i}" 
                style="padding: 6px 12px; border-radius: 6px; border: 1px solid ${isActive ? '#6366f1' : '#cbd5e1'}; background: ${isActive ? '#6366f1' : 'white'}; color: ${isActive ? 'white' : '#475569'}; cursor: pointer; font-size: 0.85rem; font-weight: ${isActive ? '700' : '500'}; min-width: 34px;">
          ${i + 1}
        </button>
      `;
        } else if (i === page - 2 || i === page + 2) {
            pageButtonsHTML += `<span style="color: #94a3b8; font-size: 0.85rem; padding: 0 2px;">...</span>`;
        }
    }

    container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 18px; padding-top: 14px; border-top: 1px solid #e2e8f0; flex-wrap: wrap;">
      <button id="btnPrevPage" ${isFirstPage ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isFirstPage ? 'not-allowed' : 'pointer'}; font-size: 0.85rem; color: #475569; opacity: ${isFirstPage ? '0.4' : '1'}; font-weight: 500;">
        <i class="fa-solid fa-chevron-left"></i> Anterior
      </button>

      <div style="display: flex; gap: 4px; align-items: center;">
        ${pageButtonsHTML}
      </div>

      <button id="btnNextPage" ${isLastPage ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isLastPage ? 'not-allowed' : 'pointer'}; font-size: 0.85rem; color: #475569; opacity: ${isLastPage ? '0.4' : '1'}; font-weight: 500;">
        Siguiente <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;

    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');

    if (btnPrev && !isFirstPage) {
        btnPrev.addEventListener('click', () => loadAndRenderCategories(currentSearchQuery, page - 1));
    }

    if (btnNext && !isLastPage) {
        btnNext.addEventListener('click', () => loadAndRenderCategories(currentSearchQuery, page + 1));
    }

    document.querySelectorAll('.page-num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetPage = parseInt(e.currentTarget.getAttribute('data-page'), 10);
            if (targetPage !== page) {
                loadAndRenderCategories(currentSearchQuery, targetPage);
            }
        });
    });
}

function initSearchListeners() {
    const searchInput = document.getElementById('searchCategoryName');

    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentPage = 0;
                loadAndRenderCategories(searchInput.value.trim(), 0);
            }, 400);
        });
    }
}

function initNewCategoryButtonListener() {
    const btnNewCategory = document.getElementById('btnNewCategory');
    if (btnNewCategory) {
        btnNewCategory.addEventListener('click', () => {
            openCreateModal();
        });
    }
}

async function openCreateModal() {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const bodyContent = document.getElementById('categoryModalBody');
    if (!modal || !bodyContent) return;

    title.textContent = "Nueva Categoría";
    modal.style.display = 'flex';

    bodyContent.innerHTML = `
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
      <div style="width: 48px; height: 48px; border-radius: 12px; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
        <i class="fa-solid fa-tags"></i>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1.05rem; color: #1e293b;">Registro de Categoría</h4>
        <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: #64748b;">Completa los datos para crear una nueva clasificación de libros.</p>
      </div>
    </div>

    <form id="createCategoryForm" style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nombre de la Categoría *</label>
        <input type="text" id="createCatNombre" required placeholder="Ej. Ciencia Ficción, Historia, Biografía" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
      </div>

      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción (Opcional)</label>
        <textarea id="createCatDescripcion" rows="4" placeholder="Escribe una breve descripción del género o clasificación..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelCreateCatBtn" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
        <button type="submit" class="btn-primary" style="padding: 10px 20px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-weight: 600;">Registrar Categoría</button>
      </div>
    </form>
  `;

    document.getElementById('cancelCreateCatBtn').addEventListener('click', closeCategoryModal);

    document.getElementById('createCategoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('createCatNombre').value.trim();
        const descripcion = document.getElementById('createCatDescripcion').value.trim();

        if (!nombre) {
            alert('El nombre de la categoría es obligatorio.');
            return;
        }

        const loadingModal = document.getElementById('loadingModal');
        const loadingText = document.getElementById('loadingText');
        if (loadingText) loadingText.textContent = "Registrando categoría...";
        if (loadingModal) loadingModal.style.display = 'flex';

        const payload = {
            nombre: nombre,
            descripcion: descripcion || null
        };

        try {
            await createCategoria(payload);
            if (loadingModal) loadingModal.style.display = 'none';
            closeCategoryModal();
            await loadAndRenderCategories(currentSearchQuery, currentPage);
        } catch (err) {
            if (loadingModal) loadingModal.style.display = 'none';
            alert(err.message || 'Ocurrió un error al registrar la categoría.');
        }
    });
}

async function handleDeleteCategory(id) {
    const loadingModal = document.getElementById('loadingModal');
    const loadingText = document.getElementById('loadingText');
    if (loadingText) loadingText.textContent = "Eliminando categoría...";
    if (loadingModal) loadingModal.style.display = 'flex';

    try {
        await deleteCategoria(id);
        if (loadingModal) loadingModal.style.display = 'none';
        await loadAndRenderCategories(currentSearchQuery, currentPage);
    } catch (err) {
        if (loadingModal) loadingModal.style.display = 'none';
        alert(err.message || 'No se pudo eliminar la categoría.');
    }
}

function initModalListeners() {
    const modal = document.getElementById('categoryModal');
    const closeBtn = document.getElementById('closeCategoryModalBtn');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeCategoryModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCategoryModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCategoryModal();
        }
    });
}

export function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.style.display = 'none';
    }
}