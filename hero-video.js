(() => {
  const video = document.getElementById('hero-video');
  const button = document.querySelector('.hero-video-toggle');
  if (!video || !button) return;
  video.muted = true;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused = motion.matches;
  let visible = true;
  const label = () => {
    const text = video.paused ? '영상 재생' : '영상 일시정지';
    button.textContent = text;
    button.setAttribute('aria-label', `배경 ${text}`);
  };
  const sync = () => {
    if (manuallyPaused || !visible || document.hidden) video.pause();
    else video.play().catch(label);
    label();
  };
  button.addEventListener('click', () => { manuallyPaused = !video.paused; sync(); });
  video.addEventListener('play', label);
  video.addEventListener('pause', label);
  video.addEventListener('loadeddata', sync);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', () => { manuallyPaused = motion.matches; sync(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(video.closest('.hero'));
  sync();
})();
