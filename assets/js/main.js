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

document.querySelectorAll('[data-download]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'resource_download', {
        resource_name: link.dataset.download,
        file_name: link.getAttribute('href')?.split('/').pop()
      });
    }
  });
});
