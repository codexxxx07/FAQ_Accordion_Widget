/**
 * FAQ Accordion Widget
 * - Single-open accordion behavior
 * - Smooth height + opacity transitions
 * - Dark mode toggle with localStorage persistence
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'faq-theme';
  const accordion = document.getElementById('faq-accordion');
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // ─── Dark mode ───────────────────────────────────────────────────────────────

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function initTheme() {
    applyTheme(getPreferredTheme());
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  initTheme();

  // ─── Accordion ───────────────────────────────────────────────────────────────

  if (!accordion) return;

  const items = Array.from(accordion.querySelectorAll('.accordion-item'));

  /**
   * Close a single accordion item.
   */
  function closeItem(item) {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');

    if (!trigger || !panel) return;

    item.classList.remove('is-active');
    item.classList.remove(
      'ring-2',
      'ring-indigo-500/20',
      'border-indigo-200',
      'bg-indigo-50/30',
      'dark:border-indigo-800',
      'dark:bg-indigo-950/40'
    );
    panel.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-950/30');

    // Wait for transition before hiding from assistive tech
    panel.addEventListener(
      'transitionend',
      function onEnd(e) {
        if (e.propertyName !== 'grid-template-rows') return;
        if (!panel.classList.contains('is-open')) {
          panel.setAttribute('hidden', '');
        }
        panel.removeEventListener('transitionend', onEnd);
      },
      { once: true }
    );
  }

  /**
   * Open a single accordion item.
   */
  function openItem(item) {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');

    if (!trigger || !panel) return;

    panel.removeAttribute('hidden');
    // Force reflow so the browser picks up the open state for animation
    void panel.offsetHeight;

    item.classList.add('is-active');
    item.classList.add(
      'ring-2',
      'ring-indigo-500/20',
      'border-indigo-200',
      'bg-indigo-50/30',
      'dark:border-indigo-800',
      'dark:bg-indigo-950/40'
    );
    panel.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.add('bg-indigo-50/50', 'dark:bg-indigo-950/30');
  }

  /**
   * Close every item except optionally one to keep open.
   */
  function closeAll(exceptItem) {
    items.forEach((item) => {
      if (item !== exceptItem && item.classList.contains('is-active')) {
        closeItem(item);
      }
    });
  }

  /**
   * Toggle item — only one open at a time.
   */
  function toggleItem(item) {
    const isOpen = item.classList.contains('is-active');

    if (isOpen) {
      closeItem(item);
      return;
    }

    closeAll(item);
    openItem(item);
  }

  // Bind click handlers
  items.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => toggleItem(item));

    // Keyboard: Enter / Space already handled by button element
  });

  // Optional: open first item on load for demo (commented out — all collapsed by default)
  // openItem(items[0]);
})();
