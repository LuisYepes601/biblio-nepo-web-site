import { fetchUserFavorites, removeFavoriteApi } from './favorite-api.js';
import { openBookModal } from '../catalog/catalog.component.js';
import { fetchLibroDetalles } from '../catalog/catalog.api.js';

/**
 * Obtiene dinámicamente el ID del usuario autenticado en la sesión activa.
 */
function getCurrentUserId() {
    const directId = localStorage.getItem('userId') || 
                     localStorage.getItem('id_user') || 
                     localStorage.getItem('id_usuario') || 
                     localStorage.getItem('id') ||
                     sessionStorage.getItem('userId') || 
                     sessionStorage.getItem('id_user');
    if (directId) return directId;

    const possibleObjectKeys = ['user', 'usuario', 'currentUser', 'adminUser', 'userData', 'auth'];
    for (const key of possibleObjectKeys) {
        try {
            const rawData = localStorage.getItem(key) || sessionStorage.getItem(key);
            if (rawData) {
                const parsed = JSON.parse(rawData);
                const foundId = parsed.id || parsed.id_user || parsed.id_usuario || parsed.userId || parsed.idUsuario;
                if (foundId) return foundId;
            }
        } catch (e) {
            // Ignorar errores de parseo
        }
    }
    return null;
}

/**
 * Muestra una notificación flotante (Toast) interactiva en la esquina inferior derecha.
 */
function showToast(message, type = 'danger') {
    let toast = document.getElementById('fav-toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'fav-toast-notification';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 12px 18px;
            background: #0f172a;
            color: #ffffff;
            border-radius: 10px;
            font-size: 0.85rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 99999;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        document.body.appendChild(toast);
    }

    const icon = type === 'danger' 
        ? '<i class="fa-solid fa-trash-can" style="color: #f87171;"></i>'
        : '<i class="fa-solid fa-circle-check" style="color: #4ade80;"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 3000);
}

/**
 * Carga y renderiza la vista de favoritos dentro del contenedor indicado.
 * @param {string} containerSelector - Selector del contenedor HTML
 */
