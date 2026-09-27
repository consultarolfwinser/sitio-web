const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('nav');
const year = document.querySelector('[data-year]');

const setMenuState = (open, { returnFocus = false } = {}) => {
  if (!menuButton || !menu) return;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  const text = menuButton.querySelector('.sr-only');
  if (text) text.textContent = open ? 'Cerrar menú' : 'Abrir menú';
  menu.classList.toggle('open', open);
  if (!open && returnFocus) menuButton.focus();
};

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  setMenuState(!open);
});

menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  setMenuState(false);
}));

document.addEventListener('click', event => {
  if (menuButton?.getAttribute('aria-expanded') !== 'true') return;
  if (!menu?.contains(event.target) && !menuButton.contains(event.target)) setMenuState(false);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    setMenuState(false, { returnFocus: true });
  }
});

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
  const dialog = downloadModal.querySelector('[role="dialog"]');
  const selection = downloadModal.querySelector('[data-resource-selection]');
  const resourceIdField = downloadForm.querySelector('[data-resource-id-field]');
  const resourceTitleField = downloadForm.querySelector('[data-resource-title-field]');
  const emailField = downloadForm.querySelector('input[type="email"]');
  const status = downloadForm.querySelector('[data-download-status]');
  const requestFrame = downloadModal.querySelector('[data-download-request-frame]');
  const nonceField = downloadForm.querySelector('[data-request-nonce]');
  const submitButton = downloadForm.querySelector('[type="submit"]');
  const successPanel = downloadModal.querySelector('[data-download-success]');
  const allowedMessageOrigins = new Set(['https://script.google.com', 'https://script.googleusercontent.com']);
  const backgroundElements = [
    ...document.querySelectorAll('body > header, body > footer, body > .floating-whatsapp'),
    ...document.querySelectorAll('main > :not([data-download-modal])')
  ];
  let trigger = null;
  let requestTimer = 0;
  let requestInProgress = false;
  let activeNonce = '';

  const createRequestNonce = () => {
    if (!window.crypto?.getRandomValues) return '';
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const finishRequest = () => {
    window.clearTimeout(requestTimer);
    requestInProgress = false;
    activeNonce = '';
    submitButton.disabled = false;
  };

  const closeDownloadModal = () => {
    if (requestInProgress) finishRequest();
    downloadModal.hidden = true;
    document.body.classList.remove('modal-open');
    backgroundElements.forEach(element => element.removeAttribute('inert'));
    trigger?.focus();
  };

  document.querySelectorAll('[data-download-gate]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      resourceIdField.value = button.dataset.resourceId || '';
      resourceTitleField.value = button.dataset.resourceTitle || '';
      selection.textContent = `Seleccionaste “${resourceTitleField.value}”. Ingresa tu correo para recibirla y registrar la descarga.`;
      status.textContent = '';
      downloadForm.hidden = false;
      selection.hidden = false;
      if (successPanel) successPanel.hidden = true;
      downloadModal.hidden = false;
      document.body.classList.add('modal-open');
      backgroundElements.forEach(element => element.setAttribute('inert', ''));
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
    if (downloadModal.hidden) return;
    if (event.key === 'Escape') {
      closeDownloadModal();
      return;
    }
    if (event.key === 'Tab' && dialog) {
      const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), summary, [tabindex]:not([tabindex="-1"])')]
        .filter(element => !element.closest('[hidden]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('message', event => {
    const data = event.data;
    if (event.source !== requestFrame?.contentWindow || !allowedMessageOrigins.has(event.origin)) return;
    if (!data || data.source !== 'rolf-download' || data.type !== 'request' || data.nonce !== activeNonce) return;

    finishRequest();
    status.textContent = String(data.message || 'No pudimos procesar la solicitud.');

    if (data.status === 'ok') {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'resource_request', { resource_name: resourceIdField.value });
      }
      emailField.value = '';
      const consentField = downloadForm.querySelector('[name="privacy_consent"]');
      if (consentField) consentField.checked = false;
      downloadForm.hidden = true;
      selection.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.focus();
      }
    } else {
      status.focus();
    }
  });

  downloadForm.addEventListener('submit', event => {
    event.preventDefault();
    if (requestInProgress) return;

    const endpoint = downloadForm.action;

    if (!endpoint || !requestFrame || !nonceField) {
      status.textContent = 'El servicio de envío no está disponible en este momento.';
      status.focus();
      return;
    }

    activeNonce = createRequestNonce();
    if (!activeNonce) {
      status.textContent = 'Tu navegador no permite completar esta solicitud de forma segura.';
      status.focus();
      return;
    }
    nonceField.value = activeNonce;

    requestInProgress = true;
    submitButton.disabled = true;
    status.textContent = 'Enviando el enlace a tu correo…';

    requestTimer = window.setTimeout(() => {
      finishRequest();
      status.textContent = 'La respuesta está tardando más de lo esperado. Revisa tu correo antes de intentarlo nuevamente.';
      status.focus();
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

const linkLocation = (link) => {
  if (link.dataset.contactLocation) return link.dataset.contactLocation;
  if (link.classList.contains('floating-whatsapp')) return 'floating_button';
  if (link.closest('.hero-actions')) return 'hero';
  if (link.closest('.contact-panel')) return 'contact_panel';
  if (link.closest('footer')) return 'footer';
  return 'content';
};

document.querySelectorAll('a[href^="https://wa.me/"]:not([data-private-contact])').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'contact_click', {
        contact_method: 'whatsapp',
        link_location: linkLocation(link),
        link_text: (link.textContent || link.getAttribute('aria-label') || '').trim(),
        page_path: window.location.pathname
      });
    }
  });
});

