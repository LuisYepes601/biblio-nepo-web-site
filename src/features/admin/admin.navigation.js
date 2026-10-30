import { loadDashboardView, switchView } from './admin-dashboard.js';
import { loadUsersView } from '../users/users.js';
import { loadAuthorsView } from '../autors/authors.js';
import { loadBooksView } from '../books/books.js'; 
import { loadCategoriesView } from '../categories/categories.js';
import { loadBookGenresView } from '../book-genres/book-genres.js';
import { loadRolesView } from '../roles/roles.js';
import { loadFormatsView } from '../formats/formats.js';
import { loadIdentificationTypesView } from '../identification-types/identification-types.js';
import { loadFavoritesView } from '../favoritos/favorites.component.js'; 

// Control global de voz y estado de navegación
let recognitionInstance = null;
let isListeningGlobal = false;
let currentViewName = ''; // Para recordar en qué sección estamos y no repetir

/**
 * Función para sintetizar texto a voz
 */
export function hablarTexto(mensaje) {
  if (!('speechSynthesis' in window)) return;

  // Pausar micrófono mientras habla para evitar auto-escucha
  if (recognitionInstance && isListeningGlobal) {
    try { recognitionInstance.stop(); } catch (e) {}
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(mensaje);
  utterance.lang = 'es-ES';
  utterance.rate = 1.0; 
  utterance.pitch = 1;

  utterance.onend = () => {
    if (recognitionInstance && isListeningGlobal) {
      setTimeout(() => {
        try { recognitionInstance.start(); } catch (e) {}
      }, 350);
    }
  };

  window.speechSynthesis.speak(utterance);
}

export function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  hablarTexto('Sesión cerrada.');
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

  const nombresVistasMap = {
    'dashboard': 'Dashboard',
    'catalog': 'Catálogo de Libros',
    'favorites': 'Mis Favoritos',
    'categories': 'Categorías',
    'genres': 'Géneros Literarios',
    'formats': 'Formatos',
    'authors': 'Autores',
    'id-types': 'Tipos de Documento',
    'users': 'Gestión de Usuarios',
    'roles': 'Roles y Permisos'
  };

  // Cargar vista
  if (view === 'dashboard') {
    loadDashboardView();
    switchView('dashboard'); 
  } else if (view === 'catalog') {
    loadBooksView();
  } else if (view === 'favorites') { 
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

  // SOLO HABLA SI HUBO UN CAMBIO REAL DE SECCIÓN
  const nuevoNombreSeccion = nombresVistasMap[view] || view;
  if (currentViewName !== view) {
    currentViewName = view;
    hablarTexto(nuevoNombreSeccion); // Locución corta y puntual (ej. "Autores")
  }
}

// Helper para normalizar texto
function normalizarTexto(texto) {
  if (!texto) return '';
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function accionarBotonTabla(selectorBoton, nombreObjetivo) {
  const target = normalizarTexto(nombreObjetivo);
  if (!target) return false;

  const botones = document.querySelectorAll(selectorBoton);
  let encontrado = false;

  botones.forEach(btn => {
    const attrNombre = btn.getAttribute('data-nombre');
    if (attrNombre) {
      const nombreBtn = normalizarTexto(attrNombre);
      if (nombreBtn === target || nombreBtn.includes(target) || target.includes(nombreBtn)) {
        btn.click();
        encontrado = true;
      }
    }
  });

  return encontrado;
}

function initVoiceNavigation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = true;
  recognition.interimResults = false;
  recognitionInstance = recognition;

  const btnVoice = document.getElementById('btnVoiceNav');

  const showToast = (message, speak = true) => {
    let toast = document.getElementById('voice-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'voice-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'voice-toast show';
    setTimeout(() => toast.classList.remove('show'), 2500);

    if (speak) {
      hablarTexto(message);
    }
  };

  // Mapeo flexible de alias
  const comandosMap = {
    'dashboard': 'dashboard', 'inicio': 'dashboard', 'panel': 'dashboard',
    'catalogo': 'catalog', 'libros': 'catalog', 'favoritos': 'favorites',
    'categorias': 'categories', 'categoria': 'categories',
    'generos': 'genres', 'genero': 'genres', 
    'formatos': 'formats', 'formato': 'formats', 
    'autores': 'authors', 'autor': 'authors',
    'usuarios': 'users', 'usuario': 'users', 'personas': 'users',
    'roles': 'roles', 'rol': 'roles', 'permisos': 'roles',
    'documentos': 'id-types', 'identificaciones': 'id-types', 'tipos de documento': 'id-types'
  };

  recognition.onstart = () => {
    isListeningGlobal = true;
    if (btnVoice) {
      btnVoice.classList.add('listening');
      btnVoice.querySelector('span').textContent = 'Micrófono Activo';
    }
  };

  recognition.onresult = (event) => {
    const lastResultIndex = event.results.length - 1;
    const resultObj = event.results[lastResultIndex][0];
    
    const transcriptOriginal = resultObj.transcript.trim(); 
    const confidence = resultObj.confidence;
    const transcript = normalizarTexto(transcriptOriginal);

    console.log(`🎤 Escuchado: "${transcriptOriginal}" | Confianza: ${confidence.toFixed(2)}`);

    // Filtros de ruido
    if (confidence > 0 && confidence < 0.70) return;
    if (transcript.length < 3) return;

    // 1. Apagar micrófono
    if (transcript.includes('apagar microfono') || transcript.includes('desactivar microfono') || transcript.includes('dejar de escuchar')) {
      isListeningGlobal = false;
      recognition.stop();
      if (btnVoice) {
        btnVoice.classList.remove('listening');
        btnVoice.querySelector('span').textContent = 'Control por Voz';
      }
      hablarTexto('Desactivado.');
      return;
    }

    // 2. Cerrar sesión
    if (transcript.includes('cerrar sesion') || transcript.includes('salir')) {
      logoutUser();
      return;
    }

    // 3. Consultar ubicación actual sólo si se pregunta explícitamente
    if (transcript.includes('donde estoy') || transcript.includes('seccion actual')) {
      const activeNav = document.querySelector('.sidebar-nav li.active a span');
      const nombreActual = activeNav ? activeNav.textContent.trim() : 'el panel';
      hablarTexto(`Estás en ${nombreActual}.`);
      return;
    }

    // 4. NAVEGACIÓN FLEXIBLE ("ir a...", "llevar a...", "abrir...", "ver...")
    // Limpiamos los prefijos comunes para extraer la clave del módulo
    const textoNavegacion = transcript
      .replace(/^ir a la seccion de\s+/i, '')
      .replace(/^ir a la seccion\s+/i, '')
      .replace(/^ir al modulo de\s+/i, '')
      .replace(/^ir a\s+/i, '')
      .replace(/^ir al\s+/i, '')
      .replace(/^llevame a\s+/i, '')
      .replace(/^llevame al\s+/i, '')
      .replace(/^abrir seccion\s+/i, '')
      .replace(/^abrir modulo\s+/i, '')
      .replace(/^abrir\s+/i, '')
      .replace(/^mostrar\s+/i, '')
      .trim();

    for (const [key, view] of Object.entries(comandosMap)) {
      if (textoNavegacion === key || transcript.includes(key)) {
        navigateToView(view);
        return;
      }
    }

    // 5. Búsqueda por TÍTULO DE LIBRO
    if (
      transcript.startsWith('buscar libro ') || 
      transcript.startsWith('buscar por libro ') || 
      transcript.startsWith('filtrar por libro ') ||
      transcript.startsWith('filtrar libro ')
    ) {
      const terminoLibro = transcriptOriginal
        .replace(/^buscar libro\s+/i, '')
        .replace(/^buscar por libro\s+/i, '')
        .replace(/^filtrar por libro\s+/i, '')
        .replace(/^filtrar libro\s+/i, '')
        .trim();

      const searchBookInput = document.getElementById('searchBookName');

      if (searchBookInput) {
        searchBookInput.value = terminoLibro;
        searchBookInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchBookInput.focus();
        showToast(`Buscando libro ${terminoLibro}`);
        return;
      }
    }

    // 6. Búsqueda general
    if (transcript.startsWith('buscar ') || transcript.startsWith('filtrar por ')) {
      const terminoBusqueda = transcriptOriginal
        .replace(/^buscar\s+/i, '')
        .replace(/^filtrar por\s+/i, '')
        .trim();

      const searchInput = document.querySelector(
        '#searchAuthorName, #searchCategoryName, #searchFormatName, #searchGenreName, #searchRoleName, input[type="search"], input[placeholder*="Buscar"]'
      );

      if (searchInput) {
        searchInput.value = terminoBusqueda;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.focus();
        showToast(`Buscando ${terminoBusqueda}`);
        return;
      }
    }

    // 7. Limpiar búsquedas
    if (
      transcript.includes('limpiar busqueda') || 
      transcript.includes('borrar busqueda') || 
      transcript.includes('limpiar filtro') || 
      transcript.includes('borrar filtro') ||
      transcript.includes('limpiar filtros')
    ) {
      const inputsBuscadores = document.querySelectorAll(
        '#searchAuthorName, #searchBookName, #searchCategoryName, #searchFormatName, #searchGenreName, #searchRoleName, input[type="search"], input[placeholder*="Buscar"]'
      );

      if (inputsBuscadores.length > 0) {
        inputsBuscadores.forEach(input => {
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.blur();
        });
        showToast('Filtros limpiados.');
        return;
      }
    }

    // 8. CRUD: Ver / Detalles
    if (transcript.startsWith('ver ') || transcript.startsWith('detalles de ') || transcript.startsWith('auditoria de ')) {
      const objetivo = transcript
        .replace('ver detalles de ', '')
        .replace('detalles de ', '')
        .replace('auditoria de ', '')
        .replace('ver ', '')
        .trim();

      if (accionarBotonTabla('.btn-details, .btn-format-details, .btn-genre-details, .btn-role-details', objetivo)) {
        showToast(`Detalles de ${objetivo}`);
        return;
      }
    }

    // 9. CRUD: Editar
    if (transcript.startsWith('editar ') || transcript.startsWith('modificar ') || transcript.startsWith('actualizar ')) {
      const objetivo = transcript
        .replace('editar ', '')
        .replace('modificar ', '')
        .replace('actualizar ', '')
        .trim();

      if (accionarBotonTabla('.btn-edit, .btn-format-edit, .btn-genre-edit, .btn-role-edit', objetivo)) {
        showToast(`Editando ${objetivo}`);
        return;
      }
    }

    // 10. CRUD: Eliminar
    if (transcript.startsWith('eliminar ') || transcript.startsWith('borrar ') || transcript.startsWith('quitar ')) {
      const objetivo = transcript
        .replace('eliminar ', '')
        .replace('borrar ', '')
        .replace('quitar ', '')
        .trim();

      if (accionarBotonTabla('.btn-delete, .btn-format-delete, .btn-genre-delete, .btn-role-delete', objetivo)) {
        showToast(`Eliminando ${objetivo}`);
        return;
      }
    }

    // 11. Crear / Agregar
    if (transcript.includes('crear') || transcript.includes('nuevo') || transcript.includes('nueva') || transcript.includes('agregar')) {
      const btnAdd = document.querySelector('.module-header .btn-primary, #btn-add-role, #btn-add-author, #btn-add-category, #btn-add-format, #btn-add-genre, #btnNewFormat, #btnNewGenre');
      if (btnAdd) {
        btnAdd.click();
        showToast('Formulario abierto.');
        return;
      }
    }

    // 12. Guardar / Confirmar
    if (transcript.includes('guardar') || transcript.includes('confirmar')) {
      const btnSave = document.querySelector('.form-container button[type="submit"], .btn-success');
      if (btnSave) {
        btnSave.click();
        showToast('Guardando.');
        return;
      }
    }

    // 13. Cancelar / Cerrar modal
    if (transcript.includes('cancelar') || transcript.includes('regresar') || transcript.includes('cerrar') || transcript.includes('salir')) {
      const btnCancel = document.querySelector(
        '#closeRoleModalBtn, #closeModalBtn, #closeCategoryModalBtn, #closeFormatModalBtn, #closeGenreModalBtn, #cancelCreateRoleBtn, #cancelEditRoleBtn, #cancelCreateBtn, #cancelEditBtn, #cancelCreateCatBtn, #cancelEditCatBtn, #cancelCreateFormatBtn, #cancelEditFormatBtn, #cancelCreateGenreBtn, #cancelEditGenreBtn, .form-container .btn-secondary'
      );
      if (btnCancel) {
        btnCancel.click();
        showToast('Cancelado.');
        return;
      }
    }

    // 14. Dictado en input activo
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      activeElement.value = activeElement.value ? activeElement.value + ' ' + transcriptOriginal : transcriptOriginal;
      showToast('Dictado agregado.', false);
      return;
    }
  };

  recognition.onerror = (event) => {
    if (event.error !== 'no-speech') console.warn(`Error de voz: ${event.error}`);
  };

  recognition.onend = () => {
    if (isListeningGlobal) {
      setTimeout(() => {
        try { recognition.start(); } catch(e) {}
      }, 500); 
    } else if (btnVoice) {
      btnVoice.classList.remove('listening');
      btnVoice.querySelector('span').textContent = 'Control por Voz';
    }
  };

  if (btnVoice) {
    btnVoice.addEventListener('click', () => {
      if (isListeningGlobal) {
        isListeningGlobal = false;
        recognition.stop();
        hablarTexto('Desactivado.');
      } else {
        isListeningGlobal = true;
        recognition.start();
        hablarTexto('Control por voz activado.');
      }
    });
  }
}

export function initAdminNavigation() {
  const container = document.getElementById('admin-sidebar-container');
  if (!container) return;

  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand-box">
          <img src="https://res.cloudinary.com/divhisdcx/image/upload/v1787950293/logo_biblionepo_circular_transparente_ts0glk.svg" alt="BiblioNepo Logo" class="brand-logo-img">
          <span class="brand-name">BiblioNepo</span>
        </div>

        <div class="user-profile-card" id="btnProfileView" title="Ver mi perfil" role="button" tabindex="0" aria-label="Ver mi perfil">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="Avatar del administrador" class="user-avatar">
          <div class="user-details">
            <span class="user-name">Carlos Admin</span>
            <span class="user-role" id="user-role">Super Administrador</span>
          </div>
          <i class="fa-solid fa-chevron-right profile-arrow" aria-hidden="true"></i>
        </div>

        <nav class="sidebar-nav" aria-label="Navegación principal del administrador">
          <div class="nav-section">
            <span class="nav-section-title">PRINCIPAL</span>
            <ul class="nav-list">
              <li class="active"><a href="#dashboard" data-view="dashboard"><i class="fa-solid fa-chart-pie" aria-hidden="true"></i> <span>Dashboard</span></a></li>
              <li><a href="#catalogo" data-view="catalog"><i class="fa-solid fa-book" aria-hidden="true"></i> <span>Catálogo Libros</span></a></li>
              <li><a href="#favoritos" data-view="favorites"><i class="fa-solid fa-heart" aria-hidden="true"></i> <span>Mis Favoritos</span></a></li>
            </ul>
          </div>
          <div class="nav-section">
            <span class="nav-section-title">CATÁLOGO</span>
            <ul class="nav-list">
              <li><a href="#categorias" data-view="categories"><i class="fa-solid fa-folder-tree" aria-hidden="true"></i> <span>Categorías</span></a></li>
              <li><a href="#generos" data-view="genres"><i class="fa-solid fa-tags" aria-hidden="true"></i> <span>Géneros Libro</span></a></li>
              <li><a href="#formatos" data-view="formats"><i class="fa-solid fa-swatchbook" aria-hidden="true"></i> <span>Formatos</span></a></li>
              <li><a href="#autores" data-view="authors"><i class="fa-solid fa-feather" aria-hidden="true"></i> <span>Autores</span></a></li>
            </ul>
          </div>
          <div class="nav-section">
            <span class="nav-section-title">ADMINISTRACIÓN</span>
            <ul class="nav-list">
              <li><a href="#usuarios" data-view="users"><i class="fa-solid fa-users" aria-hidden="true"></i> <span>Gestión Usuarios</span></a></li>
              <li><a href="#roles" data-view="roles"><i class="fa-solid fa-user-shield" aria-hidden="true"></i> <span>Gestión Roles</span></a></li>
              <li><a href="#identificaciones" data-view="id-types"><i class="fa-solid fa-address-card" aria-hidden="true"></i> <span>Tipos Documento</span></a></li>
            </ul>
          </div>
        </nav>
      </div>

      <div class="sidebar-footer" style="display: flex; flex-direction: column; gap: 8px;">
        <button class="btn-public-site btn-voice-nav" id="btnVoiceNav" aria-label="Activar control por voz">
          <i class="fa-solid fa-microphone" aria-hidden="true"></i>
          <span>Control por Voz</span>
        </button>
        <button class="btn-public-site" id="btnGoToPublic">
          <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
          <span>Sitio Público</span>
        </button>
        <button class="btn-public-site" id="btnLogout" style="background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; cursor: pointer;" aria-label="Cerrar sesión">
          <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `;

  initVoiceNavigation();

  const btnGoToPublic = container.querySelector('#btnGoToPublic');
  if (btnGoToPublic) {
    btnGoToPublic.addEventListener('click', () => window.location.href = 'index.html');
  }

  const btnProfileView = container.querySelector('#btnProfileView');
  if (btnProfileView) {
    btnProfileView.addEventListener('click', () => {
      container.querySelectorAll('.sidebar-nav li').forEach(l => l.classList.remove('active'));
      loadDashboardView();
      switchView('profile');
    });
  }

  const navItems = container.querySelectorAll('.sidebar-nav li');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const link = item.querySelector('a');
      if (link) navigateToView(link.dataset.view);
    });
  });
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button, a, div[role="button"]');
  if (!btn) return;
  const isLogoutBtn = btn.id === 'btnLogout' || btn.id === 'btn-logout-profile';
  if (isLogoutBtn) {
    e.preventDefault();
    logoutUser();
  }
});