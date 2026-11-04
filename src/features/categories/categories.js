import {
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
} from '../categories/categories.api.js';
import { navigateToView, hablarTexto } from '../admin/admin.navigation.js';

let currentPage = 0;
let totalPages = 1;
let currentSearchQuery = '';
let currentCategories = [];

export async function loadCategoriesView() {
    const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
    if (!container) return;

    container.innerHTML = `
    <div class="categories-page-wrapper">
      
      <div class="categories-top-bar" style="margin-bottom: 16px;">
        <button class="btn-back-dashboard" id="btnBackToDashboard" style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; color: #334155; padding: 8px 14px; border-radius: 8px; font-size: 0.825rem; font-weight: 600; cursor: pointer;">
          <i class="fa-solid fa-arrow-left"></i> Regresar al Dashboard
        </button>
      </div>

      <div class="carousel-hero-container" id="categoriesHeroCarousel" style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 28px; border: 1px solid #e2e8f0; background: #0f172a;">
        <div class="carousel-track" id="categoriesCarouselTrack" style="display: flex; transition: transform 0.5s ease-in-out; width: 100%;">
          
          <div class="carousel-slide" style="min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Taxonomía & Clasificación</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Gestión de Categorías</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0;">Organiza los géneros literarios y las clasificaciones del catálogo.</p>
            </div>
          </div>

        </div>
      </div>

      <section class="categories-module-container" style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px;">
        <div class="categories-header module-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #0f172a;">Listado de Categorías</h3>
            <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b;">Control de taxonomías y organización del catálogo.</p>
          </div>
          <button class="btn-primary" id="btn-add-category" style="padding: 9px 16px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-plus"></i> Nueva Categoría
          </button>
        </div>

        <div class="categories-search-bars" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
          <input type="text" id="searchCategoryName" placeholder="Buscar categoría por nombre..." 
                 style="flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.875rem;">
        </div>

        <div id="categoriesTableContainer" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <p style="text-align: center; color: #64748b; padding: 30px; margin: 0; font-size: 0.9rem;">Cargando categorías...</p>
        </div>

        <div id="categoriesPagination"></div>
      </section>

    </div>

    <div id="categoryModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 24px; border-radius: 16px; width: 100%; max-width: 440px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 id="categoryModalTitle" style="margin: 0; font-size: 1.05rem; color: #0f172a; font-weight: 700;">Detalles</h3>
          <button id="closeCategoryModalBtn" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #94a3b8;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="categoryModalBody"></div>
      </div>
    </div>

    <div id="loadingModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); align-items: center; justify-content: center; z-index: 1100;">
      <div style="background: white; padding: 20px 28px; border-radius: 10px; display: flex; align-items: center; gap: 14px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #6366f1;"></i>
        <div>
          <h4 id="loadingText" style="margin: 0; font-size: 0.95rem; color: #0f172a;">Procesando...</h4>
        </div>
      </div>
    </div>
  `;

    const btnBack = document.getElementById('btnBackToDashboard');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            navigateToView('dashboard');
        });
    }

    initSearchListeners();
    initModalListeners();
    initNewCategoryButtonListener();

    currentPage = 0;
    currentSearchQuery = '';
    await loadAndRenderCategories();
}

function getPageSizeByDevice() {
    return 10;
}

async function loadAndRenderCategories(categoryName = currentSearchQuery, page = currentPage) {
    currentSearchQuery = categoryName;
    currentPage = page;
    const pageSize = getPageSizeByDevice();

    const container = document.getElementById('categoriesTableContainer');
    if (container) {
        container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 30px; margin: 0; font-size: 0.9rem;">Cargando categorías...</p>`;
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

        renderCategoriesTable(currentCategories);
        renderPaginationControls(totalPages, currentPage);
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        currentCategories = [];
        renderCategoriesTable([]);
        renderPaginationControls(0, 0);
    }
}

