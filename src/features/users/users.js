import { getAllUsers, createUser, updateUser, getUserDetails } from './users.api.js';
import { API_CONFIG } from '../../core/config/api.config.js';
import { updateProfilePhoto } from '../perfil/perfilApi.js';
import { navigateToView } from '../admin/admin.navigation.js';

let currentFilters = {
  nombre: '',
  primer_apellido: '',
  email: '',
  num_identificacion: '',
  id_rol: '',
  isDelete: 'false'
};

export async function loadUsersView() {
  const container = document.getElementById('admin-content-container');
  if (!container) return;

  // 1. Inyectar HTML principal de la vista
  container.innerHTML = `
    <div class="users-page-wrapper">
      
      <!-- BARRA SUPERIOR CON BOTÓN REGRESAR -->
      <div class="users-top-bar" style="margin-bottom: 16px;">
        <button class="btn-back-dashboard" id="btnBackToDashboard" style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; color: #334155; padding: 8px 14px; border-radius: 8px; font-size: 0.825rem; font-weight: 600; cursor: pointer; transition: background 0.15s, border-color 0.15s;">
          <i class="fa-solid fa-arrow-left"></i> Regresar al Dashboard
        </button>
      </div>

      <!-- CARRUSEL HERO AUTOMÁTICO CON FLEX 100% -->
      <div class="carousel-hero-container" id="usersHeroCarousel" style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 28px; border: 1px solid #e2e8f0; background: #0f172a;">
        <div class="carousel-track" id="usersCarouselTrack" style="display: flex; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); width: 100%;">
          
          <div class="carousel-slide" style="flex: 0 0 100%; min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Administración</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Gestión de Usuarios</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Administra accesos, asignación de roles y perfiles institucionales en el sistema.</p>
            </div>
          </div>

          <div class="carousel-slide" style="flex: 0 0 100%; min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Comunidad & Lectores</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Control de Accesos</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Garantiza la seguridad y la correcta asignación de permisos para estudiantes, bibliotecarios y administradores.</p>
            </div>
          </div>

        </div>

        <div class="carousel-controls" style="position: absolute; bottom: 16px; right: 20px; z-index: 3; display: flex; align-items: center; gap: 8px;">
          <div class="carousel-dots" style="display: flex; gap: 6px; margin-right: 6px;">
            <span class="carousel-dot active" style="width: 20px; height: 7px; border-radius: 10px; background: #ffffff; cursor: pointer;"></span>
            <span class="carousel-dot" style="width: 7px; height: 7px; border-radius: 50%; background: rgba(255, 255, 255, 0.4); cursor: pointer;"></span>
          </div>
          <button class="carousel-arrow" id="usersPrevBtn" title="Anterior" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="carousel-arrow" id="usersNextBtn" title="Siguiente" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>

      <!-- CONTENEDOR PRINCIPAL -->
      <section class="users-module-container" style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px;">
        <div class="users-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a;">Listado General</h3>
            <p style="margin: 2px 0 0 0; font-size: 0.825rem; color: #64748b;">Control de cuentas registradas en el sistema.</p>
          </div>
          <button class="btn-primary" id="btnNewUser" style="padding: 9px 16px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-user-plus"></i> Nuevo Usuario
          </button>
        </div>

        <!-- Filtros de Búsqueda -->
        <div class="users-filter-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <input type="text" id="filterNombre" placeholder="Buscar por Nombre..." style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; outline: none; background: white;">
          <input type="text" id="filterApellido" placeholder="Buscar por Apellido..." style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; outline: none; background: white;">
          <input type="text" id="filterEmail" placeholder="Buscar por Email..." style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; outline: none; background: white;">
          <input type="text" id="filterIdentificacion" placeholder="N° Identificación..." style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; outline: none; background: white;">
          
          <select id="filterRol" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; background: white; outline: none;">
            <option value="">Todos los Roles</option>
            <option value="1">Administrador</option>
            <option value="2">Lector / Estudiante</option>
            <option value="3">Bibliotecario</option>
          </select>

          <select id="filterIsDelete" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; background: white; outline: none;">
            <option value="false">Activos</option>
            <option value="true">Eliminados / Inactivos</option>
            <option value="">Todos</option>
          </select>
        </div>

        <!-- Tabla de Usuarios -->
        <div class="users-table-wrapper" style="overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0;">
          <table class="users-table" style="width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #64748b;">Foto / Nombre</th>
                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #64748b;">Segundo Nombre</th>
                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #64748b;">Primer Apellido</th>
                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #64748b;">Segundo Apellido</th>
                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #64748b;">Identificación</th>
                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #64748b;">Correo Electrónico</th>
                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #64748b;">Fecha Nacimiento</th>
                <th class="text-right" style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #64748b; text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody id="usersTableBody">
              <tr>
                <td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">Cargando usuarios...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>

    <!-- MODAL NATIVO DE CREACIÓN DE USUARIO -->
    <div id="createUserModal" class="user-modal-overlay">
      <div class="user-modal-card">
        <div class="user-modal-header">
          <h3><i class="fa-solid fa-user-plus"></i> Registrar Nuevo Usuario</h3>
          <button id="closeUserModal" class="user-modal-close">&times;</button>
        </div>
        <form id="createUserForm" class="user-modal-body">
          <div class="user-form-grid">
            <div>
              <label>Primer Nombre <span style="color: #ef4444;">*</span></label>
              <input type="text" id="usrNombre" required placeholder="Ej. Ana">
            </div>
            <div>
              <label>Segundo Nombre</label>
              <input type="text" id="usrSegundoNombre" placeholder="Ej. Laura">
            </div>
            <div>
              <label>Primer Apellido <span style="color: #ef4444;">*</span></label>
              <input type="text" id="usrPrimerApellido" required placeholder="Ej. Yepes">
            </div>
            <div>
              <label>Segundo Apellido <span style="color: #ef4444;">*</span></label>
              <input type="text" id="usrSegundoApellido" required placeholder="Ej. Meléndez">
            </div>
            <div>
              <label>Tipo Documento <span style="color: #ef4444;">*</span></label>
              <select id="usrTipoId" required class="user-select">
                <option value="">Cargando tipos...</option>
              </select>
            </div>
            <div>
              <label>N° Identificación <span style="color: #ef4444;">*</span></label>
              <input type="text" id="usrNumId" required placeholder="1050276424">
            </div>
            <div>
              <label>Fecha de Nacimiento <span style="color: #ef4444;">*</span></label>
              <input type="date" id="usrFechaNac" required>
            </div>
            <div>
              <label>Rol asignado <span style="color: #ef4444;">*</span></label>
              <select id="usrRol" required class="user-select">
                <option value="">Cargando roles...</option>
              </select>
            </div>
          </div>

          <div style="margin-top: 10px;">
            <label>Foto de Perfil</label>
            <div class="usr-avatar-box">
              <div id="usrAvatarPreview" class="usr-avatar-preview">👤</div>
              <div style="flex: 1;">
                <label for="usrImg" class="usr-file-btn">Seleccionar imagen</label>
                <span id="usrFileName" style="display:block; font-size:0.75rem; color:#64748b; margin-top:4px;">JPG, PNG o WEBP</span>
              </div>
              <input type="file" id="usrImg" accept="image/*" style="display: none;">
            </div>
          </div>

          <div style="margin-top: 10px;">
            <label>Correo Electrónico <span style="color: #ef4444;">*</span></label>
            <input type="email" id="usrEmail" required placeholder="usuario@ejemplo.com">
          </div>

          <div style="margin-top: 10px;">
            <label>Contraseña <span style="color: #ef4444;">*</span></label>
            <input type="password" id="usrPassword" required placeholder="••••••••">
          </div>

          <div class="user-modal-actions">
            <button type="button" id="btnCancelUserModal" class="btn-secondary">Cancelar</button>
            <button type="submit" id="btnSubmitUser" class="btn-primary">Guardar Usuario</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DE DETALLES INSTITUCIONALES DE USUARIO -->
    <div id="userDetailsModal" class="user-modal-overlay">
      <div class="user-modal-card" style="width: 520px;">
        <div class="user-modal-header" style="background: #1e293b;">
          <h3><i class="fa-solid fa-circle-info"></i> Detalles Institucionales</h3>
          <button id="closeUserDetailsModal" class="user-modal-close">&times;</button>
        </div>
        <div class="user-modal-body" id="userDetailsBody" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="grid-column: span 2; text-align: center; padding: 20px; color: #64748b;">
            Cargando detalles...
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE EDICIÓN DE USUARIO -->
    <div id="editUserModal" class="user-modal-overlay">
      <div class="user-modal-card">
        <div class="user-modal-header" style="background: #0f766e;">
          <h3><i class="fa-solid fa-user-pen"></i> Editar Datos Básicos</h3>
          <button id="closeEditUserModal" class="user-modal-close">&times;</button>
        </div>
        <form id="editUserForm" class="user-modal-body">
          <input type="hidden" id="editUsrId">
          <div class="user-form-grid">
            <div>
              <label>Primer Nombre <span style="color: #ef4444;">*</span></label>
              <input type="text" id="editUsrNombre" required>
            </div>
            <div>
              <label>Segundo Nombre</label>
              <input type="text" id="editUsrSegundoNombre">
            </div>
            <div>
              <label>Primer Apellido <span style="color: #ef4444;">*</span></label>
              <input type="text" id="editUsrPrimerApellido" required>
            </div>
            <div>
              <label>Segundo Apellido <span style="color: #ef4444;">*</span></label>
              <input type="text" id="editUsrSegundoApellido" required>
            </div>
            <div>
              <label>Tipo Documento <span style="color: #ef4444;">*</span></label>
              <select id="editUsrTipoId" required class="user-select">
                <option value="">Cargando tipos...</option>
              </select>
            </div>
            <div>
              <label>N° Identificación <span style="color: #ef4444;">*</span></label>
              <input type="text" id="editUsrNumId" required>
            </div>
            <div>
              <label>Fecha de Nacimiento <span style="color: #ef4444;">*</span></label>
              <input type="date" id="editUsrFechaNac" required>
            </div>
            <div>
              <label>Rol asignado <span style="color: #ef4444;">*</span></label>
              <select id="editUsrRol" required class="user-select">
                <option value="">Cargando roles...</option>
              </select>
            </div>
          </div>

          <div style="margin-top: 10px;">
            <label>Correo Electrónico <span style="color: #ef4444;">*</span></label>
            <input type="email" id="editUsrEmail" required>
          </div>

          <div style="margin-top: 10px;">
            <label>Contraseña / Credencial <span style="color: #ef4444;">*</span></label>
            <input type="password" id="editUsrPassword" required placeholder="••••••••">
          </div>

          <div class="user-modal-actions">
            <button type="button" id="btnCancelEditModal" class="btn-secondary">Cancelar</button>
            <button type="submit" id="btnSubmitEditUser" class="btn-primary" style="background: #0f766e;">Actualizar Usuario</button>
          </div>
        </form>
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
  initUsersCarousel();

  // Inyectar estilos de modales y configurar eventos
  injectModalStyles();
  setupModalEvents();
  setupFilterEvents();
  setupDetailsModalEvents();
  setupEditModalEvents();

  await fetchAndRenderUsers();
}

/**
 * Control automático de movimiento continuo para el carrusel de Usuarios
 */
function initUsersCarousel() {
  const track = document.getElementById('usersCarouselTrack');
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];
  const dots = document.querySelectorAll('#usersHeroCarousel .carousel-dot');
  const prevBtn = document.getElementById('usersPrevBtn');
  const nextBtn = document.getElementById('usersNextBtn');
  const container = document.getElementById('usersHeroCarousel');

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

/**
 * Consulta la API pasando los filtros actuales y renderiza la tabla.
 */
async function fetchAndRenderUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">Cargando usuarios...</td></tr>`;
  }

  try {
    const usersList = await getAllUsers(currentFilters);
    renderUsersTable(usersList);
  } catch (error) {
    console.error('Error al renderizar usuarios:', error);
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: #ef4444; padding: 24px;">
            Error al consultar los usuarios en el servidor.
          </td>
        </tr>`;
    }
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">
          No se encontraron usuarios registrados.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = users.map(user => {
    const avatarImg = user.urlFotoPerfil 
      ? `<img src="${user.urlFotoPerfil}" alt="${user.nombre}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=random';" />`
      : `<div style="width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #475569; flex-shrink: 0;">${(user.nombre || 'U').charAt(0)}</div>`;

    const fechaNac = user.fechaNacimiento 
      ? new Date(user.fechaNacimiento + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

    return `
      <tr data-id="${user.id}">
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${avatarImg}
            <strong style="white-space: nowrap; font-size: 0.85rem; color: #0f172a;">${user.nombre || 'N/A'}</strong>
          </div>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: #334155;">${user.segundoNombre || '-'}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: #334155;">${user.primerApellido || 'N/A'}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: #334155;">${user.segundoApellido || 'N/A'}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: #334155;">${user.numeroIdentificacion || 'N/A'}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: #334155;">${user.email || 'N/A'}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: #334155; white-space: nowrap;">${fechaNac}</td>
        <td class="text-right" style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
          <div style="display: flex; gap: 4px; justify-content: flex-end;">
            <button class="icon-btn btn-user-details" style="background: none; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #6366f1; padding: 4px 6px; font-size: 0.8rem;" title="Ver Detalles" data-id="${user.id}">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="icon-btn btn-user-edit" style="background: none; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #475569; padding: 4px 6px; font-size: 0.8rem;" title="Editar Datos" data-id="${user.id}">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Configura los eventos del Modal de Edición de Usuario (Cargando datos actuales)
 */
function setupEditModalEvents() {
  const modal = document.getElementById('editUserModal');
  const btnClose = document.getElementById('closeEditUserModal');
  const btnCancel = document.getElementById('btnCancelEditModal');
  const form = document.getElementById('editUserForm');

  const closeModal = () => {
    modal.style.display = 'none';
    form.reset();
  };

  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); });

  const tbody = document.getElementById('usersTableBody');
  tbody?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-user-edit');
    if (!btn) return;

    const userId = btn.getAttribute('data-id');
    
    await loadEditModalDropdowns();
    modal.style.display = 'flex';

    try {
      const response = await getUserDetails(userId);
      
      if (response) {
        document.getElementById('editUsrId').value = userId;
        document.getElementById('editUsrNombre').value = response.nombre || '';
        document.getElementById('editUsrSegundoNombre').value = response.segundoNombre || '';
        document.getElementById('editUsrPrimerApellido').value = response.primerApellido || '';
        document.getElementById('editUsrSegundoApellido').value = response.segundoApellido || '';
        document.getElementById('editUsrNumId').value = response.numeroIdentificacion || '';
        document.getElementById('editUsrEmail').value = response.email || '';
        
        if (response.id_tipo_identificacion) {
          document.getElementById('editUsrTipoId').value = response.id_tipo_identificacion;
        }
        if (response.id_rol) {
          document.getElementById('editUsrRol').value = response.id_rol;
        }
        if (response.fechaNacimiento) {
          document.getElementById('editUsrFechaNac').value = response.fechaNacimiento.split('T')[0];
        }
      }
    } catch (error) {
      console.error('Error al cargar datos para editar:', error);
      alert('No se pudieron obtener los datos actuales del usuario.');
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmitEditUser');
    const originalText = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Actualizando...';

    const userId = document.getElementById('editUsrId').value;
    const updateData = {
      nombre: document.getElementById('editUsrNombre').value.trim(),
      segundoNombre: document.getElementById('editUsrSegundoNombre').value.trim() || null,
      primerApellido: document.getElementById('editUsrPrimerApellido').value.trim(),
      segundoApellido: document.getElementById('editUsrSegundoApellido').value.trim(),
      fechaNacimiento: document.getElementById('editUsrFechaNac').value,
      numeroIdentificacion: document.getElementById('editUsrNumId').value.trim(),
      id_tipo_identificacion: parseInt(document.getElementById('editUsrTipoId').value) || 1,
      id_rol: parseInt(document.getElementById('editUsrRol').value) || 2,
      email: document.getElementById('editUsrEmail').value.trim(),
      password: document.getElementById('editUsrPassword').value
    };

    try {
      await updateUser(userId, updateData);
      alert('¡Usuario actualizado con éxito!');
      closeModal();
      fetchAndRenderUsers();
    } catch (error) {
      alert(`Error al actualizar: ${error.message}`);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = originalText;
    }
  });
}