export async function loadFavoritesView(containerSelector = '#contenedorDinamico') {
    const contenedor = document.querySelector(containerSelector);
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #64748b;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; color: #2563eb; margin-bottom: 12px;"></i>
            <p style="margin: 0; font-size: 0.9rem; font-weight: 500;">Cargando tus libros favoritos...</p>
        </div>
    `;

    const emptyFavoritesHTML = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 56px 24px; text-align: center; max-width: 520px; margin: 30px auto; box-shadow: 0 1px 3px rgba(15,23,42,0.04); transition: all 0.3s ease;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: #fef2f2; color: #dc2626; display: inline-flex; align-items: center; justify-content: center; font-size: 1.75rem; margin-bottom: 16px;">
                <i class="fa-solid fa-heart-crack"></i>
            </div>
            <h3 style="margin: 0 0 8px 0; font-size: 1.15rem; font-weight: 700; color: #0f172a;">No tienes libros favoritos hasta el momento</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0 0 20px 0; line-height: 1.5;">Explora el catálogo y presiona el icono del corazón en cualquier libro para guardarlo aquí.</p>
        </div>
    `;

    try {
        const userIdActual = getCurrentUserId();
        const data = await fetchUserFavorites(userIdActual);
        const librosFavoritos = data.content || [];

        if (librosFavoritos.length === 0) {
            contenedor.innerHTML = emptyFavoritesHTML;
            return;
        }

        const tarjetasHtml = librosFavoritos.map((book, index) => {
            // CORRECCIÓN CLAVE: Prioriza la propiedad específica del libro antes que el ID genérico/de tabla
            const bookId = book.id_libro || book.libroId || (book.libro && book.libro.id) || book.id;

            return `
            <div class="libro-card" data-id="${bookId}" data-index="${index}" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; position: relative; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: center;">
                
                <button class="btn-fav-remove" data-id="${bookId}" title="Quitar de favoritos" style="position: absolute; top: 10px; right: 10px; border: none; background: #fef2f2; color: #dc2626; border-radius: 50%; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 5; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
                    <i class="fa-solid fa-trash-can"></i>
                </button>

                <div class="btn-ver-detalle" style="height: 200px; border-radius: 8px; overflow: hidden; margin-bottom: 12px; background: #f8fafc; position: relative;">
                    <img src="${book.portadaUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300'}" alt="${book.titulo || 'Portada'}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>

                <div class="btn-ver-detalle" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: #2563eb; text-transform: uppercase;">${book.formatoLibro || 'General'}</span>
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; line-height: 1.3;">${book.titulo || 'Sin título'}</h4>
                    <p style="margin: 0; font-size: 0.8rem; color: #64748b;">${book.autor || 'Autor no registrado'}</p>
                </div>

                <div style="display: flex; gap: 8px;">
                    <button class="btn-ver-detalle btn-primary-custom" style="flex: 1; padding: 8px; font-size: 0.8rem; background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600;">
                        <i class="fa-solid fa-eye"></i> Detalle
                    </button>
                    <button class="btn-solicitar-prestamo btn-primary-custom" data-id="${bookId}" style="flex: 1.5; padding: 8px; font-size: 0.8rem; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-weight: 600;">
                        <i class="fa-solid fa-bookmark"></i> Préstamo
                    </button>
                </div>
            </div>
            `;
        }).join('');

        contenedor.innerHTML = `
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <span class="fav-count-text" style="font-size: 0.9rem; color: #64748b; font-weight: 600;">Libros Guardados (${librosFavoritos.length})</span>
            </div>
            <div class="grid-libros" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;">
                ${tarjetasHtml}
            </div>
        `;

        // Abrir modal de detalles
        contenedor.querySelectorAll('.libro-card').forEach(card => {
            const index = card.dataset.index;
            const book = librosFavoritos[index];

            card.querySelectorAll('.btn-ver-detalle').forEach(el => {
                el.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    openBookModal({ ...book, descripcion: 'Cargando detalles adicionales...' });

                    const bookId = book.id_libro || book.libroId || (book.libro && book.libro.id) || book.id;
                    if (bookId) {
                        try {
                            const details = await fetchLibroDetalles(bookId);
                            openBookModal({ ...book, ...details });
                        } catch (err) {
                            console.warn('Error al obtener detalles extendidos:', err);
                        }
                    }
                });
            });
        });

        // Eliminar de favoritos con animación e interacción fluida
        contenedor.querySelectorAll('.btn-fav-remove').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                const bookId = btn.dataset.id;
                const card = btn.closest('.libro-card');

                // 1. Efecto visual inmediato en el botón (Cargando)
                btn.disabled = true;
                btn.style.background = '#dc2626';
                btn.style.color = '#ffffff';
                btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

                try {
                    // 2. Llamada a la API enviando el ID correcto del libro y del usuario activo
                    await removeFavoriteApi(bookId, userIdActual);

                    // 3. Animación fluida de desvanecimiento de la tarjeta
                    if (card) {
                        card.style.transform = 'scale(0.82) translateY(-12px)';
                        card.style.opacity = '0';
                        card.style.filter = 'blur(3px)';

                        setTimeout(() => {
                            card.remove();

                            // Actualizar contador sin recargar la vista
                            const remainingCards = contenedor.querySelectorAll('.libro-card');
                            const countText = contenedor.querySelector('.fav-count-text');
                            if (countText) {
                                countText.textContent = `Libros Guardados (${remainingCards.length})`;
                            }

                            // Notificación Toast flotante
                            showToast('Libro eliminado de tus favoritos', 'danger');

                            // Si ya no quedan elementos, mostrar la tarjeta de vista vacía
                            if (remainingCards.length === 0) {
                                contenedor.innerHTML = emptyFavoritesHTML;
                            }
                        }, 300);
                    }
                } catch (err) {
                    console.error('Error al quitar de favoritos:', err);
                    btn.disabled = false;
                    btn.style.background = '#fef2f2';
                    btn.style.color = '#dc2626';
                    btn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
                    showToast('Ocurrió un error al intentar eliminar el favorito', 'danger');
                }
            });
        });

    } catch (error) {
        contenedor.innerHTML = emptyFavoritesHTML;
    }
}