function renderCategoriesTable(categories) {
    const container = document.getElementById('categoriesTableContainer');
    if (!container) return;

    if (!categories || categories.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <p style="margin: 0; font-size: 0.9rem; color: #64748b; font-weight: 500;">No se encontraron categorías registradas.</p>
          </div>
        `;
        return;
    }

    const rows = categories.map(cat => {
        const id = cat.id || cat.idCategoria;
        const rawNombre = cat.nombre || cat.categoria || 'Sin nombre';
        const nombre = rawNombre.trim();
        const rawDesc = cat.descripcion || '';
        const hasDesc = rawDesc && rawDesc.trim() !== '' && rawDesc.trim().toLowerCase() !== 'sin descripción';
        const descripcion = hasDesc ? rawDesc : 'Sin descripción asignada.';

        const nombreBuscable = nombre.toLowerCase();

        return `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 14px 20px; font-weight: 600; color: #0f172a; text-transform: capitalize; width: 35%;">
              ${nombreBuscable}
            </td>
            <td style="padding: 14px 20px; color: ${hasDesc ? '#475569' : '#94a3b8'}; line-height: 1.4; width: 50%;">
              ${descripcion}
            </td>
            <td style="padding: 14px 20px; text-align: right; width: 15%;">
              <div style="display: inline-flex; gap: 4px; align-items: center;">
                <button class="icon-btn btn-details" data-id="${id}" data-nombre="${nombreBuscable}" title="Ver Detalles" style="background: transparent; border: 1px solid #e2e8f0; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; color: #6366f1;">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button class="icon-btn btn-edit" data-id="${id}" data-nombre="${nombreBuscable}" title="Editar" style="background: transparent; border: 1px solid #e2e8f0; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; color: #475569;">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="icon-btn btn-delete" data-id="${id}" data-nombre="${nombreBuscable}" title="Eliminar" style="background: transparent; border: 1px solid #e2e8f0; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; color: #ef4444;">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
    }).join('');

    container.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600; font-size: 0.75rem; text-transform: uppercase;">
              <th style="padding: 12px 20px;">Categoría</th>
              <th style="padding: 12px 20px;">Descripción</th>
              <th style="padding: 12px 20px; text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', (e) => openDetailsModal(e.currentTarget.getAttribute('data-id')));
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => openEditModal(e.currentTarget.getAttribute('data-id')));
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => openDeleteModal(e.currentTarget.getAttribute('data-id'), e.currentTarget.getAttribute('data-nombre')));
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
        bodyContent.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontró la categoría.</p>`;
        return;
    }

    const nombre = details.nombre || details.categoria || 'Sin nombre';
    const descripcion = details.descripcion || 'Sin descripción registrada.';

    hablarTexto(`Categoría ${nombre}. Descripción: ${descripcion}`);

    bodyContent.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.85rem;">
      <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block;">Nombre</span>
        <span style="color: #0f172a; font-weight: 600;">${nombre}</span>
      </div>
      <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block;">Descripción</span>
        <p style="margin: 4px 0 0 0; color: #334155;">${descripcion}</p>
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

    if (!details) return;

    const nombreActual = details.nombre || details.categoria || '';

    bodyContent.innerHTML = `
    <form id="editCategoryForm" class="form-container" style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nombre *</label>
        <input type="text" id="editCatNombre" value="${nombreActual}" required style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
      </div>
      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Descripción (Opcional)</label>
        <textarea id="editCatDescripcion" rows="3" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">${details.descripcion || ''}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button type="button" id="cancelEditCatBtn" class="btn-secondary" style="padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white;">Cancelar</button>
        <button type="submit" id="btnSubmitEditCat" class="btn-success" style="padding: 8px 16px; border-radius: 6px; border: none; background: #6366f1; color: white; font-weight: 600;">Guardar</button>
      </div>
    </form>
  `;

    const inputNombre = document.getElementById('editCatNombre');
    setTimeout(() => { if (inputNombre) inputNombre.focus(); }, 150);

    hablarTexto(`Editando categoría ${nombreActual}.`);

    document.getElementById('cancelEditCatBtn').addEventListener('click', closeCategoryModal);

    document.getElementById('editCategoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('editCatNombre').value.trim();
        const descripcion = document.getElementById('editCatDescripcion').value.trim();

        if (!nombre) {
            hablarTexto('El nombre es obligatorio.');
            return;
        }

        const loadingModal = document.getElementById('loadingModal');
        if (loadingModal) loadingModal.style.display = 'flex';

        try {
            await updateCategoria(id, { nombre: nombre, descripcion: descripcion || null });
            if (loadingModal) loadingModal.style.display = 'none';
            closeCategoryModal();
            hablarTexto(`Categoría ${nombre} actualizada.`);
            await loadAndRenderCategories(currentSearchQuery, currentPage);
        } catch (err) {
            if (loadingModal) loadingModal.style.display = 'none';
            alert(err.message || 'Error al actualizar.');
        }
    });
}

function openDeleteModal(id, name) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const bodyContent = document.getElementById('categoryModalBody');
    if (!modal || !bodyContent) return;

    title.textContent = "Confirmar eliminación";
    modal.style.display = 'flex';

    hablarTexto(`¿Estás seguro de eliminar la categoría ${name}?`);

    bodyContent.innerHTML = `
    <div style="text-align: center; padding: 8px;">
      <h4 style="margin: 0 0 8px 0; font-size: 1.1rem; color: #0f172a;">¿Eliminar esta categoría?</h4>
      <p style="margin: 0 0 20px 0; font-size: 0.85rem; color: #64748b;">Estás a punto de eliminar "${name}".</p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button type="button" id="cancelDeleteCatBtn" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; color: #475569; font-weight: 600;">Cancelar</button>
        <button type="button" id="confirmDeleteCatBtn" style="flex: 1; padding: 10px; border-radius: 8px; border: none; background: #ef4444; color: white; font-weight: 600;">Sí, eliminar</button>
      </div>
    </div>
  `;

    document.getElementById('cancelDeleteCatBtn').addEventListener('click', closeCategoryModal);
    document.getElementById('confirmDeleteCatBtn').addEventListener('click', async () => {
        closeCategoryModal();
        await handleDeleteCategory(id);
    });
}

function renderPaginationControls(total, page) {
    const container = document.getElementById('categoriesPagination');
    if (!container || total <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    const isFirstPage = page === 0;
    const isLastPage = page >= total - 1;

    container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <button id="btnPrevPage" ${isFirstPage ? 'disabled' : ''} style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; opacity: ${isFirstPage ? '0.4' : '1'};">Anterior</button>
      <span style="font-size: 0.85rem; color: #475569; font-weight: 600;">Página ${page + 1} de ${total}</span>
      <button id="btnNextPage" ${isLastPage ? 'disabled' : ''} style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; opacity: ${isLastPage ? '0.4' : '1'};">Siguiente</button>
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
            }, 500);
        });
    }
}

function initNewCategoryButtonListener() {
    const btnNewCategory = document.getElementById('btn-add-category');
    if (btnNewCategory) {
        btnNewCategory.addEventListener('click', () => openCreateModal());
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
    <form id="createCategoryForm" class="form-container" style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nombre *</label>
        <input type="text" id="createCatNombre" required placeholder="Ej. Ciencia Ficción" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
      </div>
      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Descripción (Opcional)</label>
        <textarea id="createCatDescripcion" rows="3" placeholder="Descripción breve..." style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;"></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button type="button" id="cancelCreateCatBtn" class="btn-secondary" style="padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white;">Cancelar</button>
        <button type="submit" id="btnSubmitCreateCat" class="btn-success" style="padding: 8px 16px; border-radius: 6px; border: none; background: #6366f1; color: white; font-weight: 600;">Guardar</button>
      </div>
    </form>
  `;

    const inputNombre = document.getElementById('createCatNombre');
    setTimeout(() => { if (inputNombre) inputNombre.focus(); }, 150);

    hablarTexto("Modal de nueva categoría abierto.");

    document.getElementById('cancelCreateCatBtn').addEventListener('click', closeCategoryModal);

    document.getElementById('createCategoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('createCatNombre').value.trim();
        const descripcion = document.getElementById('createCatDescripcion').value.trim();

        if (!nombre) {
            hablarTexto('El nombre es obligatorio.');
            return;
        }

        const loadingModal = document.getElementById('loadingModal');
        if (loadingModal) loadingModal.style.display = 'flex';

        try {
            await createCategoria({ nombre: nombre, descripcion: descripcion || null });
            if (loadingModal) loadingModal.style.display = 'none';
            closeCategoryModal();
            hablarTexto(`Categoría ${nombre} guardada.`);
            await loadAndRenderCategories(currentSearchQuery, currentPage);
        } catch (err) {
            if (loadingModal) loadingModal.style.display = 'none';
            alert(err.message || 'Error al registrar.');
        }
    });
}

async function handleDeleteCategory(id) {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) loadingModal.style.display = 'flex';

    try {
        await deleteCategoria(id);
        if (loadingModal) loadingModal.style.display = 'none';
        hablarTexto('Categoría eliminada.');
        await loadAndRenderCategories(currentSearchQuery, currentPage);
    } catch (err) {
        if (loadingModal) loadingModal.style.display = 'none';
        alert(err.message || 'No se pudo eliminar.');
    }
}

function initModalListeners() {
    const modal = document.getElementById('categoryModal');
    const closeBtn = document.getElementById('closeCategoryModalBtn');

    if (closeBtn) closeBtn.addEventListener('click', closeCategoryModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeCategoryModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCategoryModal();
    });
}

export function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal && modal.style.display !== 'none') {
        modal.style.display = 'none';
        hablarTexto('Operación cancelada.');
    }
}