import { fetchBooks, createBook, fetchBookDetails, fetchFormatosLibro } from './books.api.js';
import { fetchIdiomas, fetchCategorias, fetchGeneros, fetchTiposLibro, fetchCategoriasPorLibro } from '../catalog/catalog.api.js';
import { fetchAuthors } from '../autors/authors.api.js';
import { navigateToView } from '../admin/admin.navigation.js';
import { addFavoriteApi, removeFavoriteApi } from '../favoritos/favorite-api.js';

let currentPage = 0;
let currentSearchNombre = '';
let currentSearchAutor = '';
let currentSearchIdioma = '';
let currentLimit = getDefaultLimit();
let currentBooksList = [];

/**
 * Efecto visual de Corazón Flotante y Resplandor en la tarjeta
 */
function triggerFavoriteVisualFeedback(btn, isAdding) {
  const card = btn.closest('.book-card-item') || btn.closest('.author-card');
  const rect = btn.getBoundingClientRect();

  // 1. Crear el corazón flotante animado en la posición del botón
  const floatingHeart = document.createElement('div');
  floatingHeart.innerHTML = isAdding ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-solid fa-heart-crack"></i>';
  floatingHeart.style.cssText = `
    position: fixed;
    left: ${rect.left + rect.width / 2 - 12}px;
    top: ${rect.top - 8}px;
    font-size: 1.5rem;
    color: ${isAdding ? '#ef4444' : '#64748b'};
    pointer-events: none;
    z-index: 99999;
    transform: scale(0.6);
    opacity: 1;
    transition: all 0.75s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  `;
  document.body.appendChild(floatingHeart);

  requestAnimationFrame(() => {
    floatingHeart.style.transform = 'translateY(-50px) scale(1.7)';
    floatingHeart.style.opacity = '0';
  });

  setTimeout(() => {
    floatingHeart.remove();
  }, 780);

  // 2. Resplandor / Destello temporal en la tarjeta completa
  if (card) {
    const originalShadow = card.style.boxShadow;
    const originalTransform = card.style.transform;

    card.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    card.style.boxShadow = isAdding 
      ? '0 0 25px rgba(239, 68, 68, 0.45)' 
      : '0 0 18px rgba(100, 116, 139, 0.3)';
    card.style.transform = 'scale(1.025)';

    setTimeout(() => {
      card.style.boxShadow = originalShadow || '';
      card.style.transform = originalTransform || '';
    }, 450);
  }
}

/**
 * Notificación Toast flotante para dar feedback inmediato al usuario
 */
function showToast(message, type = 'success') {
  let toast = document.getElementById('books-toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'books-toast-notification';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 20px;
      background: #0f172a;
      color: #ffffff;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      z-index: 99999;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    document.body.appendChild(toast);
  }

  const icon = type === 'success' 
    ? '<i class="fa-solid fa-heart" style="color: #f87171;"></i>' 
    : '<i class="fa-solid fa-heart-crack" style="color: #94a3b8;"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 2800);
}

function getDefaultLimit() {
  const width = window.innerWidth;
  if (width < 768) return 8;
  if (width < 1024) return 12;
  return 20;
}

