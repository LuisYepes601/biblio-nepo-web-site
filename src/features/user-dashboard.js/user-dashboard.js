import { loadBooksView } from '../books/books.js';
import { initCatalog } from '../catalog/catalog.component.js';
import { fetchPerfilDatosBasicos, updateProfilePhoto } from '../perfil/perfilApi.js'; 
import { updateUser } from './user-dashboard-api.js';
import { loadFavoritesView } from '../favoritos/favorites.component.js';

const userIdActual = localStorage.getItem('userId') || 1; 

document.addEventListener('DOMContentLoaded', () => {
    setupLogoutListener();
    cambiarSeccion('catalogo');
});

/**
 * Control del evento de salida / Cerrar Sesión
 */
function setupLogoutListener() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#btnLogoutUser, #btnLogout, .btn-sidebar-logout');
        if (btn) {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        }
    });
}

/**
 * Sincroniza los datos del usuario en el Header superior y en el pie de la Sidebar
 */
async function actualizarDatosSidebarYHeader(datosPerfil = null) {
    try {
        const perfil = datosPerfil || await fetchPerfilDatosBasicos(userIdActual);
        const nombreCompleto = `${perfil.nombre || ''} ${perfil.primerApellido || ''}`.trim() || 'Usuario';

        // 1. Indicador en Header
        const userIndicator = document.getElementById('usuarioIndicador') || document.querySelector('.user-profile-badge');
        if (userIndicator) userIndicator.textContent = nombreCompleto;

        // 2. Elementos del Pie de la Sidebar
        const sidebarName = document.getElementById('sidebarUserName') || document.querySelector('.sidebar-user-name');
        if (sidebarName) sidebarName.textContent = nombreCompleto;

        const sidebarRole = document.getElementById('sidebarUserRole') || document.querySelector('.sidebar-user-role');
        if (sidebarRole && perfil.rol) sidebarRole.textContent = perfil.rol;

        const sidebarAvatar = document.getElementById('sidebarUserAvatar') || document.querySelector('.sidebar-user-avatar');
        if (sidebarAvatar && perfil.urlFotoPerfil) sidebarAvatar.src = perfil.urlFotoPerfil;

    } catch (e) {
        console.error('Error al actualizar datos de usuario en la interfaz:', e);
    }
}

/**
 * Control automático de movimiento continuo para carruseles Hero
 */
