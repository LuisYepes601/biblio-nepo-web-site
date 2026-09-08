import { loadBooksView } from '../books/books.js';
import { initCatalog } from '../catalog/catalog.component.js';
import { fetchPerfilDatosBasicos, updateProfilePhoto } from '../perfil/perfilApi.js'; 
import { updateUser } from './user-dashboard-api.js';

const userIdActual = localStorage.getItem('userId') || 1; 

document.addEventListener('DOMContentLoaded', () => {
    // Iniciar por defecto en la sección del catálogo al cargar la página
    cambiarSeccion('catalogo');
});

// Función interna que cambia el contenido y los títulos según la sección
async function ejecutarCambioSeccion(seccion) {
    const tituloSeccion = document.getElementById('tituloSeccion');
    const contenedor = document.getElementById('contenedorDinamico');
    contenedor.innerHTML = ''; 

    if (seccion === 'catalogo') {
        if (tituloSeccion) tituloSeccion.textContent = 'Catálogo de Libros';
        contenedor.innerHTML = `
            <div id="filterTabs"></div>
            <div id="bookGrid" class="grid-libros"></div>
        `;
        initCatalog(); 
    } 
    else if (seccion === 'prestamos') {
        if (tituloSeccion) tituloSeccion.textContent = 'Mis Préstamos';
        contenedor.innerHTML = `<p style="color: #64748b;">Sección de préstamos en construcción...</p>`;
    } 
    else if (seccion === 'perfil') {
        if (tituloSeccion) tituloSeccion.textContent = 'Mi Perfil';
        
        // Estado de carga inicial
        contenedor.innerHTML = `<p style="color: #64748b; text-align: center; padding: 40px;">Cargando datos del perfil...</p>`;

        try {
            console.log("Consultando perfil para el ID:", userIdActual);
            const perfil = await fetchPerfilDatosBasicos(userIdActual);

            // Estructura limpia y con diseño UX optimizado con campos independientes y botón de edición
            contenedor.innerHTML = `
                <div class="profile-card-modern">
                    <!-- Banner superior institucional -->
                    <div class="profile-header-bg">
                        <span class="profile-role-badge">${perfil.rol || 'Usuario'}</span>
                    </div>
                    
                    <div class="profile-content">
                        <!-- Cabecera: Avatar interactivo, Nombres y Botón de Editar Perfil -->
                        <div class="profile-user-main-row" style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                            <div style="display: flex; gap: 24px; align-items: flex-start;">
                                
                                <!-- Contenedor del Avatar con soporte para clic y cambio de foto -->
                                <div class="profile-avatar-container" style="position: relative; cursor: pointer;" title="Haz clic para cambiar tu foto de perfil">
                                    <img src="${perfil.urlFotoPerfil || 'https://via.placeholder.com/150'}" alt="Foto de perfil" class="profile-avatar" id="avatarImage" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #e2e8f0;">
                                    
                                    <!-- Input de archivo oculto para la foto -->
                                    <input type="file" id="inputFotoPerfil" accept="image/*" style="display: none;">
                                    
                                    <!-- Indicador flotante de cámara -->
                                    <div style="position: absolute; bottom: 0; right: 0; background: #2563eb; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                                        <i class="fa-solid fa-camera"></i>
                                    </div>
                                </div>

                                <div class="profile-titles">
                                    <h2 class="profile-name">
                                        ${perfil.nombre || ''} ${perfil.segundoNombre || ''} ${perfil.primerApellido || ''} ${perfil.segundoApellido || ''}
                                    </h2>
                                    <p class="profile-email">${perfil.email || 'Sin correo electrónico'}</p>
                                </div>
                            </div>
                            <button id="btnAbrirModalPerfil" class="btn-primary-custom" style="padding: 10px 18px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                Editar Perfil
                            </button>
                        </div>

                        <!-- Secciones organizadas en tarjetas limpias -->
                        <div class="profile-sections-wrapper" style="margin-top: 24px;">
                            
                            <!-- SECCIÓN: Nombres y Apellidos Desglosados -->
                            <div class="profile-section-block">
                                <h4 class="profile-section-title">Nombres y Apellidos</h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Primer Nombre</span>
                                        <span class="detail-value" data-field="nombre">${perfil.nombre || 'No registrado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Segundo Nombre</span>
                                        <span class="detail-value" data-field="segundoNombre">${perfil.segundoNombre || 'No registrado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Primer Apellido</span>
                                        <span class="detail-value" data-field="primerApellido">${perfil.primerApellido || 'No registrado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Segundo Apellido</span>
                                        <span class="detail-value" data-field="segundoApellido">${perfil.segundoApellido || 'No registrado'}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- SECCIÓN: Identificación -->
                            <div class="profile-section-block">
                                <h4 class="profile-section-title">Información de Identificación</h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Tipo de Documento</span>
                                        <span class="detail-value" data-field="tipoIdentificacion">${perfil.tipoIdentificacion || 'No especificado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Número de Identificación</span>
                                        <span class="detail-value" data-field="numeroIdentificacion">${perfil.numeroIdentificacion || 'No registrado'}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- SECCIÓN: Datos Personales -->
                            <div class="profile-section-block">
                                <h4 class="profile-section-title">Datos Personales</h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Fecha de Nacimiento</span>
                                        <span class="detail-value" data-field="fechaNacimiento">${perfil.fechaNacimiento || 'No registrada'}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- SECCIÓN: Ubicación -->
                            <div class="profile-section-block">
                                <h4 class="profile-section-title">Ubicación y Residencia</h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Departamento</span>
                                        <span class="detail-value" data-field="departamento">${perfil.departamento || 'No especificado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Ciudad</span>
                                        <span class="detail-value" data-field="ciudad">${perfil.ciudad || 'No especificada'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Barrio / Sector</span>
                                        <span class="detail-value" data-field="barrio">${perfil.barrio || 'No especificado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Complemento</span>
                                        <span class="detail-value" data-field="complemento">${perfil.complemento || 'Ninguno'}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            `;

            // Inicializar los eventos del modal de edición y de la foto
            setupUserEditProfileEvents(perfil);
            setupProfilePhotoUpload();

        } catch (err) {
            console.error('Error al cargar el perfil:', err);
            contenedor.innerHTML = `<p style="color: #dc2626; text-align: center; padding: 30px;">No se pudo cargar la información del perfil. Intenta nuevamente.</p>`;
        }
    }
}

