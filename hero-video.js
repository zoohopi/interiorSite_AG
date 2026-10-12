(() => {
  const video = document.getElementById('hero-video');
  const button = document.querySelector('.hero-video-toggle');
  if (!video || !button) return;
  video.muted = true;
  // 첫 장면(도면 미팅, 0~1.33초)만 1.3배속, 이후 장면(책 넘기기 · 건물 조사)은 1배속
  const firstCut = 1.333;
  const setRate = () => { const r = video.currentTime < firstCut ? 1.3 : 1; if (video.playbackRate !== r) video.playbackRate = r; };
  if ('requestVideoFrameCallback' in video) {
    const onFrame = () => { setRate(); video.requestVideoFrameCallback(onFrame); };
    video.requestVideoFrameCallback(onFrame);
  } else video.addEventListener('timeupdate', setRate);
  video.addEventListener('seeked', setRate);
  setRate();
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
