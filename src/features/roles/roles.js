import { 
  fetchRoles, 
  createRole, 
  updateRole, 
  deleteRole,
  fetchRoleById
} from './roles.api.js';
import { navigateToView } from '../admin/admin.navigation.js';

let currentPage = 0;
let totalPages = 1;
let currentSearchQuery = '';
let currentRoles = [];

export async function loadRolesView() {
  const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="roles-page-wrapper">
      
      <!-- BARRA SUPERIOR CON BOTÓN REGRESAR -->
      <div class="roles-top-bar" style="margin-bottom: 16px;">
        <button class="btn-back-dashboard" id="btnBackToDashboard" style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; color: #334155; padding: 8px 14px; border-radius: 8px; font-size: 0.825rem; font-weight: 600; cursor: pointer; transition: background 0.15s, border-color 0.15s;">
          <i class="fa-solid fa-arrow-left"></i> Regresar al Dashboard
        </button>
      </div>

      <!-- CARRUSEL HERO AUTOMÁTICO -->
      <div class="carousel-hero-container" id="rolesHeroCarousel" style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 28px; border: 1px solid #e2e8f0; background: #0f172a;">
        <div class="carousel-track" id="rolesCarouselTrack" style="display: flex; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); width: 100%;">
          
          <div class="carousel-slide" style="flex: 0 0 100%; min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Seguridad & Accesos</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Gestión de Roles</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Administra los niveles de acceso y privilegios de los usuarios del sistema.</p>
            </div>
          </div>

          <div class="carousel-slide" style="flex: 0 0 100%; min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Privilegios & Permisos</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Estructura Institucional</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Asigna responsabilidades para mantener la integridad y orden en la plataforma.</p>
            </div>
          </div>

        </div>

        <div class="carousel-controls" style="position: absolute; bottom: 16px; right: 20px; z-index: 3; display: flex; align-items: center; gap: 8px;">
          <div class="carousel-dots" style="display: flex; gap: 6px; margin-right: 6px;">
            <span class="carousel-dot active" style="width: 20px; height: 7px; border-radius: 10px; background: #ffffff; cursor: pointer;"></span>
            <span class="carousel-dot" style="width: 7px; height: 7px; border-radius: 50%; background: rgba(255, 255, 255, 0.4); cursor: pointer;"></span>
          </div>
          <button class="carousel-arrow" id="rolesPrevBtn" title="Anterior" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="carousel-arrow" id="rolesNextBtn" title="Siguiente" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>

      <!-- MÓDULO DE ROLES -->
      <section class="roles-module-container" style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px;">
        <div class="roles-header module-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #0f172a;">Listado de Roles</h3>
            <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b;">Definición de roles asignables en la plataforma.</p>
          </div>
          <button class="btn-primary" id="btn-add-role" style="padding: 9px 16px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-plus"></i> Nuevo Rol
          </button>
        </div>

        <div class="roles-search-bars" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
          <input type="text" id="searchRoleName" placeholder="Buscar rol por nombre..." 
                 style="flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.875rem; color: #0f172a; background: #ffffff;">
        </div>

        <!-- TABLA / GRILLA DE DATOS -->
        <div id="rolesTableContainer" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15,23,42,0.03);">
          <p style="text-align: center; color: #64748b; padding: 30px; margin: 0; font-size: 0.9rem;">Cargando roles...</p>
        </div>

        <div id="rolesPagination"></div>
      </section>

    </div>

    <!-- Modal General para Crear / Editar / Detalles -->
    <div id="roleModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 24px; border-radius: 12px; width: 100%; max-width: 520px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 id="roleModalTitle" style="margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">Detalles del Rol</h3>
          <button id="closeRoleModalBtn" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="roleModalBody"></div>
      </div>
    </div>

    <!-- Modal de Carga Status -->
    <div id="loadingRoleModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); align-items: center; justify-content: center; z-index: 1100;">
      <div style="background: white; padding: 20px 28px; border-radius: 10px; display: flex; align-items: center; gap: 14px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #6366f1;"></i>
        <div>
          <h4 id="loadingRoleText" style="margin: 0; font-size: 0.95rem; color: #0f172a;">Procesando solicitud...</h4>
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
  initRolesCarousel();

  initSearchListeners();
  initModalListeners();
  initNewRoleButtonListener();

  currentPage = 0;
  currentSearchQuery = '';
  await loadAndRenderRoles();
}

