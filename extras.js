/* ============================================================
   LUMEN — EXTRAS v14.8
   Skeleton loaders · Templates Gallery · Onboarding Tour · PWA
   ============================================================ */
window.LUMEN_VERSION='14.8';
console.log('%c✨ Lumen v'+window.LUMEN_VERSION+' loaded','color:#a78bfa;font-weight:bold;font-size:13px');

/* === SKELETON LOADER === */
window.skel=function(out,opts={}){
  if(!out)return;
  const stages=opts.stages||['Анализирую запрос','Подбираю стиль','Генерирую варианты'];
  const count=opts.count||3;
  const cards=Array.from({length:count},()=>`
    <div class="skeleton skeleton-card">
      <div class="skeleton-line short" style="background:rgba(167,139,250,.12)"></div>
      <div class="skeleton-line long"></div>
      <div class="skeleton-line long"></div>
      <div class="skeleton-line" style="width:75%"></div>
    </div>`).join('');
  out.innerHTML=`
    <div class="skeleton-progress">
      <span class="skeleton-progress-dot"></span>
      <span class="skeleton-progress-dot"></span>
      <span class="skeleton-progress-dot"></span>
      <span data-skel-stage>${stages[0]}...</span>
    </div>
    ${cards}`;
  // Cycle through stages every 2s
  let i=0;
  const stageEl=out.querySelector('[data-skel-stage]');
  const interval=setInterval(()=>{
    i++;if(i>=stages.length){clearInterval(interval);return;}
    if(stageEl)stageEl.textContent=stages[i]+'...';
  },2000);
  out._skelInterval=interval;
};
window.skelStop=function(out){if(out&&out._skelInterval){clearInterval(out._skelInterval);out._skelInterval=null;}};

