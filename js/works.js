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
      return item;
    });
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

  fetch('data/works.tsv?v=20260831-2')
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