/**
 * Carga los select de Tipos de Identificación y Roles para Edición
 */
async function loadEditModalDropdowns() {
  const selectTipoId = document.getElementById('editUsrTipoId');
  const selectRol = document.getElementById('editUsrRol');

  try {
    const resTipos = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TIPO_IDENTIFICACIONES}`);
    if (resTipos.ok) {
      const data = await resTipos.json();
      const list = Array.isArray(data) ? data : (data.data || data.content || []);
      selectTipoId.innerHTML = list.length 
        ? list.map(t => `<option value="${t.id || t.id_tipo_identificacion}">${(t.nombre || t.descripcion).toUpperCase()}</option>`).join('')
        : '<option value="1">CÉDULA DE CIUDADANÍA</option>';
    }
  } catch (err) {
    selectTipoId.innerHTML = '<option value="1">CÉDULA DE CIUDADANÍA</option>';
  }

  try {
    const resRoles = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROLES}`);
    if (resRoles.ok) {
      const data = await resRoles.json();
      const list = Array.isArray(data) ? data : (data.data || data.content || []);
      selectRol.innerHTML = list.length 
        ? list.map(r => `<option value="${r.id || r.id_rol}">${(r.nombre || r.name).toUpperCase()}</option>`).join('')
        : '<option value="2">LECTOR / ESTUDIANTE</option>';
    }
  } catch (err) {
    selectRol.innerHTML = '<option value="2">LECTOR / ESTUDIANTE</option>';
  }
}

