/* ============================================================
   LUMEN — IMAGE-TO-PROMPT MODULE (extracted from app.js v15.3)
   ============================================================
   Full I2P pipeline: drop/paste/pick image, multi-reference roles,
   AI Vision Analysis (Phase 1), style mode tiles, generate 3 prompt
   variants with history/ratings/favorites, paste listener, restore.

   Dependencies (globals from app.js core):
   - aiCall, aiFetchJson, aiCfg, needKey     AI core
   - $, toast, safeLS, logError              helpers
   - CMDS, setMode, smSetTab                  command palette + simple mode tabs
   - phToggle (prompt history)
   - presetsOpen (from js/presets.js, referenced at click time only)
   Loaded AFTER app.js and js/presets.js so Simple Mode tabs and
   the i2p-tab DOM already exist.
   ============================================================ */
/* ============ Img → Prompt (Vision-based) ============ */
const I2P_MODES=[
  {k:'recreate',icon:'🎯',label:'Воссоздать',sub:'точная репликация'},
  {k:'stylize',icon:'🎨',label:'Стиль-реф',sub:'тот же стиль, новый сюжет'},
  {k:'extend',icon:'🎬',label:'Кинематично',sub:'усилить как кадр'}
];
const I2P_TARGETS=[
  {k:'video',icon:'🎬',label:'Видео',sub:'для Sora/Runway/Kling'},
  {k:'image',icon:'🖼',label:'Картинка',sub:'для DALL·E/MJ'}
];
const I2P_ASPECTS_VIDEO=[
  {k:'9:16',label:'9:16',sub:'TikTok/Reels'},
  {k:'16:9',label:'16:9',sub:'YouTube/кино'},
  {k:'1:1',label:'1:1',sub:'Instagram'},
  {k:'4:5',label:'4:5',sub:'Insta pro'},
  {k:'21:9',label:'21:9',sub:'cinematic'}
];
const I2P_ASPECTS_IMAGE=[
  {k:'1:1',label:'1:1',sub:'1024×1024'},
  {k:'16:9',label:'16:9',sub:'1792×1024'},
  {k:'9:16',label:'9:16',sub:'1024×1792'}
];

const i2pState={img:null,refs:[],analysis:null};
const I2P_REF_ROLES=[
  {v:'palette',label:'🎨 Палитра'},
  {v:'lighting',label:'💡 Свет'},
  {v:'composition',label:'📐 Композиция'},
  {v:'mood',label:'🌙 Настроение'},
  {v:'subject',label:'👤 Сюжет'},
  {v:'style',label:'🎬 Полный стиль'}
];
const I2P_MAX_REFS=2; // 1 primary + up to 2 extra = 3 total
let _i2pMode='recreate';
let _i2pTarget='video';
let _i2pAspect='9:16';

function _i2pAspectList(){return _i2pTarget==='image'?I2P_ASPECTS_IMAGE:I2P_ASPECTS_VIDEO;}

function i2pRenderTiles(){
  const m=document.getElementById('i2pModeTiles');
  const t=document.getElementById('i2pTargetTiles');
  const a=document.getElementById('i2pAspectTiles');
  if(!m||!t||!a)return;
  const tile=(active,k,icon,label,sub,attr)=>`<div class="sm-tile${active?' active':''}" ${attr}="${k}"><span class="sm-tile-icon">${icon}</span><div class="sm-tile-label">${label}</div><div class="sm-tile-sub">${sub}</div></div>`;
  m.innerHTML=I2P_MODES.map(x=>tile(x.k===_i2pMode,x.k,x.icon,x.label,x.sub,'data-mode')).join('');
  t.innerHTML=I2P_TARGETS.map(x=>tile(x.k===_i2pTarget,x.k,x.icon,x.label,x.sub,'data-target')).join('');
  a.innerHTML=_i2pAspectList().map(x=>tile(x.k===_i2pAspect,x.k,'📐',x.label,x.sub,'data-aspect')).join('');
  m.querySelectorAll('[data-mode]').forEach(el=>el.onclick=()=>{_i2pMode=el.dataset.mode;i2pRenderTiles();});
  t.querySelectorAll('[data-target]').forEach(el=>el.onclick=()=>{
    _i2pTarget=el.dataset.target;
    const list=_i2pAspectList();
    if(!list.find(x=>x.k===_i2pAspect))_i2pAspect=list[0].k;
    i2pRenderTiles();
  });
  a.querySelectorAll('[data-aspect]').forEach(el=>el.onclick=()=>{_i2pAspect=el.dataset.aspect;i2pRenderTiles();});
}

function i2pSetImage(dataUrl){
  i2pState.img=dataUrl;
  const empty=document.getElementById('i2pDropEmpty');
  const filled=document.getElementById('i2pDropFilled');
  const prev=document.getElementById('i2pPreview');
  const panel=document.getElementById('i2pAnalysisPanel');
  const refsWrap=document.getElementById('i2pRefsWrap');
  if(dataUrl){
    if(prev)prev.src=dataUrl;
    empty?.classList.add('hidden');
    filled?.classList.remove('hidden');
    refsWrap?.classList.remove('hidden');
    i2pRenderRefs();
  }else{
    empty?.classList.remove('hidden');
    filled?.classList.add('hidden');
    if(prev)prev.src='';
    if(panel){panel.classList.add('hidden');panel.innerHTML='';}
    i2pState.analysis=null;
    i2pState.refs=[];
    refsWrap?.classList.add('hidden');
    i2pRenderRefs();
  }
  i2pPersist();
}

