/* ============================================================
   LUMEN — AI STUDIO v15.11
   Unified hub that groups all AI tools into a searchable categorized modal.
   Decluttering: hides Tier 1 & Tier 2 inline buttons, exposes them via one
   primary entry button "✨ AI Studio" next to the generate button.

   Also adds:
   - Global Escape handler closing any open modal
   - Global Ctrl+/ shortcut opening AI Studio
   - Accent NEW-badge on recent features
   - Recently used tracking (localStorage) — prepended section
   - Keyboard navigation: arrow keys + Enter between cards
   - Search match highlighting with <mark>
   ============================================================ */
(function(){
  if(typeof $==='undefined'){console.warn('[ai_studio] $ missing');return;}

  /* ============================================================
     1. ESCAPE CLOSES ANY MODAL (global handler)
     ============================================================ */
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    const modals=document.querySelectorAll('[id$="Modal"]:not(.hidden), .modal:not(.hidden)');
    let closedAny=false;
    modals.forEach(m=>{if(!m.classList.contains('hidden')){m.classList.add('hidden');closedAny=true;}});
    if(closedAny)e.preventDefault();
  });

  /* ============================================================
     2. TOOL CATALOG — single source of truth
     Each tool entry delegates to an existing button's click to
     reuse all existing handlers & side-effects.
     ============================================================ */
  const TOOLS=[
    /* ─── 🧠 Обработка текста ─── */
    {cat:'text',icon:'✨',name:'Улучшить',desc:'AI перепишет промт в кинематографичный стиль, сохранит структуру',cost:'~$0.001',target:'aiEnhanceBtn'},
    {cat:'text',icon:'🩺',name:'Критика',desc:'AI укажет 4-7 проблем и как их исправить',cost:'~$0.001',target:'aiCritiqueBtn'},
    {cat:'text',icon:'📊',name:'Score',desc:'Оценка по 5 осям: ясность, специфичность, кинематография, mood, executability',cost:'~$0.001',target:'scoreBtn'},
    {cat:'text',icon:'🔮',name:'Риски',desc:'Прогноз типичных артефактов (руки, лица, motion, текст)',cost:'~$0.001',target:null,handler:()=>{
      /* failBtn has no ID — find it by text */
      const b=[...document.querySelectorAll('button')].find(x=>x.innerHTML.includes('🔮 Риски'));
      if(b)b.click();else toast('Риски btn не найден');
    }},
    {cat:'text',icon:'🔄',name:'Auto-iterate',desc:'AI критикует и сам применяет правки 3 раунда',cost:'~$0.003',target:'iterBtn'},
    {cat:'text',icon:'🔍',name:'Распознать (Reverse)',desc:'Вставь чужой промт → распарсить в поля формы',cost:'~$0.001',target:'aiReverseBtn'},
    {cat:'text',icon:'🌍',name:'RU→EN / EN→RU',desc:'Перевод через AI',cost:'~$0.001',target:null,handler:()=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.title?.includes('перевод')||x.innerHTML.includes('RU→EN'));
      if(b)b.click();else toast('Translate btn не найден');
    }},

    /* ─── 🎯 Навигация / Выбор модели ─── */
    {cat:'nav',icon:'🎯',name:'Куда отправить? (Router)',desc:'AI сравнит 5 моделей и выберет лучшую под твой промт',cost:'~$0.001',badge:'NEW',target:null,handler:()=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.innerHTML.includes('🎯 Куда?'));
      if(b)b.click();
    }},
    {cat:'nav',icon:'🎬',name:'Director Persona',desc:'Перепиши в стиле 12 режиссёров (Вильнёв, Тарковский, Нолан...)',cost:'~$0.001',badge:'NEW',target:null,handler:()=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.innerHTML.includes('🎬 Director'));
      if(b)b.click();
    }},
    {cat:'nav',icon:'📊',name:'Compare + Cross-pollinate',desc:'Сравни два промта или скрести сюжет A со стилем B',cost:'~$0.002',badge:'NEW',target:'cmpBtn'},

    /* ─── 🎭 Production (создание контента) ─── */
    {cat:'prod',icon:'🎵',name:'Audio (Music/SFX/Voice)',desc:'Параллельные промты для Suno + ElevenLabs + актёра озвучки',cost:'~$0.001',badge:'NEW',target:null,handler:()=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.innerHTML.includes('🎵 Audio'));
      if(b)b.click();
    }},
    {cat:'prod',icon:'🎭',name:'Dialogue Writer',desc:'AI напишет 1-3 реплики персонажу в формате для Sora/Veo/Kling',cost:'~$0.001',badge:'NEW',target:null,handler:()=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.innerHTML.includes('🎭 Dialogue'));
      if(b)b.click();
    }},
    {cat:'prod',icon:'💡',name:'AI Cinematographer',desc:'Профессиональная lighting-схема: key/fill/back, Kelvin, film reference',cost:'~$0.001',badge:'NEW',target:null,handler:()=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.innerHTML.includes('💡 Lighting'));
      if(b)b.click();
    }},
    {cat:'prod',icon:'🎭',name:'Токен героя',desc:'Уникальный consistency-token для multi-shot',cost:'~$0.001',target:null,handler:()=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.innerHTML.includes('🎭 Авто-токен'));
      if(b)b.click();
    }},
    {cat:'prod',icon:'✨',name:'AI beats',desc:'Автоматическая разбивка таймлайна на beats',cost:'~$0.001',target:null,handler:()=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.innerHTML.includes('AI разбить на beats'));
      if(b)b.click();
    }},

    /* ─── 🎨 Визуальное ─── */
    {cat:'visual',icon:'🎞',name:'Reference Video',desc:'MP4 → 6 кадров → AI сам заполнит форму и multi-shot',cost:'~$0.05-0.10',badge:'NEW',target:null,handler:()=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.innerHTML.includes('🎞 Reference video'));
      if(b)b.click();
    }},
    {cat:'visual',icon:'🎬',name:'Photo → Storyboard',desc:'Загрузи 1 фото → AI синтезирует 6 ракурсов и заполнит multi-shot раскадровку',cost:'~$0.02',badge:'NEW',target:null,handler:()=>{
      if(typeof window.openPhotoStoryboard==='function')window.openPhotoStoryboard();
      else toast('photo_storyboard модуль не загружен');
    }},
    {cat:'visual',icon:'📸',name:'Mood-board (4 варианта)',desc:'4 стилистических варианта первого кадра через DALL·E',cost:'~$0.16',badge:'NEW',target:null,handler:()=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.innerHTML.includes('📸 Mood-board'));
      if(b)b.click();
    }},
    {cat:'visual',icon:'🎨',name:'Preview кадр',desc:'Одна картинка первого кадра через DALL·E',cost:'~$0.04',target:'previewBtn'},
    {cat:'visual',icon:'🎲',name:'4 варианта промта',desc:'Сгенерить 4 разных angle одной идеи',cost:'$0',target:'abBtn'}
  ];

  const CATS={
    text:  {icon:'🧠',label:'Обработка текста',hint:'Работают с текущим промтом — улучшают, критикуют, оценивают'},
    nav:   {icon:'🎯',label:'Навигация',hint:'Выбор модели, режиссёра, сравнение вариантов'},
    prod:  {icon:'🎭',label:'Production',hint:'Параллельные ассеты для съёмочного пайплайна'},
    visual:{icon:'🎨',label:'Визуализация',hint:'Генерация картинок и видео-референсов'}
  };

  /* ============================================================
     3. AI STUDIO MODAL
     ============================================================ */
  const studioModal=document.createElement('div');
  studioModal.id='aiStudioModal';
  studioModal.className='hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4';
  studioModal.innerHTML=`<div class="glass rounded-2xl p-5 max-w-5xl w-full max-h-[92vh] overflow-auto">
    <div class="flex items-center justify-between mb-3 gap-3">
      <div class="flex items-center gap-2 flex-1">
        <div class="text-lg font-semibold">✨ AI Studio</div>
        <span class="text-xs subtle">v15.10 · ${TOOLS.length} инструментов</span>
      </div>
      <input id="aiStudioSearch" type="search" placeholder="🔎 поиск... (Ctrl+/)" class="field text-xs !w-64" autofocus />
      <button id="aiStudioClose" class="soft-btn text-xs px-2 py-1" title="Escape">✕</button>
    </div>
    <div class="text-xs subtle mb-3">Все AI-инструменты в одном месте. Клик по карточке → запуск. <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">Esc</kbd> закрывает модалку, <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">Ctrl+/</kbd> открывает.</div>
    <div id="aiStudioBody"></div>
  </div>`;
  document.body.appendChild(studioModal);
  $('aiStudioClose').onclick=()=>studioModal.classList.add('hidden');
  studioModal.onclick=e=>{if(e.target===studioModal)studioModal.classList.add('hidden');};

  /* Recently used tracking */
  const RECENT_KEY='lumen_recent_tools';
  const loadRecent=()=>{try{return JSON.parse(localStorage.getItem(RECENT_KEY)||'[]');}catch(e){return[];}};
  const saveRecent=arr=>{try{localStorage.setItem(RECENT_KEY,JSON.stringify(arr.slice(0,5)));}catch(e){}};
  const markUsed=idx=>{const r=loadRecent().filter(i=>i!==idx);r.unshift(idx);saveRecent(r);};

  /* Highlight helper — escapes first, then wraps matches in <mark> */
  const escHtml=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const highlight=(text,q)=>{
    const safe=escHtml(text);
    if(!q)return safe;
    const re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
    return safe.replace(re,'<mark class="bg-violet-400/40 text-white rounded px-0.5">$1</mark>');
  };

  const cardHtml=(t,idx,q)=>{
    const badge=t.badge?`<span class="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/30 text-violet-200 font-bold uppercase tracking-wider">${t.badge}</span>`:'';
    return `<button data-tool-idx="${idx}" tabindex="0" class="studio-card text-left rounded-lg p-3 bg-black/20 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/40 focus:border-violet-400 focus:bg-violet-500/10 focus:outline-none transition-colors">
      <div class="flex items-start justify-between gap-2 mb-1">
        <div class="flex items-center gap-2">
          <span class="text-lg">${t.icon}</span>
          <span class="font-semibold text-sm">${highlight(t.name,q)}</span>
          ${badge}
        </div>
        <span class="text-[10px] subtle shrink-0">${escHtml(t.cost)}</span>
      </div>
      <div class="text-[11px] subtle leading-snug">${highlight(t.desc,q)}</div>
    </button>`;
  };

  function renderStudio(filter=''){
    const body=$('aiStudioBody');
    const q=filter.trim().toLowerCase();
    const filtered=TOOLS.filter(t=>!q||t.name.toLowerCase().includes(q)||t.desc.toLowerCase().includes(q));
    if(!filtered.length){body.innerHTML='<div class="text-center py-8 subtle text-sm">🔍 Ничего не найдено по запросу "'+escHtml(filter)+'"</div>';return;}
    let html='';

    /* Recently used section (only when no search) */
    if(!q){
      const recent=loadRecent().map(i=>TOOLS[i]).filter(Boolean);
      if(recent.length){
        html+=`<div class="mb-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-base">🕒</span>
            <span class="font-semibold text-sm">Недавние</span>
            <span class="text-[10px] subtle">· последние ${recent.length} использованных инструмента</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">`;
        recent.forEach(t=>{html+=cardHtml(t,TOOLS.indexOf(t),q);});
        html+=`</div></div>`;
      }
    }

    /* Normal categories */
    Object.keys(CATS).forEach(catKey=>{
      const items=filtered.filter(t=>t.cat===catKey);
      if(!items.length)return;
      const c=CATS[catKey];
      html+=`<div class="mb-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">${c.icon}</span>
          <span class="font-semibold text-sm">${c.label}</span>
          <span class="text-[10px] subtle">· ${c.hint}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">`;
      items.forEach(t=>{html+=cardHtml(t,TOOLS.indexOf(t),q);});
      html+=`</div></div>`;
    });
    body.innerHTML=html;
    body.querySelectorAll('[data-tool-idx]').forEach(el=>{
      el.onclick=()=>{
        const idx=+el.dataset.toolIdx;
        const t=TOOLS[idx];
        markUsed(idx);
        studioModal.classList.add('hidden');
        setTimeout(()=>{
          try{
            if(t.handler)t.handler();
            else if(t.target){const b=$(t.target);if(b)b.click();else toast('Кнопка '+t.target+' не найдена');}
          }catch(e){console.error('[ai_studio]',e);toast('Ошибка: '+e.message);}
        },120);
      };
    });
  }

  /* Keyboard navigation inside studio modal: arrows + Enter */
  studioModal.addEventListener('keydown',e=>{
    if(studioModal.classList.contains('hidden'))return;
    const cards=[...studioModal.querySelectorAll('.studio-card')];
    if(!cards.length)return;
    const active=document.activeElement;
    const curIdx=cards.indexOf(active);
    const searchFocused=document.activeElement===$('aiStudioSearch');

    if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='ArrowLeft'||e.key==='ArrowRight'){
      e.preventDefault();
      /* Estimate cols based on viewport — grid uses lg:3 sm:2 base:1 */
      const cols=window.innerWidth>=1024?3:window.innerWidth>=640?2:1;
      let next=curIdx;
      if(curIdx<0){next=0;}
      else if(e.key==='ArrowRight')next=Math.min(cards.length-1,curIdx+1);
      else if(e.key==='ArrowLeft')next=Math.max(0,curIdx-1);
      else if(e.key==='ArrowDown')next=Math.min(cards.length-1,curIdx+cols);
      else if(e.key==='ArrowUp'){
        if(curIdx<cols){$('aiStudioSearch').focus();return;}
        next=Math.max(0,curIdx-cols);
      }
      cards[next]?.focus();
    }else if(e.key==='Enter'&&!searchFocused&&curIdx>=0){
      e.preventDefault();
      cards[curIdx].click();
    }else if(e.key==='Enter'&&searchFocused&&cards.length>0){
      e.preventDefault();
      cards[0].click();
    }
  });

  $('aiStudioSearch').addEventListener('input',e=>renderStudio(e.target.value));

  /* ============================================================
     4. PRIMARY ENTRY BUTTON — «✨ AI Studio»
     Placed in the header next to AI settings for max discoverability.
     ============================================================ */
  const studioBtn=document.createElement('button');
  studioBtn.id='aiStudioBtn';
  studioBtn.className='soft-btn px-3 py-1.5 inline-flex items-center gap-1.5 text-xs';
  studioBtn.style.background='linear-gradient(135deg, rgba(167,139,250,0.25), rgba(236,72,153,0.15))';
  studioBtn.style.borderColor='rgba(167,139,250,0.4)';
  studioBtn.innerHTML='✨ AI Studio';
  studioBtn.title='Все AI-инструменты в одном окне (Ctrl+/)';
  const aiSettingsBtn=$('aiSettingsBtn');
  if(aiSettingsBtn&&aiSettingsBtn.parentElement){
    aiSettingsBtn.parentElement.insertBefore(studioBtn,aiSettingsBtn);
  }else{
    document.body.appendChild(studioBtn);
  }
  studioBtn.onclick=()=>{
    studioModal.classList.remove('hidden');
    renderStudio('');
    setTimeout(()=>$('aiStudioSearch').focus(),50);
  };

  /* ============================================================
     5. GLOBAL SHORTCUT — Ctrl+/
     ============================================================ */
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='/'){
      e.preventDefault();
      studioBtn.click();
    }
  });

  /* ============================================================
     6. HIDE CLUTTERING TIER 1 & TIER 2 INLINE BUTTONS
     Their click handlers still work — we just hide them from toolbar.
     Delay so Tier 1/2 modules have created them first.
     ============================================================ */
  setTimeout(()=>{
    const HIDE_LABELS=[
      '🎯 Куда?','🎬 Director','🎵 Audio','🎭 Dialogue','🎞 Reference video',
      '📸 Mood-board','💡 Lighting','🎭 Авто-токен героя','AI разбить на beats',
      '🔄 Auto-iterate','🔮 Риски','📊 Score'
    ];
    let hidden=0;
    document.querySelectorAll('button').forEach(b=>{
      const txt=b.textContent.trim();
      if(HIDE_LABELS.some(l=>txt.includes(l.replace(/^[^ ]+ /,''))||b.innerHTML.includes(l))){
        b.style.display='none';hidden++;
      }
    });
    console.log('%c[ai_studio] hidden '+hidden+' cluttering inline buttons','color:#a78bfa');
  },600);

  /* ============================================================
     7. COST-BADGE THEME FIX — ensure visibility in dark theme
     ============================================================ */
  setTimeout(()=>{
    const cb=$('costBadge');
    if(cb){
      cb.style.color='var(--text,#ddd)';
      cb.style.padding='6px 10px';
      cb.style.borderRadius='8px';
      cb.style.background='rgba(167,139,250,0.08)';
      cb.style.border='1px solid rgba(167,139,250,0.15)';
      cb.style.marginTop='8px';
      cb.style.fontSize='11px';
    }
  },700);

  /* ============================================================
     8. REGISTER IN COMMAND PALETTE
     ============================================================ */
  try{
    if(typeof CMDS!=='undefined'){
      CMDS.unshift({n:'✨ AI Studio (все инструменты)',h:()=>studioBtn.click()});
    }
  }catch(e){}

  console.log('%c[Lumen v15.10] AI Studio hub loaded — '+TOOLS.length+' tools across '+Object.keys(CATS).length+' categories','color:#a78bfa');
})();