/**
 * Configura los eventos del Modal de Detalles
 */
function setupDetailsModalEvents() {
  const modal = document.getElementById('userDetailsModal');
  const btnClose = document.getElementById('closeUserDetailsModal');
  const bodyContainer = document.getElementById('userDetailsBody');

  const closeModal = () => { modal.style.display = 'none'; };

  btnClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); });

  const tbody = document.getElementById('usersTableBody');
  tbody?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-user-details');
    if (!btn) return;

    const userId = btn.getAttribute('data-id');
    const row = btn.closest('tr');
    
    const imgElement = row?.children[0].querySelector('img');
    const initialText = row?.children[0].querySelector('div > div')?.textContent?.trim() || '👤';

    modal.style.display = 'flex';
    bodyContainer.innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 20px; color: #64748b;">Cargando detalles...</div>`;

    try {
      const details = await getUserDetails(userId);
      
      let bigAvatarHtml = '';
      if (imgElement && imgElement.src) {
        bigAvatarHtml = `<img id="modalProfileImg" src="${imgElement.src}" alt="Foto de perfil" title="Haz clic para cambiar la foto" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #eef2ff; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" />`;
      } else {
        bigAvatarHtml = `<div id="modalProfileImg" title="Haz clic para cambiar la foto" style="width: 100px; height: 100px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 600; color: #475569; border: 3px solid #cbd5e1; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${initialText}</div>`;
      }

      bodyContainer.innerHTML = `
        <div style="grid-column: span 2; display: flex; flex-direction: column; align-items: center; margin-bottom: 8px; position: relative;">
          ${bigAvatarHtml}
          <span style="font-size: 0.725rem; color: #64748b; margin-top: 6px;">(Haz clic en la foto para cambiarla)</span>
          <input type="file" id="inputUploadFoto" accept="image/*" style="display: none;" />
          <h4 style="margin: 8px 0 0 0; font-size: 1.05rem; color: #0f172a; font-weight: 700;">${details.nombreCompleto || row?.children[0].querySelector('strong')?.textContent || 'Usuario del Sistema'}</h4>
          <span style="font-size: 0.8rem; color: #64748b;">${details.email || row?.children[5]?.textContent || ''}</span>
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Tipo Identificación</label>
          <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #0f172a; font-weight: 600;">${details.tipoIdentificacion || 'N/A'}</p>
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Rol</label>
          <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #0f172a; font-weight: 600;">${details.rol || 'N/A'}</p>
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">País</label>
          <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #0f172a; font-weight: 600;">${details.pais || 'N/A'}</p>
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Departamento</label>
          <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #0f172a; font-weight: 600;">${details.departamento || 'N/A'}</p>
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Ciudad</label>
          <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #0f172a; font-weight: 600;">${details.ciudad || 'N/A'}</p>
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Barrio</label>
          <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #0f172a; font-weight: 600;">${details.barrio || 'N/A'}</p>
        </div>
        <div style="grid-column: span 2;">
          <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Complemento Dirección</label>
          <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #0f172a; font-weight: 600;">${details.complemento || 'N/A'}</p>
        </div>
        <div style="grid-column: span 2;">
          <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Más Detalles</label>
          <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #0f172a; font-weight: 600;">${details.masDetalles || 'Ninguno'}</p>
        </div>
      `;

      const profileContainer = document.getElementById('modalProfileImg');
      const fileInput = document.getElementById('inputUploadFoto');

      profileContainer?.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput?.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
          profileContainer.style.opacity = '0.5';
          
          const result = await updateProfilePhoto(userId, file);
          const localImageUrl = URL.createObjectURL(file);

          if (profileContainer.tagName === 'IMG') {
            profileContainer.src = localImageUrl;
          } else {
            const parent = profileContainer.parentNode;
            const newImg = document.createElement('img');
            newImg.id = 'modalProfileImg';
            newImg.src = localImageUrl;
            newImg.alt = 'Foto de perfil';
            newImg.style.cssText = "width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #eef2ff; cursor: pointer; transition: opacity 0.2s;";
            newImg.title = "Haz clic para cambiar la foto";
            newImg.addEventListener('click', () => fileInput.click());
            parent.replaceChild(newImg, profileContainer);
          }

          alert(result.message || 'Foto de perfil actualizada correctamente');
          if (typeof fetchAndRenderUsers === 'function') fetchAndRenderUsers();

        } catch (err) {
          console.error(err);
          alert('No se pudo actualizar la foto de perfil.');
        } finally {
          profileContainer.style.opacity = '1';
        }
      });

    } catch (error) {
      bodyContainer.innerHTML = `<div style="grid-column: span 2; text-align: center; color: #ef4444; padding: 20px;">No se pudieron cargar los detalles del usuario.</div>`;
    }
  });
}