/* ============ I2P PERSISTENCE (Polish v13.2) ============ */
const I2P_PERSIST_KEY='lumen.i2p.last';
function i2pPersist(){
  try{
    if(!i2pState.img&&!i2pState.analysis){
      localStorage.removeItem(I2P_PERSIST_KEY);
      return;
    }
    const data={
      img:i2pState.img||null,
      refs:(i2pState.refs||[]).map(r=>({img:r.img,role:r.role})),
      analysis:i2pState.analysis||null,
      ts:Date.now()
    };
    const json=JSON.stringify(data);
    // Guard against quota — localStorage is typically 5-10MB; warn if approaching
    if(json.length>4_500_000){console.warn('[i2p persist] payload',Math.round(json.length/1024),'KB — too large, skipping');return;}
    localStorage.setItem(I2P_PERSIST_KEY,json);
  }catch(e){console.warn('[i2p persist] failed',e);}
}
function i2pRestore(){
  try{
    const raw=localStorage.getItem(I2P_PERSIST_KEY);
    if(!raw)return false;
    const d=JSON.parse(raw);
    if(!d||(!d.img&&!d.analysis))return false;
    if(d.img){
      i2pState.img=d.img;
      const prev=document.getElementById('i2pPreview');
      const empty=document.getElementById('i2pDropEmpty');
      const filled=document.getElementById('i2pDropFilled');
      const refsWrap=document.getElementById('i2pRefsWrap');
      if(prev)prev.src=d.img;
      empty?.classList.add('hidden');
      filled?.classList.remove('hidden');
      refsWrap?.classList.remove('hidden');
    }
    if(Array.isArray(d.refs))i2pState.refs=d.refs.filter(r=>r&&r.img);
    i2pRenderRefs();
    if(d.analysis){
      i2pState.analysis=d.analysis;
      const panel=document.getElementById('i2pAnalysisPanel');
      if(panel){panel.classList.remove('hidden');i2pRenderAnalysis(d.analysis);}
    }
    // Brief restored toast
    const t=document.createElement('div');
    t.className='i2p-restored-toast';
    t.innerHTML='♻️ Предыдущий анализ восстановлен';
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),3700);
    return true;
  }catch(e){console.warn('[i2p restore] failed',e);return false;}
}

/* ============ MULTI-REFERENCE (Phase 2) ============ */
function i2pRenderRefs(){
  const row=document.getElementById('i2pRefsRow');
  if(!row)return;
  const slots=i2pState.refs.map((r,idx)=>{
    const opts=I2P_REF_ROLES.map(o=>`<option value="${o.v}" ${o.v===r.role?'selected':''}>${o.label}</option>`).join('');
    return `<div class="i2p-ref-slot" data-idx="${idx}">
      <button class="i2p-ref-remove" data-remove="${idx}" title="Убрать">×</button>
      <img class="i2p-ref-thumb" src="${r.img}" alt="ref ${idx+1}"/>
      <select class="i2p-ref-role" data-role="${idx}">${opts}</select>
    </div>`;
  }).join('');
  const canAdd=i2pState.refs.length<I2P_MAX_REFS;
  const addBtn=canAdd?`<button class="i2p-ref-add" id="i2pRefAddBtn" type="button"><span class="i2p-ref-add-icon">+</span><span>добавить</span><span style="font-size:9.5px;opacity:.7">${i2pState.refs.length}/${I2P_MAX_REFS}</span></button>`:'';
  row.innerHTML=slots+addBtn;

  row.querySelectorAll('[data-remove]').forEach(b=>{
    b.addEventListener('click',e=>{
      e.stopPropagation();
      const i=+b.dataset.remove;
      i2pState.refs.splice(i,1);
      i2pRenderRefs();
      i2pPersist();
    });
  });
  row.querySelectorAll('[data-role]').forEach(s=>{
    s.addEventListener('change',()=>{
      const i=+s.dataset.role;
      if(i2pState.refs[i])i2pState.refs[i].role=s.value;
      i2pPersist();
    });
  });
  const addEl=document.getElementById('i2pRefAddBtn');
  if(addEl){
    addEl.addEventListener('click',()=>document.getElementById('i2pRefFile')?.click());
  }
  // Update analyze button label
  const btn=document.getElementById('i2pAnalyzeBtn');
  if(btn){
    const span=btn.querySelector('span:last-child');
    if(span)span.textContent=i2pState.refs.length?`🔬 Бленд-анализ (${i2pState.refs.length+1})`:'🔬 Анализировать';
  }
}

function i2pAddRefFile(file){
  if(!file||!file.type.startsWith('image/')){toast('Это не картинка');return;}
  if(file.size>10*1024*1024){toast('Файл больше 10 MB');return;}
  if(i2pState.refs.length>=I2P_MAX_REFS){toast('Максимум '+I2P_MAX_REFS+' доп. референса');return;}
  const r=new FileReader();
  r.onload=e=>{
    i2pState.refs.push({img:e.target.result,role:'palette'});
    i2pRenderRefs();
    i2pPersist();
    toast('+ референс '+i2pState.refs.length);
  };
  r.onerror=()=>toast('⚠ Не удалось прочитать файл');
  r.readAsDataURL(file);
}

