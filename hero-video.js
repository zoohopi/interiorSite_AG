(() => {
  const video = document.getElementById('hero-video');
  if (!video) return;
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
  let paused = motion.matches;
  let visible = true;
  const sync = () => {
    if (paused || !visible || document.hidden) video.pause();
    else video.play().catch(retryOnTouch);
  };
  // 갤럭시 절전 모드 등에서 자동재생이 막히면 첫 터치 때 다시 재생합니다.
  function retryOnTouch() {
    const go = () => { removeEventListener('touchstart', go); removeEventListener('click', go); sync(); };
    addEventListener('touchstart', go, { once: true, passive: true });
    addEventListener('click', go, { once: true });
  }
  video.addEventListener('loadeddata', sync);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', () => { paused = motion.matches; sync(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(video.closest('.hero'));
  sync();
})();