/**
 * Configura la apertura, cierre y envío del formulario del modal de creación de usuarios
 */
function setupModalEvents() {
  const modal = document.getElementById('createUserModal');
  const btnNew = document.getElementById('btnNewUser');
  const btnClose = document.getElementById('closeUserModal');
  const btnCancel = document.getElementById('btnCancelUserModal');
  const form = document.getElementById('createUserForm');

  const fileInput = document.getElementById('usrImg');
  const previewBox = document.getElementById('usrAvatarPreview');
  const fileNameText = document.getElementById('usrFileName');

  btnNew?.addEventListener('click', () => {
    loadModalDropdowns();
    modal.style.display = 'flex';
  });

  const closeModal = () => {
    modal.style.display = 'none';
    form.reset();
    previewBox.innerHTML = '👤';
    fileNameText.textContent = 'JPG, PNG o WEBP';
  };

  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      fileNameText.textContent = file.name;
      const reader = new FileReader();
      reader.onload = (event) => {
        previewBox.innerHTML = `<img src="${event.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" alt="Vista Previa">`;
      };
      reader.readAsDataURL(file);
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmitUser');
    const originalText = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Guardando...';

    const bodyData = {
      nombre: document.getElementById('usrNombre').value.trim(),
      segundoNombre: document.getElementById('usrSegundoNombre').value.trim() || null,
      primerApellido: document.getElementById('usrPrimerApellido').value.trim(),
      segundoApellido: document.getElementById('usrSegundoApellido').value.trim(),
      fechaNacimiento: document.getElementById('usrFechaNac').value,
      numeroIdentificacion: document.getElementById('usrNumId').value.trim(),
      id_tipo_identificacion: parseInt(document.getElementById('usrTipoId').value) || 1,
      id_rol: parseInt(document.getElementById('usrRol').value) || 2,
      email: document.getElementById('usrEmail').value.trim(),
      password: document.getElementById('usrPassword').value
    };

    const formData = new FormData();
    formData.append('body', new Blob([JSON.stringify(bodyData)], { type: 'application/json' }));

    const imgFile = document.getElementById('usrImg')?.files[0];
    if (imgFile) formData.append('imgPerfil', imgFile);

    try {
      await createUser(formData);
      alert('¡Usuario registrado con éxito desde gestión!');
      closeModal();
      fetchAndRenderUsers();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = originalText;
    }
  });
}