/**
 * Control automático de movimiento continuo para el carrusel de Roles
 */
function initRolesCarousel() {
  const track = document.getElementById('rolesCarouselTrack');
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];
  const dots = document.querySelectorAll('#rolesHeroCarousel .carousel-dot');
  const prevBtn = document.getElementById('rolesPrevBtn');
  const nextBtn = document.getElementById('rolesNextBtn');
  const container = document.getElementById('rolesHeroCarousel');

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
  return 10;
}

async function loadAndRenderRoles(query = currentSearchQuery, page = currentPage) {
  currentSearchQuery = query;
  currentPage = page;
  const pageSize = getPageSizeByDevice();

  const container = document.getElementById('rolesTableContainer');
  if (container) {
    container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 30px; margin: 0; font-size: 0.9rem;">Cargando roles...</p>`;
  }

  try {
    const response = await fetchRoles(currentPage, pageSize, currentSearchQuery);

    if (Array.isArray(response)) {
      totalPages = Math.ceil(response.length / pageSize) || 1;
      const start = currentPage * pageSize;
      currentRoles = response.slice(start, start + pageSize);
    } else if (response?.content) {
      currentRoles = response.content;
      totalPages = response.totalPages || 1;
      currentPage = response.number ?? currentPage;
    } else {
      currentRoles = [];
    }

    renderRolesTable(currentRoles);
    renderPaginationControls(totalPages, currentPage);
  } catch (error) {
    console.error('Error al cargar la lista de roles:', error);
    currentRoles = [];
    renderRolesTable([]);
    renderPaginationControls(0, 0);
  }
}

