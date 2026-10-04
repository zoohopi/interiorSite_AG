(() => {
  const root = document.querySelector('#daily-report');
  if (!root) return;
  const track = root.querySelector('.report-scroll');
  const stage = root.querySelector('.report-stage');
  const photo = root.querySelector('.report-photo');
  const film = root.querySelector('.report-film');
  const video = film.querySelector('video');
  const play = root.querySelector('.report-play');
  const shade = root.querySelector('.report-shade');
  const cue = root.querySelector('.report-cue');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { n = clamp(n); return n * n * (3 - 2 * n); };
  let queued = false, inVideo = false, active = false;
  function expand(element, amount, ratio) {
    const base = element.parentElement.getBoundingClientRect();
    const bounds = stage.getBoundingClientRect();
    const width = Math.min(bounds.width - 16, (bounds.height - 145) * ratio, 1080) * 0.7;
    const height = width / ratio;
    const x = bounds.left + (bounds.width-width)/2 - base.left;
    const y = bounds.top + (bounds.height-height)/2 - 10 - base.top;
    element.style.width = `${base.width+(width-base.width)*amount}px`;
    element.style.height = `${base.height+(height-base.height)*amount}px`;
    element.style.transform = `translate(${x*amount}px,${y*amount}px)`;
    element.classList.toggle('is-expanded', amount > 0.001);
  }
  function render() {
    queued = false;
    const rect = track.getBoundingClientRect();
    active = !motion.matches && innerHeight >= 580;
    track.classList.toggle('is-animated', active);
    const p = active ? clamp(-rect.top / Math.max(1,track.offsetHeight-stage.offsetHeight)) : 0;
    // 구간에 들어서면 한 번에 최대 크기로 (전환 애니메이션은 CSS transition)
    const a = active && p >= .07 && p < .42 ? 1 : 0;
    const b = active && p >= .50 && p < .90 ? 1 : 0;
    expand(photo,a,1034/525);
    expand(film,b,(video.videoWidth/video.videoHeight)||16/9);
    shade.style.opacity = String(Math.max(a,b));
    cue.textContent = !active ? '사진을 누르면 원본을 크게 볼 수 있습니다' : a > .5 ? '오늘의 작업을 사진으로 · 클릭하면 원본 보기' : b > .5 ? '현장 영상 · 소리는 영상 컨트롤에서 켜주세요' : p > .9 ? '' : '스크롤하며 오늘의 현장을 확인하세요 ↓';
    const shouldPlay = active && p >= .50 && p < .9 && !document.hidden;
    if (shouldPlay !== inVideo) {
      inVideo = shouldPlay;
      if (shouldPlay) video.play().catch(() => { play.hidden = false; });
      else video.pause();
    }
    if ((rect.bottom < 0 || rect.top > innerHeight || document.hidden) && !video.paused) video.pause();
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(render); } }
  play.addEventListener('click', () => video.play().catch(() => { play.hidden=false; play.querySelector('span').textContent='재생을 다시 시도해주세요'; }));
  video.addEventListener('play', () => { play.hidden = true; });
  video.addEventListener('error', () => { play.hidden=false; play.querySelector('span').textContent='영상을 불러오지 못했습니다'; });
  video.addEventListener('loadedmetadata', queue);
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',queue);
  document.addEventListener('visibilitychange',queue);
  motion.addEventListener('change',queue);
  new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting) && video.preload === 'none') { video.preload='metadata'; video.load(); }
  },{rootMargin:'300px'}).observe(track);
  queue();
})();
