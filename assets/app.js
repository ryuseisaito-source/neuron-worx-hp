/* ==========================================================
   NEURON WORX — Shared app.js (inner pages)
   Handles: tweaks, clock, reveal, page transitions, canvas FX
========================================================== */
(function(){
  /* ── State ── */
  const DEFS = window.TWEAK_DEFAULTS || {theme:'dark',accent:'violet',font:'serif-italic',heroLayout:'neural',motionIntensity:2};
  const state = Object.assign({}, DEFS);

  function applyState(){
    document.body.dataset.theme  = state.theme;
    document.body.dataset.accent = state.accent;
    document.body.dataset.font   = state.font;
    document.body.dataset.hero   = state.heroLayout;
    document.documentElement.style.setProperty('--motion', String(state.motionIntensity));
    document.querySelectorAll('.tw-opts').forEach(w=>{
      w.querySelectorAll('.tw-opt').forEach(b=> b.classList.toggle('on', b.dataset.val===state[w.dataset.key]));
    });
    const mi=document.getElementById('mi'), mv=document.getElementById('mi-val');
    if(mi) mi.value=state.motionIntensity;
    if(mv) mv.textContent=state.motionIntensity;
  }
  function setKey(k,v){
    state[k]=v; applyState();
    try{ window.parent.postMessage({type:'__edit_mode_set_keys',edits:{[k]:v}},'*'); }catch(e){}
  }
  document.addEventListener('click', e=>{
    const b=e.target.closest('.tw-opt'); if(!b) return;
    const w=b.closest('.tw-opts'); if(!w) return;
    setKey(w.dataset.key, b.dataset.val);
  });
  document.addEventListener('input', e=>{
    if(e.target.id==='mi') setKey('motionIntensity', parseInt(e.target.value));
  });
  const tweaksClose = document.getElementById('tweaks-close');
  if(tweaksClose) tweaksClose.onclick=()=>{
    document.getElementById('tweaks').classList.remove('active');
    try{ window.parent.postMessage({type:'__deactivate_edit_mode'},'*'); }catch(e){}
  };
  window.addEventListener('message', e=>{
    const d=e.data||{};
    const p=document.getElementById('tweaks');
    if(!p) return;
    if(d.type==='__activate_edit_mode') p.classList.add('active');
    if(d.type==='__deactivate_edit_mode') p.classList.remove('active');
  });
  try{ window.parent.postMessage({type:'__edit_mode_available'},'*'); }catch(e){}
  applyState();

  /* ── Clock ── */
  const pad=n=>String(n).padStart(2,'0');
  setInterval(()=>{
    const d=new Date(), el=document.getElementById('clock');
    if(el) el.textContent=`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  },1000);
  document.addEventListener('mousemove', e=>{
    const el=document.getElementById('cursor-coord');
    if(el) el.textContent=`${pad(Math.round(e.clientX))},${pad(Math.round(e.clientY))}`;
  });

  /* ── Reveal ── */
  const io=new IntersectionObserver(ents=>{
    ents.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }});
  },{threshold:0.05, rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
  setTimeout(()=>{
    document.querySelectorAll('.reveal:not(.in)').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.top < window.innerHeight) el.classList.add('in');
    });
  },120);

  /* ── Page transitions ── */
  const trans=document.getElementById('page-trans');
  if(trans){
    window.addEventListener('pageshow',()=> trans.classList.remove('enter'));
    document.addEventListener('click', e=>{
      const a=e.target.closest('a[href]'); if(!a) return;
      const href=a.getAttribute('href');
      if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('mailto:')||a.target==='_blank') return;
      e.preventDefault();
      trans.classList.add('enter');
      setTimeout(()=> location.href=href, 480);
    });
  }

  /* ── Canvas FX ── */
  const canvas=document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  let W,H,dpr;
  let mouse={x:-9999,y:-9999,active:false};

  function gRgb(v){ const s=getComputedStyle(document.body).getPropertyValue(v).trim()||'#c9a96e'; const h=s.replace('#',''); const n=parseInt(h,16); return{r:(n>>16)&255,g:(n>>8)&255,b:n&255}; }

  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=canvas.clientWidth=window.innerWidth;
    H=canvas.clientHeight=window.innerHeight;
    canvas.width=W*dpr; canvas.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    buildAll();
  }

  /* Wireframe */
  let wf=null;
  function buildWireframe(){
    const t=(1+Math.sqrt(5))/2;
    let v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(v=>{const L=Math.hypot(v[0],v[1],v[2]);return[v[0]/L,v[1]/L,v[2]/L];});
    let f=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
    function mid(a,b){const m=[(v[a][0]+v[b][0])/2,(v[a][1]+v[b][1])/2,(v[a][2]+v[b][2])/2];const L=Math.hypot(m[0],m[1],m[2]);v.push([m[0]/L,m[1]/L,m[2]/L]);return v.length-1;}
    for(let s=0;s<2;s++){const f2=[],c=new Map();const gm=(a,b)=>{const k=a<b?a+'_'+b:b+'_'+a;if(c.has(k))return c.get(k);const m=mid(a,b);c.set(k,m);return m;};for(const[a,b,cc]of f){const ab=gm(a,b),bc=gm(b,cc),ca=gm(cc,a);f2.push([a,ab,ca],[b,bc,ab],[cc,ca,bc],[ab,bc,ca]);}f=f2;}
    const es=new Set(),edges=[];for(const[a,b,c]of f)for(const[p,q]of[[a,b],[b,c],[c,a]]){const k=p<q?p+'_'+q:q+'_'+p;if(!es.has(k)){es.add(k);edges.push([p,q]);}}
    const parts=[];for(let i=0;i<40;i++)parts.push({e:Math.floor(Math.random()*edges.length),t:Math.random(),speed:.002+Math.random()*.005});
    wf={v,edges,rot:{x:0,y:0},parts};
  }
  function drawWireframe(M,time){
    const cx=W/2,cy=H/2,radius=Math.min(W,H)*.4;
    wf.rot.y+=.001*M; wf.rot.x=Math.sin(time*.00012)*.28;
    const mx=(mouse.active?(mouse.x-cx)/W:0)*.5,my=(mouse.active?(mouse.y-cy)/H:0)*.5;
    const rx=wf.rot.x+my*.4,ry=wf.rot.y+mx*.4;
    const cx2=Math.cos(rx),sx=Math.sin(rx),cy2=Math.cos(ry),sy=Math.sin(ry);
    const proj=wf.v.map(v=>{
      let x=v[0],y=v[1],z=v[2];
      let x1=x*cy2+z*sy,z1=-x*sy+z*cy2;
      let y2=y*cx2-z1*sx,z2=y*sx+z1*cx2;
      const p=2.4/(2.4-z2);
      return{x:cx+x1*radius*p,y:cy+y2*radius*p,z:z2};
    });
    ctx.strokeStyle='rgba(201,169,110,0.06)'; ctx.lineWidth=1;
    for(let r=1;r<=5;r++){ctx.beginPath();ctx.ellipse(cx,cy,radius*1.3*(r/5),radius*.38*(r/5),0,0,Math.PI*2);ctx.stroke();}
    const g=gRgb('--gold'),a=gRgb('--accent');
    const sorted=wf.edges.map(e=>{const A=proj[e[0]],B=proj[e[1]];return{A,B,z:(A.z+B.z)/2};}).sort((a,b)=>a.z-b.z);
    for(const{A,B,z}of sorted){
      const d=(z+1)/2,alpha=.04+d*.3;
      ctx.strokeStyle=`rgba(${g.r},${g.g},${g.b},${alpha})`;
      ctx.lineWidth=.5+d*.7;
      ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();
    }
    for(const pt of proj){const d=(pt.z+1)/2;if(d<.6)continue;ctx.fillStyle=`rgba(255,250,235,${.2+d*.35})`;ctx.beginPath();ctx.arc(pt.x,pt.y,1+d*1,0,Math.PI*2);ctx.fill();}
    for(const p of wf.parts){
      p.t+=p.speed*M; if(p.t>=1){p.t=0;p.e=Math.floor(Math.random()*wf.edges.length);}
      const e=wf.edges[p.e],A=proj[e[0]],B=proj[e[1]];
      if((A.z+B.z)/2<0) continue;
      const x=A.x+(B.x-A.x)*p.t,y=A.y+(B.y-A.y)*p.t;
      ctx.fillStyle=`rgba(${a.r},${a.g},${a.b},.7)`;
      ctx.beginPath();ctx.arc(x,y,1.3,0,Math.PI*2);ctx.fill();
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
        if(Math.random()<.35)dir=(dir+(Math.random()<.5?1:3))%4;
        const d=[[1,0],[0,1],[-1,0],[0,-1]][dir];
        cx=Math.max(0,Math.min(cols-1,cx+d[0]));cy=Math.max(0,Math.min(rows-1,cy+d[1]));
        pts.push([cx,cy]);
      }
      traces.push(pts);pads.push(pts[0]);
      if(Math.random()<.6)pads.push(pts[pts.length-1]);
    }
    circuit={cell,traces,pads,sparks:[]};
  }
  function drawCircuit(M){
    const g=gRgb('--gold'),a=gRgb('--accent');
    ctx.strokeStyle=`rgba(${g.r},${g.g},${g.b},.1)`;ctx.lineWidth=.9;ctx.lineCap='square';
    for(const pts of circuit.traces){ctx.beginPath();for(let i=0;i<pts.length;i++){const x=pts[i][0]*circuit.cell,y=pts[i][1]*circuit.cell;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}
    for(const p of circuit.pads){const x=p[0]*circuit.cell,y=p[1]*circuit.cell;ctx.fillStyle='rgba(10,10,18,1)';ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(${g.r},${g.g},${g.b},.3)`;ctx.lineWidth=.8;ctx.stroke();}
    const rate=Math.min(3,Math.ceil(M));
    for(let s=0;s<rate;s++){if(Math.random()<.5&&circuit.traces.length){const pts=circuit.traces[Math.floor(Math.random()*circuit.traces.length)];if(pts.length>=2)circuit.sparks.push({pts,t:0,speed:.005+Math.random()*.008});}}
    for(let i=circuit.sparks.length-1;i>=0;i--){
      const sp=circuit.sparks[i];sp.t+=sp.speed*M;if(sp.t>=1){circuit.sparks.splice(i,1);continue;}
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
    const cx=W/2,cy=H/2,g=gRgb('--gold'),a=gRgb('--accent');
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

  function buildAll(){buildWireframe();buildCircuit();buildScan();}
  function loop(now){
    const M=Math.max(.0001,state.motionIntensity);
    ctx.clearRect(0,0,W,H);
    const mode=state.heroLayout;
    if(mode==='grid') drawCircuit(M);
    else if(mode==='noise') drawScan(M);
    else drawWireframe(M,now);
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize',resize);
  window.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true;});
  window.addEventListener('mouseleave',()=>mouse.active=false);
  resize(); requestAnimationFrame(loop);
})();
