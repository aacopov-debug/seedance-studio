/* ============================================================
   LUMEN — PHOTO → STORYBOARD v15.12
   Upload one photo → AI vision analyzes it → button synthesizes
   6 different camera-angle prompts FROM that single image →
   one click writes them into the multi-shot table as a storyboard.

   Pipeline:
   1. Open modal, pick image
   2. AI Vision analyzes the photo (single multimodal call)
      → returns subject/scene/lighting/mood/style + 6 shot angles
   3. Each angle is rendered as a card with EN prompt + camera + duration
   4. Click "Применить как раскадровку" → fills multi-shot table

   Dependencies (globals from app.js / tier2.js):
     - $, toast, needKey, aiCall, aiFetchJson, aiCfg
     - addShot, shotsEl
     - generate (regenerate full prompt after applying)
   Exposes: window.openPhotoStoryboard()
   ============================================================ */
(function(){
  if(typeof $==='undefined'||typeof aiCall==='undefined'){
    console.warn('[photo_storyboard] core helpers missing — module disabled');
    return;
  }

  const ANGLES=[
    {key:'establishing',ru:'Establishing wide',hint:'общий план, представить локацию и контекст',duration:'4s'},
    {key:'medium',       ru:'Medium shot',     hint:'средний план, субъект по пояс',           duration:'3s'},
    {key:'closeup',      ru:'Close-up',        hint:'крупный план — лицо, руки, эмоция',       duration:'2s'},
    {key:'ots',          ru:'Over-the-shoulder',hint:'из-за плеча, передаёт POV',              duration:'3s'},
    {key:'low_angle',    ru:'Low angle hero',  hint:'низкая точка, монументальность',          duration:'3s'},
    {key:'detail',       ru:'Insert / detail', hint:'деталь окружения, текстура, объект',      duration:'2s'}
  ];

  /* =========================================================
     MODAL
     ========================================================= */
  const modal=document.createElement('div');
  modal.id='photoStoryModal';
  modal.className='hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4';
  modal.innerHTML=`<div class="glass rounded-2xl p-5 max-w-5xl w-full max-h-[92vh] overflow-auto">
    <div class="flex items-center justify-between mb-3 gap-3">
      <div class="flex items-center gap-2">
        <div class="text-lg font-semibold">🎬 Photo → Storyboard</div>
        <span class="text-xs subtle">из одного фото — раскадровка в 6 ракурсах</span>
      </div>
      <button id="psbClose" class="soft-btn text-xs px-2 py-1" title="Escape">✕</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- LEFT: upload + preview -->
      <div>
        <div id="psbDrop" class="rounded-xl border-2 border-dashed border-white/15 p-6 text-center cursor-pointer hover:border-violet-400 transition-colors min-h-[260px] flex items-center justify-center bg-black/20">
          <div id="psbDropEmpty">
            <div class="text-3xl mb-2">📷</div>
            <div class="text-sm font-semibold mb-1">Загрузи фото</div>
            <div class="text-[11px] subtle">drag & drop · клик · Ctrl+V</div>
            <div class="text-[10px] subtle mt-2">JPG / PNG до 10 MB</div>
          </div>
          <img id="psbPreview" class="max-w-full max-h-[400px] rounded-lg hidden" />
        </div>
        <input type="file" id="psbFile" accept="image/*" class="hidden" />
        <div class="flex gap-2 mt-3">
          <button id="psbAnalyze" class="btn-primary px-4 py-2 rounded-lg text-sm flex-1" disabled>🔬 Анализ + 6 ракурсов</button>
          <button id="psbReset" class="soft-btn px-3 py-2 text-sm hidden" title="Сбросить">🗑</button>
        </div>
        <div id="psbStatus" class="text-xs subtle mt-2"></div>
      </div>

      <!-- RIGHT: analysis + angles -->
      <div>
        <div id="psbAnalysis" class="text-xs"></div>
        <div id="psbAngles" class="space-y-2 mt-3"></div>
        <div class="flex gap-2 mt-4">
          <button id="psbApply" class="btn-primary px-4 py-2 rounded-lg text-sm flex-1 hidden">✅ Применить как раскадровку (multi-shot)</button>
        </div>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);

  $('psbClose').onclick=()=>modal.classList.add('hidden');
  modal.onclick=e=>{if(e.target===modal)modal.classList.add('hidden');};

  /* =========================================================
     STATE
     ========================================================= */
  const S={img:null,result:null};

  function setImage(dataUrl){
    S.img=dataUrl;S.result=null;
    const empty=$('psbDropEmpty'),prev=$('psbPreview'),analyze=$('psbAnalyze'),reset=$('psbReset');
    if(dataUrl){
      empty.classList.add('hidden');
      prev.src=dataUrl;prev.classList.remove('hidden');
      analyze.disabled=false;
      reset.classList.remove('hidden');
    }else{
      empty.classList.remove('hidden');
      prev.src='';prev.classList.add('hidden');
      analyze.disabled=true;
      reset.classList.add('hidden');
    }
    $('psbAnalysis').innerHTML='';
    $('psbAngles').innerHTML='';
    $('psbApply').classList.add('hidden');
    $('psbStatus').textContent='';
  }

  /* =========================================================
     UPLOAD HANDLERS
     ========================================================= */
  function handleFile(file){
    if(!file||!file.type.startsWith('image/')){toast('Это не картинка');return;}
    if(file.size>10*1024*1024){toast('Файл больше 10 MB');return;}
    const r=new FileReader();
    r.onload=e=>setImage(e.target.result);
    r.onerror=()=>toast('⚠ Не удалось прочитать файл');
    r.readAsDataURL(file);
  }
  $('psbFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(f)handleFile(f);e.target.value='';});
  $('psbDrop').addEventListener('click',e=>{if(e.target.id==='psbReset')return;$('psbFile').click();});
  $('psbDrop').addEventListener('dragover',e=>{e.preventDefault();$('psbDrop').classList.add('border-violet-400');});
  $('psbDrop').addEventListener('dragleave',()=>$('psbDrop').classList.remove('border-violet-400'));
  $('psbDrop').addEventListener('drop',e=>{e.preventDefault();$('psbDrop').classList.remove('border-violet-400');handleFile(e.dataTransfer.files?.[0]);});
  $('psbReset').onclick=e=>{e.stopPropagation();setImage(null);};
  /* Paste from clipboard while modal open */
  document.addEventListener('paste',e=>{
    if(modal.classList.contains('hidden'))return;
    const items=e.clipboardData?.items;if(!items)return;
    for(const it of items){if(it.type?.startsWith('image/')){const f=it.getAsFile();if(f){e.preventDefault();handleFile(f);break;}}}
  });

  /* =========================================================
     IMAGE DOWNSCALE (reuse pattern from i2p.js)
     ========================================================= */
  function downscale(dataUrl,maxSide=1280,quality=0.85){
    return new Promise((res,rej)=>{
      const img=new Image();
      img.onload=()=>{
        try{
          let{width:w,height:h}=img;
          const k=Math.max(w,h)>maxSide?maxSide/Math.max(w,h):1;
          w=Math.round(w*k);h=Math.round(h*k);
          const cv=document.createElement('canvas');cv.width=w;cv.height=h;
          cv.getContext('2d').drawImage(img,0,0,w,h);
          res(cv.toDataURL('image/jpeg',quality));
        }catch(e){rej(e);}
      };
      img.onerror=()=>rej(new Error('decode failed'));
      img.src=dataUrl;
    });
  }

  /* =========================================================
     AI ANALYSIS + 6 ANGLES (single multimodal call)
     ========================================================= */
  $('psbAnalyze').onclick=async()=>{
    if(!S.img){toast('Загрузи фото');return;}
    if(!needKey())return;
    const btn=$('psbAnalyze'),status=$('psbStatus');
    const o=btn.innerHTML;btn.innerHTML='⏳ AI смотрит...';btn.disabled=true;
    status.textContent='🗜 Сжимаю изображение...';

    let small;
    try{small=await downscale(S.img,1280,0.85);}
    catch(e){status.textContent='❌ '+e.message;btn.innerHTML=o;btn.disabled=false;return;}

    status.textContent='🧠 AI анализирует кадр и проектирует 6 ракурсов...';

    const sys=`You are a professional director and storyboard artist. The user provides ONE reference photo. Your task: analyze it AND synthesize a 6-shot storyboard exploring the SAME subject and scene from 6 different camera angles.

The 6 angles are FIXED (do not change the order or names):
${ANGLES.map((a,i)=>`${i+1}. ${a.key} — ${a.ru} (${a.hint})`).join('\n')}

For each angle write a SELF-CONTAINED cinematic English prompt suitable for Sora/Runway/Kling/Veo (90-130 words each). Each prompt must:
- preserve the subject and overall mood from the photo
- explicitly describe the camera angle, framing, lens (mm), and any motion
- include lighting, palette, and atmosphere consistent with the photo
- describe a small action in time so it works as a video shot

Reply ONLY as JSON:
{
  "analysis": {
    "subject": "<main subject in cinematic English>",
    "scene": "<location and environment>",
    "lighting": "<lighting type, direction, color temp>",
    "palette": "<color palette / grading>",
    "mood": "<emotional tone>",
    "style": "<visual style: cinematic, documentary, anime, surreal, etc>"
  },
  "shots": [
    ${ANGLES.map(a=>`{"angle":"${a.key}","duration":"${a.duration}","camera":"<camera language: angle + lens + movement>","action":"<what happens, 1-2 short sentences>","prompt_en":"<full self-contained 90-130 word cinematic English prompt for this angle>","transition":"cut|dissolve|match cut|smash cut"}`).join(',\n    ')}
  ]
}

The shots array MUST have exactly ${ANGLES.length} items, in the order listed above.`;

    const userContent=[
      {type:'text',text:'Analyze this reference photo and produce the 6-angle storyboard JSON. The reference defines the subject, scene, mood, lighting, and palette — every shot must keep them consistent.'},
      {type:'image_url',image_url:{url:small,detail:'high'}}
    ];

    let out;
    try{
      out=await aiCall([
        {role:'system',content:sys},
        {role:'user',content:userContent}
      ],{json:true});
    }catch(e){status.textContent='❌ '+e.message;btn.innerHTML=o;btn.disabled=false;return;}

    btn.innerHTML=o;btn.disabled=false;
    if(!out){status.textContent='❌ AI вернул пустой ответ';return;}

    let d;
    try{d=JSON.parse(out);}
    catch(e){status.textContent='❌ JSON parse: '+e.message;console.debug(out);return;}

    if(!d.analysis||!Array.isArray(d.shots)||d.shots.length===0){
      status.textContent='❌ AI не вернул shots';return;
    }
    S.result=d;
    renderResult(d);
    status.textContent=`✅ Готово · ${d.shots.length} ракурсов синтезированы`;
  };

  /* =========================================================
     RENDER RESULT
     ========================================================= */
  function renderResult(d){
    const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const a=d.analysis||{};
    $('psbAnalysis').innerHTML=`<div class="rounded-lg p-3 bg-violet-500/10 border border-violet-500/30 mb-2">
      <div class="text-[10px] uppercase tracking-wider subtle mb-1">🔍 Что видит AI</div>
      <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <div><b class="text-violet-300">Subject:</b> ${esc(a.subject)}</div>
        <div><b class="text-violet-300">Scene:</b> ${esc(a.scene)}</div>
        <div><b class="text-violet-300">Lighting:</b> ${esc(a.lighting)}</div>
        <div><b class="text-violet-300">Palette:</b> ${esc(a.palette)}</div>
        <div><b class="text-violet-300">Mood:</b> ${esc(a.mood)}</div>
        <div><b class="text-violet-300">Style:</b> ${esc(a.style)}</div>
      </div>
    </div>`;

    $('psbAngles').innerHTML=d.shots.map((sh,i)=>{
      const ang=ANGLES.find(x=>x.key===sh.angle)||{ru:sh.angle,hint:''};
      return `<div class="rounded-lg p-3 bg-black/20 border border-white/10" data-shot-idx="${i}">
        <div class="flex items-start justify-between gap-2 mb-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-violet-300">#${i+1}</span>
            <span class="font-semibold text-sm">${esc(ang.ru)}</span>
            <span class="text-[10px] subtle">· ${esc(sh.duration||ang.duration)} · ${esc(sh.transition||'cut')}</span>
          </div>
          <button class="soft-btn text-[10px] px-2 py-0.5" data-copy>📋 EN</button>
        </div>
        <div class="text-[10.5px] subtle italic mb-2">🎥 ${esc(sh.camera)}</div>
        <div class="text-[10.5px] mb-2">▸ ${esc(sh.action)}</div>
        <details class="mt-1">
          <summary class="text-[10px] uppercase tracking-wider subtle cursor-pointer hover:text-violet-400">Полный EN-промт</summary>
          <div class="text-[11px] whitespace-pre-wrap leading-relaxed p-2 mt-1 rounded bg-black/30 border border-white/5">${esc(sh.prompt_en)}</div>
        </details>
      </div>`;
    }).join('');

    /* Copy buttons */
    $('psbAngles').querySelectorAll('[data-copy]').forEach(b=>{
      b.onclick=e=>{
        e.stopPropagation();
        const i=+b.closest('[data-shot-idx]').dataset.shotIdx;
        navigator.clipboard.writeText(d.shots[i].prompt_en||'').then(()=>{
          const o=b.textContent;b.textContent='✓';setTimeout(()=>b.textContent=o,1200);
          toast('📋 Промт #'+(i+1)+' скопирован');
        });
      };
    });

    $('psbApply').classList.remove('hidden');
  }

  /* =========================================================
     APPLY TO MULTI-SHOT TABLE
     ========================================================= */
  $('psbApply').onclick=()=>{
    if(!S.result?.shots)return;
    if(typeof addShot!=='function'||typeof shotsEl==='undefined'){
      toast('Multi-shot не доступен на этой странице');return;
    }
    const a=S.result.analysis||{};
    /* Fill main fields from analysis (only if empty, not to clobber user data) */
    const fill=(id,val)=>{const el=$(id);if(el&&!el.value.trim()&&val)el.value=val;};
    fill('subject',a.subject);
    fill('scene',a.scene);
    fill('lighting',a.lighting);
    fill('palette',a.palette);
    fill('mood',a.mood);
    fill('style',a.style);

    /* Replace multi-shot table */
    shotsEl.innerHTML='';
    S.result.shots.forEach(sh=>{
      addShot(sh.duration||'3s', sh.camera||'medium shot', sh.action||sh.prompt_en?.slice(0,160)||'', sh.transition||'cut','');
    });
    const useShots=$('useShots');
    if(useShots&&!useShots.checked){useShots.checked=true;useShots.dispatchEvent(new Event('change',{bubbles:true}));}

    modal.classList.add('hidden');
    try{generate();}catch(e){}
    toast('🎬 Раскадровка из '+S.result.shots.length+' шотов применена');
  };

  /* =========================================================
     PUBLIC ENTRY POINT
     ========================================================= */
  window.openPhotoStoryboard=()=>{
    modal.classList.remove('hidden');
    /* Reset state if user reopens */
    if(!S.img)setImage(null);
  };

  /* =========================================================
     COMMAND PALETTE
     ========================================================= */
  try{
    if(typeof CMDS!=='undefined'){
      CMDS.push({n:'🎬 Photo → Storyboard (фото → раскадровка)',h:()=>window.openPhotoStoryboard()});
    }
  }catch(e){}

  console.log('%c[Lumen v15.12] Photo → Storyboard ready · '+ANGLES.length+' angles','color:#a78bfa');
})();
