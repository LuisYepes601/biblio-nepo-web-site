import { 
  fetchAuthors, fetchAuthorDetails, createAuthor, updateAuthor, fetchPaises } from './authors.api.js';

export async function loadAuthorsView() {
  const container = document.getElementById('admin-content-container');
  if (!container) return;

  container.innerHTML = `
    <div class="view-header">
      <h1>Gestión de Autores</h1>
      <p>Administra los escritores, creadores y referentes literarios registrados en el sistema.</p>
    </div>

    <section class="authors-module-container">
      <div class="authors-header">
        <div>
          <h3>Listado de Autores</h3>
          <p>Control de biografías, nacionalidad y publicaciones asociadas.</p>
        </div>
        <button class="btn-primary" id="btnNewAuthor">
          <i class="fa-solid fa-feather"></i> Nuevo Autor
        </button>
      </div>

      <div class="authors-search-bars" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <input type="text" id="searchAuthorName" placeholder="Buscar por nombre de autor..." 
               style="flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0); outline: none; font-size: 0.875rem;">
        
        <input type="text" id="searchBookName" placeholder="Buscar por nombre de libro..." 
               style="flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0); outline: none; font-size: 0.875rem;">
      </div>

      <div class="authors-grid" id="authorsGrid">
        <p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Cargando autores...</p>
      </div>
    </section>

    <!-- Modal General para Detalles, Edición o Creación -->
    <div id="authorModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px;">
      <div class="modal-content" style="background: white; padding: 28px; border-radius: 16px; width: 100%; max-width: 640px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); position: relative; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 id="modalTitle" style="margin: 0; font-size: 1.25rem;">Detalles del Autor</h3>
          <button id="closeModalBtn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="modalBody">
          <!-- Contenido dinámico -->
        </div>
      </div>
    </div>

    <!-- Modal de Carga / Alerta de Procesamiento -->
    <div id="loadingModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1100;">
      <div style="background: white; padding: 24px 36px; border-radius: 12px; display: flex; align-items: center; gap: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; color: #6366f1;"></i>
        <div>
          <h4 id="loadingText" style="margin: 0; font-size: 1rem; color: #1e293b;">Procesando solicitud...</h4>
          <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #64748b;">Por favor, espera un momento.</p>
        </div>
      </div>
    </div>
  `;

  initSearchListeners();
  initModalListeners();
  initNewAuthorButtonListener();
  await loadAndRenderAuthors();
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
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">No se encontraron autores registrados.</p>`;
    return;
  }

  grid.innerHTML = authors.map(author => {
    const fullName = `${author.nombre || ''} ${author.segundoNombre || ''} ${author.primerApellido || ''} ${author.segundoApellido || ''}`.replace(/\s+/g, ' ').trim();
    
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
          <button class="icon-btn btn-edit" data-id="${author.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn btn-details" data-id="${author.id}" title="Ver Detalles"><i class="fa-solid fa-eye"></i></button>
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
  const btnNewAuthor = document.getElementById('btnNewAuthor');
  if (btnNewAuthor) {
    btnNewAuthor.addEventListener('click', () => {
      openCreateModal();
    });
  }
}

// ------------------------- MODAL CREAR NUEVO AUTOR -------------------------
async function openCreateModal() {
  const modal = document.getElementById('authorModal');
  const title = document.getElementById('modalTitle');
  const bodyContent = document.getElementById('modalBody');
  if (!modal || !bodyContent) return;

  title.textContent = "Nuevo Autor";
  modal.style.display = 'flex';
  bodyContent.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Cargando formulario y países...</p>`;

  let paises = [];
  try {
    paises = await fetchPaises();
  } catch (err) {
    paises = [{ id: 1, nombre: 'Colombia' }];
  }

  const listaPaises = Array.isArray(paises) && paises.length > 0 ? paises : [{ id: 1, nombre: 'Colombia' }];
  const paisesOptions = listaPaises.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

  bodyContent.innerHTML = `
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
      <div style="width: 48px; height: 48px; border-radius: 12px; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
        <i class="fa-solid fa-feather-pointed"></i>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1.05rem; color: #1e293b;">Registro de Autor</h4>
        <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: #64748b;">Completa los campos para dar de alta un nuevo perfil.</p>
      </div>
    </div>

    <form id="createAuthorForm" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; gap: 12px;">
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Primer Nombre *</label>
          <input type="text" id="createNombre" required placeholder="Ej. Jhon" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Segundo Nombre</label>
          <input type="text" id="createSegundoNombre" placeholder="Ej. Jose" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Primer Apellido *</label>
          <input type="text" id="createPrimerApellido" required placeholder="Ej. Menendez" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Segundo Apellido</label>
          <input type="text" id="createSegundoApellido" placeholder="Ej. Peréz" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Fecha Nacimiento *</label>
          <input type="date" id="createFechaNacimiento" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Fecha Fallecimiento</label>
          <input type="date" id="createFechaFallecimiento" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: #f1f5f9; opacity: 0.6;" disabled>
        </div>
      </div>

      <div style="display: flex; gap: 12px; align-items: center; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">País de Origen *</label>
          <select id="createIdPais" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: white;">
            ${paisesOptions}
          </select>
        </div>
        <div style="flex: 1; display: flex; align-items: center; gap: 8px; margin-top: 18px;">
          <input type="checkbox" id="createIsFallecido" style="width: 16px; height: 16px; cursor: pointer;">
          <label for="createIsFallecido" style="font-size: 0.85rem; font-weight: 600; color: #334155; cursor: pointer;">¿Autor fallecido?</label>
        </div>
      </div>

      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Fotografía del Autor *</label>
        <input type="file" id="createImgFile" accept="image/*" required style="width: 100%; padding: 8px; border-radius: 8px; border: 1px dashed #cbd5e1; font-size: 0.85rem; background: #f8fafc;">
      </div>

      <!-- Previsualización Dinámica de Autor -->
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: -20px; right: -20px; color: #e2e8f0; font-size: 5rem; z-index: 0; pointer-events: none; opacity: 0.5;">
          <i class="fa-solid fa-feather"></i>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; position: relative; z-index: 1;">
          <span style="font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-image" style="color: #6366f1;"></i> Vista Previa del Autor
          </span>
          <span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <i class="fa-solid fa-circle-check"></i> Estoy seguro de esto
          </span>
        </div>

        <div style="position: relative; z-index: 1; padding: 4px; background: white; border-radius: 50%; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.12);">
          <img id="createImgPreviewLarge" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces" alt="Vista previa grande" style="width: 110px; height: 110px; object-fit: cover; border-radius: 50%; display: block; transition: transform 0.3s ease;">
        </div>

        <div style="position: relative; z-index: 1;">
          <p style="margin: 0; font-size: 0.85rem; font-weight: 600; color: #1e293b;">Fotografía de perfil institucional</p>
          <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: #64748b;">Sube un archivo para actualizar la previsualización en tiempo real.</p>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelCreateBtn" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
        <button type="submit" class="btn-primary" style="padding: 10px 20px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-weight: 600;">Registrar Autor</button>
      </div>
    </form>
  `;

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
      inputFechaFallecimiento.style.opacity = '1';
    } else {
      inputFechaFallecimiento.disabled = true;
      inputFechaFallecimiento.value = '';
      inputFechaFallecimiento.style.backgroundColor = '#f1f5f9';
      inputFechaFallecimiento.style.opacity = '0.6';
    }
  });

  document.getElementById('cancelCreateBtn').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  document.getElementById('createAuthorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const loadingModal = document.getElementById('loadingModal');
    const loadingText = document.getElementById('loadingText');
    if (loadingText) loadingText.textContent = "Registrando autor...";
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

    // ✅ Aquí está la corrección clave: usamos la función de la API
    const success = await createAuthor(bodyPayload, imageFile);

    if (loadingModal) loadingModal.style.display = 'none';

    if (success) {
      modal.style.display = 'none';
      await loadAndRenderAuthors();
    } else {
      alert('Ocurrió un error al registrar el autor.');
    }
  });
}

// ------------------------- MODAL DETALLES -------------------------
async function openDetailsModal(id) {
  const modal = document.getElementById('authorModal');
  const title = document.getElementById('modalTitle');
  const bodyContent = document.getElementById('modalBody');
  if (!modal || !bodyContent) return;

  title.textContent = "Detalles del Autor";
  modal.style.display = 'flex';
  bodyContent.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Cargando detalles...</p>`;

  const details = await fetchAuthorDetails(id);
  if (!details) {
    bodyContent.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se pudo cargar la información del autor.</p>`;
    return;
  }

  const photoUrl = details.urlFoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces';

  bodyContent.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
      <img src="${photoUrl}" alt="Foto del autor" style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 4px solid #f1f5f9; box-shadow: 0 8px 20px rgba(0,0,0,0.12);">

      <div style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #f8fafc; padding: 12px 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <span style="display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Nacimiento</span>
          <span style="font-size: 0.95rem; color: #1e293b; font-weight: 500;"><i class="fa-regular fa-calendar" style="margin-right: 6px; color: #6366f1;"></i>${details.fechaNacimiento || 'No registrada'}</span>
        </div>
        
        <div style="background: #f8fafc; padding: 12px 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <span style="display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Fallecimiento</span>
          <span style="font-size: 0.95rem; color: #1e293b; font-weight: 500;"><i class="fa-regular fa-calendar-xmark" style="margin-right: 6px; color: #ef4444;"></i>${details.fechaFallecimiento || 'N/A'}</span>
        </div>
      </div>

      <div style="width: 100%; background: #f8fafc; padding: 14px 16px; border-radius: 10px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px; font-size: 0.875rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #64748b;"><i class="fa-solid fa-user-plus" style="margin-right: 6px;"></i>Creado por:</span>
          <span style="color: #1e293b; font-weight: 500;">${details.creatorName || 'Sistema'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #64748b;"><i class="fa-solid fa-user-pen" style="margin-right: 6px;"></i>Actualizado:</span>
          <span style="color: #1e293b; font-weight: 500;">${details.updateName || 'N/A'}</span>
        </div>
      </div>
    </div>
  `;
}

// ------------------------- MODAL EDITAR -------------------------
async function openEditModal(id) {
  const modal = document.getElementById('authorModal');
  const title = document.getElementById('modalTitle');
  const bodyContent = document.getElementById('modalBody');
  if (!modal || !bodyContent) return;

  title.textContent = "Editar Autor";
  modal.style.display = 'flex';
  bodyContent.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Cargando datos del autor y países...</p>`;

  const [details, paises] = await Promise.all([
    fetchAuthorDetails(id),
    fetchPaises().catch(() => [{ id: 1, nombre: 'Colombia' }])
  ]);

  if (!details) {
    bodyContent.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">No se pudo cargar la información para editar.</p>`;
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
    <form id="editAuthorForm" style="display: flex; flex-direction: column; gap: 14px;">
      
      <!-- Previsualización Pequeña (Arriba) -->
      <div style="display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <img id="imgPreviewSmall" src="${currentPhotoUrl}" alt="Previsualización" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <div>
          <span style="display: block; font-size: 0.85rem; font-weight: 600; color: #1e293b;">Fotografía del Autor</span>
          <span style="font-size: 0.75rem; color: #64748b;">Puedes cambiar la imagen seleccionando un archivo abajo.</span>
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Primer Nombre</label>
          <input type="text" id="editNombre" value="${details.nombre || ''}" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Segundo Nombre</label>
          <input type="text" id="editSegundoNombre" value="${details.segundoNombre || ''}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Primer Apellido</label>
          <input type="text" id="editPrimerApellido" value="${details.primerApellido || ''}" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Segundo Apellido</label>
          <input type="text" id="editSegundoApellido" value="${details.segundoApellido || ''}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Fecha Nacimiento</label>
          <input type="date" id="editFechaNacimiento" value="${details.fechaNacimiento || ''}" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Fecha Fallecimiento</label>
          <input type="date" id="editFechaFallecimiento" value="${details.fechaFallecimiento || ''}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: #fff;">
        </div>
      </div>

      <div style="display: flex; gap: 12px; align-items: center; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">País de Origen</label>
          <select id="editIdPais" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.9rem; background: white;">
            ${paisesOptions}
          </select>
        </div>
        <div style="flex: 1; display: flex; align-items: center; gap: 8px; margin-top: 18px;">
          <input type="checkbox" id="editIsFallecido" ${details.isFallecido ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;">
          <label for="editIsFallecido" style="font-size: 0.85rem; font-weight: 600; color: #334155; cursor: pointer;">¿Autor fallecido?</label>
        </div>
      </div>

      <div>
        <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Nueva Fotografía (Opcional)</label>
        <input type="file" id="editImgFile" accept="image/*" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px dashed #cbd5e1; font-size: 0.85rem; background: #f8fafc;">
      </div>

      <!-- Previsualización Dinámica de Autor -->
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: -20px; right: -20px; color: #e2e8f0; font-size: 5rem; z-index: 0; pointer-events: none; opacity: 0.5;">
          <i class="fa-solid fa-feather"></i>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; position: relative; z-index: 1;">
          <span style="font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-image" style="color: #6366f1;"></i> Vista Previa del Autor
          </span>
          <span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <i class="fa-solid fa-circle-check"></i> Estoy seguro de esto
          </span>
        </div>

        <div style="position: relative; z-index: 1; padding: 4px; background: white; border-radius: 50%; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.12);">
          <img id="imgPreviewLarge" src="${currentPhotoUrl}" alt="Vista previa grande" style="width: 110px; height: 110px; object-fit: cover; border-radius: 50%; display: block; transition: transform 0.3s ease;">
        </div>

        <div style="position: relative; z-index: 1;">
          <p style="margin: 0; font-size: 0.85rem; font-weight: 600; color: #1e293b;">Fotografía de perfil institucional</p>
          <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: #64748b;">Sube un archivo para actualizar la previsualización en tiempo real.</p>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelEditBtn" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
        <button type="submit" class="btn-primary" style="padding: 10px 20px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; font-weight: 600;">Guardar Cambios</button>
      </div>
    </form>
  `;

  const imageInput = document.getElementById('editImgFile');
  const imgPreviewSmall = document.getElementById('imgPreviewSmall');
  const imgPreviewLarge = document.getElementById('imgPreviewLarge');

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imgPreviewSmall.src = event.target.result;
        imgPreviewLarge.src = event.target.result;
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
      inputFechaFallecimiento.style.opacity = '1';
    } else {
      inputFechaFallecimiento.disabled = true;
      inputFechaFallecimiento.value = '';
      inputFechaFallecimiento.style.backgroundColor = '#f1f5f9';
      inputFechaFallecimiento.style.opacity = '0.6';
    }
  };

  actualizarEstadoFechaFallecimiento();
  checkboxFallecido.addEventListener('change', actualizarEstadoFechaFallecimiento);

  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  document.getElementById('editAuthorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const loadingModal = document.getElementById('loadingModal');
    const loadingText = document.getElementById('loadingText');
    if (loadingText) loadingText.textContent = "Guardando cambios...";
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
      modal.style.display = 'none';
      const searchAuthorInput = document.getElementById('searchAuthorName');
      const searchBookInput = document.getElementById('searchBookName');
      await loadAndRenderAuthors(
        searchAuthorInput ? searchAuthorInput.value.trim() : '',
        searchBookInput ? searchBookInput.value.trim() : ''
      );
    } else {
      alert('Hubo un error al actualizar el autor.');
    }
  });
}

function initModalListeners() {
  const modal = document.getElementById('authorModal');
  const closeBtn = document.getElementById('closeModalBtn');
  
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Cerrar si hace clic fuera del modal
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
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