function initUserHeroCarousel(carouselId = 'userHeroCarousel', trackId = 'userCarouselTrack', prevId = 'userPrevBtn', nextId = 'userNextBtn') {
  const container = document.getElementById(carouselId);
  const track = document.getElementById(trackId);
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];
  const dots = container ? container.querySelectorAll('.carousel-dot') : [];
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;

  function updateCarousel(index) {
    if (index < 0) currentIndex = slides.length - 1;
    else if (index >= slides.length) currentIndex = 0;
    else currentIndex = index;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
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

/**
 * Cambia la sección activa manteniendo sincronizado el encabezado y el contenido.
 */
async function ejecutarCambioSeccion(seccion) {
    const tituloSeccion = document.getElementById('tituloSeccion');
    const contenedor = document.getElementById('contenedorDinamico');

    if (!contenedor) return;
    contenedor.innerHTML = ''; 

    if (seccion === 'catalogo') {
        if (tituloSeccion) tituloSeccion.textContent = 'Explorar Catálogo';
        
        contenedor.innerHTML = `
            <!-- CARRUSEL HERO AUTOMÁTICO DE CATÁLOGO -->
            <div class="carousel-hero-container" id="userHeroCarousel">
              <div class="carousel-track" id="userCarouselTrack">
                
                <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80');">
                  <div class="carousel-slide-overlay"></div>
                  <div class="carousel-slide-content">
                    <span class="carousel-slide-tag">Novedades Destacadas</span>
                    <h2 class="carousel-slide-title">Explora la Biblioteca Digital</h2>
                    <p class="carousel-slide-desc">Accede a miles de títulos digitales, solicita préstamos físicos y gestiona tus lecturas favoritas.</p>
                  </div>
                </div>

                <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80');">
                  <div class="carousel-slide-overlay"></div>
                  <div class="carousel-slide-content">
                    <span class="carousel-slide-tag">Lectura Recomendada</span>
                    <h2 class="carousel-slide-title">Múltiples Formatos Disponibles</h2>
                    <p class="carousel-slide-desc">Disfruta de audiolibros, archivos PDF y ePub adaptados para cualquier dispositivo.</p>
                  </div>
                </div>

              </div>

              <div class="carousel-controls">
                <div class="carousel-dots">
                  <span class="carousel-dot active"></span>
                  <span class="carousel-dot"></span>
                </div>
                <button class="carousel-arrow" id="userPrevBtn" title="Anterior"><i class="fa-solid fa-chevron-left"></i></button>
                <button class="carousel-arrow" id="userNextBtn" title="Siguiente"><i class="fa-solid fa-chevron-right"></i></button>
              </div>
            </div>

            <div id="filterTabs"></div>
            <div id="bookGrid" class="grid-libros"></div>
        `;

        initUserHeroCarousel('userHeroCarousel', 'userCarouselTrack', 'userPrevBtn', 'userNextBtn');
        initCatalog(); 
        await actualizarDatosSidebarYHeader();
    } 
    else if (seccion === 'prestamos') {
        if (tituloSeccion) tituloSeccion.textContent = 'Mis Préstamos';
        
        contenedor.innerHTML = `
            <!-- CARRUSEL HERO DE PRÉSTAMOS -->
            <div class="carousel-hero-container" id="loansHeroCarousel">
              <div class="carousel-track" id="loansCarouselTrack">
                
                <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80');">
                  <div class="carousel-slide-overlay"></div>
                  <div class="carousel-slide-content">
                    <span class="carousel-slide-tag">Préstamos & Devoluciones</span>
                    <h2 class="carousel-slide-title">Gestión de Préstamos Activos</h2>
                    <p class="carousel-slide-desc">Revisa la fecha de vencimiento, renovaciones y el estado de tus libros prestados en tiempo real.</p>
                  </div>
                </div>

                <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80');">
                  <div class="carousel-slide-overlay"></div>
                  <div class="carousel-slide-content">
                    <span class="carousel-slide-tag">Fechas & Compromisos</span>
                    <h2 class="carousel-slide-title">Devoluciones a Tiempo</h2>
                    <p class="carousel-slide-desc">Mantén tus préstamos al día para asegurar la disponibilidad del catálogo para toda la comunidad.</p>
                  </div>
                </div>

              </div>

              <div class="carousel-controls">
                <div class="carousel-dots">
                  <span class="carousel-dot active"></span>
                  <span class="carousel-dot"></span>
                </div>
                <button class="carousel-arrow" id="loansPrevBtn" title="Anterior"><i class="fa-solid fa-chevron-left"></i></button>
                <button class="carousel-arrow" id="loansNextBtn" title="Siguiente"><i class="fa-solid fa-chevron-right"></i></button>
              </div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 48px 24px; text-align: center; max-width: 600px; margin: 20px auto; box-shadow: 0 1px 3px rgba(15,23,42,0.04);">
                <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 16px;">
                    <i class="fa-solid fa-bookmark"></i>
                </div>
                <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #0f172a;">Tus Préstamos Activos</h3>
                <p style="color: #64748b; margin: 8px 0 0 0; font-size: 0.875rem; line-height: 1.5;">Actualmente no tienes préstamos pendientes de devolución. Cuando solicites un libro impreso o digital, aparecerá listado aquí.</p>
            </div>
        `;

        initUserHeroCarousel('loansHeroCarousel', 'loansCarouselTrack', 'loansPrevBtn', 'loansNextBtn');
        await actualizarDatosSidebarYHeader();
    } 
    else if (seccion === 'favoritos') {
        if (tituloSeccion) tituloSeccion.textContent = 'Mis Favoritos';
        await loadFavoritesView('#contenedorDinamico');
        await actualizarDatosSidebarYHeader();
    }
    else if (seccion === 'perfil') {
        if (tituloSeccion) tituloSeccion.textContent = 'Mi Perfil';
        
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #64748b;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; color: #2563eb; margin-bottom: 12px;"></i>
                <p style="margin: 0; font-size: 0.9rem; font-weight: 500;">Cargando perfil...</p>
            </div>
        `;

        try {
            const perfil = await fetchPerfilDatosBasicos(userIdActual);
            await actualizarDatosSidebarYHeader(perfil);

            contenedor.innerHTML = `
                <div class="profile-card-modern">
                    <div class="profile-header-bg">
                        <span class="profile-role-badge">
                            <i class="fa-solid fa-user-shield" style="margin-right: 6px;"></i>
                            ${perfil.rol || 'Usuario'}
                        </span>
                    </div>
                    
                    <div class="profile-content">
                        <div class="profile-user-main-row">
                            <div style="display: flex; gap: 20px; align-items: flex-end; flex-wrap: wrap;">
                                
                                <div class="profile-avatar-container" title="Cambiar foto de perfil">
                                    <img src="${perfil.urlFotoPerfil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces'}" alt="Foto de perfil" class="profile-avatar" id="avatarImage">
                                    <input type="file" id="inputFotoPerfil" accept="image/*" style="display: none;">
                                    <div class="avatar-upload-badge">
                                        <i class="fa-solid fa-camera"></i>
                                    </div>
                                </div>

                                <div class="profile-titles">
                                    <h2 class="profile-name">
                                        ${perfil.nombre || ''} ${perfil.segundoNombre || ''} ${perfil.primerApellido || ''} ${perfil.segundoApellido || ''}
                                    </h2>
                                    <p class="profile-email">
                                        <i class="fa-regular fa-envelope" style="margin-right: 6px; color: #94a3b8;"></i>
                                        ${perfil.email || 'Sin correo registrado'}
                                    </p>
                                </div>
                            </div>

                            <button id="btnAbrirModalPerfil" class="btn-primary-custom">
                                <i class="fa-solid fa-pen-to-square"></i>
                                Editar Perfil
                            </button>
                        </div>

                        <div class="profile-sections-wrapper">
                            
                            <div class="profile-section-block">
                                <h4 class="profile-section-title">
                                    <i class="fa-regular fa-user" style="color: #2563eb;"></i>
                                    Nombres y Apellidos
                                </h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Primer Nombre</span>
                                        <span class="detail-value">${perfil.nombre || '—'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Segundo Nombre</span>
                                        <span class="detail-value">${perfil.segundoNombre || '—'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Primer Apellido</span>
                                        <span class="detail-value">${perfil.primerApellido || '—'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Segundo Apellido</span>
                                        <span class="detail-value">${perfil.segundoApellido || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-section-block">
                                <h4 class="profile-section-title">
                                    <i class="fa-regular fa-address-card" style="color: #2563eb;"></i>
                                    Información de Documento
                                </h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Tipo de Documento</span>
                                        <span class="detail-value">${perfil.tipoIdentificacion || 'No registrado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Número de Documento</span>
                                        <span class="detail-value">${perfil.numeroIdentificacion || 'No registrado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Fecha de Nacimiento</span>
                                        <span class="detail-value">${perfil.fechaNacimiento || 'No registrada'}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-section-block">
                                <h4 class="profile-section-title">
                                    <i class="fa-solid fa-location-dot" style="color: #2563eb;"></i>
                                    Residencia y Dirección
                                </h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Departamento</span>
                                        <span class="detail-value">${perfil.departamento || 'No especificado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Ciudad</span>
                                        <span class="detail-value">${perfil.ciudad || 'No especificada'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Barrio / Sector</span>
                                        <span class="detail-value">${perfil.barrio || 'No especificado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Dirección / Complemento</span>
                                        <span class="detail-value">${perfil.complemento || 'No registrada'}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            `;

            setupUserEditProfileEvents(perfil);
            setupProfilePhotoUpload();

        } catch (err) {
            console.error('Error al cargar perfil:', err);
            contenedor.innerHTML = `
                <div style="background: #ffffff; border: 1px solid #fee2e2; border-radius: 12px; padding: 32px; text-align: center; color: #dc2626; max-width: 500px; margin: 20px auto;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 1.8rem; margin-bottom: 10px;"></i>
                    <p style="margin: 0; font-weight: 600; font-size: 0.9rem;">No se pudo obtener la información de tu perfil.</p>
                </div>
            `;
        }
    }
}

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
        document.getElementById('editUsrTipoId').value = perfilActual.id_tipo_identificacion || 1;
    }
    if (document.getElementById('editUsrRol')) {
        document.getElementById('editUsrRol').value = perfilActual.id_rol || 2;
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmitEditUser');
    const originalText = btnSubmit ? btnSubmit.textContent : 'Guardar Cambios';

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Guardando...';
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
            await updateProfilePhoto(userIdActual, file);
            ejecutarCambioSeccion('perfil');
        } catch (error) {
            console.error('Error al subir foto:', error);
            alert(`No se pudo actualizar la foto: ${error.message}`);
        }
    });
}

/**
 * Función global expuesta para cambiar de sección marcando activas las opciones del menú
 */
window.cambiarSeccion = function(seccion, event) {
    if (event) event.preventDefault();
    
    // Remueve la clase active de todos los enlaces de la barra lateral
    const enlacesMenu = document.querySelectorAll('aside nav a, .sidebar-nav a, .sidebar-nav-list a, .sidebar-nav-item a');
    enlacesMenu.forEach(el => el.classList.remove('active'));
    
    // Si fue desencadenado por un clic
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        // Si fue llamado por código, busca el enlace correspondiente en la Sidebar
        const enlaceCorrespondiente = document.querySelector(`a[onclick*="'${seccion}'"]`) || document.querySelector(`a[href="#${seccion}"]`);
        if (enlaceCorrespondiente) {
            enlaceCorrespondiente.classList.add('active');
        }
    }

    ejecutarCambioSeccion(seccion);
};