/* === TEMPLATES GALLERY === */
const TPL=[
  // 🎬 Видео — реклама
  {cat:'ads',mode:'video',title:'Apple Style Product Reveal',icon:'sparkles',idea:'минималистичная реклама нового продукта в стиле Apple: один объект на белом фоне, плавное вращение, мягкий свет, идеальная отрисовка деталей',target:'minimalism'},
  {cat:'ads',mode:'video',title:'Nike Hype Sport',icon:'zap',idea:'спортсмен в slow-motion прорывается сквозь дождь, динамичная съёмка, vibrant colors, атмосфера превозмогания, текст на экране в конце',target:'cinematic'},
  {cat:'ads',mode:'video',title:'Bond / Spy Cinematic',icon:'aperture',idea:'агент в чёрном смокинге выходит из машины ночью, неоновые отражения, медленное приближение камеры, atmospheric thriller mood',target:'cinematic'},
  {cat:'ads',mode:'video',title:'Pixar Family Joy',icon:'heart',idea:'счастливая семья за завтраком, тёплый утренний свет, 3D-анимация в стиле Pixar, expressive faces, soft pastel colors',target:'animation'},
  {cat:'ads',mode:'video',title:'A24 Indie Film',icon:'film',idea:'одинокая фигура у окна на закате, 35mm film grain, melancholic mood, золотой час, тонкая цветокоррекция в стиле A24',target:'cinematic'},
  {cat:'ads',mode:'video',title:'Luxury Watch Macro',icon:'watch',idea:'часы класса люкс крупным планом: вращение механизма, бликующие грани, чёрный фон, точечный свет, slow motion',target:'product'},
  {cat:'ads',mode:'video',title:'Perfume Sensual Spray',icon:'flower-2',idea:'женщина наносит парфюм у окна, лёгкие струи в воздухе, soft natural light, шёлковый халат, медленный пуш-ин',target:'product'},
  {cat:'ads',mode:'video',title:'Tech Gadget Unboxing',icon:'package',idea:'руки распаковывают новый гаджет на тёмной поверхности, подсветка изнутри коробки, hyperreal materials, top-down shot',target:'product'},

  // 📝 Текст
  {cat:'text',mode:'text',title:'Маяк в шторме',icon:'lighthouse',idea:'Старый маяк на скалистом берегу. Туман окутывает башню, луч прожектора режет тьму. Слышно крики чаек и шум прибоя. Одинокий смотритель пьёт чай у окна.',target:'cinematic'},
  {cat:'text',mode:'text',title:'Метро в час пик',icon:'train',idea:'Парижское метро, час пик. Девушка в красном пальто стоит в плотной толпе пассажиров, читает книгу. Свет вагона мерцает, проезжают станции. Контраст её спокойствия и хаоса вокруг.',target:'cinematic'},
  {cat:'text',mode:'text',title:'Зимний лес на рассвете',icon:'tree-pine',idea:'Густой заснеженный лес на рассвете. Лучи холодного солнца пробиваются сквозь ветви елей, создавая золотистые столбы света в морозном воздухе. Олень осторожно идёт по снегу.',target:'nature'},
  {cat:'text',mode:'text',title:'Чайхана в Стамбуле',icon:'coffee',idea:'Старая турецкая чайхана в Стамбуле, вечер. Старики играют в нарды, дым кальяна, тёплое освещение керосиновых ламп. Вид через окно на минареты на фоне заката.',target:'cinematic'},
  {cat:'text',mode:'text',title:'Cyberpunk дождь',icon:'cpu',idea:'Ночной киберпанк-город под дождём. Девушка с серебристыми волосами в неоновом плаще медленно идёт по мокрой улице. Голограммы реклам отражаются в лужах, лёгкий туман, неоновые вывески.',target:'cinematic'},

  // 🖼 Картинка
  {cat:'image',mode:'image',title:'Portrait Editorial',icon:'user',idea:'editorial portrait of a young woman with red hair, dramatic side lighting, charcoal background, Vogue magazine style, fashion photography, 85mm lens, shallow depth of field',target:'photo'},
  {cat:'image',mode:'image',title:'Cyberpunk Cityscape',icon:'building-2',idea:'aerial view of a cyberpunk megacity at night, neon signs in Japanese, flying vehicles, holographic billboards, rainy atmosphere, Blade Runner aesthetic',target:'cinematic'},
  {cat:'image',mode:'image',title:'Studio Ghibli Landscape',icon:'mountain',idea:'lush green hillside with white clouds and a small wooden house, in the style of Studio Ghibli, soft watercolor textures, magical realism, warm afternoon light',target:'animation'},
  {cat:'image',mode:'image',title:'Macro Bee on Flower',icon:'bug',idea:'extreme macro photography of a bee collecting pollen on a yellow sunflower, hyperreal detail, golden hour, bokeh background, National Geographic style',target:'photo'},
  {cat:'image',mode:'image',title:'Wes Anderson Symmetry',icon:'square',idea:'symmetrical composition, pastel pink hotel facade, vintage car centered, deadpan style of Wes Anderson, flat lighting, perfectly centered framing',target:'cinematic'},
  {cat:'image',mode:'image',title:'Watercolor Botanical',icon:'flower',idea:'delicate botanical illustration of wild herbs and flowers, soft watercolor washes, vintage scientific journal style, off-white parchment background, hand-drawn details',target:'illustration'},

  // 💼 Бизнес / SMM
  {cat:'biz',mode:'video',title:'Корпоратив-визитка',icon:'briefcase',idea:'современный офис, команда работает за компьютерами, drone-shot пролетает над open space, динамичные графики на экранах, тёплая корпоративная атмосфера',target:'corporate'},
  {cat:'biz',mode:'video',title:'Tutorial / How-to',icon:'graduation-cap',idea:'минималистичная съёмка рук, выполняющих процесс step-by-step. Чистый белый фон, top-down camera, понятные движения, текст-подсказки появляются рядом',target:'tutorial'},
  {cat:'biz',mode:'video',title:'Testimonial Customer',icon:'message-square',idea:'клиент рассказывает о продукте, мягкое студийное освещение, размытый фон офиса, искренние эмоции, plain backdrop',target:'documentary'},

  // 🎵 SMM / Reels
  {cat:'reels',mode:'video',title:'TikTok Hook (3s)',icon:'flame',idea:'девушка резко поворачивается к камере и улыбается, drop в музыке, vibrant colors, slow-mo переход в hype шот, 9:16 вертикальный',target:'social'},
  {cat:'reels',mode:'video',title:'Reels Lifestyle Day',icon:'sun',idea:'утренний ритуал: кофе, ноутбук, окно с видом на город. Sequence из 4 кадров с smooth-transitions, lo-fi atmosphere, тёплая палитра',target:'social'},
  {cat:'reels',mode:'video',title:'YouTube Intro 5s',icon:'youtube',idea:'динамичная анимация логотипа: глитч, скейл-ап, vibrant explosion, electronic music sting, professional motion design',target:'animation'},

  // 🌌 Креатив / арт
  {cat:'art',mode:'image',title:'Surreal Dreamscape',icon:'cloud',idea:'floating islands in a pink sky, gigantic moon, person walking on a path of stars, surreal Salvador Dali meets digital art, magical lighting',target:'art'},
  {cat:'art',mode:'image',title:'Abstract Liquid Metal',icon:'droplet',idea:'abstract liquid chrome flowing in zero gravity, iridescent reflections, cosmic background, cinema 4D render, premium product aesthetic',target:'art'},
  {cat:'art',mode:'video',title:'Morphing Geometry',icon:'shapes',idea:'геометрические формы плавно превращаются друг в друга — куб → сфера → тор, чистый студийный свет, gradient background, 3D motion design в стиле Apple keynote',target:'art'},

  // 🎮 Геймдев / fantasy
  {cat:'fantasy',mode:'image',title:'Epic Fantasy Castle',icon:'castle',idea:'massive fantasy castle on a cliff overlooking misty valley, dragons flying, golden hour, Lord of the Rings cinematography, hyperreal detail, matte painting',target:'art'},
  {cat:'fantasy',mode:'image',title:'Cyber Samurai Warrior',icon:'sword',idea:'futuristic samurai with neon-lit katana, cyberpunk armor, standing in rain on rooftop, Tokyo skyline behind, dramatic backlighting',target:'art'},
];

const TPL_CATS={
  ads:{label:'Реклама',icon:'megaphone'},
  text:{label:'Текст',icon:'pen-tool'},
  image:{label:'Картинки',icon:'image'},
  biz:{label:'Бизнес',icon:'briefcase'},
  reels:{label:'Reels/Shorts',icon:'flame'},
  art:{label:'Арт/креатив',icon:'palette'},
  fantasy:{label:'Fantasy',icon:'wand-2'},
};

