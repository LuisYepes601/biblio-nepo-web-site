import { createLoan, fetchAllLoansAdmin, returnLoan } from './prestamos.api.js';
import { hablarTexto as hablarTextoUser } from '../user-dashboard.js/user-dashboard.js';
import { hablarTexto as hablarTextoAdmin } from '../admin/admin.navigation.js';

/* ==========================================================================
   1. LADO DEL USUARIO (Catálogo Público / Dashboard Usuario)
   ========================================================================== */

/**
 * Efecto visual flotante al solicitar préstamo
 */
function triggerLoanVisualEffect(btn) {
  const card = btn.closest('.book-card-item') || btn.closest('.card-libro');
  const rect = btn.getBoundingClientRect();

  const icon = document.createElement('div');
  icon.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
  icon.style.cssText = `
    position: fixed;
    left: ${rect.left + rect.width / 2 - 12}px;
    top: ${rect.top - 10}px;
    font-size: 1.5rem;
    color: #2563eb;
    pointer-events: none;
    z-index: 99999;
    transform: scale(0.6);
    opacity: 1;
    transition: all 0.75s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  `;
  document.body.appendChild(icon);

  requestAnimationFrame(() => {
    icon.style.transform = 'translateY(-55px) scale(1.6)';
    icon.style.opacity = '0';
  });

  setTimeout(() => icon.remove(), 750);

  if (card) {
    const originalShadow = card.style.boxShadow;
    const originalTransform = card.style.transform;

    card.style.transition = 'all 0.35s ease';
    card.style.boxShadow = '0 0 25px rgba(37, 99, 235, 0.4)';
    card.style.transform = 'scale(1.02)';

    setTimeout(() => {
      card.style.boxShadow = originalShadow || '';
      card.style.transform = originalTransform || '';
    }, 400);
  }
}

/**
 * Escuchador de clics para solicitar préstamos desde las tarjetas
 */
export function attachCatalogLoanListeners(containerSelector = '#bookGrid') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.querySelectorAll('.btn-request-loan').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const bookId = btn.getAttribute('data-id');
      const bookTitle = btn.getAttribute('data-titulo') || 'Libro';

      if (!bookId || btn.disabled) return;

      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Solicitando...`;

      try {
        await createLoan(bookId);
        triggerLoanVisualEffect(btn);
        
        btn.innerHTML = `<i class="fa-solid fa-check"></i> En Préstamo`;
        btn.style.background = '#10b981';
        btn.style.borderColor = '#059669';
        btn.style.color = '#ffffff';

        if (typeof hablarTextoUser === 'function') {
          hablarTextoUser(`Préstamo registrado para ${bookTitle}. Puedes acceder desde tus préstamos.`);
        }
      } catch (err) {
        alert(err.message || 'No se pudo completar la solicitud.');
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    });
  });
}


/* ==========================================================================
   2. LADO DEL ADMINISTRADOR (Panel de Administración)
   ========================================================================== */

/**
 * Cargar la vista de administración de préstamos
 */
export async function loadLoansAdminView(containerSelector = '#admin-content-container') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = `
    <div class="module-header">
      <div class="module-title-group">
        <h2 class="module-title">Gestión de Préstamos</h2>
        <p class="module-subtitle">Administra los préstamos activos y procesa devoluciones.</p>
      </div>
      <div class="module-actions">
        <!-- Input de búsqueda por email opcional -->
        <div style="display: flex; gap: 10px;">
          <input type="email" id="search-email-admin" placeholder="Buscar por email..." class="form-control" style="width: 250px;">
          <button class="btn-secondary" id="btn-refresh-loans">
            <i class="fa-solid fa-rotate-right"></i> Actualizar
          </button>
        </div>
      </div>
    </div>
    
    <div class="data-table-container">
      <table class="data-table" id="loansAdminTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Libro</th>
            <th>Usuario</th>
            <th>Préstamo</th>
            <th>Vencimiento</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="loansTableBody">
          <tr><td colspan="7" class="text-center">Cargando préstamos...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-refresh-loans').addEventListener('click', () => {
    const email = document.getElementById('search-email-admin').value.trim();
    renderLoansTable(0, 20, email);
    if (typeof hablarTextoAdmin === 'function') {
      hablarTextoAdmin('Actualizando lista de préstamos');
    }
  });

  await renderLoansTable();
}

/**
 * Renderizar la tabla con los datos del backend
 */
