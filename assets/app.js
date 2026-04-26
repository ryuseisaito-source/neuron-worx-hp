/* NEURON WORX — app.js v6  (shared across all sub-pages) */
(function(){
  const ACCENT_VARS = {
    orange: {a:'#252745', a2:'#3a3d70'},
    white:  {a:'#f0ede5', a2:'#cccccc'},
    lime:   {a:'#aaff00', a2:'#ccff44'},
    cyan:   {a:'#00ccff', a2:'#44ddff'},
  };

  const DEFS = window.TWEAK_DEFAULTS || {theme:'dark', accent:'orange', font:'sans'};
  const state = Object.assign({}, DEFS);

  function applyState(){
    document.body.dataset.theme  = state.theme;
    document.body.dataset.accent = state.accent;
    document.body.dataset.font   = state.font;
    const av = ACCENT_VARS[state.accent] || ACCENT_VARS.orange;
    const r = document.documentElement;
    r.style.setProperty('--accent',   av.a);
    r.style.setProperty('--accent-2', av.a2);
    r.style.setProperty('--orange',   av.a);
    r.style.setProperty('--orange-2', av.a2);
    document.querySelectorAll('.tw-opts').forEach(w=>{
      w.querySelectorAll('.tw-opt').forEach(b=> b.classList.toggle('on', b.dataset.val===state[w.dataset.key]));
    });
  }

  function setKey(k,v){ state[k]=v; applyState(); }

  document.addEventListener('click', e=>{
    const b=e.target.closest('.tw-opt'); if(!b) return;
    const w=b.closest('.tw-opts'); if(!w) return;
    setKey(w.dataset.key, b.dataset.val);
  });

  document.getElementById('tweaks-close')?.addEventListener('click', ()=>{
    document.getElementById('tweaks')?.classList.remove('active');
  });

  applyState();

  /* Menu */
  const menu = document.getElementById('menu');
  document.getElementById('menu-open')?.addEventListener('click', ()=>{
    menu?.classList.add('open'); document.body.style.overflow='hidden';
  });
  document.getElementById('menu-close')?.addEventListener('click', ()=>{
    menu?.classList.remove('open'); document.body.style.overflow='';
  });
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ menu?.classList.remove('open'); document.body.style.overflow=''; }
  });

  /* Reveal */
  const io = new IntersectionObserver(ents=>{
    ents.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }});
  },{threshold:0.05, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
  setTimeout(()=>{
    document.querySelectorAll('.reveal:not(.in)').forEach(el=>{
      if(el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    });
  }, 200);

  /* Page transitions */
  const trans = document.getElementById('page-trans');
  if(trans){
    window.addEventListener('pageshow', ()=> trans.classList.remove('enter'));
    document.addEventListener('click', e=>{
      const a = e.target.closest('a[href]'); if(!a) return;
      const href = a.getAttribute('href');
      if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('mailto:')||a.target==='_blank') return;
      e.preventDefault();
      trans.classList.add('enter');
      setTimeout(()=> location.href=href, 500);
    });
  }
})();