/* ============ AI VISION AUTO-ANALYSIS (Phase 1) ============ */
// Downscale a base64 dataURL to a max dimension and re-encode as JPEG to shrink payload.
function i2pDownscale(dataUrl,maxSide=1280,quality=0.85){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{
      try{
        let{width:w,height:h}=img;
        const k=Math.max(w,h)>maxSide?maxSide/Math.max(w,h):1;
        w=Math.round(w*k);h=Math.round(h*k);
        const cv=document.createElement('canvas');cv.width=w;cv.height=h;
        const ctx=cv.getContext('2d');
        ctx.drawImage(img,0,0,w,h);
        const out=cv.toDataURL('image/jpeg',quality);
        resolve(out);
      }catch(e){reject(e);}
    };
    img.onerror=()=>reject(new Error('image decode failed'));
    img.src=dataUrl;
  });
}
function _i2pSizeKb(dataUrl){return Math.round((dataUrl.length*0.75)/1024);}

async function i2pAnalyze(){
  if(!i2pState.img){toast('Сначала загрузи картинку');return;}
  if(!needKey())return;
  const c=aiCfg();
  if(!/openai|gpt|claude|anthropic|groq/i.test(c.base+c.model)){
    if(!confirm('⚠ Текущая модель может не поддерживать vision. Рекомендуем gpt-4o-mini, claude-3-5-sonnet или llama vision. Продолжить?'))return;
  }
  const panel=document.getElementById('i2pAnalysisPanel');
  const btn=document.getElementById('i2pAnalyzeBtn');
  if(!panel)return;
  panel.classList.remove('hidden');
  const isBlend=i2pState.refs.length>0;
  const phaseLabel=isBlend?'PHASE 2 • BLEND':'PHASE 1';
  const loadingMsg=isBlend?`AI смешивает ${i2pState.refs.length+1} референса по ролям...`:'AI разбирает композицию, палитру и стиль...';
  panel.innerHTML=`<div class="i2p-an-header"><h3>🔬 AI Vision Analysis</h3><span class="i2p-an-badge">${phaseLabel}</span></div><div class="i2p-an-loading"><span class="i2p-an-loading-dot"></span><span class="i2p-an-loading-dot"></span><span class="i2p-an-loading-dot"></span><span>${loadingMsg}</span></div>`;
  if(btn){btn.disabled=true;btn.style.opacity='.6';}
  console.group('[i2pAnalyze] start');
  console.log('isBlend:',isBlend,'refs:',i2pState.refs.length);
  console.log('model:',c.model,'base:',c.base);

  // Downscale all images to keep payload manageable (multi-image vision calls otherwise hang)
  let primaryImg,refImgs=[];
  try{
    console.log('original primary size:',_i2pSizeKb(i2pState.img),'KB');
    primaryImg=await i2pDownscale(i2pState.img,1280,0.85);
    console.log('compressed primary size:',_i2pSizeKb(primaryImg),'KB');
    if(isBlend){
      for(let i=0;i<i2pState.refs.length;i++){
        const r=i2pState.refs[i];
        console.log(`compressing ref #${i+2} (role: ${r.role}) original:`,_i2pSizeKb(r.img),'KB');
        const small=await i2pDownscale(r.img,768,0.78);
        console.log(`compressed ref #${i+2}:`,_i2pSizeKb(small),'KB');
        refImgs.push({...r,img:small});
      }
    }
  }catch(e){
    console.error('[i2pAnalyze] downscale failed',e);
    panel.innerHTML='<div class="i2p-an-header"><h3>🔬 AI Vision Analysis</h3></div><div class="text-sm" style="color:#f87171">⚠ Не удалось подготовить изображения</div>';
    if(btn){btn.disabled=false;btn.style.opacity='';}
    console.groupEnd();return;
  }

  const sys=`You are an expert cinematographer and visual style analyst. Analyze the reference image and return STRUCTURED JSON only.

Return this exact schema (no extra fields, no markdown, no commentary):
{
  "palette": [
    {"hex":"#RRGGBB","name":"short color name in English","role":"primary|secondary|accent|background|highlight"}
  ],
  "composition": {
    "rule": "primary compositional rule in Russian (правило третей, центральная, диагональная, симметричная, рамка)",
    "techniques": ["3-5 techniques in Russian: ведущие линии, негативное пространство, глубина резкости, рамка в рамке, low-angle, etc."],
    "framing": "shot size in Russian (крупный, средний, общий, wide, medium close-up)"
  },
  "lighting": {
    "type": "lighting setup in Russian (golden hour rim light, low-key chiaroscuro, soft natural, etc.)",
    "direction": "фронтальный / боковой / контровой / верхний / rim",
    "quality": "мягкий / жёсткий / рассеянный",
    "contrast": "низкий / средний / высокий"
  },
  "camera": {
    "lens_guess": "likely focal length in mm (e.g. 35mm wide, 50mm normal, 85mm portrait, 135mm tele, anamorphic) + DoF hint in English",
    "angle": "low / eye-level / high / dutch / overhead",
    "movement_hint": "static / slow push-in / handheld / dolly / crane (best guess in English)"
  },
  "director_match": [
    {"name":"director or DP name","confidence":"high|medium|low","why":"1-line reasoning in Russian"}
  ],
  "keywords": ["5-8 short style keywords in English: cinematic, moody, anamorphic, golden hour, etc."],
  "summary_ru": "1-2 sentence cinematic-style description in Russian summarizing the visual mood and style"
}

Rules:
- palette: exactly 5 colors, sorted by visual importance, hex must be 6-digit uppercase
- director_match: 1-3 matches, sorted by confidence
- keywords: lowercase, no duplicates
- Be specific. No generic answers like "good lighting" — say WHICH lighting.`;

  const roleInstructions={
    palette:'take ONLY the color palette from this image (ignore composition/subject)',
    lighting:'take ONLY the lighting setup and mood (ignore colors and subject)',
    composition:'take ONLY the compositional structure and framing (ignore colors)',
    mood:'take ONLY the atmospheric mood and emotional tone',
    subject:'take ONLY the subject matter and narrative idea (ignore visual style)',
    style:'take the FULL visual style as a secondary influence'
  };
  const blendSys=sys+`

===== BLEND MODE =====
You will receive a PRIMARY image and ${i2pState.refs.length} additional reference(s) each with a specific role.
Your task: BLEND aspects from all images according to their roles. The PRIMARY image is the base; additional refs contribute only their assigned role.
Add one more field to the JSON output:
  "blend_prompt": "2-3 sentence cinematic prompt in Russian that merges the blended aesthetics into a single coherent shot description suitable for a video generator",
  "blend_notes": ["1-line note per additional ref in Russian explaining what was taken from it"]

The palette, composition, lighting, keywords etc. in the output must reflect the BLEND, not just the primary.`;
  const systemPrompt=isBlend?blendSys:sys;

  const userContent=[
    {type:'text',text:isBlend?'PRIMARY image (base style reference):':'Analyze this reference image and return the JSON.'},
    {type:'image_url',image_url:{url:primaryImg,detail:'high'}}
  ];
  if(isBlend){
    refImgs.forEach((r,i)=>{
      const instr=roleInstructions[r.role]||roleInstructions.style;
      userContent.push({type:'text',text:`Reference #${i+2} — role: ${r.role.toUpperCase()} — ${instr}.`});
      userContent.push({type:'image_url',image_url:{url:r.img,detail:'low'}});
    });
    userContent.push({type:'text',text:'Return the BLENDED analysis JSON now.'});
  }
  const totalKb=_i2pSizeKb(primaryImg)+refImgs.reduce((s,r)=>s+_i2pSizeKb(r.img),0);
  console.log('total payload (images only):',totalKb,'KB');

  // 120s timeout via AbortController
  const ac=new AbortController();
  const t0=Date.now();
  const timer=setTimeout(()=>{ac.abort();},120000);

  try{
    console.log('sending request...');
    const j=await aiFetchJson(c,'/chat/completions',{
      model:c.model,
      response_format:{type:'json_object'},
      temperature:0.4,
      max_tokens:1500,
      messages:[
        {role:'system',content:systemPrompt},
        {role:'user',content:userContent}
      ]
    },{signal:ac.signal});
    console.log('response in',Date.now()-t0,'ms');
    const txt=j.choices?.[0]?.message?.content;
    if(!txt)throw new Error('Пустой ответ AI');
    console.log('parsed JSON length:',txt.length,'chars');
    const data=JSON.parse(txt);
    i2pState.analysis=data;
    i2pRenderAnalysis(data);
    i2pPersist();
    console.log('done in',Date.now()-t0,'ms');
  }catch(e){
    const aborted=e.name==='AbortError';
    console.error('[i2pAnalyze] error',aborted?'(timeout 120s)':'',e);
    const msg=aborted?'Таймаут 120 сек. Возможно модель не поддерживает много картинок. Попробуй gpt-4o-mini.':(e.message||'не удалось проанализировать');
    panel.innerHTML='<div class="i2p-an-header"><h3>🔬 AI Vision Analysis</h3></div><div class="text-sm" style="color:#f87171;line-height:1.5">⚠ '+msg.replace(/</g,'&lt;')+'</div>';
  }finally{
    clearTimeout(timer);
    if(btn){btn.disabled=false;btn.style.opacity='';}
    console.groupEnd();
  }
}

