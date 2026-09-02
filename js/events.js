(() => {
  if (document.getElementById('events')) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'css/events.css?v=20260902-2';
  document.head.appendChild(stylesheet);

  const nav = document.querySelector('.nav');
  const contactLink = nav?.querySelector('a[href="#contact"]');
  if (nav && contactLink && !nav.querySelector('a[href="#events"]')) {
    const eventsLink = document.createElement('a');
    eventsLink.href = '#events';
    eventsLink.textContent = 'Events';
    nav.insertBefore(eventsLink, contactLink);
  }

  const contact = document.getElementById('contact');
  if (!contact) return;

  const contactNumber = contact.querySelector('.section-number');
  if (contactNumber) contactNumber.textContent = '05';

  const upcomingEvents = [
    {
      date: 'SEP 16, 2026 · 7:30 PM',
      work: 'Scattered Air V for Clarinet, Violin, and Piano (2025)',
      concert: 'Collage',
      performers: 'Ensemble Between',
      venue: 'Sejong Chamber Hall · Seoul, South Korea'
    },
    {
      date: 'SEP 18, 2026 · 7:30 PM',
      work: 'Three Korean Melodies for Piano Solo (2026)',
      concert: 'Baroque to Contemporary Music II',
      performers: 'Ji Hye Son, piano',
      venue: 'Art Center Incheon, Multi-Purpose Hall · Incheon, South Korea',
      premiere: 'World Premiere'
    }
  ];

  const eventMarkup = event => `
    <article class="event-card">
      <p class="event-date">${event.date}</p>
      <div class="event-main">
        ${event.premiere ? `<p class="event-kicker">${event.premiere}</p>` : ''}
        <h3>${event.work}</h3>
        <p class="event-concert">${event.concert}</p>
        <p>${event.performers}</p>
        <p>${event.venue}</p>
      </div>
    </article>`;

  const events = document.createElement('section');
  events.id = 'events';
  events.className = 'section events';
  events.innerHTML = `
    <p class="section-number">04</p>
    <div class="section-content events-content">
      <p class="section-label">Events</p>
      <h2>Upcoming Performances</h2>
      <p class="lead events-intro">Upcoming performances of works by CHUNG Seung Jae.</p>

      <div class="events-list" aria-live="polite">
        ${upcomingEvents.map(eventMarkup).join('')}
      </div>

      <details class="past-events">
        <summary>Past Performances <span aria-hidden="true">+</span></summary>
        <div class="past-events-body">
          <p>Past performances will be archived here as upcoming events are completed.</p>
        </div>
      </details>
    </div>`;
  contact.parentNode.insertBefore(events, contact);

  const heroActions = document.querySelector('.hero-actions');
  if (heroActions && !document.querySelector('.next-performance')) {
    const teaser = document.createElement('div');
    teaser.className = 'next-performance';
    teaser.innerHTML = `
      <div>
        <span class="next-performance-label">Next Performance</span>
        <p><strong>Sep 16, 2026</strong> · <em>Scattered Air V</em> · Collage · Sejong Chamber Hall</p>
      </div>
      <a href="#events">View events →</a>`;
    heroActions.insertAdjacentElement('afterend', teaser);
  }
})();