function tplOpenModal(){
  let m=document.getElementById('tplModal');
  if(!m){
    m=document.createElement('div');
    m.id='tplModal';
    m.className='sm-hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4';
    m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
    m.innerHTML=`<div class="card max-w-5xl w-full max-h-[90vh] flex flex-col glass rounded-2xl" style="background:rgba(13,10,26,.98)">
      <div class="p-5 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 grid place-items-center"><i data-lucide="library-big" style="color:white"></i></div>
          <div>
            <h3 class="font-bold text-lg">Шаблоны промтов</h3>
            <p class="text-xs subtle">${TPL.length} готовых сценариев · клик → открывается с настройками</p>
          </div>
        </div>
        <button id="tplClose" class="soft-btn p-2 inline-flex items-center"><i data-lucide="x"></i></button>
      </div>
      <div class="px-5 pt-4 pb-2 border-b border-white/5">
        <div class="flex gap-2 flex-wrap" id="tplCats"></div>
      </div>
      <div id="tplGrid" class="overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 scrollbar"></div>
    </div>`;
    document.body.appendChild(m);
    m.querySelector('#tplClose').onclick=()=>m.classList.add('sm-hidden');
    m.addEventListener('click',e=>{if(e.target===m)m.classList.add('sm-hidden');});
  }
  // Render categories
  const cats=m.querySelector('#tplCats');
  let activeCat='all';
  const renderCats=()=>{
    cats.innerHTML=`<button class="soft-btn text-xs px-3 py-1.5 inline-flex items-center gap-1.5 ${activeCat==='all'?'chip-active':''}" data-tpl-cat="all"><i data-lucide="grid-3x3"></i>Все</button>`+
      Object.entries(TPL_CATS).map(([k,v])=>`<button class="soft-btn text-xs px-3 py-1.5 inline-flex items-center gap-1.5 ${activeCat===k?'chip-active':''}" data-tpl-cat="${k}"><i data-lucide="${v.icon}"></i>${v.label}</button>`).join('');
    cats.querySelectorAll('[data-tpl-cat]').forEach(b=>b.onclick=()=>{activeCat=b.dataset.tplCat;renderCats();renderGrid();});
    window.refreshIcons&&window.refreshIcons();
  };
  const renderGrid=()=>{
    const grid=m.querySelector('#tplGrid');
    const list=activeCat==='all'?TPL:TPL.filter(t=>t.cat===activeCat);
    if(!list.length){grid.innerHTML='<div class="empty-state col-span-full"><div class="empty-state-title">Пусто</div></div>';return;}
    grid.innerHTML=list.map((t,i)=>`<button class="sm-tile text-left tpl-card" data-tpl-i="${TPL.indexOf(t)}" style="padding:14px">
      <div class="flex items-start gap-3 mb-2">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/30 to-pink-500/20 border border-violet-400/30 grid place-items-center flex-shrink-0"><i data-lucide="${t.icon}" style="color:#c4b5fd"></i></div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm leading-tight">${t.title}</div>
          <div class="text-[10px] subtle uppercase tracking-wider mt-0.5">${TPL_CATS[t.cat]?.label||t.cat} · ${t.mode==='video'?'🎬 Видео':t.mode==='text'?'📝 Текст':'🖼 Картинка'}</div>
        </div>
      </div>
      <div class="text-xs subtle leading-relaxed line-clamp-3" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${t.idea}</div>
    </button>`).join('');
    grid.querySelectorAll('[data-tpl-i]').forEach(btn=>{
      btn.onclick=()=>{const t=TPL[+btn.dataset.tplI];tplApply(t);m.classList.add('sm-hidden');tplHidePreview();};
      btn.addEventListener('mouseenter',e=>tplShowPreview(TPL[+btn.dataset.tplI],e.currentTarget));
      btn.addEventListener('mouseleave',tplHidePreview);
      btn.addEventListener('focus',e=>tplShowPreview(TPL[+btn.dataset.tplI],e.currentTarget));
      btn.addEventListener('blur',tplHidePreview);
    });
    // Hide preview when modal scrolls / when leaving grid
    grid.addEventListener('scroll',tplHidePreview,{passive:true});
    window.refreshIcons&&window.refreshIcons();
  };
  renderCats();renderGrid();
  m.classList.remove('sm-hidden');
  window.refreshIcons&&window.refreshIcons();
}

/* === TEMPLATES floating preview tooltip === */
let _tplPreviewEl=null;
function tplShowPreview(t,anchor){
  if(!t||window.innerWidth<900)return; // skip on small screens
  if(!_tplPreviewEl){
    _tplPreviewEl=document.createElement('div');
    _tplPreviewEl.className='tpl-preview-floating';
    document.body.appendChild(_tplPreviewEl);
  }
  const modeLabel=t.mode==='video'?'🎬 Видео':t.mode==='text'?'📝 Текст':'🖼 Картинка';
  const catLabel=TPL_CATS[t.cat]?.label||t.cat;
  const wordCount=t.idea.trim().split(/\s+/).length;
  _tplPreviewEl.innerHTML=`
    <div class="tpl-pv-header">
      <div class="tpl-pv-icon"><i data-lucide="${t.icon}"></i></div>
      <div class="flex-1 min-w-0">
        <div class="tpl-pv-title">${t.title}</div>
        <div class="tpl-pv-meta">${catLabel} · ${modeLabel}</div>
      </div>
    </div>
    <div class="tpl-pv-badges">
      ${t.target?`<span class="tpl-pv-badge">🎯 ${t.target}</span>`:''}
      <span class="tpl-pv-badge">✍️ ${wordCount} слов</span>
    </div>
    <div class="tpl-pv-label">ПОЛНЫЙ ТЕКСТ ИДЕИ</div>
    <div class="tpl-pv-idea">${t.idea.replace(/[<>]/g,'')}</div>
    <div class="tpl-pv-hint">→ Клик чтобы открыть в Simple Mode</div>`;
  // Position next to anchor, prefer right side; clamp to viewport
  const r=anchor.getBoundingClientRect();
  const pw=320,ph=Math.min(_tplPreviewEl.offsetHeight||280,360);
  let left=r.right+12;
  if(left+pw>window.innerWidth-12)left=Math.max(12,r.left-pw-12);
  let top=r.top;
  if(top+ph>window.innerHeight-12)top=Math.max(12,window.innerHeight-ph-12);
  _tplPreviewEl.style.top=top+'px';
  _tplPreviewEl.style.left=left+'px';
  _tplPreviewEl.classList.add('tpl-pv-show');
  window.refreshIcons&&window.refreshIcons();
}
function tplHidePreview(){if(_tplPreviewEl)_tplPreviewEl.classList.remove('tpl-pv-show');}

