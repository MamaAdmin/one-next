// @ts-nocheck
/* one-next KI-Werkstatt: 3D-Szene (Three.js r128), HUD und Scroll-Steuerung.
   initWerkstatt() startet alles und gibt eine Aufräumfunktion zurück (für React useEffect). */
import * as THREE from "three";

export function initWerkstatt(): () => void {
  let dead = false, raf = 0;
  const offs = [];
  function on(t, ev, fn, opt) { t.addEventListener(ev, fn, opt); offs.push(() => t.removeEventListener(ev, fn, opt)); }
  function cleanup() {
    if (dead) return;
    dead = true;
    cancelAnimationFrame(raf);
    offs.forEach(f => f()); offs.length = 0;
    try { typeTok++; clearTimeout(swapTimer); } catch (e) {}
    try { rail.innerHTML = ''; segsEl.innerHTML = ''; } catch (e) {}
    try { labels.forEach(l => l.el.remove()); } catch (e) {}
    try { bubble.classList.remove('show'); } catch (e) {}
    document.body.classList.remove('past', 'in-phase');
    document.documentElement.classList.remove('no-webgl');
    try {
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      });
    } catch (e) {}
    try { if (renderer) renderer.dispose(); } catch (e) {}
  }


  /* ---------- Grundlagen ---------- */
  const html=document.documentElement, body=document.body;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>t*t*(3-2*t);
  const pick=a=>a[Math.random()*a.length|0];
  function angLerp(a,b,t){ let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; return a+d*t; }
  const pad2=n=>String(n).padStart(2,'0');

  const PHASES = [
    {name:'Problem Framing', dur:'1 Tag', text:'Bevor wir über KI sprechen, klären wir das eigentliche Geschäftsproblem: Wer ist betroffen, was kostet es heute, woran messen wir Erfolg? Im Workshop oder selbstgeführt im Online-Tool.', arts:['Problem Statement','Erfolgskriterien','Stakeholder-Map'], cmd:'frame --problem "Rechnungsfreigabe dauert 9 Tage"', out:'✓ Problem Statement · 3 Erfolgskriterien · 5 Stakeholder'},
    {name:'KI Design Sprint', dur:'2 Tage', text:'In zwei Tagen entwickeln wir mit Ihrem Team Lösungsideen, entscheiden uns für die stärkste und testen einen Prototyp mit echten Nutzerinnen und Nutzern. Danach wissen Sie, ob sich der Use Case lohnt.', arts:['Prototyp','Nutzertests','Entscheidung'], cmd:'sprint --tage 2 --team 6', out:'✓ 12 Ideen · 1 Prototyp · 5 Nutzertests'},
    {name:'KI-Arbeitsablauf entwickeln', dur:'2–6 Wochen', text:'Aus dem validierten Ansatz bauen wir einen KI-Arbeitsablauf mit klaren Rollen, sauber angebundenen Daten, eingebauten Prüfungen und menschlicher Freigabe. Entwickelt nach der BMAD-Methode, Schritt für Schritt.', arts:['KI-Agenten','Schnittstellen','Rollenmodell'], cmd:'bmad build --workflow rechnungseingang', out:'✓ 3 Agenten · 2 Schnittstellen · 4 Freigabepunkte'},
    {name:'Prüfen & Freigeben', dur:'laufend', text:'Jeder Arbeitsablauf durchläuft Tests sowie Datenschutz- und Sicherheitsprüfungen. Entscheidungen mit Tragweite trifft immer ein Mensch. Was nicht besteht, geht mit Begründung zurück in die Werkstatt.', arts:['Testprotokoll','Datenschutz-Check','Human in the Loop'], cmd:'check --governance --human-review', out:'✓ 128/128 Prüfungen · 0 kritische Befunde'},
    {name:'Wirkung & Skalierung', dur:'fortlaufend', text:'Wir messen, was der Arbeitsablauf tatsächlich bewirkt, und vergleichen mit den Erfolgskriterien aus Schritt 1. Was belegt wirkt, rollen wir auf weitere Teams und Prozesse aus.', arts:['KPI-Dashboard','Wirkungsbericht','Rollout-Plan'], cmd:'measure --baseline schritt-1 && rollout --teams 3', out:'✓ Durchlaufzeit −58 % · Rollout auf 3 Teams'}
  ];

  /* ---------- HUD ---------- */
  const $=id=>document.getElementById(id);
  const hero=$('hero'), rail=$('rail'), card=$('card'), controls=$('controls'), labelsEl=$('labels'), track=$('track');
  const cardNo=$('cardNo'), cardDur=$('cardDur'), cardBody=$('cardBody'), cardTitle=$('cardTitle'), cardText=$('cardText'), cardArts=$('cardArts');
  const termCmd=$('termCmd'), termOut=$('termOut'), cardCta=$('cardCta'), segsEl=$('segs');
  const railBtns=[], segBtns=[];

  let W=window.innerWidth, H=window.innerHeight, maxScroll=1;
  let topSafe=80;
  function measure(){ W=window.innerWidth; H=window.innerHeight; maxScroll=Math.max(1,track.offsetHeight-window.innerHeight); topSafe=document.querySelector('.topbar').getBoundingClientRect().bottom+34; }
  measure();

  const NSTEP=PHASES.length;
  function jump(k){ window.scrollTo({top:k/NSTEP*maxScroll, behavior:reduce?'auto':'smooth'}); }

  PHASES.forEach((p,i)=>{
    const b=document.createElement('button'); b.type='button';
    b.innerHTML=`<span class="r-no">${pad2(i+1)}</span><span class="r-name">${p.name}</span>`;
    b.addEventListener('click',()=>jump(i+1)); rail.appendChild(b); railBtns.push(b);
    const s=document.createElement('button'); s.type='button'; s.className='seg';
    s.setAttribute('aria-label',`Zu Schritt ${i+1}: ${p.name}`); s.innerHTML='<i></i>';
    s.addEventListener('click',()=>jump(i+1)); segsEl.appendChild(s); segBtns.push(s);
  });

  function fillCard(k){
    const p=PHASES[k-1];
    cardTitle.textContent=p.name; cardText.textContent=p.text;
    cardArts.innerHTML=''; p.arts.forEach(a=>{ const li=document.createElement('li'); li.textContent=a; cardArts.appendChild(li); });
  }
  let typeTok=0, swapTimer=0, curStep=0;
  function typeTerm(cmd,out){
    const tok=++typeTok;
    termOut.classList.remove('show'); termOut.textContent=out;
    if(reduce){ termCmd.textContent=cmd; termOut.classList.add('show'); return; }
    termCmd.textContent=''; let i=0;
    (function step(){
      if(tok!==typeTok) return;
      if(i<cmd.length){ termCmd.textContent=cmd.slice(0,++i); setTimeout(step,24); }
      else setTimeout(()=>{ if(tok===typeTok) termOut.classList.add('show'); },320);
    })();
  }
  function setStep(k){
    const p=PHASES[k-1];
    cardNo.textContent=`SCHRITT ${pad2(k)} / ${pad2(NSTEP)}`; cardDur.textContent=p.dur;
    cardCta.hidden = k!==NSTEP;
    cardBody.classList.add('swap'); clearTimeout(swapTimer);
    swapTimer=setTimeout(()=>{ fillCard(k); cardBody.classList.remove('swap'); },180);
    typeTerm(p.cmd,p.out);
  }
  fillCard(1); cardDur.textContent=PHASES[0].dur;

  let timeScale=reduce?0.5:1;
  const speedBtns=[...controls.querySelectorAll('button[data-speed]')];
  if(reduce) speedBtns.forEach(b=>b.classList.remove('on'));
  speedBtns.forEach(b=>on(b,'click',()=>{ timeScale=+b.dataset.speed; speedBtns.forEach(o=>o.classList.toggle('on',o===b)); }));

  function hud(u,exitA){
    const heroA=1-clamp((u-0.1)/0.35,0,1);
    hero.style.opacity=heroA; hero.style.visibility=heroA<=0.001?'hidden':''; hero.style.transform=`translateY(${(1-heroA)*16}px)`;
    const cardA=clamp((u-0.45)/0.3,0,1)*exitA;
    card.style.opacity=cardA; rail.style.opacity=cardA;
    card.style.visibility=rail.style.visibility=cardA<=0.001?'hidden':'';
    card.style.pointerEvents=rail.style.pointerEvents=cardA>0.5?'auto':'none';
    controls.style.opacity=exitA; labelsEl.style.opacity=exitA;
    body.classList.toggle('past',exitA<=0);
    body.classList.toggle('in-phase',cardA>0.5);
    const k=clamp(Math.round(u),1,NSTEP), f=clamp(u-(k-0.5),0,1);
    const active=cardA>0.01?k:0;
    if(active!==curStep){ curStep=active; if(active>0) setStep(active); }
    railBtns.forEach((b,i)=>{ const n=i+1; b.classList.toggle('on',n===k); b.classList.toggle('done',n<k); if(n===k) b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current'); });
    segBtns.forEach((s,i)=>{ const n=i+1; s.classList.toggle('on',n===k); s.classList.toggle('done',n<k); s.style.setProperty('--f',n===k?f.toFixed(3):'0'); });
  }
  function scrollState(){
    const sy=window.scrollY;
    return {sy, uT:clamp(sy/maxScroll,0,1)*NSTEP, exitA:1-clamp((sy-maxScroll)/(window.innerHeight*0.3),0,1)};
  }

  /* ---------- Renderer ---------- */
  const canvas=$('scene');
  let renderer=null;
  try{
    renderer=new THREE.WebGLRenderer({canvas, antialias:true});
  }catch(e){ renderer=null; }
  if(!renderer){
    html.classList.add('no-webgl');
    on(window,'resize',measure);
    (function hudOnly(){ if(dead) return; const s=scrollState(); hud(s.uT,s.exitA); raf=requestAnimationFrame(hudOnly); })();
    return cleanup;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setClearColor(0xF4F1EB,1);
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setSize(W,H,false);

  const scene=new THREE.Scene();
  const cam=new THREE.OrthographicCamera(-10,10,10,-10,20,320);
  const DIR=new THREE.Vector3(-1,1.08,0.82).normalize();
  const RIGHT=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),DIR).normalize();
  const UP=new THREE.Vector3().crossVectors(DIR,RIGHT).normalize();
  const lin = c => new THREE.Color(c).convertSRGBToLinear();

  scene.add(new THREE.HemisphereLight(lin(0xFFFFFF),lin(0xEAE4DA),0.62));
  const sun=new THREE.DirectionalLight(lin(0xFFF8F0),0.62);
  const SUN_OFF=new THREE.Vector3(-2,10,4.5).normalize().multiplyScalar(60);
  sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.bias=-0.0006; sun.shadow.normalBias=0.03;
  sun.shadow.camera.near=1; sun.shadow.camera.far=160;
  scene.add(sun); scene.add(sun.target);

  const C={cream:0xF4F1EB, paper:0xFAF8F5, white:0xFFFFFF, floor:0xEEEAE3, pad:0xE6E1DB, sand:0xD8D1CB, accent:0x5B7D9A, accentStrong:0x37526C, brand:0x304255, bot:0x4C6176, ink:0x29231E, slate:0x4A4F55, dark:0x1B2127,
    gold:0xD09125, sky:0x8FB0CB, green:0x5E8F6E, rose:0xD9A79B, lilac:0xA9B3CF, mint:0xA9CDB8, kraft:0xC9A27A, tape:0xE6CFA8, red:0xB5523F, emblem:0xF8F5F2};

  /* ---------- Geometrie-Helfer ---------- */
  const matCache=new Map();
  function mat(c,rough){ const k=c+'|'+(rough||0); if(!matCache.has(k)) matCache.set(k,new THREE.MeshStandardMaterial({color:lin(c),roughness:rough||0.62,metalness:0})); return matCache.get(k); }
  const geoCache=new Map();
  function cached(key,make){ if(!geoCache.has(key)) geoCache.set(key,make()); return geoCache.get(key); }

  function mapAxis(c,half,r,seg){ const n=2*seg+1, k=c*n, a=Math.abs(k); if(a<=0.5) return k*2*(half-r); return Math.sign(k)*((half-r)+(a-0.5)/seg*r); }
  function rgeo(w,h,d,r,seg){
    seg=seg||2; r=Math.max(0.002,Math.min(r,w/2-1e-4,h/2-1e-4,d/2-1e-4));
    return cached(`r${w}|${h}|${d}|${r.toFixed(4)}|${seg}`,()=>{
      const n=2*seg+1, g=new THREE.BoxGeometry(1,1,1,n,n,n);
      const P=g.attributes.position, N=g.attributes.normal, U=g.attributes.uv, hs=[w/2,h/2,d/2];
      const p=[0,0,0], inn=[0,0,0], off=[0,0,0];
      for(let i=0;i<P.count;i++){
        const o=[P.getX(i),P.getY(i),P.getZ(i)];
        for(let a=0;a<3;a++) p[a]=mapAxis(o[a],hs[a],r,seg);
        const nx=Math.abs(N.getX(i)), ny=Math.abs(N.getY(i));
        const ua=nx>0.5?2:0, va=ny>0.5?2:1;
        U.setXY(i, mapAxis(U.getX(i)-0.5,hs[ua],r,seg)/(2*hs[ua])+0.5, mapAxis(U.getY(i)-0.5,hs[va],r,seg)/(2*hs[va])+0.5);
        let len=0; for(let a=0;a<3;a++){ inn[a]=clamp(p[a],-(hs[a]-r),hs[a]-r); off[a]=p[a]-inn[a]; len+=off[a]*off[a]; }
        len=Math.sqrt(len);
        if(len>1e-6){ for(let a=0;a<3;a++) p[a]=inn[a]+off[a]/len*r; N.setXYZ(i,off[0]/len,off[1]/len,off[2]/len); }
        P.setXYZ(i,p[0],p[1],p[2]);
      }
      g.translate(0,h/2,0); return g;
    });
  }
  function pgeo(w,h,d){ return cached(`p${w}|${h}|${d}`,()=>{ const g=new THREE.BoxGeometry(w,h,d); g.translate(0,h/2,0); return g; }); }
  function rcgeo(r,h,f,s){ f=Math.min(f,r*0.5,h*0.5); return cached(`c${r}|${h}|${f}|${s}`,()=>{
    const V=THREE.Vector2, pts=[new V(0,0),new V(r-f,0)];
    for(let i=1;i<=6;i++){ const a=-Math.PI/2+i/6*Math.PI/2; pts.push(new V(r-f+Math.cos(a)*f,f+Math.sin(a)*f)); }
    for(let i=0;i<=6;i++){ const a=i/6*Math.PI/2; pts.push(new V(r-f+Math.cos(a)*f,h-f+Math.sin(a)*f)); }
    pts.push(new V(0,h)); return new THREE.LatheGeometry(pts,s||36); }); }
  function capgeo(r,len){ return cached(`k${r}|${len}`,()=>{ const V=THREE.Vector2, pts=[];
    for(let i=0;i<=8;i++){ const a=-Math.PI/2+i/8*Math.PI/2; pts.push(new V(Math.max(0,Math.cos(a)*r),-len+Math.sin(a)*r)); }
    for(let i=0;i<=8;i++){ const a=i/8*Math.PI/2; pts.push(new V(Math.max(0,Math.cos(a)*r),Math.sin(a)*r)); }
    return new THREE.LatheGeometry(pts,14); }); }
  function sgeo(r){ return cached(`s${r}`,()=>new THREE.SphereGeometry(r,24,16)); }

  const M=(c)=>typeof c==='number'?mat(c):c;
  let CUR=scene;
  function mk(g,m,x,y,z,parent){ const o=new THREE.Mesh(g,m); o.position.set(x||0,y||0,z||0); (parent||CUR).add(o); return o; }
  function box(w,h,d,c,x,y,z,parent,r){ return mk(rgeo(w,h,d,r===undefined?Math.min(0.2,Math.min(w,h,d)*0.3):r),M(c),x,y,z,parent); }
  function pbox(w,h,d,c,x,y,z,parent){ return mk(pgeo(w,h,d),M(c),x,y,z,parent); }
  function cyl(r,h,c,x,y,z,parent,f){ return mk(rcgeo(r,h,f===undefined?Math.min(0.08,r*0.3,h*0.3):f),M(c),x,y,z,parent); }
  function sph(r,c,x,y,z,parent){ return mk(sgeo(r),M(c),x,y,z,parent); }
  function grp(x,y,z,parent){ const g=new THREE.Group(); g.position.set(x||0,y||0,z||0); (parent||CUR).add(g); return g; }
  function tbox(w,h,d,c,face,tex,x,y,z,parent,lit){ const b=mat(c); const ms=[b,b,b,b,b,b]; ms[face]=lit?new THREE.MeshStandardMaterial({map:tex,roughness:0.8}):new THREE.MeshBasicMaterial({map:tex}); return mk(rgeo(w,h,d,Math.min(0.06,Math.min(w,h,d)*0.3)),ms,x,y,z,parent); }

  const texDrawers=[];
  function canvasTex(w,h,draw){ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const ctx=cv.getContext('2d'); const tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=renderer.capabilities.getMaxAnisotropy(); const api={ctx,tex,w,h,draw(){ draw(ctx,w,h); tex.needsUpdate=true; }}; api.draw(); texDrawers.push(api); return api; }
  const F={sans:'"Inter", system-ui, sans-serif', mono:'"JetBrains Mono", ui-monospace, monospace', serif:'"Instrument Serif", Georgia, serif'};
  function rr(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }

  /* ---------- Strecke ---------- */
  const SX=[0,18,54,72,90];                       // Problem Framing, Sprint (Frame A) · Entwickeln, Prüfen, Wirkung (Frame B)
  const X0=-9, LA=37, RC=7, LARC=Math.PI/2*RC, TX=X0+LA, SB=LA+LARC;
  const BELT_LEN=SB+59, BELT_Y=0.69;
  function pathAt(s,o){ o=o||{}; if(s<=LA){ o.x=X0+s; o.z=0; o.a=0; } else if(s<=SB){ const t=(s-LA)/RC; o.x=TX+Math.sin(t)*RC; o.z=RC-Math.cos(t)*RC; o.a=-t; } else { o.x=TX+RC; o.z=RC+(s-SB); o.a=-Math.PI/2; } return o; }
  const FB=new THREE.Group(); FB.rotation.y=-Math.PI/2; FB.position.set(TX+RC,0,RC+9-SB); scene.add(FB); FB.updateMatrixWorld(true);
  const FR=[scene,scene,FB,FB,FB], SOFF=[9,9,9,9,9];
  const ST_QA=3;                                   // Index der Station "Prüfen & Freigeben"
  const TH=SX.map(x=>x+1.2);
  const THS=SX.map((x,i)=>x+1.2+SOFF[i]);
  function toWorld(frame,x,y,z){ const v=new THREE.Vector3(x,y,z); return frame===scene?v:frame.localToWorld(v); }
  function inFrame(i,fn){ const prev=CUR; CUR=FR[i]; fn(); CUR=prev; }
  function atPath(s){ const p=pathAt(s); const g=grp(p.x,0,p.z,scene); g.rotation.y=p.a; return g; }

  /* Boden */
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(700,700),mat(C.floor,0.9)); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  const grid=new THREE.GridHelper(700,350,lin(0xE4DED5),lin(0xE4DED5)); grid.position.y=0.006; scene.add(grid);
  SX.forEach((x,i)=>inFrame(i,()=>box(15.4,0.05,13.4,C.pad,x+0.5,0,-2,null,0.02)));
  for(let x=-14;x<26;x+=2.4){ box(1.1,0.03,0.16,C.sand,x,0.05,5.1,null,0.012); box(1.1,0.03,0.16,C.sand,x,0.05,2.35,null,0.012); }
  inFrame(2,()=>{ for(let x=45;x<106;x+=2.4){ box(1.1,0.03,0.16,C.sand,x,0.05,5.1,null,0.012); box(1.1,0.03,0.16,C.sand,x,0.05,2.35,null,0.012); } });

  /* Förderband */
  const beltSamples=[]; for(let q=0;q<=BELT_LEN+1e-6;q+=0.5) beltSamples.push(pathAt(q,{}));
  const side=(p,o)=>[p.x+Math.sin(p.a)*o, p.z+Math.cos(p.a)*o];
  (()=>{
    const pts=beltSamples.map(p=>side(p,1.18)).concat(beltSamples.map(p=>side(p,-1.18)).reverse());
    const shp=new THREE.Shape(); shp.moveTo(pts[0][0],-pts[0][1]); for(let i=1;i<pts.length;i++) shp.lineTo(pts[i][0],-pts[i][1]);
    const g=new THREE.ExtrudeGeometry(shp,{depth:0.38,bevelEnabled:true,bevelThickness:0.12,bevelSize:0.12,bevelSegments:5,steps:1});
    g.rotateX(-Math.PI/2); g.translate(0,0.18,0); mk(g,mat(C.paper),0,0,0,scene);
  })();
  for(let q=2;q<BELT_LEN;q+=8) box(0.5,0.08,2.3,C.slate,0,0,0,atPath(q));
  const beltTex=canvasTex(256,64,(x,w,h)=>{ x.fillStyle='#D3CCC3'; x.fillRect(0,0,w,h); x.fillStyle='#C4BCB2'; x.fillRect(0,0,14,h); x.fillRect(128,0,14,h); });
  beltTex.tex.wrapS=THREE.RepeatWrapping;
  (()=>{ const pos=[],uv=[],nor=[],idx=[];
    beltSamples.forEach((p,i)=>{ const l=side(p,-1.1), r=side(p,1.1); pos.push(l[0],0.684,l[1], r[0],0.684,r[1]); nor.push(0,1,0,0,1,0); const u=i*0.25; uv.push(u,0,u,1); if(i>0){ const a=(i-1)*2; idx.push(a,a+1,a+2, a+1,a+3,a+2); } });
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx);
    return mk(g,new THREE.MeshStandardMaterial({map:beltTex.tex,roughness:0.9}),0,0,0,scene); })();
  [-1.22,1.22].forEach(o=>{ const pts=beltSamples.filter((_,i)=>i%2===0).map(p=>{ const q=side(p,o); return new THREE.Vector3(q[0],0.66,q[1]); }); mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),700,0.09,10,false),mat(C.paper),0,0,0,scene); });
  [18,72,90].forEach(q=>{ const g=atPath(q); const d=cyl(0.34,0.1,C.accent,0,0.37,1.28,g); d.rotation.x=Math.PI/2; const d2=cyl(0.13,0.12,C.paper,0,0.37,1.28,g); d2.rotation.x=Math.PI/2; });

  // Einlauf "Ihr Geschäftsproblem"
  box(3.2,2.3,3.2,C.paper,-11,0,0,null,0.4); box(3.3,0.34,3.3,C.brand,-11,2.2,0,null,0.15); sph(0.75,C.gold,-11,2.9,0);

  // Baum in der Innenseite der Kurve
  (()=>{ const cx=TX-0.6, cz=RC+0.6; cyl(1.1,0.6,C.paper,cx,0,cz,null,0.2); cyl(1.14,0.14,C.accent,cx,0.5,cz,null,0.06); cyl(0.14,1.3,C.kraft,cx,0.6,cz);
    sph(0.95,C.green,cx,2.3,cz); sph(0.7,C.green,cx+0.6,1.9,cz+0.3); sph(0.6,C.green,cx-0.55,2.0,cz-0.2); sph(0.55,0x86AE92,cx+0.1,2.95,cz+0.1); })();

  /* ---------- Werkstücke ---------- */
  const ITEM_SPEED=1.5, ITEM_GAP=4.8, ITEM_S0=-3;
  const N_ITEMS=Math.ceil((BELT_LEN+1.2-ITEM_S0)/ITEM_GAP), LOOP=N_ITEMS*ITEM_GAP;
  const ideaMat=new THREE.MeshStandardMaterial({color:lin(C.gold),emissive:lin(0xE0A53A),emissiveIntensity:0.35,roughness:0.4});
  function variant(k,parent){
    const g=grp(0,0,0,parent);
    switch(k){
      case 0: sph(0.34,ideaMat,0,0.36,0,g); break;
      case 1: box(1.0,0.06,1.3,C.white,0,0,0,g); [-0.4,-0.2,0].forEach(z=>pbox(0.64,0.012,0.07,0xC9C0B4,0,0.06,z,g)); pbox(0.32,0.012,0.07,C.accent,-0.16,0.06,0.28,g); break;
      case 2: [C.gold,C.mint,C.lilac].forEach((c,i)=>{ const b=box(0.95,0.08,0.62,c,0,i*0.085,0,g); b.rotation.y=[0,0.14,-0.1][i]; }); break;   // Sprint-Notizen
      case 3: box(1.05,0.5,1.05,C.dark,0,0,0,g); [[C.sky,-0.1,-0.3,0.5],[C.accent,0.05,-0.12,0.6],[C.green,0.12,0.06,0.4],[C.gold,-0.05,0.24,0.55]].forEach(s=>box(s[3],0.02,0.08,s[0],s[1],0.49,s[2],g,0.01)); break;   // KI-Arbeitsablauf
      case 4: { box(1.05,0.5,1.05,C.paper,0,0,0,g); const a=box(0.14,0.04,0.36,C.green,-0.16,0.49,0.08,g,0.02); a.rotation.y=0.8; const b=box(0.14,0.04,0.68,C.green,0.12,0.49,-0.04,g,0.02); b.rotation.y=-0.65; break; }   // geprüft
      case 5: box(1.15,0.95,1.15,C.kraft,0,0,0,g); box(0.26,0.97,1.17,C.tape,0,0,0,g,0.04); break;   // ausgerolltes Paket
      case 6: { box(1.05,0.5,1.05,C.red,0,0,0,g); const a=box(0.13,0.04,0.7,C.white,0,0.49,0,g,0.02); a.rotation.y=0.785; const b=box(0.13,0.04,0.7,C.white,0,0.49,0,g,0.02); b.rotation.y=-0.785; break; }
    }
    g.visible=false; return g;
  }
  const items=[];
  for(let i=0;i<N_ITEMS;i++){
    const g=grp(0,BELT_Y,0); const vs=[]; for(let k=0;k<7;k++) vs.push(variant(k,g));
    items.push({g,vs,s:ITEM_S0+i*ITEM_GAP,v:-1,cur:-1,fail:Math.random()<0.2,rej:null,gone:false});
  }
  function variantAt(q){ let v=0; for(let i=0;i<THS.length;i++) if(q>THS[i]) v=i+1; return v; }

  /* Pressen */
  const presses=[];
  SX.forEach((sx,i)=>{ if(i===ST_QA) return; inFrame(i,()=>{
    const x=TH[i];
    box(0.3,2.7,0.3,C.paper,x,0,1.62); box(0.3,2.7,0.3,C.paper,x,0,-1.62); box(0.56,0.4,3.56,C.paper,x,2.65,0);
    const lampMat=new THREE.MeshStandardMaterial({color:lin(C.green),emissive:lin(C.green),emissiveIntensity:0.4});
    sph(0.15,lampMat,x,3.12,0);
    const head=grp(x,2.05,0); cyl(0.07,1.2,C.slate,0,0.3,0,head); box(1.3,0.32,1.3,C.accent,0,0,0,head,0.14);
    presses.push({s:THS[i],head,lampMat});
  }); });
  const LAMP_GOLD=lin(C.gold), LAMP_GREEN=lin(C.green);

  /* ---------- Bots ---------- */
  const bots=[], hitMeshes=[];
  const shadowGeo=new THREE.CircleGeometry(0.6,28);
  const shadowMat=new THREE.MeshBasicMaterial({color:lin(0x3A3530),transparent:true,opacity:0.12,depthWrite:false});
  const hitMat=new THREE.MeshBasicMaterial({visible:false});
  const botMat=new THREE.MeshStandardMaterial({color:lin(C.bot),roughness:0.48});
  const emblemMat=new THREE.MeshStandardMaterial({color:lin(C.emblem),roughness:0.55});
  const EMBLEM=[[-0.119,0.1875,0.1625,0.125,0],[0.075,0.05,0.35,0.125,0],[0.175,-0.131,0.15,0.2375,0],[-0.1125,-0.0875,0.1375,0.325,-0.41]];
  const CAMF=Math.atan2(DIR.x,DIR.z);

  function limb(parent,x,y,z,r,l1,l2){
    const a=grp(x,y,z,parent); mk(capgeo(r,l1),botMat,0,0,0,a);
    const b=grp(0,-l1,0,a); mk(capgeo(r,l2),botMat,0,0,0,b);
    return {a,b};
  }
  function makeBot(o){
    const S=o.scale||0.92;
    const root=grp(o.x,0,o.z);
    const sh=new THREE.Mesh(shadowGeo,shadowMat); sh.rotation.x=-Math.PI/2; sh.position.y=0.02; root.add(sh);
    const hop=grp(0,0,0,root), body=grp(0,0,0,hop);
    mk(rgeo(1.05,1.05,0.6,0.24,3),botMat,0,0.55,0,body);
    const face=grp(0,1.075,0.302,body);
    EMBLEM.forEach(e=>{ const p=grp(e[0],e[1],0,face); p.rotation.z=e[4]; mk(rgeo(e[2],e[3],0.035,0.015),emblemMat,0,-e[3]/2,0,p); });
    const armL=limb(body,-0.52,1.0,0,0.055,0.26,0.24), armR=limb(body,0.52,1.0,0,0.055,0.26,0.24);
    sph(0.085,botMat,0,-0.27,0,armL.b).scale.set(1,1.1,0.8); sph(0.085,botMat,0,-0.27,0,armR.b).scale.set(1,1.1,0.8);
    const legs=[-0.2,0.2].map(lx=>{ const L=limb(hop,lx,0.62,0,0.065,0.25,0.25); const f=sph(0.12,botMat,0,-0.28,0.05,L.b); f.scale.set(0.95,0.55,1.4); return L; });
    const hit=new THREE.Mesh(pgeo(1.5,1.9,1.1),hitMat); root.add(hit);
    root.scale.setScalar(S); root.rotation.y=o.face===undefined?CAMF-CUR.rotation.y:o.face;
    const b={root,hop,body,armL,armR,legs,S,mode:o.mode||'idle',lines:o.lines,name:o.name,station:o.station,phase:Math.random()*10,hopT:-1,path:o.path||null,pi:0,at:0,wait:0,speed:o.speed||1.4,cheer:0,waitFace:o.waitFace,carry:o.carry!==undefined};
    if(b.carry) box(0.7,0.07,0.5,o.carry,0,1.62,0,body,0.03);
    if(o.tool==='lens'){ const ring=new THREE.Mesh(new THREE.TorusGeometry(0.17,0.04,10,28),mat(C.ink)); ring.position.set(0,-0.5,0.08); armR.b.add(ring); const glass=new THREE.Mesh(new THREE.CircleGeometry(0.15,24),new THREE.MeshStandardMaterial({color:lin(0xE4EBF1),transparent:true,opacity:0.75,roughness:0.1})); glass.position.copy(ring.position); armR.b.add(glass); }
    hit.userData.bot=b; hitMeshes.push(hit); bots.push(b); return b;
  }
  const faceTo=(dx,dz)=>Math.atan2(dx,dz);
  function setArm(A,x,z,ex,ez,k){ A.a.rotation.x=lerp(A.a.rotation.x,x,k); A.a.rotation.z=lerp(A.a.rotation.z,z,k); A.b.rotation.x=lerp(A.b.rotation.x,ex,k); A.b.rotation.z=lerp(A.b.rotation.z,ez||0,k); }
  function updateBot(b,dt,rdt,T){
    const t=T+b.phase; let moving=false;
    if(b.path){
      if(b.wait>0){ b.wait-=dt; if(b.waitFace!==undefined) b.root.rotation.y=angLerp(b.root.rotation.y,b.waitFace[b.at],Math.min(1,dt*5)); }
      else{
        const tg=b.path[b.pi], dx=tg[0]-b.root.position.x, dz=tg[1]-b.root.position.z, dist=Math.hypot(dx,dz);
        if(dist<0.04){ b.wait=1.6; b.at=b.pi; b.pi=(b.pi+1)%b.path.length; }
        else{ const st=Math.min(dist,b.speed*dt); b.root.position.x+=dx/dist*st; b.root.position.z+=dz/dist*st; b.root.rotation.y=angLerp(b.root.rotation.y,faceTo(dx,dz),Math.min(1,dt*8)); moving=dt>0; }
      }
    }
    const k=Math.min(1,rdt*10+0.05);
    const p=t*9;
    b.legs.forEach((L,i)=>{ const ph=p+i*Math.PI; const hip=moving?-Math.sin(ph)*0.55:0; const knee=moving?0.1+Math.max(0,Math.sin(ph+1.3))*0.95:0.05;
      L.a.rotation.x=lerp(L.a.rotation.x,hip,0.35); L.b.rotation.x=lerp(L.b.rotation.x,knee,0.35); });
    let bob=moving?Math.abs(Math.sin(p))*0.07:(Math.sin(t*2)*0.018+0.018);
    b.body.rotation.z=lerp(b.body.rotation.z,moving?Math.sin(p)*0.06:Math.sin(t*1.3)*0.02,0.2);
    b.body.rotation.x=lerp(b.body.rotation.x,moving?0.08:0,0.1);
    const sw=moving?Math.sin(p)*0.5:Math.sin(t*1.6)*0.05;
    let L=[sw,-0.2,-0.3,0], R=[-sw,0.2,-0.3,0];
    switch(b.mode){
      case 'type': L=[-1.15+Math.sin(t*15)*0.12,-0.28,-0.75,0]; R=[-1.15+Math.sin(t*15+Math.PI)*0.12,0.28,-0.75,0]; bob+=Math.abs(Math.sin(t*8))*0.015; break;
      case 'point': R=[-1.45,0.35+Math.sin(t*2)*0.12,-0.1,0]; break;
      case 'write': R=[-1.9+Math.sin(t*6)*0.2,0.45+Math.sin(t*3)*0.3,-0.5,0]; break;
      case 'inspect': R=[-1.25,0.25,-0.9,0]; b.body.rotation.y=Math.sin(t*0.9)*0.45; break;
      case 'wave': if(Math.sin(t*0.7)>0.3) R=[0,2.55,0,0.55*Math.sin(t*12)]; break;
    }
    if(b.carry){ L=[0,-2.7,0,-0.9]; R=[0,2.7,0,0.9]; }
    if(b.cheer>0){ b.cheer-=dt; L=[0,-2.6,0,0.4*Math.sin(t*14)]; R=[0,2.6,0,-0.4*Math.sin(t*14)]; bob+=Math.abs(Math.sin(t*9))*0.22; }
    setArm(b.armL,L[0],L[1],L[2],L[3],k); setArm(b.armR,R[0],R[1],R[2],R[3],k);
    b.body.position.y=bob;
    if(b.hopT>=0){ b.hopT+=rdt; const q=b.hopT/0.55; if(q>=1){ b.hopT=-1; b.hop.position.y=0; b.hop.rotation.y=0; } else { b.hop.position.y=Math.sin(Math.PI*q)*0.75; b.hop.rotation.y=q*Math.PI*2; } }
  }

  /* ---------- Station 1: Problem Framing ---------- */
  const problemTex=canvasTex(512,320,(x,w,h)=>{
    x.fillStyle='#FFFFFF'; x.fillRect(0,0,w,h);
    x.fillStyle='#304255'; x.font=`600 28px ${F.sans}`; x.fillText('Problem Statement',26,50);
    x.fillStyle='#5B7D9A'; rr(x,26,62,96,7,3.5); x.fill();
    x.fillStyle='#413730'; x.font=`500 19px ${F.sans}`; x.fillText('Rechnungsfreigabe dauert heute 9 Tage',26,104);
    [['Betroffene: Kreditoren-Team',true],['Kosten heute beziffert',true],['Ziel: Freigabe in 2 Tagen',false],['Erfolg messbar machen',false]].forEach((r,i)=>{
      const y=146+i*40;
      rr(x,26,y,22,22,6); x.fillStyle=r[1]?'#367851':'#ECE9E4'; x.fill();
      if(r[1]){ x.strokeStyle='#FFFFFF'; x.lineWidth=3.5; x.lineCap='round'; x.lineJoin='round'; x.beginPath(); x.moveTo(31.5,y+11.5); x.lineTo(35.5,y+15.5); x.lineTo(42.5,y+7); x.stroke(); }
      x.fillStyle='#29231E'; x.font=`500 17px ${F.sans}`; x.fillText(r[0],60,y+17);
    });
    x.fillStyle='#D09125'; rr(x,370,150,114,114,14); x.fill();
    x.fillStyle='#29231E'; x.font=`400 80px ${F.serif}`; x.fillText('?',408,236);
  });
  cyl(0.07,0.85,C.slate,-4.1,0,-6); cyl(0.07,0.85,C.slate,0.1,0,-6); box(0.9,0.08,0.9,C.slate,-4.1,0,-6); box(0.9,0.08,0.9,C.slate,0.1,0,-6); tbox(4.6,2.8,0.16,C.brand,4,problemTex.tex,-2,0.8,-6,null,true);
  box(3.0,0.14,1.5,C.paper,3.4,0.76,-4.9);
  [[2.1,-5.5],[4.7,-5.5],[2.1,-4.3],[4.7,-4.3]].forEach(p=>cyl(0.06,0.78,C.slate,p[0],0,p[1]));
  box(0.8,0.26,1.0,C.white,2.5,0.9,-4.9); box(0.8,0.42,1.0,C.white,3.5,0.9,-5.0).rotation.y=0.12; cyl(0.15,0.28,C.accent,4.4,0.9,-4.6);
  const frame1=makeBot({name:'FRAME-01',x:-1.2,z:-4.2,face:Math.PI*1.1,mode:'write',station:1,lines:['Bevor wir über KI reden: Was genau ist das Problem?','Erfolgskriterium 2: Freigabe in zwei statt neun Tagen.','Ich formuliere gerade das Problem Statement.','Was heisst „schneller“? Ich schreibe es als Zahl auf.']});
  makeBot({name:'FRAME-02',x:3.4,z:-3.3,station:1,path:[[3.4,-3.3],[0.9,-2.05]],waitFace:[Math.PI,CAMF],carry:C.white,lines:['Frisches Problem Statement, bereit für den nächsten Schritt.','Diese Seite geht aufs Band.','Ich bringe Fakten, keine Vermutungen.']});
  const qTex=canvasTex(64,64,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#5B7D9A'; x.font=`400 60px ${F.serif}`; x.textAlign='center'; x.fillText('?',32,50); });
  const qMarks=[0,1/3,2/3].map(off=>{ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:qTex.tex,transparent:true,depthWrite:false})); s.scale.set(0.8,0.8,1); scene.add(s); return {s,off}; });

  /* ---------- Station 2: KI Design Sprint (gebaut um x 36, per Gruppe auf x 18 verschoben) ---------- */
  CUR=grp(-18,0,0,scene);
  const sprintTex=canvasTex(740,340,(x,w,h)=>{
    x.fillStyle='#FFFFFF'; x.fillRect(0,0,w,h);
    x.fillStyle='#ECE9E4'; x.fillRect(Math.round(w/3)-1.5,70,3,h-90); x.fillRect(Math.round(2*w/3)-1.5,70,3,h-90);
    [['Ideen','#B7ADA4'],['Prototyp','#5B7D9A'],['Getestet','#5E8F6E']].forEach((c,i)=>{
      const X=i*w/3;
      x.fillStyle=c[1]; x.beginPath(); x.arc(X+30,40,8,0,Math.PI*2); x.fill();
      x.fillStyle='#29231E'; x.font=`600 24px ${F.sans}`; x.fillText(c[0],X+46,48);
    });
  });
  cyl(0.08,0.75,C.slate,32.6,0,-6.25); cyl(0.08,0.75,C.slate,39.4,0,-6.25); tbox(7.4,3.4,0.18,C.gold,4,sprintTex.tex,36,0.7,-6.3,null,true);
  const NOTE_C=[C.gold,C.mint,C.lilac,C.rose,C.white,C.sky];
  const COLX=[-2.47,0,2.47].map(v=>36+v);
  const cols=[[],[],[]];
  function makeNote(){ const n=box(1.9,0.6,0.07,pick(NOTE_C),0,0,-6.15,null,0.03); const l=pbox(1.1,0.012,0.08,0x6B655C,-0.25,0.35,0.036,n); l.rotation.x=Math.PI/2; return n; }
  [3,2,2].forEach((cnt,c)=>{ for(let r=0;r<cnt;r++){ const n=makeNote(); n.position.set(COLX[c],2.8-r*0.8,-6.15); cols[c].push(n); } });
  let sprintAcc=0;
  function kStep(){
    let out=null;
    if(cols[2].length===3) out=cols[2].shift();
    if(cols[1].length) cols[2].push(cols[1].shift());
    if(cols[0].length) cols[1].push(cols[0].shift());
    if(out){ out.material=mat(pick(NOTE_C)); out.scale.setScalar(0.001); cols[0].push(out); out.position.set(COLX[0],2.8-(cols[0].length-1)*0.8,-6.15); }
  }
  makeBot({name:'SPRINT-01',x:33.2,z:-4.3,face:faceTo(-0.3,-1)+0.9,mode:'point',station:2,lines:['Tag 1: verstehen, skizzieren, entscheiden.','Diese Idee kommt in den Prototyp.','Tag 2: Wir testen mit echten Nutzern.','Nach zwei Tagen wissen wir, ob es sich lohnt.']});
  makeBot({name:'SPRINT-02',x:38.6,z:-4.4,station:2,path:[[38.6,-4.4],[37.4,-2.05]],waitFace:[Math.PI,CAMF],carry:C.gold,lines:['Ich bringe die nächste Skizze an die Wand.','Nutzerfeedback eingesammelt. Das hier funktioniert.']});
  CUR=scene;

  /* ---------- Station 3: KI-Arbeitsablauf entwickeln ---------- */
  CUR=FB;
  const deskX=[50.5,54,57.5];
  const TOKC=['#77A1C5','#5B7D9A','#8FC4A2','#D09125','#8A9199','#A9B3CF'];
  function newRow(){ const n=1+(Math.random()*4|0), toks=[]; for(let i=0;i<n;i++) toks.push({w:12+Math.random()*48,c:pick(TOKC)}); return {ind:Math.random()*4|0,toks,n:0}; }
  function drawMon(x,w,h,m){
    x.fillStyle='#14191F'; x.fillRect(0,0,w,h);
    x.fillStyle='#1B2127'; x.fillRect(0,0,24,h);
    const rows=m.rows.concat([m.cur]);
    rows.forEach((r,i)=>{
      const y=8+i*13;
      x.fillStyle='#46525D'; rr(x,7,y,10,6,3); x.fill();
      let X=32+r.ind*14;
      for(let j=0;j<r.n;j++){ const t=r.toks[j]; if(X+t.w>w-8) break; x.fillStyle=t.c; rr(x,X,y,t.w,6,3); x.fill(); X+=t.w+5; }
      if(r===m.cur&&m.blink){ x.fillStyle='#77A1C5'; x.fillRect(Math.min(X,w-12),y-2,5,10); }
    });
  }
  const monitors=deskX.map(dx=>{
    const m={rows:[],cur:newRow(),acc:Math.random()*0.13,blink:true};
    for(let i=0;i<10;i++){ const r=newRow(); r.n=r.toks.length; m.rows.push(r); }
    m.tex=canvasTex(256,160,(x,w,h)=>drawMon(x,w,h,m));
    box(2.6,0.12,1.3,C.paper,dx,0.76,-5);
    [[-1.15,-0.5],[1.15,-0.5],[-1.15,0.5],[1.15,0.5]].forEach(o=>cyl(0.06,0.76,C.slate,dx+o[0],0,-5+o[1]));
    cyl(0.07,0.45,C.slate,dx,0.88,-5.3); box(0.6,0.05,0.4,C.slate,dx,0.88,-5.3);
    tbox(1.75,1.08,0.1,C.dark,4,m.tex.tex,dx,1.2,-5.35);
    box(1.0,0.05,0.35,C.sand,dx,0.88,-4.72,null,0.02);
    return m;
  });
  [['BUILD-01',['Jeder Agent hat genau eine Rolle.','Erst die Prüfung, dann die Automatisierung.','Freigabepunkt eingebaut. Hier entscheidet ein Mensch.']],
   ['BUILD-02',['Die Schnittstelle zum ERP steht.','Ich arbeite nach BMAD, Schritt für Schritt.','Kleine Schritte, sauber dokumentiert.']],
   ['BUILD-03',['Belege werden jetzt automatisch erkannt.','Ich nutze nur Daten, die ich nutzen darf.','Das Logbuch läuft, jede Entscheidung ist nachvollziehbar.']]
  ].forEach((d,i)=>makeBot({name:d[0],x:deskX[i],z:-3.8,face:Math.PI,mode:'type',station:3,lines:d[1]}));
  // Roboterarm
  const armBase=grp(52.3,0,-2.35);
  cyl(0.58,0.38,C.paper,0,0,0,armBase,0.12);
  const turret=grp(0,0.38,0,armBase); cyl(0.42,0.3,C.accent,0,0,0,turret,0.1);
  const shoulder=grp(0,0.45,0,turret); sph(0.26,C.accent,0,0,0,shoulder); cyl(0.16,1.5,C.paper,0,0,0,shoulder,0.08);
  const elbow=grp(0,1.5,0,shoulder); sph(0.22,C.accent,0,0,0,elbow); cyl(0.13,1.25,C.paper,0,0,0,elbow,0.07);
  const wrist=grp(0,1.25,0,elbow); sph(0.16,C.accent,0,0,0,wrist); box(0.5,0.16,0.3,C.slate,0,0.05,0,wrist); box(0.1,0.3,0.14,C.slate,0.18,-0.25,0,wrist); box(0.1,0.3,0.14,C.slate,-0.18,-0.25,0,wrist);

  /* ---------- Station 4: Prüfen & Freigeben ---------- */
  const QX=TH[ST_QA];
  box(1.4,3.6,0.7,C.paper,QX,0,-1.95,null,0.3); box(1.4,3.6,0.7,C.paper,QX,0,1.95,null,0.3); box(1.4,0.9,4.6,C.paper,QX,3.4,0,null,0.4);
  mk(capgeo(0.2,1.6),mat(C.gold,0.45),QX,4.42,0.8).rotation.x=Math.PI/2;
  let qaPass=127, qaFail=0, laserRed=0;
  const qaTex=canvasTex(256,200,(x,w,h)=>{
    x.fillStyle='#14191F'; x.fillRect(0,0,w,h);
    x.fillStyle='#8A9199'; x.font=`500 17px ${F.mono}`; x.fillText('PRÜFUNGEN',18,32);
    x.fillStyle='#8FC4A2'; x.font=`600 48px ${F.mono}`; x.fillText(String(qaPass),18,92);
    x.fillStyle='#303840'; rr(x,18,112,220,10,5); x.fill();
    const share=qaPass/(qaPass+qaFail); x.fillStyle='#5E8F6E'; rr(x,18,112,Math.max(10,220*share),10,5); x.fill();
    x.fillStyle='#E39B8C'; x.font=`500 16px ${F.mono}`; x.fillText(`${qaFail} zurück`,18,156);
    x.fillStyle='#8A9199'; x.font=`500 13px ${F.mono}`; x.fillText('Tests · Datenschutz · Freigabe',18,182);
  });
  tbox(1.05,0.82,0.06,C.dark,4,qaTex.tex,QX,1.9,2.3);
  cyl(0.14,0.08,C.red,QX+0.25,1.3,2.3).rotation.x=Math.PI/2;
  const RED=lin(C.red), GREEN=lin(C.green);
  const beamMat=new THREE.MeshBasicMaterial({color:lin(C.green),transparent:true,opacity:0.18,side:THREE.DoubleSide,depthWrite:false});
  const beam=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2.7),beamMat); beam.rotation.y=Math.PI/2; beam.position.set(QX,2.05,0); beam.userData.noShadow=true; CUR.add(beam);
  const scanMat=new THREE.MeshBasicMaterial({color:lin(C.green)});
  const scan=box(0.12,0.06,3.2,scanMat,QX,1,0,null,0.03); scan.userData.noShadow=true;
  const BIN={x:75.2,y:0.9,z:-4.6}, BINW=toWorld(FB,BIN.x,BIN.y,BIN.z);
  box(1.9,0.9,1.7,C.kraft,BIN.x,0,BIN.z,null,0.2); box(1.6,0.03,1.4,0x8E6A48,BIN.x,0.89,BIN.z,null,0.01);
  makeBot({name:'CHECK-01',x:70.3,z:-2.7,face:faceTo(0.6,0.5),mode:'inspect',tool:'lens',station:4,lines:['127 von 127 Prüfungen bestanden.','Datenschutz-Check: keine Personendaten im Log.','Ich schaue mir jede Ausnahme zweimal an.','Wichtige Entscheidungen gibt ein Mensch frei.']});
  const qa2=makeBot({name:'CHECK-02',x:76.8,z:-3.1,station:4,lines:['Das geht zurück. Begründung steht im Ticket.','Fehler sind hier billiger als im Betrieb.','Zurück in die Werkstatt, mit klarer Begründung.']});

  /* ---------- Station 5: Wirkung & Skalierung ---------- */
  const webTex=canvasTex(400,260,(x,w,h)=>{
    x.fillStyle='#FAF8F5'; x.fillRect(0,0,w,h);
    x.fillStyle='#E6E1DB'; x.fillRect(0,0,w,34);
    ['#5B7D9A','#D09125','#5E8F6E'].forEach((c,i)=>{ x.fillStyle=c; x.beginPath(); x.arc(18+i*14,17,5,0,Math.PI*2); x.fill(); });
    x.fillStyle='#FFFFFF'; rr(x,70,8,220,18,9); x.fill();
    x.fillStyle='#70645C'; x.font=`500 13px ${F.sans}`; x.fillText('Wirkungs-Dashboard',82,22);
    x.fillStyle='#F4F1EB'; x.fillRect(0,34,86,h-34);
    x.fillStyle='#304255'; rr(x,14,52,58,8,4); x.fill();
    x.fillStyle='#D8D1CB'; for(let i=0;i<3;i++){ rr(x,14,72+i*20,48,8,4); x.fill(); }
    x.fillStyle='#29231E'; x.font=`400 24px ${F.serif}`; x.fillText('Wirkung im Blick',104,72);
    [[104,'Durchlaufzeit','−58 %','#367851'],[248,'Freigabe','2 Tage','#304255']].forEach(k=>{
      x.fillStyle='#FFFFFF'; rr(x,k[0],88,132,64,12); x.fill();
      x.fillStyle='#70645C'; x.font=`500 12px ${F.sans}`; x.fillText(k[1],k[0]+12,88+22);
      x.fillStyle=k[3]; x.font=`600 24px ${F.sans}`; x.fillText(k[2],k[0]+12,88+52);
    });
    x.fillStyle='#FFFFFF'; rr(x,104,166,276,78,12); x.fill();
    [58,50,40,30,24,20].forEach((bh,i)=>{ x.fillStyle=i===5?'#367851':'#5B7D9A'; rr(x,120+i*42,236-bh,26,bh,4); x.fill(); });
  });
  function phoneTex(accent,title){ return canvasTex(180,360,(x,w,h)=>{
    x.fillStyle='#FAF8F5'; x.fillRect(0,0,w,h);
    x.fillStyle='#1B2127'; rr(x,60,12,60,10,5); x.fill();
    x.fillStyle=accent; x.fillRect(0,40,w,70);
    x.fillStyle='#FFFFFF'; x.font=`600 20px ${F.sans}`; x.fillText(title,16,84);
    for(let i=0;i<5;i++){ const y=126+i*40; x.fillStyle='#FFFFFF'; rr(x,16,y,148,30,8); x.fill(); x.fillStyle='#D8D1CB'; rr(x,28,y+11,70+((i*37)%40),8,4); x.fill(); }
    x.fillStyle=accent; rr(x,16,318,148,34,17); x.fill();
  }); }
  const devGroups=[];
  [85,88.3,91.3].forEach((px,i)=>{
    box(2.3,0.62,1.6,C.paper,px,0,-5.7,null,0.25); box(2.4,0.16,1.7,C.accent,px,0.6,-5.7,null,0.07);
    const g=grp(px,0.76,-5.7);
    if(i===0){ box(0.8,0.12,0.5,C.slate,0,0,0,g); cyl(0.06,0.3,C.slate,0,0.1,0,g); tbox(2.1,1.35,0.1,C.dark,4,webTex.tex,0,0.36,0,g); }
    else { const t=i===1?phoneTex('#5B7D9A','Kreditoren'):phoneTex('#5E8F6E','Einkauf'); box(0.5,0.1,0.4,C.slate,0,0,0,g); tbox(0.76,1.5,0.12,C.ink,4,t.tex,0,0.1,0,g); }
    devGroups.push(g);
  });
  // Rollout-Rampe und Rakete
  cyl(1.5,0.32,C.paper,96.2,0,-6,null,0.12); cyl(1.56,0.12,C.accent,96.2,0.12,-6,null,0.05);
  const rocket=grp(96.2,0.32,-6);
  (()=>{ const V=THREE.Vector2;
    mk(new THREE.LatheGeometry([[0,0],[0.3,0],[0.42,0.12],[0.5,0.45],[0.53,1.0],[0.51,1.5],[0.46,1.9],[0,1.9]].map(p=>new V(p[0],p[1])),32),mat(C.paper,0.45),0,0,0,rocket);
    mk(new THREE.LatheGeometry([[0,1.9],[0.46,1.9],[0.4,2.2],[0.3,2.5],[0.16,2.72],[0,2.8]].map(p=>new V(p[0],p[1])),32),mat(C.brand,0.45),0,0,0,rocket);
    cyl(0.2,0.06,C.gold,0,1.35,0.49,rocket,0.02).rotation.x=Math.PI/2;
    [0,2.094,4.189].forEach(a=>{ const f=grp(0,0,0,rocket); f.rotation.y=a+0.5; box(0.1,0.7,0.46,C.accent,0,0.02,0.66,f,0.05); });
    cyl(0.26,0.18,C.slate,0,-0.12,0,rocket,0.05);
    const hit=new THREE.Mesh(pgeo(1.8,3.6,1.8),hitMat); hit.userData.rocket=true; rocket.add(hit); hitMeshes.push(hit);
  })();
  const R={st:'idle',next:9,t:0,v:0,y:0,smokeAcc:0};
  const smokePool=[];
  for(let i=0;i<18;i++){ const m=new THREE.Mesh(sgeo(0.42),new THREE.MeshStandardMaterial({color:lin(C.white),transparent:true,opacity:0,roughness:1,depthWrite:false})); m.visible=false; m.userData.noShadow=true; FB.add(m); smokePool.push({m,life:-1,vx:0,vz:0}); }
  function puff(x,y,z,spread){
    let p=smokePool.find(q=>q.life<0); if(!p){ p=smokePool.reduce((a,b)=>a.life>b.life?a:b); }
    p.life=0; p.m.visible=true; p.m.position.set(x+(Math.random()-0.5)*spread,y,z+(Math.random()-0.5)*spread);
    p.vx=(Math.random()-0.5)*0.5; p.vz=(Math.random()-0.5)*0.5;
  }
  const dep1=makeBot({name:'SCALE-01',x:94.2,z:-4.0,face:faceTo(1,-1)-0.6,station:5,lines:['Die Baseline aus Schritt 1 steht. Jetzt messen wir.','Countdown läuft. Klicken Sie auf die Rakete, wenn Sie nicht warten möchten.','Der Rollout-Plan liegt bereit, Team für Team.']});
  const dep2=makeBot({name:'SCALE-02',x:88.3,z:-3.5,mode:'wave',station:5,lines:['Die Durchlaufzeit ist um mehr als die Hälfte gesunken!','Team Einkauf ist als Nächstes dran.','Der Wirkungsbericht liegt bei der Geschäftsleitung.','Was wirkt, wird skaliert.']});
  function launch(){ if(R.st!=='idle') return; R.st='count'; R.t=0; dep1.cheer=3; dep2.cheer=3; }
  // Auslauf "Wirkung"
  box(3.4,2.6,3.4,C.paper,98.8,0,0,null,0.4); box(3.5,0.34,3.5,C.brand,98.8,2.5,0,null,0.15);
  [[101.8,0,-3.2],[103.1,0,-3.2],[102.4,1.0,-3.2],[101.8,0,-1.9]].forEach(p=>{ box(1.15,0.95,1.15,C.kraft,p[0],p[1],p[2]); box(0.26,0.97,1.17,C.tape,p[0],p[1],p[2],null,0.04); });
  CUR=scene;

  /* Bots ausserhalb der Stationen */
  makeBot({name:'KONTEXT-01',x:3,z:3.7,path:[[3,3.7],[26,3.7]],waitFace:[CAMF,CAMF],speed:2.1,carry:C.white,station:0,lines:['Ich bringe Wissen von Schritt zu Schritt.','Die Erfolgskriterien aus Schritt 1 reisen mit.','Zwischen den Schritten geht kein Wissen verloren.']});
  makeBot({name:'KONTEXT-02',x:TX+RC-3.7,z:58,path:[[TX+RC-3.7,58],[TX+RC-3.7,15]],waitFace:[CAMF,CAMF],speed:2.1,carry:C.gold,station:0,lines:['Feedback aus der Prüfung geht direkt zurück in die Entwicklung.','Unterwegs zum nächsten Schritt.']});
  makeBot({name:'EMPFANG',x:-8.2,z:3.2,mode:'wave',station:0,lines:['Grüezi! Hier kommt Ihr Geschäftsproblem aufs Band.','Scrollen Sie runter, ich zeige Ihnen die Werkstatt.','Jedes Projekt startet hier als kleine goldene Kugel.']});

  /* Schatten */
  scene.traverse(o=>{
    if(!o.isMesh||o===floor) return;
    const ms=Array.isArray(o.material)?o.material:[o.material];
    if(o.userData.noShadow||o.material===hitMat||o.material===shadowMat||ms.some(m=>m.transparent)) return;
    o.castShadow=true; o.receiveShadow=true;
  });

  /* ---------- Beschriftungen ---------- */
  const bubble=$('bubble'), bName=bubble.querySelector('.b-name'), bText=bubble.querySelector('.b-text');
  const labels=[];
  function addLabel(html,x,y,z,cls,frame){ const el=document.createElement('div'); el.className='wl '+cls; el.innerHTML=html; labelsEl.insertBefore(el,bubble); labels.push({el,pos:toWorld(frame||scene,x,y,z),vis:true}); }
  PHASES.forEach((p,i)=>addLabel(`<b>${pad2(i+1)}</b>${p.name}`,SX[i]+6,0.1,-8.5,'station',FR[i]));
  addLabel('Ihr Geschäftsproblem',-11,4.1,0,'tag warm'); addLabel('Wirkung',98.8,3.2,0,'tag',FB);
  ['agent/belegerkennung','agent/kontierung','flow/freigabe'].forEach((t,i)=>addLabel(t,deskX[i],2.55,-5.35,'tag',FB));
  addLabel('Zurück in die Werkstatt',75.2,1.3,-4.6,'tag',FB);
  addLabel('Dashboard',85,2.85,-5.7,'tag',FB); addLabel('Team Kreditoren',88.3,2.65,-5.7,'tag',FB); addLabel('Team Einkauf',91.3,2.65,-5.7,'tag',FB);
  addLabel('Rollout',96.2,3.9,-6,'tag warm',FB);

  let bubbleBot=null, bubbleT=0, lastSay=-99, RT=0;
  function say(b,text){ bName.textContent=b.name; bText.textContent=text; bubbleBot=b; bubbleT=3.8; lastSay=RT; bubble.classList.add('show'); }

  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{ if(!dead) texDrawers.forEach(d=>d.draw()); });

  /* ---------- Kamera ---------- */
  let K=[], uS=0, curH=21, shadowSize=0;
  const tgt=new THREE.Vector3(), par={x:0,y:0};
  function buildKeys(){
    const a=W/H, mob=W<760||a<0.9;                        // Smartphones und Tablets hochkant: Karte unten, Szene darüber
    const stH=mob?clamp(24/a*0.62,20,34):(a>2.2?13:15.5);  // sehr breite, flache Fenster: näher an die Station
    const tab=mob&&W>=760;                                  // Tablet hochkant: Hero und Karte nehmen weniger Höhe ein
    K=[mob?{x:-6,z:0,h:clamp(26/a*0.62,22,40),ox:0.1,oy:tab?-0.1:-0.22}:{x:-11,z:0,h:21,ox:-0.07,oy:0.22}];
    // Desktop: Station mittig in den freien Bereich zwischen Rail (links) und Schrittkarte (rechts) setzen
    let stOx=0.07;
    if(!mob){ const rr=rail.getBoundingClientRect(), left=rr.width?rr.right+12:16, right=W-card.offsetWidth-40; stOx=clamp(0.5-(left+right)/2/W,0,0.3); }
    SX.forEach((x,i)=>{ const w=toWorld(FR[i],x+1.2,0,-3.4); K.push({x:w.x,z:w.z,h:stH,ox:mob?0.02:stOx,oy:mob?(tab?-0.13:-0.2):-0.02}); });
  }
  function dwell(f){ const d=0.2; if(f<=d) return 0; if(f>=1-d) return 1; return smooth((f-d)/(1-2*d)); }
  function camAt(u){ const i=Math.min(NSTEP-1,Math.floor(u)), f=u-i, e=dwell(f), A=K[i], B=K[i+1];
    let h=lerp(A.h,B.h,e); if(i>=1&&i<=NSTEP-2) h+=Math.sin(Math.PI*e)*5;
    return {x:lerp(A.x,B.x,e),z:lerp(A.z,B.z,e),h,ox:lerp(A.ox,B.ox,e),oy:lerp(A.oy,B.oy,e)}; }
  function applyCam(u){
    const c=camAt(u), vw=c.h*W/H; curH=c.h;
    tgt.set(c.x,0,c.z).addScaledVector(RIGHT,c.ox*vw).addScaledVector(UP,c.oy*c.h).addScaledVector(RIGHT,par.x*0.5).addScaledVector(UP,par.y*0.35);
    cam.left=-vw/2; cam.right=vw/2; cam.top=c.h/2; cam.bottom=-c.h/2;
    cam.position.copy(tgt).addScaledVector(DIR,150); cam.lookAt(tgt); cam.updateProjectionMatrix();
    const fx=tgt.x-tgt.y*DIR.x/DIR.y, fz=tgt.z-tgt.y*DIR.z/DIR.y;
    sun.target.position.set(fx,0,fz); sun.position.set(fx,0,fz).add(SUN_OFF);
    const s=Math.ceil(c.h*Math.max(1,W/H)*0.6/2)*2;
    if(s!==shadowSize){ shadowSize=s; const sc=sun.shadow.camera; sc.left=-s; sc.right=s; sc.top=s; sc.bottom=-s; sc.updateProjectionMatrix(); }
  }
  buildKeys();
  on(window,'resize',()=>{ measure(); renderer.setSize(W,H,false); buildKeys(); });

  /* ---------- Interaktion ---------- */
  const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
  let mx=0, my=0, hoverOK=false, hoverObj=null;
  const blocked=t=>!t||!t.closest||!!t.closest('.ui, .content, .hero, a, button');
  on(window,'pointermove',e=>{ mx=e.clientX/W*2-1; my=-(e.clientY/H)*2+1; hoverOK=!blocked(e.target); });
  on(window,'pointerleave',()=>{ hoverOK=false; });
  function pickAt(x,y){ ndc.set(x,y); ray.setFromCamera(ndc,cam); const h=ray.intersectObjects(hitMeshes,false); return h.length?h[0].object:null; }
  on(window,'click',e=>{
    if(blocked(e.target)||body.classList.contains('past')) return;
    const o=pickAt(e.clientX/W*2-1,-(e.clientY/H)*2+1); if(!o) return;
    if(o.userData.bot){ const b=o.userData.bot; b.hopT=0; say(b,pick(b.lines)); }
    else if(o.userData.rocket){ launch(); say(dep1,'Und los geht der Rollout!'); }
  });

  /* ---------- Render-Loop ---------- */
  const PT={}, V3=new THREE.Vector3();
  let T=0, last=performance.now(), frameNo=0;
  { const s=scrollState(); uS=s.uT; }

  function worldUpdate(dt,rdt){
    // Band und Werkstücke
    beltTex.tex.offset.x-=dt*ITEM_SPEED/2;
    for(const it of items){
      it.s+=dt*ITEM_SPEED;
      if(it.s>BELT_LEN+1.2){ it.s-=LOOP; it.fail=Math.random()<0.2; it.rej=null; it.gone=false; it.g.visible=true; it.cur=-1; it.v=-1; }
      const v=variantAt(it.s); const P=pathAt(it.s,PT);
      if(v!==it.v){
        if(it.v===ST_QA&&v===ST_QA+1){
          if(it.fail){ it.rej={t:0,x:it.g.position.x,z:it.g.position.z}; qaFail++; laserRed=0.9; qaTex.draw(); say(qa2,'Das geht zurück. Begründung steht im Ticket.'); }
          else { qaPass++; qaTex.draw(); }
        }
        it.v=v;
      }
      let show=v, px=P.x, py=BELT_Y, pz=P.z, s=1;
      if(it.rej){ it.rej.t+=dt/1.1; const q=it.rej.t; if(q>=1){ it.gone=true; } else { show=6; px=lerp(it.rej.x,BINW.x,q); pz=lerp(it.rej.z,BINW.z,q); py=lerp(BELT_Y,BINW.y,q)+Math.sin(Math.PI*q)*2.2; it.g.rotation.z=q*3; } }
      else it.g.rotation.z=0;
      if(it.gone){ it.g.visible=false; continue; }
      if(v>0&&!it.rej){ const d=it.s-THS[v-1]; if(d<0.7) s=1+0.35*Math.sin(Math.PI*d/0.7); }
      if(show!==it.cur){ it.vs.forEach((g,i)=>g.visible=i===show); it.cur=show; }
      if(show===0) it.vs[0].position.y=Math.sin(T*3+it.s)*0.06;
      it.g.position.set(px,py,pz); if(!it.rej) it.g.rotation.y=P.a; it.g.scale.setScalar(s);
    }
    // Pressen
    for(const p of presses){
      let near=1e9; for(const it of items){ if(it.rej||it.gone) continue; const d=Math.abs(it.s-p.s); if(d<near) near=d; }
      const pr=clamp(1-near/0.6,0,1);
      p.head.position.y=2.05-0.45*smooth(pr);
      const c=pr>0.2?LAMP_GOLD:LAMP_GREEN; p.lampMat.color.copy(c); p.lampMat.emissive.copy(c);
    }
    // Bots
    for(const b of bots) updateBot(b,dt,rdt,T);
    // Fragezeichen
    const fp=frame1.root.position;
    for(const q of qMarks){ const f=((T*0.45+q.off)%1); q.s.position.set(fp.x-0.2+Math.sin(f*6+q.off*9)*0.3,1.9+f*1.8,fp.z+0.3); q.s.material.opacity=Math.sin(Math.PI*f); }
    // Sprint-Wand
    sprintAcc+=dt; if(sprintAcc>=2.4){ sprintAcc-=2.4; kStep(); }
    const kp=Math.min(1,dt*5), ks=Math.min(1,dt*6);
    cols.forEach((col,c)=>col.forEach((n,r)=>{ n.position.x=lerp(n.position.x,COLX[c],kp); n.position.y=lerp(n.position.y,2.8-r*0.8,kp); const sc=lerp(n.scale.x,1,ks); n.scale.setScalar(sc); }));
    // Workflow-Monitore
    const blink=((T*2.5)|0)%2===0;
    for(const m of monitors){
      let dirty=false; m.acc+=dt;
      while(m.acc>=0.13){ m.acc-=0.13; if(m.cur.n<m.cur.toks.length) m.cur.n++; else { m.rows.push(m.cur); m.rows.shift(); m.cur=newRow(); } dirty=true; }
      if(blink!==m.blink){ m.blink=blink; dirty=true; }
      if(dirty) m.tex.draw();
    }
    // Roboterarm
    const ph=T*1.1;
    turret.rotation.y=-0.2+Math.sin(ph)*0.7; shoulder.rotation.x=0.55+Math.sin(ph*2)*0.18; elbow.rotation.x=1.05+Math.sin(ph*2+1)*0.25; wrist.rotation.y=T*2;
    // Prüfstrahl
    if(laserRed>0){ laserRed=Math.max(0,laserRed-dt); beamMat.color.copy(RED); beamMat.opacity=0.32; scanMat.color.copy(RED); }
    else { beamMat.color.copy(GREEN); beamMat.opacity=0.14+Math.sin(T*4)*0.05; scanMat.color.copy(GREEN); }
    scan.position.y=0.75+(Math.sin(T*2.4)*0.5+0.5)*2.5;
    // Geräte
    devGroups.forEach((g,i)=>{ g.rotation.y=-0.3+Math.sin(T*0.7+i*1.3)*0.28; });
    // Rakete
    switch(R.st){
      case 'idle': R.next-=dt; if(R.next<=0) launch(); break;
      case 'count': R.t+=dt; rocket.position.x=96.2+Math.sin(R.t*70)*0.05; if(dt>0&&Math.random()<0.4) puff(96.2,0.3,-6,1.2);
        if(R.t>=0.8){ R.st='fly'; R.v=0; R.y=0; R.smokeAcc=0; rocket.position.x=96.2; } break;
      case 'fly': R.v+=dt*10; R.y+=R.v*dt; rocket.position.y=0.32+R.y;
        R.smokeAcc+=dt; while(R.smokeAcc>=0.05){ R.smokeAcc-=0.05; puff(96.2,rocket.position.y-0.3,-6,0.6); }
        if(R.y>70){ R.st='gone'; R.t=0; rocket.scale.setScalar(0.001); } break;
      case 'gone': R.t+=dt; if(R.t>=2.4){ R.st='ret'; R.t=0; R.y=0; rocket.position.set(96.2,0.32,-6); } break;
      case 'ret': { R.t+=dt; const q=Math.min(1,R.t/0.7); rocket.scale.setScalar(Math.max(0.001,(1+0.25*Math.sin(Math.PI*q))*q)); if(q>=1){ R.st='idle'; R.next=14; rocket.scale.setScalar(1); } break; }
    }
    // Rauch
    for(const p of smokePool){
      if(p.life<0) continue;
      p.life+=dt; const q=p.life/1.5;
      if(q>=1){ p.life=-1; p.m.visible=false; continue; }
      p.m.scale.setScalar(lerp(0.6,2.8,q)); p.m.material.opacity=lerp(0.9,0,q);
      p.m.position.x+=p.vx*dt; p.m.position.z+=p.vz*dt; p.m.position.y+=dt*0.4;
    }
  }

  function project(pos){ V3.copy(pos).project(cam); return [(V3.x*0.5+0.5)*W,(-V3.y*0.5+0.5)*H]; }
  function projectLabels(){
    labelsEl.classList.toggle('far',curH>30);
    for(const l of labels){
      const p=project(l.pos), vis=!(p[0]<-300||p[0]>W+300||p[1]<topSafe||p[1]>H+100);   // nicht unter die Topbar schieben
      if(vis!==l.vis){ l.vis=vis; l.el.style.visibility=vis?'':'hidden'; }
      if(vis) l.el.style.transform=`translate3d(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px,0) translate(-50%,-100%)`;
    }
    if(bubbleBot){
      bubbleBot.root.getWorldPosition(V3); V3.y=(1.75+bubbleBot.hop.position.y)*bubbleBot.S;
      V3.project(cam);
      const x=(V3.x*0.5+0.5)*W, y=(-V3.y*0.5+0.5)*H-12;
      bubble.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-100%)`;
    }
  }

  function loop(now){
    if(dead) return;
    raf=requestAnimationFrame(loop);
    const rdt=Math.min(0.05,Math.max(0,(now-last)/1000)); last=now;
    const dt=rdt*timeScale; T+=dt; RT+=rdt; frameNo++;
    const st=scrollState();
    uS+=(st.uT-uS)*Math.min(1,rdt*(reduce?12:5));
    const hidden=st.sy>maxScroll+window.innerHeight&&Math.abs(st.uT-uS)<1e-3;
    if(!hidden){
      if(!reduce){ const kk=Math.min(1,rdt*3); par.x+=(mx-par.x)*kk; par.y+=(my-par.y)*kk; }
      applyCam(uS);
      worldUpdate(dt,rdt);
      // Sprechblase
      if(bubbleBot){ bubbleT-=rdt; if(bubbleT<=0){ bubbleBot=null; bubble.classList.remove('show'); } }
      // Hover
      if(frameNo%2===0){
        const o=hoverOK&&st.exitA>0?pickAt(mx,my):null;
        canvas.style.cursor=o?'pointer':'';
        if(o&&o!==hoverObj&&o.userData.bot&&o.userData.bot.hopT<0) o.userData.bot.hopT=0;
        hoverObj=o;
      }
      // Automatisches Plaudern
      const sn=Math.round(uS);
      if(sn>=1&&sn<=NSTEP&&Math.abs(uS-sn)<0.2&&RT-lastSay>7.5&&!bubbleBot&&timeScale>0&&!reduce&&st.exitA>0){
        const cand=bots.filter(b=>b.station===sn); if(cand.length){ const b=pick(cand); say(b,pick(b.lines)); }
      }
      renderer.render(scene,cam);
      projectLabels();
    }
    hud(uS,st.exitA);
  }
  raf=requestAnimationFrame(loop);


  return cleanup;
}
