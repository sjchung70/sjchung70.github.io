(() => {
  const SUPABASE_AUDIO_HOST = 'lyiiafoexgsbkgrvlwjz.supabase.co';

  function prepareAudio(audio) {
    if (!(audio instanceof HTMLAudioElement) || audio.dataset.audioPrepared === '1') return;

    const raw = audio.getAttribute('src') || '';
    if (!raw) return;

    try {
      const url = new URL(raw, window.location.href);
      if (url.hostname !== SUPABASE_AUDIO_HOST) return;

      audio.dataset.audioPrepared = '1';
      audio.preload = 'metadata';
      audio.removeAttribute('crossorigin');

      const status = document.createElement('span');
      status.className = 'audio-status';
      status.setAttribute('aria-live', 'polite');
      audio.insertAdjacentElement('afterend', status);

      audio.addEventListener('playing', () => {
        status.textContent = '';
      });

      audio.addEventListener('waiting', () => {
        status.textContent = 'Loading…';
      });

      audio.addEventListener('stalled', () => {
        status.textContent = 'Loading…';
      });

      audio.addEventListener('error', () => {
        const code = audio.error ? audio.error.code : 0;
        status.textContent = code ? `Audio error (${code})` : 'Audio could not be loaded';
      });

      audio.addEventListener('play', async () => {
        status.textContent = 'Loading…';
        try {
          if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
          await audio.play();
        } catch (err) {
          status.textContent = 'Tap play again';
          console.warn('Audio playback failed:', err);
        }
      }, { once: true });
    } catch (err) {
      console.warn('Invalid audio URL:', raw, err);
    }
  }

  function scan(root = document) {
    root.querySelectorAll('audio').forEach(prepareAudio);
  }

  scan();

  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
})();