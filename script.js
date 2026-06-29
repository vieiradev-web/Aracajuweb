document.addEventListener('DOMContentLoaded', () => {
    // Seletores Principais
    const btnConsultar = document.getElementById('btn-consultar');
    const cepInput = document.getElementById('cep-input');
    const feedbackDiv = document.getElementById('coverage-feedback');
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-navigation');

    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const toggleAutoplayBtn = document.getElementById('toggle-autoplay');

    let currentSlide = 0;
    let autoplay = true;
    let autoplayTimer = null;

    // Inicialização segura dos ícones Lucide
    function initLucide() {
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }

    // Gerenciamento Dinâmico do Carrossel
    function updateCarousel(index) {
        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            const active = i === currentSlide;
            slide.classList.toggle('active', active);
            slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        });

        dots.forEach((dot, i) => {
            const active = i === currentSlide;
            dot.classList.toggle('active', active);
            dot.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function nextSlide() { updateCarousel(currentSlide + 1); }
    function prevSlide() { updateCarousel(currentSlide - 1); }

    function startAutoplay() {
        stopAutoplay();
        if (!autoplay) return;
        autoplayTimer = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function toggleAutoplay() {
        autoplay = !autoplay;
        if (toggleAutoplayBtn) {
            toggleAutoplayBtn.setAttribute('aria-pressed', autoplay ? 'false' : 'true');
            toggleAutoplayBtn.setAttribute('aria-label', autoplay ? 'Pausar carrossel' : 'Retomar carrossel');
            toggleAutoplayBtn.innerHTML = autoplay ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>';
        }
        initLucide();
        if (autoplay) startAutoplay();
        else stopAutoplay();
    }

    // Gerenciamento de Mensagens e Respostas de Cobertura
    function setFeedback(type, html) {
        if (!feedbackDiv) return;
        feedbackDiv.className = 'feedback-message';
        feedbackDiv.innerHTML = html;

        if (type === 'success') feedbackDiv.classList.add('feedback-success');
        if (type === 'error') feedbackDiv.classList.add('feedback-error');

        initLucide();
    }

    // Tratamento de entrada para máscara de CEP
    function formatCep(value) {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        return digits.replace(/^(\d{5})(\d)/, '$1-$2');
    }

    // Consulta à API externa de CEP
    async function consultarCep(cep) {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) throw new Error('Falha na conexão externa');
        return response.json();
    }

    // Lista oficial de bairros e rotas da Aracaju Web
    const bairrosAtendidos = ['santa maria', '17 de março', 'marivam'];
    const bairrosEmBreve = ['são conrado', 'sao conrado'];

    // Processamento e Link de Redirecionamento com Inteligência de Bairros
    async function verificarCobertura(cepValue) {
        const busca = cepValue.trim().toLowerCase();
        const cepLimpo = busca.replace(/\D/g, '');

        if (!busca) {
            setFeedback('error', 'Por favor, digite um CEP ou o nome do seu bairro.');
            return;
        }

        setFeedback('success', 'Verificando servidores e cobertura local...');

        try {
            let bairroIdentificado = "";
            let statusCobertura = "indisponivel";

            // 1. Se o usuário digitou um texto (Nome do Bairro) em vez de CEP
            if (cepLimpo.length !== 8) {
                if (bairrosAtendidos.some(b => busca.includes(b))) {
                    statusCobertura = "disponivel";
                    bairroIdentificado = busca;
                } else if (bairrosEmBreve.some(b => busca.includes(b))) {
                    statusCobertura = "em_breve";
                    bairroIdentificado = "São Conrado";
                }
            } 
            // 2. Se o usuário digitou um CEP válido, consultamos a API para descobrir o bairro
            else {
                const data = await consultarCep(cepLimpo);
                if (data.erro) {
                    setFeedback('error', 'CEP não localizado. Por favor, revise os números.');
                    return;
                }
                
                const bairroApi = data.bairro ? data.bairro.toLowerCase() : "";
                bairroIdentificado = data.bairro || "";

                if (bairrosAtendidos.some(b => bairroApi.includes(b))) {
                    statusCobertura = "disponivel";
                } else if (bairrosEmBreve.some(b => bairroApi.includes(b))) {
                    statusCobertura = "em_breve";
                }
            }

            // 3. Renderização das respostas com base no status real da Aracaju Web
            const linkWhatsapp = `https://wa.me/5579998870534?text=Olá! Consultei a viabilidade para o bairro ${bairroIdentificado || cepValue} no site e quero concluir minha assinatura!`;

            if (statusCobertura === "disponivel") {
                setFeedback(
                    'success',
                    `<div><strong>Excelente notícia!</strong> A rede Fibra Óptica está 100% disponível no bairro <strong>${bairroIdentificado}</strong>.</div>
                     <a href="${linkWhatsapp}" target="_blank" rel="noopener noreferrer" class="social-btn whatsapp-community" style="display:inline-flex; margin-top:14px; text-decoration:none;">
                        <i data-lucide="message-square"></i> Garantir Minha Instalação Grátis
                     </a>`
                );
            } else if (statusCobertura === "em_breve") {
                setFeedback(
                    'success',
                    `<div style="color: #ffaa00;"><strong>Estamos chegando!</strong> O bairro <strong>São Conrado</strong> está na nossa rota de expansão e em breve terá a ultravelocidade da Aracaju Web.</div>
                     <a href="https://wa.me/5579998870534?text=Olá! Moro no São Conrado e quero entrar na lista de espera para quando a fibra chegar!" target="_blank" rel="noopener noreferrer" class="social-btn suporte" style="display:inline-flex; margin-top:14px; text-decoration:none; background-color: #ff5500;">
                        <i data-lucide="clock"></i> Entrar na Lista de Espera
                     </a>`
                );
            } else {
                setFeedback(
                    'error',
                    `<div>Ainda não cobrimos a sua região atual. Mas não se preocupe! Fale conosco para registrar seu interesse.</div>
                     <a href="https://wa.me/5579991200034?text=Olá! Gostaria de pedir expansão de cobertura para o meu bairro." target="_blank" rel="noopener noreferrer" class="social-btn suporte" style="display:inline-flex; margin-top:14px; text-decoration:none;">
                        <i data-lucide="map-pin"></i> Solicitar Fibra no meu Bairro
                     </a>`
                );
            }

        } catch {
            setFeedback('error', 'Instabilidade no validador. Tente novamente em instantes ou digite o nome do bairro.');
        }
    }

    // Ouvintes do Carrossel
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoplay(); });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { updateCarousel(index); startAutoplay(); });
    });

    if (toggleAutoplayBtn) toggleAutoplayBtn.addEventListener('click', toggleAutoplay);

    // Controle de Pausa do Carrossel (Mouse/Foco)
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        heroCarousel.addEventListener('mouseenter', stopAutoplay);
        heroCarousel.addEventListener('mouseleave', () => { if (autoplay) startAutoplay(); });
        heroCarousel.addEventListener('focusin', stopAutoplay);
        heroCarousel.addEventListener('focusout', () => { if (autoplay) startAutoplay(); });
    }

    // Eventos do Sistema de CEP / Bairros
    if (cepInput) {
        cepInput.addEventListener('input', (e) => {
            // Só aplica máscara de CEP se o usuário começar digitando números
            if (/^\d/.test(e.target.value)) {
                e.target.value = formatCep(e.target.value);
            }
        });
        
        cepInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                verificarCobertura(cepInput.value);
            }
        });
    }

    if (btnConsultar) {
        btnConsultar.addEventListener('click', () => verificarCobertura(cepInput.value));
    }

    // Menu Responsivo Mobile
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = nav.classList.contains('nav-open');
            nav.classList.toggle('nav-open');
            nav.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menu de navegação' : 'Fechar menu');
            menuToggle.innerHTML = isOpen ? '<i data-lucide="menu"></i>' : '<i data-lucide="x"></i>';
            initLucide();
        });

        // Auto-fechamento ao clicar em links do menu
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('nav-open');
                nav.setAttribute('aria-hidden', 'true');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.innerHTML = '<i data-lucide="menu"></i>';
                initLucide();
            });
        });
    }

    // Inicialização Global
    startAutoplay();
    initLucide();
});