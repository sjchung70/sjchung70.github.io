(() => {
  const CORE_SCRIPT = 'js/works-core.js?v=20260902-1';
  const AUDIO_BASE = 'https://lyiiafoexgsbkgrvlwjz.supabase.co/storage/v1/object/public/audio';

  // The uploaded Excel workbook remains the source of truth, but ChatGPT converts
  // it to data/works.tsv when updating the site. Force the catalogue core to use
  // that freshly generated TSV instead of an older binary Excel file in GitHub.
  const nativeFetch = window.fetch.bind(window);
  const excelCataloguePattern = /data\/(?:List(?:%20| )of(?:%20| )Works_CHUNG(?:%20| )Seung(?:%20| )Jae(?:%20| )2\.xlsx)/i;
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : (input && input.url) ? input.url : String(input || '');
    if (excelCataloguePattern.test(url)) {
      return Promise.resolve(new Response('', { status: 404, statusText: 'Use latest TSV catalogue' }));
    }
    return nativeFetch(input, init);
  };

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

  const extraSingleRules = [
    {
      key: 'autumn-letter',
      test: title => normalizeTitle(title).startsWith(normalizeTitle('Autumn Letter')),
      filename: 'Autumn Letter.mp3'
    },
    {
      key: 'namul-norae',
      test: title => normalizeTitle(title).startsWith(normalizeTitle('Namul Norae')),
      filename: 'Namul-Norae-for-Violin-Solo.mp3'
    },
    {
      key: 'rage',
      test: title => normalizeTitle(title).startsWith(normalizeTitle('Rage')),
      filename: 'Rage.mp3'
    }
  ];

  function normalizeTitle(value = '') {
    return String(value).trim().toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
  }

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>'\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '\"': '&quot;' }[c]));
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

  function singleMarkup(rule) {
    return `<div class="single-audio" data-extra-audio="${escapeHTML(rule.key)}">
      <span class="audio-label">Recording</span>
      <audio controls preload="none" controlslist="nodownload" src="${escapeHTML(audioURL(rule.filename))}">Your browser does not support audio playback.</audio>
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

        extraSingleRules.forEach(rule => {
          if (!rule.test(title)) return;
          if (main.querySelector(`[data-extra-audio="${rule.key}"]`)) return;
          if (main.querySelector('.single-audio')) return;
          main.insertAdjacentHTML('beforeend', singleMarkup(rule));
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