export function loadUsersView() {
  const container = document.getElementById('admin-content-container');
  if (!container) return;

  // 1. Inyectar la estructura del módulo de usuarios
  container.innerHTML = `
    <div class="view-header">
      <h1>Gestión de Usuarios</h1>
      <p>Administra accesos, asignación de roles y estados institucionales.</p>
    </div>

    <section class="users-module-container">
      <div class="users-header">
        <div>
          <h3>Listado General</h3>
          <p>Control de cuentas registradas en el sistema.</p>
        </div>
        <button class="btn-primary" id="btnNewUser">
          <i class="fa-solid fa-user-plus"></i> Nuevo Usuario
        </button>
      </div>

      <div class="users-filters">
        <button class="filter-chip active" data-filter="todos">Todos</button>
        <button class="filter-chip" data-filter="lectores">Lectores</button>
        <button class="filter-chip" data-filter="bibliotecarios">Bibliotecarios</button>
        <button class="filter-chip" data-filter="admins">Admins</button>
      </div>

      <div class="users-table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo Electrónico</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            <!-- Los datos se llenarán dinámicamente -->
          </tbody>
        </table>
      </div>
    </section>
  `;

  // 2. Cargar los datos (aquí harías el fetch a tu API de usuarios)
  renderUsersTable([
    { name: "Ana Yepes", email: "ana@example.com", role: "Bibliotecario", status: "Activo", date: "12 Feb 2026" },
    { name: "Luis Fernando", email: "luis@example.com", role: "Lector", status: "Activo", date: "24 Feb 2026" }
  ]);

  // 3. Activar lógica de filtros dentro de la vista
  initUserFilters();
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  tbody.innerHTML = users.map(user => `
    <tr>
      <td><strong>${user.name}</strong></td>
      <td>${user.email}</td>
      <td><span class="trend-badge positive">${user.role}</span></td>
      <td>${user.status}</td>
      <td>${user.date}</td>
      <td class="text-right">
        <button class="icon-btn" style="width: 32px; height: 32px;" title="Editar"><i class="fa-solid fa-pen"></i></button>
      </td>
    </tr>
  `).join('');
}

function initUserFilters() {
  const chips = document.querySelectorAll('.users-filters .filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      // Lógica de filtrado de datos aquí si lo requieres
    });
  });
}