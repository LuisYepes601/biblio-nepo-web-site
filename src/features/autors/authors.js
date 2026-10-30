import { 
  fetchAuthors, fetchAuthorDetails, createAuthor, updateAuthor, fetchPaises } from './authors.api.js';
import { navigateToView } from '../admin/admin.navigation.js';

export async function loadAuthorsView() {
  const container = document.getElementById('admin-content-container');
  if (!container) return;

  container.innerHTML = `
    <div class="authors-page-wrapper">
      
      <!-- BARRA SUPERIOR CON BOTÓN REGRESAR -->
      <div class="authors-top-bar">
        <button class="btn-back-dashboard" id="btnBackToDashboard">
          <i class="fa-solid fa-arrow-left"></i> Regresar al Dashboard
        </button>
      </div>

      <!-- CARRUSEL HERO AUTOMÁTICO -->
      <div class="carousel-hero-container" id="authorsHeroCarousel">
        <div class="carousel-track" id="authorsCarouselTrack">
          
          <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80');">
            <div class="carousel-slide-overlay"></div>
            <div class="carousel-slide-content">
              <span class="carousel-slide-tag">Directorio</span>
              <h2 class="carousel-slide-title">Gestión de Autores</h2>
              <p class="carousel-slide-desc">Consulta biografías, datos de origen e historial literario de los escritores registrados.</p>
            </div>
          </div>

          <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80');">
            <div class="carousel-slide-overlay"></div>
            <div class="carousel-slide-content">
              <span class="carousel-slide-tag">Biblioteca</span>
              <h2 class="carousel-slide-title">Catálogo Literario</h2>
              <p class="carousel-slide-desc">Mantén organizada la información de creadores y vincula sus obras activas.</p>
            </div>
          </div>

        </div>

        <div class="carousel-controls">
          <div class="carousel-dots">
            <span class="carousel-dot active"></span>
            <span class="carousel-dot"></span>
          </div>
          <button class="carousel-arrow" id="authorsPrevBtn" title="Anterior"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="carousel-arrow" id="authorsNextBtn" title="Siguiente"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>

      <!-- CONTENEDOR PRINCIPAL -->
      <section class="authors-module-container">
        
        <div class="authors-header module-header">
          <div>
            <h3>Listado de Autores</h3>
            <p>Búsqueda y administración de perfiles.</p>
          </div>
          <button class="btn-primary" id="btn-add-author">
            <i class="fa-solid fa-plus"></i> Nuevo Autor
          </button>
        </div>

        <!-- BÚSQUEDA MINIMALISTA -->
        <div class="authors-search-bars">
          <input type="text" id="searchAuthorName" placeholder="Buscar autor por nombre...">
          <input type="text" id="searchBookName" placeholder="Buscar por título de libro...">
        </div>

        <!-- CUADRÍCULA DE AUTORES -->
        <div class="authors-grid" id="authorsGrid">
          <p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted, #64748b);">Cargando autores...</p>
        </div>
      </section>

    </div>

    <!-- Modal General -->
    <div id="authorModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 24px; border-radius: 12px; width: 100%; max-width: 600px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 id="modalTitle" style="margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">Detalles del Autor</h3>
          <button id="closeModalBtn" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="modalBody">
          <!-- Contenido dinámico -->
        </div>
      </div>
    </div>

    <!-- Modal Carga -->
    <div id="loadingModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); align-items: center; justify-content: center; z-index: 1100;">
      <div style="background: white; padding: 20px 28px; border-radius: 10px; display: flex; align-items: center; gap: 14px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #6366f1;"></i>
        <div>
          <h4 id="loadingText" style="margin: 0; font-size: 0.95rem; color: #0f172a;">Procesando...</h4>
          <p style="margin: 2px 0 0 0; font-size: 0.785rem; color: #64748b;">Por favor espera.</p>
        </div>
      </div>
    </div>
  `;

  // Evento del botón de regreso
  const btnBack = document.getElementById('btnBackToDashboard');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      navigateToView('dashboard');
    });
  }

  // Inicializar carrusel hero
  initAuthorsCarousel();

  initSearchListeners();
  initModalListeners();
  initNewAuthorButtonListener();
  await loadAndRenderAuthors();
}

