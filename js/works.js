(() => {
  const genreOrder = ['Orchestra', 'Chamber', 'Solo', 'Vocal', 'Choir', 'Other'];
  const instrumentRules = [
    ['Bass Clarinet', /bass clarinet/i], ['Clarinet', /clarinet/i], ['Bassoon', /bassoon/i],
    ['Flute', /flute/i], ['Oboe', /oboe/i], ['Horn', /horn/i], ['Trumpet', /trumpet/i],
    ['Trombone', /trombone/i], ['Tuba', /tuba/i], ['Percussion', /percussion/i],
    ['Triangle', /triangle/i], ['Tambourine', /tambourine/i],
    ['Piano', /piano/i], ['Harpsichord', /harpsichord/i], ['Harp', /harp/i], ['Guitar', /guitar/i],
    ['Violin', /violin/i], ['Viola', /viola/i], ['Cello', /violoncello|cello/i], ['Double Bass', /double bass/i],
    ['Sheng', /sheng/i], ['Guzheng', /guzheng/i], ['Gayageum', /gayageum/i], ['Danso', /danso/i],
    ['Hoon', /hoon/i], ['Yanggeum', /yanggeum/i], ['Janggu', /janggu/i], ['Piri', /piri/i],
    ['Electronics', /electronic/i], ['Soprano', /soprano(?!\s+sheng)/i], ['Mezzo Soprano', /mezzo soprano/i],
    ['Tenor', /tenor/i], ['Baritone', /baritone/i], ['Choir', /choir/i]
  ];

  // These paths match the MP3 filenames supplied for the website. Once the
  // files are present in /audio, the players work without any further edits.
  const singleAudioMap = {
    'Adieu for Two Pianos': 'audio/Adieu-for-Two-Pianos.mp3',
    'Airs I for Flute and Piano': 'audio/Airs-for-Flute-and-Piano.mp3',
    'Arirang Fantasy for Clarinet Quintet': 'audio/Arirang-Fantasy-for-Clarinet-Quintet.mp3',
    'Chamber Symphony': 'audio/Chamber-Symphony.mp3',
    'Light Off for Piano and Strings': 'audio/Light-Off-for-Piano-and Strings.mp3',
    'Pungryu for Danso, Hoon, Yanggeum, and Jangu': 'audio/Pungryu.mp3'
  };

  // Multi-movement works stay as a single catalogue entry, with one track per
  // movement. Empty sources mean that movement audio has not yet been supplied.
  const movementMap = {
    'Chamber Mutation for Large Ensemble': [
      { label: 'I', source: 'audio/Chamber-Mutation-I.mp3' },
      { label: 'II', source: 'audio/Chamber-Mutation-II.mp3' },
      { label: 'III', source: 'audio/Chamber-Mutation-III.mp3' },
      { label: 'IV', source: 'audio/Chamber-Mutation-IV.mp3' }
    ],
    'The Change of Time for Large Ensemble': [
      { label: 'I', source: 'audio/The-Change-of-TIme-I.mp3' },
      { label: 'II', source: 'audio/The-Change-of-TIme-II.mp3' },
      { label: 'III', source: 'audio/The-Change-of-TIme-III.mp3' },
      { label: 'IV', source: 'audio/The-Change-of-TIme-IV.mp3' },
      { label: 'V', source: 'audio/The-Change-of-TIme-V.mp3' }
    ],
    'The Sorrow of the Lost II for String Trio': [
      { label: 'I', source: 'audio/The-Sorrow-of-the-Lost-for-String-Trio-I.mp3' },
      { label: 'II', source: 'audio/The-Sorrow-of-the-Lost-for-String-Trio-II.mp3' },
      { label: 'III', source: 'audio/The-Sorrow-of-the-Lost-for-String-Trio-III.mp3' }
    ],
    'Three Songs for Mezzo Soprano and 9 Instrumentalists': [
      { label: 'I', source: 'audio/Three-Songs-for-Mezzo-Soprano-and-Nine-Playes-1st-Mov.mp3' },
      { label: 'II', source: '' },
      { label: 'III', source: '' }
    ]
  };

  const state = { works: [], view: 'genre', genre: 'All', instrument: 'All', query: '' };
  const els = {
    list: document.getElementById('worksCatalogue'),
    count: document.getElementById('worksCount'),
    genre: document.getElementById('genreFilter'),
    instrument: document.getElementById('instrumentFilter'),
    search: document.getElementById('worksSearch'),
    viewButtons: [...document.querySelectorAll('[data-works-view]')]
  };

  if (!els.list) return;

  function parseTSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines.shift().split('\t');
    return lines.map((line, index) => {
      const values = line.split('\t');
      const item = Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
      item.id = index + 1;
      item.year = item.year ? Number(item.year) : null;
      item.instruments = getInstruments(item.instrumentation);
      item.tracks = parseTracks(item.tracks, item.title);
      item.audio = item.audio || singleAudioMap[item.title] || '';
      return item;
    });
  }

  function parseTracks(value = '', title = '') {
    const listedTracks = value.split(';').map(entry => {
      const [label = '', source = ''] = entry.split('|').map(part => part.trim());
      return label ? { label, source } : null;
    }).filter(Boolean);

    if (listedTracks.length) return listedTracks;
    return movementMap[title] || [];
  }

  function getInstruments(text = '') {
    const found = [];
    instrumentRules.forEach(([name, rule]) => {
      if (rule.test(text) && !found.includes(name)) found.push(name);
    });
    if (/\bstrings\b|string orchestra|string ensemble/i.test(text)) {
      ['Violin', 'Viola', 'Cello', 'Double Bass'].forEach(name => {
        if (!found.includes(name)) found.push(name);
      });
    }
    return found;
  }

  function populateFilters() {
    genreOrder.filter(g => state.works.some(w => w.genre === g)).forEach(g => {
      els.genre.add(new Option(g, g));
    });
    const instruments = [...new Set(state.works.flatMap(w => w.instruments))].sort((a, b) => a.localeCompare(b));
    instruments.forEach(i => els.instrument.add(new Option(i, i)));
  }

  function filteredWorks() {
    const q = state.query.toLowerCase();
    return state.works.filter(w => {
      if (state.genre !== 'All' && w.genre !== state.genre) return false;
      if (state.instrument !== 'All' && !w.instruments.includes(state.instrument)) return false;
      if (q && !`${w.title} ${w.instrumentation} ${w.commission}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function sortWorks(works) {
    return [...works].sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
  }

  function safeURL(value = '') {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      return /^https?:$/.test(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function audioMarkup(source = '', label = 'Recording') {
    const url = safeURL(source);
    if (!url) return '';
    return `<div class="single-audio">
      <span class="audio-label">${escapeHTML(label)}</span>
      <audio controls preload="none" controlslist="nodownload" src="${escapeHTML(url)}">Your browser does not support audio playback.</audio>
    </div>`;
  }

  function tracksMarkup(tracks = []) {
    if (!tracks.length) return '';

    return `<div class="movement-block">
      <p class="movement-heading">Movements</p>
      <ol class="movement-list">
        ${tracks.map(track => {
          const source = safeURL(track.source);
          return `<li class="movement-item">
            <span class="movement-label">${escapeHTML(track.label)}</span>
            ${source ? `<audio controls preload="none" controlslist="nodownload" src="${escapeHTML(source)}">Your browser does not support audio playback.</audio>` : '<span class="movement-unavailable">Audio not yet available</span>'}
          </li>`;
        }).join('')}
      </ol>
    </div>`;
  }

  function workMarkup(work) {
    const meta = [
      work.instrumentation,
      work.duration ? `Duration: ${work.duration}` : '',
      work.commission ? `Commission: ${work.commission}` : ''
    ].filter(Boolean).map(escapeHTML);

    const url = safeURL(work.url);
    if (url) {
      meta.push(`<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Video ↗</a>`);
    }

    return `<article class="catalogue-row">
      <div class="catalogue-year">${work.year || '—'}</div>
      <div class="catalogue-main">
        <h4>${escapeHTML(work.title)}</h4>
        ${meta.length ? `<p>${meta.join(' · ')}</p>` : ''}
        ${audioMarkup(work.audio)}
        ${tracksMarkup(work.tracks)}
      </div>
      <div class="catalogue-genre">${escapeHTML(work.genre)}</div>
    </article>`;
  }

  function render() {
    const works = filteredWorks();
    els.count.textContent = `${works.length} work${works.length === 1 ? '' : 's'}`;
    if (!works.length) {
      els.list.innerHTML = '<p class="works-empty">No works match the current filters.</p>';
      return;
    }

    const groups = new Map();
    if (state.view === 'genre') {
      genreOrder.forEach(g => {
        const items = sortWorks(works.filter(w => w.genre === g));
        if (items.length) groups.set(g, items);
      });
    } else {
      const years = [...new Set(works.map(w => w.year || 'Undated'))].sort((a, b) => {
        if (a === 'Undated') return 1;
        if (b === 'Undated') return -1;
        return b - a;
      });
      years.forEach(y => groups.set(String(y), sortWorks(works.filter(w => (w.year || 'Undated') === y))));
    }

    els.list.innerHTML = [...groups.entries()].map(([label, items]) => `
      <section class="catalogue-group">
        <div class="catalogue-group-head"><h3>${escapeHTML(label)}</h3><span>${items.length}</span></div>
        <div class="catalogue-items">${items.map(workMarkup).join('')}</div>
      </section>`).join('');
  }

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  els.genre.addEventListener('change', e => { state.genre = e.target.value; render(); });
  els.instrument.addEventListener('change', e => { state.instrument = e.target.value; render(); });
  els.search.addEventListener('input', e => { state.query = e.target.value.trim(); render(); });
  els.viewButtons.forEach(btn => btn.addEventListener('click', () => {
    state.view = btn.dataset.worksView;
    els.viewButtons.forEach(b => b.classList.toggle('is-active', b === btn));
    render();
  }));

  fetch('data/works.tsv?v=20260901-2')
    .then(r => { if (!r.ok) throw new Error('Catalogue data could not be loaded.'); return r.text(); })
    .then(text => {
      state.works = parseTSV(text);
      populateFilters();
      render();
    })
    .catch(() => {
      els.list.innerHTML = '<p class="works-empty">The works catalogue is temporarily unavailable.</p>';
    });
})();