/* RENDERIZADO EN TABLA/GRILLA MINIMALISTA SIN MOSTRAR IDS */
function renderRolesTable(roles) {
  const container = document.getElementById('rolesTableContainer');
  if (!container) return;

  if (!roles || roles.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <p style="margin: 0; font-size: 0.9rem; color: #64748b; font-weight: 500;">No se encontraron roles registrados.</p>
      </div>
    `;
    return;
  }

  const rows = roles.map(role => {
    const id = role.id || role.idRol || role.roleId;
    const rawNombre = role.nombre || role.name || role.nombreRol || 'ROLE_USER';
    const nombre = rawNombre.trim();
    const rawDesc = role.descripcion || role.description || '';
    const hasDesc = rawDesc && rawDesc.trim() !== '' && rawDesc.trim().toLowerCase() !== 'sin descripción asignada.';
    const descripcion = hasDesc ? rawDesc : 'Sin descripción asignada.';

    const nombreBuscable = nombre.toLowerCase();

    let badgeBg = '#e0e7ff';
    let badgeColor = '#4f46e5';
    if (nombre.toUpperCase().includes('ADMIN')) {
      badgeBg = '#fee2e2';
      badgeColor = '#dc2626';
    } else if (nombre.toUpperCase().includes('BIBLIO') || nombre.toUpperCase().includes('STAFF')) {
      badgeBg = '#fef3c7';
      badgeColor = '#d97706';
    }

    return `
      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
        <td style="padding: 14px 20px; font-weight: 600; width: 35%;">
          <span style="font-size: 0.725rem; font-weight: 700; color: ${badgeColor}; background: ${badgeBg}; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">
            ${nombre}
          </span>
        </td>
        <td style="padding: 14px 20px; color: ${hasDesc ? '#475569' : '#94a3b8'}; font-style: ${hasDesc ? 'normal' : 'italic'}; line-height: 1.4; width: 50%;">
          ${descripcion}
        </td>
        <td style="padding: 14px 20px; text-align: right; width: 15%;">
          <div style="display: inline-flex; gap: 4px; align-items: center;">
            <button class="icon-btn btn-role-details btn-details" data-id="${id}" data-nombre="${nombreBuscable}" title="Ver Auditoría" style="
              background: transparent; 
              border: 1px solid #e2e8f0; 
              width: 30px; 
              height: 30px; 
              border-radius: 6px; 
              cursor: pointer; 
              color: #6366f1; 
              display: inline-flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 0.8rem; 
              transition: background 0.15s ease;
            " onmouseover="this.style.background='#eef2ff'" onmouseout="this.style.background='transparent'">
              <i class="fa-solid fa-eye"></i>
            </button>

            <button class="icon-btn btn-role-edit btn-edit" data-id="${id}" data-nombre="${nombreBuscable}" title="Editar" style="
              background: transparent; 
              border: 1px solid #e2e8f0; 
              width: 30px; 
              height: 30px; 
              border-radius: 6px; 
              cursor: pointer; 
              color: #475569; 
              display: inline-flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 0.8rem; 
              transition: background 0.15s ease;
            " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="icon-btn btn-role-delete btn-delete" data-id="${id}" data-nombre="${nombreBuscable}" title="Eliminar" style="
              background: transparent; 
              border: 1px solid #e2e8f0; 
              width: 30px; 
              height: 30px; 
              border-radius: 6px; 
              cursor: pointer; 
              color: #ef4444; 
              display: inline-flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 0.8rem; 
              transition: background 0.15s ease;
            " onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='transparent'">
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
          <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
            <th style="padding: 12px 20px;">Rol</th>
            <th style="padding: 12px 20px;">Descripción</th>
            <th style="padding: 12px 20px; text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;

  document.querySelectorAll('.btn-role-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openRoleDetailsModal(id);
    });
  });

  document.querySelectorAll('.btn-role-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openRoleEditModal(id);
    });
  });

  document.querySelectorAll('.btn-role-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-nombre');
      if (confirm(`¿Estás seguro de eliminar el rol "${name}"?`)) {
        await handleRoleDelete(id);
      }
    });
  });
}

