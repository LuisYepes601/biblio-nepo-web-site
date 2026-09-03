import { loadDashboardView } from './admin-dashboard.js';
import { loadUsersView } from '../users/users.js';
import { loadAuthorsView} from '../autors/authors.js';
import { loadBooksView } from '../books/books.js'; 
import { loadCategoriesView } from '../categories/categories.js';

export function initAdminNavigation() {
  const container = document.getElementById('admin-sidebar-container');
  if (!container) return;

  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand-box">
          <div class="brand-icon"><i class="fa-solid fa-book-open"></i></div>
          <span>BiblioNepo</span>
        </div>

        <div class="user-profile-card">
          <div class="user-info">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="Avatar" class="user-avatar">
            <div>
              <div class="user-name">Carlos Admin</div>
              <div class="user-role">Super Administrador</div>
            </div>
          </div>
          <i class="fa-solid fa-chevron-down profile-arrow"></i>
        </div>

        <nav class="sidebar-nav">
          <ul id="adminNavList">
            <li class="active"><a href="#dashboard" data-view="dashboard"><i class="fa-solid fa-chart-pie"></i> Dashboard</a></li>
            <li><a href="#catalogo" data-view="catalog"><i class="fa-solid fa-book"></i> Catálogo Libros</a></li>
            <li><a href="#categorias" data-view="categories"><i class="fa-solid fa-tags"></i> Categorías</a></li>
            <li><a href="#autores" data-view="authors"><i class="fa-solid fa-feather"></i> Autores</a></li>
            <li><a href="#usuarios" data-view="users"><i class="fa-solid fa-users"></i> Gestión Usuarios</a></li>
            <li><a href="#prestamos" data-view="loans"><i class="fa-solid fa-bookmark"></i> Préstamos Activos</a></li>
            <li><a href="#configuracion" data-view="settings"><i class="fa-solid fa-gear"></i> Configuración</a></li>
          </ul>
        </nav>
      </div>

      <div class="sidebar-promo">
        <h4>BiblioNepo Pro</h4>
        <p>Sistema optimizado para la gestión bibliotecaria e institucional.</p>
        <button class="promo-btn" id="btnGoToPublic">Sitio Público</button>
      </div>
    </aside>
  `;

  const navItems = container.querySelectorAll('#adminNavList li');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(l => l.classList.remove('active'));
      item.classList.add('active');
      
      const view = item.querySelector('a').dataset.view;
      
      if (view === 'dashboard') {
        loadDashboardView();
      } else if (view === 'catalog') {
        loadBooksView();
      } else if (view === 'categories') {
        loadCategoriesView();
      } else if (view === 'authors') {
        loadAuthorsView();
      } else if (view === 'users') {
        loadUsersView();
      }
    });
  });
}