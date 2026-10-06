(() => {
  const SUPABASE_AUDIO_HOST = 'lyiiafoexgsbkgrvlwjz.supabase.co';
  const CACHE_VERSION = '20261006-1';

  function refreshAudio(audio) {
    if (!(audio instanceof HTMLAudioElement) || audio.dataset.recoveredAudio === '1') return;
    const raw = audio.getAttribute('src') || '';
    if (!raw) return;

    try {
      const url = new URL(raw, window.location.href);
      if (url.hostname !== SUPABASE_AUDIO_HOST) return;

      url.searchParams.set('v', CACHE_VERSION);
      audio.dataset.recoveredAudio = '1';
      audio.src = url.href;
      audio.load();
    } catch {
      // Leave malformed or unsupported URLs untouched.
    }
  }

  function scan(root = document) {
    root.querySelectorAll('audio').forEach(refreshAudio);
  }

  scan();

  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
})();