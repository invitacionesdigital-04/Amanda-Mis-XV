// Variables globales
let isPlaying = false;
const totalSlides = 7;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeMusic();
    initializeIntro();
    initializeCountdown();
    initializeCarousel();
    initializeParallax();
    initializeGuestGreeting();
});

/* ===========================================================
   INTRO EN VIDEO
   - Antes de entrar se ve la portada del video con el nombre.
   - El PRIMER TOQUE en la pantalla hace dos cosas a la vez:
     reproduce el video y arranca la música de fondo (musica.mp3).
   - Al terminar el video: destello de luz desde la superficie +
     burbujas, y aparece la invitación.
   =========================================================== */
function initializeIntro() {
    const intro = document.getElementById('introVideo');
    const video = document.getElementById('introClip');
    const saltar = document.getElementById('introSaltar');
    if (!intro || !video) { document.documentElement.classList.remove('intro-activa'); revealHero(); return; }

    let empezado = false;
    let saliendo = false;
    let vigilante = null;
    const SEGUNDOS_ANTES_DEL_FINAL = 1.5; // la luz empieza un poco antes de que acabe el video

    function iniciar() {
        if (empezado) return;
        empezado = true;

        // 1) Música: se llama dentro del mismo toque (requisito de iPhone/Android)
        startBackgroundMusic();

        // 2) Video
        intro.classList.add('reproduciendo');
        let promesa;
        try { promesa = video.play(); } catch (e) { salir(); return; }
        if (promesa && promesa.catch) promesa.catch(() => salir());

        // Si el video no arranca (internet muy lento), entramos igual
        vigilante = setTimeout(() => { if (video.currentTime < 0.3) salir(); }, 7000);
    }

    function salir() {
        if (saliendo) return;
        saliendo = true;
        clearTimeout(vigilante);

        intro.classList.add('saliendo');            // luz + acercamiento del video
        lanzarBurbujasIntro(intro.querySelector('.intro-burbujas'));

        setTimeout(() => {
            window.scrollTo(0, 0);
            document.documentElement.classList.remove('intro-activa');
            intro.classList.add('revelando');       // el destello se disuelve
            revealHero();                            // entrada de la portada
        }, 1700);
        setTimeout(() => { intro.remove(); }, 3400);
    }

    intro.addEventListener('click', iniciar);
    intro.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); iniciar(); }
    });
    saltar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!empezado) iniciar();
        salir();
    });

    video.addEventListener('timeupdate', () => {
        if (empezado && video.duration && video.duration - video.currentTime <= SEGUNDOS_ANTES_DEL_FINAL) salir();
    });
    video.addEventListener('ended', salir);
    video.addEventListener('error', () => { if (empezado) salir(); });
}

// Ráfaga de burbujas durante la transición
function lanzarBurbujasIntro(capa) {
    if (!capa || !capa.animate) return;
    const total = window.innerWidth < 600 ? 45 : 70;
    const alto = window.innerHeight;
    for (let i = 0; i < total; i++) {
        const b = document.createElement('span');
        const r = Math.random();
        const tam = r < 0.5 ? 6 + Math.random() * 10 : r < 0.85 ? 16 + Math.random() * 14 : 30 + Math.random() * 26;
        b.className = 'burbuja';
        b.style.width = b.style.height = tam + 'px';
        b.style.left = (Math.random() * 100) + '%';
        b.style.bottom = (-tam - Math.random() * 60) + 'px';
        capa.appendChild(b);
        const lado = (Math.random() - 0.5) * 80;
        b.animate([
            { transform: 'translate(0,0) scale(.6)', opacity: 0 },
            { transform: `translate(${lado * 0.5}px, ${-alto * 0.35}px) scale(.85)`, opacity: .95, offset: .25 },
            { transform: `translate(${lado}px, ${-alto * 1.15}px) scale(1)`, opacity: 0 }
        ], { duration: 1600 + Math.random() * 1400, delay: Math.random() * 700, easing: 'cubic-bezier(.3,.1,.4,1)', fill: 'both' });
    }
}