/**
 * Control automático de movimiento continuo para el carrusel de Autores
 */
function initAuthorsCarousel() {
  const track = document.getElementById('authorsCarouselTrack');
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];
  const dots = document.querySelectorAll('#authorsHeroCarousel .carousel-dot');
  const prevBtn = document.getElementById('authorsPrevBtn');
  const nextBtn = document.getElementById('authorsNextBtn');
  const container = document.getElementById('authorsHeroCarousel');

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

function getPageSizeByDevice() {
  const width = window.innerWidth;
  if (width < 768) return 8;
  if (width < 1024) return 12;
  return 20;
}

async function loadAndRenderAuthors(authorName = '', bookName = '') {
  const pageSize = getPageSizeByDevice();
  const response = await fetchAuthors(0, pageSize, authorName, bookName);
  renderAuthors(response.content || []);
}

function renderAuthors(authors) {
  const grid = document.getElementById('authorsGrid');
  if (!grid) return;

  if (!authors || authors.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted, #64748b);">No se encontraron autores.</p>`;
    return;
  }

  grid.innerHTML = authors.map(author => {
    const fullName = `${author.nombre || ''} ${author.segundoNombre || ''} ${author.primerApellido || ''} ${author.segundoApellido || ''}`.replace(/\s+/g, ' ').trim();
    const fullNameBuscable = fullName.toLowerCase();

    return `
      <div class="author-card">
        <div class="author-card-top">
          <img src="${author.urlFoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'}" alt="${fullName}" class="author-avatar">
        </div>
        <div class="author-info">
          <h4>${fullName}</h4>
          <p><i class="fa-solid fa-id-badge"></i> ID: ${author.id}</p>
        </div>
        <div class="author-actions">
          <button class="icon-btn btn-edit" data-id="${author.id}" data-nombre="${fullNameBuscable}" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn btn-details" data-id="${author.id}" data-nombre="${fullNameBuscable}" title="Ver Detalles"><i class="fa-solid fa-eye"></i></button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const authorId = e.currentTarget.getAttribute('data-id');
      await openDetailsModal(authorId);
    });
  });

  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const authorId = e.currentTarget.getAttribute('data-id');
      await openEditModal(authorId);
    });
  });
}

function initNewAuthorButtonListener() {
  const btnNewAuthor = document.getElementById('btn-add-author') || document.getElementById('btnNewAuthor');
  if (btnNewAuthor) {
    btnNewAuthor.addEventListener('click', () => {
      openCreateModal();
    });
  }
}

async function openCreateModal() {
  const modal = document.getElementById('authorModal');
  const title = document.getElementById('modalTitle');
  const bodyContent = document.getElementById('modalBody');
  if (!modal || !bodyContent) return;

  title.textContent = "Nuevo Autor";
  modal.style.display = 'flex';
  bodyContent.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Cargando formulario...</p>`;

  let paises = [];
  try {
    paises = await fetchPaises();
  } catch (err) {
    paises = [{ id: 1, nombre: 'Colombia' }];
  }

  const listaPaises = Array.isArray(paises) && paises.length > 0 ? paises : [{ id: 1, nombre: 'Colombia' }];
  const paisesOptions = listaPaises.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

  bodyContent.innerHTML = `
    <form id="createAuthorForm" class="form-container" style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; gap: 10px;">
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Primer Nombre *</label>
          <input type="text" id="createNombre" required placeholder="Ej. Gabriel" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Segundo Nombre</label>
          <input type="text" id="createSegundoNombre" placeholder="Ej. José" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Primer Apellido *</label>
          <input type="text" id="createPrimerApellido" required placeholder="Ej. García" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Segundo Apellido</label>
          <input type="text" id="createSegundoApellido" placeholder="Ej. Márquez" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nacimiento *</label>
          <input type="date" id="createFechaNacimiento" required style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Fallecimiento</label>
          <input type="date" id="createFechaFallecimiento" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; background: #f8fafc;" disabled>
        </div>
      </div>

      <div style="display: flex; gap: 10px; align-items: center; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">País de Origen *</label>
          <select id="createIdPais" style="width: 100%; padding: 7px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; background: white;">
            ${paisesOptions}
          </select>
        </div>
        <div style="flex: 1; display: flex; align-items: center; gap: 6px; margin-top: 16px;">
          <input type="checkbox" id="createIsFallecido" style="cursor: pointer;">
          <label for="createIsFallecido" style="font-size: 0.8rem; font-weight: 600; color: #334155; cursor: pointer;">¿Autor fallecido?</label>
        </div>
      </div>

      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Fotografía *</label>
        <input type="file" id="createImgFile" accept="image/*" required style="width: 100%; padding: 6px; border-radius: 6px; border: 1px dashed #cbd5e1; font-size: 0.8rem;">
      </div>

      <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <img id="createImgPreviewLarge" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces" alt="Vista previa" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
        <div>
          <p style="margin: 0; font-size: 0.8rem; font-weight: 600; color: #0f172a;">Vista previa de imagen</p>
          <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: #64748b;">Selecciona un archivo arriba</p>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
        <button type="button" id="cancelCreateBtn" class="btn-secondary" style="padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem;">Cancelar</button>
        <button type="submit" class="btn-primary btn-success" style="padding: 8px 16px; border-radius: 6px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600;">Guardar</button>
      </div>
    </form>
  `;

  setTimeout(() => {
    const input = document.getElementById('createNombre');
    if (input) input.focus();
  }, 100);

  const imageInput = document.getElementById('createImgFile');
  const imgPreviewLarge = document.getElementById('createImgPreviewLarge');

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imgPreviewLarge.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  const checkboxFallecido = document.getElementById('createIsFallecido');
  const inputFechaFallecimiento = document.getElementById('createFechaFallecimiento');

  checkboxFallecido.addEventListener('change', () => {
    if (checkboxFallecido.checked) {
      inputFechaFallecimiento.disabled = false;
      inputFechaFallecimiento.style.backgroundColor = '#ffffff';
    } else {
      inputFechaFallecimiento.disabled = true;
      inputFechaFallecimiento.value = '';
      inputFechaFallecimiento.style.backgroundColor = '#f8fafc';
    }
  });

  document.getElementById('cancelCreateBtn').addEventListener('click', closeAuthorModal);

  document.getElementById('createAuthorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const loadingModal = document.getElementById('loadingModal');
    const loadingText = document.getElementById('loadingText');
    if (loadingText) loadingText.textContent = "Guardando...";
    if (loadingModal) loadingModal.style.display = 'flex';

    const bodyPayload = {
      nombre: document.getElementById('createNombre').value.trim(),
      segundoNombre: document.getElementById('createSegundoNombre').value.trim(),
      primerApellido: document.getElementById('createPrimerApellido').value.trim(),
      segundoApellido: document.getElementById('createSegundoApellido').value.trim(),
      fechaNacimiento: document.getElementById('createFechaNacimiento').value,
      fechaFallecimiento: checkboxFallecido.checked ? (document.getElementById('createFechaFallecimiento').value || null) : null,
      isFallecido: checkboxFallecido.checked,
      idPais: Number(document.getElementById('createIdPais').value)
    };

    const imageFile = imageInput.files[0];

    const success = await createAuthor(bodyPayload, imageFile);

    if (loadingModal) loadingModal.style.display = 'none';

    if (success) {
      closeAuthorModal();
      await loadAndRenderAuthors();
    } else {
      alert('Error al registrar el autor.');
    }
  });
}

async function openDetailsModal(id) {
  const modal = document.getElementById('authorModal');
  const title = document.getElementById('modalTitle');
  const bodyContent = document.getElementById('modalBody');
  if (!modal || !bodyContent) return;

  title.textContent = "Detalles del Autor";
  modal.style.display = 'flex';
  bodyContent.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Cargando...</p>`;

  const details = await fetchAuthorDetails(id);
  if (!details) {
    bodyContent.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se pudo obtener la información.</p>`;
    return;
  }

  const photoUrl = details.urlFoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces';

  bodyContent.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
      <img src="${photoUrl}" alt="Autor" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #eef2ff;">

      <div style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: #f8fafc; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="display: block; font-size: 0.7rem; color: #64748b; font-weight: 600;">Nacimiento</span>
          <span style="font-size: 0.85rem; color: #0f172a; font-weight: 600;">${details.fechaNacimiento || 'N/A'}</span>
        </div>
        
        <div style="background: #f8fafc; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="display: block; font-size: 0.7rem; color: #64748b; font-weight: 600;">Fallecimiento</span>
          <span style="font-size: 0.85rem; color: #0f172a; font-weight: 600;">${details.fechaFallecimiento || 'N/A'}</span>
        </div>
      </div>

      <div style="width: 100%; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 6px; font-size: 0.825rem;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #64748b;">Creado por:</span>
          <span style="color: #0f172a; font-weight: 600;">${details.creatorName || 'Sistema'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #64748b;">Actualizado:</span>
          <span style="color: #0f172a; font-weight: 600;">${details.updateName || 'N/A'}</span>
        </div>
      </div>
    </div>
  `;
}

async function openEditModal(id) {
  const modal = document.getElementById('authorModal');
  const title = document.getElementById('modalTitle');
  const bodyContent = document.getElementById('modalBody');
  if (!modal || !bodyContent) return;

  title.textContent = "Editar Autor";
  modal.style.display = 'flex';
  bodyContent.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Cargando...</p>`;

  const [details, paises] = await Promise.all([
    fetchAuthorDetails(id),
    fetchPaises().catch(() => [{ id: 1, nombre: 'Colombia' }])
  ]);

  if (!details) {
    bodyContent.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se pudo cargar la información.</p>`;
    return;
  }

  const listaPaises = Array.isArray(paises) && paises.length > 0 ? paises : [{ id: 1, nombre: 'Colombia' }];
  const paisesOptions = listaPaises.map(pais => {
    const paisId = details.idPais || (details.pais ? details.pais.id : 1);
    const isSelected = pais.id === paisId ? 'selected' : '';
    return `<option value="${pais.id}" ${isSelected}>${pais.nombre}</option>`;
  }).join('');

  const currentPhotoUrl = details.urlFoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces';

  bodyContent.innerHTML = `
    <form id="editAuthorForm" class="form-container" style="display: flex; flex-direction: column; gap: 12px;">
      
      <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <img id="imgPreviewSmall" src="${currentPhotoUrl}" alt="Foto" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">
        <div>
          <span style="display: block; font-size: 0.8rem; font-weight: 600; color: #0f172a;">Fotografía actual</span>
          <span style="font-size: 0.75rem; color: #64748b;">Selecciona un archivo abajo para cambiarla</span>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Primer Nombre</label>
          <input type="text" id="editNombre" value="${details.nombre || ''}" required style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Segundo Nombre</label>
          <input type="text" id="editSegundoNombre" value="${details.segundoNombre || ''}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Primer Apellido</label>
          <input type="text" id="editPrimerApellido" value="${details.primerApellido || ''}" required style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Segundo Apellido</label>
          <input type="text" id="editSegundoApellido" value="${details.segundoApellido || ''}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nacimiento</label>
          <input type="date" id="editFechaNacimiento" value="${details.fechaNacimiento || ''}" required style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Fallecimiento</label>
          <input type="date" id="editFechaFallecimiento" value="${details.fechaFallecimiento || ''}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;">
        </div>
      </div>

      <div style="display: flex; gap: 10px; align-items: center; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div style="flex: 1;">
          <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">País de Origen</label>
          <select id="editIdPais" style="width: 100%; padding: 7px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; background: white;">
            ${paisesOptions}
          </select>
        </div>
        <div style="flex: 1; display: flex; align-items: center; gap: 6px; margin-top: 16px;">
          <input type="checkbox" id="editIsFallecido" ${details.isFallecido ? 'checked' : ''} style="cursor: pointer;">
          <label for="editIsFallecido" style="font-size: 0.8rem; font-weight: 600; color: #334155; cursor: pointer;">¿Autor fallecido?</label>
        </div>
      </div>

      <div>
        <label style="font-size: 0.785rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Nueva Fotografía (Opcional)</label>
        <input type="file" id="editImgFile" accept="image/*" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px dashed #cbd5e1; font-size: 0.8rem;">
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
        <button type="button" id="cancelEditBtn" class="btn-secondary" style="padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 0.825rem;">Cancelar</button>
        <button type="submit" class="btn-primary btn-success" style="padding: 8px 16px; border-radius: 6px; border: none; background: #6366f1; color: white; cursor: pointer; font-size: 0.825rem; font-weight: 600;">Guardar Cambios</button>
      </div>
    </form>
  `;

  setTimeout(() => {
    const input = document.getElementById('editNombre');
    if (input) input.focus();
  }, 100);

  const imageInput = document.getElementById('editImgFile');
  const imgPreviewSmall = document.getElementById('imgPreviewSmall');

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imgPreviewSmall.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  const checkboxFallecido = document.getElementById('editIsFallecido');
  const inputFechaFallecimiento = document.getElementById('editFechaFallecimiento');

  const actualizarEstadoFechaFallecimiento = () => {
    if (checkboxFallecido.checked) {
      inputFechaFallecimiento.disabled = false;
      inputFechaFallecimiento.style.backgroundColor = '#ffffff';
    } else {
      inputFechaFallecimiento.disabled = true;
      inputFechaFallecimiento.value = '';
      inputFechaFallecimiento.style.backgroundColor = '#f8fafc';
    }
  };

  actualizarEstadoFechaFallecimiento();
  checkboxFallecido.addEventListener('change', actualizarEstadoFechaFallecimiento);

  document.getElementById('cancelEditBtn').addEventListener('click', closeAuthorModal);

  document.getElementById('editAuthorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const loadingModal = document.getElementById('loadingModal');
    const loadingText = document.getElementById('loadingText');
    if (loadingText) loadingText.textContent = "Guardando...";
    if (loadingModal) loadingModal.style.display = 'flex';

    const updatedBody = {
      nombre: document.getElementById('editNombre').value.trim(),
      segundoNombre: document.getElementById('editSegundoNombre').value.trim(),
      primerApellido: document.getElementById('editPrimerApellido').value.trim(),
      segundoApellido: document.getElementById('editSegundoApellido').value.trim(),
      fechaNacimiento: document.getElementById('editFechaNacimiento').value,
      fechaFallecimiento: checkboxFallecido.checked ? (document.getElementById('editFechaFallecimiento').value || null) : null,
      isFallecido: checkboxFallecido.checked,
      idPais: Number(document.getElementById('editIdPais').value)
    };

    const imageFile = imageInput && imageInput.files && imageInput.files.length > 0 ? imageInput.files[0] : null;

    const success = await updateAuthor(id, updatedBody, imageFile);

    if (loadingModal) loadingModal.style.display = 'none';

    if (success) {
      closeAuthorModal();
      const searchAuthorInput = document.getElementById('searchAuthorName');
      const searchBookInput = document.getElementById('searchBookName');
      await loadAndRenderAuthors(
        searchAuthorInput ? searchAuthorInput.value.trim() : '',
        searchBookInput ? searchBookInput.value.trim() : ''
      );
    } else {
      alert('Error al actualizar el autor.');
    }
  });
}

function initModalListeners() {
  const modal = document.getElementById('authorModal');
  const closeBtn = document.getElementById('closeModalBtn');
  
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', closeAuthorModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAuthorModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAuthorModal();
  });
}

export function closeAuthorModal() {
  const modal = document.getElementById('authorModal');
  if (modal) modal.style.display = 'none';
}

function initSearchListeners() {
  const searchAuthorInput = document.getElementById('searchAuthorName');
  const searchBookInput = document.getElementById('searchBookName');
  
  const handleSearch = async () => {
    const authorName = searchAuthorInput ? searchAuthorInput.value.trim() : '';
    const bookName = searchBookInput ? searchBookInput.value.trim() : '';
    await loadAndRenderAuthors(authorName, bookName);
  };

  if (searchAuthorInput) {
    searchAuthorInput.addEventListener('input', handleSearch);
  }
  if (searchBookInput) {
    searchBookInput.addEventListener('input', handleSearch);
  }
}