document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'contact_click', {
        contact_method: 'email',
        link_location: linkLocation(link),
        link_text: (link.textContent || link.getAttribute('aria-label') || '').trim(),
        page_path: window.location.pathname
      });
    }
  });
});

document.addEventListener('click', event => {
  const link = event.target.closest('.social-instagram, .social-tiktok');
  if (!link || typeof window.gtag !== 'function') return;
  window.gtag('event', 'social_profile_click', {
    social_network: link.classList.contains('social-instagram') ? 'instagram' : 'tiktok',
    page_path: window.location.pathname
  });
});

document.querySelectorAll('[data-track-event]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', link.dataset.trackEvent, {
        link_url: link.getAttribute('href'),
        page_path: window.location.pathname
      });
    }
  });
});

document.querySelectorAll('nav a[href]').forEach(link => {
  const url = new URL(link.href, window.location.origin);
  if (url.origin === window.location.origin && url.pathname === window.location.pathname && !url.hash) {
    link.setAttribute('aria-current', 'page');
  }
});

const seoCta = document.querySelector('.seo-cta');
if (seoCta && !document.querySelector('[data-editorial-follow]')) {
  const follow = document.createElement('section');
  follow.className = 'editorial-follow';
  follow.dataset.editorialFollow = '';
  follow.innerHTML = `<div class="shell editorial-follow-card"><div><p class="kicker">Continúa la conversación</p><h2>Salud mental desde la vida cotidiana.</h2><p>Si este contenido te ayudó, puedes seguirme para encontrar nuevas orientaciones sobre rutinas, estudio, trabajo, autonomía y participación.</p></div><div class="editorial-follow-actions"><a class="button button-outline social-instagram" href="https://www.instagram.com/t.o.rolfwinser/" target="_blank" rel="noopener">Seguir en Instagram</a><a class="button button-outline social-tiktok" href="https://www.tiktok.com/@t.o.rolfwinser" target="_blank" rel="noopener">Ver contenidos en TikTok</a></div></div>`;
  seoCta.before(follow);
}

document.querySelectorAll('footer .footer-layout').forEach(layout => {
  if (layout.querySelector('.footer-links')) return;
  const links = document.createElement('nav');
  links.className = 'footer-links';
  links.setAttribute('aria-label', 'Enlaces complementarios');
  links.innerHTML = '<a href="/profesionales.html">Para profesionales</a><a href="/pacientes.html">Ya soy paciente</a>';
  const social = layout.querySelector('.social-links');
  layout.insertBefore(links, social || layout.lastElementChild);
});

document.querySelectorAll('a[target="_blank"]').forEach(link => {
  const note = ' (se abre en una nueva pestaña)';
  if (link.hasAttribute('aria-label')) {
    const label = link.getAttribute('aria-label') || '';
    if (!label.includes('nueva pestaña')) link.setAttribute('aria-label', `${label}${note}`);
    return;
  }
  if (!link.querySelector('.new-tab-note')) {
    const span = document.createElement('span');
    span.className = 'sr-only new-tab-note';
    span.textContent = note;
    link.append(span);
  }
});
