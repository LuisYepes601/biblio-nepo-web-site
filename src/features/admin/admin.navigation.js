import { loadDashboardView, switchView } from './admin-dashboard.js';
import { loadUsersView } from '../users/users.js';
import { loadAuthorsView } from '../autors/authors.js';
import { loadBooksView } from '../books/books.js'; 
import { loadCategoriesView } from '../categories/categories.js';
import { loadBookGenresView } from '../book-genres/book-genres.js';
import { loadRolesView } from '../roles/roles.js';
import { loadFormatsView } from '../formats/formats.js';
import { loadBookTypesView } from '../book-types/book-types.js';
import { loadIdentificationTypesView } from '../identification-types/identification-types.js';
import { loadFavoritesView } from '../favoritos/favorites.component.js'; 

let recognitionInstance = null;
let isListeningGlobal = false;
let currentViewName = '';
let isSpeakingTTS = false;

function obtenerVozEspanol() {
  if (!('speechSynthesis' in window)) return null;
  const voces = window.speechSynthesis.getVoices();
  return voces.find(v => v.lang.startsWith('es') || v.lang.includes('es-ES') || v.lang.includes('es-MX')) || voces[0] || null;
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

/**
 * Sintetiza texto a voz ÚNICAMENTE si el modo de voz/dictado está activado
 */
export function hablarTexto(mensaje, forzar = false) {
  if (!('speechSynthesis' in window)) return;
  if (!isListeningGlobal && !forzar) return;

  isSpeakingTTS = true;

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  window.speechSynthesis.cancel();

  if (recognitionInstance && isListeningGlobal) {
    try { recognitionInstance.abort(); } catch (e) {}
  }

  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(mensaje);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95; 
    utterance.pitch = 1;

    const voz = obtenerVozEspanol();
    if (voz) utterance.voice = voz;

    const reactivarMicrofono = () => {
      setTimeout(() => {
        isSpeakingTTS = false;
        if (recognitionInstance && isListeningGlobal) {
          try { recognitionInstance.start(); } catch (e) {}
        }
      }, 500);
    };

    utterance.onend = reactivarMicrofono;
    utterance.onerror = () => reactivarMicrofono();

    window.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }, 80);
}

export function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  hablarTexto('Sesión cerrada.');
  window.location.href = 'index.html';
}