// Función que maneja el comportamiento del modal de edición para el perfil de usuario
function setupUserEditProfileEvents(perfilActual) {
  const modal = document.getElementById('editUserModal');
  const btnClose = document.getElementById('closeEditUserModal');
  const btnCancel = document.getElementById('btnCancelEditModal');
  const form = document.getElementById('editUserForm');
  const btnAbrir = document.getElementById('btnAbrirModalPerfil');

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
  };

  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); });

  // Abrir modal y rellenar automáticamente con los datos actuales del perfil
  btnAbrir?.addEventListener('click', () => {
    if (!modal) return;

    modal.style.display = 'flex';
    
    if (document.getElementById('editUsrId')) document.getElementById('editUsrId').value = userIdActual;
    if (document.getElementById('editUsrNombre')) document.getElementById('editUsrNombre').value = perfilActual.nombre || '';
    if (document.getElementById('editUsrSegundoNombre')) document.getElementById('editUsrSegundoNombre').value = perfilActual.segundoNombre || '';
    if (document.getElementById('editUsrPrimerApellido')) document.getElementById('editUsrPrimerApellido').value = perfilActual.primerApellido || '';
    if (document.getElementById('editUsrSegundoApellido')) document.getElementById('editUsrSegundoApellido').value = perfilActual.segundoApellido || '';
    if (document.getElementById('editUsrFechaNac')) document.getElementById('editUsrFechaNac').value = perfilActual.fechaNacimiento || '';
    if (document.getElementById('editUsrNumId')) document.getElementById('editUsrNumId').value = perfilActual.numeroIdentificacion || '';
    if (document.getElementById('editUsrEmail')) document.getElementById('editUsrEmail').value = perfilActual.email || '';
    
    if (document.getElementById('editUsrTipoId')) {
        document.getElementById('editUsrTipoId').value = perfilActual.id_tipo_identificacion || '';
    }
    if (document.getElementById('editUsrRol')) {
        document.getElementById('editUsrRol').value = perfilActual.id_rol || '';
    }
  });

  // Envío del formulario de actualización del perfil
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmitEditUser');
    const originalText = btnSubmit ? btnSubmit.textContent : 'Guardar';

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Actualizando...';
    }

    const bodyData = {
      nombre: document.getElementById('editUsrNombre')?.value.trim() || '',
      segundoNombre: document.getElementById('editUsrSegundoNombre')?.value.trim() || null,
      primerApellido: document.getElementById('editUsrPrimerApellido')?.value.trim() || '',
      segundoApellido: document.getElementById('editUsrSegundoApellido')?.value.trim() || '',
      fechaNacimiento: document.getElementById('editUsrFechaNac')?.value || '',
      numeroIdentificacion: document.getElementById('editUsrNumId')?.value.trim() || '',
      id_tipo_identificacion: parseInt(document.getElementById('editUsrTipoId')?.value) || 1,
      id_rol: parseInt(document.getElementById('editUsrRol')?.value) || 2,
      email: document.getElementById('editUsrEmail')?.value.trim() || '',
      password: document.getElementById('editUsrPassword')?.value || undefined
    };

    try {
      await updateUser(userIdActual, bodyData);
      alert('¡Tus datos se han actualizado con éxito!');
      closeModal();
      ejecutarCambioSeccion('perfil'); 
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert(`Error: ${error.message}`);
    } finally {
      if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = originalText;
      }
    }
  });
}

// Función que gestiona la subida de la foto de perfil al hacer clic en el avatar
function setupProfilePhotoUpload() {
    const avatarContainer = document.querySelector('.profile-avatar-container');
    const inputFile = document.getElementById('inputFotoPerfil');

    if (!avatarContainer || !inputFile) return;

    avatarContainer.addEventListener('click', () => {
        inputFile.click();
    });

    inputFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            console.log("Subiendo nueva foto de perfil...");
            await updateProfilePhoto(userIdActual, file);
            alert('¡Foto de perfil actualizada con éxito!');
            ejecutarCambioSeccion('perfil');
        } catch (error) {
            console.error('Error al subir la foto:', error);
            alert(`No se pudo actualizar la foto: ${error.message}`);
        }
    });
}

// Exponer la función globalmente para que el HTML la reconozca desde el onclick
window.cambiarSeccion = function(seccion, event) {
    if (event) event.preventDefault();
    
    const enlacesMenu = document.querySelectorAll('aside nav a');
    enlacesMenu.forEach(el => el.classList.remove('active'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    ejecutarCambioSeccion(seccion);
};