function tplApply(t){
  // Switch to Simple mode if currently in Pro
  try{if(typeof setMode==='function')setMode('simple');}catch(e){}
  // Switch to the right tab and fill the idea
  try{if(typeof smSetTab==='function')smSetTab(t.mode==='video'?'video':t.mode==='text'?'text':'image');}catch(e){}
  setTimeout(()=>{
    const inputId=t.mode==='video'?'smIdea':t.mode==='text'?'txtInput':'imgIdea';
    const el=document.getElementById(inputId);
    if(el){el.value=t.idea;el.focus();el.scrollIntoView({behavior:'smooth',block:'center'});}
    toast('✓ Шаблон «'+t.title+'» загружен. Жми Создать!','success');
  },150);
}
window.tplOpenModal=tplOpenModal;

/* === ONBOARDING TOUR === */
/* Mini mockup SVGs — show what filled-in state looks like inside popover (premium illustrated tour) */
const TOUR_PREVIEW={
  // Step 1 preview is rendered as live HTML (fake textarea typewriter) — see TOUR_STEPS[0].previewHTML
  idea:'<div class="tour-fake-textarea" data-typewriter><span class="tour-typed"></span><span class="tour-caret">|</span></div><div class="tour-typed-hint">↑ ТАК ВЫГЛЯДИТ ХОРОШАЯ ИДЕЯ</div>',
  format:`<svg viewBox="0 0 280 92" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(8,10)"><rect width="60" height="56" rx="8" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.12)"/><text x="30" y="26" text-anchor="middle" font-size="18">🎬</text><text x="30" y="44" text-anchor="middle" font-size="9" fill="rgba(255,255,255,.55)" font-family="Inter,sans-serif">Кино</text></g>
    <g transform="translate(76,10)"><rect width="60" height="56" rx="8" fill="rgba(167,139,250,.22)" stroke="#a78bfa" stroke-width="1.8"/><text x="30" y="26" text-anchor="middle" font-size="18">📱</text><text x="30" y="44" text-anchor="middle" font-size="9" fill="white" font-weight="700" font-family="Inter,sans-serif">Реклама</text><circle cx="52" cy="8" r="5" fill="#a78bfa"/><path d="M49 8l2 2 4-4" stroke="white" stroke-width="1.4" fill="none"/></g>
    <g transform="translate(144,10)"><rect width="60" height="56" rx="8" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.12)"/><text x="30" y="26" text-anchor="middle" font-size="18">🌃</text><text x="30" y="44" text-anchor="middle" font-size="9" fill="rgba(255,255,255,.55)" font-family="Inter,sans-serif">Атмосфера</text></g>
    <g transform="translate(212,10)"><rect width="60" height="56" rx="8" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.12)"/><text x="30" y="26" text-anchor="middle" font-size="18">🎵</text><text x="30" y="44" text-anchor="middle" font-size="9" fill="rgba(255,255,255,.55)" font-family="Inter,sans-serif">Клип</text></g>
    <text x="106" y="84" fill="rgba(167,139,250,0.85)" font-size="9.5" font-family="Inter,sans-serif" font-weight="600">↑ КЛИК ПО ПЛИТКЕ ВЫБИРАЕТ ФОРМАТ</text>
  </svg>`,
  ai:`<svg viewBox="0 0 280 110" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="8" width="220" height="94" rx="11" fill="rgba(20,15,35,0.96)" stroke="rgba(167,139,250,.4)" stroke-width="1.2"/>
    <text x="42" y="26" fill="white" font-size="11" font-weight="700" font-family="Inter,sans-serif">⚙ AI Settings</text>
    <text x="42" y="44" fill="rgba(255,255,255,.5)" font-size="9" font-family="Inter,sans-serif">PROVIDER</text>
    <rect x="42" y="48" width="196" height="18" rx="5" fill="rgba(139,92,246,.2)" stroke="rgba(139,92,246,.5)"/>
    <text x="52" y="60" fill="white" font-size="10" font-family="Inter,sans-serif" font-weight="600">OpenAI</text>
    <path d="M226 54l4 4 4-4" stroke="rgba(255,255,255,.6)" stroke-width="1.4" fill="none"/>
    <text x="42" y="80" fill="rgba(255,255,255,.5)" font-size="9" font-family="Inter,sans-serif">API KEY</text>
    <rect x="42" y="83" width="196" height="14" rx="4" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)"/>
    <text x="50" y="93" fill="rgba(167,139,250,.85)" font-size="9" font-family="ui-monospace,monospace">sk-•••••••••••••••••••••••</text>
  </svg>`,
  generate:`<svg viewBox="0 0 280 116" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="glow"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect x="92" y="6" width="96" height="22" rx="11" fill="#7c3aed" filter="url(#glow)"/>
    <text x="140" y="22" text-anchor="middle" fill="white" font-size="11" font-weight="700" font-family="Inter,sans-serif">✨ Создать промт</text>
    <path d="M140 34l0 10 m-5 -5 l5 5 l5 -5" stroke="rgba(167,139,250,.7)" stroke-width="1.5" fill="none"/>
    <g transform="translate(8,52)">
      <rect width="84" height="56" rx="7" fill="rgba(34,197,94,.08)" stroke="rgba(34,197,94,.35)"/>
      <text x="8" y="14" font-size="8" fill="rgba(255,255,255,.55)" font-family="Inter,sans-serif" font-weight="600">VARIANT 1</text>
      <text x="8" y="32" font-size="14" fill="#22c55e" font-weight="700" font-family="Inter,sans-serif">★ 92</text>
      <text x="8" y="48" font-size="8" fill="rgba(255,255,255,.45)" font-family="Inter,sans-serif">cinematic</text>
    </g>
    <g transform="translate(98,52)">
      <rect width="84" height="56" rx="7" fill="rgba(167,139,250,.12)" stroke="#a78bfa" stroke-width="1.5"/>
      <text x="8" y="14" font-size="8" fill="rgba(167,139,250,.85)" font-family="Inter,sans-serif" font-weight="600">VARIANT 2</text>
      <text x="8" y="32" font-size="14" fill="#a78bfa" font-weight="700" font-family="Inter,sans-serif">★ 87</text>
      <text x="8" y="48" font-size="8" fill="rgba(255,255,255,.45)" font-family="Inter,sans-serif">epic</text>
    </g>
    <g transform="translate(188,52)">
      <rect width="84" height="56" rx="7" fill="rgba(245,158,11,.08)" stroke="rgba(245,158,11,.35)"/>
      <text x="8" y="14" font-size="8" fill="rgba(255,255,255,.55)" font-family="Inter,sans-serif" font-weight="600">VARIANT 3</text>
      <text x="8" y="32" font-size="14" fill="#f59e0b" font-weight="700" font-family="Inter,sans-serif">★ 78</text>
      <text x="8" y="48" font-size="8" fill="rgba(255,255,255,.45)" font-family="Inter,sans-serif">moody</text>
    </g>
  </svg>`,
};
const TOUR_STEPS=[
  {sel:'#smIdea, #imgIdea, #txtInput, #i2pDrop',title:'Опиши идею',body:'Напиши коротко, что хочешь снять или нарисовать. Смотри как AI печатает пример →',pos:'bottom',preview:TOUR_PREVIEW.idea,previewLabel:'Пример заполнения',
   enter:()=>{
     // Find the typewriter span inside the popover (NOT the real textarea — that had invisible-text rendering issues)
     const typedEl=document.querySelector('.tour-popover .tour-typed');
     if(!typedEl){console.warn('[tour] step1: .tour-typed span not found in popover');return null;}
     console.info('[tour] step1: typewriter starting in popover');
     typedEl.textContent='';
     const text='Реклама часов Rolex в стиле блокбастера, золотой час, kinetic camera, неон в фоне';
     let i=0,stopped=false,timer=null;
     const tick=()=>{
       if(stopped)return;
       i++;
       typedEl.textContent=text.slice(0,i);
       if(i<text.length){timer=setTimeout(tick,38);}
       else{console.info('[tour] step1: typewriter done');}
     };
     timer=setTimeout(tick,250);
     return ()=>{
       stopped=true;
       if(timer)clearTimeout(timer);
     };
   }},
  {sel:'#smTiles, #imgStyleTiles, #txtStyleTiles, #i2pModeTiles',title:'Выбери формат',body:'Один клик по плитке — задаёт настроение, кадр, длительность. Можно поменять в любой момент.',pos:'bottom',preview:TOUR_PREVIEW.format,previewLabel:'Как работает выбор'},
  {sel:'#aiSettingsBtn',title:'Подключи AI',body:'Открой настройки AI и вставь свой ключ (OpenAI / Groq / Anthropic). Без ключа работает только UI — генерация требует API.',pos:'bottom',preview:TOUR_PREVIEW.ai,previewLabel:'Так выглядит окно настроек'},
  {sel:'#tplOpenBtn, #smGenerate',title:'Запускай генерацию',body:'Жми «Создать промт» — получишь 3 варианта со score. Или открой 📚 Шаблоны для готовых идей.',pos:'top',preview:TOUR_PREVIEW.generate,previewLabel:'Что появится после клика'},
];

