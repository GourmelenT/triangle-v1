// Mobile menu toggle
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('[data-menu-toggle]');
  if (toggle) {
    const nav = document.querySelector('[data-nav]');
    if (nav) nav.classList.toggle('open');
    toggle.classList.toggle('active');
  }
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

document.querySelectorAll('[data-reveal]').forEach((el) => {
  el.classList.add('will-reveal');
  revealObserver.observe(el);
});

// Gentle floating parallax for blobs
function lerp(a, b, t) { return a + (b - a) * t; }

const blobEls = Array.from(document.querySelectorAll('.blob'));
const blobBase = blobEls.map(() => ({ x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 16 }));

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = (e.clientY / window.innerHeight) * 2 - 1;
  mouseX = lerp(mouseX, x, 0.2);
  mouseY = lerp(mouseY, y, 0.2);
});

function animateBlobs() {
  blobEls.forEach((el, i) => {
    const base = blobBase[i];
    const dx = base.x + mouseX * 8;
    const dy = base.y + mouseY * 8;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  requestAnimationFrame(animateBlobs);
}
if (blobEls.length) requestAnimationFrame(animateBlobs);

// Simple slider (auto + arrows) for gallery sections with [data-slider]
document.querySelectorAll('[data-slider]').forEach((slider) => {
  const track = slider.querySelector('[data-track]');
  const items = slider.querySelectorAll('[data-slide]');
  if (!track || items.length === 0) return;
  let index = 0;
  function go(i) {
    index = (i + items.length) % items.length;
    track.style.transform = `translateX(${-index * 100}%)`;
  }
  slider.querySelectorAll('[data-prev]').forEach((btn) => btn.addEventListener('click', () => go(index - 1)));
  slider.querySelectorAll('[data-next]').forEach((btn) => btn.addEventListener('click', () => go(index + 1)));
  setInterval(() => go(index + 1), 5000);
});

// Utility: year in footer
const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Show toast on ?sent=1 then clean URL
(function showToastIfSent() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sent') === '1') {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.hidden = false;
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => toast.classList.remove('show'), 3000);
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('sent');
      window.history.replaceState({}, '', url);
    }
  } catch (_) {}
})();

// Contact form validation + dynamic redirect
(function setupContactForm() {
  const form = document.querySelector('form.form');
  if (!form) return;

  function ensureNextRedirect() {
    const origin = window.location.origin || '';
    const next = form.querySelector('input[name="_next"]');
    const targetUrl = origin + '/index.html?sent=1';
    if (next) next.value = targetUrl;
  }

  function showError(input, message) {
    input.setAttribute('aria-invalid', 'true');
    let err = input.parentElement.querySelector('.error-text');
    if (!err) {
      err = document.createElement('div');
      err.className = 'error-text';
      input.parentElement.appendChild(err);
    }
    err.textContent = message;
  }

  function clearError(input) {
    input.removeAttribute('aria-invalid');
    const err = input.parentElement.querySelector('.error-text');
    if (err) err.textContent = '';
  }

  form.addEventListener('submit', (e) => {
    let valid = true;
    const email = form.querySelector('#email');
    const tel = form.querySelector('#tel');
    const message = form.querySelector('#message');

    if (email) {
      const value = email.value.trim();
      // Basic email check; rely on browser validation as well
      const ok = /.+@.+\..+/.test(value);
      if (!ok) { valid = false; showError(email, 'Veuillez saisir un e‑mail valide.'); } else { clearError(email); }
    }

    if (tel) {
      const digits = (tel.value || '').replace(/\D/g, '');
      const ok = digits.length >= 10;
      if (!ok) { valid = false; showError(tel, 'Le numéro doit contenir au moins 10 chiffres.'); } else { clearError(tel); }
    }

    if (message) {
      const value = message.value.trim();
      if (!value) { valid = false; showError(message, 'Le message est requis.'); } else { clearError(message); }
    }

    if (!valid) {
      e.preventDefault();
      return;
    }

    ensureNextRedirect();
  });
})();

