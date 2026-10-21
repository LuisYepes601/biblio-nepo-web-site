import { initNavigation } from './src/features/navigation/navigation.component.js';
import { initHero } from './src/features/hero/hero.component.js';
import { initCatalog } from './src/features/catalog/catalog.component.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initHero();
    initCatalog();
    initScrollEffects();
});

/**
 * Control de revelado al hacer scroll (Scroll Reveal) y contadores
 */
function initScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active', 'revealed');
                if (entry.target.id === 'comunidad') {
                    triggerCounters();
                }
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-scroll, .reveal-on-scroll').forEach(el => observer.observe(el));
}

let countersTriggered = false;
function triggerCounters() {
    if (countersTriggered) return;
    countersTriggered = true;

    document.querySelectorAll('.counter').forEach(counter => {
        const target = +counter.getAttribute('data-target');
        if (!target) return;
        let current = 0;
        const increment = Math.ceil(target / 40);

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                counter.textContent = current.toLocaleString();
            }
        }, 30);
    });
}

// Manejo del evento de redirección / navegación a la vista completa de libros
export function setupCatalogNavigation(navigateToCatalog) {
  const btnSeeAllBooks = document.getElementById('btnSeeAllBooks');

  if (btnSeeAllBooks) {
    btnSeeAllBooks.addEventListener('click', () => {
      window.location.hash = '#/catalog';

      if (typeof navigateToCatalog === 'function') {
        navigateToCatalog({ resetFilters: true });
      }
    });
  }
}