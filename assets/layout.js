/* Shared layout renderer — chrome top/bottom, footer, tweaks, canvas, bg layers
   IMPORTANT: top chrome is inserted before #layout-mount (fixed elements only).
   Footer is appended to document.body AFTER all page content. */
(function(){
  function topHtml(nav){
    return `
<canvas id="bg-canvas"></canvas>
<div class="bg-grid"></div>
<div class="bg-paper"></div>
<div class="bg-grain"></div>
<div class="bg-vignette"></div>
<div class="bg-scan"></div>
<div class="frame-corners" aria-hidden="true"><span></span></div>

<header class="chrome-top">
  <a class="logo" href="index.html">
    <span class="logo-mark">
      <svg viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="nwlg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#d4b274"/><stop offset="1" stop-color="#fae7b4"/>
          </linearGradient>
        </defs>
        <circle cx="6"  cy="6"  r="1.8" fill="currentColor"/>
        <circle cx="18" cy="6"  r="1.8" fill="currentColor"/>
        <circle cx="6"  cy="18" r="1.8" fill="currentColor"/>
        <circle cx="18" cy="18" r="1.8" fill="currentColor"/>
        <circle cx="12" cy="12" r="3"   fill="url(#nwlg)"/>
        <path d="M6 6 L12 12 L18 6 M6 18 L12 12 L18 18" stroke="currentColor" stroke-width="0.8"/>
      </svg>
    </span>
    NEURON WORX
  </a>
  <nav class="nav">
    ${[
      ['index.html',   'Index'],
      ['about.html',   'About'],
      ['services.html','Services'],
      ['works.html',   'Works'],
      ['team.html',    'Team'],
      ['careers.html', 'Careers'],
      ['news.html',    'News'],
      ['company.html', 'Company']
    ].map(([h,l])=> `<a href="${h}" class="${nav===h?'on':''}">${l}</a>`).join('')}
  </nav>
  <a class="cta-top" href="contact.html">Contact →</a>
</header>

<div class="chrome-bottom">
  <div><span class="tick">●</span>&nbsp;&nbsp;LIVE / SIGNAL LOCKED</div>
  <div><span id="clock" class="now">--:--:--</span>&nbsp;&nbsp;JST · TYO 35.676°N, 139.650°E</div>
  <div>N°<span id="cursor-coord">000,000</span></div>
</div>

<div class="tweaks" id="tweaks">
  <h4>TWEAKS <span class="close" onclick="window.parent.postMessage({type:'__deactivate_edit_mode'},'*'); document.getElementById('tweaks').classList.remove('active')">×</span></h4>
  <div class="tw-row"><span class="label">Theme</span><div class="tw-opts" data-key="theme">
    <button class="tw-opt" data-val="dark">Dark</button>
    <button class="tw-opt" data-val="light">Light</button>
  </div></div>
  <div class="tw-row"><span class="label">Accent</span><div class="tw-opts" data-key="accent">
    <button class="tw-opt" data-val="violet">Violet</button>
    <button class="tw-opt" data-val="gold">Gold</button>
    <button class="tw-opt" data-val="crimson">Crimson</button>
    <button class="tw-opt" data-val="mono">Mono</button>
  </div></div>
  <div class="tw-row"><span class="label">Display Font</span><div class="tw-opts" data-key="font">
    <button class="tw-opt" data-val="serif-italic">Italic</button>
    <button class="tw-opt" data-val="serif-roman">Roman</button>
    <button class="tw-opt" data-val="mincho">明朝</button>
    <button class="tw-opt" data-val="mono">Mono</button>
  </div></div>
  <div class="tw-row"><span class="label">Background</span><div class="tw-opts" data-key="heroLayout">
    <button class="tw-opt" data-val="neural">Wireframe</button>
    <button class="tw-opt" data-val="grid">Circuit</button>
    <button class="tw-opt" data-val="noise">Warp</button>
  </div></div>
  <div class="tw-row"><span class="label">Motion <span id="mi-val" style="float:right;color:var(--gold)">2</span></span>
    <input type="range" class="tw-range" id="mi" min="0" max="3" step="1" value="2"/>
  </div>
</div>`;
  }

  function footerHtml(){
    return `
<footer class="end">
  <div class="end-wrap">
    <div>
      <div style="font-family:var(--mono);font-size:13px;letter-spacing:.22em;margin-bottom:18px;color:var(--ink);">NEURON · WORX</div>
      <div style="font-family:var(--serif-jp);color:var(--ink-dim);line-height:1.9;font-size:14px;max-width:42ch;">
        合同会社 Neuron Worx は、AI・人材・食・不動産の四領域を編む東京の事業体です。異領域の接続を本業とします。
      </div>
      <div class="rule-gold" style="margin:24px 0 0;max-width:320px;"><span class="dot"></span>EST. 2021 · TOKYO</div>
    </div>
    <div>
      <h5>Sitemap</h5>
      <ul>
        <li><a href="index.html">Index</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="services.html">Services</a></li>
        <li><a href="works.html">Works</a></li>
      </ul>
    </div>
    <div>
      <h5>Company</h5>
      <ul>
        <li><a href="team.html">Team</a></li>
        <li><a href="careers.html">Careers</a></li>
        <li><a href="news.html">News</a></li>
        <li><a href="company.html">Company Info</a></li>
      </ul>
    </div>
    <div>
      <h5>Contact</h5>
      <ul>
        <li><a href="mailto:hello@neuronworx.co.jp">hello@neuronworx.co.jp</a></li>
        <li><a href="mailto:press@neuronworx.co.jp">press@neuronworx.co.jp</a></li>
        <li><a href="mailto:careers@neuronworx.co.jp">careers@neuronworx.co.jp</a></li>
        <li><a href="contact.html">→ お問い合わせ</a></li>
      </ul>
    </div>
  </div>
  <div class="end-mark-row">
    <div>© 2026 合同会社 Neuron Worx</div>
    <div>Built in Tokyo · Signal OK</div>
  </div>
</footer>`;
  }

  window.NW_renderLayout = function(activeNav){
    // Insert fixed chrome elements before #layout-mount
    // Footer is already inlined in each HTML file — no JS injection needed
    const mount = document.getElementById('layout-mount');
    if (mount) mount.insertAdjacentHTML('beforebegin', topHtml(activeNav));
  };
})();
