import { initAuthModal } from '../auth/auth-modal.js';

export function initNavigation() {
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  if (!navToggle || !primaryNav) return;

  navToggle.addEventListener('click', () => {
    const isOpen = primaryNav.style.display === 'flex';
    primaryNav.style.display = isOpen ? 'none' : 'flex';
    primaryNav.style.flexDirection = 'column';
    primaryNav.style.position = 'absolute';
    primaryNav.style.top = '68px';
    primaryNav.style.left = '0';
    primaryNav.style.right = '0';
    primaryNav.style.background = 'var(--paper)';
    primaryNav.style.padding = '20px 24px';
    primaryNav.style.borderBottom = '1px solid var(--line)';
  });

  // Selector del botón o enlace de Inicio en tu menú
  const btnInicio = document.getElementById('navInicio') || primaryNav.querySelector('a[href="#inicio"]');

  if (btnInicio) {
    btnInicio.addEventListener('click', () => {
      const heroSection = document.getElementById('inicio');
      const comunidadSection = document.getElementById('comunidad');
      const nosotrosSection = document.getElementById('nosotros');
      const contactoSection = document.getElementById('contacto');
      const ctaBanner = document.querySelector('.catalog-cta-banner');
      
      if (heroSection) heroSection.style.display = '';
      if (comunidadSection) comunidadSection.style.display = '';
      if (nosotrosSection) nosotrosSection.style.display = '';
      if (contactoSection) contactoSection.style.display = '';
      if (ctaBanner) ctaBanner.style.display = '';

      // Cierra el menú hamburguesa en móviles si estaba abierto
      if (window.innerWidth < 1024) {
        primaryNav.style.display = 'none';
      }
    });
  }

  // Conexión del botón "Iniciar Sesión" para abrir el modal
  const btnLogin = Array.from(document.querySelectorAll('.btn-outline')).find(el => el.textContent.trim().toLowerCase().includes('iniciar sesión')) || document.getElementById('btnLogin');

  if (btnLogin) {
    btnLogin.addEventListener('click', (e) => {
      e.preventDefault();
      const authModal = initAuthModal();
      authModal.open('login');
      if (window.innerWidth < 1024) {
        primaryNav.style.display = 'none';
      }
    });
  }
}