/* ============================================================
   LUMEN — COLLAB & SHARING v15.13
   Three features in one module:

   1. 🔗 Share Link   — full prompt state compressed + base64url
                         into ?s=... URL. Banner on load asks to
                         import a shared prompt.
   2. 📄 Pitch Deck   — printable HTML storyboard (A4, card grid)
                         opens in new tab + window.print() dialog.
   3. 💾 Workspace    — export / import all localStorage seedance_*
                         keys as a single JSON file.

   Reuses existing app.js helpers: collectState, applyState,
   b64, ub64, $, toast.
   Exposes: window.openCollabModal(tab?)
   ============================================================ */
(function(){
  if(typeof $==='undefined'||typeof collectState!=='function'){
    console.warn('[collab] core helpers missing — module disabled');
    return;
  }

  /* =========================================================
     COMPRESSION (async) — uses native CompressionStream when
     available, otherwise plain b64. Fallback-safe in jsdom.
     ========================================================= */
  async function gzipB64(str){
    if(typeof CompressionStream==='undefined')return 'raw.'+b64(str);
    try{
      const stream=new Blob([str]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      const buf=await new Response(stream).arrayBuffer();
      let bin='';const u8=new Uint8Array(buf);
      for(let i=0;i<u8.length;i++)bin+=String.fromCharCode(u8[i]);
      return 'gz.'+btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    }catch(e){return 'raw.'+b64(str);}
  }
  async function ungzipB64(tag){
    if(tag.startsWith('raw.'))return ub64(tag.slice(4));
    if(!tag.startsWith('gz.'))return ub64(tag); /* legacy #s=... */
    const b64str=tag.slice(3).replace(/-/g,'+').replace(/_/g,'/');
    const bin=atob(b64str);const u8=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
    if(typeof DecompressionStream==='undefined')throw new Error('no DecompressionStream');
    const stream=new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return await new Response(stream).text();
  }

  /* =========================================================
     MODAL
     ========================================================= */
  const modal=document.createElement('div');
  modal.id='collabModal';
  modal.className='hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4';
  modal.innerHTML=`<div class="glass rounded-2xl p-5 max-w-3xl w-full max-h-[90vh] overflow-auto">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="text-lg font-semibold">🤝 Collaboration &amp; Sharing</div>
      </div>
      <button id="cbClose" class="soft-btn text-xs px-2 py-1" title="Escape">✕</button>
    </div>

    <div class="flex gap-1 mb-3 border-b border-white/10" role="tablist">
      <button class="cb-tab soft-btn text-xs px-3 py-1.5 rounded-t" data-cbtab="share">🔗 Share Link</button>
      <button class="cb-tab soft-btn text-xs px-3 py-1.5 rounded-t" data-cbtab="pitch">📄 Pitch Deck PDF</button>
      <button class="cb-tab soft-btn text-xs px-3 py-1.5 rounded-t" data-cbtab="backup">💾 Workspace Backup</button>
    </div>

    <!-- SHARE -->
    <div class="cb-pane" data-cbpane="share">
      <div class="text-xs subtle mb-2">Одна ссылка восстанавливает всю форму промта, multi-shot раскадровку, beats и выбранную модель. Никакого бэкенда — стейт сжат прямо в URL.</div>
      <div class="flex gap-2 mb-2">
        <button id="cbMakeLink" class="btn-primary px-3 py-1.5 rounded text-xs">🔗 Сгенерировать ссылку</button>
        <button id="cbCopyLink" class="soft-btn px-3 py-1.5 text-xs" disabled>📋 Копировать</button>
        <button id="cbOpenLink" class="soft-btn px-3 py-1.5 text-xs" disabled>↗ Открыть</button>
      </div>
      <textarea id="cbLinkOut" readonly rows="4" class="w-full p-2 rounded bg-black/30 border border-white/10 text-[11px] font-mono" placeholder="Нажми 'Сгенерировать ссылку'..."></textarea>
      <div id="cbLinkMeta" class="text-[10px] subtle mt-1"></div>
    </div>

    <!-- PITCH DECK -->
    <div class="cb-pane hidden" data-cbpane="pitch">
      <div class="text-xs subtle mb-2">Открывает печатную версию текущей раскадровки в новой вкладке. Используй Ctrl+P / «Сохранить как PDF» в диалоге печати для финального файла.</div>
      <div class="grid grid-cols-2 gap-2 text-[11px] mb-2">
        <label class="flex items-center gap-2"><input type="checkbox" id="cbPdIncludePrompt" checked> Включить EN-промт</label>
        <label class="flex items-center gap-2"><input type="checkbox" id="cbPdIncludeNeg" checked> Включить Negative</label>
        <label class="flex items-center gap-2"><input type="checkbox" id="cbPdDarkTheme"> Тёмная тема PDF</label>
        <label class="flex items-center gap-2"><input type="text" id="cbPdTitle" class="flex-1 p-1 rounded bg-black/30 border border-white/10 text-[11px]" placeholder="Название проекта"></label>
      </div>
      <div class="flex gap-2">
        <button id="cbPdOpen" class="btn-primary px-3 py-1.5 rounded text-xs">📄 Открыть Pitch Deck</button>
        <span class="text-[10px] subtle self-center">Печать запустится автоматически</span>
      </div>
    </div>

    <!-- BACKUP -->
    <div class="cb-pane hidden" data-cbpane="backup">
      <div class="text-xs subtle mb-2">Экспортирует ВСЁ: текущий стейт, историю (seedance_hist), избранное (seedance_fav), пресеты (seedance_user_presets), API-ключи XOR-зашифрованы. Импорт — слияние с существующим workspace.</div>
      <div class="flex gap-2 mb-2">
        <button id="cbBkExport" class="btn-primary px-3 py-1.5 rounded text-xs">💾 Экспорт в JSON</button>
        <button id="cbBkImport" class="soft-btn px-3 py-1.5 text-xs">📥 Импорт из JSON</button>
        <input type="file" id="cbBkFile" accept="application/json,.json" class="hidden">
      </div>
      <div id="cbBkStats" class="text-[10px] subtle"></div>
    </div>
  </div>`;
  document.body.appendChild(modal);

  /* Tab switching */
  function showTab(t){
    modal.querySelectorAll('.cb-tab').forEach(b=>{
      const active=b.dataset.cbtab===t;
      b.classList.toggle('btn-primary',active);
      b.classList.toggle('soft-btn',!active);
    });
    modal.querySelectorAll('.cb-pane').forEach(p=>p.classList.toggle('hidden',p.dataset.cbpane!==t));
  }
  modal.querySelectorAll('.cb-tab').forEach(b=>b.onclick=()=>showTab(b.dataset.cbtab));
  $('cbClose').onclick=()=>modal.classList.add('hidden');
  modal.onclick=e=>{if(e.target===modal)modal.classList.add('hidden');};

  /* =========================================================
     SHARE LINK
     ========================================================= */
  $('cbMakeLink').onclick=async()=>{
    const json=JSON.stringify(collectState());
    const tag=await gzipB64(json);
    const url=location.origin+location.pathname+'#s='+tag;
    $('cbLinkOut').value=url;
    $('cbCopyLink').disabled=false;
    $('cbOpenLink').disabled=false;
    const ratio=Math.round((1-tag.length/json.length)*100);
    const safe=url.length<=2000;
    $('cbLinkMeta').innerHTML=`📏 ${url.length} символов · сжатие ${ratio>0?ratio+'%':'нет (raw)'} `+
      (safe?`<span style="color:#4ade80">✓ помещается в URL</span>`
           :`<span style="color:#fb923c">⚠ URL длиннее 2000 симв — некоторые сервисы могут резать. Используй Workspace Backup для больших проектов.</span>`);
  };
  $('cbCopyLink').onclick=async()=>{
    const v=$('cbLinkOut').value;if(!v)return;
    try{await navigator.clipboard.writeText(v);toast('🔗 Ссылка скопирована');}
    catch{ $('cbLinkOut').select(); document.execCommand?.('copy'); toast('🔗 Скопировано'); }
  };
  $('cbOpenLink').onclick=()=>{const v=$('cbLinkOut').value;if(v)window.open(v,'_blank','noopener');};

  /* =========================================================
     AUTO-IMPORT ON PAGE LOAD
     app.js already handles legacy #s=<b64json>. We add support
     for gz.XXX and raw.XXX tags, and show a confirmation banner
     instead of silent apply for safety.
     ========================================================= */
  async function detectSharedLink(){
    const h=location.hash;
    if(!h.startsWith('#s='))return;
    const tag=h.slice(3);
    /* Legacy raw base64 JSON (starts with eyJ or so) — app.js already handled it silently,
       just skip if current form is not empty (user's own state) */
    if(!tag.startsWith('gz.')&&!tag.startsWith('raw.'))return;
    try{
      const json=await ungzipB64(tag);
      const s=JSON.parse(json);
      /* Show banner */
      const banner=document.createElement('div');
      banner.id='cbBanner';
      banner.className='fixed top-3 left-1/2 -translate-x-1/2 z-50 glass rounded-xl px-4 py-2 flex items-center gap-3 shadow-xl border border-violet-500/30';
      banner.innerHTML=`<div class="text-sm">🔗 Общая ссылка: <b>${(s.subject||'untitled').slice(0,40)}</b> <span class="text-[10px] subtle">· ${(s.shots||[]).length} shots</span></div>
        <button id="cbBannerLoad" class="btn-primary text-xs px-3 py-1 rounded">Загрузить</button>
        <button id="cbBannerSkip" class="soft-btn text-xs px-2 py-1">Закрыть</button>`;
      document.body.appendChild(banner);
      $('cbBannerLoad').onclick=()=>{applyState(s);toast('✅ Shared prompt загружен');history.replaceState(null,'',location.pathname);banner.remove();try{generate();}catch(e){}};
      $('cbBannerSkip').onclick=()=>{history.replaceState(null,'',location.pathname);banner.remove();};
    }catch(e){console.debug('[collab] share decode failed',e);}
  }
  /* Run on DOMContentLoaded or immediately if already loaded */
  if(document.readyState==='complete'||document.readyState==='interactive') setTimeout(detectSharedLink,400);
  else document.addEventListener('DOMContentLoaded',()=>setTimeout(detectSharedLink,400));

  /* =========================================================
     PITCH DECK
     ========================================================= */
  $('cbPdOpen').onclick=()=>{
    const s=collectState();
    const title=($('cbPdTitle').value||s.subject||'Lumen Storyboard').trim();
    const incPrompt=$('cbPdIncludePrompt').checked;
    const incNeg=$('cbPdIncludeNeg').checked;
    const dark=$('cbPdDarkTheme').checked;
    const prompt=($('outEnView')?.dataset.raw)||'';
    const esc=x=>String(x||'—').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const shots=(s.shots||[]).map((sh,i)=>`<div class="card">
      <div class="hd"><b>#${i+1}</b> · ${esc(sh.cam)} <span class="muted">· ${esc(sh.dur)} · ${esc(sh.tr||'cut')}</span></div>
      <div class="act">${esc(sh.act)}</div>
    </div>`).join('');

    const tag=(k,v)=>v?`<div class="row"><div class="k">${k}</div><div class="v">${esc(v)}</div></div>`:'';

    const css=`
      *{box-sizing:border-box}
      body{font-family:'Inter',system-ui,sans-serif;margin:0;padding:24px;background:${dark?'#0b0b14':'#fff'};color:${dark?'#e5e7eb':'#111'};line-height:1.5;}
      h1{font-size:28px;margin:0 0 6px;background:linear-gradient(90deg,#a78bfa,#ec4899);-webkit-background-clip:text;background-clip:text;color:transparent;}
      .sub{font-size:12px;color:${dark?'#94a3b8':'#64748b'};margin-bottom:24px}
      h2{font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:${dark?'#a78bfa':'#6d28d9'};margin:24px 0 8px;border-bottom:1px solid ${dark?'#27272a':'#e5e7eb'};padding-bottom:4px}
      .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
      .card{border:1px solid ${dark?'#27272a':'#e5e7eb'};border-radius:10px;padding:12px;background:${dark?'#111118':'#f9fafb'};page-break-inside:avoid}
      .card .hd{font-size:12px;margin-bottom:6px}
      .card .act{font-size:11px;line-height:1.45;color:${dark?'#d4d4d8':'#374151'}}
      .row{display:flex;gap:8px;font-size:12px;margin:3px 0}
      .k{width:100px;color:${dark?'#a78bfa':'#6d28d9'};font-weight:600}
      .v{flex:1}
      .muted{color:${dark?'#71717a':'#9ca3af'};font-weight:400}
      .prompt{font-size:11px;line-height:1.55;padding:12px;background:${dark?'#111118':'#f3f4f6'};border-radius:8px;border:1px solid ${dark?'#27272a':'#e5e7eb'};white-space:pre-wrap;word-break:break-word;font-family:'SF Mono',Consolas,monospace}
      .neg{font-size:11px;color:${dark?'#fca5a5':'#b91c1c'};margin-top:8px;line-height:1.45}
      footer{margin-top:40px;text-align:center;font-size:10px;color:${dark?'#52525b':'#9ca3af'};border-top:1px solid ${dark?'#27272a':'#e5e7eb'};padding-top:12px}
      @page{size:A4;margin:14mm}
      @media print{body{padding:0}}
    `;
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body>
      <h1>${esc(title)}</h1>
      <div class="sub">Lumen Cinematic Prompt Studio · ${new Date().toLocaleDateString()} · by Armen</div>

      <h2>🎬 Concept</h2>
      ${tag('Subject',s.subject)}
      ${tag('Action',s.action)}
      ${tag('Scene',s.scene)}
      ${tag('Mood',s.mood)}
      ${tag('Style',s.style)}
      ${tag('Palette',s.palette)}
      ${tag('Lighting',s.lighting)}
      ${tag('Camera',[s.shot,s.camera,s.lens,s.speed].filter(Boolean).join(' · '))}
      ${tag('Format',[s.aspect,s.duration,s.res].filter(Boolean).join(' · '))}

      ${shots?`<h2>🎞 Storyboard — ${(s.shots||[]).length} shots</h2><div class="grid">${shots}</div>`:''}

      ${incPrompt&&prompt?`<h2>📝 EN Prompt</h2><div class="prompt">${esc(prompt)}</div>`:''}
      ${incNeg&&s.negative?`<h2>🚫 Negative</h2><div class="neg">${esc(s.negative)}</div>`:''}

      <footer>Generated by Lumen · github.com/aacopov-debug/seedance-studio</footer>
      <script>setTimeout(()=>window.print(),600)</script>
    </body></html>`;

    const w=window.open('','_blank','noopener');
    if(!w){toast('⚠ Всплывающее окно заблокировано');return;}
    w.document.open();w.document.write(html);w.document.close();
    modal.classList.add('hidden');
  };

  /* =========================================================
     WORKSPACE BACKUP
     ========================================================= */
  function listKeys(){return Object.keys(localStorage).filter(k=>k.startsWith('seedance_')||k.startsWith('lumen_'));}
  function updateBkStats(){
    const keys=listKeys();
    let total=0;keys.forEach(k=>total+=(localStorage.getItem(k)||'').length);
    $('cbBkStats').textContent=`📦 ${keys.length} ключей · ~${(total/1024).toFixed(1)} KB в localStorage`;
  }
  updateBkStats();

  $('cbBkExport').onclick=()=>{
    const keys=listKeys();const dump={__lumen:true,v:window.LUMEN_VERSION||'15.13',t:Date.now(),data:{}};
    keys.forEach(k=>dump.data[k]=localStorage.getItem(k));
    const blob=new Blob([JSON.stringify(dump,null,2)],{type:'application/json'});
    const u=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=u;a.download=`lumen-workspace-${new Date().toISOString().slice(0,10)}.json`;a.click();
    setTimeout(()=>URL.revokeObjectURL(u),200);
    toast(`💾 Экспортировано ${keys.length} ключей`);
  };
  $('cbBkImport').onclick=()=>$('cbBkFile').click();
  $('cbBkFile').addEventListener('change',e=>{
    const f=e.target.files?.[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const d=JSON.parse(ev.target.result);
        if(!d||!d.__lumen||!d.data)throw new Error('Не похоже на Lumen backup');
        if(!confirm(`Импортировать ${Object.keys(d.data).length} ключей из backup (${new Date(d.t).toLocaleString()})?\nСуществующие ключи будут перезаписаны.`))return;
        Object.entries(d.data).forEach(([k,v])=>{try{localStorage.setItem(k,v);}catch(e){}});
        toast('✅ Backup импортирован — перезагрузка...');
        setTimeout(()=>location.reload(),900);
      }catch(err){toast('❌ '+err.message);}
    };
    r.readAsText(f);e.target.value='';
  });

  /* =========================================================
     HOOK INTO EXISTING shareBtn
     ========================================================= */
  const shareBtn=$('shareBtn');
  if(shareBtn){
    shareBtn.onclick=e=>{e.preventDefault?.();window.openCollabModal('share');};
    shareBtn.title='Share · Pitch Deck · Backup (Ctrl+Shift+S)';
  }

  /* =========================================================
     KEYBOARD SHORTCUT: Ctrl+Shift+S
     ========================================================= */
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='s'){
      e.preventDefault();window.openCollabModal('share');
    }
    if(e.key==='Escape'&&!modal.classList.contains('hidden'))modal.classList.add('hidden');
  });

  /* =========================================================
     PUBLIC ENTRY
     ========================================================= */
  window.openCollabModal=(tab='share')=>{
    modal.classList.remove('hidden');
    showTab(tab);
    updateBkStats();
  };

  /* =========================================================
     COMMAND PALETTE + AI STUDIO-friendly globals
     ========================================================= */
  try{
    if(typeof CMDS!=='undefined'){
      CMDS.push(
        {n:'🔗 Share Link (общая ссылка на промт)',h:()=>window.openCollabModal('share')},
        {n:'📄 Pitch Deck PDF (печатная раскадровка)',h:()=>window.openCollabModal('pitch')},
        {n:'💾 Workspace Backup (экспорт/импорт)',h:()=>window.openCollabModal('backup')}
      );
    }
  }catch(e){}

  console.log('%c[Lumen v15.13] Collab & Sharing ready','color:#a78bfa');
})();