function tourStart(force=false){
  if(!force&&localStorage.getItem('seedance_tour_done')==='1')return;
  let i=0;
  let stepCleanup=null;
  const backdrop=document.createElement('div');backdrop.className='tour-backdrop';
  document.body.appendChild(backdrop);
  const spotlight=document.createElement('div');spotlight.className='tour-spotlight';
  document.body.appendChild(spotlight);
  const popover=document.createElement('div');popover.className='tour-popover';
  document.body.appendChild(popover);

  // Track which element is "elevated" above the tour backdrop so its content is visible (not blurred behind it)
  let elevatedEl=null,elevatedOrig=null;
  function elevate(el){
    unelevate();
    if(!el)return;
    elevatedOrig={position:el.style.position,zIndex:el.style.zIndex,boxShadow:el.style.boxShadow};
    const computed=getComputedStyle(el).position;
    if(computed==='static')el.style.position='relative';
    el.style.zIndex='10001'; // above backdrop(9998) and spotlight(9999) so content shows + spotlight glow still wraps it via box-shadow on spotlight element
    elevatedEl=el;
  }
  function unelevate(){
    if(elevatedEl&&elevatedOrig){
      elevatedEl.style.position=elevatedOrig.position||'';
      elevatedEl.style.zIndex=elevatedOrig.zIndex||'';
      elevatedEl.style.boxShadow=elevatedOrig.boxShadow||'';
    }
    elevatedEl=null;elevatedOrig=null;
  }

  function runCleanup(){if(typeof stepCleanup==='function'){try{stepCleanup();}catch(e){console.debug(e);}stepCleanup=null;}unelevate();}

  function show(idx){
    runCleanup();
    const step=TOUR_STEPS[idx];if(!step){end();return;}
    // find first existing element matching any selector
    const sels=step.sel.split(',').map(s=>s.trim());
    let el=null;for(const s of sels){const e=document.querySelector(s);if(e&&e.offsetParent!==null){el=e;break;}}
    if(!el){next();return;}
    elevate(el);
    el.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>{
      const r=el.getBoundingClientRect();
      const pad=8;
      spotlight.style.top=(r.top-pad)+'px';
      spotlight.style.left=(r.left-pad)+'px';
      spotlight.style.width=(r.width+pad*2)+'px';
      spotlight.style.height=(r.height+pad*2)+'px';
      // popover position
      const previewBlock=step.preview?`<div class="tour-preview">${step.previewLabel?`<div class="tour-preview-label">${step.previewLabel}</div>`:''}${step.preview}</div>`:'';
      popover.innerHTML=`
        <div class="tour-step">Шаг ${idx+1} из ${TOUR_STEPS.length}</div>
        <h4>${step.title}</h4>
        <p>${step.body}</p>
        ${previewBlock}
        <div class="tour-popover-actions">
          <button class="text-xs subtle hover:text-violet-400" id="tourSkip">Пропустить тур</button>
          <div class="flex gap-2">
            ${idx>0?'<button class="soft-btn px-3 py-1.5 text-xs" id="tourPrev">Назад</button>':''}
            <button class="btn-primary px-4 py-1.5 rounded-lg text-xs font-semibold" id="tourNext">${idx===TOUR_STEPS.length-1?'Готово ✨':'Далее →'}</button>
          </div>
        </div>`;
      // place popover below or above based on space — measure actual height now that content is set
      const pw=340;
      popover.style.width=pw+'px';
      popover.style.visibility='hidden';popover.style.top='0px';popover.style.left='0px';
      const ph=popover.offsetHeight||280;
      popover.style.visibility='';
      let top=r.bottom+16;let left=r.left+r.width/2-pw/2;
      if(top+ph>innerHeight-16)top=r.top-ph-16;
      if(top<16)top=Math.max(16,Math.min(r.bottom+16,innerHeight-ph-16));
      left=Math.max(16,Math.min(left,innerWidth-pw-16));
      popover.style.top=top+'px';popover.style.left=left+'px';
      popover.querySelector('#tourNext').onclick=next;
      const prev=popover.querySelector('#tourPrev');if(prev)prev.onclick=()=>{i--;show(i);};
      popover.querySelector('#tourSkip').onclick=end;
      // Run step's enter() callback (e.g. typewriter demo) and capture its cleanup
      if(typeof step.enter==='function'){try{stepCleanup=step.enter(el);}catch(e){console.debug(e);}}
    },350);
  }
  function next(){i++;if(i>=TOUR_STEPS.length){end();return;}show(i);}
  function end(){
    runCleanup();
    backdrop.remove();spotlight.remove();popover.remove();
    localStorage.setItem('seedance_tour_done','1');
    setTimeout(()=>toast('💡 Тур можно перезапустить через Ctrl+K → «Тур»','info'),300);
  }
  show(i);
}
window.tourStart=tourStart;

