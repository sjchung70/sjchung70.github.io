(() => {
  const AUDIO_BASE = 'https://lyiiafoexgsbkgrvlwjz.supabase.co/storage/v1/object/public/audio';
  const media = document.querySelector('#media .section-content');
  if (!media) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'css/media.css?v=20260902-1';
  document.head.appendChild(stylesheet);

  const audioURL = filename => `${AUDIO_BASE}/${encodeURIComponent(filename)}`;
  const esc = value => String(value).replace(/[&<>'\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '\"': '&quot;' }[c]));

  const cards = [
    {
      title: 'Two Korean Melodies',
      meta: 'for Piano · 2026',
      tracks: [
        ['I', 'Two-Korean-Melodies-1.mp3'],
        ['II', 'Two-Korean-Melodies-2.mp3']
      ]
    },
    {
      title: 'Scattered Air I',
      meta: 'for Viola and Piano · 2022',
      video: 'https://youtu.be/p3aLNAbfdY8'
    },
    {
      title: 'Serenade for Strings',
      meta: 'for String Orchestra · 2007',
      video: 'https://youtu.be/Yd7SyVjKW7E'
    },
    {
      title: 'The Lonely Outcry',
      meta: 'for Viola Solo and Orchestra · 2016',
      tracks: [
        ['I', 'The-Lonely-Outcry-for-Viola-and-Orchestra-I.mp3'],
        ['II', 'The-Lonely-Outcry-for-Viola-and-Orchestra-II.mp3']
      ]
    },
    {
      title: 'Chamber Mutation',
      meta: 'for Large Ensemble · 2008',
      tracks: [
        ['I', 'Chamber-Mutation-I.mp3'],
        ['II', 'Chamber-Mutation-II.mp3'],
        ['III', 'Chamber-Mutation-III.mp3'],
        ['IV', 'Chamber-Mutation-IV.mp3']
      ]
    },
    {
      title: 'The Wells of Silence',
      meta: 'for 2 Violins, Viola, Violoncello and Piano · 2022',
      video: 'https://youtu.be/KyxNFQlH4-E'
    },
    {
      title: 'Chamber Symphony',
      meta: 'for Orchestra · 2014',
      audio: 'Chamber-Symphony.mp3'
    },
    {
      title: 'Das hohepriesterliche Gebet für a Cappella',
      meta: 'for Choir · 1997',
      audio: 'Das-Hohepriesterliche-Gebet.mp3'
    }
  ];

  const cardMarkup = card => {
    let mediaMarkup = '';
    if (card.tracks) {
      mediaMarkup = `<div class="media-tracks">${card.tracks.map(([label, filename]) => `<div class="media-track"><span class="media-track-label">${esc(label)}</span><audio controls preload="none" controlslist="nodownload" src="${esc(audioURL(filename))}">Your browser does not support audio playback.</audio></div>`).join('')}</div>`;
    } else if (card.audio) {
      mediaMarkup = `<div class="media-single"><span class="media-audio-label">Recording</span><audio controls preload="none" controlslist="nodownload" src="${esc(audioURL(card.audio))}">Your browser does not support audio playback.</audio></div>`;
    } else if (card.video) {
      mediaMarkup = `<div class="media-action"><a class="media-watch" href="${esc(card.video)}" target="_blank" rel="noopener noreferrer">Watch performance ↗</a></div>`;
    } else {
      mediaMarkup = `<p class="media-pending">${esc(card.pending || 'Media forthcoming')}</p>`;
    }

    return `<article class="media-card"><h3>${esc(card.title)}</h3><p class="media-meta">${esc(card.meta)}</p>${mediaMarkup}</article>`;
  };

  media.innerHTML = `
    <p class="section-label">Media</p>
    <h2>Listen · Watch</h2>
    <p class="lead media-intro">Selected recordings and performances representing different periods and facets of CHUNG Seung Jae’s musical work.</p>
    <div class="media-grid">${cards.map(cardMarkup).join('')}</div>
    <div class="media-footer"><a class="media-youtube" href="https://www.youtube.com/@sjchung70" target="_blank" rel="noopener noreferrer">More performances on YouTube ↗</a></div>`;

  const eventsScript = document.createElement('script');
  eventsScript.src = 'js/events.js?v=20260902-1';
  eventsScript.defer = true;
  document.head.appendChild(eventsScript);
})();