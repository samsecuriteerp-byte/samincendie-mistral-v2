/* ============================================================
   SAM INCENDIE — Lead Magnet Popup
   Triggers : exit intent (desktop) + 20s timer + 60% scroll
   Suppressed : 7 days after dismiss or conversion
   Pages exclus : kit-gratuit, produits, mentions-legales
   ============================================================ */

(function () {
  'use strict';

  /* ── Pages à exclure ── */
  const EXCLUDED = ['kit-gratuit.html', 'produits.html', 'mentions-legales.html'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (EXCLUDED.includes(currentPage)) return;

  /* ── Vérifier si déjà vu ── */
  const LS_KEY = 'sam_popup_ts';
  const DAYS   = 7;
  const stored = localStorage.getItem(LS_KEY);
  if (stored && (Date.now() - Number(stored)) < DAYS * 86400000) return;

  /* ── CSS injecté dynamiquement ── */
  const style = document.createElement('style');
  style.textContent = `
    #sam-popup-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(10,18,30,.65); backdrop-filter: blur(3px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      opacity: 0; transition: opacity .3s ease;
      pointer-events: none;
    }
    #sam-popup-overlay.visible {
      opacity: 1; pointer-events: all;
    }
    #sam-popup {
      background: #fff; border-radius: 20px;
      max-width: 500px; width: 100%;
      box-shadow: 0 24px 80px rgba(0,0,0,.35);
      overflow: hidden; position: relative;
      transform: translateY(24px) scale(.97);
      transition: transform .35s cubic-bezier(.34,1.56,.64,1);
    }
    #sam-popup-overlay.visible #sam-popup {
      transform: translateY(0) scale(1);
    }
    #sam-popup__close {
      position: absolute; top: 14px; right: 14px;
      background: rgba(0,0,0,.07); border: none; border-radius: 50%;
      width: 32px; height: 32px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; color: #555; line-height: 1;
      transition: background .2s;
    }
    #sam-popup__close:hover { background: rgba(0,0,0,.14); }
    #sam-popup__top {
      background: linear-gradient(135deg,#1A2E4A 0%,#0f1e30 100%);
      padding: 32px 32px 24px; text-align: center;
    }
    #sam-popup__badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(39,174,96,.18); border: 1px solid rgba(39,174,96,.35);
      color: #2ecc71; font-size: .72rem; font-weight: 700;
      letter-spacing: .07em; text-transform: uppercase;
      padding: 4px 12px; border-radius: 20px; margin-bottom: 14px;
    }
    #sam-popup__title {
      font-family: 'Montserrat', sans-serif; font-weight: 800;
      font-size: 1.3rem; color: #fff; line-height: 1.3; margin-bottom: 8px;
    }
    #sam-popup__title span { color: #e74c3c; }
    #sam-popup__sub {
      color: rgba(255,255,255,.65); font-size: .88rem; line-height: 1.6;
    }
    #sam-popup__preview {
      display: flex; gap: 8px; margin-top: 20px; justify-content: center; flex-wrap: wrap;
    }
    .popup-preview-item {
      background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
      border-radius: 8px; padding: 8px 12px; font-size: .75rem;
      color: rgba(255,255,255,.8); display: flex; align-items: center; gap: 6px;
    }
    .popup-preview-item::before { content: '✓'; color: #2ecc71; font-weight: 700; }
    #sam-popup__body { padding: 28px 32px; }
    #sam-popup__form-title {
      font-family: 'Montserrat', sans-serif; font-weight: 700;
      font-size: 1rem; color: #1A2E4A; margin-bottom: 18px; text-align: center;
    }
    .sam-popup-group { margin-bottom: 12px; }
    .sam-popup-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    .sam-popup-group input {
      width: 100%; padding: 12px 14px; border: 2px solid #e0e6ee; border-radius: 10px;
      font-size: .9rem; font-family: inherit; color: #333; outline: none;
      transition: border-color .2s; box-sizing: border-box;
    }
    .sam-popup-group input:focus { border-color: #1A2E4A; }
    .sam-popup-group input::placeholder { color: #bbb; }
    #sam-popup__submit {
      width: 100%; padding: 14px; background: #C0392B; color: #fff;
      border: none; border-radius: 10px; cursor: pointer;
      font-family: 'Montserrat', sans-serif; font-size: .95rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background .2s, transform .15s;
    }
    #sam-popup__submit:hover { background: #a93226; transform: translateY(-1px); }
    #sam-popup__submit:disabled { background: #ccc; cursor: not-allowed; transform: none; }
    #sam-popup__dismiss {
      display: block; text-align: center; margin-top: 14px;
      font-size: .78rem; color: #aaa; cursor: pointer;
      text-decoration: underline; text-underline-offset: 3px; background: none; border: none;
    }
    #sam-popup__dismiss:hover { color: #888; }
    #sam-popup__trust {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      font-size: .73rem; color: #bbb; margin-top: 10px;
    }
    #sam-popup__confirm {
      display: none; text-align: center; padding: 8px 0 4px;
    }
    #sam-popup__confirm-icon { font-size: 2.5rem; margin-bottom: 10px; }
    #sam-popup__confirm-title {
      font-family: 'Montserrat', sans-serif; font-weight: 800;
      font-size: 1.1rem; color: #27ae60; margin-bottom: 8px;
    }
    #sam-popup__confirm-text { font-size: .88rem; color: #555; line-height: 1.6; margin-bottom: 20px; }
    #sam-popup__confirm-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: #27ae60; color: #fff; padding: 12px 24px;
      border-radius: 10px; text-decoration: none;
      font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: .9rem;
      transition: background .2s;
    }
    #sam-popup__confirm-btn:hover { background: #219a52; }

    /* Mobile : bottom sheet */
    @media (max-width: 520px) {
      #sam-popup-overlay { align-items: flex-end; padding: 0; }
      #sam-popup {
        border-radius: 20px 20px 0 0; max-width: 100%;
        transform: translateY(100%);
      }
      #sam-popup-overlay.visible #sam-popup { transform: translateY(0); }
      #sam-popup__top { padding: 24px 20px 18px; }
      #sam-popup__body { padding: 20px 20px 28px; }
      .sam-popup-row { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);

  /* ── HTML du pop-up ── */
  const overlay = document.createElement('div');
  overlay.id = 'sam-popup-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'sam-popup-title');
  overlay.innerHTML = `
    <div id="sam-popup">
      <button id="sam-popup__close" aria-label="Fermer">✕</button>

      <div id="sam-popup__top">
        <div id="sam-popup__badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          100 % gratuit — Sans engagement
        </div>
        <div id="sam-popup__title" id="sam-popup-title">
          Checklist des <span>10 obligations</span><br>incendie obligatoires
        </div>
        <p id="sam-popup__sub">Le document que tout exploitant ERP devrait avoir avant sa commission de sécurité.</p>
        <div id="sam-popup__preview">
          <span class="popup-preview-item">Registre de sécurité</span>
          <span class="popup-preview-item">Extincteurs conformes</span>
          <span class="popup-preview-item">Signalétique ISO 7010</span>
          <span class="popup-preview-item">Formation personnel</span>
        </div>
      </div>

      <div id="sam-popup__body">

        <div id="sam-popup__form-wrap">
          <p id="sam-popup__form-title">Recevez la checklist par e-mail — gratuitement</p>
          <div class="sam-popup-row">
            <div class="sam-popup-group">
              <input type="text" id="sam-popup-prenom" placeholder="Votre prénom" autocomplete="given-name" />
            </div>
            <div class="sam-popup-group">
              <input type="email" id="sam-popup-email" placeholder="votre@email.fr" autocomplete="email" />
            </div>
          </div>
          <button id="sam-popup__submit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Télécharger gratuitement →
          </button>
          <div id="sam-popup__trust">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Données confidentielles · Désabonnement en 1 clic
          </div>
          <button id="sam-popup__dismiss">Non merci, je connais déjà toutes mes obligations</button>
        </div>

        <div id="sam-popup__confirm">
          <div id="sam-popup__confirm-icon">✅</div>
          <div id="sam-popup__confirm-title">C'est dans votre boîte !</div>
          <p id="sam-popup__confirm-text">Vérifiez vos e-mails — la checklist vous a été envoyée. Vous pouvez aussi la consulter directement ici.</p>
          <a id="sam-popup__confirm-btn" href="kit-gratuit.html">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Voir la checklist complète →
          </a>
        </div>

      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ── Fonctions show / hide ── */
  let shown = false;

  function showPopup() {
    if (shown) return;
    shown = true;
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    clearTriggers();
  }

  function hidePopup(converted) {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
    localStorage.setItem(LS_KEY, String(Date.now()));
    // Si pas de conversion, réactiver après 1 jour au lieu de 7
    if (!converted) localStorage.setItem(LS_KEY, String(Date.now() - (6 * 86400000)));
  }

  /* ── Déclencheurs ── */
  let timerID, scrollListener, exitListener;

  function clearTriggers() {
    clearTimeout(timerID);
    window.removeEventListener('scroll', scrollListener);
    document.removeEventListener('mouseleave', exitListener);
  }

  // 1. Timer 20s
  timerID = setTimeout(showPopup, 20000);

  // 2. Scroll 60%
  scrollListener = function () {
    const scrolled = window.scrollY + window.innerHeight;
    const total    = document.documentElement.scrollHeight;
    if (scrolled / total >= 0.60) showPopup();
  };
  window.addEventListener('scroll', scrollListener, { passive: true });

  // 3. Exit intent (desktop seulement)
  exitListener = function (e) {
    if (e.clientY <= 10) showPopup();
  };
  if (!('ontouchstart' in window)) {
    document.addEventListener('mouseleave', exitListener);
  }

  /* ── Fermeture ── */
  document.getElementById('sam-popup__close').addEventListener('click', () => hidePopup(false));
  document.getElementById('sam-popup__dismiss').addEventListener('click', () => hidePopup(false));
  overlay.addEventListener('click', e => { if (e.target === overlay) hidePopup(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && shown) hidePopup(false); });

  /* ── Soumission du formulaire ── */
  document.getElementById('sam-popup__submit').addEventListener('click', async function () {
    const prenom = document.getElementById('sam-popup-prenom').value.trim();
    const email  = document.getElementById('sam-popup-email').value.trim();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      document.getElementById('sam-popup-email').focus();
      document.getElementById('sam-popup-email').style.borderColor = '#C0392B';
      return;
    }

    const btn = this;
    btn.disabled = true;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .8s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Envoi…';

    try {
      await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName: prenom || 'ami(e)' }),
      });
    } catch (_) { /* silencieux */ }

    // Afficher confirmation
    document.getElementById('sam-popup__form-wrap').style.display = 'none';
    document.getElementById('sam-popup__confirm').style.display = 'block';
    localStorage.setItem(LS_KEY, String(Date.now())); // 7 jours complets après conversion
  });
})();
