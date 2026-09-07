import { loadBooksView } from '../books/books.js';
import { initCatalog } from '../catalog/catalog.component.js';
import { fetchPerfilDatosBasicos, updateProfilePhoto } from '../perfil/perfilApi.js'; 

const userIdActual = localStorage.getItem('userId') || 1; 

document.addEventListener('DOMContentLoaded', () => {
    // Iniciar por defecto en la sección del catálogo al cargar la página
    cambiarSeccion('catalogo');
});

// Función interna que cambia el contenido y los títulos según la sección
async function ejecutarCambioSeccion(seccion) {
    const tituloSeccion = document.getElementById('tituloSeccion');
    const contenedor = document.getElementById('contenedorDinamico');
    contenedor.innerHTML = ''; 

    if (seccion === 'catalogo') {
        if (tituloSeccion) tituloSeccion.textContent = 'Catálogo de Libros';
        contenedor.innerHTML = `
            <div id="filterTabs"></div>
            <div id="bookGrid" class="grid-libros"></div>
        `;
        initCatalog(); 
    } 
    else if (seccion === 'prestamos') {
        if (tituloSeccion) tituloSeccion.textContent = 'Mis Préstamos';
        contenedor.innerHTML = `<p style="color: #64748b;">Sección de préstamos en construcción...</p>`;
    } 
    else if (seccion === 'perfil') {
        if (tituloSeccion) tituloSeccion.textContent = 'Mi Perfil';
        
        // Estado de carga inicial
        contenedor.innerHTML = `<p style="color: #64748b; text-align: center; padding: 40px;">Cargando datos del perfil...</p>`;

        try {
            console.log("Consultando perfil para el ID:", userIdActual);
            const perfil = await fetchPerfilDatosBasicos(userIdActual);

            // Estructura limpia y con diseño UX optimizado con campos independientes
            contenedor.innerHTML = `
                <div class="profile-card-modern">
                    <!-- Banner superior institucional -->
                    <div class="profile-header-bg">
                        <span class="profile-role-badge">${perfil.rol || 'Usuario'}</span>
                    </div>
                    
                    <div class="profile-content">
                        <!-- Cabecera: Avatar superpuesto de forma limpia + Nombres abajo -->
                        <div class="profile-user-main-row">
                            <div class="profile-avatar-container">
                                <img src="${perfil.urlFotoPerfil || 'https://via.placeholder.com/150'}" alt="Foto de perfil" class="profile-avatar">
                            </div>
                            <div class="profile-titles">
                                <h2 class="profile-name">
                                    ${perfil.nombre || ''} ${perfil.segundoNombre || ''} ${perfil.primerApellido || ''} ${perfil.segundoApellido || ''}
                                </h2>
                                <p class="profile-email">${perfil.email || 'Sin correo electrónico'}</p>
                            </div>
                        </div>

                        <!-- Secciones organizadas en tarjetas limpias -->
                        <div class="profile-sections-wrapper">
                            
                            <!-- SECCIÓN: Nombres y Apellidos Desglosados -->
                            <div class="profile-section-block">
                                <h4 class="profile-section-title">Nombres y Apellidos</h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Primer Nombre</span>
                                        <span class="detail-value" data-field="nombre">${perfil.nombre || 'No registrado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Segundo Nombre</span>
                                        <span class="detail-value" data-field="segundoNombre">${perfil.segundoNombre || 'No registrado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Primer Apellido</span>
                                        <span class="detail-value" data-field="primerApellido">${perfil.primerApellido || 'No registrado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Segundo Apellido</span>
                                        <span class="detail-value" data-field="segundoApellido">${perfil.segundoApellido || 'No registrado'}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- SECCIÓN: Identificación -->
                            <div class="profile-section-block">
                                <h4 class="profile-section-title">Información de Identificación</h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Tipo de Documento</span>
                                        <span class="detail-value" data-field="tipoIdentificacion">${perfil.tipoIdentificacion || 'No especificado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Número de Identificación</span>
                                        <span class="detail-value" data-field="numeroIdentificacion">${perfil.numeroIdentificacion || 'No registrado'}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- SECCIÓN: Datos Personales -->
                            <div class="profile-section-block">
                                <h4 class="profile-section-title">Datos Personales</h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Fecha de Nacimiento</span>
                                        <span class="detail-value" data-field="fechaNacimiento">${perfil.fechaNacimiento || 'No registrada'}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- SECCIÓN: Ubicación -->
                            <div class="profile-section-block">
                                <h4 class="profile-section-title">Ubicación y Residencia</h4>
                                <div class="profile-grid-details">
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Departamento</span>
                                        <span class="detail-value" data-field="departamento">${perfil.departamento || 'No especificado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Ciudad</span>
                                        <span class="detail-value" data-field="ciudad">${perfil.ciudad || 'No especificada'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Barrio / Sector</span>
                                        <span class="detail-value" data-field="barrio">${perfil.barrio || 'No especificado'}</span>
                                    </div>
                                    <div class="profile-detail-item">
                                        <span class="detail-label">Complemento</span>
                                        <span class="detail-value" data-field="complemento">${perfil.complemento || 'Ninguno'}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error('Error al cargar el perfil:', err);
            contenedor.innerHTML = `<p style="color: #dc2626; text-align: center; padding: 30px;">No se pudo cargar la información del perfil. Intenta nuevamente.</p>`;
        }
    }
}

// Exponer la función globalmente para que el HTML la reconozca desde el onclick
window.cambiarSeccion = function(seccion, event) {
    if (event) event.preventDefault();
    
    const enlacesMenu = document.querySelectorAll('aside nav a');
    enlacesMenu.forEach(el => el.classList.remove('active'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    ejecutarCambioSeccion(seccion);
};