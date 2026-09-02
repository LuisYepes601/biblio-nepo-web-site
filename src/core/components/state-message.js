export function getStateMessageHTML({
  type = 'empty', // 'empty' | '404' | 'error'
  title = '',
  message = '',
  buttonText = '',
  buttonId = ''
} = {}) {
  const defaults = {
    empty: {
      icon: '📂',
      title: title || 'Sin resultados',
      message: message || 'No hay información disponible para mostrar en esta sección.'
    },
    '404': {
      icon: '🔍',
      title: title || 'No encontrado',
      message: message || 'El recurso que intentas consultar no existe o fue removido.'
    },
    error: {
      icon: '⚠️',
      title: title || 'Error de conexión',
      message: message || 'No pudimos comunicarnos con el servidor. Intenta de nuevo.'
    }
  };

  const config = defaults[type] || defaults.empty;
  const actionButton = buttonText 
    ? `<button class="state-action-btn" id="${buttonId}">${buttonText}</button>` 
    : '';

  return `
    <div class="state-card state-${type}">
      <div class="state-icon">${config.icon}</div>
      <h3 class="state-title">${config.title}</h3>
      <p class="state-description">${config.message}</p>
      ${actionButton}
    </div>
  `;
}