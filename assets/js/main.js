const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('nav');
const year = document.querySelector('[data-year]');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menu?.classList.toggle('open', !open);
});

menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => observer.observe(el));
if (year) year.textContent = new Date().getFullYear();

const carousel = document.querySelector('[data-carousel]');

if (carousel) {
  const slides = [...carousel.querySelectorAll('[data-slide]')];
  const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
  const previous = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let timer;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === current;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const stopCarousel = () => window.clearInterval(timer);
  const startCarousel = () => {
    stopCarousel();
    if (!reduceMotion && slides.length > 1) {
      timer = window.setInterval(() => showSlide(current + 1), 6000);
    }
  };

  previous?.addEventListener('click', () => {
    showSlide(current - 1);
    startCarousel();
  });
  next?.addEventListener('click', () => {
    showSlide(current + 1);
    startCarousel();
  });
  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    showSlide(index);
    startCarousel();
  }));
  carousel.addEventListener('mouseenter', stopCarousel);
  carousel.addEventListener('mouseleave', startCarousel);
  carousel.addEventListener('focusin', stopCarousel);
  carousel.addEventListener('focusout', startCarousel);
  document.addEventListener('visibilitychange', () => document.hidden ? stopCarousel() : startCarousel());

  showSlide(0);
  startCarousel();
}

const downloadModal = document.querySelector('[data-download-modal]');
const downloadForm = document.querySelector('[data-download-form]');

if (downloadModal && downloadForm) {
  const selection = downloadModal.querySelector('[data-resource-selection]');
  const resourceIdField = downloadForm.querySelector('[data-resource-id-field]');
  const resourceTitleField = downloadForm.querySelector('[data-resource-title-field]');
  const emailField = downloadForm.querySelector('input[type="email"]');
  const status = downloadForm.querySelector('[data-download-status]');
  const requestFrame = downloadModal.querySelector('[data-download-request-frame]');
  const submitButton = downloadForm.querySelector('[type="submit"]');
  let trigger = null;
  let requestTimer = 0;
  let requestInProgress = false;

  const finishRequest = () => {
    window.clearTimeout(requestTimer);
    requestInProgress = false;
    submitButton.disabled = false;
  };

  const closeDownloadModal = () => {
    downloadModal.hidden = true;
    document.body.classList.remove('modal-open');
    trigger?.focus();
  };

  document.querySelectorAll('[data-download-gate]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      resourceIdField.value = button.dataset.resourceId || '';
      resourceTitleField.value = button.dataset.resourceTitle || '';
      selection.textContent = `Seleccionaste “${resourceTitleField.value}”. Ingresa tu correo para recibirla y registrar la descarga.`;
      status.textContent = '';
      downloadModal.hidden = false;
      document.body.classList.add('modal-open');
      emailField?.focus();

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'resource_gate_open', { resource_name: resourceIdField.value });
      }
    });
  });

  downloadModal.querySelectorAll('[data-download-close]').forEach(button => {
    button.addEventListener('click', closeDownloadModal);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !downloadModal.hidden) closeDownloadModal();
  });

  window.addEventListener('message', event => {
    if (!requestFrame?.contentWindow || event.source !== requestFrame.contentWindow) return;
    const data = event.data;
    if (!data || data.source !== 'rolf-download' || data.type !== 'request') return;

    finishRequest();
    status.textContent = String(data.message || 'No pudimos procesar la solicitud.');

    if (data.status === 'ok') {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'resource_request', { resource_name: resourceIdField.value });
      }
      emailField.value = '';
      const consentField = downloadForm.querySelector('[name="privacy_consent"]');
      if (consentField) consentField.checked = false;
    }
  });

  downloadForm.addEventListener('submit', event => {
    event.preventDefault();
    if (requestInProgress) return;

    const endpoint = downloadForm.action;

    if (!endpoint || !requestFrame) {
      status.textContent = 'El servicio de envío no está disponible en este momento.';
      return;
    }

    requestInProgress = true;
    submitButton.disabled = true;
    status.textContent = 'Enviando el enlace a tu correo…';

    requestTimer = window.setTimeout(() => {
      finishRequest();
      status.textContent = 'La respuesta está tardando más de lo esperado. Revisa tu correo antes de intentarlo nuevamente.';
    }, 25000);

    HTMLFormElement.prototype.submit.call(downloadForm);
  });
}

document.querySelectorAll('[data-hotmart-link]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'hotmart_product_click', {
        product_name: link.dataset.hotmartLink,
        link_url: link.getAttribute('href')
      });
    }
  });
});
