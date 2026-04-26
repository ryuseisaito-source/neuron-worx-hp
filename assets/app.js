/* ==========================================================
   NEURON WORX — Shared app.js (inner pages) v3
   Handles: tweaks, clock, reveal, page transitions, canvas FX
========================================================== */
(function(){
  /* ── State ── */
  const DEFS=window.TWEAK_DEFAULTS||{theme:'dark',accent:'lime',font:'serif-italic',heroLayout:'neural',motionIntensity:2};
  const state=Object.assign({},DEFS);

  function applyState(){
    document.body.dataset.theme  =state.theme;
    document.body.dataset.accent =state.accent;
    document.body.dataset.font   =state.font;
    document.body.dataset.hero   =state.heroLayout;
    document.documentElement.style.setProperty('--motion',String(state.motionIntensity));
    document.querySelectorAll('.tw-opts').forEach(w=>{
      w.querySelectorAll('.tw-opt').forEach(b=>b.classList.toggle('on',b.dataset.val===state[w.dataset.key]));
    });
    const mi=document.getElementById('mi'),mv=document.getElementById('mi-val');
    if(mi) mi.value=state.motionIntensity;
    if(mv) mv.textContent=state.motionIntensity;
  }
  function setKey(k,v){
    state[k]=v; applyState();
    try{ window.parent.postMessage({type:'__edit_mode_set_keys',edits:{[k]:v}},'*'); }catch(e){}
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('.tw-opt'); if(!b) return;
    const w=b.closest('.tw-opts'); if(!w) return;
    setKey(w.dataset.key,b.dataset.val);
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='mi') setKey('motionIntensity',parseInt(e.target.value));
  });
  const tweaksClose=document.getElementById('tweaks-close');
  if(tweaksClose) tweaksClose.onclick=()=>{
    document.getElementById('tweaks').classList.remove('active');
    try{ window.parent.postMessage({type:'__deactivate_edit_mode'},'*'); }catch(e){}
  };
  window.addEventListener('message',e=>{
    const d=e.data||{},p=document.getElementById('tweaks');
    if(!p) return;
    if(d.type==='__activate_edit_mode') p.classList.add('active');
    if(d.type==='__deactivate_edit_mode') p.classList.remove('active');
  });
  try{ window.parent.postMessage({type:'__edit_mode_available'},'*'); }catch(e){}
  applyState();

  /* ── Clock ── */
  const pad=n=>String(n).padStart(2,'0');
  setInterval(()=>{
    const d=new Date(),el=document.getElementById('clock');
    if(el) el.textContent=`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  },1000);
  document.addEventListener('mousemove',e=>{
    const el=document.getElementById('cursor-coord');
    if(el) el.textContent=`${pad(Math.round(e.clientX))},${pad(Math.round(e.clientY))}`;
  });

  /* ── Reveal ── */
  const io=new IntersectionObserver(ents=>{
    ents.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }});
  },{threshold:0.05,rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  setTimeout(()=>{
    document.querySelectorAll('.reveal:not(.in)').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.top<window.innerHeight) el.classList.add('in');
    });
  },120);

  /* ── Page transitions ── */
  const trans=document.getElementById('page-trans');
  if(trans){
    window.addEventListener('pageshow',()=>trans.classList.remove('enter'));
    document.addEventListener('click',e=>{
      const a=e.target.closest('a[href]'); if(!a) return;
      const href=a.getAttribute('href');
      if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('mailto:')||a.target==='_blank') return;
      e.preventDefault();
      trans.classList.add('enter');
      setTimeout(()=>location.href=href,480);
    });
  }

  /* ── Canvas FX ── */
  const canvas=document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  let W,H,dpr;
  let mouse={x:-9999,y:-9999,active:false};

  function gRgb(v){
    const s=getComputedStyle(document.body).getPropertyValue(v).trim()||'#d4ff00';
    const h=s.replace('#',''); const n=parseInt(h,16);
    return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  }

  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=canvas.clientWidth=window.innerWidth;
    H=canvas.clientHeight=window.innerHeight;
    canvas.width=W*dpr; canvas.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    buildAll();
  }

  /* Neural */
  let neural=null;
  function buildNeural(){
    const count=Math.max(40,Math.floor((W*H)/15000));
    const nodes=[];
    for(let i=0;i<count;i++) nodes.push({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.45, vy:(Math.random()-.5)*.45,
      r:.7+Math.random()*1.2,
    });
    neural={nodes,pulses:[]};
  }
  function drawNeural(M){
    const R=190,g=gRgb('--accent'),nodes=neural.nodes;
    for(const n of nodes){
      n.x+=n.vx*M*.4; n.y+=n.vy*M*.4;
      if(n.x<-R) n.x=W+R; if(n.x>W+R) n.x=-R;
      if(n.y<-R) n.y=H+R; if(n.y>H+R) n.y=-R;
    }
    if(mouse.active){
      for(const n of nodes){
        const dx=n.x-mouse.x,dy=n.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<150&&d>0){ n.x+=(dx/d)*.25*M; n.y+=(dy/d)*.25*M; }
      }
    }
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy;
        if(d2>R*R) continue;
        const alpha=(1-Math.sqrt(d2)/R)*.09;
        ctx.strokeStyle=`rgba(${g.r},${g.g},${g.b},${alpha})`;
        ctx.lineWidth=.5;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
    for(const n of nodes){
      ctx.fillStyle=`rgba(${g.r},${g.g},${g.b},.14)`;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
    }
  }

  /* Circuit */
  let circuit=null;
  function buildCircuit(){
    const cell=44,cols=Math.ceil(W/cell)+1,rows=Math.ceil(H/cell)+1;
    const traces=[],pads=[];
    for(let t=0;t<Math.floor((cols*rows)/45);t++){
      let cx=Math.floor(Math.random()*cols),cy=Math.floor(Math.random()*rows);
      const pts=[[cx,cy]]; let dir=Math.floor(Math.random()*4);
      for(let i=0;i<6+Math.floor(Math.random()*8);i++){
        if(Math.random()<.35) dir=(dir+(Math.random()<.5?1:3))%4;
        const d=[[1,0],[0,1],[-1,0],[0,-1]][dir];
        cx=Math.max(0,Math.min(cols-1,cx+d[0])); cy=Math.max(0,Math.min(rows-1,cy+d[1]));
        pts.push([cx,cy]);
      }
      traces.push(pts); pads.push(pts[0]);
      if(Math.random()<.6) pads.push(pts[pts.length-1]);
    }
    circuit={cell,traces,pads,sparks:[]};
  }
  function drawCircuit(M){
    const g=gRgb('--accent'),a=gRgb('--accent');
    ctx.strokeStyle=`rgba(${g.r},${g.g},${g.b},.1)`;ctx.lineWidth=.9;ctx.lineCap='square';
    for(const pts of circuit.traces){ctx.beginPath();for(let i=0;i<pts.length;i++){const x=pts[i][0]*circuit.cell,y=pts[i][1]*circuit.cell;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}
    for(const p of circuit.pads){const x=p[0]*circuit.cell,y=p[1]*circuit.cell;ctx.fillStyle='rgba(10,10,18,1)';ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(${g.r},${g.g},${g.b},.28)`;ctx.lineWidth=.8;ctx.stroke();}
    const rate=Math.min(3,Math.ceil(M));
    for(let s=0;s<rate;s++){if(Math.random()<.5&&circuit.traces.length){const pts=circuit.traces[Math.floor(Math.random()*circuit.traces.length)];if(pts.length>=2)circuit.sparks.push({pts,t:0,speed:.005+Math.random()*.008});}}
    for(let i=circuit.sparks.length-1;i>=0;i--){
      const sp=circuit.sparks[i]; sp.t+=sp.speed*M;
      if(sp.t>=1){circuit.sparks.splice(i,1);continue;}
      const tot=sp.pts.length-1,gt=sp.t*tot,seg=Math.floor(gt),loc=gt-seg;
      const A=sp.pts[seg],B=sp.pts[seg+1];
      const x=(A[0]+(B[0]-A[0])*loc)*circuit.cell,y=(A[1]+(B[1]-A[1])*loc)*circuit.cell;
      ctx.lineWidth=1.4;ctx.strokeStyle=`rgba(${a.r},${a.g},${a.b},.85)`;ctx.shadowColor=`rgba(${a.r},${a.g},${a.b},.5)`;ctx.shadowBlur=8;
      const p0=Math.max(0,sp.t-.1)*tot,ps=Math.floor(p0),pl=p0-ps;
      const PA=sp.pts[ps],PB=sp.pts[Math.min(ps+1,sp.pts.length-1)];
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo((PA[0]+(PB[0]-PA[0])*pl)*circuit.cell,(PA[1]+(PB[1]-PA[1])*pl)*circuit.cell);ctx.stroke();ctx.shadowBlur=0;
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();
    }
  }

  /* Warp */
  let sc=null;
  function buildScan(){
    const stars=[];for(let i=0;i<320;i++)stars.push({a:Math.random()*Math.PI*2,z:Math.random(),v:.002+Math.random()*.005,size:.5+Math.random()*1.2});
    sc={stars,sweeps:[{y:H*.35,speed:.5,dir:1},{y:H*.7,speed:.7,dir:-1}]};
  }
  function drawScan(M){
    const cx=W/2,cy=H/2,g=gRgb('--accent'),a=gRgb('--accent');
    for(const s of sc.stars){
      s.z+=s.v*M*.6;if(s.z>1){s.z=0;s.a=Math.random()*Math.PI*2;}
      const dist=s.z*Math.max(W,H)*.65,x=cx+Math.cos(s.a)*dist,y=cy+Math.sin(s.a)*dist*.8;
      const tL=18+s.z*45*M,x2=cx+Math.cos(s.a)*(dist-tL),y2=cy+Math.sin(s.a)*(dist-tL)*.8;
      const al=.07+s.z*.45;
      ctx.strokeStyle=s.z>.55?`rgba(${g.r},${g.g},${g.b},${al})`:`rgba(${a.r},${a.g},${a.b},${al*.8})`;
      ctx.lineWidth=s.size*(.3+s.z*.5);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();
    }
    for(const sw of sc.sweeps){
      sw.y+=sw.speed*sw.dir*M;if(sw.y<-40)sw.y=H+20;if(sw.y>H+40)sw.y=-20;
      const grd=ctx.createLinearGradient(0,sw.y-28,0,sw.y+28);
      grd.addColorStop(0,'transparent');grd.addColorStop(.5,`rgba(${g.r},${g.g},${g.b},.07)`);grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd;ctx.fillRect(0,sw.y-28,W,56);
      ctx.fillStyle=`rgba(${g.r},${g.g},${g.b},.3)`;ctx.fillRect(0,sw.y,W,1);
    }
  }

  function buildAll(){ buildNeural(); buildCircuit(); buildScan(); }
  function loop(now){
    const M=Math.max(.0001,state.motionIntensity);
    ctx.clearRect(0,0,W,H);
    const mode=state.heroLayout;
    if(mode==='grid') drawCircuit(M);
    else if(mode==='noise') drawScan(M);
    else drawNeural(M);
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize',resize);
  window.addEventListener('mousemove',e=>{ mouse.x=e.clientX; mouse.y=e.clientY; mouse.active=true; });
  window.addEventListener('mouseleave',()=>mouse.active=false);
  resize(); requestAnimationFrame(loop);
})();
