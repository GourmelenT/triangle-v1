// Chargement dynamique de la galerie depuis content/galerie
document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('galerie-grid');
  if (!grid) return;

  // Fonction utilitaire pour parser le frontmatter YAML d'un fichier Markdown
  function parseFrontmatter(md) {
    const match = md.match(/^---([\s\S]*?)---/);
    if (!match) return null;
    const yaml = match[1];
    const lines = yaml.split(/\r?\n/);
    const data = {};
    lines.forEach(line => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        // Enlève les guillemets éventuels
        value = value.replace(/^['"]|['"]$/g, '');
        data[key] = value;
      }
    });
    return data;
  }

  // Récupère la liste des fichiers dans content/galerie (nécessite que le serveur autorise l'indexation ou que Netlify génère un index.json)
  fetch('content/galerie/index.json')
    .then(r => r.json())
    .then(files => {
      files.forEach(file => {
        fetch('content/galerie/' + file)
          .then(r => r.text())
          .then(md => {
            const data = parseFrontmatter(md);
            if (!data) return;
            // Création du bloc
            const card = document.createElement('div');
            card.className = 'project-card';
            // Optionnel : data-category pour le filtrage
            if (data.category) card.setAttribute('data-category', data.category);
            card.innerHTML = `
              <img src="${data.image}" alt="${data.title}">
              <div class="project-info">
                <h3>${data.title}</h3>
                <p>${data.description || ''}</p>
              </div>
            `;
            grid.appendChild(card);
          });
      });
    })
    .catch(() => {
      // Si pas d'index.json, affiche un message d'aide
      grid.innerHTML = '<p style="color:#888">Aucune galerie trouvée. Ajoutez des photos via l’admin.</p>';
    });
});
// Filtres rapides Derniers projets
document.querySelectorAll('.projects-filters').forEach((filters) => {
  const btns = filters.querySelectorAll('.filter-btn');
  const grid = filters.parentElement.querySelector('.projects-grid');
  const cards = grid ? grid.querySelectorAll('.project-card') : [];
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      cards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
// Filtres dynamiques pour la grille de réalisations
const realFilters = document.querySelectorAll('.projects-filters');
realFilters.forEach((filters) => {
  const btns = filters.querySelectorAll('.filter-btn');
  const grid = filters.parentElement.parentElement.nextElementSibling.querySelector('.projects-grid');
  const cards = grid ? grid.querySelectorAll('.project-card') : [];
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      cards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});

// Sticky CTA accessibility
const stickyCta = document.querySelector('.sticky-cta');
if (stickyCta) {
  stickyCta.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') stickyCta.blur();
  });
}
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

// Portfolio Carousel
document.querySelectorAll('[data-portfolio-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = carousel.querySelectorAll('[data-carousel-slide]');
  const indicators = carousel.querySelectorAll('[data-carousel-indicator]');
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  
  if (!track || slides.length === 0) return;
  
  let currentIndex = 0;
  let autoplayInterval;
  
  function updateCarousel(index) {
    currentIndex = (index + slides.length) % slides.length;
    
    // Update track position
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update active slide
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });
    
    // Update indicators
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === currentIndex);
    });
  }
  
  function goToSlide(index) {
    updateCarousel(index);
    resetAutoplay();
  }
  
  function nextSlide() {
    goToSlide(currentIndex + 1);
  }
  
  function prevSlide() {
    goToSlide(currentIndex - 1);
  }
  
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000);
  }
  
  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }
  }
  
  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }
  
  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  
  indicators.forEach((indicator, i) => {
    indicator.addEventListener('click', () => goToSlide(i));
  });
  
  // Keyboard navigation
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });
  
  // Pause autoplay on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  
  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }
  
  // Initialize
  updateCarousel(0);
  startAutoplay();
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