/**
 * Carga los combos de select para Tipos de Identificación y Roles (Creación)
 */
async function loadModalDropdowns() {
  const selectTipoId = document.getElementById('usrTipoId');
  const selectRol = document.getElementById('usrRol');

  try {
    const resTipos = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TIPO_IDENTIFICACIONES}`);
    if (resTipos.ok) {
      const data = await resTipos.json();
      const list = Array.isArray(data) ? data : (data.data || data.content || []);
      selectTipoId.innerHTML = list.length 
        ? list.map(t => `<option value="${t.id || t.id_tipo_identificacion}">${(t.nombre || t.descripcion).toUpperCase()}</option>`).join('')
        : '<option value="1">CÉDULA DE CIUDADANÍA</option>';
    }
  } catch (err) { selectTipoId.innerHTML = '<option value="1">CÉDULA DE CIUDADANÍA</option>'; }

  try {
    const resRoles = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROLES}`);
    if (resRoles.ok) {
      const data = await resRoles.json();
      const list = Array.isArray(data) ? data : (data.data || data.content || []);
      selectRol.innerHTML = list.length 
        ? list.map(r => `<option value="${r.id || r.id_rol}">${(r.nombre || r.name).toUpperCase()}</option>`).join('')
        : '<option value="2">LECTOR / ESTUDIANTE</option>';
    }
  } catch (err) { selectRol.innerHTML = '<option value="2">LECTOR / ESTUDIANTE</option>'; }
}

