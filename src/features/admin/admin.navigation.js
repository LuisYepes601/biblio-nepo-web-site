import { loadDashboardView, switchView } from './admin-dashboard.js';
import { loadUsersView } from '../users/users.js';
import { loadAuthorsView } from '../autors/authors.js';
import { loadBooksView } from '../books/books.js'; 
import { loadCategoriesView } from '../categories/categories.js';
import { loadBookGenresView } from '../book-genres/book-genres.js';
import { loadRolesView } from '../roles/roles.js';
import { loadFormatsView } from '../formats/formats.js';
import { loadIdentificationTypesView } from '../identification-types/identification-types.js';
import { loadFavoritesView } from '../favoritos/favorites.component.js'; // <-- Importación agregada

/**
 * Función centralizada para limpiar la sesión y redirigir al index.html
 */
export function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  window.location.href = 'index.html';
}

export function navigateToView(view) {
  const container = document.getElementById('admin-sidebar-container');
  if (container) {
    const navItems = container.querySelectorAll('.sidebar-nav li');
    navItems.forEach(item => {
      const link = item.querySelector('a');
      if (link && link.dataset.view === view) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  if (view === 'dashboard') {
    loadDashboardView();
    switchView('dashboard'); 
  } else if (view === 'catalog') {
    loadBooksView();
  } else if (view === 'favorites') { // <-- Ruta para cargar favoritos en el panel de admin
    loadFavoritesView('#admin-content-container');
  } else if (view === 'categories') {
    loadCategoriesView();
  } else if (view === 'genres') {
    loadBookGenresView();
  } else if (view === 'formats') {
    loadFormatsView();
  } else if (view === 'authors') {
    loadAuthorsView();
  } else if (view === 'id-types') {
    loadIdentificationTypesView();
  } else if (view === 'users') {
    loadUsersView();
  } else if (view === 'roles') {
    loadRolesView();
  }
}

export function initAdminNavigation() {
  const container = document.getElementById('admin-sidebar-container');
  if (!container) return;

  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-top">

        <!-- LOGO Y MARCA -->
        <div class="brand-box">
          <img src="https://res.cloudinary.com/divhisdcx/image/upload/v1787950293/logo_biblionepo_circular_transparente_ts0glk.svg" alt="BiblioNepo Logo" class="brand-logo-img">
          <span class="brand-name">BiblioNepo</span>
        </div>

        <!-- TARJETA DE PERFIL INTERACTIVA -->
        <div class="user-profile-card" id="btnProfileView" title="Ver mi perfil">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="Avatar" class="user-avatar">
          <div class="user-details">
            <span class="user-name">Carlos Admin</span>
            <span class="user-role" id="user-role">Super Administrador</span>
          </div>
          <i class="fa-solid fa-chevron-right profile-arrow"></i>
        </div>

        <!-- MENÚ NAVEGACIÓN ORGANIZADO -->
        <nav class="sidebar-nav">
          
          <div class="nav-section">
            <span class="nav-section-title">PRINCIPAL</span>
            <ul class="nav-list">
              <li class="active"><a href="#dashboard" data-view="dashboard"><i class="fa-solid fa-chart-pie"></i> <span>Dashboard</span></a></li>
              <li><a href="#catalogo" data-view="catalog"><i class="fa-solid fa-book"></i> <span>Catálogo Libros</span></a></li>
              <li><a href="#favoritos" data-view="favorites"><i class="fa-solid fa-heart"></i> <span>Mis Favoritos</span></a></li>
              <li><a href="#prestamos" data-view="loans"><i class="fa-solid fa-bookmark"></i> <span>Préstamos Activos</span></a></li>
            </ul>
          </div>

          <div class="nav-section">
            <span class="nav-section-title">CATÁLOGO</span>
            <ul class="nav-list">
              <li><a href="#categorias" data-view="categories"><i class="fa-solid fa-folder-tree"></i> <span>Categorías</span></a></li>
              <li><a href="#generos" data-view="genres"><i class="fa-solid fa-tags"></i> <span>Géneros Libro</span></a></li>
              <li><a href="#formatos" data-view="formats"><i class="fa-solid fa-swatchbook"></i> <span>Formatos</span></a></li>
              <li><a href="#autores" data-view="authors"><i class="fa-solid fa-feather"></i> <span>Autores</span></a></li>
            </ul>
          </div>

          <div class="nav-section">
            <span class="nav-section-title">ADMINISTRACIÓN</span>
            <ul class="nav-list">
              <li><a href="#usuarios" data-view="users"><i class="fa-solid fa-users"></i> <span>Gestión Usuarios</span></a></li>
              <li><a href="#roles" data-view="roles"><i class="fa-solid fa-user-shield"></i> <span>Gestión Roles</span></a></li>
              <li><a href="#identificaciones" data-view="id-types"><i class="fa-solid fa-address-card"></i> <span>Tipos Documento</span></a></li>
              <li><a href="#configuracion" data-view="settings"><i class="fa-solid fa-gear"></i> <span>Configuración</span></a></li>
            </ul>
          </div>

        </nav>
      </div>

      <!-- BOTONES SITIO PÚBLICO Y CERRAR SESIÓN -->
      <div class="sidebar-footer" style="display: flex; flex-direction: column; gap: 8px;">
        <button class="btn-public-site" id="btnGoToPublic">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
          <span>Sitio Público</span>
        </button>
        <button class="btn-public-site" id="btnLogout" style="background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; width: 100%; cursor: pointer;">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `;

  // Botón Sitio Público
  const btnGoToPublic = container.querySelector('#btnGoToPublic');
  if (btnGoToPublic) {
    btnGoToPublic.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Tarjeta de perfil
  const btnProfileView = container.querySelector('#btnProfileView');
  if (btnProfileView) {
    btnProfileView.addEventListener('click', () => {
      container.querySelectorAll('.sidebar-nav li').forEach(l => l.classList.remove('active'));
      loadDashboardView();
      switchView('profile');
    });
  }

  // Navegación menú lateral
  const navItems = container.querySelectorAll('.sidebar-nav li');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const link = item.querySelector('a');
      if (link) {
        const view = link.dataset.view;
        navigateToView(view);
      }
    });
  });
}

// CAPTURA GLOBAL DE CUALQUIER BOTÓN DE SALIDA
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button, a, div[role="button"]');
  if (!btn) return;

  const titleAttr = (btn.getAttribute('title') || '').toLowerCase();
  const isLogoutBtn = 
    btn.id === 'btnLogout' ||
    btn.id === 'btnLogoutHeader' ||
    btn.id === 'btn-logout-header' ||
    btn.id === 'btn-logout-profile' ||
    btn.classList.contains('btn-logout') ||
    btn.querySelector('.fa-power-off, .fa-right-from-bracket, .fa-arrow-right-from-bracket') !== null ||
    titleAttr.includes('cerrar') ||
    titleAttr.includes('salir');

  if (isLogoutBtn) {
    e.preventDefault();
    logoutUser();
  }
});