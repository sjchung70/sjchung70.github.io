(() => {
  if (document.getElementById('events')) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'css/events.css?v=20260902-1';
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

  const events = document.createElement('section');
  events.id = 'events';
  events.className = 'section events';
  events.innerHTML = `
    <p class="section-number">04</p>
    <div class="section-content events-content">
      <p class="section-label">Events</p>
      <h2>Upcoming Performances</h2>
      <p class="lead events-intro">Upcoming performances of works by CHUNG Seung Jae will be announced here.</p>

      <div class="events-list" aria-live="polite">
        <article class="event-card event-placeholder">
          <p class="event-date">Next Performance</p>
          <div class="event-main">
            <h3>Details forthcoming</h3>
            <p>Dates, works, performers, venues, and event links will be added as they are confirmed.</p>
          </div>
        </article>
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
        <p>Upcoming performance details will be announced here.</p>
      </div>
      <a href="#events">View events →</a>`;
    heroActions.insertAdjacentElement('afterend', teaser);
  }
})();