import { initNavigation } from './src/features/navigation/navigation.component.js';

import { initHero } from './src/features/hero/hero.component.js';

import { initCatalog } from './src/features/catalog/catalog.component.js';

document.addEventListener('DOMContentLoaded', () => {

    initNavigation();

    initHero();

    initCatalog();

});

// Manejo del evento de redirección / navegación a la vista completa de libros
export function setupCatalogNavigation(navigateToCatalog) {
  const btnSeeAllBooks = document.getElementById('btnSeeAllBooks');

  if (btnSeeAllBooks) {
    btnSeeAllBooks.addEventListener('click', () => {
      // 1. Si usas enrutamiento por hash (SPA):
      window.location.hash = '#/catalog';

      // 2. O ejecutas la función de navegación/renderizado de la vista de libros completa:
      if (typeof navigateToCatalog === 'function') {
        navigateToCatalog({ resetFilters: true });
      }
    });
  }
}