/* === TEMPLATES BUTTON injection === */
function injectTemplatesButton(){
  // Add a "📚 Шаблоны" button next to each Generate button in Simple Mode
  const targets=[
    {generateId:'smGenerate',containerSel:'#smVideoPanel .flex.flex-wrap.gap-2.items-center'},
    {generateId:'imgGenerate',containerSel:'#smImagePanel .flex.flex-wrap.gap-2.items-center'},
    {generateId:'txtGenerate',containerSel:'#smTextPanel .flex.flex-wrap.gap-2.items-center'},
    {generateId:'i2pGenerate',containerSel:'#smI2pPanel .flex.flex-wrap.gap-2.items-center'},
  ];
  targets.forEach(t=>{
    const btn=document.getElementById(t.generateId);if(!btn)return;
    if(btn.parentElement.querySelector('[data-tpl-btn]'))return;
    const tplBtn=document.createElement('button');
    tplBtn.id=t.generateId+'TplBtn';
    tplBtn.className='soft-btn px-4 py-3 rounded-xl text-sm inline-flex items-center gap-2';
    tplBtn.dataset.tplBtn='1';
    tplBtn.title='Открыть библиотеку шаблонов';
    tplBtn.innerHTML='<i data-lucide="library-big"></i><span>Шаблоны</span>';
    tplBtn.onclick=tplOpenModal;
    btn.insertAdjacentElement('afterend',tplBtn);
  });
  window.refreshIcons&&window.refreshIcons();
}

