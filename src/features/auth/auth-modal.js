import { API_CONFIG } from '../../core/config/api.config.js';

export function initAuthModal() {
  let modal = document.getElementById('authModal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'book-modal-overlay';
    
    modal.innerHTML = `
      <div class="auth-modal-content">
        <!-- Panel Izquierdo: Visual Dinámico -->
        <div class="auth-visual-panel" id="authVisualPanel">
          <div class="visual-state active" id="visualLogin">
            <div class="dynamic-book">
              <div class="book-back"></div>
              <div class="book-page page-3"></div>
              <div class="book-page page-2"></div>
              <div class="book-page page-1"></div>
              <div class="book-front"></div>
            </div>
            <h3 style="margin:0 0 10px 0; font-size:1.8rem;">BiblioNepo</h3>
            <p style="font-size:0.95rem; opacity:0.9; margin:0;">Miles de historias esperan por ti. Accede para continuar tu lectura.</p>
          </div>
          <div class="visual-state" id="visualRegister">
            <div class="dynamic-card">
              <div class="card-chip"></div>
              <div class="card-line"></div>
              <div class="card-line short"></div>
            </div>
            <h3 style="margin:0 0 10px 0; font-size:1.8rem;">Únete al Club</h3>
            <p style="font-size:0.95rem; opacity:0.9; margin:0;">Crea tu cuenta y obtén acceso instantáneo a todo nuestro catálogo digital.</p>
          </div>
        </div>

        <!-- Panel Derecho: Formularios -->
        <div class="auth-form-panel">
          <button id="closeAuthModal" class="auth-modal-close" aria-label="Cerrar">&times;</button>
          
          <div class="auth-tabs">
            <button id="tabLoginBtn" class="auth-tab-btn active">Iniciar Sesión</button>
            <button id="tabRegisterBtn" class="auth-tab-btn">Registrarse</button>
          </div>

          <div id="authFormContainer">
            <!-- LOGIN FORM -->
            <form id="loginForm" class="auth-form">
              <label>Correo electrónico <span style="color: #ef4444;">*</span></label>
              <input type="email" id="loginEmail" required placeholder="lector@biblionepo.com">
              
              <label>Contraseña <span style="color: #ef4444;">*</span></label>
              <input type="password" id="loginPassword" required placeholder="••••••••">
              
              <button type="submit" class="auth-submit-btn">Entrar a la cuenta</button>
            </form>

            <!-- REGISTER FORM -->
            <form id="registerForm" class="auth-form" style="display: none;">
              <div class="register-scroll-area">
                <div class="form-grid-responsive">
                  <div>
                    <label>Primer Nombre <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="regNombre" required placeholder="Luis">
                  </div>
                  <div>
                    <label>Segundo Nombre</label>
                    <input type="text" id="regSegundoNombre" placeholder="Fernando">
                  </div>
                </div>

                <div class="form-grid-responsive">
                  <div>
                    <label>Primer Apellido <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="regPrimerApellido" required placeholder="Yepes">
                  </div>
                  <div>
                    <label>Segundo Apellido <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="regSegundoApellido" required placeholder="Meléndez">
                  </div>
                </div>

                <div class="form-grid-responsive">
                  <div>
                    <label>Tipo de Documento <span style="color: #ef4444;">*</span></label>
                    <select id="regTipoId" required class="form-select-responsive">
                      <option value="">Cargando tipos...</option>
                    </select>
                  </div>
                  <div>
                    <label>Número de Identificación <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="regNumId" required placeholder="1234567890">
                  </div>
                </div>

                <div class="form-grid-responsive">
                  <div>
                    <label>Fecha de Nacimiento <span style="color: #ef4444;">*</span></label>
                    <input type="date" id="regFechaNac" required>
                  </div>
                  <div>
                    <label>Rol del Sistema <span style="color: #ef4444;">*</span></label>
                    <select id="regRol" required class="form-select-responsive">
                      <option value="">Cargando roles...</option>
                    </select>
                  </div>
                </div>

                <!-- AVATAR UPLOAD PRO -->
                <label>Foto de Perfil</label>
                <div class="avatar-upload-container">
                  <div class="avatar-preview-wrapper" id="avatarPreviewWrapper">
                    <div class="avatar-placeholder-icon">👤</div>
                  </div>
                  <div class="avatar-upload-info">
                    <label for="regImg" class="avatar-upload-label">Sube una imagen</label>
                    <span class="avatar-file-name" id="avatarFileName">PNG, JPG o WEBP (Max. 5MB)</span>
                  </div>
                  <input type="file" id="regImg" accept="image/*" class="input-file-hidden">
                </div>

                <label style="margin-top: 10px; display: block;">Correo electrónico <span style="color: #ef4444;">*</span></label>
                <input type="email" id="regEmail" required placeholder="tu@correo.com">
                
                <label>Contraseña <span style="color: #ef4444;">*</span></label>
                <input type="password" id="regPassword" required placeholder="••••••••">
              </div>
              
              <button type="submit" class="auth-submit-btn register-btn">Crear cuenta nueva</button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Estilos internos optimizados para mobile
    const mobileStyleTag = document.createElement('style');
    mobileStyleTag.innerHTML = `
      .register-scroll-area {
        max-height: 380px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .form-grid-responsive {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 12px;
      }
      .form-select-responsive {
        width: 100%;
        padding: 12px;
        border: 1.5px solid var(--line, #cbd5e1);
        border-radius: 10px;
        background: white;
      }
      @media (max-width: 768px) {
        .auth-modal-content {
          width: 95% !important;
          max-width: 100% !important;
          max-height: 90vh !important;
          flex-direction: column !important;
          overflow-y: auto !important;
        }
        .auth-visual-panel {
          display: none !important;
        }
        .auth-form-panel {
          padding: 20px !important;
          width: 100% !important;
        }
        .form-grid-responsive {
          grid-template-columns: 1fr !important;
          gap: 8px !important;
        }
        .register-scroll-area {
          max-height: none !important;
          overflow-y: visible !important;
          padding-right: 0 !important;
        }
      }
    `;
    document.head.appendChild(mobileStyleTag);
    document.body.appendChild(modal);

    modal.querySelector('#closeAuthModal').addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (ev) => { if (ev.target === modal) modal.style.display = 'none'; });

    const tabLogin = modal.querySelector('#tabLoginBtn');
    const tabRegister = modal.querySelector('#tabRegisterBtn');
    const loginForm = modal.querySelector('#loginForm');
    const registerForm = modal.querySelector('#registerForm');
    const visualPanel = modal.querySelector('#authVisualPanel');
    const visualLogin = modal.querySelector('#visualLogin');
    const visualRegister = modal.querySelector('#visualRegister');
    const selectRol = modal.querySelector('#regRol');
    const selectTipoId = modal.querySelector('#regTipoId');

    async function loadTiposIdentificacion() {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TIPO_IDENTIFICACIONES}`);
        if (response.ok) {
          const data = await response.json();
          const tipos = Array.isArray(data) ? data : (data.data || data.content || data.tipos || []);
          selectTipoId.innerHTML = '<option value="">Seleccione tipo...</option>';

          if (tipos.length > 0) {
            tipos.forEach(tipo => {
              const opt = document.createElement('option');
              opt.value = tipo.id || tipo.id_tipo_identificacion;
              opt.textContent = (tipo.nombre || tipo.name || tipo.descripcion).toUpperCase();
              selectTipoId.appendChild(opt);
            });
          } else {
            selectTipoId.innerHTML = '<option value="1">Cédula de Ciudadanía</option>';
          }
        } else {
          selectTipoId.innerHTML = '<option value="1">Cédula de Ciudadanía</option>';
        }
      } catch (err) {
        console.error('No se pudieron cargar los tipos de identificación:', err);
        selectTipoId.innerHTML = '<option value="1">Cédula de Ciudadanía</option>';
      }
    }

    async function loadRoles() {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROLES}`);
        if (response.ok) {
          const data = await response.json();
          const roles = Array.isArray(data) ? data : (data.data || data.content || data.roles || []);
          selectRol.innerHTML = '<option value="">Seleccione rol...</option>';

          const validRoles = roles.filter(r => {
            const nombreRol = (r.nombre || r.name || '').toLowerCase();
            return !nombreRol.includes('admin');
          });

          if (validRoles.length > 0) {
            validRoles.forEach(rol => {
              const opt = document.createElement('option');
              opt.value = rol.id || rol.id_rol;
              opt.textContent = (rol.nombre || rol.name).toUpperCase();
              selectRol.appendChild(opt);
            });
          } else {
            const opt = document.createElement('option');
            opt.value = '2';
            opt.textContent = 'Lector / Estudiante';
            selectRol.appendChild(opt);
          }
        } else {
          selectRol.innerHTML = '<option value="2">Lector / Estudiante</option>';
        }
      } catch (err) {
        console.error('No se pudieron cargar los roles:', err);
        selectRol.innerHTML = '<option value="2">Lector / Estudiante</option>';
      }
    }

    loadTiposIdentificacion();
    loadRoles();

    const fileInput = modal.querySelector('#regImg');
    const previewWrapper = modal.querySelector('#avatarPreviewWrapper');
    const fileNameSpan = modal.querySelector('#avatarFileName');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        fileNameSpan.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
          previewWrapper.innerHTML = `<img src="${event.target.result}" class="avatar-preview-img" alt="Vista previa">`;
        };
        reader.readAsDataURL(file);
      } else {
        fileNameSpan.textContent = 'PNG, JPG o WEBP (Max. 5MB)';
        previewWrapper.innerHTML = `<div class="avatar-placeholder-icon">👤</div>`;
      }
    });

    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active'); tabRegister.classList.remove('active');
      loginForm.style.display = 'block'; registerForm.style.display = 'none';
      visualPanel.classList.remove('register-mode');
      visualLogin.classList.add('active'); visualRegister.classList.remove('active');
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active'); tabLogin.classList.remove('active');
      registerForm.style.display = 'block'; loginForm.style.display = 'none';
      visualPanel.classList.add('register-mode');
      visualRegister.classList.add('active'); visualLogin.classList.remove('active');
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      modal.style.display = 'none';
    });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Registrando...';
      submitBtn.disabled = true;

      const bodyData = {
        nombre: document.getElementById('regNombre').value.trim(),
        segundoNombre: document.getElementById('regSegundoNombre').value.trim() || null,
        primerApellido: document.getElementById('regPrimerApellido').value.trim(),
        segundoApellido: document.getElementById('regSegundoApellido').value.trim(),
        fechaNacimiento: document.getElementById('regFechaNac').value,
        numeroIdentificacion: document.getElementById('regNumId').value.trim(),
        id_tipo_identificacion: parseInt(selectTipoId.value),
        id_rol: parseInt(selectRol.value),
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value
      };

      const formData = new FormData();
      formData.append(
        'body', 
        new Blob([JSON.stringify(bodyData)], { type: 'application/json' })
      );

      const imgFile = fileInput.files[0];
      if (imgFile) {
        formData.append('imgPerfil', imgFile);
      }

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          alert('¡Registro exitoso! Ya puedes iniciar sesión.');
          tabLogin.click();
          registerForm.reset();
          previewWrapper.innerHTML = `<div class="avatar-placeholder-icon">👤</div>`;
          fileNameSpan.textContent = 'PNG, JPG o WEBP (Max. 5MB)';
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Error en el registro: ${errorData.message || 'Verifica los datos'}`);
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        alert('Error de conexión con el servidor.');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  return {
    open(initialTab = 'login') {
      const tabLogin = modal.querySelector('#tabLoginBtn');
      const tabRegister = modal.querySelector('#tabRegisterBtn');
      initialTab === 'register' ? tabRegister.click() : tabLogin.click();
      modal.style.display = 'flex';
    }
  };
}