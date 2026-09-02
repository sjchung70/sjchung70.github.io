(() => {
  const CORE_SCRIPT = 'js/works-core.js?v=20260902-1';
  const AUDIO_BASE = 'https://lyiiafoexgsbkgrvlwjz.supabase.co/storage/v1/object/public/audio';

  const extraTrackRules = [
    {
      key: 'lonely-outcry',
      test: title => {
        const t = normalizeTitle(title);
        return t.includes('thelonelyoutcry') && t.includes('viola') && t.includes('orchestra');
      },
      heading: 'Movements',
      tracks: [
        ['I', 'The-Lonely-Outcry-for-Viola-and-Orchestra-I.mp3'],
        ['II', 'The-Lonely-Outcry-for-Viola-and-Orchestra-II.mp3']
      ]
    },
    {
      key: 'in-memoriam-ilhan-yu',
      test: title => {
        const t = normalizeTitle(title);
        return t.includes('inmemoriam') && t.includes('ilhanyu');
      },
      heading: 'Sections',
      tracks: [
        ['Prelude', 'In-Memoriam-Prelude-1.mp3'],
        ['Song I', 'In-Memoriam-Song-I-2.mp3'],
        ['Interlude I', 'In-Memoriam-Interlude-I-3.mp3'],
        ['Song II', 'In-Memoriam-Song-II-4.mp3'],
        ['Interlude II', 'In-Memoriam-Interlude-II-5.mp3'],
        ['Song III', 'In-Memoriam-Song-III-6.mp3'],
        ['Postlude', 'In-Memoriam-Postlude-7.mp3']
      ]
    }
  ];

  function normalizeTitle(value = '') {
    return String(value).trim().toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
  }

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function audioURL(filename) {
    return `${AUDIO_BASE}/${encodeURIComponent(filename)}`;
  }

  function extraMarkup(rule) {
    return `<div class="movement-block" data-extra-audio="${escapeHTML(rule.key)}">
      <p class="movement-heading">${escapeHTML(rule.heading)}</p>
      <ol class="movement-list">
        ${rule.tracks.map(([label, filename]) => `<li class="movement-item">
          <span class="movement-label">${escapeHTML(label)}</span>
          <audio controls preload="none" controlslist="nodownload" src="${escapeHTML(audioURL(filename))}">Your browser does not support audio playback.</audio>
        </li>`).join('')}
      </ol>
    </div>`;
  }

  function installExtraPlayers() {
    const catalogue = document.getElementById('worksCatalogue');
    if (!catalogue) return;

    const renderExtras = () => {
      catalogue.querySelectorAll('.catalogue-row').forEach(row => {
        const title = row.querySelector('.catalogue-main h4')?.textContent || '';
        const main = row.querySelector('.catalogue-main');
        if (!title || !main) return;

        extraTrackRules.forEach(rule => {
          if (!rule.test(title)) return;
          if (main.querySelector(`[data-extra-audio="${rule.key}"]`)) return;
          main.insertAdjacentHTML('beforeend', extraMarkup(rule));
        });
      });
    };

    const observer = new MutationObserver(renderExtras);
    observer.observe(catalogue, { childList: true, subtree: true });
    renderExtras();
  }

  const core = document.createElement('script');
  core.src = CORE_SCRIPT;
  core.onload = installExtraPlayers;
  core.onerror = () => {
    const catalogue = document.getElementById('worksCatalogue');
    if (catalogue) catalogue.innerHTML = '<p class="works-empty">The works catalogue is temporarily unavailable.</p>';
  };
  document.head.appendChild(core);
})();