export function navigateToView(view) {
  if (currentViewName === view) return;

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
    'dashboard': 'Dashboard principal',
    'catalog': 'Catálogo de Libros',
    'favorites': 'Mis Favoritos',
    'categories': 'Categorías',
    'genres': 'Géneros Literarios',
    'formats': 'Formatos de Libro',
    'book-types': 'Tipos de Libro',
    'authors': 'Autores',
    'id-types': 'Tipos de Documento',
    'users': 'Gestión de Usuarios',
    'roles': 'Roles y Permisos'
  };

  currentViewName = view;

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
  } else if (view === 'book-types') {
    loadBookTypesView();
  } else if (view === 'authors') {
    loadAuthorsView();
  } else if (view === 'id-types') {
    loadIdentificationTypesView();
  } else if (view === 'users') {
    loadUsersView();
  } else if (view === 'roles') {
    loadRolesView();
  }

  const nuevoNombreSeccion = nombresVistasMap[view] || view;
  hablarTexto(`Sección ${nuevoNombreSeccion}`);
}

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

  const restablecerBotonVoz = () => {
    if (btnVoice) {
      btnVoice.classList.remove('listening');
      const span = btnVoice.querySelector('span');
      if (span) span.textContent = 'Control por Voz';
    }
  };

  const activarBotonVoz = () => {
    if (btnVoice) {
      btnVoice.classList.add('listening');
      const span = btnVoice.querySelector('span');
      if (span) span.textContent = 'Micrófono Activo';
    }
  };

  const comandosMap = {
    'dashboard': 'dashboard', 'inicio': 'dashboard', 'panel': 'dashboard', 'dashboard principal': 'dashboard',
    'catalogo': 'catalog', 'libros': 'catalog', 'catalogo de libros': 'catalog',
    'favoritos': 'favorites', 'mis favoritos': 'favorites',
    'categorias': 'categories', 'categoria': 'categories', 'gestion de categorias': 'categories',
    'generos': 'genres', 'genero': 'genres', 'generos literarios': 'genres', 'generos libro': 'genres',
    'formatos': 'formats', 'formato': 'formats', 'formatos de libro': 'formats',
    'tipos de libro': 'book-types', 'tipo de libro': 'book-types', 'tipos libro': 'book-types', 'tipos de libros': 'book-types',
    'autores': 'authors', 'autor': 'authors',
    'usuarios': 'users', 'usuario': 'users', 'gestion de usuarios': 'users',
    'roles': 'roles', 'rol': 'roles', 'permisos': 'roles', 'gestion de roles': 'roles',
    'documentos': 'id-types', 'identificaciones': 'id-types', 'tipos de documento': 'id-types'
  };

  recognition.onstart = () => {
    isListeningGlobal = true;
    activarBotonVoz();
  };

  recognition.onresult = (event) => {
    if (isSpeakingTTS || (window.speechSynthesis && window.speechSynthesis.speaking)) return;

    const lastResultIndex = event.results.length - 1;
    const resultObj = event.results[lastResultIndex][0];
    
    const transcriptOriginal = resultObj.transcript.trim(); 
    const confidence = resultObj.confidence;
    const transcript = normalizarTexto(transcriptOriginal);

    if (confidence > 0 && confidence < 0.65) return;
    if (transcript.length < 2) return;

    if (transcript.includes('apagar microfono') || transcript.includes('desactivar microfono') || transcript.includes('dejar de escuchar')) {
      isListeningGlobal = false;
      restablecerBotonVoz();
      hablarTexto('Desactivado.', true);
      try { recognition.stop(); } catch(e) {}
      return;
    }

    if (transcript.includes('cerrar sesion') || transcript.includes('salir de la cuenta')) {
      logoutUser();
      return;
    }

    if (transcript.includes('donde estoy') || transcript.includes('seccion actual')) {
      const activeNav = document.querySelector('.sidebar-nav li.active a span');
      const nombreActual = activeNav ? activeNav.textContent.trim() : 'el panel';
      hablarTexto(`Estás en la sección de ${nombreActual}.`);
      return;
    }

    const esCancelar = transcript === 'cancelar' || transcript.includes('cancelar') || 
                       transcript === 'cerrar' || transcript.includes('cerrar modal') ||
                       transcript.includes('regresar') || transcript.includes('volver') || transcript.includes('salir');

    if (esCancelar) {
      const modalAbierto = document.querySelector('.modal-backdrop[style*="display: flex"], #categoryModal[style*="display: flex"]');
      const btnCancelModal = document.querySelector('#cancelCreateCatBtn, #cancelEditCatBtn, #cancelDeleteCatBtn, #closeCategoryModalBtn, #closeRoleModalBtn, #closeModalBtn, .form-container .btn-secondary');

      if (modalAbierto && btnCancelModal) {
        btnCancelModal.click();
        return;
      }

      const btnBackDashboard = document.querySelector('#btnBackToDashboard, .btn-back-dashboard');
      if (btnBackDashboard) {
        btnBackDashboard.click();
        return;
      } else if (currentViewName && currentViewName !== 'dashboard') {
        hablarTexto('Regresando al dashboard principal.');
        navigateToView('dashboard');
        return;
      }
    }

    const esGuardar = transcript === 'guardar' || transcript === 'confirmar' || 
                      transcript === 'guardar categoria' || transcript === 'guardar cambios' ||
                      transcript.includes('confirmar eliminacion') || transcript === 'si, eliminar' || transcript === 'si eliminar' || transcript === 'si';

    if (esGuardar) {
      const btnConfirm = document.querySelector('#btnSubmitCreateCat, #btnSubmitEditCat, #confirmDeleteCatBtn, .form-container button[type="submit"]');
      if (btnConfirm) {
        btnConfirm.click();
        return;
      }
    }

    const activeElement = document.activeElement;

    if (activeElement && (activeElement.id === 'createCatNombre' || activeElement.id === 'editCatNombre')) {
      const esEdicion = activeElement.id === 'editCatNombre';
      const comandosConservar = ['siguiente', 'conservar', 'mantener', 'igual', 'continuar'];
      const deseaConservar = comandosConservar.some(cmd => transcript.includes(cmd));

      let valNombre = activeElement.value;
      if (!deseaConservar) {
        valNombre = transcriptOriginal;
        activeElement.value = valNombre;
      }

      const descInput = document.getElementById(esEdicion ? 'editCatDescripcion' : 'createCatDescripcion');
      if (descInput) {
        descInput.focus();
        hablarTexto(`Nombre capturado: ${valNombre}. Diga la descripción opcional o "guardar".`);
      }
      return;
    }

    if (activeElement && (activeElement.id === 'createCatDescripcion' || activeElement.id === 'editCatDescripcion')) {
      const omitirComandos = ['omitir', 'ninguna', 'ninguno', 'sin descripcion', 'saltar', 'siguiente'];
      const esOmitir = omitirComandos.some(cmd => transcript.includes(cmd));

      if (esOmitir) {
        activeElement.value = '';
        hablarTexto('Sin descripción. Diga "guardar" para confirmar o "cancelar".');
      } else {
        activeElement.value = transcriptOriginal;
        hablarTexto(`Descripción capturada: ${transcriptOriginal}. Diga "guardar" para confirmar o "cancelar".`);
      }
      return;
    }

    if (transcript.includes('crear') || transcript.includes('nuevo') || transcript.includes('nueva') || transcript.includes('agregar')) {
      const btnAdd = document.querySelector('.module-header .btn-primary, #btn-add-role, #btn-add-author, #btn-add-category, #btn-add-format, #btn-add-genre, #btn-add-book-type');
      if (btnAdd) {
        btnAdd.click();
        return;
      }
    }

    if (transcript.startsWith('editar ') || transcript.startsWith('modificar ')) {
      const objetivo = transcript.replace('editar ', '').replace('modificar ', '').trim();
      if (accionarBotonTabla('.btn-edit, .btn-format-edit, .btn-genre-edit, .btn-role-edit, .btn-type-edit', objetivo)) return;
    }

    if (transcript.startsWith('eliminar ') || transcript.startsWith('borrar ')) {
      const objetivo = transcript.replace('eliminar ', '').replace('borrar ', '').trim();
      if (accionarBotonTabla('.btn-delete, .btn-format-delete, .btn-genre-delete, .btn-role-delete, .btn-type-delete', objetivo)) return;
    }

    if (transcript.startsWith('ver ') || transcript.startsWith('detalles de ')) {
      const objetivo = transcript.replace('ver detalles de ', '').replace('detalles de ', '').replace('ver ', '').trim();
      if (accionarBotonTabla('.btn-details, .btn-format-details, .btn-genre-details, .btn-role-details, .btn-type-details', objetivo)) return;
    }

    const textoNavegacion = transcript
      .replace(/^ir a la seccion de\s+/i, '')
      .replace(/^ir a la seccion\s+/i, '')
      .replace(/^ir al modulo de\s+/i, '')
      .replace(/^ir a\s+/i, '')
      .replace(/^ir al\s+/i, '')
      .replace(/^llevame a\s+/i, '')
      .replace(/^abrir\s+/i, '')
      .trim();

    for (const [key, view] of Object.entries(comandosMap)) {
      if (textoNavegacion === key || transcript === key || transcript.includes(key)) {
        navigateToView(view);
        return;
      }
    }
  };

  recognition.onerror = (event) => {
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      console.warn(`Error de voz: ${event.error}`);
    }
  };

  recognition.onend = () => {
    if (!isListeningGlobal) {
      restablecerBotonVoz();
      return;
    }

    if (isSpeakingTTS || (window.speechSynthesis && window.speechSynthesis.speaking)) return;

    if (isListeningGlobal) {
      setTimeout(() => {
        try { recognition.start(); } catch(e) {}
      }, 300); 
    }
  };

  if (btnVoice) {
    btnVoice.addEventListener('click', () => {
      if (isListeningGlobal) {
        isListeningGlobal = false;
        restablecerBotonVoz();
        hablarTexto('Control por voz desactivado.', true);
        try { recognition.stop(); } catch(e) {}
      } else {
        isListeningGlobal = true;
        try { recognition.start(); } catch(e) {}
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

        <div class="user-profile-card" id="btnProfileView" title="Ver mi perfil" role="button" tabindex="0">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="Avatar" class="user-avatar">
          <div class="user-details">
            <span class="user-name">Carlos Admin</span>
            <span class="user-role" id="user-role">Super Administrador</span>
          </div>
          <i class="fa-solid fa-chevron-right profile-arrow"></i>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <span class="nav-section-title">PRINCIPAL</span>
            <ul class="nav-list">
              <li class="active"><a href="#dashboard" data-view="dashboard"><i class="fa-solid fa-chart-pie"></i> <span>Dashboard</span></a></li>
              <li><a href="#catalogo" data-view="catalog"><i class="fa-solid fa-book"></i> <span>Catálogo Libros</span></a></li>
              <li><a href="#favoritos" data-view="favorites"><i class="fa-solid fa-heart"></i> <span>Mis Favoritos</span></a></li>
            </ul>
          </div>
          <div class="nav-section">
            <span class="nav-section-title">CATÁLOGO</span>
            <ul class="nav-list">
              <li><a href="#categorias" data-view="categories"><i class="fa-solid fa-folder-tree"></i> <span>Categorías</span></a></li>
              <li><a href="#generos" data-view="genres"><i class="fa-solid fa-tags"></i> <span>Géneros Libro</span></a></li>
              <li><a href="#formatos" data-view="formats"><i class="fa-solid fa-swatchbook"></i> <span>Formatos</span></a></li>
              <li><a href="#tipos-libro" data-view="book-types"><i class="fa-solid fa-bookmark"></i> <span>Tipos de Libro</span></a></li>
              <li><a href="#autores" data-view="authors"><i class="fa-solid fa-feather"></i> <span>Autores</span></a></li>
            </ul>
          </div>
          <div class="nav-section">
            <span class="nav-section-title">ADMINISTRACIÓN</span>
            <ul class="nav-list">
              <li><a href="#usuarios" data-view="users"><i class="fa-solid fa-users"></i> <span>Gestión Usuarios</span></a></li>
              <li><a href="#roles" data-view="roles"><i class="fa-solid fa-user-shield"></i> <span>Gestión Roles</span></a></li>
              <li><a href="#identificaciones" data-view="id-types"><i class="fa-solid fa-address-card"></i> <span>Tipos Documento</span></a></li>
            </ul>
          </div>
        </nav>
      </div>

      <div class="sidebar-footer" style="display: flex; flex-direction: column; gap: 8px;">
        <button class="btn-public-site btn-voice-nav" id="btnVoiceNav">
          <i class="fa-solid fa-microphone"></i>
          <span>Control por Voz</span>
        </button>
        <button class="btn-public-site" id="btnGoToPublic">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
          <span>Sitio Público</span>
        </button>
        <button class="btn-public-site" id="btnLogout" style="background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; cursor: pointer;">
          <i class="fa-solid fa-right-from-bracket"></i>
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
  if (btn.id === 'btnLogout' || btn.id === 'btn-logout-profile') {
    e.preventDefault();
    logoutUser();
  }
});