export async function loadBooksView() {
  const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
  if (!container) return;

  currentPage = 0;
  currentSearchNombre = '';
  currentSearchAutor = '';
  currentSearchIdioma = '';
  currentLimit = getDefaultLimit();

  const isLimit8 = currentLimit === 8 ? 'selected' : '';
  const isLimit12 = currentLimit === 12 ? 'selected' : '';
  const isLimit20 = currentLimit === 20 ? 'selected' : '';

  container.innerHTML = `
    <div class="books-page-wrapper">
      
      <!-- BARRA SUPERIOR CON BOTÓN REGRESAR -->
      <div class="books-top-bar" style="margin-bottom: 16px;">
        <button class="btn-back-dashboard" id="btnBackToDashboard" style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; color: #334155; padding: 8px 14px; border-radius: 8px; font-size: 0.825rem; font-weight: 600; cursor: pointer; transition: background 0.15s, border-color 0.15s;">
          <i class="fa-solid fa-arrow-left"></i> Regresar al Dashboard
        </button>
      </div>

      <!-- CARRUSEL HERO AUTOMÁTICO DE LIBROS -->
      <div class="carousel-hero-container" id="booksHeroCarousel" style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 28px; border: 1px solid #e2e8f0; background: #0f172a;">
        <div class="carousel-track" id="booksCarouselTrack" style="display: flex; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); width: 100%;">
          
          <div class="carousel-slide" style="flex: 0 0 100%; min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Catálogo & Acervo</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Gestión de Libros</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Administra los ejemplares, inventario y registros bibliotecarios de la plataforma.</p>
            </div>
          </div>

          <div class="carousel-slide" style="flex: 0 0 100%; min-width: 100%; position: relative; min-height: 200px; display: flex; align-items: center; padding: 32px 40px; background-image: url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; box-sizing: border-box;">
            <div class="carousel-slide-overlay" style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%); z-index: 1;"></div>
            <div class="carousel-slide-content" style="position: relative; z-index: 2; max-width: 500px; color: #ffffff;">
              <span class="carousel-slide-tag" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px; display: inline-block;">Biblioteca Digital</span>
              <h2 class="carousel-slide-title" style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.25;">Colección Literaria</h2>
              <p class="carousel-slide-desc" style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.45;">Organiza las publicaciones por formato, idioma, género y categorías de manera centralizada.</p>
            </div>
          </div>

        </div>

        <div class="carousel-controls" style="position: absolute; bottom: 16px; right: 20px; z-index: 3; display: flex; align-items: center; gap: 8px;">
          <div class="carousel-dots" style="display: flex; gap: 6px; margin-right: 6px;">
            <span class="carousel-dot active" style="width: 20px; height: 7px; border-radius: 10px; background: #ffffff; cursor: pointer;"></span>
            <span class="carousel-dot" style="width: 7px; height: 7px; border-radius: 50%; background: rgba(255, 255, 255, 0.4); cursor: pointer;"></span>
          </div>
          <button class="carousel-arrow" id="booksPrevBtn" title="Anterior" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="carousel-arrow" id="booksNextBtn" title="Siguiente" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>

      <!-- MÓDULO DE LIBROS -->
      <section class="authors-module-container" style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px;">
        <div class="authors-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a;">Inventario de Libros</h3>
            <p style="margin: 2px 0 0 0; font-size: 0.825rem; color: #64748b;">Control de títulos, autores asociados, stock y estado.</p>
          </div>
          <button class="btn-primary" id="btnNewBook" style="padding: 9px 16px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-book-medical"></i> Nuevo Libro
          </button>
        </div>

        <!-- Barra de Filtros y Búsqueda -->
        <div class="authors-search-bars" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
          <input type="text" id="searchBookTitle" placeholder="Buscar por título..." 
                 style="flex: 1; min-width: 180px; padding: 9px 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.85rem; background: white;">
          
          <input type="text" id="searchBookAuthor" placeholder="Buscar por autor..." 
                 style="flex: 1; min-width: 180px; padding: 9px 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.85rem; background: white;">

          <select id="searchBookIdioma" style="min-width: 160px; padding: 9px 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.85rem; background: white; cursor: pointer;">
            <option value="">Todos los idiomas</option>
          </select>

          <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <label for="limitSelector" style="font-size: 0.825rem; color: #475569; font-weight: 500;">Mostrar:</label>
            <select id="limitSelector" style="border: none; outline: none; background: transparent; font-size: 0.85rem; font-weight: 600; color: #1e293b; cursor: pointer;">
              <option value="8" ${isLimit8}>8</option>
              <option value="12" ${isLimit12}>12</option>
              <option value="20" ${isLimit20}>20</option>
            </select>
          </div>
        </div>

        <div class="authors-grid" id="booksGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;">
          <p style="grid-column: 1 / -1; text-align: center; color: #64748b;">Cargando libros...</p>
        </div>

        <div id="booksPagination"></div>
      </section>

    </div>

    <!-- Modal General para Libros -->
    <div id="bookModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 24px; border-radius: 12px; width: 100%; max-width: 640px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 id="bookModalTitle" style="margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">Nuevo Libro</h3>
          <button id="closeBookModalBtn" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="bookModalBody"></div>
      </div>
    </div>
  `;

  // Evento del botón de regreso
  const btnBack = document.getElementById('btnBackToDashboard');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (typeof navigateToView === 'function') {
        navigateToView('dashboard');
      }
    });
  }

  // Inicializar carrusel hero
  initBooksCarousel();

  await populateLanguageFilter();
  initBookListeners();
  await loadAndRenderBooks(currentSearchNombre, currentSearchAutor, currentSearchIdioma, 0, currentLimit);
}

function initBooksCarousel() {
  const track = document.getElementById('booksCarouselTrack');
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];
  const dots = document.querySelectorAll('#booksHeroCarousel .carousel-dot');
  const prevBtn = document.getElementById('booksPrevBtn');
  const nextBtn = document.getElementById('booksNextBtn');
  const container = document.getElementById('booksHeroCarousel');

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

async function populateLanguageFilter() {
  try {
    const langRes = await fetchIdiomas();
    const languages = langRes.content || langRes || [];
    const selectFilter = document.getElementById('searchBookIdioma');

    if (selectFilter && Array.isArray(languages)) {
      languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.id;
        option.textContent = lang.nombre || lang.idioma;
        selectFilter.appendChild(option);
      });
    }
  } catch (e) {
    console.error("No se pudieron cargar los idiomas para el filtro", e);
  }
}

async function loadAndRenderBooks(nombre = '', nombre_autor = '', id_idioma = '', page = 0, size = currentLimit) {
  currentSearchNombre = nombre;
  currentSearchAutor = nombre_autor;
  currentSearchIdioma = id_idioma;
  currentPage = page;
  currentLimit = size;

  const response = await fetchBooks(page, size, nombre, nombre_autor, id_idioma);
  currentBooksList = response.content || [];
  renderBooks(currentBooksList);
  renderPagination(response);
}