/* === SERVICE WORKER (PWA offline) === */
function registerSW(){
  if(!('serviceWorker' in navigator))return;
  // Only register on https or localhost (browsers block on file:// or http)
  if(location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1')return;
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}

/* ============================================================
   I18N — RU/EN UI translation (selector-based, no HTML pollution)
   ============================================================ */
/* EN dictionary: [selector, prop, english] — prop: 'text' | 'title' | 'ph' (placeholder) | 'html' */
const I18N_EN=[
  // Header
  ['[data-i18n="app.subtitle"]','text','Cinematic Prompt Studio · by Armen'],
  ['[data-i18n="footer.brand"]','text','Lumen — Cinematic Prompt Studio'],
  ['[data-i18n="footer.crafted"]','text','Crafted with ✨ by'],
  ['#pwaInstall span','text','Install'],
  ['#pwaInstall','title','Install as app'],
  ['#modeToggle','title','Toggle Simple ↔ Pro'],
  ['#themeBtn','title','Theme'],
  ['#aiSettingsBtn','title','AI settings'],
  ['#shareBtn','title','Share link'],
  ['#cmpBtn','title','Compare two prompts'],
  ['#undoBtn','title','Undo (Ctrl+Z)'],
  ['#redoBtn','title','Redo (Ctrl+Shift+Z)'],

  // Simple Mode tabs
  ['.sm-tab[data-smtab="video"]','text','🎬 Video'],
  ['.sm-tab[data-smtab="image"]','text','🖼 Image'],
  ['.sm-tab[data-smtab="text"]','text','📝 Text'],
  ['.sm-tab[data-smtab="i2p"]','text','🔍 Img→Prompt'],

  // Simple Video panel
  ['#smVideoPanel h2','text','Create AI video prompt'],
  ['#smVideoPanel > p.subtle','text','Describe your idea, pick a format → get a polished prompt in 30 seconds'],
  ['#smIdea','ph','Example: a watch ad in blockbuster style'],
  ['#smGenerate','text','✨ Create prompt'],
  ['#phOpenBtnVideo span','text','History'],
  ['#phOpenBtnVideo','title','Prompt history'],
  ['#smBrand','ph','Rolex Submariner'],
  ['#smMessage','ph','luxury and precision'],

  // Simple Image panel
  ['#smImagePanel h2','text','🖼 Create an image'],
  ['#smImagePanel > p.subtle','text','Text-to-image · DALL·E 3 · reference or final image'],
  ['#imgIdea','ph','Example: girl with silver hair in a neon coat, cyberpunk city, night'],
  ['#imgGenerate','text','✨ Create image'],

  // Simple Text panel
  ['#smTextPanel h2','text','📝 Text → Prompt'],
  ['#smTextPanel > p.subtle','text','Paste any text — AI will produce 3 professional prompts (action / emotion / visual)'],
  ['#txtInput','ph','Example: "An old lighthouse on a rocky shore. Fog wraps the tower, the beam cuts through darkness. Seagulls cry, surf roars..."'],
  ['#txtGenerate','text','✨ Create prompt'],
  ['#phOpenBtnText span','text','History'],
  ['#phOpenBtnText','title','Prompt history'],

  // Simple I2P panel
  ['#smI2pPanel h2','text','🔍 Image → Prompt'],
  ['#smI2pPanel > p.subtle','text','Upload a reference — AI extracts style, composition, light and creates 3 ready prompts to recreate in Sora/Runway/DALL·E'],
  ['#i2pDropEmpty > div.text-sm','text','Drag image here or click to upload'],
  ['#i2pDropEmpty > div.text-xs','text','JPG, PNG, WEBP · up to 10 MB · or paste from clipboard (Ctrl+V)'],
  ['#i2pClear span','text','Remove image'],
  ['#i2pMod','ph','e.g. but in a winter landscape / with a cat instead of a dog'],
  ['#i2pGenerate','text','✨ Create prompt from image'],
  ['#phOpenBtnI2p span','text','History'],
  ['#phOpenBtnI2p','title','Prompt history'],

  // Bottom hint
  ['#simpleMode .text-center.mt-4 #smGoPro','text','Open Pro mode →'],

  // Pro mode tabs
  ['.tab[data-tab="t2v"]','text','📝 Text-to-Video'],
  ['.tab[data-tab="i2v"]','text','🖼 Image-to-Video'],

  // Pro: AI auto-fill banner
  ['#aiAutoFill','text','⚡ Fill'],
  ['#oneLineIdea','ph','samurai girl cuts sakura under a full moon'],

  // Pro: i2v block
  ['#i2vBlock h2','text','🖼 Reference frames'],
  ['#motion','ph','hair flowing, eyes blinking, camera pushes in'],

  // Pro: Idea panel
  ['#randomBtn span','text','Random'],
  ['#randomBtn','title','Random idea'],
  ['#aiEnhanceBtn span','text','Improve'],
  ['#aiEnhanceBtn','title','AI rewrites the prompt'],
  ['#aiCritiqueBtn span','text','Critique'],
  ['#aiCritiqueBtn','title','AI critique'],
  ['#aiReverseBtn span','text','Reverse'],
  ['#aiReverseBtn','title','Parse external prompt'],
  ['#libSubjBtn','title','Subject library'],
  ['#libSceneBtn','title','Scene library'],
  ['#libLightBtn','title','Lighting recipes'],
  ['#subject','ph','girl with silver hair in a neon coat'],
  ['#character','ph','same character: silver hair, neon raincoat, green eyes'],
  ['#action','ph','slowly walks through wet streets'],
  ['#scene','ph','cyberpunk night city in the rain'],
  ['#details','ph','reflections in puddles, light fog'],

  // Pro: Sound
  ['#ambient','ph','city traffic, soft rain'],
  ['#sfx','ph','footsteps, neon hum'],
  ['#dialogue','ph','woman whispers: "..."'],

  // Pro: Generate area
  ['#generate','text','✨ Generate'],
  ['#abBtn span','text','4 variants'],
  ['#abBtn','title','4 versions with different parameters'],
  ['#reset span','text','Reset'],
  ['#reset','title','Reset form'],

  // Pro: Output panel
  ['#copyEn','title','Copy English'],
  ['#copyRu','title','Copy Russian'],
  ['#favBtn','title','Add to favorites'],
  ['#exportTxt','title','Export .txt'],
  ['#exportMd','title','Export .md'],
  ['#exportJson','title','Export .json'],
  ['#speakBtn','title','Read aloud'],
  ['#negSuggestBtn','title','AI suggests negative'],
  ['button[data-refine="shorter"]','text','shorter'],
  ['button[data-refine="epic"]','text','epic'],
  ['button[data-refine="more details"]','text','more details'],
  ['button[data-refine="cinematic"]','text','cinematic'],
  ['button[data-refine="darker mood"]','text','darker mood'],
  ['button[data-refine="lighter mood"]','text','lighter mood'],

  // Pro: Sidebar
  ['.sideTab[data-side="hist"]','text','History'],
  ['.sideTab[data-side="fav"] span[data-i18n="side.fav"]','text','Favorites'],
  ['#clearList','text','Clear'],
  ['#listSearch','ph','🔎 search...'],
  ['#savePresetBtn span','text','Save'],

  // Pro: Beats / Multi-shot toggles
  ['#addBeat','text','+ Frame'],
  ['#addShot','text','+ Shot'],

  // Floating chat
  ['#chatToggle','title','Chat: edit prompt with text'],
  ['#chatInput','ph','type a change...'],
];

/* Apply i18n: when locale=en → swap; when locale=ru → restore originals (saved on first apply) */
function applyI18n(loc){
  document.documentElement.lang=loc;
  I18N_EN.forEach(([sel,prop,en])=>{
    const els=document.querySelectorAll(sel);if(!els.length)return;
    els.forEach(el=>{
      const key='i18nOrig_'+prop;
      if(loc==='en'){
        if(!el.dataset[key]){
          if(prop==='text')el.dataset[key]=(el.querySelector('span')?el.querySelector('span').textContent:el.textContent)||'';
          else if(prop==='title')el.dataset[key]=el.title||'';
          else if(prop==='ph')el.dataset[key]=el.placeholder||'';
        }
        if(prop==='text'){
          // Prefer last text node / or replace all children with text only if no icon child
          if(el.querySelector('span')&&el.children.length>=1&&el.querySelector('i[data-lucide]')){
            el.querySelector('span').textContent=en;
          }else{
            el.textContent=en;
          }
        }
        else if(prop==='title')el.title=en;
        else if(prop==='ph')el.placeholder=en;
      }else{
        const orig=el.dataset[key];if(orig==null)return;
        if(prop==='text'){
          if(el.querySelector('span')&&el.querySelector('i[data-lucide]'))el.querySelector('span').textContent=orig;
          else el.textContent=orig;
        }
        else if(prop==='title')el.title=orig;
        else if(prop==='ph')el.placeholder=orig;
      }
    });
  });
  try{localStorage.setItem('seedance_locale',loc);}catch(e){}
}
window.applyI18n=applyI18n;

/* ============================================================
   PWA INSTALL — beforeinstallprompt handler
   ============================================================ */
let _pwaDeferred=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  _pwaDeferred=e;
  const btn=document.getElementById('pwaInstall');
  if(btn)btn.classList.remove('hidden');
});
window.addEventListener('appinstalled',()=>{
  const btn=document.getElementById('pwaInstall');
  if(btn)btn.classList.add('hidden');
  _pwaDeferred=null;
  try{toast&&toast('✓ Приложение установлено','success');}catch(e){}
});
function pwaInstallClick(){
  if(!_pwaDeferred){
    // iOS / browsers without API: show hint
    try{toast&&toast('iOS: «Поделиться» → «На экран Домой». Desktop Chrome: иконка установки в адресной строке.','info');}catch(e){}
    return;
  }
  _pwaDeferred.prompt();
  _pwaDeferred.userChoice.finally(()=>{_pwaDeferred=null;});
}

/* === INIT === */
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    injectTemplatesButton();
    registerSW();
    // Add Templates command to Cmd Palette
    try{if(window.CMDS)CMDS.push({n:'📚 Шаблоны промтов',h:tplOpenModal},{n:'🎓 Запустить тур заново',h:()=>tourStart(true)});}catch(e){}
    // PWA install button wiring
    const pwaBtn=document.getElementById('pwaInstall');
    if(pwaBtn)pwaBtn.onclick=pwaInstallClick;
    // i18n: restore last-used locale and wire change listener
    const loc=document.getElementById('locale');
    if(loc){
      const saved=localStorage.getItem('seedance_locale');
      if(saved){loc.value=saved;}
      // Apply on init only if EN (RU is default rendered HTML)
      if(loc.value==='en')applyI18n('en');
      // Listen for changes (in addition to existing listener which only affects speech)
      loc.addEventListener('change',()=>applyI18n(loc.value));
    }
    // Auto-start tour on first visit (delay so UI is ready)
    setTimeout(()=>tourStart(),800);
  },200);
});

