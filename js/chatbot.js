(function () {
  'use strict';

  const SUGGESTIONS = [
    '🔥 Audit ERP',
    '📋 Réglementation',
    '🧯 Extincteurs',
    '📘 Formation',
    '📄 Devis gratuit',
  ];

  const WELCOME = 'Bonjour ! Je suis **Sam**, votre assistant expert en sécurité incendie. Comment puis-je vous aider aujourd\'hui ? (réglementation ERP, formations, audits, équipements...)';

  let messages = [];
  let isOpen = false;

  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'sam-chat-widget';
    widget.innerHTML = `
      <div id="sam-chat-window" role="dialog" aria-label="Chat Sam Incendie" aria-hidden="true">
        <div id="sam-chat-header">
          <div class="sam-chat-avatar" aria-hidden="true">🔥</div>
          <div class="sam-chat-header-info">
            <strong>Sam — Expert Incendie</strong>
            <span>samincendie.fr</span>
          </div>
          <div class="sam-chat-status-dot" title="En ligne"></div>
        </div>

        <div id="sam-chat-messages" aria-live="polite" aria-label="Messages"></div>

        <div id="sam-chat-suggestions"></div>

        <div id="sam-chat-input-area">
          <textarea
            id="sam-chat-input"
            placeholder="Posez votre question..."
            rows="1"
            aria-label="Votre message"
            maxlength="1000"
          ></textarea>
          <button id="sam-chat-send" aria-label="Envoyer" disabled>
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>

        <div id="sam-chat-footer">
          Propulsé par Mistral AI · <a href="mailto:contact@samincendie.fr">Contact</a> · <a href="index.html#contact">Devis gratuit</a>
        </div>
      </div>

      <button id="sam-chat-toggle" aria-label="Ouvrir le chat" aria-expanded="false">
        <svg class="icon-chat" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        <svg class="icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        <span id="sam-chat-badge" aria-label="1 nouveau message">1</span>
      </button>
    `;
    document.body.appendChild(widget);
  }

  function renderSuggestions(show) {
    const el = document.getElementById('sam-chat-suggestions');
    if (!el) return;
    if (!show) { el.innerHTML = ''; return; }
    el.innerHTML = SUGGESTIONS.map(s =>
      `<button class="sam-suggestion" type="button">${s}</button>`
    ).join('');
    el.querySelectorAll('.sam-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.replace(/^[\p{Emoji}\s]+/u, '').trim();
        sendMessage(text);
        el.innerHTML = '';
      });
    });
  }

  function addMessage(role, text) {
    const container = document.getElementById('sam-chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `sam-msg ${role}`;
    div.innerHTML = formatText(text);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  function addRawMessage(role, html) {
    const container = document.getElementById('sam-chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `sam-msg ${role}`;
    div.innerHTML = html;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function formatText(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function showTyping() {
    const container = document.getElementById('sam-chat-messages');
    if (!container) return null;
    const div = document.createElement('div');
    div.className = 'sam-msg bot typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  async function sendMessage(text) {
    text = text.trim();
    if (!text) return;

    const input = document.getElementById('sam-chat-input');
    const sendBtn = document.getElementById('sam-chat-send');
    if (input) { input.value = ''; input.style.height = 'auto'; }
    if (sendBtn) sendBtn.disabled = true;

    messages.push({ role: 'user', content: text });
    addMessage('user', text);
    renderSuggestions(false);

    const typingEl = showTyping();

    try {
      const res = await fetch('https://samincendie.sambebel75.workers.dev/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      const data = await res.json();
      if (typingEl) typingEl.remove();

      if (data.reply) {
        messages.push({ role: 'assistant', content: data.reply });
        addMessage('bot', data.reply);
      } else {
        addRawMessage('bot', 'Désolé, une erreur s\'est produite. Contactez-nous à <a href="mailto:contact@samincendie.fr">contact@samincendie.fr</a>.');
      }
    } catch {
      if (typingEl) typingEl.remove();
      addRawMessage('bot', 'Connexion impossible. Réessayez ou écrivez-nous à <a href="mailto:contact@samincendie.fr">contact@samincendie.fr</a>.');
    }

    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
  }

  function toggleChat() {
    const widget = document.getElementById('sam-chat-widget');
    const window_ = document.getElementById('sam-chat-window');
    const toggleBtn = document.getElementById('sam-chat-toggle');
    const badge = document.getElementById('sam-chat-badge');

    isOpen = !isOpen;
    widget.classList.toggle('open', isOpen);
    window_.setAttribute('aria-hidden', String(!isOpen));
    toggleBtn.setAttribute('aria-expanded', String(isOpen));

    if (badge) badge.remove();

    if (isOpen && messages.length === 0) {
      messages.push({ role: 'assistant', content: WELCOME });
      addMessage('bot', WELCOME);
      renderSuggestions(true);
      setTimeout(() => document.getElementById('sam-chat-input')?.focus(), 300);
    }
  }

  function init() {
    createWidget();

    const toggleBtn = document.getElementById('sam-chat-toggle');
    const input = document.getElementById('sam-chat-input');
    const sendBtn = document.getElementById('sam-chat-send');

    toggleBtn?.addEventListener('click', toggleChat);

    input?.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
      if (sendBtn) sendBtn.disabled = !this.value.trim();
    });

    input?.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn?.disabled) sendMessage(this.value);
      }
    });

    sendBtn?.addEventListener('click', () => {
      const val = document.getElementById('sam-chat-input')?.value;
      if (val) sendMessage(val);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) toggleChat();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
