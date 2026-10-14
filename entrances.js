// site/dist 의 섹션 등장 효과와 127 카운트업을 옮겨 왔습니다.
(() => {
  const clamp = n => Math.max(0, Math.min(1, n));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Animate contents rather than section boxes, keeping layout geometry stable.
  const entrances = [...document.querySelectorAll('.sec')].map(section => {
    const content = document.createElement('div');
    content.className = 'section-content';
    while (section.firstChild) content.append(section.firstChild);
    section.append(content);
    return { section, content };
  });
  let queued = false;
  function render() {
    queued = false;
    if (reduced.matches) return;
    entrances.forEach(({ section, content }) => {
      const top = section.getBoundingClientRect().top;
      const eased = 1 - Math.pow(1 - clamp((innerHeight - top) / (innerHeight * 0.8)), 3);
      content.style.setProperty('--entry-y', `${(1 - eased) * 90}px`);
      content.style.setProperty('--entry-opacity', String(0.3 + eased * 0.7));
    });
  }
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  render();

  // YouTube: show the thumbnail first, load the player only on click.
  document.querySelectorAll(".yt").forEach(btn => btn.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0&playsinline=1`;
    frame.title = btn.getAttribute("aria-label");
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    const wrap = document.createElement("div");
    wrap.className = "video-box yt-frame liquid-glass";
    wrap.append(frame);
    btn.replaceWith(wrap);
  }));

  // Review cards: arrows scroll by one card.
  document.querySelectorAll(".reviews-slider").forEach(s => {
    const track = s.querySelector(".rv-track");
    // Endless loop: cards are moved from one end to the other, so › always slides right-to-left.
    const step = dir => {
      const cards = track.querySelectorAll(".rv-card");
      const w = cards[0].offsetWidth + 20;
      const smooth = reduced.matches ? "auto" : "smooth";
      track.style.scrollSnapType = "none";
      if (dir > 0 && track.scrollLeft >= track.scrollWidth - track.clientWidth - 4) { track.append(cards[0]); track.scrollLeft -= w; }
      if (dir < 0 && track.scrollLeft <= 4) { track.prepend(cards[cards.length - 1]); track.scrollLeft += w; }
      track.scrollBy({ left: dir * w, behavior: smooth });
      clearTimeout(track._snap); track._snap = setTimeout(() => { track.style.scrollSnapType = ""; }, 600);
    };
    s.querySelector(".rv-prev").addEventListener("click", () => step(-1));
    s.querySelector(".rv-next").addEventListener("click", () => step(1));
  });

  // Scrollbar width, so full-bleed blocks span the viewport without overflowing.
  const sbw = () => document.documentElement.style.setProperty("--sbw", `${innerWidth - document.documentElement.clientWidth}px`);
  sbw(); addEventListener("resize", sbw);

  // Roadmap video: plays only after a click.
  document.querySelectorAll(".rm-video").forEach(box => {
    const v = box.querySelector("video"), btn = box.querySelector(".rm-play");
    if (btn) btn.addEventListener("click", () => { v.controls = true; btn.hidden = true; v.play().catch(() => { btn.hidden = false; }); });
  });

  // Roadmap image pairs: switch every 2 seconds.
  document.querySelectorAll(".rm-rotator").forEach(box => {
    const imgs = [...box.querySelectorAll("img")];
    if (imgs.length < 2 || reduced.matches) return;
    let i = 0;
    setInterval(() => { imgs[i].classList.remove("is-on"); i = (i + 1) % imgs.length; imgs[i].classList.add("is-on"); }, 2000);
  });

  // Count once when the figure enters the viewport.
  const count = document.getElementById('career-count');
  if (!count || reduced.matches) return;
  const target = Number(count.textContent);
  count.textContent = '0';
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    observer.disconnect();
    const start = performance.now();
    const tick = now => {
      const p = clamp((now - start) / 1600);
      count.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.5 });
  observer.observe(count);
})();

// 플랜 카드: 마우스가 없는 기기는 눌러서 앞·뒷면 전환
if (matchMedia('(hover: none)').matches) {
  document.querySelectorAll('.plan').forEach(card => card.addEventListener('click', () => card.classList.toggle('is-flipped')));
}


// 상단 메뉴: 공간 투어(남산장어 공간을 걷다) 구간에서만 숨기고 나머지 구간에서는 화면 위에 고정
(() => {
  const header = document.querySelector('.site-nav');
  const journey = document.getElementById('journey');
  if (!header || !journey) return;
  let queued = false;
  const update = () => {
    queued = false;
    const y = scrollY, top = journey.offsetTop, end = top + journey.offsetHeight - innerHeight;
    header.classList.toggle('is-hidden', y >= top - 2 && y < end);
    header.classList.toggle('is-solid', y > 40);
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
})();

// 매출 설계 카드 흐름: 휴대폰에서 손가락으로 누르고 있으면 멈추고, 떼면 다시 흐름
(() => {
  const track = document.querySelector('.points-track');
  if (!track) return;
  const hold = on => track.classList.toggle('is-held', on);
  track.addEventListener('touchstart', () => hold(true), { passive: true });
  ['touchend', 'touchcancel'].forEach(t => track.addEventListener(t, () => hold(false), { passive: true }));
})();

// 진행 절차 영상(착공): 소리 없이 화면에 보이면 자동 재생, 벗어나면 정지
document.querySelectorAll('video.rm-autoplay').forEach(v => {
  v.muted = true;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !document.hidden) v.play().catch(() => {}); else v.pause();
  }, { threshold: .4 }).observe(v);
});
