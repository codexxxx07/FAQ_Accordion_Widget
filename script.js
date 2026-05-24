/**
 * FAQ Accordion Widget — performance-optimized
 * - Event delegation (single listener on accordion)
 * - Cached DOM refs, tracked active item (no full-list scans)
 * - CSS-driven open/close animations (grid rows + opacity)
 * - rAF scheduling instead of forced layout reads
 */

(function () {
  'use strict';

  const THEME_STORAGE_KEYS = ['faq-theme', 'theme', 'color-theme', 'darkMode'];
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const PANEL_CLOSE_MS = reducedMotion ? 0 : 400;

  // ─── Theme (always light on load; toggle does not persist) ───────────────────

  function clearThemeStorage() {
    try {
      for (let i = 0; i < THEME_STORAGE_KEYS.length; i++) {
        const key = THEME_STORAGE_KEYS[i];
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }
    } catch (_) {
      /* storage unavailable */
    }
  }

  function forceLightMode() {
    root.classList.remove('dark');
    document.body?.classList.remove('dark');
    root.style.colorScheme = 'light';
    clearThemeStorage();
  }

  function setTheme(theme) {
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
    if (!isDark) {
      document.body?.classList.remove('dark');
      clearThemeStorage();
    }
  }

  forceLightMode();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.classList.contains('dark') ? 'light' : 'dark';
      setTheme(next);
      themeToggle.setAttribute(
        'aria-label',
        next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    });
  }

  // ─── Accordion ───────────────────────────────────────────────────────────────

  const accordion = document.getElementById('faq-accordion');
  if (!accordion) return;

  const itemNodes = accordion.querySelectorAll('.accordion-item');
  const itemRefs = new Array(itemNodes.length);
  const refByItem = new Map();
  let activeRef = null;

  for (let i = 0; i < itemNodes.length; i++) {
    const item = itemNodes[i];
    const ref = {
      item,
      trigger: item.querySelector('.accordion-trigger'),
      panel: item.querySelector('.accordion-panel'),
      hideTimer: 0,
    };
    itemRefs[i] = ref;
    refByItem.set(item, ref);
  }

  function hidePanelWhenClosed(ref) {
    if (!ref.panel.classList.contains('is-open')) {
      ref.panel.setAttribute('hidden', '');
    }
  }

  function closeItem(ref) {
    const { item, trigger, panel } = ref;
    if (!item.classList.contains('is-active')) return;

    item.classList.remove('is-active');
    panel.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');

    if (ref.hideTimer) {
      clearTimeout(ref.hideTimer);
      ref.hideTimer = 0;
    }

    if (reducedMotion || PANEL_CLOSE_MS === 0) {
      hidePanelWhenClosed(ref);
      return;
    }

    const onTransitionEnd = (e) => {
      if (e.target !== panel || e.propertyName !== 'grid-template-rows') return;
      panel.removeEventListener('transitionend', onTransitionEnd);
      if (ref.hideTimer) {
        clearTimeout(ref.hideTimer);
        ref.hideTimer = 0;
      }
      hidePanelWhenClosed(ref);
    };

    panel.addEventListener('transitionend', onTransitionEnd);
    ref.hideTimer = window.setTimeout(() => {
      panel.removeEventListener('transitionend', onTransitionEnd);
      ref.hideTimer = 0;
      hidePanelWhenClosed(ref);
    }, PANEL_CLOSE_MS);
  }

  function openItem(ref) {
    const { item, trigger, panel } = ref;

    panel.removeAttribute('hidden');

    const applyOpen = () => {
      item.classList.add('is-active');
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    };

    if (reducedMotion) {
      applyOpen();
      return;
    }

    requestAnimationFrame(applyOpen);
  }

  accordion.addEventListener('click', (e) => {
    const trigger = e.target.closest('.accordion-trigger');
    if (!trigger) return;

    const ref = refByItem.get(trigger.closest('.accordion-item'));
    if (!ref) return;

    if (ref.item.classList.contains('is-active')) {
      closeItem(ref);
      if (activeRef === ref) activeRef = null;
      return;
    }

    if (activeRef) closeItem(activeRef);
    openItem(ref);
    activeRef = ref;
  });
})();
