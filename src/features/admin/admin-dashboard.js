export function loadDashboardView() {
  const container = document.getElementById('admin-content-container');
  if (!container) return;

  container.innerHTML = `
    <div class="view-header">
      <h1>Analytics & Overview</h1>
      <p>Vista general de rendimiento, métricas operativas y administración.</p>
    </div>

    <section class="analytics-grid">
      <article class="analytic-card">
        <div class="card-top">
          <span class="card-title">Total Usuarios</span>
          <div class="card-icon"><i class="fa-solid fa-users"></i></div>
        </div>
        <div class="card-metrics">
          <span class="card-number">1,150</span>
        </div>
      </article>
      <!-- Agrega el resto de tus tarjetas aquí -->
    </section>
  `;
}