function renderBooks(books) {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  if (!books || books.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">No se encontraron libros registrados.</p>`;
    return;
  }

  const booksHtml = books.map(book => {
    const portada = book.portadaUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&h=100&fit=crop';
    const autor = book.autor || 'Autor desconocido';
    const isbn = book.isbn || 'N/A';
    const editorial = book.editorial || 'Editorial N/D';
    const formato = book.formatoLibro || 'Estándar';

    return `
      <div class="author-card book-card-item" data-id="${book.id}" style="cursor: pointer; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: transform 0.15s ease; position: relative;">
        
        <button class="btn-favorite" data-id="${book.id || ''}" title="Agregar a favoritos" style="position: absolute; top: 12px; right: 12px; background: rgba(255, 255, 255, 0.9); border: 1px solid #e2e8f0; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.2s ease;">
          <svg class="heart-icon" viewBox="0 0 24 24" width="16" height="16" stroke="#dc2626" stroke-width="2" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <div class="author-card-top" style="display: flex; justify-content: center;">
          <img src="${portada}" alt="${book.titulo}" class="author-avatar" style="border-radius: 8px; width: 80px; height: 100px; object-fit: cover;">
        </div>
        <div class="author-info">
          <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; font-weight: 700; color: #0f172a;">${book.titulo}</h4>
          <p style="margin: 2px 0; font-size: 0.785rem; color: #64748b;"><i class="fa-solid fa-feather" style="margin-right: 4px; color: #6366f1;"></i> ${autor}</p>
          <p style="margin: 2px 0; font-size: 0.785rem; color: #64748b;"><i class="fa-solid fa-barcode" style="margin-right: 4px;"></i> ISBN: ${isbn}</p>
          <p style="font-size: 0.75rem; color: #64748b; margin-top: 4px;"><i class="fa-solid fa-building" style="margin-right: 4px;"></i> ${editorial} • <span style="font-weight: 600; color: #4f46e5;">${formato}</span></p>
        </div>
      </div>
    `;
  }).join('');

  grid.innerHTML = booksHtml;

  // Escuchador para botones de favoritos con ESTADO DE CARGA y EFECTO VISUAL
  grid.querySelectorAll('.btn-favorite').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      const bookId = btn.getAttribute('data-id');
      if (!bookId || btn.disabled) return;

      const esFavorito = btn.classList.contains('is-favorite');
      const originalHTML = btn.innerHTML;

      // 1. ESTADO DE CARGA VISIBLE INMEDIATO (Spinner animado)
      btn.disabled = true;
      btn.style.opacity = '0.85';
      btn.style.transform = 'scale(0.95)';
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="font-size: 0.85rem; color: #6366f1;"></i>`;

      try {
        if (!esFavorito) {
          await addFavoriteApi(bookId);

          // 2. ÉXITO AL GUARDAR: Corazón rojo relleno
          btn.classList.add('is-favorite');
          btn.style.background = '#fef2f2';
          btn.style.opacity = '1';
          btn.style.transform = 'scale(1)';
          btn.innerHTML = `
            <svg class="heart-icon" viewBox="0 0 24 24" width="16" height="16" stroke="#dc2626" stroke-width="2" fill="#dc2626">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          `;

          triggerFavoriteVisualFeedback(btn, true);
          showToast('¡Guardado en tus Favoritos!', 'success');

        } else {
          await removeFavoriteApi(bookId);

          // 2. ÉXITO AL QUITAR: Corazón contorno vacío
          btn.classList.remove('is-favorite');
          btn.style.background = 'rgba(255, 255, 255, 0.9)';
          btn.style.opacity = '1';
          btn.style.transform = 'scale(1)';
          btn.innerHTML = `
            <svg class="heart-icon" viewBox="0 0 24 24" width="16" height="16" stroke="#dc2626" stroke-width="2" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          `;

          triggerFavoriteVisualFeedback(btn, false);
          showToast('Eliminado de tus favoritos', 'danger');
        }

      } catch (err) {
        console.error('Error al actualizar favorito:', err);
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1)';
        btn.innerHTML = originalHTML;
        showToast('No se pudo conectar con el servidor', 'danger');
      } finally {
        btn.disabled = false;
      }
    });
  });

  // Escuchador para abrir detalle del libro bloqueando otros modales
  grid.querySelectorAll('.book-card-item').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      const bookId = card.getAttribute('data-id');
      openBookDetailsView(bookId);
    });
  });
}

async function openBookDetailsView(bookId) {
  const container = document.getElementById('admin-content-container') || document.getElementById('main-content');
  if (!container) return;

  // Asegurar que si hay un modal previo abierto se cierre
  const existingModal = document.getElementById('bookDetailModal') || document.querySelector('.modal-backdrop');
  if (existingModal) existingModal.style.display = 'none';

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
      <button id="backToBooksBtn" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #334155; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <i class="fa-solid fa-arrow-left"></i> Volver al Inventario
      </button>
      <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a;">Detalles del Libro</h2>
    </div>
    <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 40px; text-align: center; color: #64748b;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #6366f1; margin-bottom: 10px;"></i>
      <p style="margin: 0; font-size: 0.9rem;">Cargando información completa del libro...</p>
    </div>
  `;

  document.getElementById('backToBooksBtn')?.addEventListener('click', loadBooksView);

  const details = await fetchBookDetails(bookId);

  if (!details) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <button id="backToBooksBtn" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #334155;">
          <i class="fa-solid fa-arrow-left"></i> Volver
        </button>
      </div>
      <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 30px; text-align: center; color: #dc2626;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p style="margin: 0; font-weight: 600;">No se pudieron cargar los detalles de este libro.</p>
      </div>
    `;
    document.getElementById('backToBooksBtn')?.addEventListener('click', loadBooksView);
    return;
  }

  const basicInfo = currentBooksList.find(b => String(b.id) === String(bookId)) || {};
  const book = { ...basicInfo, ...details };

  const authorId = book.id_autor || book.idAutor || book.autorId || null;
  const authorName = book.autor || book.nombreAutor || book.nombre_autor || '';
  const displayName = typeof authorName === 'object' ? (authorName.nombre || 'este autor') : (authorName || 'este autor');

  const downloadBtnHtml = book.archivoUrl ? `
    <a href="${book.archivoUrl}" target="_blank" class="btn-primary" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; width: 100%; padding: 10px 14px; border-radius: 8px; text-decoration: none; background: #6366f1; color: white; font-size: 0.85rem; font-weight: 600; box-shadow: 0 2px 4px rgba(99,102,241,0.2);">
      <i class="fa-solid fa-file-pdf"></i> Visualizar / Descargar PDF
    </a>
  ` : '';

  const portadaUrl = book.portadaUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop';
  const formatoText = book.formatoLibro || 'Digital';
  const tituloText = book.titulo || 'Sin Título';
  const subtituloText = book.subtitulo ? `<h4 style="margin: 4px 0 0 0; font-size: 1rem; color: #64748b; font-weight: 500;">${book.subtitulo}</h4>` : '';
  const idiomaText = book.idioma || 'N/D';
  const paisText = book.paisPublicacion || book.paisOrigen || 'N/D';
  const editorialText = book.editorial || 'Sin editorial';
  const isbnText = book.isbn || 'N/D';
  const descripcionText = book.descripcion || 'No hay descripción disponible para este ejemplar.';

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
      <button id="backToBooksBtn" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #334155; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <i class="fa-solid fa-arrow-left"></i> Volver al Inventario
      </button>
      <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a;">Detalles del Libro</h2>
    </div>

    <!-- TARJETA PRINCIPAL EN GRID RESPONSIVE -->
    <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 28px; display: grid; grid-template-columns: minmax(220px, 260px) 1fr; gap: 28px; margin-bottom: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); align-items: start;">
      
      <!-- COLUMNA PORTADA -->
      <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
        <div style="width: 100%; max-width: 260px; height: 350px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <img src="${portadaUrl}" alt="Portada" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        ${downloadBtnHtml}
      </div>

      <!-- COLUMNA INFORMACIÓN -->
      <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4338ca; background: #e0e7ff; padding: 4px 10px; border-radius: 6px; display: inline-block; margin-bottom: 8px;">
            ${formatoText}
          </span>
          <h3 style="margin: 0; font-size: 1.4rem; color: #0f172a; font-weight: 700; line-height: 1.3;">${tituloText}</h3>
          ${subtituloText}
          <p style="margin: 8px 0 0 0; font-size: 0.95rem; color: #4f46e5; font-weight: 600;">
            <i class="fa-solid fa-feather" style="margin-right: 6px;"></i> ${displayName}
          </p>
        </div>

        <!-- DATOS PRINCIPALES -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #f1f5f9;">
          <div>
            <span style="display: block; font-size: 0.725rem; color: #64748b; font-weight: 600;">Editorial</span>
            <strong style="font-size: 0.85rem; color: #0f172a;">${editorialText}</strong>
          </div>
          <div>
            <span style="display: block; font-size: 0.725rem; color: #64748b; font-weight: 600;">ISBN</span>
            <strong style="font-size: 0.85rem; color: #0f172a;">${isbnText}</strong>
          </div>
          <div>
            <span style="display: block; font-size: 0.725rem; color: #64748b; font-weight: 600;">Idioma</span>
            <strong style="font-size: 0.85rem; color: #0f172a;"><i class="fa-solid fa-language" style="color: #6366f1; margin-right: 4px;"></i> ${idiomaText}</strong>
          </div>
          <div>
            <span style="display: block; font-size: 0.725rem; color: #64748b; font-weight: 600;">País</span>
            <strong style="font-size: 0.85rem; color: #0f172a;"><i class="fa-solid fa-globe" style="color: #6366f1; margin-right: 4px;"></i> ${paisText}</strong>
          </div>
        </div>

        <!-- CATEGORÍAS -->
        <div style="background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #f1f5f9;">
          <span style="display: block; font-size: 0.75rem; color: #64748b; font-weight: 700; margin-bottom: 8px;">
            <i class="fa-solid fa-tags" style="color: #6366f1; margin-right: 4px;"></i> Categorías
          </span>
          <div id="bookCategoriesList" style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
            <span style="color: #64748b; font-size: 0.825rem;">Cargando categorías...</span>
          </div>
        </div>

        <!-- DESCRIPCIÓN -->
        <div>
          <h4 style="margin: 0 0 6px 0; font-size: 0.875rem; color: #334155; font-weight: 700;">Sinopsis / Descripción</h4>
          <p style="margin: 0; font-size: 0.875rem; line-height: 1.6; color: #475569; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9;">${descripcionText}</p>
        </div>
      </div>
    </div>

    <!-- MÁS OBRAS DEL AUTOR -->
    <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
      <h3 style="margin: 0 0 4px 0; font-size: 1.05rem; color: #0f172a; font-weight: 700;">Más obras de ${displayName}</h3>
      <p style="margin: 0 0 16px 0; font-size: 0.825rem; color: #64748b;">Explora otros títulos relacionados del mismo autor.</p>
      <div id="relatedBooksList" style="text-align: center; padding: 12px; color: #64748b; font-size: 0.85rem;">Cargando obras...</div>
    </div>
  `;

  document.getElementById('backToBooksBtn')?.addEventListener('click', loadBooksView);

  if (bookId) {
    fetchCategoriasPorLibro(bookId).then(categorias => {
      const catContainer = document.getElementById('bookCategoriesList');
      if (!catContainer) return;

      if (!categorias || categorias.length === 0) {
        catContainer.innerHTML = `<span style="color: #94a3b8; font-size: 0.825rem; font-style: italic;">Sin categorías asignadas</span>`;
        return;
      }

      const badges = categorias.map(cat => {
        const nombre = typeof cat === 'object' 
          ? (cat.nombre || cat.nombreCategoria || cat.categoria?.nombre || cat.name) 
          : cat;
        return `<span style="background: #e0e7ff; color: #4338ca; border: 1px solid rgba(99, 102, 241, 0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">${nombre.toUpperCase()}</span>`;
      }).join('');

      catContainer.innerHTML = badges;
    }).catch(err => {
      console.error('Error al obtener categorías:', err);
    });
  }

  await loadAndRenderRelatedBooks(authorId, typeof authorName === 'string' ? authorName : '', bookId);
}

