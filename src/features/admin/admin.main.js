import { initAdminNavigation } from './admin.navigation.js';
import { loadDashboardView } from './admin-dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Renderizar el Sidebar
  initAdminNavigation();

  // 2. Cargar la vista principal al entrar
  loadDashboardView();
});