/* ===========================================================
   MÚSICA DE FONDO (archivo propio musica.mp3, ya no YouTube)
   =========================================================== */
function initializeMusic() {
    const audio = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) musicToggle.addEventListener('click', toggleMusic);
    if (!audio) return;
    audio.addEventListener('playing', () => { isPlaying = true; updateMusicIcon(); });
    audio.addEventListener('pause', () => { isPlaying = false; updateMusicIcon(); });
}

function startBackgroundMusic() {
    const audio = document.getElementById('bgMusic');
    const panel = document.getElementById('musicPlayer');
    if (panel) panel.style.display = 'block';
    if (!audio) return;

    // La canción empieza desde el segundo 0, junto con el video
    try { audio.currentTime = 0; } catch (e) {}
    const pr = audio.play();

    // Red de seguridad: si el navegador no la dejó arrancar con el toque,
    // el siguiente toque en cualquier parte la arranca.
    if (pr && pr.catch) {
        pr.catch(() => {
            const reintento = () => {
                audio.play().then(() => {
                    ['click', 'touchend'].forEach(ev => document.removeEventListener(ev, reintento, true));
                }).catch(() => {});
            };
            ['click', 'touchend'].forEach(ev => document.addEventListener(ev, reintento, true));
        });
    }
}

// Efecto mágico de entrada de la portada
function revealHero() {
    const root = document.documentElement;
    if (root.classList.contains('hero-reveal')) return;
    root.classList.remove('hero-pending');
    root.classList.add('hero-reveal');
    spawnMagicSparkles();
}

function spawnMagicSparkles() {
    const layer = document.getElementById('magicLayer');
    if (!layer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rand = (min, max) => Math.random() * (max - min) + min;

    // Ráfaga inicial de destellos que suben y se desvanecen
    for (let i = 0; i < 46; i++) {
        const s = document.createElement('span');
        s.className = 'magic-spark' + (Math.random() < 0.35 ? ' is-star' : '');
        if (s.classList.contains('is-star')) s.textContent = '✦';
        const size = rand(3, 9);
        s.style.left = rand(3, 97) + '%';
        s.style.top = rand(8, 92) + '%';
        s.style.setProperty('--size', size + 'px');
        s.style.setProperty('--rise', -rand(30, 90) + 'px');
        s.style.setProperty('--drift', rand(-25, 25) + 'px');
        s.style.animationDelay = rand(0.1, 2.4) + 's';
        s.style.animationDuration = rand(1.6, 2.8) + 's';
        layer.appendChild(s);
        setTimeout(() => s.remove(), 6000);
    }

    // Unos cuantos destellos suaves que se quedan titilando en la portada
    for (let i = 0; i < 14; i++) {
        const t = document.createElement('span');
        t.className = 'magic-twinkle';
        t.style.left = rand(5, 95) + '%';
        t.style.top = rand(10, 90) + '%';
        t.style.setProperty('--size', rand(2, 5) + 'px');
        t.style.animationDelay = rand(2.5, 6) + 's';
        t.style.animationDuration = rand(2.2, 4) + 's';
        layer.appendChild(t);
    }
}

// Sección de saludo personalizado por invitado/familia, leída desde la URL.
// Formatos soportados:
//   ?invitados=Juan Arias,Yerianny Arias,Valery Arias
//   ?familia=Arias
// Muestra un badge con el total, título "Invitados", el número de
// acompañantes (si aplica) y cada nombre como fila con colores intercalados
// de la paleta del sitio (marrón / dorado), ciclando si hay más de 4 nombres.
function initializeGuestGreeting() {
    const params = new URLSearchParams(window.location.search);
    const invitadosParam = params.get('invitados');
    const familiaParam = params.get('familia');

    const section = document.getElementById('guestSection');
    const badge = document.getElementById('guestBadge');
    const subtitle = document.getElementById('guestSubtitle');
    const greeting = document.getElementById('guestGreeting');
    if (!section || !badge || !subtitle || !greeting) return;

    let names = [];

    if (invitadosParam) {
        names = invitadosParam.split(',').map(n => decodeURIComponent(n.trim())).filter(Boolean);
    } else if (familiaParam) {
        names = [`Familia ${familiaParam.trim()}`];
    }

    if (names.length === 0) return;

    // Badge con el total de invitados
    badge.textContent = names.length;

    // Subtítulo de acompañantes: solo tiene sentido cuando hay más de un
    // nombre individual (no aplica al formato "Familia X")
    const companions = invitadosParam ? names.length - 1 : 0;
    if (companions > 0) {
        subtitle.textContent = `(${companions} acompañante${companions > 1 ? 's' : ''})`;
        subtitle.style.display = 'block';
    } else {
        subtitle.style.display = 'none';
    }

    // Limpiar contenido previo
    greeting.innerHTML = '';

    names.forEach((name, index) => {
        const nameSpan = document.createElement('span');
        const colorIndex = (index % 4) + 1;
        nameSpan.className = `guest-name color-${colorIndex}`;
        nameSpan.textContent = name;
        greeting.appendChild(nameSpan);
    });

    section.style.display = 'block';
}

function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
}

function updateMusicIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    
    if (isPlaying) {
        volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08"></path>
        `;
    } else {
        volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
    }
}

// Countdown
function initializeCountdown() {
    const targetDate = new Date('2027-01-16T17:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Carrusel (loop infinito real con clones: al llegar a la última foto avanza
// hacia una copia de la primera y luego "teletransporta" sin transición de
// vuelta al inicio real, así siempre se ve avanzando de derecha a izquierda,
// nunca retrocediendo)
let carouselIndex = 1; // arranca en la 1ª foto real (índice 0 es el clon de la última)
let carouselTransitioning = false;

function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const totalSlidesElement = document.getElementById('totalSlides');

    totalSlidesElement.textContent = totalSlides;

    // Posición inicial sin animación
    track.style.transition = 'none';
    track.style.transform = `translateX(${-carouselIndex * 100}%)`;
    updateSlideCounter();

    track.addEventListener('transitionend', () => {
        if (carouselIndex === totalSlides + 1) {
            // Llegó al clon de la primera foto: salta sin animar a la real
            carouselIndex = 1;
            track.style.transition = 'none';
            track.style.transform = `translateX(${-carouselIndex * 100}%)`;
            void track.offsetWidth; // fuerza reflow antes de reactivar la transición
        } else if (carouselIndex === 0) {
            // Llegó al clon de la última foto (retroceso manual): salta a la real
            carouselIndex = totalSlides;
            track.style.transition = 'none';
            track.style.transform = `translateX(${-carouselIndex * 100}%)`;
            void track.offsetWidth;
        }
        carouselTransitioning = false;
    });

    prevBtn.addEventListener('click', () => {
        if (carouselTransitioning) return;
        carouselTransitioning = true;
        carouselIndex--;
        goToCarouselSlide();
    });

    nextBtn.addEventListener('click', () => {
        if (carouselTransitioning) return;
        carouselTransitioning = true;
        carouselIndex++;
        goToCarouselSlide();
    });

    // Auto-play del carrusel: siempre avanza (derecha a izquierda)
    setInterval(() => {
        if (carouselTransitioning) return;
        carouselTransitioning = true;
        carouselIndex++;
        goToCarouselSlide();
    }, 2500);
}

function goToCarouselSlide() {
    const track = document.getElementById('carouselTrack');
    track.style.transition = 'transform 0.5s ease-in-out';
    track.style.transform = `translateX(${-carouselIndex * 100}%)`;
    updateSlideCounter();
}

function updateSlideCounter() {
    const currentSlideElement = document.getElementById('currentSlide');
    let display = carouselIndex;
    if (display === 0) display = totalSlides;
    else if (display === totalSlides + 1) display = 1;
    currentSlideElement.textContent = display;
}

// Parallax en la portada izquierda (layer transform to emulate fixed background)
function initializeParallax() {
    const heroLeft = document.querySelector('.hero-left');
    const heroLayer = document.querySelector('.hero-left .hero-left-bg');
    if (!heroLeft || !heroLayer) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let lastScrollY = window.scrollY || window.pageYOffset;
    let ticking = false;

    const computeSpeed = () => (window.innerWidth <= 768 ? 0.65 : 0.5);

    const render = () => {
        if (prefersReducedMotion.matches) {
            heroLayer.style.transform = 'translate3d(0,0,0)';
        } else {
            const speed = computeSpeed();
            // Tope: nunca desplazar más que el colchón real de la capa (60px fijos,
            // igual al valor definido en CSS), para que no se despegue del contenedor
            // y deje un hueco vacío, sin necesidad de sobredimensionar la imagen.
            const BUFFER_PX = 60;
            let translateY = lastScrollY * speed;
            translateY = Math.max(0, Math.min(BUFFER_PX, translateY));
            heroLayer.style.transform = `translate3d(0, ${Math.round(translateY)}px, 0)`;
        }
        ticking = false;
    };

    const onScroll = () => {
        lastScrollY = window.scrollY || window.pageYOffset;
        if (!ticking) {
            window.requestAnimationFrame(render);
            ticking = true;
        }
    };

    render();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', render);
}

// Funciones de los botones

function showDressCode() {
    const card = document.getElementById('dressCodeCard');
    if (!card) return;
    card.classList.add('show');
    card.setAttribute('aria-hidden', 'false');
    // Cerrar al tocar fuera de la imagen (se activa un instante después para no cerrarla con el mismo toque)
    setTimeout(() => document.addEventListener('click', cerrarVestimentaFuera, true), 50);
}

function closeDressCode() {
    const card = document.getElementById('dressCodeCard');
    if (!card) return;
    card.classList.remove('show');
    card.setAttribute('aria-hidden', 'true');
    document.removeEventListener('click', cerrarVestimentaFuera, true);
}

function cerrarVestimentaFuera(e) {
    const card = document.getElementById('dressCodeCard');
    if (card && !card.contains(e.target)) closeDressCode();
}

function sharePhotos() {
    window.open('https://photos.app.goo.gl/5gzRABHjuNhGsoVP8', '_blank');
}

function openGiftLink() {
    window.open('https://invitacionesdigital-04.github.io/Numerodecuenta/', '_blank');
}

// Confirmación por WhatsApp
const WHATSAPP_CONFIRMACION = '18296418720'; // +1 (829) 641-8720

function unirNombres(lista) {
    if (lista.length === 1) return lista[0];
    return lista.slice(0, -1).join(', ') + ' y ' + lista[lista.length - 1];
}

function mensajeConfirmacion() {
    const params = new URLSearchParams(window.location.search);
    const invitados = (params.get('invitados') || '').split(',').map(n => n.trim()).filter(Boolean);
    const familia = (params.get('familia') || '').trim();
    const cierre = ' ¡Muchas gracias por la invitación! 💙';

    if (invitados.length > 1) {
        return `¡Hola! Somos ${unirNombres(invitados)} y confirmamos nuestra asistencia (${invitados.length} personas) a los XV años de Amanda.` + cierre;
    }
    if (invitados.length === 1) {
        return `¡Hola! Soy ${invitados[0]} y confirmo mi asistencia a los XV años de Amanda.` + cierre;
    }
    if (familia) {
        return `¡Hola! Somos la Familia ${familia} y confirmamos nuestra asistencia a los XV años de Amanda.` + cierre;
    }
    return '¡Hola! Confirmo mi asistencia a los XV años de Amanda.' + cierre;
}

function confirmAttendance() {
    const url = `https://wa.me/${WHATSAPP_CONFIRMACION}?text=${encodeURIComponent(mensajeConfirmacion())}`;
    window.open(url, '_blank');
}

