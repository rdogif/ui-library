export function asciiRipple(root, options = {}) {
  const o = { characters: '.:+*#@/\\-~', density: 18, strength: 22, speed: 180, damping: 5, color: '#c6f66b', fontSize: 12, radius: 90, ...options };
  const canvas = document.createElement('canvas'); root.append(canvas);
  canvas.setAttribute('aria-label','Interactive ASCII ripple field. Drag to create waves.');canvas.setAttribute('role','img');
  canvas.style.cssText='width:100%;height:100%;display:block;touch-action:none';
  const ctx=canvas.getContext('2d'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let w=0,h=0,points=[],waves=[],pointer=null,raf=0,last=0,visible=true;
  const paint=(dt=0)=>{
    ctx.clearRect(0,0,w,h);ctx.font=`${o.fontSize}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
    let unsettled=false;
    for(const p of points){
      let force=0;
      for(const wave of waves){const d=Math.hypot(p.x-wave.x,p.y-wave.y),front=wave.age*o.speed;force+=Math.sin((d-front)/15)*Math.exp(-(((d-front)/38)**2))*wave.power*Math.exp(-wave.age*1.7);}
      if(pointer){const d=Math.hypot(p.x-pointer.x,p.y-pointer.y);force+=Math.max(0,1-d/o.radius)*o.strength*.25;}
      if(reduced.matches)force=0;
      p.v+=(force-p.z)*65*dt;p.v*=Math.exp(-o.damping*dt);p.z+=p.v*dt;
      if(Math.abs(p.v)+Math.abs(p.z)>.02)unsettled=true;
      ctx.fillStyle=o.color;ctx.globalAlpha=Math.min(.95,.24+Math.abs(p.z)/18);
      ctx.fillText(o.characters[(p.i+Math.floor(Math.abs(p.z)*.3))%o.characters.length],p.x+p.z*.35,p.y+p.z);
    }
    ctx.globalAlpha=1;return unsettled;
  };
  function tick(t){raf=0;const dt=Math.min((t-(last||t))/1000,.032);last=t;waves.forEach(x=>x.age+=dt);waves=waves.filter(x=>x.age<2.6);const active=paint(dt);if(visible&&(active||waves.length))raf=requestAnimationFrame(tick);else last=0;}
  const wake=()=>{if(!raf&&visible)raf=requestAnimationFrame(tick)};
  const resize=new ResizeObserver(()=>{const r=root.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);points=[];for(let y=14;y<h;y+=o.density)for(let x=14;x<w;x+=o.density)points.push({x,y,z:0,v:0,i:points.length});paint();});resize.observe(root);
  let previous=null,lastWave=0;
  function move(e){const r=canvas.getBoundingClientRect(),now=performance.now();const p={x:e.clientX-r.left,y:e.clientY-r.top};const velocity=previous?Math.hypot(p.x-previous.x,p.y-previous.y)/Math.max(1,now-previous.t):0;pointer=p;if(now-lastWave>35&&!reduced.matches){waves.push({...p,age:0,power:o.strength*Math.min(2.4,.35+velocity*.7)});lastWave=now;}previous={...p,t:now};wake();}
  function leave(){pointer=null;previous=null;wake()}
  function down(e){if(e.pointerType!=='mouse'){canvas.style.touchAction='none';canvas.setPointerCapture(e.pointerId)}move(e)}
  canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerleave',leave);canvas.addEventListener('pointerup',leave);canvas.addEventListener('pointercancel',leave);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;last=0}});observer.observe(root);
  return ()=>{cancelAnimationFrame(raf);resize.disconnect();observer.disconnect();canvas.remove()};
}

export function liquidMagnet(root, options = {}) {
  const o={strength:.28,radius:180,size:190,borderRadius:60,opacity:.15,blur:12,highlight:.8,stiffness:135,damping:17,...options};
  root.innerHTML='<div class="liquid-orbit"><span class="orbit-label">GET A LITTLE CLOSER</span><button class="liquid-button"><span>Explore the unusual</span><b>↗</b></button><span class="orbit-coordinate">MAGNETIC FIELD / ACTIVE</span></div>';
  const button=root.querySelector('button'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  button.style.cssText=`width:${o.size}px;border-radius:${o.borderRadius}px;--glass:${o.opacity};--blur:${o.blur}px;--shine:${o.highlight}`;
  let x=0,y=0,vx=0,vy=0,tx=0,ty=0,last=0,raf=0,rect;
  const resize=new ResizeObserver(()=>{const r=root.getBoundingClientRect();rect={x:r.left+r.width/2,y:r.top+r.height/2}});resize.observe(root);
  function tick(t){raf=0;const dt=Math.min((t-(last||t))/1000,.025);last=t;vx+=((tx-x)*o.stiffness-vx*o.damping)*dt;vy+=((ty-y)*o.stiffness-vy*o.damping)*dt;x+=vx*dt;y+=vy*dt;button.style.transform=`translate(${x}px,${y}px) rotate(${x*.035}deg) scale(${1+Math.min(.035,Math.abs(vx)*.0001)},${1-Math.min(.02,Math.abs(vy)*.0001)})`;if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy)>.03)raf=requestAnimationFrame(tick);else last=0;}
  const wake=()=>{if(!raf)raf=requestAnimationFrame(tick)};
  function move(e){if(e.pointerType==='touch'||reduced.matches)return;const r=root.getBoundingClientRect();rect={x:r.left+r.width/2,y:r.top+r.height/2};const dx=e.clientX-rect.x,dy=e.clientY-rect.y,d=Math.hypot(dx,dy),pull=Math.max(0,1-d/o.radius);tx=Math.max(-32,Math.min(32,dx*o.strength*pull));ty=Math.max(-24,Math.min(24,dy*o.strength*pull));button.style.setProperty('--light-x',`${50+dx/o.radius*40}%`);button.style.setProperty('--light-y',`${50+dy/o.radius*40}%`);wake()}
  const leave=()=>{tx=ty=0;wake()};
  const click=()=>{button.querySelector('span').textContent='Curiosity looks good.';button.classList.add('activated')};button.addEventListener('click',click);
  root.addEventListener('pointermove',move);root.addEventListener('pointerleave',leave);
  return ()=>{cancelAnimationFrame(raf);resize.disconnect();root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',leave);root.replaceChildren()};
}

export function magneticDock(root, options={}) {
  const o={scale:1.7,radius:110,...options};
  root.innerHTML='<div class="dock-wrap"><p class="dock-status">YOUR NEXT DESTINATION</p><div class="dock" role="toolbar" aria-label="Demo navigation"></div></div>';
  const dock=root.querySelector('.dock'),status=root.querySelector('p'),labels=['Home','Explore','Layers','Messages','Settings'],icons=['⌂','⌕','▱','☏','⚙'];
  labels.forEach((label,i)=>{const b=document.createElement('button');b.innerHTML=`<span>${icons[i]}</span><small>${label}</small>`;b.setAttribute('aria-label',label);b.onclick=()=>{status.textContent=label.toUpperCase()+' / SELECTED';dock.querySelectorAll('button').forEach(x=>x.removeAttribute('aria-pressed'));b.setAttribute('aria-pressed','true')};dock.append(b)});
  const buttons=[...dock.children],reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const reset=()=>buttons.forEach(b=>b.style.setProperty('--scale',1));
  const move=e=>{if(reduced.matches)return;buttons.forEach(b=>{const r=b.getBoundingClientRect(),d=Math.abs(e.clientX-(r.left+r.width/2));b.style.setProperty('--scale',1+Math.max(0,1-d/o.radius)*(o.scale-1))})};
  dock.addEventListener('pointermove',move);dock.addEventListener('pointerleave',reset);
  buttons.forEach(b=>{b.onfocus=()=>{reset();b.style.setProperty('--scale',reduced.matches?1:o.scale)};b.onblur=reset;b.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();buttons[(buttons.indexOf(b)+(e.key==='ArrowRight'?1:4))%5].focus()}}});
  return ()=>root.replaceChildren();
}

export function textScramble(root, options={}) {
  const o={duration:900,text:'MAKE SOME NOISE.',...options};
  root.innerHTML='<div class="scramble-wrap"><span class="scramble-index">DECODING THE ORDINARY</span><button class="scramble" aria-label="Replay text reveal"></button><span class="scramble-hint">CLICK TO DECODE ↗</span></div>';
  const b=root.querySelector('button');let raf=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');b.textContent=o.text;
  function play(){cancelAnimationFrame(raf);if(reduced.matches){b.textContent=o.text;return}const start=performance.now();function tick(t){const p=Math.min(1,(t-start)/o.duration);b.textContent=[...o.text].map((c,i)=>c===' '||i<Math.floor(p*o.text.length)?c:'<>/#_01'[Math.floor(Math.random()*7)]).join('');if(p<1)raf=requestAnimationFrame(tick)}raf=requestAnimationFrame(tick)}
  b.addEventListener('click',play);b.addEventListener('pointerenter',play);b.addEventListener('focus',play);
  return ()=>{cancelAnimationFrame(raf);root.replaceChildren()};
}

export function morphToggle(root, options={}) {
  const o={size:90,speed:400,...options};
  root.innerHTML='<div class="toggle-wrap"><span class="toggle-meta">A SMALL CHANGE OF STATE</span><button class="morph-toggle" role="switch" aria-checked="false" aria-label="Creative mode"><span></span></button><p>LOGIC <i>/</i> <b>PLAY</b></p><span class="toggle-status">LOGIC MODE</span></div>';
  const b=root.querySelector('button');b.style.cssText=`width:${o.size}px;height:${o.size*.52}px;--duration:${o.speed}ms`;
  b.onclick=()=>{const on=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',on);root.querySelector('.toggle-status').textContent=on?'PLAY MODE':'LOGIC MODE'};
  return ()=>root.replaceChildren();
}

export function commandMenu(root, options={}) {
  const o={width:320,...options};
  root.innerHTML='<div class="command" style="width:'+o.width+'px"><div class="command-input"><span>⌕</span><input placeholder="Where to next?" aria-label="Search commands" role="combobox" aria-expanded="true" aria-autocomplete="list"><kbd>↓↑</kbd></div><div class="command-results" role="listbox" aria-label="Commands"></div><div class="command-footer">NAVIGATE WITH ↑ ↓ <span>↵ SELECT</span></div></div>';
  const input=root.querySelector('input'),list=root.querySelector('[role=listbox]'),items=['Explore components','View source on GitHub','Toggle creative mode','Back to the beginning'];let filtered=items,index=0,selected='';const uid='cmd-'+Math.random().toString(36).slice(2);
  function render(){list.replaceChildren();filtered.forEach((label,i)=>{const b=document.createElement('div');b.id=uid+i;b.setAttribute('role','option');b.setAttribute('aria-selected',String(i===index));b.textContent=label;b.addEventListener('pointerdown',e=>e.preventDefault());b.onclick=()=>choose(i);list.append(b)});if(!filtered.length){const p=document.createElement('p');p.textContent='No matching commands';list.append(p);input.removeAttribute('aria-activedescendant')}else input.setAttribute('aria-activedescendant',uid+index)}
  function choose(i){selected=filtered[i];root.querySelector('.command-footer').textContent='✓ '+selected;input.value='';filtered=items;index=0;render();root.dispatchEvent(new CustomEvent('command',{detail:selected,bubbles:true}))}
  input.oninput=()=>{filtered=items.filter(x=>x.toLowerCase().includes(input.value.toLowerCase()));index=0;render()};input.onkeydown=e=>{if(['ArrowDown','ArrowUp','Enter','Escape'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='Escape'){input.value='';filtered=items;index=0}else if(e.key==='Enter'&&filtered.length)choose(index);else if(filtered.length)index=(index+(e.key==='ArrowDown'?1:filtered.length-1))%filtered.length;render()}};render();
  return ()=>root.replaceChildren();
}

