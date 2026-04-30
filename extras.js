/* ============================================================
   SEEDANCE 2.0 — EXTRAS v10.13
   Skeleton loaders · Templates Gallery · Onboarding Tour · PWA
   ============================================================ */

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
    grid.innerHTML=list.map((t,i)=>`<button class="sm-tile text-left" data-tpl-i="${TPL.indexOf(t)}" style="padding:14px">
      <div class="flex items-start gap-3 mb-2">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/30 to-pink-500/20 border border-violet-400/30 grid place-items-center flex-shrink-0"><i data-lucide="${t.icon}" style="color:#c4b5fd"></i></div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm leading-tight">${t.title}</div>
          <div class="text-[10px] subtle uppercase tracking-wider mt-0.5">${TPL_CATS[t.cat]?.label||t.cat} · ${t.mode==='video'?'🎬 Видео':t.mode==='text'?'📝 Текст':'🖼 Картинка'}</div>
        </div>
      </div>
      <div class="text-xs subtle leading-relaxed line-clamp-3" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${t.idea}</div>
    </button>`).join('');
    grid.querySelectorAll('[data-tpl-i]').forEach(btn=>btn.onclick=()=>{
      const t=TPL[+btn.dataset.tplI];tplApply(t);m.classList.add('sm-hidden');
    });
    window.refreshIcons&&window.refreshIcons();
  };
  renderCats();renderGrid();
  m.classList.remove('sm-hidden');
  window.refreshIcons&&window.refreshIcons();
}

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
const TOUR_STEPS=[
  {sel:'#smIdea, #imgIdea, #txtInput, #i2pDrop',title:'Опиши идею',body:'Напиши коротко, что хочешь снять или нарисовать. Чем конкретнее — тем точнее результат. Можно по-русски, AI поймёт.',pos:'bottom'},
  {sel:'#smTiles, #imgStyleTiles, #txtStyleTiles, #i2pModeTiles',title:'Выбери формат',body:'Один клик по плитке — задаёт настроение, кадр, длительность. Можно поменять в любой момент.',pos:'bottom'},
  {sel:'#aiSettingsBtn',title:'Подключи AI',body:'Открой настройки AI и вставь свой ключ (OpenAI / Groq / Anthropic). Без ключа работает только UI — генерация требует API.',pos:'bottom'},
  {sel:'#tplOpenBtn, #smGenerate',title:'Запускай генерацию',body:'Жми «Создать промт» — получишь 3 варианта со score. Или открой 📚 Шаблоны для готовых идей.',pos:'top'},
];

function tourStart(force=false){
  if(!force&&localStorage.getItem('seedance_tour_done')==='1')return;
  let i=0;
  const backdrop=document.createElement('div');backdrop.className='tour-backdrop';
  document.body.appendChild(backdrop);
  const spotlight=document.createElement('div');spotlight.className='tour-spotlight';
  document.body.appendChild(spotlight);
  const popover=document.createElement('div');popover.className='tour-popover';
  document.body.appendChild(popover);

  function show(idx){
    const step=TOUR_STEPS[idx];if(!step){end();return;}
    // find first existing element matching any selector
    const sels=step.sel.split(',').map(s=>s.trim());
    let el=null;for(const s of sels){const e=document.querySelector(s);if(e&&e.offsetParent!==null){el=e;break;}}
    if(!el){next();return;}
    el.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>{
      const r=el.getBoundingClientRect();
      const pad=8;
      spotlight.style.top=(r.top-pad)+'px';
      spotlight.style.left=(r.left-pad)+'px';
      spotlight.style.width=(r.width+pad*2)+'px';
      spotlight.style.height=(r.height+pad*2)+'px';
      // popover position
      popover.innerHTML=`
        <div class="tour-step">Шаг ${idx+1} из ${TOUR_STEPS.length}</div>
        <h4>${step.title}</h4>
        <p>${step.body}</p>
        <div class="tour-popover-actions">
          <button class="text-xs subtle hover:text-violet-400" id="tourSkip">Пропустить тур</button>
          <div class="flex gap-2">
            ${idx>0?'<button class="soft-btn px-3 py-1.5 text-xs" id="tourPrev">Назад</button>':''}
            <button class="btn-primary px-4 py-1.5 rounded-lg text-xs font-semibold" id="tourNext">${idx===TOUR_STEPS.length-1?'Готово ✨':'Далее →'}</button>
          </div>
        </div>`;
      // place popover below or above based on space
      const ph=180;const pw=340;
      let top=r.bottom+16;let left=r.left+r.width/2-pw/2;
      if(top+ph>innerHeight-16)top=r.top-ph-16;
      if(top<16)top=Math.min(r.bottom+16,innerHeight-ph-16);
      left=Math.max(16,Math.min(left,innerWidth-pw-16));
      popover.style.top=top+'px';popover.style.left=left+'px';popover.style.width=pw+'px';
      popover.querySelector('#tourNext').onclick=next;
      const prev=popover.querySelector('#tourPrev');if(prev)prev.onclick=()=>{i--;show(i);};
      popover.querySelector('#tourSkip').onclick=end;
    },350);
  }
  function next(){i++;if(i>=TOUR_STEPS.length){end();return;}show(i);}
  function end(){
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

/* === INIT === */
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    injectTemplatesButton();
    registerSW();
    // Add Templates command to Cmd Palette
    try{if(window.CMDS)CMDS.push({n:'📚 Шаблоны промтов',h:tplOpenModal},{n:'🎓 Запустить тур заново',h:()=>tourStart(true)});}catch(e){}
    // Auto-start tour on first visit (delay so UI is ready)
    setTimeout(()=>tourStart(),800);
  },200);
});