function i2pRenderAnalysis(d){
  const panel=document.getElementById('i2pAnalysisPanel');
  if(!panel||!d)return;
  const esc=s=>String(s||'').replace(/</g,'&lt;');
  const palette=Array.isArray(d.palette)?d.palette:[];
  const comp=d.composition||{};
  const light=d.lighting||{};
  const cam=d.camera||{};
  const directors=Array.isArray(d.director_match)?d.director_match:[];
  const keywords=Array.isArray(d.keywords)?d.keywords:[];

  const paletteHtml=palette.length?'<div class="i2p-palette">'+palette.map(p=>`<div class="i2p-swatch-wrap"><div class="i2p-swatch" style="background:${esc(p.hex)}" data-hex="${esc(p.hex)}" title="${esc(p.name)} · ${esc(p.role)} · клик — копировать"></div><div class="i2p-swatch-cap">${esc((p.hex||'').toUpperCase())}</div><div class="i2p-swatch-name">${esc(p.name||'')}</div></div>`).join('')+'</div>':'<div class="text-xs subtle">—</div>';

  const compHtml=`
    ${comp.rule?`<div class="i2p-comp-row"><b>Правило:</b>${esc(comp.rule)}</div>`:''}
    ${comp.framing?`<div class="i2p-comp-row"><b>Кадр:</b>${esc(comp.framing)}</div>`:''}
    ${Array.isArray(comp.techniques)&&comp.techniques.length?`<div class="i2p-comp-row"><b>Техники:</b>${comp.techniques.map(esc).join(', ')}</div>`:''}
    ${light.type?`<div class="i2p-comp-row"><b>Свет:</b>${esc(light.type)}${light.direction?' · '+esc(light.direction):''}${light.quality?' · '+esc(light.quality):''}</div>`:''}
    ${cam.lens_guess?`<div class="i2p-comp-row"><b>Объектив:</b>${esc(cam.lens_guess)}</div>`:''}
    ${cam.angle?`<div class="i2p-comp-row"><b>Ракурс:</b>${esc(cam.angle)}${cam.movement_hint?' · '+esc(cam.movement_hint):''}</div>`:''}
  `;

  const dirHtml=directors.length?directors.map(dr=>`
    <div class="i2p-director">
      <div><span class="i2p-director-name">${esc(dr.name)}</span><span class="i2p-director-conf ${(dr.confidence||'low').toLowerCase()}">${esc(dr.confidence||'low')}</span></div>
      ${dr.why?`<div class="i2p-director-why">${esc(dr.why)}</div>`:''}
    </div>`).join(''):'<div class="text-xs subtle">Не определено</div>';

  const kwHtml=keywords.length?'<div class="i2p-tags">'+keywords.map(k=>`<span class="i2p-tag" data-kw="${esc(k)}">${esc(k)}</span>`).join('')+'</div>':'';

  const isBlendResult=!!d.blend_prompt;
  const badgeLabel=isBlendResult?'PHASE 2 • BLEND':'PHASE 1';
  panel.innerHTML=`
    <div class="i2p-an-header">
      <h3>🔬 AI Vision Analysis</h3>
      <span class="i2p-an-badge">${badgeLabel}</span>
    </div>
    <div class="i2p-an-grid">
      <div class="i2p-an-section">
        <div class="i2p-an-label">🎨 Палитра</div>
        ${paletteHtml}
      </div>
      <div class="i2p-an-section">
        <div class="i2p-an-label">📐 Композиция и свет</div>
        ${compHtml||'<div class="text-xs subtle">—</div>'}
      </div>
      <div class="i2p-an-section">
        <div class="i2p-an-label">🎬 Стиль режиссёра</div>
        ${dirHtml}
      </div>
      <div class="i2p-an-section">
        <div class="i2p-an-label">🏷 Ключевые слова</div>
        ${kwHtml||'<div class="text-xs subtle">—</div>'}
      </div>
    </div>
    ${d.summary_ru?`<div class="i2p-an-summary">💡 ${esc(d.summary_ru)}</div>`:''}
    ${d.blend_prompt?`<div class="i2p-blend-prompt"><div class="i2p-blend-prompt-label"><span>🎭 BLEND PROMPT (RU)</span><button class="i2p-blend-copy" data-blend-copy>КОПИРОВАТЬ</button></div>${esc(d.blend_prompt)}${Array.isArray(d.blend_notes)&&d.blend_notes.length?'<div style="margin-top:8px;padding-top:8px;border-top:1px dashed rgba(236,72,153,.2);font-size:11.5px;opacity:.85">'+d.blend_notes.map(n=>'· '+esc(n)).join('<br>')+'</div>':''}</div>`:''}
    <div class="i2p-an-actions">
      ${isBlendResult?'<button class="i2p-an-action i2p-an-action-primary" data-act="use-blend"><span>🎯</span><span>В финальный промт</span></button>':''}
      <button class="i2p-an-action" data-act="save-preset"><span>💾</span><span>Сохранить стиль</span></button>
      <button class="i2p-an-action" data-act="copy-palette"><span>📋</span><span>Копировать HEX'ы</span></button>
      <button class="i2p-an-action" data-act="apply-mod"><span>✏️</span><span>Добавить в «Модификацию»</span></button>
      <button class="i2p-an-action" data-act="reanalyze"><span>🔄</span><span>Переанализировать</span></button>
    </div>`;
  // Smooth scroll panel into view
  setTimeout(()=>{try{panel.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}},80);

  // Wire palette swatch click → copy hex
  panel.querySelectorAll('.i2p-swatch').forEach(sw=>{
    sw.addEventListener('click',()=>{
      const hex=sw.dataset.hex;
      navigator.clipboard.writeText(hex).then(()=>toast('📋 '+hex+' скопирован')).catch(()=>{});
    });
  });
  // Wire keyword chip click → add to modification field with flash animation
  panel.querySelectorAll('.i2p-tag').forEach(tg=>{
    tg.addEventListener('click',()=>{
      const kw=tg.dataset.kw;
      const mod=document.getElementById('i2pMod');
      if(mod){
        const cur=mod.value.trim();
        // Avoid duplicates
        const already=cur.split(/\s*,\s*/).map(s=>s.toLowerCase()).includes(kw.toLowerCase());
        if(!already){
          mod.value=cur?(cur+', '+kw):kw;
          toast('+ '+kw);
        }else{
          toast('«'+kw+'» уже добавлен');
        }
        tg.classList.remove('i2p-tag-flash');
        void tg.offsetWidth;
        tg.classList.add('i2p-tag-flash');
      }
    });
  });
  // Wire blend-prompt copy button
  const blendCopyBtn=panel.querySelector('[data-blend-copy]');
  if(blendCopyBtn&&d.blend_prompt){
    blendCopyBtn.addEventListener('click',()=>{
      navigator.clipboard.writeText(d.blend_prompt).then(()=>{
        toast('📋 Blend prompt скопирован');
        blendCopyBtn.textContent='✓';
        setTimeout(()=>{blendCopyBtn.textContent='КОПИРОВАТЬ';},1400);
      }).catch(()=>{});
    });
  }
  // Wire action buttons
  panel.querySelectorAll('.i2p-an-action').forEach(b=>{
    b.addEventListener('click',()=>{
      const act=b.dataset.act;
      if(act==='save-preset'){
        presetSaveCurrent();
      }else if(act==='use-blend'){
        const mod=document.getElementById('i2pMod');
        const text=d.blend_prompt||d.summary_ru||'';
        if(mod&&text){
          mod.value=text;
          toast('🎯 Blend prompt вставлен в «Модификацию»');
          mod.scrollIntoView({behavior:'smooth',block:'center'});
          mod.focus();
        }
      }else if(act==='copy-palette'){
        const hexes=palette.map(p=>p.hex).join(', ');
        navigator.clipboard.writeText(hexes).then(()=>toast('📋 Палитра скопирована')).catch(()=>{});
      }else if(act==='apply-mod'){
        const mod=document.getElementById('i2pMod');
        if(!mod)return;
        const parts=[];
        if(light.type)parts.push(light.type);
        if(cam.lens_guess)parts.push(cam.lens_guess.split(',')[0]);
        if(keywords.length)parts.push(keywords.slice(0,3).join(', '));
        const text=parts.filter(Boolean).join(', ');
        if(text){mod.value=text;toast('✏️ Стиль добавлен в модификацию');}
      }else if(act==='reanalyze'){
        i2pAnalyze();
      }
    });
  });
}

