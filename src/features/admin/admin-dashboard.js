import { API_CONFIG } from '../../core/config/api.config.js';
import { updateProfilePhoto } from '../perfil/perfilApi.js';
import { navigateToView } from './admin.navigation.js';

const userRelationalData = {
  id_tipo_identificacion: null,
  id_rol: null
};

function getAuthToken() {
  return localStorage.getItem('authToken')?.replace(/^["']|["']$/g, '');
}

async function cargarDatosUsuario() {
  try {
    const token = getAuthToken();
    const userId = localStorage.getItem('userId');

    if (!token || !userId) return;

    const endpoint = `${API_CONFIG.BASE_URL}/api/v1/perfil/${userId}/datos-basicos`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Error al obtener los datos básicos');

    const data = await response.json();
    const user = data.data || data; 

    userRelationalData.id_tipo_identificacion = user.id_tipo_identificacion || user.idTipoIdentificacion || 1;
    userRelationalData.id_rol = user.idRol || user.id_rol || 1;

    const nombreInput = document.getElementById('profile-nombre');
    const segundoNombreInput = document.getElementById('profile-segundo-nombre');
    const apellidoInput = document.getElementById('profile-apellido');
    const segundoApellidoInput = document.getElementById('profile-segundo-apellido');
    const tipoIdInput = document.getElementById('profile-tipo-id');
    const numIdInput = document.getElementById('profile-num-id');
    const nacimientoInput = document.getElementById('profile-nacimiento');
    const rolInput = document.getElementById('profile-rol-input');
    const emailInput = document.getElementById('profile-email');
    
    const nameCard = document.getElementById('profile-name-card');
    const roleCard = document.getElementById('profile-role-card');
    const avatarImg = document.getElementById('profile-avatar');
    const sideBarRol = document.getElementById('user-role');
    const sidebarAvatar = document.querySelector('.user-profile-card img, .user-avatar');
    const sidebarName = document.querySelector('.user-profile-card .user-name');
    const welcomeTitle = document.getElementById('welcome-user-title');

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
    if (welcomeTitle) welcomeTitle.textContent = `Hola, ${user.nombre || 'Admin'}`;

    if (user.rol && roleCard) roleCard.textContent = user.rol;
    if (sideBarRol && user.rol) sideBarRol.textContent = user.rol;

    const fotoUrl = user.urlFotoPerfil || user.fotoPerfilUrl;
    if (fotoUrl) {
      if (avatarImg) avatarImg.src = fotoUrl;
      if (sidebarAvatar) sidebarAvatar.src = fotoUrl;
    }

  } catch (error) {
    console.error('Error al cargar datos:', error);
    const welcomeTitle = document.getElementById('welcome-user-title');
    if (welcomeTitle) welcomeTitle.textContent = 'BiblioNepo Admin';
  }
}

async function manejarCambioFotoPerfil(event) {
  const file = event.target.files[0];
  if (!file) return;

  const token = getAuthToken();
  const userId = localStorage.getItem('userId');
  const avatarImg = document.getElementById('profile-avatar');
  const sidebarAvatar = document.querySelector('.user-profile-card img, .user-avatar');

  try {
    if (avatarImg) avatarImg.style.opacity = '0.4';

    const response = await updateProfilePhoto(userId, file, token);
    const nuevaFotoUrl = response.fotoPerfilUrl || response.url || response.urlFotoPerfil || URL.createObjectURL(file);

    if (avatarImg) avatarImg.src = nuevaFotoUrl;
    if (sidebarAvatar) sidebarAvatar.src = nuevaFotoUrl;

    alert('Foto de perfil actualizada.');
  } catch (error) {
    console.error('Error:', error);
    alert('No se pudo subir la imagen.');
  } finally {
    if (avatarImg) avatarImg.style.opacity = '1';
    event.target.value = '';
  }
}

async function guardarDatosUsuario(event) {
  if (event) event.preventDefault();

  const btnGuardar = document.getElementById('btn-guardar-perfil');
  const token = getAuthToken();
  const userId = localStorage.getItem('userId');

  if (!token || !userId) return;

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
  if (passwordVal) payload.password = passwordVal;

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

    if (!response.ok) throw new Error('Error al actualizar datos');

    alert('Datos guardados.');
    const passInput = document.getElementById('profile-password');
    if (passInput) passInput.value = '';

    await cargarDatosUsuario();

  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar Cambios';
    }
  }
}

