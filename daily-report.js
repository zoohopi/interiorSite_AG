(() => {
  const root = document.querySelector('#daily-report');
  if (!root) return;
  const track = root.querySelector('.report-scroll');
  const stage = root.querySelector('.report-stage');
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
    // 스크롤 확대 연출은 끄고, 영상은 화면에 보이면 자동 재생합니다(아래 IntersectionObserver)
    active = false;
    track.classList.toggle('is-animated', active);
    const p = active ? clamp(-rect.top / Math.max(1,track.offsetHeight-stage.offsetHeight)) : 0;
    // 구간에 들어서면 한 번에 최대 크기로 (전환 애니메이션은 CSS transition)
    const b = active && p >= .12 && p < .55 ? 1 : 0;
    expand(film,b,(video.videoWidth/video.videoHeight)||16/9);
    shade.style.opacity = String(b);
    cue.textContent = !active ? '' : b > .5 ? '현장 영상 · 소리는 영상 컨트롤에서 켜주세요' : p >= .55 ? '' : '스크롤하며 오늘의 현장을 확인하세요 ↓';
    const shouldPlay = active && p >= .12 && p < .55 && !document.hidden;
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
  new IntersectionObserver(entries => {
    const e = entries[0];
    if (e.isIntersecting && e.intersectionRatio >= .25 && !document.hidden) video.play().catch(() => { play.hidden = false; });
    else if (!video.paused) video.pause();
  }, { threshold: [0, .25, 1] }).observe(film);
  queue();
})();

// 채팅 사진 4장: 누르면 크게 보기, 휠 · 방향키 · 좌우 쓸기로 다음 장
(() => {
  const thumbs = [...document.querySelectorAll('.report-album img')];
  if (!thumbs.length) return;
  const box = document.createElement('div');
  box.className = 'lb'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', '현장 사진 크게 보기');
  box.innerHTML = '<img class="lb-img" alt=""><button type="button" class="lb-close" aria-label="닫기">×</button><button type="button" class="lb-prev" aria-label="이전 사진">‹</button><button type="button" class="lb-next" aria-label="다음 사진">›</button><span class="lb-count"></span>';
  document.body.append(box);
  const img = box.querySelector('.lb-img'), count = box.querySelector('.lb-count');
  let index = 0, lastWheel = 0, startX = null, opener = null;
  const show = i => {
    index = (i + thumbs.length) % thumbs.length;
    img.src = thumbs[index].src.replace(/\.jpg$/, '-lg.jpg');
    img.alt = thumbs[index].alt;
    count.textContent = `${index + 1} / ${thumbs.length}`;
  };
  const open = i => { opener = document.activeElement; show(i); box.hidden = false; document.documentElement.style.overflow = 'hidden'; box.querySelector('.lb-close').focus(); };
  const close = () => { box.hidden = true; document.documentElement.style.overflow = ''; if (opener) opener.focus(); };
  thumbs.forEach((t, i) => {
    t.tabIndex = 0; t.setAttribute('role', 'button'); t.setAttribute('aria-label', `${t.alt} 크게 보기`);
    t.addEventListener('click', () => open(i));
    t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  box.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
  box.addEventListener('click', e => { if (e.target === box) close(); });
  box.addEventListener('wheel', e => {
    e.preventDefault(); e.stopPropagation();
    if (Math.abs(e.deltaY) < 4 || performance.now() - lastWheel < 350) return;
    lastWheel = performance.now(); show(index + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });
  box.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchmove', e => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
  box.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX; startX = null;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
  });
  addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show(index + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); show(index - 1); }
  }, true);
})();
