/* =========================================================
   SAM INCENDIE — Scripts principaux
   Optimisations : vrai envoi Formspree, code nettoyé
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- NAVIGATION MOBILE (burger) ---- */
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- HEADER STICKY ---- */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ---- ACTIVE NAV LINK ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link[href^="#"]');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });

    sections.forEach(s => sectionObserver.observe(s));
  }

  /* ---- SMOOTH SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const offset = header ? header.offsetHeight : 0;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset - 8;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- BACK TO TOP ---- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      const show = window.scrollY > 400;
      backToTop.classList.toggle('visible', show);
      backToTop.hidden = !show;
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- FAQ ACCORDION ---- */
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq__item');
      const answer = item.querySelector('.faq__answer');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq__item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq__answer').hidden = true;
          openItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('open', !isOpen);
      answer.hidden = isOpen;
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---- SCROLL REVEAL ---- */
  const revealElements = document.querySelectorAll(
    '.service-card, .secteur-card, .blog-card, .stat-card, ' +
    '.reglem__card, .process__step, .about__value, .faq__item, ' +
    '.actu-card, .actu-featured, .ext-card, .oblig-card, ' +
    '.role-card, .panneau-card, .highlight-box, .callout'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ---- COMPTEUR ANIME ---- */
  const counters = document.querySelectorAll('.stat-card__number');

  if (counters.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const steps    = 60;
    const step     = duration / steps;
    let current    = 0;

    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, step);
  }

  /* ---- FORMULAIRE DE CONTACT (Formspree) ---- */
  const form = document.getElementById('contactForm');
  if (form) {

    // IMPORTANT : remplacer YOUR_FORM_ID par votre ID Formspree
    // Creez un compte gratuit sur https://formspree.io et copiez l'ID ici
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjglnley';

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (validateForm()) {
        submitForm();
      }
    });

    form.querySelectorAll('.form__input').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validateField(input);
      });
    });

    function validateField(field) {
      const id    = field.id;
      const value = field.value.trim();
      const error = document.getElementById(id + '-error');

      field.classList.remove('error');
      if (error) error.textContent = '';

      if (field.required && !value) {
        field.classList.add('error');
        if (error) error.textContent = 'Ce champ est obligatoire.';
        return false;
      }

      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        field.classList.add('error');
        if (error) error.textContent = 'Adresse email invalide.';
        return false;
      }

      return true;
    }

    function validateForm() {
      let valid = true;

      form.querySelectorAll('.form__input[required]').forEach(field => {
        if (!validateField(field)) valid = false;
      });

      const rgpd      = document.getElementById('rgpd');
      const rgpdError = document.getElementById('rgpd-error');
      if (rgpd && !rgpd.checked) {
        if (rgpdError) rgpdError.textContent = 'Vous devez accepter notre politique de confidentialite.';
        valid = false;
      }

      return valid;
    }

    async function submitForm() {
      const btn     = form.querySelector('[type="submit"]');
      const success = document.getElementById('formSuccess');
      const errMsg  = document.getElementById('formError');

      btn.disabled    = true;
      btn.textContent = 'Envoi en cours...';
      if (success) success.hidden = true;
      if (errMsg) errMsg.hidden = true;

      const formData = new FormData(form);

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method:  'POST',
          body:    formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          if (success) {
            success.hidden = false;
            success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          if (errMsg) { errMsg.hidden = true; }
          return;
        }
        // Réponse non-ok
        const data = await response.json().catch(() => ({}));
        const msg = data.error || 'Erreur serveur';
        throw new Error(msg);
      } catch (err) {
        if (success) { success.hidden = true; }
        if (errMsg) {
          errMsg.hidden = false;
          errMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          alert('Une erreur est survenue. Contactez-nous par email ou telephone.');
        }
        console.error('Formspree error:', err);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg> Envoyer ma demande';
      }
    }
  }

});