async function loadAndRenderRelatedBooks(authorId, authorNameQuery, currentBookId) {
  const listContainer = document.getElementById('relatedBooksList');
  if (!listContainer) return;

  let authorBooks = [];
  try {
    const response = await fetchBooks(0, 10, '', '', '', authorId);
    const items = response.content || response;
    authorBooks = Array.isArray(items) ? items.filter(b => String(b.id) !== String(currentBookId)) : [];
  } catch (e) {
    console.error("Error al cargar los libros del autor:", e);
  }

  if (authorBooks.length > 0) {
    const cardsHtml = authorBooks.map(b => {
      const portada = b.portadaUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&h=200&fit=crop';
      const bAutorId = b.id_autor || authorId;
      const bTitulo = b.titulo || '';
      const bFormato = b.formatoLibro || 'Libro';

      return `
        <div class="related-book-item" 
             data-id="${b.id}" 
             data-id-autor="${bAutorId}" 
             style="flex: 0 0 150px; scroll-snap-align: start; cursor: pointer; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 8px; transition: transform 0.15s ease, border-color 0.15s ease;">
          <img src="${portada}" alt="${bTitulo}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px;">
          <div style="overflow: hidden; text-align: left;">
            <h5 style="margin: 0; font-size: 0.8rem; color: #0f172a; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${bTitulo}">${bTitulo}</h5>
            <span style="font-size: 0.7rem; color: #64748b; display: block; margin-top: 2px;">${bFormato}</span>
          </div>
        </div>
      `;
    }).join('');

    listContainer.innerHTML = `
      <div class="horizontal-books-scroll" style="display: flex; gap: 14px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory;">
        ${cardsHtml}
      </div>
    `;

    listContainer.querySelectorAll('.related-book-item').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        const nextBookId = card.getAttribute('data-id');
        openBookDetailsView(nextBookId);
      });
    });
  } else {
    listContainer.innerHTML = `<p style="font-size: 0.85rem; color: #64748b; font-style: italic; margin: 0;">No se encontraron más libros registrados de este autor.</p>`;
  }
}