function setupFilterEvents() {
  let debounceTimeout;
  const onInputFilter = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      currentFilters.nombre = document.getElementById('filterNombre')?.value.trim() || '';
      currentFilters.primer_apellido = document.getElementById('filterApellido')?.value.trim() || '';
      currentFilters.email = document.getElementById('filterEmail')?.value.trim() || '';
      currentFilters.num_identificacion = document.getElementById('filterIdentificacion')?.value.trim() || '';
      currentFilters.id_rol = document.getElementById('filterRol')?.value || '';
      currentFilters.isDelete = document.getElementById('filterIsDelete')?.value || '';
      fetchAndRenderUsers();
    }, 300);
  };

  document.getElementById('filterNombre')?.addEventListener('input', onInputFilter);
  document.getElementById('filterApellido')?.addEventListener('input', onInputFilter);
  document.getElementById('filterEmail')?.addEventListener('input', onInputFilter);
  document.getElementById('filterIdentificacion')?.addEventListener('input', onInputFilter);
  document.getElementById('filterRol')?.addEventListener('change', onInputFilter);
  document.getElementById('filterIsDelete')?.addEventListener('change', onInputFilter);
}

function injectModalStyles() {
  if (document.getElementById('usersModalStyles')) return;
  const style = document.createElement('style');
  style.id = 'usersModalStyles';
  style.innerHTML = `
    .user-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: none;
      align-items: center; justify-content: center;
    }
    .user-modal-card {
      background: #ffffff;
      width: 580px; max-width: 90%; max-height: 90vh;
      border-radius: 12px; overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    .user-modal-header {
      padding: 16px 20px; background: #0f172a; color: #ffffff;
      display: flex; justify-content: space-between; align-items: center;
    }
    .user-modal-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; }
    .user-modal-close { background: none; border: none; color: #ffffff; font-size: 1.3rem; cursor: pointer; }
    .user-modal-body { padding: 20px; overflow-y: auto; }
    .user-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .user-modal-body label { display: block; font-size: 0.785rem; font-weight: 600; color: #334155; margin-bottom: 4px; }
    .user-modal-body input[type="text"],
    .user-modal-body input[type="email"],
    .user-modal-body input[type="password"],
    .user-modal-body input[type="date"],
    .user-select {
      width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1;
      border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;
      outline: none;
    }
    .usr-avatar-box {
      display: flex; align-items: center; gap: 12px;
      background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px dashed #cbd5e1;
    }
    .usr-avatar-preview {
      width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0;
      display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
    }
    .usr-file-btn { color: #6366f1; font-size: 0.825rem; font-weight: 600; cursor: pointer; }
    .user-modal-actions {
      display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0;
    }
    .btn-secondary { background: #ffffff; color: #334155; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 6px; font-weight: 500; font-size: 0.825rem; cursor: pointer; }
  `;
  document.head.appendChild(style);
}