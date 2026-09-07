import { requestPasswordReset, requestUsernameRecovery } from './recovery.api.js';

let activeTab = 'password';

/**
 * Inicializa todos los eventos y manejadores del módulo de recuperación.
 */
export function initRecoveryFeature() {
  initQuoteRotator();
  bindTabEvents();
  bindPasswordForm();
  bindUsernameForm();
  bindResetButton();
}

/**
 * Rota dinámicamente las frases en el panel izquierdo (imagen).
 */
function initQuoteRotator() {
  const quotes = [
    "Tu portal hacia el conocimiento. Recupera tu acceso y sigue explorando.",
    "Accede a miles de recursos digitales e investigaciones académicas.",
    "Seguridad y acceso rápido a tu perfil de BiblioNepo."
  ];
  let quoteIndex = 0;
  const quoteElem = document.getElementById('dynamicQuote');

  if (quoteElem) {
    setInterval(() => {
      quoteElem.classList.add('fade-out');
      setTimeout(() => {
        quoteIndex = (quoteIndex + 1) % quotes.length;
        quoteElem.textContent = quotes[quoteIndex];
        quoteElem.classList.remove('fade-out');
      }, 400);
    }, 5000);
  }
}

/**
 * Asigna eventos para alternar entre pestañas.
 */
function bindTabEvents() {
  const tabPasswordBtn = document.getElementById('tabPassword');
  const tabUsernameBtn = document.getElementById('tabUsername');

  tabPasswordBtn?.addEventListener('click', () => switchTab('password'));
  tabUsernameBtn?.addEventListener('click', () => switchTab('username'));
}

/**
 * Cambia la vista activa entre recuperación de contraseña y usuario,
 * moviendo el deslizador (glider) y alternando las clases .hidden.
 * @param {'password' | 'username'} tab
 */
export function switchTab(tab) {
  activeTab = tab;
  hideAlert();

  const tabPwd = document.getElementById('tabPassword');
  const tabUser = document.getElementById('tabUsername');
  const tabGlider = document.getElementById('tabGlider');
  
  const viewPwd = document.getElementById('viewPassword');
  const viewUser = document.getElementById('viewUsername');
  const viewSuccess = document.getElementById('viewSuccess');

  if (viewSuccess) viewSuccess.classList.add('hidden');

  if (tab === 'password') {
    tabPwd?.classList.add('active');
    tabUser?.classList.remove('active');
    if (tabGlider) tabGlider.style.transform = 'translateX(0%)';
    viewPwd?.classList.remove('hidden');
    viewUser?.classList.add('hidden');
  } else {
    tabUser?.classList.add('active');
    tabPwd?.classList.remove('active');
    if (tabGlider) tabGlider.style.transform = 'translateX(100%)';
    viewUser?.classList.remove('hidden');
    viewPwd?.classList.add('hidden');
  }
}

/**
 * Maneja el envío del formulario de recuperación de contraseña.
 */
function bindPasswordForm() {
  const form = document.getElementById('formRecoverPassword');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const emailInput = document.getElementById('pwdEmail');
    const btn = document.getElementById('btnSubmitPassword');
    const email = emailInput?.value.trim();

    if (!email) {
      showAlert('Por favor, ingresa tu correo electrónico.');
      return;
    }

    setLoading(btn, true, 'Procesando...');

    try {
      await requestPasswordReset(email);
      showSuccess(
        '¡Enlace de recuperación enviado!',
        `Si el correo "${email}" se encuentra registrado, recibirás las instrucciones para restablecer tu contraseña.`
      );
    } catch (err) {
      showAlert(err.message || 'Ocurrió un error al intentar enviar el correo.');
    } finally {
      setLoading(btn, false, '<span>Enviar enlace de recuperación</span> <i class="fa-solid fa-paper-plane"></i>');
    }
  });
}

/**
 * Maneja el envío del formulario de recuperación de nombre de usuario.
 */
function bindUsernameForm() {
  const form = document.getElementById('formRecoverUsername');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const docInput = document.getElementById('userDocument');
    const emailInput = document.getElementById('userEmail');
    const btn = document.getElementById('btnSubmitUsername');

    const documentNum = docInput?.value.trim();
    const email = emailInput?.value.trim();

    if (!documentNum || !email) {
      showAlert('Por favor, completa todos los campos.');
      return;
    }

    setLoading(btn, true, 'Consultando...');

    try {
      await requestUsernameRecovery(documentNum, email);
      showSuccess(
        '¡Nombre de usuario enviado!',
        `Hemos validado tu información y enviado tu nombre de usuario al correo "${email}".`
      );
    } catch (err) {
      showAlert(err.message || 'No se pudo validar la información proporcionada.');
    } finally {
      setLoading(btn, false, '<span>Consultar Usuario</span> <i class="fa-solid fa-magnifying-glass"></i>');
    }
  });
}

/**
 * Maneja el botón de intento o reinicio del flujo tras el éxito.
 */
function bindResetButton() {
  const btnReset = document.getElementById('btnRetryRecovery');
  btnReset?.addEventListener('click', resetFormState);
}

/**
 * Cambia el estado visual del botón durante las peticiones con spinner.
 */
function setLoading(button, isLoading, contentText) {
  if (!button) return;
  button.disabled = isLoading;
  button.classList.toggle('loading', isLoading);
  button.innerHTML = isLoading 
    ? `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>${contentText}</span>` 
    : contentText;
}

/**
 * Muestra la caja de mensajes de error o alerta.
 */
function showAlert(message) {
  const box = document.getElementById('alertBox');
  if (box) {
    box.textContent = message;
    box.style.display = 'block';
  }
}

/**
 * Oculta la caja de alertas.
 */
function hideAlert() {
  const box = document.getElementById('alertBox');
  if (box) box.style.display = 'none';
}

/**
 * Despliega la pantalla de éxito con título y mensaje personalizados.
 */
function showSuccess(title, message) {
  const viewPwd = document.getElementById('viewPassword');
  const viewUser = document.getElementById('viewUsername');
  const tabGroup = document.getElementById('tabGroup');
  const viewSuccess = document.getElementById('viewSuccess');

  viewPwd?.classList.add('hidden');
  viewUser?.classList.add('hidden');
  if (tabGroup) tabGroup.style.display = 'none';
  hideAlert();

  const titleEl = document.getElementById('successTitle');
  const msgEl = document.getElementById('successMessage');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  viewSuccess?.classList.remove('hidden');
}

/**
 * Restablece los formularios y vuelve a mostrar las pestañas.
 */
function resetFormState() {
  const tabGroup = document.getElementById('tabGroup');
  const formPwd = document.getElementById('formRecoverPassword');
  const formUser = document.getElementById('formRecoverUsername');

  if (tabGroup) tabGroup.style.display = 'flex';
  formPwd?.reset();
  formUser?.reset();

  switchTab(activeTab);
}