async function openRoleDetailsModal(id) {
  const modal = document.getElementById('roleModal');
  const title = document.getElementById('roleModalTitle');
  const body = document.getElementById('roleModalBody');
  if (!modal || !body) return;

  title.textContent = "Auditoría del Rol";
  modal.style.display = 'flex';

  body.innerHTML = `
    <div style="text-align: center; padding: 24px; color: #64748b;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #6366f1; margin-bottom: 8px;"></i>
      <p style="margin: 0; font-size: 0.85rem;">Cargando información...</p>
    </div>
  `;

  try {
    const role = await fetchRoleById(id);

    if (!role) {
      body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontraron datos.</p>`;
      return;
    }

    const creatorName = role.creatorName || 'N/A';
    const updateName = role.updateName || 'N/A';
    const deleteName = role.deleteName || 'N/A';
    const deleteAt = role.deleteAt ? new Date(role.deleteAt).toLocaleString() : 'N/A';
    const isDelete = role.isDelete ?? false;

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
            <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Creado por</span>
            <span style="color: #0f172a; font-weight: 600;">${creatorName}</span>
          </div>
          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Modificado por</span>
            <span style="color: #0f172a; font-weight: 600;">${updateName}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Eliminado por</span>
            <span style="color: #0f172a; font-weight: 600;">${deleteName}</span>
          </div>
          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">Fecha Eliminación</span>
            <span style="color: #0f172a; font-weight: 600;">${deleteAt}</span>
          </div>
        </div>

      </div>
    `;
  } catch (error) {
    console.error("Error al consultar auditoría del rol:", error);
    body.innerHTML = `
      <div style="text-align: center; padding: 16px; color: #ef4444;">
        <p style="margin: 0; font-size: 0.85rem;">No se pudo consultar la información.</p>
      </div>
    `;
  }
}

function openRoleEditModal(id) {
  const modal = document.getElementById('roleModal');
  const title = document.getElementById('roleModalTitle');
  const body = document.getElementById('roleModalBody');
  if (!modal || !body) return;

  const role = currentRoles.find(r => (r.id || r.idRol || r.roleId) == id);

  title.textContent = "Editar Rol";
  modal.style.display = 'flex';

  if (!role) {
    body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se encontró el elemento.</p>`;
    return;
  }

  const nombreVal = role.nombre || role.name || role.nombreRol || '';
  const descVal = role.descripcion || role.description || '';

  body.innerHTML = `
    <form id="editRoleForm" class="form-container" style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nombre del Rol *</label>
        <input type="text" id="editRoleNombre" value="${nombreVal}" required style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
      </div>

      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Descripción</label>
        <textarea id="editRoleDescripcion" rows="3" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; resize: vertical;">${descVal}</textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
        <button type="button" id="cancelEditRoleBtn" class="btn-secondary" style="padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem;">Cancelar</button>
        <button type="submit" class="btn-success" style="padding: 8px 16px; border-radius: 6px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600;">Guardar Cambios</button>
      </div>
    </form>
  `;

  setTimeout(() => {
    const input = document.getElementById('editRoleNombre');
    if (input) input.focus();
  }, 100);

  document.getElementById('cancelEditRoleBtn').addEventListener('click', closeRoleModal);

  document.getElementById('editRoleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('editRoleNombre').value.trim();
    const descripcion = document.getElementById('editRoleDescripcion').value.trim();

    if (!nombre) {
      alert('El nombre es obligatorio.');
      return;
    }

    showRoleLoading('Guardando...');

    const payload = {
      nombre: nombre,
      descripcion: descripcion || null
    };

    try {
      await updateRole(id, payload);
      hideRoleLoading();
      closeRoleModal();
      await loadAndRenderRoles(currentSearchQuery, currentPage);
    } catch (err) {
      hideRoleLoading();
      alert(err.message || 'Error al actualizar.');
    }
  });
}

function openRoleCreateModal() {
  const modal = document.getElementById('roleModal');
  const title = document.getElementById('roleModalTitle');
  const body = document.getElementById('roleModalBody');
  if (!modal || !body) return;

  title.textContent = "Crear Nuevo Rol";
  modal.style.display = 'flex';

  body.innerHTML = `
    <form id="createRoleForm" class="form-container" style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nombre del Rol *</label>
        <input type="text" id="createRoleNombre" required placeholder="Ej. ROLE_BIBLIOTECARIO" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
      </div>

      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Descripción</label>
        <textarea id="createRoleDescripcion" rows="3" placeholder="Descripción de los privilegios o alcance..." style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
        <button type="button" id="cancelCreateRoleBtn" class="btn-secondary" style="padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem;">Cancelar</button>
        <button type="submit" class="btn-success" style="padding: 8px 16px; border-radius: 6px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600;">Guardar</button>
      </div>
    </form>
  `;

  setTimeout(() => {
    const input = document.getElementById('createRoleNombre');
    if (input) input.focus();
  }, 100);

  document.getElementById('cancelCreateRoleBtn').addEventListener('click', closeRoleModal);

  document.getElementById('createRoleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('createRoleNombre').value.trim();
    const descripcion = document.getElementById('createRoleDescripcion').value.trim();

    if (!nombre) {
      alert('El nombre es obligatorio.');
      return;
    }

    showRoleLoading('Guardando...');

    const payload = {
      nombre: nombre,
      descripcion: descripcion || null
    };

    try {
      await createRole(payload);
      hideRoleLoading();
      closeRoleModal();
      await loadAndRenderRoles(currentSearchQuery, currentPage);
    } catch (err) {
      hideRoleLoading();
      alert(err.message || 'Error al guardar.');
    }
  });
}

async function handleRoleDelete(id) {
  showRoleLoading('Eliminando...');
  try {
    await deleteRole(id);
    hideRoleLoading();
    await loadAndRenderRoles(currentSearchQuery, currentPage);
  } catch (err) {
    hideRoleLoading();
    alert(err.message || 'No se pudo eliminar.');
  }
}

function renderPaginationControls(total, page) {
  const container = document.getElementById('rolesPagination');
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
        <button class="role-page-btn" data-page="${i}" 
                style="padding: 6px 10px; border-radius: 6px; border: 1px solid ${active ? '#6366f1' : '#cbd5e1'}; background: ${active ? '#6366f1' : 'white'}; color: ${active ? 'white' : '#475569'}; cursor: pointer; font-size: 0.8rem; font-weight: ${active ? '700' : '500'}; min-width: 32px;">
          ${i + 1}
        </button>
      `;
    } else if (i === page - 2 || i === page + 2) {
      pageBtns += `<span style="color: #94a3b8; font-size: 0.8rem;">...</span>`;
    }
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; flex-wrap: wrap;">
      <button id="btnRolePrev" ${isFirst ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isFirst ? 'not-allowed' : 'pointer'}; font-size: 0.8rem; color: #475569; opacity: ${isFirst ? '0.4' : '1'}; font-weight: 500;">
        <i class="fa-solid fa-chevron-left"></i> Anterior
      </button>

      <div style="display: flex; gap: 4px; align-items: center;">${pageBtns}</div>

      <button id="btnRoleNext" ${isLast ? 'disabled' : ''} 
              style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: ${isLast ? 'not-allowed' : 'pointer'}; font-size: 0.8rem; color: #475569; opacity: ${isLast ? '0.4' : '1'}; font-weight: 500;">
        Siguiente <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;

  const btnPrev = document.getElementById('btnRolePrev');
  const btnNext = document.getElementById('btnRoleNext');

  if (btnPrev && !isFirst) {
    btnPrev.addEventListener('click', () => loadAndRenderRoles(currentSearchQuery, page - 1));
  }
  if (btnNext && !isLast) {
    btnNext.addEventListener('click', () => loadAndRenderRoles(currentSearchQuery, page + 1));
  }

  document.querySelectorAll('.role-page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetPage = parseInt(e.currentTarget.getAttribute('data-page'), 10);
      if (targetPage !== page) {
        loadAndRenderRoles(currentSearchQuery, targetPage);
      }
    });
  });
}

function initSearchListeners() {
  const input = document.getElementById('searchRoleName');
  let timer;
  if (input) {
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        currentPage = 0;
        loadAndRenderRoles(input.value.trim(), 0);
      }, 400);
    });
  }
}

function initNewRoleButtonListener() {
  const btn = document.getElementById('btn-add-role') || document.getElementById('btnNewRole');
  if (btn) {
    btn.addEventListener('click', openRoleCreateModal);
  }
}

function initModalListeners() {
  const modal = document.getElementById('roleModal');
  const closeBtn = document.getElementById('closeRoleModalBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeRoleModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeRoleModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeRoleModal();
  });
}

export function closeRoleModal() {
  const modal = document.getElementById('roleModal');
  if (modal) modal.style.display = 'none';
}

function showRoleLoading(message = 'Procesando...') {
  const modal = document.getElementById('loadingRoleModal');
  const text = document.getElementById('loadingRoleText');
  if (text) text.textContent = message;
  if (modal) modal.style.display = 'flex';
}

function hideRoleLoading() {
  const modal = document.getElementById('loadingRoleModal');
  if (modal) modal.style.display = 'none';
}