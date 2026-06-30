document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-navigation');
    const navLinks = mainNav.querySelectorAll('a');

    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const autoplayBtn = document.getElementById('toggle-autoplay');

    let currentSlide = 0;
    let autoplay = true;
    let autoplayInterval = null;

    function updateMenu(open) {
        menuToggle.setAttribute('aria-expanded', String(open));
        mainNav.setAttribute('aria-hidden', String(!open));
        mainNav.classList.toggle('is-open', open);
        menuToggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    }

    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        updateMenu(!isOpen);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            updateMenu(false);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') updateMenu(false);
    });

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            const active = i === currentSlide;
            slide.classList.toggle('active', active);
            slide.setAttribute('aria-hidden', String(!active));
        });

        dots.forEach((dot, i) => {
            const active = i === currentSlide;
            dot.classList.toggle('active', active);
            dot.setAttribute('aria-pressed', String(active));
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            if (autoplay) nextSlide();
        }, 6000);
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => showSlide(i));
    });

    autoplayBtn.addEventListener('click', () => {
        autoplay = !autoplay;
        autoplayBtn.setAttribute('aria-pressed', String(!autoplay));
        autoplayBtn.setAttribute('aria-label', autoplay ? 'Pausar carrossel' : 'Retomar carrossel');
        autoplayBtn.innerHTML = autoplay
            ? '<i data-lucide="pause"></i>'
            : '<i data-lucide="play"></i>';
        lucide.createIcons();
    });

    showSlide(0);
    startAutoplay();

    window.addEventListener('beforeunload', () => {
        if (autoplayInterval) clearInterval(autoplayInterval);
    });

    const cepInput = document.getElementById('cep-input');
    const btnConsultar = document.getElementById('btn-consultar');
    const coverageFeedback = document.getElementById('coverage-feedback');

    btnConsultar.addEventListener('click', () => {
        const cep = cepInput.value.trim();

        if (cep.length < 8) {
            coverageFeedback.textContent = 'Digite um CEP válido para consultar.';
            coverageFeedback.className = 'feedback-message feedback-error';
            return;
        }

        coverageFeedback.textContent = 'Cobertura consultada. Nossa equipe entrará em contato para confirmar a disponibilidade.';
        coverageFeedback.className = 'feedback-message feedback-success';
    });
});