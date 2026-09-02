const usersData = [
  { id: 'MUCR-1001', name: 'Ana Sofía Martínez', email: 'ana.martinez@bibliopeno.edu', role: 'lector', status: 'activo', date: '15 Ago 2025', avatar: 'AS' },
  { id: 'MUCR-1002', name: 'Brayan Garzón', email: 'brayan.garzon@bibliopeno.edu', role: 'bibliotecario', status: 'activo', date: '22 Mar 2025', avatar: 'BG' },
  { id: 'MUCR-1003', name: 'Carlos Mendoza', email: 'carlos.mendoza@bibliopeno.edu', role: 'admin', status: 'activo', date: '10 Dic 2024', avatar: 'CM' },
  { id: 'MUCR-1004', name: 'Lucía Benítez', email: 'lucia.benitez@bibliopeno.edu', role: 'lector', status: 'suspendido', date: '04 Nov 2025', avatar: 'LB' }
];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Renderizar Tabla de Usuarios y Filtros
  const tableBody = document.getElementById('usersTableBody');
  const filterChips = document.querySelectorAll('.users-filters .filter-chip');

  if (tableBody) {
    const renderTable = (filter = 'todos') => {
      tableBody.innerHTML = '';

      const filteredUsers = usersData.filter(user => {
        if (filter === 'todos') return true;
        if (filter === 'lectores') return user.role === 'lector';
        if (filter === 'bibliotecarios') return user.role === 'bibliotecario';
        if (filter === 'admins') return user.role === 'admin';
        return true;
      });

      if (filteredUsers.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
              No se encontraron usuarios para este filtro.
            </td>
          </tr>
        `;
        return;
      }

      filteredUsers.forEach(user => {
        const tr = document.createElement('tr');
        const roleCapitalized = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        const statusCapitalized = user.status.charAt(0).toUpperCase() + user.status.slice(1);

        tr.innerHTML = `
          <td>
            <div class="user-cell-info">
              <div class="user-cell-avatar">${user.avatar}</div>
              <div>
                <div class="user-cell-name">${user.name}</div>
                <div class="user-cell-id">${user.id}</div>
              </div>
            </div>
          </td>
          <td>${user.email}</td>
          <td><span class="badge-role ${user.role}">${roleCapitalized}</span></td>
          <td><span class="badge-status ${user.status}">${statusCapitalized}</span></td>
          <td>${user.date}</td>
          <td class="text-right">
            <button class="action-icon-btn" title="Editar"><i class="fa-solid fa-pen"></i></button>
            <button class="action-icon-btn delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    };

    filterChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        filterChips.forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderTable(e.currentTarget.getAttribute('data-filter'));
      });
    });

    renderTable('todos');
  }

  // 2. Controladores de Botones Principales
  const btnLogout = document.getElementById('btnLogoutAdmin');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  const btnPublic = document.getElementById('btnGoToPublic');
  if (btnPublic) {
    btnPublic.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
});