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

// Show toast on ?success=1 then clean URL
(function showToastIfSuccess() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.hidden = false;
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => toast.classList.remove('show'), 4000);
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
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
    const targetUrl = origin + '/index.html?success=1';
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
      // Stricte validation email : local@domain.tld
      // Local part: lettres, chiffres, points, tirets, underscores (pas de points consécutifs)
      // Domain: au moins un point, lettres/chiffres/tirets, TLD d'au moins 2 caractères
      const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
      const hasAt = value.includes('@');
      const hasDotAfterAt = value.includes('.', value.indexOf('@'));
      const noConsecutiveDots = !value.includes('..');
      const noStartEndDots = !value.startsWith('.') && !value.endsWith('.') && !value.includes('@.') && !value.includes('.@');
      const lengthOk = value.length >= 5 && value.length <= 254;
      
      const ok = emailRegex.test(value) && hasAt && hasDotAfterAt && noConsecutiveDots && noStartEndDots && lengthOk;
      
      if (!ok) { 
        valid = false; 
        showError(email, 'Veuillez saisir une adresse e‑mail valide (ex: nom@domaine.fr).'); 
      } else { 
        clearError(email); 
      }
    }

    if (tel) {
      const value = tel.value.trim();
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, '');
      // Check for French phone number patterns: 10 digits starting with 0, or 11 digits starting with 33
      const frenchPhoneRegex = /^(0[1-9]|33[1-9])[0-9]{8}$/;
      const ok = frenchPhoneRegex.test(digits) && (digits.length === 10 || digits.length === 11);
      
      if (!ok) { 
        valid = false; 
        showError(tel, 'Veuillez saisir un numéro de téléphone français valide (ex: 06 12 34 56 78).'); 
      } else { 
        clearError(tel); 
      }
    }

    if (message) {
      const value = message.value.trim();
      if (!value) { 
        valid = false; 
        showError(message, 'Le message est requis.'); 
      } else { 
        clearError(message); 
      }
    }

    if (!valid) {
      e.preventDefault();
      return;
    }

    ensureNextRedirect();
  });
})();

