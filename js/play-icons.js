(() => {
  function applyPlayIcons(root = document) {
    root.querySelectorAll('a').forEach(link => {
      const text = (link.textContent || '').trim();

      if (/^Video\s*↗?$/.test(text)) {
        link.textContent = '▶ Video';
        link.classList.add('play-link');
        link.setAttribute('aria-label', 'Play video');
      }

      if (/^YouTube\s*·\s*Seung Jae CHUNG\s*↗?$/.test(text)) {
        link.textContent = '▶ YouTube · Seung Jae CHUNG';
        link.classList.add('play-link');
      }
    });
  }

  applyPlayIcons();

  const observer = new MutationObserver(() => applyPlayIcons());
  observer.observe(document.body, { childList: true, subtree: true });
})();
