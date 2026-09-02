const SLIDES = [
  {
    title: "La lectura es la clave para construir tu futuro.",
    sub: "Explora miles de títulos, gestiona tus préstamos y únete a una comunidad que lee contigo, desde cualquier lugar.",
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Cada préstamo empieza con una búsqueda simple.",
    sub: "Encuentra el libro exacto por título, autor o categoría en segundos, sin filas ni fichas de papel.",
    img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Devuelve, reserva y descubre en un solo lugar.",
    sub: "Tu historial de lectura te ayuda a encontrar el siguiente libro que realmente vas a terminar.",
    img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1600&auto=format&fit=crop"
  }
];

const PALETTE = ['#6E2A2A', '#1C2536', '#9A6A34', '#3B5B45', '#4A3B6B', '#7A4A2A', '#2E4A5E', '#5C2E4A'];

export function initHero() {
  let current = 0;
  const heroTitle = document.getElementById('heroTitle');
  const heroSub = document.getElementById('heroSub');
  const heroVisual = document.getElementById('heroVisual');
  const dotsWrap = document.getElementById('heroDots');
  const miniGrid = document.getElementById('miniGrid');

  if (!heroTitle || !dotsWrap) return;

  if (miniGrid) {
    miniGrid.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const el = document.createElement('div');
      el.className = 'mini-book';
      el.style.background = PALETTE[i % PALETTE.length];
      miniGrid.appendChild(el);
    }
  }

  SLIDES.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });

  function updateSlide() {
    const s = SLIDES[current];
    heroTitle.style.opacity = '0';
    heroSub.style.opacity = '0';

    setTimeout(() => {
      heroTitle.textContent = s.title;
      heroSub.textContent = s.sub;
      heroTitle.style.opacity = '1';
      heroSub.style.opacity = '1';
    }, 180);

    heroVisual.style.backgroundImage = `linear-gradient(0deg, rgba(15,17,20,0.32), rgba(15,17,20,0.05) 45%), url('${s.img}')`;
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goToSlide(i) {
    current = i;
    updateSlide();
  }

  document.getElementById('nextSlide')?.addEventListener('click', () => {
    current = (current + 1) % SLIDES.length;
    updateSlide();
  });

  document.getElementById('prevSlide')?.addEventListener('click', () => {
    current = (current - 1 + SLIDES.length) % SLIDES.length;
    updateSlide();
  });

  setInterval(() => {
    current = (current + 1) % SLIDES.length;
    updateSlide();
  }, 7000);
}