function i2pHandleFile(file){
  if(!file||!file.type.startsWith('image/')){toast('Это не картинка');return;}
  if(file.size>10*1024*1024){toast('Файл больше 10 MB');return;}
  const r=new FileReader();
  r.onload=e=>i2pSetImage(e.target.result);
  r.onerror=()=>toast('⚠ Не удалось прочитать файл');
  r.readAsDataURL(file);
}

async function i2pGenerate(){
  if(!i2pState.img){toast('Загрузи картинку');return;}
  if(!needKey())return;
  const c=aiCfg();
  if(!/openai|gpt|claude|anthropic|groq/i.test(c.base+c.model)){
    if(!confirm('⚠ Текущая модель может не поддерживать vision (картинки). Рекомендуем gpt-4o, gpt-4o-mini, claude-3-5-sonnet или llama vision. Продолжить?'))return;
  }
  const mode=I2P_MODES.find(x=>x.k===_i2pMode);
  const target=I2P_TARGETS.find(x=>x.k===_i2pTarget);
  const aspect=_i2pAspect;
  const length=document.getElementById('i2pLength').value;
  const mod=document.getElementById('i2pMod').value.trim();
  const wordCount=length==='compact'?'45-60':length==='detailed'?'160-200':'90-110';

  const btn=document.getElementById('i2pGenerate');
  const orig=btn.textContent;btn.disabled=true;btn.textContent='👁 AI смотрит на картинку...';
  const out=document.getElementById('i2pResults');
  if(window.skel)window.skel(out,{stages:['Анализирую композицию','Извлекаю свет и стиль','Генерирую 3 промта'],count:3});
  else out.innerHTML='<div class="sm-result text-sm subtle">⏳ Извлекаю композицию...</div>';

  try{
    const modeInstruction={
      recreate:'RECREATE the image faithfully — same subject, same composition, same lighting, same mood. The prompt should let the AI model produce an image/video that looks as close to the reference as possible.',
      stylize:'EXTRACT the visual STYLE only (lighting, color palette, mood, art style, camera language, atmosphere) and apply it to a NEW subject described by the user modification. If no modification is given, suggest a fitting subject in the same style.',
      extend:'AMPLIFY the cinematic quality of this image. Keep the core subject and composition, but add stronger camera language (specific lens, movement), enhanced lighting (rim light, volumetric god rays), richer mood, and more concrete details to elevate it to a cinema-grade frame.'
    }[_i2pMode];

    const sys=`You are a professional cinematic prompt engineer for AI video/image generation models (Sora, Runway, Kling, DALL·E, Midjourney).

The user provides a REFERENCE IMAGE and wants a ${target.k==='video'?'VIDEO':'STILL IMAGE'} prompt at aspect ratio ${aspect}, length ${wordCount} words.

MODE: ${mode.label} (${_i2pMode}). ${modeInstruction}
${mod?`USER MODIFICATION: "${mod}" — apply this on top of the mode.`:''}
${window.faceLock?`
🔒 FACE-LOCK MODE ENABLED (critical override):
The reference image contains an identifiable person. EVERY variant's prompt_en and prompt_ru MUST explicitly preserve the face 1:1 — identical facial features, skin tone, eye color and shape, nose and lips, hairstyle, hair color, jawline, likeness. Use explicit phrases like "exact same face as reference", "identical facial features", "1:1 likeness preservation", "no face morphing", "reference-accurate portrait" in each prompt_en. This rule OVERRIDES stylization: even in stylize/extend modes, the face stays photorealistic and reference-accurate. Include similar Russian phrases in prompt_ru ("лицо один-в-один как на референсе", "сохранить черты лица полностью", "без искажения лица").`:''}

For each variant build a 10-block cinematic prompt: subject · action · environment · camera angle · lens · lighting · color palette · mood · style · technical specs.

🌐 LANGUAGE RULE
- prompt_en: ENGLISH (for AI models), ${wordCount} words
- prompt_ru: faithful Russian translation, same structure and length, technical terms transliterated or in parentheses

Generate 3 DISTINCT variants:
- v1: closest to the source (faithful)
- v2: alternative interpretation (different camera/lens/angle but same mood)
- v3: bold creative variation (push the style further)

Reply ONLY as JSON:
{
  "description": "1-2 sentences in Russian describing what you see in the image (subject, environment, mood, key visual cues)",
  "extracted": {
    "subject": "main subject (English, short)",
    "lighting": "lighting type (English, short)",
    "palette": "color palette (English, short)",
    "mood": "mood (English, short)",
    "style": "style (English, short)"
  },
  "variants": [
    {"prompt_en":"...","prompt_ru":"...","title":"Russian short title","score":0-100,"why":"Russian 1-line rationale"},
    {"prompt_en":"...","prompt_ru":"...","title":"...","score":...,"why":"..."},
    {"prompt_en":"...","prompt_ru":"...","title":"...","score":...,"why":"..."}
  ]
}`;

    const userMsg='Analyze this reference image and produce the prompts.'+(mod?' User modification: '+mod:'');
    const j=await aiFetchJson(c,'/chat/completions',{
      model:c.model,
      response_format:{type:'json_object'},
      messages:[
        {role:'system',content:sys},
        {role:'user',content:[
          {type:'text',text:userMsg},
          {type:'image_url',image_url:{url:i2pState.img}}
        ]}
      ]
    });
    const txt=j.choices?.[0]?.message?.content;
    if(!txt)throw new Error('Пустой ответ AI');
    const data=JSON.parse(txt);
    assertShape(data,{variants:'array'},'i2pGenerate');
    data.variants.forEach((v,i)=>{
      if(!v.prompt_en&&v.prompt)v.prompt_en=v.prompt;
      if(!v.prompt_ru)v.prompt_ru='';
      assertShape(v,{prompt_en:'string'},'i2p variant['+i+']');
    });
    data.variants.sort((a,b)=>(b.score||0)-(a.score||0));

    const ex=data.extracted||{};
    const exHtml=ex.subject?`
      <div class="mb-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
        <div class="text-[10px] uppercase tracking-wider subtle mb-1">🔍 Что видит AI</div>
        <div class="text-sm flex flex-wrap gap-x-3 gap-y-1">
          ${ex.subject?`<span><b class="text-violet-300">subject:</b> ${ex.subject.replace(/</g,'&lt;')}</span>`:''}
          ${ex.lighting?`<span><b class="text-violet-300">light:</b> ${ex.lighting.replace(/</g,'&lt;')}</span>`:''}
          ${ex.palette?`<span><b class="text-violet-300">palette:</b> ${ex.palette.replace(/</g,'&lt;')}</span>`:''}
          ${ex.mood?`<span><b class="text-violet-300">mood:</b> ${ex.mood.replace(/</g,'&lt;')}</span>`:''}
          ${ex.style?`<span><b class="text-violet-300">style:</b> ${ex.style.replace(/</g,'&lt;')}</span>`:''}
        </div>
      </div>`:'';
    const descHtml=data.description?`<div class="text-xs subtle italic mb-3">💡 ${data.description.replace(/</g,'&lt;')}</div>`:'';

    out.innerHTML=exHtml+descHtml+
      data.variants.map((v,i)=>`
        <div class="sm-result" data-i2pvi="${i}">
          <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-sm">📌 ${(v.title||('Вариант '+(i+1))).replace(/</g,'&lt;')}</span>
              ${typeof v.score==='number'?`<span class="sm-score ${smScoreClass(v.score)}">⭐ ${v.score}/100</span>`:''}
            </div>
            <span class="text-xs subtle">${target.icon} ${aspect} · ${mode.icon} ${mode.label}</span>
          </div>
          ${v.why?`<div class="text-xs subtle italic mb-2">💡 ${v.why.replace(/</g,'&lt;')}</div>`:''}
          <div class="mb-2">
            <div class="text-[10px] uppercase tracking-wider subtle mb-1">🇬🇧 EN — для вставки в Sora/Runway/DALL·E</div>
            <div class="text-sm whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-black/20 border border-white/5">${(v.prompt_en||'').replace(/</g,'&lt;')}</div>
          </div>
          ${v.prompt_ru?`
          <details class="mb-2">
            <summary class="text-[10px] uppercase tracking-wider subtle cursor-pointer hover:text-violet-400">🇷🇺 RU — перевод</summary>
            <div class="text-sm whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-black/10 border border-white/5 mt-2 italic">${v.prompt_ru.replace(/</g,'&lt;')}</div>
          </details>`:''}
          <div class="flex flex-wrap gap-2">
            <button class="soft-btn text-xs px-3 py-1.5" data-i2p-act="copyEn">📋 EN</button>
            ${v.prompt_ru?`<button class="soft-btn text-xs px-3 py-1.5" data-i2p-act="copyRu">📋 RU</button>`:''}
            <button class="soft-btn text-xs px-3 py-1.5" data-i2p-act="image">🖼 Превью</button>
            ${target.k==='video'?`<button class="soft-btn text-xs px-3 py-1.5" data-i2p-act="pro">🎬 → В Pro</button>`:''}
          </div>
        </div>`).join('');

    out.querySelectorAll('.sm-result[data-i2pvi]').forEach(card=>{
      const i=+card.dataset.i2pvi;const v=data.variants[i];
      card.querySelector('[data-i2p-act="copyEn"]').onclick=()=>{navigator.clipboard.writeText(v.prompt_en||'');toast('📋 EN скопирован');};
      const ruBtn=card.querySelector('[data-i2p-act="copyRu"]');
      if(ruBtn)ruBtn.onclick=()=>{navigator.clipboard.writeText(v.prompt_ru||'');toast('📋 RU скопирован');};
      card.querySelector('[data-i2p-act="image"]').onclick=async(e)=>{
        const b=e.currentTarget;const o=b.textContent;b.disabled=true;b.textContent='⏳';
        try{
          const sz=_aspectToImgSize(aspect);
          const urls=await generateImage(v.prompt_en||'',{size:sz});
          if(urls&&urls[0]){
            let prev=card.querySelector('.sm-preview');
            if(!prev){prev=document.createElement('div');prev.className='sm-preview mt-3';card.appendChild(prev);}
            prev.innerHTML=`<img src="${urls[0]}" class="w-full rounded-lg"/><div class="flex gap-2 mt-2"><a href="${urls[0]}" download="i2p-${i+1}.png" class="soft-btn text-xs px-3 py-1.5">⬇ Скачать</a><button class="soft-btn text-xs px-3 py-1.5" onclick="this.closest('.sm-preview').remove()">✕</button></div>`;
          }
        }finally{b.disabled=false;b.textContent=o;}
      };
      const proBtn=card.querySelector('[data-i2p-act="pro"]');
      if(proBtn)proBtn.onclick=()=>{
        setMode('pro');
        const en=v.prompt_en||'';
        setTimeout(()=>{const sub=$('subject');if(sub){sub.value=en.slice(0,200);sub.dispatchEvent(new Event('change'));}const o=$('outEnView');if(o){o.textContent=en;o.dataset.raw=en;}toast('🎛 Открыт в Pro mode');},200);
      };
    });

    // Batch export bar
    const meta={idea:'(image reference)'+(mod?' · '+mod:''),target:target.label,style:mode.label,aspect,extracted:data.extracted||null};
    out.insertAdjacentHTML('beforeend',bxBarHtml('i2p'));
    bxWire(out,'i2p',meta,data.variants);
    // History
    phPush({mode:'i2p',idea:(mod||'(reference image)')+' · '+mode.label,meta,variants:data.variants});

    toast('✨ '+data.variants.length+' вариантов готовы');
  }catch(e){
    logError('i2pGenerate',e);
    out.innerHTML=`<div class="sm-result text-sm text-red-400">⚠ Ошибка: ${e.message.replace(/</g,'&lt;')}<br/><span class="text-xs subtle">Убедись что модель поддерживает vision (gpt-4o-mini, gpt-4o, claude-3-5-sonnet, llama-3.2-vision).</span></div>`;
  }finally{
    btn.disabled=false;btn.textContent=orig;
  }
}

(function initI2pMode(){
  i2pRenderTiles();
  const drop=document.getElementById('i2pDrop');
  const file=document.getElementById('i2pFile');
  const clr=document.getElementById('i2pClear');
  drop?.addEventListener('click',e=>{if(e.target.closest('button'))return;file?.click();});
  let dragDepth=0;
  drop?.addEventListener('dragenter',e=>{e.preventDefault();dragDepth++;drop.classList.add('border-violet-400');});
  drop?.addEventListener('dragover',e=>e.preventDefault());
  drop?.addEventListener('dragleave',()=>{dragDepth=Math.max(0,dragDepth-1);if(dragDepth===0)drop.classList.remove('border-violet-400');});
  drop?.addEventListener('drop',e=>{e.preventDefault();dragDepth=0;drop.classList.remove('border-violet-400');i2pHandleFile(e.dataTransfer.files?.[0]);});
  file?.addEventListener('change',e=>i2pHandleFile(e.target.files?.[0]));
  clr?.addEventListener('click',e=>{e.stopPropagation();i2pSetImage(null);if(file)file.value='';});
  // Paste from clipboard — only when i2p tab is active AND focus is not in a text input
  document.addEventListener('paste',e=>{
    if(document.getElementById('smI2pPanel')?.classList.contains('sm-hidden'))return;
    const tag=(e.target?.tagName||'').toLowerCase();
    if(tag==='input'||tag==='textarea'||e.target?.isContentEditable)return;
    const items=e.clipboardData?.items;if(!items)return;
    for(const it of items){if(it.type&&it.type.startsWith('image/')){const f=it.getAsFile();if(f){e.preventDefault();i2pHandleFile(f);break;}}}
  });
  document.getElementById('i2pGenerate')?.addEventListener('click',i2pGenerate);
  document.getElementById('i2pAnalyzeBtn')?.addEventListener('click',e=>{e.stopPropagation();i2pAnalyze();});
  document.getElementById('i2pRefFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)i2pAddRefFile(f);e.target.value='';});
  // Phase 3 — presets library
  document.getElementById('presetsOpenBtn')?.addEventListener('click',presetsOpen);
  document.getElementById('presetsImportBtn')?.addEventListener('click',()=>document.getElementById('presetsImportFile')?.click());
  document.getElementById('presetsExportBtn')?.addEventListener('click',presetsExport);
  document.getElementById('presetsImportFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)presetsImport(f);e.target.value='';});
  // Toolbar live filters
  document.getElementById('presetsSearch')?.addEventListener('input',_debounce(presetsRender,150));
  document.getElementById('presetsSort')?.addEventListener('change',presetsRender);
  document.getElementById('presetsBlendOnly')?.addEventListener('change',presetsRender);
  // Defer to next tick: lumenPresets const is declared later in the file (TDZ guard)
  setTimeout(()=>{
    try{presetsUpdateCount();}catch(e){console.warn('[presets] count init defer',e);}
    // Auto-restore last analysis if present
    try{i2pRestore();}catch(e){console.warn('[i2p restore] init',e);}
    // Sync footer version with current LUMEN_VERSION
    try{
      const fv=document.getElementById('footerVer');
      if(fv&&window.LUMEN_VERSION)fv.textContent='v'+window.LUMEN_VERSION;
    }catch(e){}
  },0);
  document.getElementById('phOpenBtnI2p')?.addEventListener('click',()=>phToggle(true));
})();

try{
  CMDS.push({n:'🔍 Img→Prompt (картинка → промт)',h:()=>{setMode('simple');smSetTab('i2p');}});
  CMDS.push({n:'📚 Библиотека стилей (пресеты)',h:()=>{setMode('simple');smSetTab('i2p');setTimeout(presetsOpen,100);}});
}catch(e){console.debug(e)}