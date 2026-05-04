/* ============================================================
   LUMEN — PROMPT HISTORY MODULE (extracted from app.js v15.4)
   ============================================================
   Unified history for Simple Mode (video/image/text) and I2P.
   Entries: {ts, mode, idea, variants[], thumb?}. Cap 50, FIFO.
   phModal with search, clear-all, per-entry open/copy/delete.
   Re-hydrates into correct tab on click (smSetTab + renderers).

   Dependencies (globals from app.js core):
   - $, toast, safeLS, logError, _debounce
   - smSetTab, smRenderResults         Simple Mode tab + renderer
   - i2pRenderResults                   (from js/i2p.js) when re-opening i2p entry
   - txtRenderResults-like inline recreate for text entries
   Loaded AFTER app.js (for helpers) and AFTER js/i2p.js (for i2p re-open).
   ============================================================ */
/* ===== Prompt History ===== */
const PH_KEY='seedance_prompt_history';
const PH_CAP=50;

function phLoad(){
  try{const raw=localStorage.getItem(PH_KEY);if(!raw)return [];const a=JSON.parse(raw);return Array.isArray(a)?a:[];}catch(e){logError('phLoad',e);return [];}
}
function phSave(arr){
  try{safeLS(PH_KEY,JSON.stringify(arr.slice(0,PH_CAP)));}catch(e){logError('phSave',e);}
}
function phPush(entry){
  if(!entry||!entry.variants||!entry.variants.length)return;
  const arr=phLoad();
  arr.unshift({id:Date.now()+'_'+Math.random().toString(36).slice(2,7),ts:new Date().toISOString(),...entry});
  phSave(arr);
}
function phDelete(id){
  const arr=phLoad().filter(e=>e.id!==id);
  phSave(arr);phRender();
}
function phClearAll(){
  if(!confirm('Удалить всю историю промтов? Это необратимо.'))return;
  phSave([]);phRender();toast('🗑 История очищена');
}
function phFmtTs(iso){
  try{const d=new Date(iso);const p=n=>String(n).padStart(2,'0');return `${p(d.getDate())}.${p(d.getMonth()+1)} ${p(d.getHours())}:${p(d.getMinutes())}`;}catch(_){return '';}
}
function phMatchEntry(e,q){
  if(!q)return true;q=q.toLowerCase();
  if((e.idea||'').toLowerCase().includes(q))return true;
  if(e.meta){
    if((e.meta.target||'').toLowerCase().includes(q))return true;
    if((e.meta.style||'').toLowerCase().includes(q))return true;
    if(e.meta.core){const c=e.meta.core;if([(c.subject||''),(c.action||''),(c.object||'')].join(' ').toLowerCase().includes(q))return true;}
  }
  return (e.variants||[]).some(v=>(v.prompt_en||'').toLowerCase().includes(q)||(v.prompt_ru||'').toLowerCase().includes(q)||(v.title||'').toLowerCase().includes(q));
}
function phRender(){
  const list=document.getElementById('phList');if(!list)return;
  const q=(document.getElementById('phSearch')?.value||'').trim();
  const arr=phLoad().filter(e=>phMatchEntry(e,q));
  if(!arr.length){
    list.innerHTML=q
      ?`<div class="text-sm subtle text-center py-12">🔎 Ничего не найдено по запросу «${q.replace(/</g,'&lt;')}»</div>`
      :`<div class="text-sm subtle text-center py-12">Пусто. Сгенерируй первый промт — он появится здесь.</div>`;
    return;
  }
  list.innerHTML=arr.map(e=>{
    const modeIcon=e.mode==='text'?'📝':e.mode==='video'?'🎬':e.mode==='i2p'?'🔍':'•';
    const modeLabel=e.mode==='text'?'Текст':e.mode==='video'?'Видео':e.mode==='i2p'?'Img→Prompt':e.mode;
    const top=(e.variants[0]?.prompt_en||e.variants[0]?.prompt||'').slice(0,160);
    const coreStr=e.meta?.core?`${e.meta.core.subject||''} · ${e.meta.core.action||''}${e.meta.core.object?' · '+e.meta.core.object:''}`:'';
    const meta=[e.meta?.style,e.meta?.aspect].filter(Boolean).join(' · ');
    return `<div class="sm-result" data-ph-id="${e.id}">
      <div class="flex items-start justify-between gap-2 mb-2 flex-wrap">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs subtle">${phFmtTs(e.ts)}</span>
          <span class="text-xs px-2 py-0.5 rounded bg-violet-500/15 text-violet-300">${modeIcon} ${modeLabel}</span>
          <span class="text-xs subtle">${e.variants.length} вар.</span>
          ${meta?`<span class="text-xs subtle">${meta.replace(/</g,'&lt;')}</span>`:''}
        </div>
        <div class="flex gap-1">
          <button class="soft-btn text-xs px-2.5 py-1" data-ph-act="open">👁 Открыть</button>
          <button class="soft-btn text-xs px-2.5 py-1" data-ph-act="copy">📋 EN</button>
          <button class="soft-btn text-xs px-2.5 py-1 text-red-300" data-ph-act="del" title="Удалить">🗑</button>
        </div>
      </div>
      <div class="text-sm font-medium mb-1">💡 ${(e.idea||'(без идеи)').replace(/</g,'&lt;')}</div>
      ${coreStr?`<div class="text-xs text-violet-300 mb-1">🔒 ${coreStr.replace(/</g,'&lt;')}</div>`:''}
      <div class="text-xs subtle italic">${top.replace(/</g,'&lt;')}${top.length>=160?'...':''}</div>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-ph-id]').forEach(card=>{
    const id=card.dataset.phId;const entry=phLoad().find(x=>x.id===id);
    card.querySelector('[data-ph-act="del"]').onclick=(ev)=>{ev.stopPropagation();phDelete(id);};
    card.querySelector('[data-ph-act="copy"]').onclick=(ev)=>{ev.stopPropagation();const en=entry?.variants?.[0]?.prompt_en||entry?.variants?.[0]?.prompt||'';navigator.clipboard.writeText(en);toast('📋 EN скопирован');};
    card.querySelector('[data-ph-act="open"]').onclick=()=>phOpenEntry(entry);
    card.style.cursor='pointer';
    card.onclick=(ev)=>{if(!ev.target.closest('[data-ph-act]'))phOpenEntry(entry);};
  });
}
function phOpenEntry(entry){
  if(!entry)return;
  phToggle(false);
  if(entry.mode==='text'){
    smSetTab('text');
    const out=document.getElementById('txtResults');
    if(out){
      // Re-render text variants (lightweight: just show as cards with EN/RU + copy)
      out.innerHTML=`<div class="text-xs subtle mb-3">🕘 Из истории · ${phFmtTs(entry.ts)} · ${entry.variants.length} вар.</div>`+
        entry.variants.map((v,i)=>`<div class="sm-result" data-hi="${i}">
          <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div class="flex items-center gap-2"><span class="font-semibold text-sm">📌 ${(v.title||'Вариант '+(i+1)).replace(/</g,'&lt;')}</span>${typeof v.score==='number'?`<span class="sm-score ${smScoreClass(v.score)}">⭐ ${v.score}/100</span>`:''}</div>
          </div>
          <div class="mb-2"><div class="text-[10px] uppercase tracking-wider subtle mb-1">🇬🇧 EN</div><div class="text-sm whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-black/20 border border-white/5">${(v.prompt_en||'').replace(/</g,'&lt;')}</div></div>
          ${v.prompt_ru?`<details class="mb-2"><summary class="text-[10px] uppercase tracking-wider subtle cursor-pointer">🇷🇺 RU</summary><div class="text-sm whitespace-pre-wrap p-3 rounded-lg bg-black/10 border border-white/5 mt-2 italic">${v.prompt_ru.replace(/</g,'&lt;')}</div></details>`:''}
          <div class="flex gap-2"><button class="soft-btn text-xs px-3 py-1.5" data-hist-act="copyEn">📋 EN</button>${v.prompt_ru?`<button class="soft-btn text-xs px-3 py-1.5" data-hist-act="copyRu">📋 RU</button>`:''}</div>
        </div>`).join('');
      out.querySelectorAll('.sm-result[data-hi]').forEach(card=>{
        const i=+card.dataset.hi;const v=entry.variants[i];
        card.querySelector('[data-hist-act="copyEn"]').onclick=()=>{navigator.clipboard.writeText(v.prompt_en||'');toast('📋 EN');};
        const r=card.querySelector('[data-hist-act="copyRu"]');if(r)r.onclick=()=>{navigator.clipboard.writeText(v.prompt_ru||'');toast('📋 RU');};
      });
      out.insertAdjacentHTML('beforeend',bxBarHtml('text-history'));
      bxWire(out,'text-history',entry.meta||{},entry.variants);
    }
    toast('🕘 Открыто из истории');
  }else if(entry.mode==='video'){
    smSetTab('video');
    smRenderResults(entry.variants);
    document.getElementById('smIdea').value=entry.idea||'';
    toast('🕘 Открыто из истории');
  }else if(entry.mode==='i2p'){
    smSetTab('i2p');
    const out=document.getElementById('i2pResults');
    if(out){
      out.innerHTML=`<div class="text-xs subtle mb-3">🕘 Из истории · ${phFmtTs(entry.ts)} · ${entry.variants.length} вар. · ${(entry.idea||'').replace(/</g,'&lt;')}</div>`+
        entry.variants.map((v,i)=>`<div class="sm-result" data-hi="${i}">
          <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div class="flex items-center gap-2"><span class="font-semibold text-sm">📌 ${(v.title||'Вариант '+(i+1)).replace(/</g,'&lt;')}</span>${typeof v.score==='number'?`<span class="sm-score ${smScoreClass(v.score)}">⭐ ${v.score}/100</span>`:''}</div>
          </div>
          <div class="mb-2"><div class="text-[10px] uppercase tracking-wider subtle mb-1">🇬🇧 EN</div><div class="text-sm whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-black/20 border border-white/5">${(v.prompt_en||'').replace(/</g,'&lt;')}</div></div>
          ${v.prompt_ru?`<details class="mb-2"><summary class="text-[10px] uppercase tracking-wider subtle cursor-pointer">🇷🇺 RU</summary><div class="text-sm whitespace-pre-wrap p-3 rounded-lg bg-black/10 border border-white/5 mt-2 italic">${v.prompt_ru.replace(/</g,'&lt;')}</div></details>`:''}
          <div class="flex gap-2"><button class="soft-btn text-xs px-3 py-1.5" data-hist-act="copyEn">📋 EN</button>${v.prompt_ru?`<button class="soft-btn text-xs px-3 py-1.5" data-hist-act="copyRu">📋 RU</button>`:''}</div>
        </div>`).join('');
      out.querySelectorAll('.sm-result[data-hi]').forEach(card=>{
        const i=+card.dataset.hi;const v=entry.variants[i];
        card.querySelector('[data-hist-act="copyEn"]').onclick=()=>{navigator.clipboard.writeText(v.prompt_en||'');toast('📋 EN');};
        const r=card.querySelector('[data-hist-act="copyRu"]');if(r)r.onclick=()=>{navigator.clipboard.writeText(v.prompt_ru||'');toast('📋 RU');};
      });
      out.insertAdjacentHTML('beforeend',bxBarHtml('i2p-history'));
      bxWire(out,'i2p-history',entry.meta||{},entry.variants);
    }
    toast('🕘 Открыто из истории (картинка не сохранена)');
  }
}
function phToggle(show){
  const m=document.getElementById('phModal');if(!m)return;
  if(show){phRender();m.classList.remove('sm-hidden');}else{m.classList.add('sm-hidden');}
}

(function initPromptHistory(){
  document.getElementById('phOpenBtnVideo')?.addEventListener('click',()=>phToggle(true));
  document.getElementById('phOpenBtnText')?.addEventListener('click',()=>phToggle(true));
  document.getElementById('phCloseBtn')?.addEventListener('click',()=>phToggle(false));
  document.getElementById('phClearAll')?.addEventListener('click',phClearAll);
  document.getElementById('phSearch')?.addEventListener('input',_debounce(phRender,150));
  document.getElementById('phModal')?.addEventListener('click',e=>{if(e.target.id==='phModal')phToggle(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('phModal')?.classList.contains('sm-hidden'))phToggle(false);});
})();