function initHeaderCarousel() {
  const track = document.getElementById('carouselTrack');
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('prevCarouselBtn');
  const nextBtn = document.getElementById('nextCarouselBtn');
  const container = document.getElementById('heroCarouselContainer');

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

function initPinterestCardSlideshows() {
  const heroCards = document.querySelectorAll('.pinterest-hero-card');

  heroCards.forEach((card, cardIndex) => {
    const slides = card.querySelectorAll('.card-bg-slide');
    const dots = card.querySelectorAll('.mini-dot');
    if (slides.length <= 1) return;

    let activeIdx = 0;
    const intervalTime = 3500 + (cardIndex * 300);

    setInterval(() => {
      slides[activeIdx].classList.remove('active');
      if (dots[activeIdx]) dots[activeIdx].classList.remove('active');

      activeIdx = (activeIdx + 1) % slides.length;

      slides[activeIdx].classList.add('active');
      if (dots[activeIdx]) dots[activeIdx].classList.add('active');
    }, intervalTime);
  });
}

export function loadDashboardView() {
  const container = document.getElementById('admin-content-container');
  if (!container) return;

  container.innerHTML = `
    <div id="view-dashboard" class="admin-view" style="display: block;">
      
      <!-- CARRUSEL SUPERIOR -->
      <div class="carousel-hero-container" id="heroCarouselContainer">
        <div class="carousel-track" id="carouselTrack">
          
          <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80');">
            <div class="carousel-slide-overlay"></div>
            <div class="carousel-slide-content">
              <span class="carousel-slide-tag">BiblioNepo</span>
              <h2 class="carousel-slide-title">Catálogo de Libros</h2>
              <p class="carousel-slide-desc">Revisa la lista de libros, gestiona préstamos y consulta la disponibilidad.</p>
              <button class="carousel-slide-btn" data-nav="catalog" aria-label="Ir al catálogo de libros">
                Ir al Catálogo <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80');">
            <div class="carousel-slide-overlay"></div>
            <div class="carousel-slide-content">
              <span class="carousel-slide-tag">Usuarios</span>
              <h2 class="carousel-slide-title">Gestión de Cuentas</h2>
              <p class="carousel-slide-desc">Administra los accesos de estudiantes, profesores y administradores.</p>
              <button class="carousel-slide-btn" data-nav="users" aria-label="Ir a ver usuarios">
                Ver usuarios <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </div>
          </div>

        </div>

        <div class="carousel-controls">
          <div class="carousel-dots" aria-hidden="true">
            <span class="carousel-dot active"></span>
            <span class="carousel-dot"></span>
          </div>
          <button class="carousel-arrow" id="prevCarouselBtn" title="Anterior" aria-label="Ver diapositiva anterior"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
          <button class="carousel-arrow" id="nextCarouselBtn" title="Siguiente" aria-label="Ver diapositiva siguiente"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
        </div>
      </div>

      <!-- ENCABEZADO -->
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 1.2rem; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Módulos principales</h2>
        <p style="font-size: 0.85rem; color: #64748b; margin: 0;">Haz clic en una sección para acceder</p>
      </div>

      <!-- CARDS HERO ESTILO PINTEREST -->
      <div class="pinterest-masonry-grid">
        
        <!-- CARD 1: CATÁLOGO -->
        <article class="pinterest-hero-card tall" data-nav="catalog" tabindex="0" role="button" aria-label="Ir a catálogo">
          <div class="card-slideshow-wrapper">
            <div class="card-bg-slide active" style="background-image: url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80');"></div>
            <div class="card-bg-slide" style="background-image: url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80');"></div>
            <div class="card-bg-slide" style="background-image: url('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80');"></div>
          </div>
          <div class="pinterest-card-overlay">
            <div class="pinterest-card-top">
              <span class="badge-tag"><i class="fa-solid fa-book" aria-hidden="true"></i> Libros</span>
              <div class="mini-slide-dots" aria-hidden="true">
                <span class="mini-dot active"></span>
                <span class="mini-dot"></span>
                <span class="mini-dot"></span>
              </div>
            </div>
            <div class="pinterest-card-bottom">
              <h3 class="pinterest-card-title">Catálogo</h3>
              <p class="pinterest-card-desc">Lista general de libros y estado de préstamos.</p>
              <span class="pinterest-card-cta">Ir al catálogo <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
            </div>
          </div>
        </article>

        <!-- CARD 2: USUARIOS -->
        <article class="pinterest-hero-card medium" data-nav="users" tabindex="0" role="button" aria-label="Ir a usuarios">
          <div class="card-slideshow-wrapper">
            <div class="card-bg-slide active" style="background-image: url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80');"></div>
            <div class="card-bg-slide" style="background-image: url('https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=800&q=80');"></div>
          </div>
          <div class="pinterest-card-overlay">
            <div class="pinterest-card-top">
              <span class="badge-tag"><i class="fa-solid fa-users" aria-hidden="true"></i> Usuarios</span>
              <div class="mini-slide-dots" aria-hidden="true">
                <span class="mini-dot active"></span>
                <span class="mini-dot"></span>
              </div>
            </div>
            <div class="pinterest-card-bottom">
              <h3 class="pinterest-card-title">Usuarios</h3>
              <p class="pinterest-card-desc">Registro de usuarios y cuentas del sistema.</p>
              <span class="pinterest-card-cta">Ver usuarios <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
            </div>
          </div>
        </article>

        <!-- CARD 3: AUTORES -->
        <article class="pinterest-hero-card medium-tall" data-nav="authors" tabindex="0" role="button" aria-label="Ir a autores">
          <div class="card-slideshow-wrapper">
            <div class="card-bg-slide active" style="background-image: url('https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80');"></div>
            <div class="card-bg-slide" style="background-image: url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80');"></div>
          </div>
          <div class="pinterest-card-overlay">
            <div class="pinterest-card-top">
              <span class="badge-tag"><i class="fa-solid fa-feather" aria-hidden="true"></i> Autores</span>
              <div class="mini-slide-dots" aria-hidden="true">
                <span class="mini-dot active"></span>
                <span class="mini-dot"></span>
              </div>
            </div>
            <div class="pinterest-card-bottom">
              <h3 class="pinterest-card-title">Autores</h3>
              <p class="pinterest-card-desc">Información y libros organizados por autor.</p>
              <span class="pinterest-card-cta">Ver autores <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
            </div>
          </div>
        </article>

        <!-- CARD 4: CATEGORÍAS -->
        <article class="pinterest-hero-card compact" data-nav="categories" tabindex="0" role="button" aria-label="Ir a categorías">
          <div class="card-slideshow-wrapper">
            <div class="card-bg-slide active" style="background-image: url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80');"></div>
            <div class="card-bg-slide" style="background-image: url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80');"></div>
          </div>
          <div class="pinterest-card-overlay">
            <div class="pinterest-card-top">
              <span class="badge-tag"><i class="fa-solid fa-folder-tree" aria-hidden="true"></i> Categorías</span>
              <div class="mini-slide-dots" aria-hidden="true">
                <span class="mini-dot active"></span>
                <span class="mini-dot"></span>
              </div>
            </div>
            <div class="pinterest-card-bottom">
              <h3 class="pinterest-card-title">Categorías</h3>
              <p class="pinterest-card-desc">Secciones y temas de la biblioteca.</p>
              <span class="pinterest-card-cta">Ver categorías <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
            </div>
          </div>
        </article>

        <!-- CARD 5: GÉNEROS -->
        <article class="pinterest-hero-card medium-tall" data-nav="genres" tabindex="0" role="button" aria-label="Ir a géneros">
          <div class="card-slideshow-wrapper">
            <div class="card-bg-slide active" style="background-image: url('https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=800&q=80');"></div>
            <div class="card-bg-slide" style="background-image: url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80');"></div>
          </div>
          <div class="pinterest-card-overlay">
            <div class="pinterest-card-top">
              <span class="badge-tag"><i class="fa-solid fa-tags" aria-hidden="true"></i> Géneros</span>
              <div class="mini-slide-dots" aria-hidden="true">
                <span class="mini-dot active"></span>
                <span class="mini-dot"></span>
              </div>
            </div>
            <div class="pinterest-card-bottom">
              <h3 class="pinterest-card-title">Géneros y formatos</h3>
              <p class="pinterest-card-desc">Tipos de libro y formatos disponibles.</p>
              <span class="pinterest-card-cta">Ver géneros <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
            </div>
          </div>
        </article>

        <!-- CARD 6: ROLES -->
        <article class="pinterest-hero-card medium" data-nav="roles" tabindex="0" role="button" aria-label="Ir a configuración de roles">
          <div class="card-slideshow-wrapper">
            <div class="card-bg-slide active" style="background-image: url('https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80');"></div>
            <div class="card-bg-slide" style="background-image: url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80');"></div>
          </div>
          <div class="pinterest-card-overlay">
            <div class="pinterest-card-top">
              <span class="badge-tag"><i class="fa-solid fa-user-shield" aria-hidden="true"></i> Permisos</span>
              <div class="mini-slide-dots" aria-hidden="true">
                <span class="mini-dot active"></span>
                <span class="mini-dot"></span>
              </div>
            </div>
            <div class="pinterest-card-bottom">
              <h3 class="pinterest-card-title">Roles</h3>
              <p class="pinterest-card-desc">Configuración de permisos y roles de acceso.</p>
              <span class="pinterest-card-cta">Ver roles <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
            </div>
          </div>
        </article>

      </div>

    </div>

    <!-- VISTA DE PERFIL (DISPOSICIÓN VERTICAL DESTAQUADA) -->
    <div id="view-profile" class="admin-view" style="display: none;">
      <div class="profile-container">
        
        <header class="profile-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="profile-badge-tag">CONFIGURACIÓN</span>
            <h2 class="profile-title">Mi Perfil</h2>
          </div>
          <button id="btn-logout-profile" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #fee2e2; background: #fef2f2; color: #dc2626; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;" aria-label="Cerrar sesión de mi perfil">
            <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Cerrar Sesión
          </button>
        </header>

        <div class="profile-vertical-layout">
          <!-- Tarjeta Superior: Foto de Perfil, Nombre y Rol -->
          <div class="profile-card avatar-card-top">
            <div class="avatar-wrapper">
              <img id="profile-avatar" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>" alt="Avatar del perfil actual" class="avatar-preview">
              <label for="input-foto-perfil" class="avatar-edit-btn" title="Cambiar foto de perfil" tabindex="0" role="button" aria-label="Actualizar foto de perfil">
                <i class="fa-solid fa-camera" aria-hidden="true"></i>
              </label>
              <input type="file" id="input-foto-perfil" accept="image/*" hidden>
            </div>
            <div class="avatar-info-text">
              <h3 id="profile-name-card" class="user-display-name">&nbsp;</h3>
              <span id="profile-role-card" class="user-role-badge">&nbsp;</span>
            </div>
          </div>

          <!-- Tarjeta Inferior: Formulario de Información Personal -->
          <div class="profile-card form-card">
            <div class="card-header">
              <h3>Información personal</h3>
              <p>Actualiza tus datos de contacto y credenciales de acceso al sistema.</p>
            </div>

            <form id="profile-form" class="profile-form-grid">
              <div class="form-group">
                <label for="profile-nombre">Primer Nombre</label>
                <input type="text" id="profile-nombre" class="form-control" disabled>
              </div>

              <div class="form-group">
                <label for="profile-segundo-nombre">Segundo Nombre</label>
                <input type="text" id="profile-segundo-nombre" class="form-control" disabled>
              </div>

              <div class="form-group">
                <label for="profile-apellido">Primer Apellido</label>
                <input type="text" id="profile-apellido" class="form-control" disabled>
              </div>

              <div class="form-group">
                <label for="profile-segundo-apellido">Segundo Apellido</label>
                <input type="text" id="profile-segundo-apellido" class="form-control" disabled>
              </div>

              <div class="form-group">
                <label for="profile-tipo-id">Tipo de Identificación</label>
                <input type="text" id="profile-tipo-id" class="form-control" disabled>
              </div>

              <div class="form-group">
                <label for="profile-num-id">Número de Identificación</label>
                <input type="text" id="profile-num-id" class="form-control" disabled>
              </div>

              <div class="form-group">
                <label for="profile-nacimiento">Fecha de Nacimiento</label>
                <input type="date" id="profile-nacimiento" class="form-control" disabled>
              </div>

              <div class="form-group">
                <label for="profile-rol-input">Rol en el Sistema</label>
                <input type="text" id="profile-rol-input" class="form-control readonly-input" disabled>
              </div>

              <div class="form-group">
                <label for="profile-email">Correo Electrónico</label>
                <input type="email" id="profile-email" class="form-control" disabled>
              </div>

              <div class="form-group">
                <label for="profile-password">Nueva Contraseña (Opcional)</label>
                <input type="password" id="profile-password" class="form-control" placeholder="••••••••">
              </div>

              <div class="form-actions">
                <button type="submit" id="btn-guardar-perfil" class="btn-save-profile" aria-label="Guardar cambios del perfil">
                  <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  `;

  const elementsWithNav = container.querySelectorAll('[data-nav]');
  elementsWithNav.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = el.getAttribute('data-nav');
      if (targetView) {
        navigateToView(targetView);
      }
    });
    
    // Soporte para tarjetas con navegación por teclado
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  const profileForm = document.getElementById('profile-form');
  if (profileForm) profileForm.addEventListener('submit', guardarDatosUsuario);

  const inputFotoPerfil = document.getElementById('input-foto-perfil');
  if (inputFotoPerfil) inputFotoPerfil.addEventListener('change', manejarCambioFotoPerfil);
  
  // Soporte para trigger con teclado del input de foto
  const lblFotoPerfil = container.querySelector('label[for="input-foto-perfil"]');
  if(lblFotoPerfil) {
    lblFotoPerfil.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputFotoPerfil.click();
      }
    });
  }

  // Redirección y limpieza desde la vista de perfil
  const btnLogoutProfile = document.getElementById('btn-logout-profile');
  if (btnLogoutProfile) {
    btnLogoutProfile.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      window.location.href = 'index.html';
    });
  }

  initHeaderCarousel();
  initPinterestCardSlideshows();

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