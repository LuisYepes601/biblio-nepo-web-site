import { getAllUsers, createUser } from './users.api.js';
import { API_CONFIG } from '../../core/config/api.config.js';

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
    <div class="view-header">
      <h1>Gestión de Usuarios</h1>
      <p>Administra accesos, asignación de roles y estados institucionales.</p>
    </div>

    <section class="users-module-container">
      <div class="users-header">
        <div>
          <h3>Listado General</h3>
          <p>Control de cuentas registradas en el sistema.</p>
        </div>
        <button class="btn-primary" id="btnNewUser">
          <i class="fa-solid fa-user-plus"></i> Nuevo Usuario
        </button>
      </div>

      <!-- Filtros de Búsqueda -->
      <div class="users-filter-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <input type="text" id="filterNombre" placeholder="Buscar por Nombre..." style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.875rem;">
        <input type="text" id="filterApellido" placeholder="Buscar por Apellido..." style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.875rem;">
        <input type="text" id="filterEmail" placeholder="Buscar por Email..." style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.875rem;">
        <input type="text" id="filterIdentificacion" placeholder="N° Identificación..." style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.875rem;">
        
        <select id="filterRol" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.875rem; background: white;">
          <option value="">Todos los Roles</option>
          <option value="1">Administrador</option>
          <option value="2">Lector / Estudiante</option>
          <option value="3">Bibliotecario</option>
        </select>

        <select id="filterIsDelete" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.875rem; background: white;">
          <option value="false">Activos</option>
          <option value="true">Eliminados / Inactivos</option>
          <option value="">Todos</option>
        </select>
      </div>

      <!-- Tabla de Usuarios -->
      <div class="users-table-wrapper" style="overflow-x: auto;">
        <table class="users-table">
          <thead>
            <tr>
              <th>Foto / Nombre</th>
              <th>Segundo Nombre</th>
              <th>Primer Apellido</th>
              <th>Segundo Apellido</th>
              <th>Identificación</th>
              <th>Correo Electrónico</th>
              <th>Fecha Nacimiento</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            <tr>
              <td colspan="8" style="text-align: center; padding: 24px;">Cargando usuarios...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

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
  `;

  // 2. Inyectar estilos CSS indispensables del Modal
  injectModalStyles();

  // 3. Inicializar lógica del modal y eventos
  setupModalEvents();
  setupFilterEvents();

  // 4. Cargar la tabla de usuarios
  await fetchAndRenderUsers();
}

/**
 * Consulta la API pasando los filtros actuales y renderiza la tabla.
 */
async function fetchAndRenderUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px;">Cargando usuarios...</td></tr>`;
  }

  try {
    const responseData = await getAllUsers(currentFilters);
    const usersList = Array.isArray(responseData) 
      ? responseData 
      : (responseData?.content || responseData?.data || []);

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
      ? `<img src="${user.urlFotoPerfil}" alt="${user.nombre}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=random';" />`
      : `<div style="width: 36px; height: 36px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #475569; flex-shrink: 0;">${(user.nombre || 'U').charAt(0)}</div>`;

    const fechaNac = user.fechaNacimiento 
      ? new Date(user.fechaNacimiento + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

    return `
      <tr data-id="${user.id}">
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            ${avatarImg}
            <strong style="white-space: nowrap;">${user.nombre || 'N/A'}</strong>
          </div>
        </td>
        <td>${user.segundoNombre || '-'}</td>
        <td>${user.primerApellido || 'N/A'}</td>
        <td>${user.segundoApellido || 'N/A'}</td>
        <td>${user.numeroIdentificacion || 'N/A'}</td>
        <td>${user.email || 'N/A'}</td>
        <td style="white-space: nowrap;">${fechaNac}</td>
        <td class="text-right">
          <button class="icon-btn" style="width: 32px; height: 32px;" title="Editar" data-id="${user.id}">
            <i class="fa-solid fa-pen"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Configura la apertura, cierre y envío del formulario del modal de usuarios
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

  // Abrir Modal
  btnNew?.addEventListener('click', () => {
    loadModalDropdowns();
    modal.style.display = 'flex';
  });

  // Cerrar Modal
  const closeModal = () => {
    modal.style.display = 'none';
    form.reset();
    previewBox.innerHTML = '👤';
    fileNameText.textContent = 'JPG, PNG o WEBP';
  };

  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); });

  // Previsualización de imagen
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

  // Envío del formulario
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmitUser');
    const originalText = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Guardando...';

    // Se ajustan los nombres exactamente con las propiedades que espera UsuarioBasicoDtoReq en Java
    // 1. Objeto interno que mapea exactamente con el esquema "body" de la API
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
    formData.append(
      'body', 
      new Blob([JSON.stringify(bodyData)], { type: 'application/json' })
    );

    const imgFile = document.getElementById('usrImgPerfil')?.files[0];
    if (imgFile) {
      formData.append('imgPerfil', imgFile);
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('¡Usuario registrado con éxito desde gestión!');
        // Aquí limpias tu formulario o recargas tu tabla de usuarios
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Detalles del error:', errorData);
        alert(`Error: ${errorData.message || 'No se pudo registrar el usuario'}`);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión con el servidor.');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = originalText;
    }
  });
}

/**
 * Carga los combos de select para Tipos de Identificación y Roles
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
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: none;
      align-items: center; justify-content: center;
    }
    .user-modal-card {
      background: #ffffff;
      width: 600px; max-width: 90%; max-height: 90vh;
      border-radius: 16px; overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .user-modal-header {
      padding: 16px 20px; background: #0f172a; color: #ffffff;
      display: flex; justify-content: space-between; align-items: center;
    }
    .user-modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
    .user-modal-close { background: none; border: none; color: #ffffff; font-size: 1.5rem; cursor: pointer; }
    .user-modal-body { padding: 20px; overflow-y: auto; }
    .user-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .user-modal-body label { display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 4px; }
    .user-modal-body input[type="text"],
    .user-modal-body input[type="email"],
    .user-modal-body input[type="password"],
    .user-modal-body input[type="date"],
    .user-select {
      width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1;
      border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;
    }
    .usr-avatar-box {
      display: flex; align-items: center; gap: 12px;
      background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px dashed #cbd5e1;
    }
    .usr-avatar-preview {
      width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0;
      display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
    }
    .usr-file-btn { color: #2563eb; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .user-modal-actions {
      display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0;
    }
    .btn-secondary { background: #e2e8f0; color: #334155; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
  `;
  document.head.appendChild(style);
}