// Sistema de Toast
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    
    toastContent.innerHTML = `
        <h4 style="font-weight: 600; color: hsl(var(--brown)); margin-bottom: 0.5rem;">${title}</h4>
        <p style="color: hsl(var(--foreground) / 0.7);">${message}</p>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}


/* ===========================================================
   BURBUJAS DEL MAR
   Salen desde el fondo de la página (última sección). La mayoría
   se queda cerca del fondo; mientras más alto, menos burbujas
   llegan, y unas pocas alcanzan la portada. Tamaños variados.
   =========================================================== */
(function burbujasDelMar() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const MAX_BURBUJAS = window.innerWidth < 600 ? 110 : 160;  // burbujas a la vez
    const INTERVALO_MS = 95;                                   // cada cuánto nace una
    const VELOCIDAD = [38, 70];                                // px por segundo

    const capa = document.createElement('div');
    capa.className = 'capa-burbujas';
    capa.setAttribute('aria-hidden', 'true');
    document.body.appendChild(capa);

    let alturaPagina = 0;
    function medir() {
        capa.style.height = '0px';
        alturaPagina = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        capa.style.height = alturaPagina + 'px';
    }
    medir();
    window.addEventListener('load', medir);
    window.addEventListener('resize', () => { clearTimeout(medir._t); medir._t = setTimeout(medir, 200); });
    setInterval(medir, 3000); // por si cambia el contenido (fotos que cargan, invitados, etc.)

    let activas = 0;
    const azar = (min, max) => min + Math.random() * (max - min);

    function crearBurbuja(precalentar) {
        if (document.hidden || activas >= MAX_BURBUJAS || !alturaPagina) return;

        // Tamaño: muchas pequeñas, algunas medianas y pocas grandes
        const t = Math.random();
        const tam = t < 0.5 ? azar(6, 12) : t < 0.85 ? azar(12, 22) : azar(22, 38);

        // Altura que sube: la mayoría poco, pocas llegan arriba (curva exponencial)
        const minimo = Math.min(260, alturaPagina * 0.08);
        const r = Math.random();
        const sube = minimo + (alturaPagina - minimo - 40) * Math.pow(r, 2.2);

        // las que viajan lejos suben más rápido, para que lleguen a la portada
        const vel = azar(VELOCIDAD[0], VELOCIDAD[1]) * (tam > 22 ? 0.8 : 1) * (1 + 1.6 * sube / alturaPagina);
        const dur = (sube / vel) * 1000;
        const vaiven = azar(10, 34) * (Math.random() < 0.5 ? -1 : 1);

        const b = document.createElement('span');
        b.className = 'burbuja';
        b.style.width = b.style.height = tam.toFixed(1) + 'px';
        b.style.left = azar(2, 98).toFixed(2) + '%';
        b.style.bottom = azar(-10, 30).toFixed(0) + 'px';
        capa.appendChild(b);
        activas++;

        const pasos = 6;
        const frames = [];
        for (let i = 0; i <= pasos; i++) {
            const p = i / pasos;
            const x = Math.sin(p * Math.PI * azar(1.6, 2.4)) * vaiven;
            const op = p === 0 ? 0 : p > 0.82 ? (1 - p) / 0.18 * 0.9 : 0.9;
            frames.push({ transform: `translate(${x.toFixed(1)}px, ${(-sube * p).toFixed(1)}px) scale(${(0.7 + p * 0.3).toFixed(2)})`, opacity: op });
        }
        const anim = b.animate(frames, { duration: dur, easing: 'linear', fill: 'forwards' });
        anim.onfinish = () => { b.remove(); activas--; };
        if (precalentar === true) anim.currentTime = Math.random() * dur * 0.9;
    }

    // Arranque con un grupo de burbujas en el fondo
    // Al abrir, ya hay burbujas repartidas en distintas alturas
    for (let i = 0; i < Math.round(MAX_BURBUJAS * 0.7); i++) crearBurbuja(true);
    setInterval(() => crearBurbuja(false), INTERVALO_MS);
})();