function renderPagination(pageData) {
  const paginationContainer = document.getElementById('booksPagination');
  if (!paginationContainer) return;

  const number = pageData.number !== undefined ? pageData.number : (pageData.pageNumber || 0);
  const totalPages = pageData.totalPages || 1;
  const totalElements = pageData.totalElements || 0;

  const prevDisabled = number === 0 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : '';
  const nextDisabled = number >= totalPages - 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : '';

  paginationContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 14px 16px; border-top: 1px solid #e2e8f0; background: #ffffff; border-radius: 8px; flex-wrap: wrap; gap: 10px;">
      <span style="font-size: 0.825rem; color: #64748b; font-weight: 500;">Página ${number + 1} de ${totalPages} (Total: ${totalElements} libros)</span>
      <div style="display: flex; gap: 8px;">
        <button id="prevPageBtn" ${prevDisabled} style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem; color: #475569; font-weight: 500;">Anterior</button>
        <button id="nextPageBtn" ${nextDisabled} style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem; color: #475569; font-weight: 500;">Siguiente</button>
      </div>
    </div>
  `;

  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (prevBtn && number > 0) {
    prevBtn.addEventListener('click', () => loadAndRenderBooks(currentSearchNombre, currentSearchAutor, currentSearchIdioma, number - 1, currentLimit));
  }
  if (nextBtn && number < totalPages - 1) {
    nextBtn.addEventListener('click', () => loadAndRenderBooks(currentSearchNombre, currentSearchAutor, currentSearchIdioma, number + 1, currentLimit));
  }
}

function initBookListeners() {
  const btnNewBook = document.getElementById('btnNewBook');
  if (btnNewBook) {
    btnNewBook.addEventListener('click', openCreateBookModal);
  }

  const modal = document.getElementById('bookModal');
  const closeBtn = document.getElementById('closeBookModalBtn');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  const searchTitleInput = document.getElementById('searchBookTitle');
  const searchAuthorInput = document.getElementById('searchBookAuthor');
  const searchIdiomaSelect = document.getElementById('searchBookIdioma');

  const triggerSearch = () => {
    const titleVal = searchTitleInput ? searchTitleInput.value.trim() : '';
    const authorVal = searchAuthorInput ? searchAuthorInput.value.trim() : '';
    const idiomaVal = searchIdiomaSelect ? searchIdiomaSelect.value : '';
    loadAndRenderBooks(titleVal, authorVal, idiomaVal, 0, currentLimit);
  };

  if (searchTitleInput) searchTitleInput.addEventListener('input', triggerSearch);
  if (searchAuthorInput) searchAuthorInput.addEventListener('input', triggerSearch);
  if (searchIdiomaSelect) searchIdiomaSelect.addEventListener('change', triggerSearch);

  const limitSelector = document.getElementById('limitSelector');
  if (limitSelector) {
    limitSelector.addEventListener('change', async (e) => {
      const newSize = Number(e.target.value);
      await loadAndRenderBooks(currentSearchNombre, currentSearchAutor, currentSearchIdioma, 0, newSize);
    });
  }
}

async function openCreateBookModal() {
  const modal = document.getElementById('bookModal');
  const bodyContent = document.getElementById('bookModalBody');
  if (!modal || !bodyContent) return;

  modal.style.display = 'flex';
  bodyContent.innerHTML = `<p style="text-align: center; padding: 20px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando formulario...</p>`;

  let authors = [];
  let languages = [];
  let categories = [];
  let genres = [];
  let bookTypes = [];
  let bookFormats = [];

  try {
    const [authorRes, langRes, catRes, genRes, typeRes, formatRes] = await Promise.allSettled([
      fetchAuthors(0, 100),
      fetchIdiomas(),
      fetchCategorias(0, 100),
      fetchGeneros({ page: 0, size: 100 }),
      fetchTiposLibro(0, 100),
      fetchFormatosLibro(0, 100)
    ]);

    if (authorRes.status === 'fulfilled' && authorRes.value) {
      const val = authorRes.value;
      authors = Array.isArray(val) ? val : (val.content || []);
    }

    if (langRes.status === 'fulfilled' && langRes.value) {
      const val = langRes.value;
      languages = Array.isArray(val) ? val : (val.content || []);
    }

    if (catRes.status === 'fulfilled' && catRes.value) {
      const val = catRes.value;
      categories = Array.isArray(val) ? val : (val.content || []);
    }

    if (genRes.status === 'fulfilled' && genRes.value) {
      const val = genRes.value;
      genres = Array.isArray(val) ? val : (val.content || []);
    }

    if (typeRes.status === 'fulfilled' && typeRes.value) {
      const val = typeRes.value;
      bookTypes = Array.isArray(val) ? val : (val.content || []);
    }

    if (formatRes.status === 'fulfilled' && formatRes.value) {
      const val = formatRes.value;
      bookFormats = Array.isArray(val) ? val : (val.content || []);
    }

  } catch (e) {
    console.error("Error al cargar datos para el modal:", e);
  }

  const authorOptions = authors.map(a =>
    `<option value="${a.id}">${a.nombre} ${a.primerApellido || ''}</option>`
  ).join('');

  const languageOptions = languages.map(l =>
    `<option value="${l.id}">${l.nombre}</option>`
  ).join('');

  const bookTypeOptions = bookTypes.map(t =>
    `<option value="${t.id}">${t.nombre}</option>`
  ).join('');

  const bookFormatOptions = bookFormats.map(f =>
    `<option value="${f.id}">${f.nombre}</option>`
  ).join('');

  const categoryCheckboxes = categories.length > 0
    ? categories.map(c => {
      const catId = c.id || c.idCategoria;
      const catName = c.nombre || c.categoria || 'Sin nombre';
      return `
          <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.825rem; background: #ffffff; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer;">
            <input type="checkbox" class="cat-checkbox" value="${catId}"> ${catName}
          </label>
        `;
    }).join('')
    : '<p style="font-size: 0.8rem; color: #64748b;">No se encontraron categorías.</p>';

  const genreCheckboxes = genres.length > 0
    ? genres.map(g => {
      const genId = g.id || g.idGenero;
      const genName = g.nombre || g.genero || 'Sin nombre';
      return `
          <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.825rem; background: #ffffff; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer;">
            <input type="checkbox" class="gen-checkbox" value="${genId}" data-nombre="${genName}"> ${genName}
          </label>
        `;
    }).join('')
    : '<p style="font-size: 0.8rem; color: #64748b;">No hay géneros cargados.</p>';

  bodyContent.innerHTML = `
    <form id="createBookForm" style="display: flex; flex-direction: column; gap: 14px; max-height: 75vh; overflow-y: auto; padding-right: 4px;">
      
      <!-- Título y Subtítulo -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="flex: 2; min-width: 200px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Título del Libro *</label>
          <input type="text" id="b_titulo" required placeholder="Ej. Cien años de soledad" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Subtítulo</label>
          <input type="text" id="b_subtitulo" placeholder="Opcional" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
      </div>

      <!-- ISBN, Editorial, Tipo de Libro y Formato de Libro -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 130px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">ISBN *</label>
          <input type="text" id="b_isbn" required placeholder="978-3-16-148410-0" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1; min-width: 130px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Editorial *</label>
          <input type="text" id="b_editorial" required placeholder="Nombre de editorial" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1; min-width: 130px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Tipo de Libro *</label>
          <select id="b_id_tipo_libro" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: white;">
            <option value="">Seleccione tipo</option>
            ${bookTypeOptions}
          </select>
        </div>
        <div style="flex: 1; min-width: 130px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Formato *</label>
          <select id="b_id_formato_libro" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: white;">
            <option value="">Seleccione formato</option>
            ${bookFormatOptions}
          </select>
        </div>
      </div>

      <!-- Autor -->
      <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc;">
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 8px;">Autor *</label>
        <div style="display: flex; gap: 16px; margin-bottom: 10px; font-size: 0.85rem;">
          <label style="cursor: pointer;"><input type="radio" name="authorType" value="existing" checked> Autor Existente</label>
          <label style="cursor: pointer;"><input type="radio" name="authorType" value="new"> Registrar Nuevo Autor</label>
        </div>

        <div id="section_existing_author">
          <select id="b_id_autor" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: white;">
            <option value="">Selecciona un autor</option>
            ${authorOptions}
          </select>
        </div>

        <div id="section_new_author" style="display: none; grid-template-columns: 1fr 1fr; gap: 8px;">
          <input type="text" id="a_nombre" placeholder="Nombre *" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
          <input type="text" id="a_segundoNombre" placeholder="Segundo Nombre" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
          <input type="text" id="a_primerApellido" placeholder="Primer Apellido *" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
          <input type="text" id="a_segundoApellido" placeholder="Segundo Apellido" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
          <input type="date" id="a_fechaNacimiento" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
          <div>
            <label style="font-size: 0.75rem; color: #64748b;">Foto del Autor</label>
            <input type="file" id="a_fotoAutorFile" accept="image/*" style="padding: 4px; font-size: 0.8rem; width: 100%;">
          </div>
        </div>
      </div>

      <!-- Idioma y País -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Idioma *</label>
          <select id="b_id_idioma" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: white;">
            <option value="">Seleccione un idioma</option>
            ${languageOptions}
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">País de Origen *</label>
          <input type="text" id="b_paisOrigen" required placeholder="Ej. Colombia" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
      </div>

      <!-- Categorías -->
      <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc;">
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 8px;">Categorías *</label>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${categoryCheckboxes}
        </div>
      </div>

      <!-- Géneros -->
      <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc;">
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 8px;">Géneros <span style="font-weight: normal; color: #64748b;">(Opcional)</span></label>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${genreCheckboxes}
        </div>
      </div>

      <!-- Archivos Multimedia -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 180px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Portada del Libro * (Imagen)</label>
          <input type="file" id="bookImgFile" required accept="image/*" style="width: 100%; padding: 6px; border-radius: 8px; border: 1px dashed #cbd5e1; font-size: 0.8rem; background: #ffffff;">
        </div>
        <div style="flex: 1; min-width: 180px;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Documento del Libro * (PDF)</label>
          <input type="file" id="bookPdfFile" required accept=".pdf" style="width: 100%; padding: 6px; border-radius: 8px; border: 1px dashed #cbd5e1; font-size: 0.8rem; background: #ffffff;">
        </div>
      </div>

      <!-- Descripción -->
      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Descripción / Sinopsis *</label>
        <textarea id="b_descripcion" required rows="3" placeholder="Sinopsis o detalles del libro..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; resize: vertical;"></textarea>
      </div>

      <!-- Botones -->
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelCreateBook" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500; font-size: 0.9rem;">Cancelar</button>
        <button type="submit" class="btn-primary" style="padding: 10px 20px; border-radius: 8px; background: #6366f1; color: white; border: none; cursor: pointer; font-weight: 600; font-size: 0.9rem;">Guardar Libro</button>
      </div>

    </form>
  `;

  // Cambio de pestaña Autor Existente / Nuevo
  const radioAuthorType = modal.querySelectorAll('input[name="authorType"]');
  const sectionExisting = document.getElementById('section_existing_author');
  const sectionNew = document.getElementById('section_new_author');

  radioAuthorType.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'existing') {
        sectionExisting.style.display = 'block';
        sectionNew.style.display = 'none';
        document.getElementById('b_id_autor').required = true;
        document.getElementById('a_nombre').required = false;
        document.getElementById('a_primerApellido').required = false;
      } else {
        sectionExisting.style.display = 'none';
        sectionNew.style.display = 'grid';
        document.getElementById('b_id_autor').required = false;
        document.getElementById('a_nombre').required = true;
        document.getElementById('a_primerApellido').required = true;
      }
    });
  });

  document.getElementById('cancelCreateBook').addEventListener('click', () => modal.style.display = 'none');

  // Submit del Formulario
  const form = document.getElementById('createBookForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const selectedCatCheckboxes = Array.from(document.querySelectorAll('.cat-checkbox:checked'));
      if (selectedCatCheckboxes.length === 0) {
        alert("Por favor selecciona al menos una categoría para el libro.");
        return;
      }

      const selectedGenCheckboxes = Array.from(document.querySelectorAll('.gen-checkbox:checked'));
      const portadaFile = document.getElementById('bookImgFile').files[0];
      const pdfFile = document.getElementById('bookPdfFile').files[0];

      if (!portadaFile || !pdfFile) {
        alert("Debes seleccionar tanto la portada como el documento PDF del libro.");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

      try {
        const formData = new FormData();

        // DTO principal del libro
        const libroDtoReq = {
          titulo: document.getElementById('b_titulo').value.trim(),
          subtitulo: document.getElementById('b_subtitulo').value.trim(),
          isbn: document.getElementById('b_isbn').value.trim(),
          editorial: document.getElementById('b_editorial').value.trim(),
          id_tipo_libro: Number(document.getElementById('b_id_tipo_libro').value),
          id_idioma: Number(document.getElementById('b_id_idioma').value),
          id_formato_libro: Number(document.getElementById('b_id_formato_libro').value),
          paisOrigen: document.getElementById('b_paisOrigen').value.trim(),
          descripcion: document.getElementById('b_descripcion').value.trim()
        };
        formData.append('libroDtoReq', new Blob([JSON.stringify(libroDtoReq)], { type: 'application/json' }));

        // Archivos multimedia obligatorios
        formData.append('portada', portadaFile);
        formData.append('libro', pdfFile);

        // Categorías seleccionadas
        const categoriasList = selectedCatCheckboxes.map(cb => ({ id: Number(cb.value) }));
        formData.append('categorias', new Blob([JSON.stringify(categoriasList)], { type: 'application/json' }));

        // Géneros seleccionados con el nombre capturado en dataset
        const generosList = selectedGenCheckboxes.map(cb => ({
          id: Number(cb.value),
          nombre: cb.dataset.nombre || ''
        }));
        formData.append('generos', new Blob([JSON.stringify(generosList)], { type: 'application/json' }));

        // Gestión del Autor
        const authorTypeVal = form.querySelector('input[name="authorType"]:checked').value;
        let idAutorParam = null;

        if (authorTypeVal === 'existing') {
          idAutorParam = document.getElementById('b_id_autor').value;
          if (!idAutorParam) {
            alert("Por favor selecciona un autor de la lista.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
          }
        } else {
          const autorDtoReq = {
            nombre: document.getElementById('a_nombre').value.trim(),
            segundoNombre: document.getElementById('a_segundoNombre').value.trim(),
            primerApellido: document.getElementById('a_primerApellido').value.trim(),
            segundoApellido: document.getElementById('a_segundoApellido').value.trim(),
            fechaNacimiento: document.getElementById('a_fechaNacimiento').value || null
          };

          formData.append('autorDtoReq', new Blob([JSON.stringify(autorDtoReq)], { type: 'application/json' }));

          const fotoAutorFile = document.getElementById('a_fotoAutorFile').files[0];
          if (fotoAutorFile) {
            formData.append('fotoAutor', fotoAutorFile);
          }
        }

        await createBook(formData, idAutorParam);

        modal.style.display = 'none';
        if (typeof loadAndRenderBooks === 'function') {
          await loadAndRenderBooks('', '', '', 0, typeof currentLimit !== 'undefined' ? currentLimit : 20);
        }
        alert("¡El libro se ha creado correctamente!");

      } catch (error) {
        console.error("Error al crear el libro:", error);
        alert(error.message || "Ocurrió un error al guardar el libro.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
}