async function renderLoansTable(page = 0, size = 20, email = '') {
  const tbody = document.getElementById('loansTableBody');
  if (!tbody) return;

  try {
    const data = await fetchAllLoansAdmin(page, size, email);
    const prestamos = data.content || []; 

    if (!prestamos || prestamos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center">No hay préstamos registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = prestamos.map(p => {
      // Evaluamos el estado en base a isDelete primero, luego si está vencido
      let estadoBadge = '';
      let isDevuelto = p.isDelete === true;
      let isVencido = new Date(p.fecha_venciimiento) < new Date(new Date().setHours(0,0,0,0));

      if (isDevuelto) {
        estadoBadge = `<span class="badge badge-info" style="background: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">Devuelto</span>`;
      } else if (isVencido) {
        estadoBadge = `<span class="badge badge-danger" style="background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">Vencido</span>`;
      } else {
        estadoBadge = `<span class="badge badge-success" style="background: #d1fae5; color: #059669; padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">Activo</span>`;
      }

      const tituloLibro = p.titulo || 'Libro Desconocido';
      
      const nombreUsuario = [p.nombre, p.primerApellido, p.segundoApellido]
        .filter(Boolean).join(' ') || `Usuario ID: ${p.id_user}`;

      const avatarHtml = p.urlFotoPerfil 
        ? `<img src="${p.urlFotoPerfil}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">` 
        : `<div style="width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #6b7280;"><i class="fa-solid fa-user"></i></div>`;

      const portadaHtml = p.portadaUrl
        ? `<img src="${p.portadaUrl}" alt="Portada" style="width: 40px; height: 55px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">`
        : `<div style="width: 40px; height: 55px; border-radius: 4px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #9ca3af;"><i class="fa-solid fa-book"></i></div>`;

      // Solo mostramos el botón de devolver si NO está devuelto (isDelete es false)
      const botonDevolverHtml = !isDevuelto 
        ? `<button class="btn-return-loan btn-icon" style="background: #f3f4f6; color: #4b5563; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" data-id="${p.id_prestamo}" data-titulo="${tituloLibro}" title="Procesar Devolución">
             <i class="fa-solid fa-box-archive"></i>
           </button>`
        : `<span style="color: #9ca3af; font-size: 0.85em; display: inline-block; padding: 8px;">Entregado</span>`;

      return `
        <tr>
          <td><span style="color: #6b7280; font-weight: 500;">#${p.id_prestamo}</span></td>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              ${portadaHtml}
              <div style="display: flex; flex-direction: column;">
                <strong style="color: #111827; font-size: 0.95rem;">${tituloLibro}</strong>
                <span style="font-size: 0.8rem; color: #6b7280;">ISBN: ${p.isbn || 'N/A'}</span>
              </div>
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              ${avatarHtml}
              <span style="color: #374151; font-weight: 500;">${nombreUsuario}</span>
            </div>
          </td>
          <td>
            <div style="display: flex; flex-direction: column;">
              <span>${p.fechaPrestamo}</span>
              <span style="font-size: 0.8rem; color: #6b7280;">${p.hora_prestamo || ''}</span>
            </div>
          </td>
          <td>
            <div style="display: flex; flex-direction: column;">
              <span style="${isVencido && !isDevuelto ? 'color: #dc2626; font-weight: 600;' : ''}">${p.fecha_venciimiento}</span>
              <span style="font-size: 0.8rem; color: #6b7280;">${p.hora_vencimiento || ''}</span>
            </div>
          </td>
          <td>${estadoBadge}</td>
          <td class="table-actions" style="text-align: center;">
            ${botonDevolverHtml}
          </td>
        </tr>
      `;
    }).join('');

    attachLoanAdminListeners();
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger" style="padding: 2rem;">Error: ${error.message}</td></tr>`;
  }
}

/**
 * Escuchadores de eventos para acciones de la tabla
 */
function attachLoanAdminListeners() {
  document.querySelectorAll('.btn-return-loan').forEach(btn => {
    btn.addEventListener('click', async () => {
      const loanId = btn.getAttribute('data-id');
      const titulo = btn.getAttribute('data-titulo');
      
      if (confirm(`¿Estás seguro de registrar la devolución del libro "${titulo}"?`)) {
        try {
          btn.disabled = true;
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
          
          await returnLoan(loanId);
          
          if (typeof hablarTextoAdmin === 'function') {
            hablarTextoAdmin(`Devolución registrada exitosamente para el libro ${titulo}.`);
          }
          
          // Recargar tabla manteniendo el filtro actual
          const email = document.getElementById('search-email-admin').value.trim();
          await renderLoansTable(0, 20, email); 
        } catch (error) {
          alert(`Error al devolver: ${error.message}`);
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-box-archive"></i>';
        }
      }
    });
  });
}