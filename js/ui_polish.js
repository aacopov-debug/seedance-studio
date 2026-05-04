/* ============================================================
   LUMEN — UI POLISH v15.11
   1. ? — keyboard shortcut help modal
   2. First-visit pulse hint on AI Studio button (3s animation)
   3. Floating "?" mini button in bottom-right corner
   ============================================================ */
(function(){
  if(typeof $==='undefined'){console.warn('[ui_polish] $ missing');return;}

  /* ============================================================
     1. KEYBOARD SHORTCUT HELP MODAL
     ============================================================ */
  const SHORTCUTS=[
    {cat:'🌟 Основные',items:[
      ['Ctrl+Enter','Сгенерировать промт'],
      ['Ctrl+K','Command palette (всё приложение)'],
      ['Ctrl+/','✨ AI Studio — все AI-инструменты'],
      ['?','Эта справка по шорткатам'],
      ['Esc','Закрыть любую модалку']
    ]},
    {cat:'↩ Навигация',items:[
      ['Ctrl+Z','Undo'],
      ['Ctrl+Shift+Z','Redo'],
      ['↑ ↓ ← →','Перемещение в AI Studio по карточкам'],
      ['Enter','Активировать фокусированную карточку (в AI Studio)']
    ]},
    {cat:'📋 Копирование',items:[
      ['📋 EN','Скопировать английский промт (для AI-моделей)'],
      ['📋 RU','Скопировать русский перевод (для клиента)'],
      ['JSON/MD/CSV','Экспорт в разных форматах']
    ]},
    {cat:'⚡ Слэш-команды (в текстовом поле)',items:[
      ['/random','Случайная идея'],
      ['/horror','Пресет ужастика'],
      ['/score','AI оценит промт'],
      ['/iterate','Auto-iterate 3 раунда'],
      ['/preview','Сгенерировать первый кадр']
    ]}
  ];

  const helpModal=document.createElement('div');
  helpModal.id='helpModal';
  helpModal.className='hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4';
  let html=`<div class="glass rounded-2xl p-5 max-w-2xl w-full max-h-[90vh] overflow-auto">
    <div class="flex items-center justify-between mb-3">
      <div class="text-lg font-semibold">⌨ Горячие клавиши</div>
      <button id="helpClose" class="soft-btn text-xs px-2 py-1">✕</button>
    </div>
    <div class="text-xs subtle mb-4">Жми <kbd class="px-1.5 py-0.5 rounded bg-white/10">?</kbd> в любой момент чтобы открыть эту справку.</div>`;
  SHORTCUTS.forEach(group=>{
    html+=`<div class="mb-4">
      <div class="font-semibold text-sm mb-2">${group.cat}</div>
      <table class="w-full text-xs">`;
    group.items.forEach(([k,d])=>{
      html+=`<tr class="border-b border-white/5">
        <td class="py-1.5 pr-3 w-48"><kbd class="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px]">${k}</kbd></td>
        <td class="py-1.5 subtle">${d}</td>
      </tr>`;
    });
    html+='</table></div>';
  });
  html+=`<div class="text-[11px] subtle mt-4 pt-3 border-t border-white/10">💡 Хотите подробное руководство? Открой <code>MANUAL.html</code> в браузере.</div></div>`;
  helpModal.innerHTML=html;
  document.body.appendChild(helpModal);
  $('helpClose').onclick=()=>helpModal.classList.add('hidden');
  helpModal.onclick=e=>{if(e.target===helpModal)helpModal.classList.add('hidden');};

  /* Global ? key — only when no input is focused */
  document.addEventListener('keydown',e=>{
    if(e.key!=='?'&&!(e.shiftKey&&e.key==='/'))return;
    const tag=document.activeElement?.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||document.activeElement?.isContentEditable)return;
    e.preventDefault();
    helpModal.classList.remove('hidden');
  });

  /* ============================================================
     2. FLOATING HELP BUTTON (?)
     ============================================================ */
  const helpBtn=document.createElement('button');
  helpBtn.id='helpFloatBtn';
  helpBtn.innerHTML='?';
  helpBtn.title='Горячие клавиши (клавиша ?)';
  helpBtn.style.cssText=`position:fixed;bottom:20px;right:20px;width:36px;height:36px;border-radius:50%;
    background:linear-gradient(135deg,rgba(167,139,250,0.9),rgba(236,72,153,0.8));
    color:#fff;font-size:16px;font-weight:bold;border:none;cursor:pointer;
    box-shadow:0 4px 20px rgba(167,139,250,0.4);z-index:40;
    transition:transform 0.2s,box-shadow 0.2s`;
  helpBtn.onmouseenter=()=>{helpBtn.style.transform='scale(1.1)';helpBtn.style.boxShadow='0 6px 28px rgba(167,139,250,0.6)';};
  helpBtn.onmouseleave=()=>{helpBtn.style.transform='';helpBtn.style.boxShadow='0 4px 20px rgba(167,139,250,0.4)';};
  helpBtn.onclick=()=>helpModal.classList.remove('hidden');
  document.body.appendChild(helpBtn);

  /* ============================================================
     3. FIRST-VISIT PULSE HINT ON AI STUDIO BUTTON
     ============================================================ */
  const FIRST_VISIT_KEY='lumen_studio_hint_shown_v15_11';
  setTimeout(()=>{
    if(localStorage.getItem(FIRST_VISIT_KEY))return;
    const btn=$('aiStudioBtn');
    if(!btn)return;

    /* Inject CSS keyframes */
    const style=document.createElement('style');
    style.textContent=`@keyframes lumenPulse{
      0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0.7);transform:scale(1)}
      50%{box-shadow:0 0 0 12px rgba(167,139,250,0);transform:scale(1.05)}
    }
    .lumen-pulse{animation:lumenPulse 1.4s ease-in-out infinite}`;
    document.head.appendChild(style);
    btn.classList.add('lumen-pulse');

    /* Tooltip balloon */
    const bubble=document.createElement('div');
    bubble.style.cssText=`position:absolute;top:100%;right:0;margin-top:12px;padding:12px 14px;
      background:linear-gradient(135deg,rgba(88,28,135,0.98),rgba(112,26,117,0.98));
      color:#fff;border-radius:10px;font-size:12px;max-width:280px;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);z-index:45;
      border:1px solid rgba(167,139,250,0.5)`;
    bubble.innerHTML=`<div style="font-weight:600;margin-bottom:4px">✨ Новое: AI Studio</div>
      <div style="opacity:0.85;line-height:1.5">19 AI-инструментов в одном месте. Жми кнопку или <kbd style="background:rgba(255,255,255,0.15);padding:1px 6px;border-radius:4px">Ctrl+/</kbd></div>
      <div style="position:absolute;top:-6px;right:20px;width:12px;height:12px;background:rgb(88,28,135);transform:rotate(45deg);border-left:1px solid rgba(167,139,250,0.5);border-top:1px solid rgba(167,139,250,0.5)"></div>`;
    btn.style.position='relative';
    btn.appendChild(bubble);

    const dismiss=()=>{
      btn.classList.remove('lumen-pulse');
      bubble.remove();
      localStorage.setItem(FIRST_VISIT_KEY,'1');
    };
    btn.addEventListener('click',dismiss,{once:true});
    setTimeout(dismiss,12000);
  },1500);

  /* ============================================================
     4. COMMAND PALETTE ENTRY
     ============================================================ */
  try{
    if(typeof CMDS!=='undefined'){
      CMDS.push({n:'⌨ Горячие клавиши (справка)',h:()=>helpModal.classList.remove('hidden')});
    }
  }catch(e){}

  console.log('%c[Lumen v15.11] UI polish loaded — ? key · floating help · first-visit hint','color:#a78bfa');
})();
