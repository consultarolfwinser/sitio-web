const RESOURCES = Object.freeze({
  'cuando-lo-cotidiano': {
    title: 'Cuando lo cotidiano empieza a costar más',
    file: '/assets/resources/cuando-lo-cotidiano-empieza-a-costar.pdf'
  },
  'volver-a-empezar': {
    title: 'Volver a empezar con un paso posible',
    file: '/assets/resources/volver-a-empezar-con-un-paso-posible.pdf'
  },
  'cuando-puede-ayudar-to': {
    title: '¿Cuándo puede ayudar la Terapia Ocupacional?',
    file: '/assets/resources/cuando-puede-ayudar-terapia-ocupacional.pdf'
  }
});

const form = document.querySelector('[data-download-confirm-form]');
const frame = document.querySelector('[data-download-confirm-frame]');
const title = document.querySelector('[data-download-title]');
const copy = document.querySelector('[data-download-copy]');
const status = document.querySelector('[data-download-confirm-status]');
const tokenField = document.querySelector('[data-download-token]');
const resourceField = document.querySelector('[data-download-resource]');
const nonceField = document.querySelector('[data-download-nonce]');
const submitButton = form?.querySelector('[type="submit"]');
const query = new URLSearchParams(window.location.search);
const token = String(query.get('token') || '').trim().toLowerCase();
const resourceId = String(query.get('resource_id') || '').trim();
const resource = RESOURCES[resourceId];
const validToken = /^[a-f0-9]{64}$/.test(token);
let confirmationTimer = 0;
let confirmationInProgress = false;
let activeNonce = '';

const createRequestNonce = () => {
  if (!window.crypto?.getRandomValues) return '';
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

const finishConfirmation = () => {
  window.clearTimeout(confirmationTimer);
  confirmationInProgress = false;
  activeNonce = '';
  if (submitButton) submitButton.disabled = false;
};

if (!form || !frame || !submitButton || !nonceField || !resource || !validToken) {
  title.textContent = 'Enlace no válido';
  copy.textContent = 'El enlace está incompleto o no corresponde a una de las guías disponibles.';
} else {
  title.textContent = resource.title;
  copy.textContent = 'Tu guía está lista. Confirma la descarga para registrarla y abrir el PDF.';
  tokenField.value = token;
  resourceField.value = resourceId;
  form.hidden = false;

  window.addEventListener('message', event => {
    const data = event.data;
    if (!data || data.source !== 'rolf-download' || data.type !== 'confirm_download' || data.nonce !== activeNonce) return;

    finishConfirmation();
    if (data.status !== 'ok' || data.resource_id !== resourceId) {
      status.textContent = String(data.message || 'No pudimos confirmar la descarga. Intenta nuevamente.');
      return;
    }

    status.textContent = 'Descarga confirmada. Abriendo el PDF…';
    window.setTimeout(() => window.location.assign(resource.file), 350);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (confirmationInProgress) return;

    activeNonce = createRequestNonce();
    if (!activeNonce) {
      status.textContent = 'Tu navegador no permite confirmar esta descarga de forma segura.';
      return;
    }
    nonceField.value = activeNonce;

    confirmationInProgress = true;
    submitButton.disabled = true;
    status.textContent = 'Confirmando la descarga…';
    confirmationTimer = window.setTimeout(() => {
      finishConfirmation();
      status.textContent = 'La confirmación está tardando más de lo esperado. Intenta nuevamente.';
    }, 25000);

    HTMLFormElement.prototype.submit.call(form);
  });
}
