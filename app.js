// Kept in this file so index.html also works when it is opened directly (file://).
const clamp = n => Math.max(0, Math.min(1, n));
const HOLD = 1.7;
const TRAVEL = 1.65;
const PLAYBACK_RATE = 1.65;
// 원래 속도에서 30% → 다시 15% 빠르게(약 1.5배). 아이폰 사파리는 2배속을 넘기면 불안정해서,
// 영상 파일 자체를 1.5배 빠르게 만들어 두고(CLIP_FILE_SPEED) 나머지만 재생 속도로 맞춥니다.
const CLIP_FILE_SPEED = 1.5;
const PLAYBACK_RATES = [1.75, PLAYBACK_RATE, PLAYBACK_RATE, PLAYBACK_RATE, 1.5, 1.5].map(r => Math.min(2, r * 1.3 * 1.15 / CLIP_FILE_SPEED));
const TOTAL = HOLD * 7 + TRAVEL * 6;
const stopPosition = i => i * (HOLD + TRAVEL) + HOLD * .62;
function sample(distance) {
  const d = Math.max(0, Math.min(TOTAL, distance));
  const scene = Math.min(6, Math.floor(d / (HOLD + TRAVEL)));
  const local = d - scene * (HOLD + TRAVEL);
  if (local <= HOLD || scene === 6) {
    const t = clamp(local / HOLD);
    const exit = scene === 6 ? 1 : 1 - clamp((t - .82) / .18);
    return { kind:'hold', scene, t, shade:clamp((t - .06) / .24) * exit,
      copy:clamp((t - .25) / .22) * exit };
  }
  return { kind:'travel', scene, t:clamp((local - HOLD) / TRAVEL), shade:0, copy:0 };
}

