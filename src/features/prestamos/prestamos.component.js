import { createLoan } from './prestamos.api.js';
import { hablarTexto } from '../user/user-dashboard.js';

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

        hablarTexto(`Préstamo registrado para ${bookTitle}. Puedes acceder desde tus préstamos.`);
      } catch (err) {
        alert(err.message || 'No se pudo completar la solicitud.');
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    });
  });
}