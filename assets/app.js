/* NEURON WORX — app.js v6  (all pages) */
(function(){
  const ACCENT_VARS = {
    orange:{a:'#252745',a2:'#3a3d70'},
    white: {a:'#f0ede5',a2:'#cccccc'},
    lime:  {a:'#aaff00',a2:'#ccff44'},
    cyan:  {a:'#00ccff',a2:'#44ddff'},
  };
  const DEFS = window.TWEAK_DEFAULTS||{theme:'dark',accent:'orange',font:'sans'};
  const state = Object.assign({},DEFS);

  function applyState(){
    document.body.dataset.theme  = state.theme;
    document.body.dataset.accent = state.accent;
    document.body.dataset.font   = state.font;
    const av = ACCENT_VARS[state.accent]||ACCENT_VARS.orange;
    const r = document.documentElement;
    r.style.setProperty('--accent',   av.a);
    r.style.setProperty('--accent-2', av.a2);
    r.style.setProperty('--orange',   av.a);
    r.style.setProperty('--orange-2', av.a2);
    document.querySelectorAll('.tw-opts').forEach(w=>{
      w.querySelectorAll('.tw-opt').forEach(b=>b.classList.toggle('on',b.dataset.val===state[w.dataset.key]));
    });
  }
  function setKey(k,v){state[k]=v;applyState();}
  document.addEventListener('click',e=>{
    const b=e.target.closest('.tw-opt');if(!b)return;
    const w=b.closest('.tw-opts');if(!w)return;
    setKey(w.dataset.key,b.dataset.val);
  });
  document.getElementById('tweaks-close')?.addEventListener('click',()=>{
    document.getElementById('tweaks')?.classList.remove('active');
  });
  applyState();

  /* Menu */
  const menu=document.getElementById('menu');
  document.getElementById('menu-open')?.addEventListener('click',()=>{
    menu?.classList.add('open');document.body.style.overflow='hidden';
  });
  document.getElementById('menu-close')?.addEventListener('click',()=>{
    menu?.classList.remove('open');document.body.style.overflow='';
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){menu?.classList.remove('open');document.body.style.overflow='';}
  });

  /* Reveal */
  const io=new IntersectionObserver(ents=>{
    ents.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});
  },{threshold:0.05,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  setTimeout(()=>{
    document.querySelectorAll('.reveal:not(.in)').forEach(el=>{
      if(el.getBoundingClientRect().top<window.innerHeight)el.classList.add('in');
    });
  },200);

  /* Page transitions */
  const trans=document.getElementById('page-trans');
  if(trans){
    window.addEventListener('pageshow',()=>trans.classList.remove('enter'));
    document.addEventListener('click',e=>{
      const a=e.target.closest('a[href]');if(!a)return;
      const href=a.getAttribute('href');
      if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('mailto:')||a.target==='_blank')return;
      e.preventDefault();
      trans.classList.add('enter');
      setTimeout(()=>location.href=href,500);
    });
  }

  /* Canvas neural network */
  const canvas=document.getElementById('bg-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let W,H,dpr,nodes=[];
  let mouse={x:-9999,y:-9999};

  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=canvas.clientWidth=window.innerWidth;
    H=canvas.clientHeight=window.innerHeight;
    canvas.width=W*dpr;canvas.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    build();
  }
  function build(){
    const n=Math.max(40,Math.floor((W*H)/15000));
    nodes=[];
    for(let i=0;i<n;i++)nodes.push({
      x:Math.random()*W,y:Math.random()*H,
      vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45,
      r:.7+Math.random()*1.2,
    });
  }
  function loop(){
    ctx.clearRect(0,0,W,H);
    const R=190;
    const ac=getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#252745';
    const h=ac.replace('#','');const cv=parseInt(h,16);
    const r=(cv>>16)&255,g=(cv>>8)&255,b=cv&255;
    for(const n of nodes){
      n.x+=n.vx*.4;n.y+=n.vy*.4;
      if(n.x<-R)n.x=W+R;if(n.x>W+R)n.x=-R;
      if(n.y<-R)n.y=H+R;if(n.y>H+R)n.y=-R;
      const dx=n.x-mouse.x,dy=n.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<120&&d>0){n.x+=(dx/d)*.25;n.y+=(dy/d)*.25;}
    }
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i],b2=nodes[j],dx=b2.x-a.x,dy=b2.y-a.y,d2=dx*dx+dy*dy;
        if(d2>R*R)continue;
        const alpha=(1-Math.sqrt(d2)/R)*.1;
        ctx.strokeStyle=`rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth=.6;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b2.x,b2.y);ctx.stroke();
      }
    }
    for(const n of nodes){
      ctx.fillStyle=`rgba(${r},${g},${b},.16)`;
      ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize',resize);
  window.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  resize();loop();
})();
