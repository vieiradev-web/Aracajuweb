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

  const cepInput = document.getElementById('cep-input');
  const btnConsultar = document.getElementById('btn-consultar');
  const coverageFeedback = document.getElementById('coverage-feedback');

  let currentSlide = 0;
  let autoplay = true;
  let autoplayInterval = null;

  const bairrosAtendidos = ['Santa Maria', '17 de Março', 'Marivam'];
  const bairrosEmExpansao = ['São Conrado'];

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
    link.addEventListener('click', () => updateMenu(false));
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

  function formatarCEP(valor) {
    const apenasNumeros = valor.replace(/\D/g, '').slice(0, 8);
    if (apenasNumeros.length <= 5) return apenasNumeros;
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`;
  }

  async function consultarViaCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return {
        tipo: 'error',
        texto: 'Digite um CEP válido no formato 49000-000.'
      };
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        return {
          tipo: 'error',
          texto: 'CEP não encontrado na base do ViaCEP.'
        };
      }

      const bairro = (data.bairro || '').trim();

      if (bairrosAtendidos.includes(bairro)) {
        return {
          tipo: 'success',
          texto: `Sim! Atendemos a região de ${bairro}, em Aracaju. Nossa equipe pode confirmar a instalação.`
        };
      }

      if (bairrosEmExpansao.includes(bairro)) {
        return {
          tipo: 'success',
          texto: `A região de ${bairro} está em expansão. Consulte nossa equipe para verificar disponibilidade.`
        };
      }

      return {
        tipo: 'error',
        texto: `No momento ainda não atendemos a região de ${bairro}. Consulte nossa equipe para alternativas.`
      };
    } catch (error) {
      return {
        tipo: 'error',
        texto: 'Não foi possível consultar o CEP no momento. Tente novamente em instantes.'
      };
    }
  }

  async function consultarCobertura() {
    const cepDigitado = cepInput.value.trim();
    cepInput.value = formatarCEP(cepDigitado);

    coverageFeedback.textContent = 'Consultando cobertura...';
    coverageFeedback.className = 'feedback-message';

    const resposta = await consultarViaCEP(cepInput.value);
    coverageFeedback.textContent = resposta.texto;
    coverageFeedback.className = `feedback-message feedback-${resposta.tipo}`;
  }

  btnConsultar.addEventListener('click', consultarCobertura);

  cepInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      consultarCobertura();
    }
  });

  cepInput.addEventListener('input', () => {
    cepInput.value = formatarCEP(cepInput.value);
  });

  showSlide(0);
  startAutoplay();

  window.addEventListener('beforeunload', () => {
    if (autoplayInterval) clearInterval(autoplayInterval);
  });
});