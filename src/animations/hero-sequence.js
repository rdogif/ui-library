import { sequenceConfig } from './sequence-config.js';
const { frameCount, holdFrame, openingDuration } = sequenceConfig;
export const frameAtProgress = progress => holdFrame + Math.round(Math.max(0, Math.min(1, progress)) * (frameCount-holdFrame));
export async function heroSequence() {
  const region = document.querySelector('.sequence'), hero = region.querySelector('.hero');
  const canvas = document.querySelector('#sequence'), ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let images = [], current = 1, ready = false, raf = 0, destroyed = false, start;
  const progress = () => Math.max(0, Math.min(1, -region.getBoundingClientRect().top / Math.max(1, region.offsetHeight - hero.offsetHeight)));
  function draw(n) {
    if (!images[n-1]) return;
    current = n; const img = images[n-1];
    const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    if(canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)){ canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr); }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const scale = Math.max(w/img.naturalWidth,h/img.naturalHeight);
    ctx.drawImage(img,(w-img.naturalWidth*scale)/2,(h-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);
    canvas.dataset.frame=n;
    document.querySelector('.progress i').style.width=`${(n-1)/(frameCount-1)*100}%`;
  }
  function sync(){ raf=0;if(!ready)return;const p=reduced.matches?0:progress();draw(frameAtProgress(p));hero.querySelector('.hero-copy').style.opacity=String(Math.max(0,1-p*1.65)); }
  function scroll(){if(ready&&!raf)raf=requestAnimationFrame(sync)}
  function finish(){raf=0;draw(holdFrame);ready=true;hero.classList.add('ready');if(progress()>0)raf=requestAnimationFrame(sync)}
  function autoplay(t){if(destroyed)return;start??=t;draw(Math.min(holdFrame,1+Math.floor((t-start)/openingDuration*(holdFrame-1))));if(current<holdFrame&&!reduced.matches)raf=requestAnimationFrame(autoplay);else finish()}
  try {
    images = await Promise.all(Array.from({length:frameCount},(_,i)=>new Promise((resolve,reject)=>{const img=new Image();img.src=`${import.meta.env.BASE_URL}frames/frame_${String(i+1).padStart(3,'0')}.jpg`;img.onload=()=>img.decode().then(()=>resolve(img),reject);img.onerror=reject;})));
    if(destroyed)return;
    draw(reduced.matches?holdFrame:1);if(reduced.matches)finish();else raf=requestAnimationFrame(autoplay);
  } catch { hero.classList.add('ready');document.querySelector('.load-error').textContent='The sequence could not load. The collection is ready below.';region.style.height='100svh'; }
  const resize=new ResizeObserver(()=>{draw(current);if(ready)scroll()});resize.observe(hero);
  addEventListener('scroll',scroll,{passive:true});reduced.addEventListener('change',scroll);
  return ()=>{destroyed=true;cancelAnimationFrame(raf);resize.disconnect();removeEventListener('scroll',scroll);reduced.removeEventListener('change',scroll)};
}

