(() => {
  const EXCEL_PATH = 'data/List%20of%20Works_CHUNG%20Seung%20Jae%202.xlsx';
  const SHEETJS_URL = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
  const SUPABASE_AUDIO_BASE = 'https://lyiiafoexgsbkgrvlwjz.supabase.co/storage/v1/object/public/audio';
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
    ['Electronics', /electronic/i], ['Soprano', /soprano(?!\s+sheng)/i], ['Mezzo Soprano', /mezzo[ -]?soprano/i],
    ['Tenor', /tenor/i], ['Baritone', /baritone/i], ['Choir', /choir|satb/i]
  ];

  const headerAliases = {
    title: ['title', 'worktitle', 'titleofwork', 'work', '작품명', '제목'],
    year: ['year', 'compositionyear', 'composed', '연도', '작곡연도'],
    genre: ['genre', 'category', '장르', '분류'],
    instrumentation: ['instrumentation', 'instruments', 'instrument', 'scoring', '편성', '악기편성'],
    duration: ['duration', 'length', 'time', '연주시간', '소요시간'],
    commission: ['commission', 'commissionedby', 'commissioner', '위촉', '위촉단체'],
    url: ['url', 'youtube', 'youtubelink', 'video', 'videolink', 'link', '유튜브', '영상'],
    audio: ['audio', 'recording', 'audiolink', '음원'],
    tracks: ['tracks', 'movements', 'movementaudio', '악장음원']
  };

  const movementRules = [
    {
      test: title => normalizeTitle(title).includes('chambermutation'),
      tracks: [
        { label: 'I', source: 'audio/Chamber-Mutation-I.mp3' },
        { label: 'II', source: 'audio/Chamber-Mutation-II.mp3' },
        { label: 'III', source: 'audio/Chamber-Mutation-III.mp3' },
        { label: 'IV', source: 'audio/Chamber-Mutation-IV.mp3' }
      ]
    },
    {
      test: title => normalizeTitle(title).includes('thechangeoftime'),
      tracks: [
        { label: 'I', source: 'audio/The-Change-of-TIme-I.mp3' },
        { label: 'II', source: 'audio/The-Change-of-TIme-II.mp3' },
        { label: 'III', source: 'audio/The-Change-of-TIme-III.mp3' },
        { label: 'IV', source: 'audio/The-Change-of-TIme-IV.mp3' },
        { label: 'V', source: 'audio/The-Change-of-TIme-V.mp3' }
      ]
    },
    {
      test: title => {
        const t = normalizeTitle(title);
        return t.includes('thesorrowofthelost') && t.includes('stringtrio');
      },
      tracks: [
        { label: 'I', source: 'audio/The-Sorrow-of-the-Lost-for-String-Trio-I.mp3' },
        { label: 'II', source: 'audio/The-Sorrow-of-the-Lost-for-String-Trio-II.mp3' },
        { label: 'III', source: 'audio/The-Sorrow-of-the-Lost-for-String-Trio-III.mp3' }
      ]
    },
    {
      test: title => normalizeTitle(title).includes('threesongsformezzosoprano'),
      tracks: [
        { label: 'I', source: 'audio/Three-Songs-for-Mezzo-Soprano-and-Nine-Playes-1st-Mov.mp3' },
        { label: 'II', source: 'audio/Three-Songs-for-Mezzo-Soprano-and-Nine-Playes-2nd-Mov.mp3' },
        { label: 'III', source: 'audio/Three-Songs-for-Mezzo-Soprano-and-Nine-Playes-3rd-Mov.mp3' }
      ]
    },
    {
      test: title => normalizeTitle(title) === normalizeTitle('Vertical Mutation for 8 Instrumentalists'),
      tracks: [
        { label: 'I', source: 'audio/Vertical-Mutation-1st Mov..mp3' },
        { label: 'II', source: 'audio/Vertical-Mutation-2nd Mov..mp3' },
        { label: 'III', source: 'audio/Vertical-Mutation-3rd Mov..mp3' }
      ]
    }
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

  function normalizeKey(value = '') {
    return String(value).trim().toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
  }

  function normalizeTitle(value = '') {
    return String(value).trim().toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
  }

  function canonicalHeader(value = '') {
    const key = normalizeKey(value);
    if (!key) return '';
    for (const [field, aliases] of Object.entries(headerAliases)) {
      if (aliases.some(alias => key === normalizeKey(alias) || key.includes(normalizeKey(alias)))) return field;
    }
    return '';
  }

  function normalizeGenre(value = '') {
    const key = normalizeKey(value);
    if (!key) return 'Other';
    if (key.includes('orchestra') || key.includes('orchestral') || key.includes('관현악')) return 'Orchestra';
    if (key.includes('chamber') || key.includes('실내악')) return 'Chamber';
    if (key.includes('solo') || key.includes('독주')) return 'Solo';
    if (key.includes('vocal') || key.includes('voice') || key.includes('성악')) return 'Vocal';
    if (key.includes('choir') || key.includes('choral') || key.includes('합창')) return 'Choir';
    if (key.includes('other') || key.includes('기타')) return 'Other';
    return 'Other';
  }

  function parseYear(value) {
    if (typeof value === 'number' && value >= 1900 && value <= 2100) return Math.round(value);
    const match = String(value || '').match(/(?:19|20)\d{2}/);
    return match ? Number(match[0]) : null;
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

  function singleAudioForTitle(title = '') {
    const t = normalizeTitle(title);
    if (t === normalizeTitle('Adieu for Two Pianos')) return 'audio/Adieu-for-Two-Pianos.mp3';
    if (t === normalizeTitle('Airs I for Flute and Piano') || t === normalizeTitle('Airs for Flute and Piano')) return 'audio/Airs-for-Flute-and-Piano.mp3';
    if (t.includes('arirangfantasyforclarinetquintet')) return 'audio/Arirang-Fantasy-for-Clarinet-Quintet.mp3';
    if (t === normalizeTitle('Chamber Symphony')) return 'audio/Chamber-Symphony.mp3';
    if (t === normalizeTitle('Light Off for Piano and Strings')) return 'audio/Light-Off-for-Piano-and Strings.mp3';
    if (t.startsWith(normalizeTitle('Pungryu'))) return 'audio/Pungryu.mp3';
    if (t === normalizeTitle('Untitleds; Silence Is So Accurate for Viola and Piano') || t === normalizeTitle('Untitleds for Viola and Piano')) return 'audio/Untitleds-for-Viola-and-Piano.mp3';
    if (t === normalizeTitle('Well-tempered Quartet for Strings')) return 'audio/Well-tempered-Quartet-for-Strings.mp3';
    if (t === normalizeTitle('Yu-Sahng for Piano Four Hands') || t === normalizeTitle('Yu-Sahng for Four Hands Piano')) return 'audio/Yu-Sahng-for-Four-Hands-Piano.mp3';
    return '';
  }

  function tracksForTitle(title = '') {
    const match = movementRules.find(rule => rule.test(title));
    return match ? match.tracks.map(track => ({ ...track })) : [];
  }

  function parseTracks(value = '', title = '') {
    const listed = String(value || '').split(';').map(entry => {
      const [label = '', source = ''] = entry.split('|').map(part => part.trim());
      return label ? { label, source } : null;
    }).filter(Boolean);
    return listed.length ? listed : tracksForTitle(title);
  }

  function finalizeWork(work, id) {
    const item = {
      id,
      title: String(work.title || '').trim(),
      year: parseYear(work.year),
      genre: normalizeGenre(work.genre),
      instrumentation: String(work.instrumentation || '').trim(),
      duration: String(work.duration || '').trim(),
      commission: String(work.commission || '').trim(),
      url: String(work.url || '').trim(),
      audio: String(work.audio || '').trim(),
      tracks: String(work.tracks || '').trim()
    };
    item.instruments = getInstruments(item.instrumentation);
    item.tracks = parseTracks(item.tracks, item.title);
    item.audio = item.audio || singleAudioForTitle(item.title);
    return item;
  }

  function cellDisplay(sheet, row, col) {
    const address = XLSX.utils.encode_cell({ r: row, c: col });
    const cell = sheet[address];
    if (!cell) return '';
    if (cell.w !== undefined && cell.w !== null) return String(cell.w).trim();
    if (cell.v !== undefined && cell.v !== null) return String(cell.v).trim();
    return '';
  }

  function cellLinkOrDisplay(sheet, row, col) {
    const address = XLSX.utils.encode_cell({ r: row, c: col });
    const cell = sheet[address];
    if (!cell) return '';
    if (cell.l && cell.l.Target) return String(cell.l.Target).trim();
    return cellDisplay(sheet, row, col);
  }

  function findHeader(sheet) {
    if (!sheet['!ref']) return null;
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const maxRow = Math.min(range.e.r, range.s.r + 30);
    for (let r = range.s.r; r <= maxRow; r += 1) {
      const columns = {};
      for (let c = range.s.c; c <= range.e.c; c += 1) {
        const field = canonicalHeader(cellDisplay(sheet, r, c));
        if (field && columns[field] === undefined) columns[field] = c;
      }
      const score = Object.keys(columns).length;
      if (columns.title !== undefined && score >= 2) return { row: r, columns, range };
    }
    return null;
  }

  function parseSheet(sheet) {
    const header = findHeader(sheet);
    if (!header) return [];
    const works = [];
    for (let r = header.row + 1; r <= header.range.e.r; r += 1) {
      const get = field => {
        const col = header.columns[field];
        if (col === undefined) return '';
        return field === 'url' || field === 'audio' ? cellLinkOrDisplay(sheet, r, col) : cellDisplay(sheet, r, col);
      };
      const title = get('title');
      if (!title) continue;
      works.push(finalizeWork({
        title,
        year: get('year'),
        genre: get('genre'),
        instrumentation: get('instrumentation'),
        duration: get('duration'),
        commission: get('commission'),
        url: get('url'),
        audio: get('audio'),
        tracks: get('tracks')
      }, works.length + 1));
    }
    return works;
  }

  function parseWorkbook(workbook) {
    let best = [];
    workbook.SheetNames.forEach(name => {
      const works = parseSheet(workbook.Sheets[name]);
      if (works.length > best.length) best = works;
    });
    return best;
  }

  function parseTSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines.shift().split('\t');
    return lines.map((line, index) => {
      const values = line.split('\t');
      const raw = Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
      return finalizeWork(raw, index + 1);
    }).filter(item => item.title);
  }

  function populateFilters() {
    while (els.genre.options.length > 1) els.genre.remove(1);
    while (els.instrument.options.length > 1) els.instrument.remove(1);
    genreOrder.filter(g => state.works.some(w => w.genre === g)).forEach(g => els.genre.add(new Option(g, g)));
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

  function resolveAudioSource(source = '') {
    const value = String(source || '').trim();
    if (!value) return '';
    if (/^audio\//i.test(value)) {
      const filename = value.replace(/^audio\//i, '');
      return `${SUPABASE_AUDIO_BASE}/${encodeURIComponent(filename)}`;
    }
    return value;
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
    const url = safeURL(resolveAudioSource(source));
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
          const source = safeURL(resolveAudioSource(track.source));
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
    if (url) meta.push(`<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Video ↗</a>`);
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
    return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function loadSheetJS() {
    if (window.XLSX) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SHEETJS_URL;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Spreadsheet reader could not be loaded.'));
      document.head.appendChild(script);
    });
  }

  function applyWorks(works) {
    if (!works.length) throw new Error('No works found in catalogue.');
    state.works = works;
    populateFilters();
    render();
  }

  async function loadCatalogue() {
    try {
      await loadSheetJS();
      const response = await fetch(`${EXCEL_PATH}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Excel catalogue could not be loaded.');
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellLinks: true });
      applyWorks(parseWorkbook(workbook));
    } catch (excelError) {
      console.warn('Falling back to TSV catalogue:', excelError);
      try {
        const response = await fetch(`data/works.tsv?v=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Fallback catalogue could not be loaded.');
        applyWorks(parseTSV(await response.text()));
      } catch (fallbackError) {
        console.error(fallbackError);
        els.list.innerHTML = '<p class="works-empty">The works catalogue is temporarily unavailable.</p>';
      }
    }
  }

  els.genre.addEventListener('change', e => { state.genre = e.target.value; render(); });
  els.instrument.addEventListener('change', e => { state.instrument = e.target.value; render(); });
  els.search.addEventListener('input', e => { state.query = e.target.value.trim(); render(); });
  els.viewButtons.forEach(btn => btn.addEventListener('click', () => {
    state.view = btn.dataset.worksView;
    els.viewButtons.forEach(b => b.classList.toggle('is-active', b === btn));
    render();
  }));

  loadCatalogue();
})();