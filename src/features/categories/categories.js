import {
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
} from '../categories/categories.api.js';
import { navigateToView } from '../admin/admin.navigation.js';

let currentPage = 0;
let totalPages = 1;
let currentSearchQuery = '';
let currentCategories = [];

export async function loadCategoriesView() {
    const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
    if (!container) return;

    container.innerHTML = `
    <div class="categories-page-wrapper">
      
      <!-- BARRA SUPERIOR CON BOTÓN REGRESAR -->
      <div class="categories-top-bar" style="margin-bottom: 16px;">
        <button class="btn-back-dashboard" id="btnBackToDashboard" style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; color: #334155; padding: 8px 14px; border-radius: 8px; font-size: 0.825rem; font-weight: 600; cursor: pointer; transition: background 0.15s, border-color 0.15s;">
          <i class="fa-solid fa-arrow-left"></i> Regresar al Dashboard
        </button>
      </div>

      <!-- CARRUSEL HERO AUTOMÁTICO -->
      <div class="carousel-hero-container" id="categoriesHeroCarousel" style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 28px; border: 1px solid #e2e8f0; background: #0f172a;">
        <div class="carousel-track" id="categoriesCarouselTrack" style="display: flex; transition: transform 0.5s ease-in-out; width: 100%;">
          
          <div class="carousel-slide" style="min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Taxonomía & Clasificación</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Gestión de Categorías</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Organiza los géneros literarios y las clasificaciones del catálogo de la biblioteca.</p>
            </div>
          </div>

          <div class="carousel-slide" style="min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Catálogo Estructurado</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Exploración Ágil</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Permite a los usuarios descubrir lecturas filtrando por categorías bien definidas.</p>
            </div>
          </div>

        </div>

        <div class="carousel-controls" style="position: absolute; bottom: 16px; right: 20px; z-index: 3; display: flex; align-items: center; gap: 8px;">
          <div class="carousel-dots" style="display: flex; gap: 6px; margin-right: 6px;">
            <span class="carousel-dot active" style="width: 20px; height: 7px; border-radius: 10px; background: #ffffff; cursor: pointer;"></span>
            <span class="carousel-dot" style="width: 7px; height: 7px; border-radius: 50%; background: rgba(255, 255, 255, 0.4); cursor: pointer;"></span>
          </div>
          <button class="carousel-arrow" id="categoriesPrevBtn" title="Anterior" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="carousel-arrow" id="categoriesNextBtn" title="Siguiente" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>

      <!-- MÓDULO PRINCIPAL DE CATEGORÍAS -->
      <section class="categories-module-container" style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px;">
        <div class="categories-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a;">Listado de Categorías</h3>
            <p style="margin: 2px 0 0 0; font-size: 0.825rem; color: #64748b;">Control de taxonomías y organización del catálogo.</p>
          </div>
          <button class="btn-primary" id="btnNewCategory" style="padding: 9px 16px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-plus"></i> Nueva Categoría
          </button>
        </div>

        <div class="categories-search-bars" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
          <input type="text" id="searchCategoryName" placeholder="Buscar categoría por nombre..." 
                 style="flex: 1; min-width: 220px; padding: 9px 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.85rem; color: #0f172a; background: #ffffff;">
        </div>

        <div class="categories-grid" id="categoriesGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
          <p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">Cargando categorías...</p>
        </div>

        <div id="categoriesPagination"></div>
      </section>

    </div>

    <!-- Modal General -->
    <div id="categoryModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 24px; border-radius: 12px; width: 100%; max-width: 520px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 id="categoryModalTitle" style="margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">Detalles de la Categoría</h3>
          <button id="closeCategoryModalBtn" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="categoryModalBody"></div>
      </div>
    </div>

    <!-- Modal de Carga -->
    <div id="loadingModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); align-items: center; justify-content: center; z-index: 1100;">
      <div style="background: white; padding: 20px 28px; border-radius: 10px; display: flex; align-items: center; gap: 14px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #6366f1;"></i>
        <div>
          <h4 id="loadingText" style="margin: 0; font-size: 0.95rem; color: #0f172a;">Procesando solicitud...</h4>
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

    // Inicializar carrusel hero
    initCategoriesCarousel();

    initSearchListeners();
    initModalListeners();
    initNewCategoryButtonListener();

    currentPage = 0;
    currentSearchQuery = '';
    await loadAndRenderCategories();
}

/**
 * Control automático de movimiento continuo para el carrusel de Categorías
 */
function initCategoriesCarousel() {
    const track = document.getElementById('categoriesCarouselTrack');
    const slides = track ? track.querySelectorAll('.carousel-slide') : [];
    const dots = document.querySelectorAll('#categoriesHeroCarousel .carousel-dot');
    const prevBtn = document.getElementById('categoriesPrevBtn');
    const nextBtn = document.getElementById('categoriesNextBtn');
    const container = document.getElementById('categoriesHeroCarousel');

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
    if (width < 768) return 9;
    if (width < 1024) return 15;
    return 20;
}

async function loadAndRenderCategories(categoryName = currentSearchQuery, page = currentPage) {
    currentSearchQuery = categoryName;
    currentPage = page;
    const pageSize = getPageSizeByDevice();

    const grid = document.getElementById('categoriesGrid');
    if (grid) {
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">Cargando categorías...</p>`;
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
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">No se encontraron categorías registradas.</p>`;
        return;
    }

    grid.innerHTML = categories.map(cat => {
        const id = cat.id || cat.idCategoria;
        const nombre = cat.nombre || cat.categoria || 'Sin nombre';
        const descripcion = cat.descripcion || 'Sin descripción';

        return `
      <div class="category-card" style="background: white; border-radius: 10px; border: 1px solid #e2e8f0; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.725rem; font-weight: 700; color: #6366f1; background: #eef2ff; padding: 3px 8px; border-radius: 6px;">#${id}</span>
            <div style="display: flex; gap: 4px;">
              <button class="icon-btn btn-details" data-id="${id}" title="Ver Detalles" style="background: none; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #6366f1; padding: 4px 6px; font-size: 0.78rem;"><i class="fa-solid fa-eye"></i></button>
              <button class="icon-btn btn-edit" data-id="${id}" title="Editar" style="background: none; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #475569; padding: 4px 6px; font-size: 0.78rem;"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-btn btn-delete" data-id="${id}" data-nombre="${nombre}" title="Eliminar" style="background: none; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #ef4444; padding: 4px 6px; font-size: 0.78rem;"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 0.925rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${nombre}">${nombre}</h4>
          <p style="margin: 0; font-size: 0.785rem; color: #64748b; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${descripcion}">${descripcion}</p>
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
    <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.85rem;">
      <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Identificador</span>
        <span style="color: #0f172a; font-weight: 600;">#${details.id || details.idCategoria || id}</span>
      </div>

      <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Nombre</span>
        <span style="color: #0f172a; font-weight: 600;">${nombre}</span>
      </div>

      <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Descripción</span>
        <p style="margin: 4px 0 0 0; color: #334155; line-height: 1.45;">${descripcion}</p>
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
    <form id="editCategoryForm" style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nombre de la Categoría *</label>
        <input type="text" id="editCatNombre" value="${details.nombre || details.categoria || ''}" required style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
      </div>

      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Descripción</label>
        <textarea id="editCatDescripcion" rows="3" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; resize: vertical;">${details.descripcion || ''}</textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
        <button type="button" id="cancelEditCatBtn" style="padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem;">Cancelar</button>
        <button type="submit" style="padding: 8px 16px; border-radius: 6px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600;">Guardar Cambios</button>
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
        if (loadingText) loadingText.textContent = "Guardando...";
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
                style="padding: 6px 10px; border-radius: 6px; border: 1px solid ${isActive ? '#6366f1' : '#cbd5e1'}; background: ${isActive ? '#6366f1' : 'white'}; color: ${isActive ? 'white' : '#475569'}; cursor: pointer; font-size: 0.8rem; font-weight: ${isActive ? '700' : '500'}; min-width: 32px;">
          ${i + 1}
        </button>
      `;
        } else if (i === page - 2 || i === page + 2) {
            pageButtonsHTML += `<span style="color: #94a3b8; font-size: 0.8rem; padding: 0 2px;">...</span>`;
        }
    }

    container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0; flex-wrap: wrap;">
      <button id="btnPrevPage" ${isFirstPage ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isFirstPage ? 'not-allowed' : 'pointer'}; font-size: 0.8rem; color: #475569; opacity: ${isFirstPage ? '0.4' : '1'}; font-weight: 500;">
        <i class="fa-solid fa-chevron-left"></i> Anterior
      </button>

      <div style="display: flex; gap: 4px; align-items: center;">
        ${pageButtonsHTML}
      </div>

      <button id="btnNextPage" ${isLastPage ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isLastPage ? 'not-allowed' : 'pointer'}; font-size: 0.8rem; color: #475569; opacity: ${isLastPage ? '0.4' : '1'}; font-weight: 500;">
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
    <form id="createCategoryForm" style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nombre de la Categoría *</label>
        <input type="text" id="createCatNombre" required placeholder="Ej. Ciencia Ficción, Historia" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
      </div>

      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Descripción</label>
        <textarea id="createCatDescripcion" rows="3" placeholder="Descripción breve..." style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
        <button type="button" id="cancelCreateCatBtn" style="padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem;">Cancelar</button>
        <button type="submit" style="padding: 8px 16px; border-radius: 6px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600;">Guardar</button>
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
        if (loadingText) loadingText.textContent = "Guardando...";
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
    if (loadingText) loadingText.textContent = "Eliminando...";
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