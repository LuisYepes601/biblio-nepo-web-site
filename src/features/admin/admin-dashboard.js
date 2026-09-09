import { API_CONFIG } from '../../core/config/api.config.js';
import { updateProfilePhoto } from '../perfil/perfilApi.js';

// Variable global para almacenar IDs relacionales
const userRelationalData = {
  id_tipo_identificacion: null,
  id_rol: null
};

/**
 * Obtiene el token de autenticación formateado.
 */
function getAuthToken() {
  return localStorage.getItem('authToken')?.replace(/^["']|["']$/g, '');
}

/**
 * Función auxiliar para traer y pintar los datos del usuario en la vista
 */
async function cargarDatosUsuario() {
  try {
    const token = getAuthToken();
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      console.warn('No se encontró token o ID de usuario.');
      return;
    }

    const endpoint = `${API_CONFIG.BASE_URL}/api/v1/perfil/${userId}/datos-basicos`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Error al obtener los datos básicos del perfil');

    const data = await response.json();
    const user = data.data || data; 

    // Guardar IDs necesarios para la actualización
    userRelationalData.id_tipo_identificacion = user.id_tipo_identificacion || user.idTipoIdentificacion || 1;
    userRelationalData.id_rol = user.idRol || user.id_rol || 1;

    // Elementos del formulario de perfil
    const nombreInput = document.getElementById('profile-nombre');
    const segundoNombreInput = document.getElementById('profile-segundo-nombre');
    const apellidoInput = document.getElementById('profile-apellido');
    const segundoApellidoInput = document.getElementById('profile-segundo-apellido');
    const tipoIdInput = document.getElementById('profile-tipo-id');
    const numIdInput = document.getElementById('profile-num-id');
    const nacimientoInput = document.getElementById('profile-nacimiento');
    const rolInput = document.getElementById('profile-rol-input');
    const emailInput = document.getElementById('profile-email');
    
    // Tarjeta de perfil y Sidebar
    const nameCard = document.getElementById('profile-name-card');
    const roleCard = document.getElementById('profile-role-card');
    const avatarImg = document.getElementById('profile-avatar');
    const sidebarAvatar = document.querySelector('.user-profile-card img, .user-avatar, img[alt*="Avatar"], .sidebar img');
    const sidebarName = document.querySelector('.user-profile-card .user-name, .user-info h4, .user-name');
    const welcomeTitle = document.getElementById('welcome-user-title');

    // Asignación de valores en inputs
    if (nombreInput) { nombreInput.value = user.nombre || ''; nombreInput.disabled = false; }
    if (segundoNombreInput) { segundoNombreInput.value = user.segundoNombre || ''; segundoNombreInput.disabled = false; }
    if (apellidoInput) { apellidoInput.value = user.primerApellido || ''; apellidoInput.disabled = false; }
    if (segundoApellidoInput) { segundoApellidoInput.value = user.segundoApellido || ''; segundoApellidoInput.disabled = false; }
    if (tipoIdInput) { tipoIdInput.value = user.tipoIdentificacion || ''; tipoIdInput.disabled = false; }
    if (numIdInput) { numIdInput.value = user.numeroIdentificacion || ''; numIdInput.disabled = false; }
    if (nacimientoInput) { nacimientoInput.value = user.fechaNacimiento || ''; nacimientoInput.disabled = false; }
    if (rolInput) { rolInput.value = user.rol || ''; rolInput.disabled = true; }
    if (emailInput) { emailInput.value = user.email || ''; emailInput.disabled = false; }

    const fullName = `${user.nombre || ''} ${user.primerApellido || ''}`.trim();
    
    if (nameCard) nameCard.textContent = fullName || 'Usuario';
    if (sidebarName && fullName) sidebarName.textContent = fullName;
    if (welcomeTitle) welcomeTitle.textContent = `Bienvenido, ${user.nombre || 'Admin'} 👋`;

    if (user.rol && roleCard) {
      roleCard.textContent = user.rol;
    }

    // Actualización de avatar si existe URL
    const fotoUrl = user.urlFotoPerfil || user.fotoPerfilUrl;
    if (fotoUrl) {
      if (avatarImg) avatarImg.src = fotoUrl;
      if (sidebarAvatar) sidebarAvatar.src = fotoUrl;
    }

  } catch (error) {
    console.error('Error al cargar la información del usuario:', error);
    const welcomeTitle = document.getElementById('welcome-user-title');
    if (welcomeTitle) welcomeTitle.textContent = 'Bienvenido 👋';
  }
}

/**
 * Maneja la subida e integración dinámica de la foto de perfil
 */
async function manejarCambioFotoPerfil(event) {
  const file = event.target.files[0];
  if (!file) return;

  const token = getAuthToken();
  const userId = localStorage.getItem('userId');
  const avatarImg = document.getElementById('profile-avatar');
  const sidebarAvatar = document.querySelector('.user-profile-card img, .user-avatar, img[alt*="Avatar"], .sidebar img');

  try {
    if (avatarImg) avatarImg.style.opacity = '0.4';

    const response = await updateProfilePhoto(userId, file, token);
    const nuevaFotoUrl = response.fotoPerfilUrl || response.url || response.urlFotoPerfil || URL.createObjectURL(file);

    if (avatarImg) avatarImg.src = nuevaFotoUrl;
    if (sidebarAvatar) sidebarAvatar.src = nuevaFotoUrl;

    alert('¡Foto de perfil actualizada con éxito!');
  } catch (error) {
    console.error('Error al actualizar la foto de perfil:', error);
    alert('Ocurrió un error al subir la foto de perfil.');
  } finally {
    if (avatarImg) avatarImg.style.opacity = '1';
    event.target.value = ''; // Limpiar selector
  }
}

/**
 * Función encargada de actualizar los datos de texto del usuario en la API
 */
async function guardarDatosUsuario(event) {
  if (event) event.preventDefault();

  const btnGuardar = document.getElementById('btn-guardar-perfil');
  const token = getAuthToken();
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    alert('No se identificó la sesión del usuario.');
    return;
  }

  const payload = {
    nombre: document.getElementById('profile-nombre')?.value.trim() || '',
    segundoNombre: document.getElementById('profile-segundo-nombre')?.value.trim() || '',
    primerApellido: document.getElementById('profile-apellido')?.value.trim() || '',
    segundoApellido: document.getElementById('profile-segundo-apellido')?.value.trim() || '',
    fechaNacimiento: document.getElementById('profile-nacimiento')?.value || '',
    numeroIdentificacion: document.getElementById('profile-num-id')?.value.trim() || '',
    id_tipo_identificacion: Number(userRelationalData.id_tipo_identificacion),
    id_rol: Number(userRelationalData.id_rol),
    email: document.getElementById('profile-email')?.value.trim() || ''
  };

  const passwordVal = document.getElementById('profile-password')?.value.trim();
  if (passwordVal) {
    payload.password = passwordVal;
  }

  try {
    if (btnGuardar) {
      btnGuardar.disabled = true;
      btnGuardar.textContent = 'Guardando...';
    }

    const endpoint = `${API_CONFIG.BASE_URL}/api/v1/users/${userId}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar los datos del usuario');
    }

    alert('¡Datos de usuario actualizados correctamente!');
    
    const passInput = document.getElementById('profile-password');
    if (passInput) passInput.value = '';

    await cargarDatosUsuario();

  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    alert(`No se pudo actualizar la información: ${error.message}`);
  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar Cambios';
    }
  }
}

export function loadDashboardView() {
  const container = document.getElementById('admin-content-container');
  if (!container) return;

  container.innerHTML = `
    <!-- Vista del Dashboard -->
    <div id="view-dashboard" class="admin-view" style="display: block;">
      <div class="view-header" style="margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <span style="font-size: 0.8rem; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">Panel General</span>
          <h1 id="welcome-user-title" style="font-size: 1.75rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em;">Cargando...</h1>
        </div>
        <div style="font-size: 0.85rem; color: #64748b; background: #ffffff; padding: 8px 16px; border-radius: 9999px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.02); display: flex; align-items: center; gap: 8px;">
          <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 3px rgba(34,197,94,0.15);"></span>
          <span>Sistema en Línea &bull; Render API</span>
        </div>
      </div>

      <!-- Tarjetas de Métricas -->
      <section class="analytics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 28px;">
        <article class="analytic-card" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #6366f1;"></div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Total Usuarios</span>
              <div style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-top: 6px; letter-spacing: -0.03em;">1,150</div>
            </div>
            <div style="background: #eef2ff; color: #6366f1; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
              <i class="fa-solid fa-users"></i>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: #16a34a; margin-top: 14px; display: flex; align-items: center; gap: 6px; font-weight: 600;">
            <span style="background: #dcfce7; padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; gap: 2px;"><i class="fa-solid fa-arrow-up" style="font-size: 0.7rem;"></i> +12</span> 
            <span style="color: #64748b; font-weight: 450;">nuevos este mes</span>
          </div>
        </article>

        <article class="analytic-card" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #0ea5e9;"></div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Préstamos Activos</span>
              <div style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-top: 6px; letter-spacing: -0.03em;">142</div>
            </div>
            <div style="background: #e0f2fe; color: #0ea5e9; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
              <i class="fa-solid fa-book-open"></i>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 14px; display: flex; align-items: center; gap: 6px; font-weight: 500;">
            <span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px;">En circulación</span> 
            <span>actual del sistema</span>
          </div>
        </article>

        <article class="analytic-card" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #f59e0b;"></div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Catálogo Total</span>
              <div style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-top: 6px; letter-spacing: -0.03em;">3,480</div>
            </div>
            <div style="background: #fef3c7; color: #d97706; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
              <i class="fa-solid fa-book"></i>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 14px; display: flex; align-items: center; gap: 6px; font-weight: 500;">
            <span style="background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px;">Títulos</span> 
            <span>registrados y listos</span>
          </div>
        </article>
      </section>

      <!-- Secciones Principales -->
      <section class="dashboard-sections-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
        <div class="dashboard-card" style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
              <h3 style="font-size: 1.1rem; color: #0f172a; font-weight: 700; margin: 0;">Préstamos Recientes</h3>
              <p style="font-size: 0.8rem; color: #64748b; margin: 2px 0 0 0;">Últimos movimientos de libros registrados</p>
            </div>
            <a href="#prestamos" style="font-size: 0.85rem; color: #6366f1; text-decoration: none; font-weight: 600; background: #eef2ff; padding: 6px 12px; border-radius: 8px;">Ver todos</a>
          </div>
          <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
              <thead>
                <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 0.75rem; text-transform: uppercase;">
                  <th style="padding: 12px 10px; font-weight: 700;">Usuario</th>
                  <th style="padding: 12px 10px; font-weight: 700;">Libro</th>
                  <th style="padding: 12px 10px; font-weight: 700;">Fecha Límite</th>
                  <th style="padding: 12px 10px; font-weight: 700;">Estado</th>
                </tr>
              </thead>
              <tbody style="color: #334155;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 14px 10px; font-weight: 600; color: #0f172a;">Ana Pérez</td>
                  <td style="padding: 14px 10px; color: #475569;">Cien Años de Soledad</td>
                  <td style="padding: 14px 10px; color: #64748b; font-size: 0.8rem;">15/09/2026</td>
                  <td style="padding: 14px 10px;"><span style="background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">Activo</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 14px 10px; font-weight: 600; color: #0f172a;">Carlos Gómez</td>
                  <td style="padding: 14px 10px; color: #475569;">El Laberinto de la Soledad</td>
                  <td style="padding: 14px 10px; color: #64748b; font-size: 0.8rem;">20/09/2026</td>
                  <td style="padding: 14px 10px;"><span style="background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">Activo</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="dashboard-card" style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.1rem; color: #0f172a; font-weight: 700; margin-bottom: 6px;">Acciones Rápidas</h3>
            <p style="font-size: 0.8rem; color: #64748b; margin: 0 0 20px 0;">Operaciones frecuentes del sistema</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button style="width: 100%; padding: 12px 16px; background: #6366f1; color: white; border: none; border-radius: 10px; cursor: pointer; text-align: left; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 12px;">
                <i class="fa-solid fa-plus-circle"></i> Registrar Nuevo Préstamo
              </button>
              <button style="width: 100%; padding: 12px 16px; background: #f8fafc; color: #334155; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; text-align: left; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 12px;">
                <i class="fa-solid fa-book-medical" style="color: #6366f1;"></i> Añadir Libro
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Vista de Perfil -->
    <div id="view-profile" class="admin-view" style="display: none;">
      <div class="view-header" style="margin-bottom: 28px;">
        <span style="font-size: 0.8rem; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">Configuración de Cuenta</span>
        <h1 style="font-size: 1.75rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em;">Mi Perfil</h1>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px; align-items: start;">
        <div style="background: #ffffff; padding: 32px 24px; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; text-align: center;">
          
          <!-- Contenedor del Avatar con botón para editar la foto -->
          <div style="position: relative; width: 96px; height: 96px; margin: 0 auto 16px auto;">
            <img id="profile-avatar" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid #eef2ff; background: #f1f5f9; transition: opacity 0.2s;">
            <label for="input-foto-perfil" style="position: absolute; bottom: 0; right: 0; width: 32px; height: 32px; background: #6366f1; color: white; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" title="Cambiar foto de perfil">
              <i class="fa-solid fa-camera" style="font-size: 0.8rem;"></i>
            </label>
            <input type="file" id="input-foto-perfil" accept="image/*" style="display: none;">
          </div>

          <h3 id="profile-name-card" style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">&nbsp;</h3>
          <p id="profile-role-card" style="font-size: 0.85rem; color: #6366f1; font-weight: 600; margin: 0 0 16px 0;">&nbsp;</p>
          <span style="display: inline-block; background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">BiblioNepo Core</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Información Personal</h3>
            <p style="font-size: 0.8rem; color: #64748b; margin: 0 0 20px 0;">Actualiza tus datos de contacto y perfil</p>
            
            <form id="profile-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Primer Nombre</label>
                <input type="text" id="profile-nombre" placeholder="Cargando..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; background: #ffffff; outline: none;" disabled>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Segundo Nombre</label>
                <input type="text" id="profile-segundo-nombre" placeholder="Cargando..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; background: #ffffff; outline: none;" disabled>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Primer Apellido</label>
                <input type="text" id="profile-apellido" placeholder="Cargando..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; background: #ffffff; outline: none;" disabled>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Segundo Apellido</label>
                <input type="text" id="profile-segundo-apellido" placeholder="Cargando..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; background: #ffffff; outline: none;" disabled>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Tipo de Identificación</label>
                <input type="text" id="profile-tipo-id" placeholder="Cargando..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; background: #ffffff; outline: none;" disabled>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Número de Identificación</label>
                <input type="text" id="profile-num-id" placeholder="Cargando..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; background: #ffffff; outline: none;" disabled>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Fecha de Nacimiento</label>
                <input type="date" id="profile-nacimiento" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; background: #ffffff; outline: none;" disabled>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Rol en el Sistema</label>
                <input type="text" id="profile-rol-input" placeholder="Cargando..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #64748b; background: #f8fafc; outline: none;" disabled>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Correo Electrónico</label>
                <input type="email" id="profile-email" placeholder="Cargando..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; background: #ffffff; outline: none;" disabled>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Nueva Contraseña (Opcional)</label>
                <input type="password" id="profile-password" placeholder="••••••••" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; background: #ffffff; outline: none;">
              </div>
              
              <div style="grid-column: span 2; display: flex; justify-content: flex-end; margin-top: 8px;">
                <button type="submit" id="btn-guardar-perfil" style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer;">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // Listener para el formulario de actualización de datos de texto
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', guardarDatosUsuario);
  }

  // Listener para la carga de la nueva imagen de perfil
  const inputFotoPerfil = document.getElementById('input-foto-perfil');
  if (inputFotoPerfil) {
    inputFotoPerfil.addEventListener('change', manejarCambioFotoPerfil);
  }

  // Cargar datos del usuario al renderizar la vista inicial
  cargarDatosUsuario();
}

export async function switchView(viewName) {
  const dashboard = document.getElementById('view-dashboard');
  const profile = document.getElementById('view-profile');
  
  if (!dashboard || !profile) return;

  if (viewName === 'dashboard') {
    dashboard.style.display = 'block';
    profile.style.display = 'none';
  } else if (viewName === 'profile') {
    dashboard.style.display = 'none';
    profile.style.display = 'block';
    await cargarDatosUsuario();
  }
}