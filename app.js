// Kept in this file so index.html also works when it is opened directly (file://).
const clamp = n => Math.max(0, Math.min(1, n));
const HOLD = 1.7;
const TRAVEL = 1.65;
const PLAYBACK_RATE = 1.65;
const PLAYBACK_RATES = [PLAYBACK_RATE, PLAYBACK_RATE, PLAYBACK_RATE, PLAYBACK_RATE, PLAYBACK_RATE, PLAYBACK_RATE];
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
  { label:'파사드', title:'첫인상으로 발걸음을 잡습니다', body:'아파트 단지 상가 특성상 처마와 기둥에 가려 매장이 잘 보이지 않았습니다.\n고재 간판과 조명으로 시선을 끌고, 방문까지 이어지는 파사드를 설계했습니다.' },
  { label:'입구 오브제', title:'브랜드 아이덴티티 오브제', body:'生(생) 竹(죽) 石(석) 月(월), 자연의 네 가지 요소를 공간에 담았습니다.\n자연 속에서 미식을 즐기던 선비의 풍류를 떠올리게 하는 공간으로 설계했습니다.', detail:'生(생) 살아있는 장어 · 竹(죽) 사군자의 대나무\n石(석) 도시와 매장을 잇는 돌 · 月(월) 달빛 아래 풍류를 담은 원형 조명' },
  { label:'입구 어항', title:'파사드에 담은 브랜드 스토리', body:'남산장어는 장어직판장에서 신선한 생 장어를 직접 공수해옵니다.\n이 이야기를 담아 입구에 조경과 어항을 함께 설계해, 소비자가 입구에서부터\n즐길 수 있는 하나의 콘텐츠로 만들었습니다.' },
  { label:'홀 왼쪽', title:'빛과 선으로 연출한 매장 분위기', body:'브랜드 톤을 고려해 간접등, 핀조명, 선으로 편안하고 고급스러운 매장 분위기 연출.\n첫 만족스러운 식사 경험이 지속적인 매출을 만듭니다.' },
  { label:'홀 오른쪽', title:'의미 있는 매장 포인트', body:'가볍게 지나칠 수 있는 벽면에도 이유와 의도를 담아 설계했습니다.\n브랜드의 셀링 포인트 생물 장어와 주인장의 고집을 굴곡과 거친 질감으로 해석으로 아트월 설계.' },
  { label:'홀 중앙 · 자갈', title:'주방도 하나의 콘텐츠로 설계', body:'모든 좌석에서 조리 과정이 보이도록 설계했습니다.\n깔끔한 주방과 직화로 굽는 조리사의 모습을 공개해,\n매장의 신뢰와 전문성을 전합니다.' },
  { label:'조리대 간판', title:'기다림까지 즐겁게', body:'조리과정을 의도적으로 노출해 손님이 기다리는 동안에도 기대감과 즐거움을 유발합니다.\n또 그 모습이 프로페셔널하게 보일 수 있도록 주방 위 간판 설계로 마무리했습니다.' },
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
  article.append(eyebrow,title,body);
  if(scene.detail){const detail=document.createElement('div');detail.className='detail';detail.textContent=scene.detail;article.append(detail);}
  $('#captions').append(article); return article;
});
const buttons = scenes.map((scene,i) => {
  const button = document.createElement('button'); button.setAttribute('aria-label', `${i+1}. ${scene.label}`);
  button.addEventListener('click',()=> moveToStop(i));
  $('#stops').append(button); return button;
});
let activeClip = -1;
let frame = 0;
const wake = () => { if(!frame) frame = requestAnimationFrame(render); };
const clips = ['01-to-02.mp4','02-to-03-4s.mp4','03-to-04-seedance25-draft.mp4','04-to-05-seedance25-4s.mp4','05-to-06-seedance25-4s.mp4','06-to-07-seedance20-easeout-4s.mp4'].map(file => {
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto'; video.setAttribute('aria-hidden','true');
  $('#media').append(video);
  video.src = `previz-01/outputs/${file}`;
  video.load();
  return {video,ready:false,painted:false,target:0,failed:false,file};
});
// Listeners must update the same state object used by the renderer.
clips.forEach(clip => {
  clip.video.addEventListener('loadeddata',()=>{clip.ready=true;clip.painted=true;wake();});
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
// The tour starts below the hero, so timeline distances are offset by the journey's top.
const journeyTop = () => $('#journey').offsetTop;
const at = distance => journeyTop() + distance * innerHeight;
async function travelOne(fromIndex, toIndex, token) {
  const forward = toIndex > fromIndex;
  const clipIndex = forward ? fromIndex : toIndex;
  const clip = clips[clipIndex];
  const travelStart = at(clipIndex * (HOLD + TRAVEL) + HOLD);
  const travelEnd = at((clipIndex + 1) * (HOLD + TRAVEL));
  const duration = Number.isFinite(clip.video.duration)
    ? clip.video.duration * 1000 / PLAYBACK_RATES[clipIndex]
    : [5042,4042,4000,4000,4000,4000][clipIndex] / PLAYBACK_RATES[clipIndex];
  if (forward) {
    if (!await animateScroll(travelStart, 380, ease, token)) return false;
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
const nearestStop = () => Math.max(0, Math.min(lastStop, Math.round(((scrollY - journeyTop())/innerHeight - stopPosition(0))/(HOLD+TRAVEL))));
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
  const distance=(scrollY - journeyTop())/innerHeight;
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
function resize(){ $('#journey').style.height=`${(TOTAL+1)*innerHeight}px`;wake(); }
addEventListener('scroll',wake,{passive:true});addEventListener('resize',resize);
addEventListener('wheel',onWheel,{passive:false});
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
$('.hero-scroll').addEventListener('click',event=>{event.preventDefault();step(true);});
reduced.addEventListener('change',wake);
resize();
requestAnimationFrame(()=>{ currentStop = nearestStop(); wake(); });