const scenes = [
  { label:'파사드', title:'강렬한 첫인상으로 발걸음을 잡습니다.', body:'비슷한 간판과 평범한 매장들 사이에서 브랜드만의 첫인상은 중요한 경쟁력이 됩니다.\n원목 우드슬랩 간판과 따뜻한 조명으로 시선을 사로잡고, 자연스럽게 발걸음을 이끄는 파사드를 완성했습니다.', mbody:'비슷한 간판과 평범한 매장들 사이에서\n브랜드만의 첫인상은 중요한 경쟁력이 됩니다.\n원목 우드슬랩 간판과 따뜻한 조명으로 시선을 사로잡고,\n자연스럽게 발걸음을 이끄는 파사드를 완성했습니다.' },
  { label:'입구 오브제', title:'오브제에 브랜드 정체성을 담았습니다.', body:'생(生)·죽(竹)·석(石)·월(月). 자연의 네 가지 요소로 남산장어만의 정체성을 표현했습니다.\n자연 속에서 풍류를 즐기던 선비의 정취가 느껴지는 공간으로 완성했습니다.', detail:'生 살아 있는 장어  ·  竹 사군자의 대나무\n石 도시와 매장을 잇는 자연석  ·  月 달빛을 형상화한 원형 조명', mbody:'생(生)·죽(竹)·석(石)·월(月)\n자연의 네 가지 요소로 남산장어만의 정체성을 표현했습니다.\n자연 속에서 풍류를 즐기던 선비의 정취가\n느껴지는 공간으로 완성했습니다.' },
  { label:'입구 어항', title:'브랜드의 철학을 공간에 새겼습니다.', body:'생물장어와 삼미 크기의 원물을 고집하는 주인장의 철학을 자연 소재와 디자인 요소로 표현했습니다.\n입구에서부터 브랜드의 이야기를 눈으로 경험할 수 있도록, 평범한 어항을 하나의 콘텐츠로 풀어냈습니다.', mbody:'생물장어와 삼미 크기의 원물을 고집하는 주인장의\n철학을 자연 소재와 디자인 요소로 표현했습니다.\n입구에서부터 브랜드의 이야기를 눈으로 경험할 수 있도록,\n평범한 어항을 하나의 콘텐츠로 풀어냈습니다.' },
  { label:'요소의 레이어', title:'요소 간의 조화를 통해 공간의 온도를 높였습니다.', body:'스톤 패턴의 바닥과 직선적인 우드 텍스처 위에 따뜻한 색온도의 조명을 더해 각 요소를 자연스럽게 연결했습니다.\n서로 다른 소재와 빛이 어우러져 편안하면서도 고급스러운 공간을 완성했습니다.', mbody:'스톤 패턴의 바닥과 직선적인 우드 텍스처 위에\n따뜻한 색온도의 조명을 더해 각 요소를 자연스럽게 연결했습니다.\n서로 다른 소재와 빛이 어우러져 편안하면서도\n고급스러운 공간을 완성했습니다.' },
  { label:'아트월', title:'브랜드를 상징하는 조형을 설계했습니다.', body:'생물장어의 유연한 움직임과 역동성을 부드러운 곡선과 거친 질감의 아트월로 표현했습니다.\n직선적인 공간 속 대비되는 곡선의 조형미를 통해 시선을 끌고, 브랜드를 기억하게 하는 상징적인 포인트를 완성했습니다.', mbody:'생물장어의 유연한 움직임과 역동성을 부드러운 곡선과\n거친 질감의 아트월로 표현했습니다.\n직선적인 공간 속 대비되는 곡선의 조형미를 통해 시선을 끌고\n브랜드를 기억하게 하는 상징적인 포인트를 완성했습니다.' },
  { label:'공간 속 또 하나의 파사드', title:'조리 과정도 하나의 콘텐츠로 설계했습니다.', body:'주방을 오픈형 무대로 구성해 조리 과정을 고객이 직접 보고 즐길 수 있도록 했습니다.\n조리사의 움직임이 하나의 퍼포먼스가 되어 음식에 대한 신뢰와 기대감을 높이는 공간으로 완성했습니다.', mbody:'주방을 오픈형 무대로 구성해 조리 과정을 고객이 직접\n보고 즐길 수 있도록 했습니다.\n조리사의 움직임이 하나의 퍼포먼스가 되어 음식에 대한 신뢰와\n기대감을 높이는 공간으로 완성했습니다.' },
  { label:'포인트 월', title:'작은 요소도 의도를 갖고 연출했습니다.', body:'익숙한 메뉴판을 브랜드의 개성이 드러나는 대형 간판으로 재해석했습니다.\n우드 소재와 기울어진 입체적 구성을 활용해 시각적인 포인트를 만들고, 조리 공간에도 브랜드의 정체성이 자연스럽게 이어지도록 설계했습니다.', mbody:'익숙한 메뉴판을 브랜드의 개성이 드러나는\n대형 간판으로 재해석했습니다.\n우드 소재와 기울어진 입체적 구성을 활용해\n시각적인 포인트를 만들고\n조리공간에도 브랜드의 정체성이 자연스럽게\n이어지도록 설계했습니다.' },
];
const $ = s => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const posters = scenes.map((scene,i) => {
  const img = new Image();
  img.src = `previz-01/inputs/photo-0${i+1}.jpg`; img.alt = ''; img.decoding = 'async';
  $('#media').append(img); return img;
});
const captions = scenes.map((scene,i) => {
  const article = document.createElement('article'); article.className = 'caption';
  const eyebrow = document.createElement('div'); eyebrow.className = 'eyebrow'; eyebrow.textContent = `0${i+1} / ${scene.label}`;
  const title = document.createElement(i ? 'h2' : 'h1'); title.textContent = scene.title;
  const body = document.createElement('p'); body.textContent = scene.body;
  // 휴대폰 전용 줄바꿈 본문(있으면 휴대폰에서는 이것만 보임)
  let mbody=null; if(scene.mbody){ body.className='body-pc'; mbody=document.createElement('p'); mbody.className='body-m'; mbody.textContent=scene.mbody; }
  article.append(eyebrow,title,body); if(mbody) article.append(mbody);
  if(scene.detail){const detail=document.createElement('div');detail.className='detail';detail.textContent=scene.detail;article.append(detail);}
  // 휴대폰: 제목만 보이고 '자세히 보기'를 누르면 설명이 펼쳐집니다
  const more=document.createElement('button');more.type='button';more.className='caption-more';more.textContent='자세히 보기';more.setAttribute('aria-expanded','false');
  more.addEventListener('click',()=>{
    const open=article.classList.toggle('is-open');more.textContent=open?'접기':'자세히 보기';more.setAttribute('aria-expanded',String(open));
    // 펼친 설명이 화면 아래로 넘치면 그만큼 글 전체를 위로 밀어 올립니다(사진 아랫부분은 가려져도 됨)
    article.style.setProperty('--lift','0px');
    if(open){const limit=$('.stage').getBoundingClientRect().bottom-40;const over=article.getBoundingClientRect().bottom-limit;if(over>0)article.style.setProperty('--lift',`${Math.ceil(over)}px`);}
  });
  article.append(more);
  $('#captions').append(article); return article;
});
const buttons = scenes.map((scene,i) => {
  const button = document.createElement('button'); button.setAttribute('aria-label', `${i+1}. ${scene.label}`); button.dataset.num = String(i+1);
  button.addEventListener('click',()=> moveToStop(i));
  $('#stops').append(button); return button;
});
let activeClip = -1;
let frame = 0;
const wake = () => { if(!frame) frame = requestAnimationFrame(render); };
const clips = ['01-to-02-seedance25-reference-1080p.mp4','02-to-03-4s-seedance25-reference-1080p.mp4','03-to-04-seedance25-reference-1080p.mp4','04-to-05-seedance25-reference-1080p-cut.mp4','05-to-06-seedance25-reference-1080p-ramp-fast.mp4','06-to-07-text-lock-2s-fade.mp4'].map((file, i) => {
  const video = document.createElement('video');
  // 영상을 H.264로 다시 만들어 6개 합쳐 약 17MB라, 페이지를 열 때 모두 미리 받아 둡니다(늦게 받으면 휴대폰 데이터에서 재생 전에 장면이 지나감).
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  video.setAttribute('muted',''); video.setAttribute('playsinline',''); video.setAttribute('webkit-playsinline',''); video.setAttribute('aria-hidden','true');
  $('#media').append(video);
  video.src = `previz-01/outputs/${file}`;
  video.load();
  return {video,ready:false,painted:false,target:0,failed:false,file};
});
// Listeners must update the same state object used by the renderer.
clips.forEach(clip => {
  clip.video.addEventListener('loadeddata',()=>{clip.ready=true;clip.painted=true;wake();});
  // iOS는 재생을 시작하기 전까지 loadeddata를 보내지 않을 수 있어, 재생이 시작되면 준비된 것으로 봅니다.
  clip.video.addEventListener('playing',()=>{clip.ready=true;clip.painted=true;wake();});
  clip.video.addEventListener('seeked',()=>{clip.painted=true;wake();});
  clip.video.addEventListener('error',()=>{clip.failed=true;wake();});
});
let currentStop = 0;
let snapping = false;
let snapFrame = 0;
let snapToken = 0;
let playingClip = -1;
const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
function animateScroll(to, duration, easing=ease, token=snapToken) {
  const from = scrollY;
  const started = performance.now();
  return new Promise(resolve => {
    const step = now => {
      if (token !== snapToken) { resolve(false); return; }
      const t = clamp((now - started) / duration);
      scrollTo(0, from + (to - from) * easing(t));
      if (t < 1) snapFrame = requestAnimationFrame(step);
      else resolve(true);
    };
    snapFrame = requestAnimationFrame(step);
  });
}
// 영상이 재생할 만큼 받아지지 않았으면 재생 전에 최대 2.5초 기다립니다(load()는 받던 데이터를 버리므로 부르지 않음).
const ensureReady = clip => clip.video.readyState >= 3 ? Promise.resolve() : new Promise(resolve => {
  clip.video.preload = 'auto';
  clip.video.addEventListener('canplay', resolve, { once: true });
  clip.video.addEventListener('error', resolve, { once: true });
  setTimeout(resolve, 2500);
});
// The tour starts below the hero, so timeline distances are offset by the journey's top.
const journeyTop = () => $('#journey').offsetTop;
// 휴대폰은 주소창이 접히고 펴질 때마다 innerHeight가 바뀌어 투어 높이가 통째로 바뀌고 화면이 튑니다.
// 터치 기기에서는 가로 폭이 바뀔 때(회전)만 기준 높이를 새로 잡습니다.
const coarse = matchMedia('(pointer: coarse)').matches;
let vh = innerHeight, lastWidth = innerWidth;
const at = distance => journeyTop() + distance * vh;
async function travelOne(fromIndex, toIndex, token) {
  const forward = toIndex > fromIndex;
  const clipIndex = forward ? fromIndex : toIndex;
  const clip = clips[clipIndex];
  const travelStart = at(clipIndex * (HOLD + TRAVEL) + HOLD);
  const travelEnd = at((clipIndex + 1) * (HOLD + TRAVEL));
  const duration = Number.isFinite(clip.video.duration)
    ? clip.video.duration * 1000 / PLAYBACK_RATES[clipIndex]
    : [5042,4042,4042,3708,3375,2083][clipIndex] / CLIP_FILE_SPEED / PLAYBACK_RATES[clipIndex];
  if (forward) {
    if (!await animateScroll(travelStart, 380, ease, token)) return false;
    await ensureReady(clip);
    if (token !== snapToken) return false;
    clip.video.currentTime = 0;
    clip.video.playbackRate = PLAYBACK_RATES[clipIndex];
    playingClip = clipIndex;
    clip.video.play().catch(()=>{});
    if (!await animateScroll(travelEnd, duration, t=>t, token)) return false;
    clip.video.pause(); playingClip = -1;
    return animateScroll(at(stopPosition(toIndex)), 560, ease, token);
  }
  if (!await animateScroll(travelEnd, 560, ease, token)) return false;
  clip.video.pause(); playingClip = -1;
  clip.video.currentTime = Math.max(0,clip.video.duration-1/24);
  if (!await animateScroll(travelStart, duration, t=>t, token)) return false;
  return animateScroll(at(stopPosition(toIndex)), 380, ease, token);
}
async function moveToStop(index, duration) {
  index = Math.max(0, Math.min(scenes.length - 1, index));
  cancelAnimationFrame(snapFrame);
  clips.forEach(c=>c.video.pause()); playingClip = -1;
  const token = ++snapToken;
  const fromIndex = currentStop;
  snapping = true;
  if (duration === 1 || index === fromIndex) {
    await animateScroll(at(stopPosition(index)), duration || 300, ease, token);
  } else {
    const direction = index > fromIndex ? 1 : -1;
    for (let i=fromIndex; i!==index; i+=direction) {
      if (!await travelOne(i,i+direction,token)) return;
      currentStop = i+direction;
    }
  }
  currentStop = index; snapping = false; wake();
}
// Below the last stop the page scrolls natively into the sections that follow the tour.
const lastStop = scenes.length - 1;
const nearestStop = () => Math.max(0, Math.min(lastStop, Math.round(((scrollY - journeyTop())/vh - stopPosition(0))/(HOLD+TRAVEL))));
const inHero = () => scrollY < journeyTop() - 2;
// Hero quote reveals one line per scroll step before the tour starts.
const heroQuote = $(".hero-quote");
let heroLines = reduced.matches ? 2 : 0, heroLock = 0;
const setHeroLines = n => { heroLines = n; heroQuote.dataset.lines = String(n); heroLock = performance.now() + 650; };
setHeroLines(heroLines); heroLock = 0;
addEventListener("load", () => { if (!inHero() && heroLines < 2) { setHeroLines(2); heroLock = 0; } });
function tourHandles(down) {
  if (snapping) return true;
  if (scrollY > at(stopPosition(lastStop)) + 2) return false;
  if (inHero()) return down || heroLines > 0;
  currentStop = nearestStop();
  return !(down && currentStop === lastStop);
}
async function toHero() {
  setHeroLines(2);
  cancelAnimationFrame(snapFrame);
  const token = ++snapToken;
  snapping = true;
  if (await animateScroll(0, 700, ease, token)) snapping = false;
}
// Down from the hero enters the first stop; up from the first stop returns to the hero.
function step(down) {
  if (snapping) return;
  if (inHero()) {
    if (performance.now() < heroLock) return;
    if (down && heroLines < 2) { setHeroLines(heroLines + 1); return; }
    if (!down) { if (heroLines > 0) setHeroLines(heroLines - 1); return; }
    currentStop = 0; moveToStop(0, 700); return;
  }
  if (!down && currentStop === 0) { toHero(); return; }
  moveToStop(currentStop + (down ? 1 : -1));
}
function onWheel(event) {
  if (Math.abs(event.deltaY) < 4) return;
  if (!tourHandles(event.deltaY > 0)) return;
  event.preventDefault();
  step(event.deltaY > 0);
}
function render(){
  frame=0;
  const distance=(scrollY - journeyTop())/vh;
  const state=sample(distance);
  const traveling=state.kind==='travel'&&!reduced.matches;
  const visibleScene=state.kind==='travel'&&state.t>=.5?state.scene+1:state.scene;
  const nextActive=traveling?state.scene:-1;
  if(nextActive!==activeClip&&nextActive>=0)clips[nextActive].painted=false;
  activeClip=nextActive;
  posters.forEach((img,i)=>img.style.opacity=i===(traveling?(state.t<.5?state.scene:state.scene+1):visibleScene)?'1':'0');
  clips.forEach((clip,i)=>{
    const v=clip.video;
    if(i!==activeClip){v.style.opacity='0';return;}
    if(clip.ready){
      clip.target=state.t*Math.max(0,v.duration-1/24);
      const delta=Math.abs(v.currentTime-clip.target);
      if(i!==playingClip&&!v.seeking&&delta>.018){v.currentTime=clip.target;}
      else if(!v.seeking){clip.painted=true;}
      const blend=Math.min(clamp(state.t/.055),clamp((1-state.t)/.055));
      v.style.opacity=clip.painted?String(blend):'0';
    }
  });
  const showCopy=reduced.matches?1:state.copy;
  captions.forEach((el,i)=>{
    const opacity=i===visibleScene?showCopy:0;
    el.style.opacity=String(opacity);el.style.transform=`translateY(${(1-opacity)*80}px)`;
    el.setAttribute('aria-hidden',String(i!==visibleScene||opacity===0));
  });
  $('.shade').style.transform=`translateY(${(1-(reduced.matches?1:state.shade))*100}%)`;
  $('#position').textContent=`0${visibleScene+1} / 0${scenes.length} · ${scenes[visibleScene].label}`;
  $('#hint').textContent=visibleScene===scenes.length-1&&!traveling?'계속 스크롤하면 이야기가 이어집니다 ↓':traveling?'영상과 함께 다음 공간으로 이동합니다 ↓':'스크롤하여 공간을 둘러보세요 ↓';
  buttons.forEach((b,i)=>b.setAttribute('aria-current',String(i===visibleScene)));
  $('#progress').style.transform=`scaleX(${clamp(distance/TOTAL)})`;
  $('#status').textContent=reduced.matches?'':clips.some(c=>c.failed)?'영상을 불러오지 못해 사진으로 표시합니다. 새로고침해주세요.':clips.every(c=>c.ready)?'':'영상을 준비하고 있습니다';
  $('.stage').dataset.segment=state.kind;$('.stage').dataset.scene=String(visibleScene+1);
}
function resize(){
  if (!coarse || innerWidth !== lastWidth) { vh = innerHeight; lastWidth = innerWidth; }
  $('#journey').style.height=`${(TOTAL+1)*vh}px`;wake();
}
addEventListener('scroll',wake,{passive:true});
// 투어 아래(FROM SPACE TO PROMISE)에서 위로 올릴 때만 브레이크:
// 세게 올려도 섹션 맨 위에서 딱 멈추고, 남은 관성(손가락을 뗀 뒤 미끄러지는 스크롤)은 버립니다.
// 멈춘 뒤 손가락을 다시 대고(또는 휠을 다시 굴려) 올리면 그때 투어로 들어갑니다. 내릴 때는 그대로.
let lastScrollY = scrollY, brakeArmed = true, braking = false, lastScrollAt = 0, lastWheelAt = 0;
const brakeLine = () => $('#concerns').offsetTop;
const inBrakeZone = y => y < brakeLine() - 1 && y > at(stopPosition(lastStop)) + 2;
addEventListener('scroll', () => {
  const y = scrollY, up = y < lastScrollY; lastScrollY = y; lastScrollAt = performance.now();
  if (snapping) return;
  if (y >= brakeLine() + innerHeight * .5) { brakeArmed = true; braking = false; }
  if (!up || !inBrakeZone(y)) return;
  if (brakeArmed) { brakeArmed = false; braking = true; }
  if (braking) { scrollTo(0, brakeLine()); lastScrollY = brakeLine(); }
},{passive:true});
// 새 터치: 스크롤이 멈춘 뒤에 시작한 터치라면 브레이크를 풉니다(관성 중 터치는 그대로 막음)
addEventListener('touchstart', () => { if (braking && performance.now() - lastScrollAt > 150) braking = false; }, {passive:true});
addEventListener('touchmove', event => {
  if (braking && scrollY <= brakeLine() + 2 && touchY !== null && event.touches[0].clientY > touchY) event.preventDefault();
}, {passive:false});
// 휠: 연속으로 들어오는 관성 휠은 막고, 0.3초 이상 쉬었다가 다시 굴리면 브레이크를 풉니다
addEventListener('wheel', event => {
  const now = performance.now(), fresh = now - lastWheelAt > 300; lastWheelAt = now;
  if (!braking) return;
  if (fresh) { braking = false; return; }
  if (event.deltaY < 0 && scrollY <= brakeLine() + 2) event.preventDefault();
}, {passive:false, capture:true});addEventListener('resize',resize);
addEventListener('wheel',onWheel,{passive:false});
// 터치: 한 번 쓸어내리면 휠 한 칸과 같이 한 단계(히어로 문장 한 줄 · 다음 장면)씩 이동
let touchY = null, touchFired = false;
addEventListener('touchstart',event=>{ touchY = event.touches.length === 1 ? event.touches[0].clientY : null; touchFired = false; },{passive:true});
addEventListener('touchmove',event=>{
  if (touchY === null) return;
  const dy = touchY - event.touches[0].clientY;
  if (Math.abs(dy) < 2 || !tourHandles(dy > 0)) return;
  event.preventDefault();
  if (!touchFired && Math.abs(dy) > 24) { touchFired = true; step(dy > 0); }
},{passive:false});
addEventListener('touchend',()=>{ touchY = null; },{passive:true});

addEventListener('keydown',event=>{
  if(['ArrowDown','PageDown',' '].includes(event.key)&&tourHandles(true)){event.preventDefault();step(true);}
  if(['ArrowUp','PageUp'].includes(event.key)&&tourHandles(false)){event.preventDefault();step(false);}
});
$('.skip-tour').addEventListener('click',event=>{
  event.preventDefault();
  snapToken++; cancelAnimationFrame(snapFrame); snapping=false;
  clips.forEach(c=>c.video.pause()); playingClip=-1;
  scrollTo(0,$('#concerns').offsetTop);
});
// 왼쪽 위 '아그디자인'(상단 메뉴 · 투어 화면): 히어로(첫 화면)로 이동
document.querySelectorAll('a.brand, a.top-brand').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  snapToken++; cancelAnimationFrame(snapFrame); snapping = false;
  clips.forEach(c => c.video.pause()); playingClip = -1;
  scrollTo(0, 0); setHeroLines(2); heroLock = 0; currentStop = 0; wake();
}));
$('.hero-scroll').addEventListener('click',event=>{event.preventDefault();step(true);});
reduced.addEventListener('change',wake);
resize();
requestAnimationFrame(()=>{ currentStop = nearestStop(); wake(); });
