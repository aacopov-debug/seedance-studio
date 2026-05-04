/* ============================================================
   LUMEN — TIER 2 AI ENHANCEMENTS v15.9
   1. 🎵 Audio Prompt Generator   — parallel prompts for Suno / ElevenLabs / MMAudio
   2. 🎭 Dialogue Writer          — AI writes character lines for dialogue field
   3. 🎞 Reference Video Analyzer — drop MP4 → extract 6 frames → AI builds multi-shot
   4. 📸 Auto Mood-board          — 4-grid stylistic variations via DALL-E
   5. 💡 AI Cinematographer       — detailed lighting setup with refs

   Dependencies (globals from app.js):
     - $, v, toast, needKey, aiCall, aiCfg, aiFetchJson, generateImage
     - addShot, shotsEl, renderEn, pushHist
     - bus (event bus)
   Loaded AFTER app.js so all helpers exist.
   ============================================================ */
(function(){
  if(typeof aiCall==='undefined'||typeof $==='undefined'){
    console.warn('[tier2] core helpers missing — module disabled');
    return;
  }

  /* ============================================================
     1. AUDIO PROMPT GENERATOR
     Generates parallel audio prompts for music & SFX models.
     ============================================================ */
  const audioBtn=document.createElement('button');
  audioBtn.className="soft-btn text-xs px-3 py-1.5";
  audioBtn.innerHTML='🎵 Audio';
  audioBtn.title='Сгенерировать параллельные промты для Suno (музыка), ElevenLabs (SFX/ambient) и Voice direction (для lip-sync)';
  $('aiReverseBtn').parentElement.appendChild(audioBtn);

  /* Modal for audio results */
  const audioModal=document.createElement('div');
  audioModal.id='audioModal';
  audioModal.className='hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4';
  audioModal.innerHTML=`<div class="glass rounded-2xl p-5 max-w-3xl w-full max-h-[85vh] overflow-auto">
    <div class="flex items-center justify-between mb-3">
      <div class="text-base font-semibold">🎵 Параллельные аудио-промты</div>
      <button id="audioClose" class="soft-btn text-xs px-2 py-1">✕</button>
    </div>
    <div class="text-xs subtle mb-3">Скопируй нужный промт → вставь в Suno / ElevenLabs / MMAudio для генерации звука к видео.</div>
    <div id="audioBody" class="space-y-3"></div>
  </div>`;
  document.body.appendChild(audioModal);
  $('audioClose').onclick=()=>audioModal.classList.add('hidden');
  audioModal.onclick=e=>{if(e.target===audioModal)audioModal.classList.add('hidden');};

  audioBtn.onclick=async()=>{
    if(!needKey())return;
    const en=$('outEnView').dataset.raw||'';
    if(!en){toast('Сначала сгенерируй промт');return;}
    const o=audioBtn.innerHTML;audioBtn.innerHTML='⏳';audioBtn.disabled=true;
    const sys=`You generate parallel audio prompts for a video. Given a video prompt, produce three audio descriptions matching its mood and scene.

Reply ONLY as JSON:
{
  "music": {
    "suno_prompt": "<one-line Suno-format prompt: genre, BPM, instruments, mood, era>",
    "style": "<short style label>",
    "bpm": <number 60-180>,
    "key": "<musical key>",
    "duration_s": <integer matching video duration>
  },
  "sfx": {
    "ambient": "<ambient sound layer for the whole clip, ElevenLabs-style description>",
    "events": ["<discrete sound event 1>", "<discrete sound event 2>", "<event 3>"]
  },
  "voice": {
    "direction": "<voice acting direction for any dialogue: tone, pace, emotion, accent>",
    "lip_sync_hint": "<one short tip for lip-sync alignment>"
  }
}

Music suno_prompt example: "dark synthwave, 95 bpm, analog pads, distant 808 sub, melancholic, 1986 retro-futuristic". Make it cinematic, executable.`;
    const out=await aiCall([{role:'system',content:sys},{role:'user',content:en}],{json:true});
    audioBtn.innerHTML=o;audioBtn.disabled=false;
    if(!out){toast('AI не ответил');return;}
    try{
      const d=JSON.parse(out);
      const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const block=(title,content,copy)=>`<div class="rounded-lg p-3 bg-black/20 border border-white/10">
        <div class="flex items-center justify-between mb-2">
          <div class="font-semibold text-sm">${title}</div>
          <button class="soft-btn text-[10px] px-2 py-0.5" onclick="navigator.clipboard.writeText(${JSON.stringify(copy)});toast('📋 скопировано')">📋 copy</button>
        </div>
        <div class="text-xs subtle leading-relaxed">${content}</div>
      </div>`;
      const events=(d.sfx?.events||[]).map(e=>`• ${esc(e)}`).join('<br>');
      $('audioBody').innerHTML=
        block('🎼 Music (Suno)',
          `<div><b>Prompt:</b> ${esc(d.music?.suno_prompt)}</div>
           <div class="mt-1"><b>BPM:</b> ${esc(d.music?.bpm)} · <b>Key:</b> ${esc(d.music?.key)} · <b>Duration:</b> ${esc(d.music?.duration_s)}s</div>`,
          d.music?.suno_prompt||'')+
        block('🔊 Ambient + SFX (ElevenLabs / MMAudio)',
          `<div><b>Ambient layer:</b> ${esc(d.sfx?.ambient)}</div>
           <div class="mt-1"><b>Events:</b><br>${events}</div>`,
          (d.sfx?.ambient||'')+'\n\nEvents:\n'+(d.sfx?.events||[]).map(e=>'- '+e).join('\n'))+
        block('🎤 Voice direction',
          `<div><b>Direction:</b> ${esc(d.voice?.direction)}</div>
           <div class="mt-1"><b>Lip-sync:</b> ${esc(d.voice?.lip_sync_hint)}</div>`,
          (d.voice?.direction||'')+'\n\nLip-sync: '+(d.voice?.lip_sync_hint||''));
      audioModal.classList.remove('hidden');
    }catch(e){toast('JSON err');console.debug(e);}
  };

  /* ============================================================
     2. DIALOGUE WRITER
     ============================================================ */
  const dlgBtn=document.createElement('button');
  dlgBtn.className="soft-btn text-xs px-3 py-1.5";
  dlgBtn.innerHTML='🎭 Dialogue';
  dlgBtn.title='AI напишет реплики персонажа для текущей сцены (учитывает character/subject/action/mood)';
  /* Insert near aiReverseBtn toolbar */
  $('aiReverseBtn').parentElement.appendChild(dlgBtn);
  dlgBtn.onclick=async()=>{
    if(!needKey())return;
    const ctx={
      subject:v('subject'),
      character:v('character'),
      action:v('action'),
      scene:v('scene'),
      mood:v('mood'),
      time:v('time'),
      duration:v('duration')
    };
    if(!ctx.subject&&!ctx.character){toast('Заполни Subject или Character');return;}
    const o=dlgBtn.innerHTML;dlgBtn.innerHTML='⏳';dlgBtn.disabled=true;
    const sys=`You are a screenwriter writing 1-3 lines of dialogue for a short cinematic video clip.

Format for video AI models (Sora, Veo, Kling): "[character_descriptor speaking_action]: \\"line\\""
Example: [woman whispers softly]: "I shouldn't be here." 

Rules:
- Match the mood and scene context provided.
- Make lines feel cinematic, not exposition-heavy. Show, don't tell.
- Total length must fit the duration provided (rough rule: ~3 words per second of video).
- Return 1-3 lines max.
- Use natural delivery cues in brackets that lip-sync models can interpret: whispers, shouts, laughs, sighs, pauses.

Reply ONLY with the dialogue lines, one per line, no commentary.`;
    const user=`Context:
- Character: ${ctx.character||ctx.subject}
- Action: ${ctx.action||'(none)'}
- Scene: ${ctx.scene||'(none)'}
- Mood: ${ctx.mood||'(neutral)'}
- Duration: ${ctx.duration||'5s'}`;
    const out=await aiCall([{role:'system',content:sys},{role:'user',content:user}]);
    dlgBtn.innerHTML=o;dlgBtn.disabled=false;
    if(!out){toast('AI не ответил');return;}
    const cleaned=out.trim().replace(/^["']|["']$/g,'');
    const dlgField=$('dialogue');
    if(dlgField){
      const cur=dlgField.value.trim();
      dlgField.value=cur?cur+'\n'+cleaned:cleaned;
      dlgField.dispatchEvent(new Event('input',{bubbles:true}));
      try{generate();}catch(e){}
      toast('🎭 Реплики добавлены в Dialogue');
    }else{
      alert('Dialogue:\n\n'+cleaned);
    }
  };

  /* ============================================================
     3. REFERENCE VIDEO ANALYZER
     Drop MP4 → extract 6 frames → multi-image vision → fill multi-shot
     ============================================================ */
  const refVidBtn=document.createElement('button');
  refVidBtn.className="soft-btn text-xs px-3 py-1.5";
  refVidBtn.innerHTML='🎞 Reference video';
  refVidBtn.title='Загрузи короткое видео — AI извлечёт 6 кадров и составит multi-shot раскадровку';
  $('aiReverseBtn').parentElement.appendChild(refVidBtn);

  /* Hidden file input */
  const refInput=document.createElement('input');
  refInput.type='file';refInput.accept='video/*';refInput.style.display='none';
  document.body.appendChild(refInput);
  refVidBtn.onclick=()=>refInput.click();

  /* Modal for results */
  const refModal=document.createElement('div');
  refModal.id='refModal';
  refModal.className='hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4';
  refModal.innerHTML=`<div class="glass rounded-2xl p-5 max-w-4xl w-full max-h-[90vh] overflow-auto">
    <div class="flex items-center justify-between mb-3">
      <div class="text-base font-semibold">🎞 Анализ референс-видео</div>
      <button id="refClose" class="soft-btn text-xs px-2 py-1">✕</button>
    </div>
    <div id="refStatus" class="text-xs subtle mb-3"></div>
    <div id="refFrames" class="grid grid-cols-6 gap-1 mb-3"></div>
    <div id="refResult" class="text-xs"></div>
    <div class="flex gap-2 mt-4">
      <button id="refApply" class="btn-primary px-4 py-2 rounded-lg text-sm hidden">✅ Применить (заполнить multi-shot)</button>
      <button id="refClose2" class="soft-btn px-4 py-2 text-sm">Закрыть</button>
    </div>
  </div>`;
  document.body.appendChild(refModal);
  $('refClose').onclick=$('refClose2').onclick=()=>refModal.classList.add('hidden');
  refModal.onclick=e=>{if(e.target===refModal)refModal.classList.add('hidden');};

  let _refAnalysis=null;

  refInput.onchange=async()=>{
    const file=refInput.files?.[0];
    if(!file){return;}
    if(!needKey()){return;}
    refModal.classList.remove('hidden');
    const status=$('refStatus'),framesEl=$('refFrames'),resultEl=$('refResult'),applyBtn=$('refApply');
    status.textContent='📂 Загружаю видео...';framesEl.innerHTML='';resultEl.innerHTML='';applyBtn.classList.add('hidden');
    _refAnalysis=null;

    /* Extract 6 frames */
    const url=URL.createObjectURL(file);
    const video=document.createElement('video');
    video.src=url;video.crossOrigin='anonymous';video.muted=true;video.playsInline=true;
    try{
      await new Promise((res,rej)=>{
        video.onloadedmetadata=res;
        video.onerror=()=>rej(new Error('не могу прочитать видео'));
        setTimeout(()=>rej(new Error('timeout loadedmetadata')),10000);
      });
    }catch(e){status.textContent='❌ '+e.message;URL.revokeObjectURL(url);return;}

    const dur=video.duration;
    if(!isFinite(dur)||dur<=0){status.textContent='❌ Невалидная длительность';URL.revokeObjectURL(url);return;}
    const N=6;
    const times=Array.from({length:N},(_,i)=>(dur*(i+0.5))/N);
    status.textContent=`🎞 Извлекаю ${N} кадров из ${dur.toFixed(1)}с...`;

    /* Capture canvas size: scale max width 640 to keep base64 reasonable */
    const W=Math.min(video.videoWidth||640,640);
    const H=Math.round(W*(video.videoHeight||360)/(video.videoWidth||640));
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const cx=cv.getContext('2d');
    const frames=[];
    for(let i=0;i<times.length;i++){
      try{
        await new Promise((res,rej)=>{
          video.onseeked=res;
          video.onerror=()=>rej(new Error('seek failed'));
          video.currentTime=times[i];
          setTimeout(()=>rej(new Error('seek timeout')),5000);
        });
        cx.drawImage(video,0,0,W,H);
        const dataUrl=cv.toDataURL('image/jpeg',0.7);
        frames.push({t:times[i],url:dataUrl});
        const img=document.createElement('img');
        img.src=dataUrl;img.className='w-full rounded';img.title=`t=${times[i].toFixed(1)}s`;
        framesEl.appendChild(img);
        status.textContent=`🎞 Кадр ${i+1}/${N} извлечён...`;
      }catch(e){status.textContent='❌ '+e.message;URL.revokeObjectURL(url);return;}
    }
    URL.revokeObjectURL(url);

    /* Send all 6 frames to vision AI */
    status.textContent='🧠 AI анализирует кадры...';
    const sys=`You are a film analyst. You will receive ${N} video frames sampled evenly through a short clip. Analyze them and produce:
1. A description of the OVERALL scene, subject, action, lighting, palette, mood, style.
2. A SHOT LIST — one logical shot per frame group. Some adjacent frames may belong to the same shot if they look similar.

Reply ONLY as JSON:
{
  "subject": "<main subject of the clip in cinematic English, 1 sentence>",
  "scene": "<location & environment, 1 sentence>",
  "lighting": "<lighting description: type, direction, color temp>",
  "palette": "<color grading / palette>",
  "mood": "<emotional mood>",
  "style": "<visual style: cinematic, anime, documentary, surreal, etc>",
  "shots": [
    {"dur": "<seconds with s suffix, e.g. 3s>", "cam": "<camera language: wide shot, dolly in, etc>", "act": "<what happens in this shot>", "tr": "cut|dissolve|match cut|smash cut|fade to black"}
  ]
}

Generate 3-6 shots. Sum of durations should approximate ${dur.toFixed(0)}s.`;
    const userContent=[
      {type:'text',text:`Analyze these ${N} frames sampled from a ${dur.toFixed(1)}s video. Frame timestamps in seconds: ${times.map(t=>t.toFixed(1)).join(', ')}.`}
    ];
    frames.forEach((f,i)=>{
      userContent.push({type:'text',text:`Frame ${i+1} (t=${f.t.toFixed(1)}s):`});
      userContent.push({type:'image_url',image_url:{url:f.url,detail:'low'}});
    });
    const out=await aiCall([{role:'system',content:sys},{role:'user',content:userContent}],{json:true});
    if(!out){status.textContent='❌ AI не ответил';return;}
    try{
      const d=JSON.parse(out);
      _refAnalysis=d;
      const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
      const shotsHtml=(d.shots||[]).map((s,i)=>`<tr>
        <td class="px-2 py-1">#${i+1}</td>
        <td class="px-2 py-1">${esc(s.dur)}</td>
        <td class="px-2 py-1">${esc(s.cam)}</td>
        <td class="px-2 py-1">${esc(s.act)}</td>
        <td class="px-2 py-1">${esc(s.tr)}</td>
      </tr>`).join('');
      resultEl.innerHTML=`
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div><b>🎬 Subject:</b> ${esc(d.subject)}</div>
          <div><b>🌆 Scene:</b> ${esc(d.scene)}</div>
          <div><b>💡 Lighting:</b> ${esc(d.lighting)}</div>
          <div><b>🎨 Palette:</b> ${esc(d.palette)}</div>
          <div><b>😶 Mood:</b> ${esc(d.mood)}</div>
          <div><b>✨ Style:</b> ${esc(d.style)}</div>
        </div>
        <div class="font-semibold mb-1">📋 Shot list (${(d.shots||[]).length} шотов):</div>
        <table class="w-full text-[11px] border border-white/10 rounded">
          <thead><tr class="bg-white/5"><th class="px-2 py-1">#</th><th>Dur</th><th>Camera</th><th>Action</th><th>Transition</th></tr></thead>
          <tbody>${shotsHtml}</tbody>
        </table>`;
      status.textContent=`✅ Готово · извлечено ${frames.length} кадров, ${(d.shots||[]).length} шотов`;
      applyBtn.classList.remove('hidden');
    }catch(e){status.textContent='❌ JSON err: '+e.message;}
    /* Reset for repeated use */
    refInput.value='';
  };

  $('refApply').onclick=()=>{
    if(!_refAnalysis)return;
    const d=_refAnalysis;
    /* Fill main fields */
    if(d.subject)$('subject').value=d.subject;
    if(d.scene)$('scene').value=d.scene;
    if(d.lighting)$('lighting').value=d.lighting;
    if(d.palette)$('palette').value=d.palette;
    if(d.mood)$('mood').value=d.mood;
    if(d.style)$('style').value=d.style;
    /* Fill multi-shot table */
    if(typeof shotsEl!=='undefined'&&Array.isArray(d.shots)&&d.shots.length){
      shotsEl.innerHTML='';
      d.shots.forEach(s=>{
        if(typeof addShot==='function')addShot(s.dur||'3s',s.cam||'medium shot',s.act||'',s.tr||'cut','');
      });
      const useShots=$('useShots');if(useShots&&!useShots.checked){useShots.checked=true;useShots.dispatchEvent(new Event('change',{bubbles:true}));}
    }
    refModal.classList.add('hidden');
    try{generate();}catch(e){}
    toast('🎞 Применено · multi-shot заполнен');
  };

  /* ============================================================
     4. AUTO MOOD-BOARD (4-grid DALL-E)
     ============================================================ */
  const moodBtn=document.createElement('button');
  moodBtn.className="soft-btn text-xs px-3 py-1.5";
  moodBtn.innerHTML='📸 Mood-board';
  moodBtn.title='Сгенерировать 4 стилистических варианта первого кадра через DALL·E (4× стоимость одного preview)';
  $('aiReverseBtn').parentElement.appendChild(moodBtn);

  const moodModal=document.createElement('div');
  moodModal.id='moodModal';
  moodModal.className='hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4';
  moodModal.innerHTML=`<div class="glass rounded-2xl p-5 max-w-4xl w-full max-h-[90vh] overflow-auto">
    <div class="flex items-center justify-between mb-3">
      <div class="text-base font-semibold">📸 Mood-board (4 варианта)</div>
      <button id="moodClose" class="soft-btn text-xs px-2 py-1">✕</button>
    </div>
    <div class="text-xs subtle mb-3">4 стилистических интерпретации одной идеи. Выбери понравившийся → описание подставится в форму.</div>
    <div id="moodGrid" class="grid grid-cols-2 gap-2"></div>
  </div>`;
  document.body.appendChild(moodModal);
  $('moodClose').onclick=()=>moodModal.classList.add('hidden');
  moodModal.onclick=e=>{if(e.target===moodModal)moodModal.classList.add('hidden');};

  const MOOD_VARIANTS=[
    {label:'☀ Bright/Optimistic',cue:'bright golden hour sunlight, warm pastel palette, optimistic mood, soft glow'},
    {label:'🌙 Dark/Melancholic',cue:'low-key chiaroscuro lighting, deep shadows, muted desaturated palette, melancholic mood'},
    {label:'⚡ High-contrast cinematic',cue:'high-contrast teal and orange grade, dramatic rim light, cinematic gloss, anamorphic lens flares'},
    {label:'🎨 Stylized/Surreal',cue:'painterly illustration style, surreal magical realism, bold saturated colors, dreamlike atmosphere'}
  ];

  moodBtn.onclick=async()=>{
    if(!needKey())return;
    if(typeof generateImage!=='function'){toast('generateImage недоступна');return;}
    const en=$('outEnView').dataset.raw||'';
    if(!en){toast('Сначала сгенерируй промт');return;}
    const o=moodBtn.innerHTML;moodBtn.innerHTML='⏳ 0/4';moodBtn.disabled=true;
    moodModal.classList.remove('hidden');
    const grid=$('moodGrid');grid.innerHTML='';
    const cards=MOOD_VARIANTS.map((variant,i)=>{
      const card=document.createElement('div');
      card.className='rounded-lg overflow-hidden bg-black/30 border border-white/10';
      card.innerHTML=`<div class="aspect-video grid place-items-center text-xs subtle p-3 text-center">⏳ ${variant.label}<br><span class="text-[10px] opacity-50">${variant.cue.slice(0,50)}...</span></div>`;
      grid.appendChild(card);
      return card;
    });
    const aspect=v('aspect')||'16:9';
    const size=aspect==='9:16'?'1024x1792':aspect==='1:1'?'1024x1024':'1792x1024';
    const baseStill=en.split('\n')[0];
    let done=0;
    await Promise.all(MOOD_VARIANTS.map(async(variant,i)=>{
      try{
        const stylized=baseStill+', '+variant.cue+', single still cinematic frame';
        const urls=await generateImage(stylized,{size,n:1});
        const url=urls&&urls[0];
        done++;moodBtn.innerHTML=`⏳ ${done}/4`;
        if(url){
          cards[i].innerHTML=`
            <img src="${url}" class="w-full aspect-video object-cover cursor-pointer" title="Применить этот стиль" />
            <div class="p-2 flex items-center justify-between gap-2">
              <div class="text-[11px] font-semibold">${variant.label}</div>
              <button class="soft-btn text-[10px] px-2 py-0.5" data-apply>✓ Применить</button>
            </div>`;
          cards[i].querySelector('[data-apply]').onclick=cards[i].querySelector('img').onclick=()=>{
            /* Append the stylistic cue to existing fields for consistent application */
            $('lighting').value=v('lighting')?v('lighting')+', '+variant.cue.split(',')[0]:variant.cue.split(',')[0];
            const moodPart=variant.cue.match(/(optimistic|melancholic|cinematic|dreamlike) mood/i);
            if(moodPart&&!v('mood'))$('mood').value=moodPart[1];
            try{generate();}catch(e){}
            moodModal.classList.add('hidden');
            toast('📸 «'+variant.label+'» применён');
          };
        }else{
          cards[i].innerHTML=`<div class="aspect-video grid place-items-center text-xs text-red-400 p-3">✕ ${variant.label}</div>`;
        }
      }catch(e){
        cards[i].innerHTML=`<div class="aspect-video grid place-items-center text-[10px] text-red-400 p-3">✕ ${e.message.slice(0,80)}</div>`;
      }
    }));
    moodBtn.innerHTML=o;moodBtn.disabled=false;
    toast('📸 Mood-board готов');
  };

  /* ============================================================
     5. AI CINEMATOGRAPHER — lighting setup
     ============================================================ */
  const lightBtn=document.createElement('button');
  lightBtn.className="soft-btn text-xs px-3 py-1.5";
  lightBtn.innerHTML='💡 Lighting';
  lightBtn.title='AI спроектирует профессиональную lighting-схему: key/fill/back, углы, ratio, цветовая температура, референс';
  $('aiReverseBtn').parentElement.appendChild(lightBtn);

  const lightModal=document.createElement('div');
  lightModal.id='lightModal';
  lightModal.className='hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4';
  lightModal.innerHTML=`<div class="glass rounded-2xl p-5 max-w-2xl w-full max-h-[85vh] overflow-auto">
    <div class="flex items-center justify-between mb-3">
      <div class="text-base font-semibold">💡 Lighting setup</div>
      <button id="lightClose" class="soft-btn text-xs px-2 py-1">✕</button>
    </div>
    <div id="lightBody" class="text-xs leading-relaxed"></div>
    <div class="flex gap-2 mt-4">
      <button id="lightApplyShort" class="btn-primary px-4 py-2 rounded-lg text-sm hidden">✅ Применить короткое описание в Lighting</button>
      <button id="lightApplyFull" class="soft-btn px-4 py-2 text-sm hidden">📋 Скопировать полное</button>
    </div>
  </div>`;
  document.body.appendChild(lightModal);
  $('lightClose').onclick=()=>lightModal.classList.add('hidden');
  lightModal.onclick=e=>{if(e.target===lightModal)lightModal.classList.add('hidden');};

  let _lightData=null;
  lightBtn.onclick=async()=>{
    if(!needKey())return;
    const subject=v('subject');const mood=v('mood');const time=v('time');const scene=v('scene');
    if(!subject){toast('Заполни Subject');return;}
    const o=lightBtn.innerHTML;lightBtn.innerHTML='⏳';lightBtn.disabled=true;
    const sys=`You are a Director of Photography (cinematographer) designing a professional lighting setup.

Reply ONLY as JSON:
{
  "setup_name": "<classical setup name: Rembrandt | Butterfly | Split | Loop | Three-point | High-key | Low-key | Chiaroscuro | Practical-only | Natural-only | Hard-light | Soft-key>",
  "key": {"angle": "<degrees + position e.g. 45° camera-left, 30° above eye-line>", "type": "<HMI / LED panel / softbox / window / practical>", "color_temp": "<kelvin e.g. 5600K daylight | 3200K tungsten | 2700K candle>", "intensity": "<strong / medium / soft>"},
  "fill": {"ratio": "<e.g. 4:1 dramatic | 2:1 cinematic | 1:1 flat>", "source": "<bounce card / fill light / ambient skylight / negative fill>"},
  "back": {"purpose": "<rim / hair / separation / kicker>", "color": "<color temp or accent color e.g. magenta neon>"},
  "practicals": ["<practical light source visible in frame 1>", "<practical 2>"],
  "atmosphere": "<haze / fog / dust / clean>",
  "reference": "<famous film or DOP whose work matches: e.g. Roger Deakins Blade Runner 2049 | Emmanuel Lubezki Birdman | Hoyte van Hoytema Dune>",
  "short": "<ONE short cinematic English string suitable for the Lighting field of a video prompt, ~10-15 words combining the most important elements>"
}

Match the setup to the mood and scene. Be specific and technical but executable.`;
    const user=`Subject: ${subject}\nMood: ${mood||'neutral'}\nTime: ${time||'unspecified'}\nScene: ${scene||'unspecified'}`;
    const out=await aiCall([{role:'system',content:sys},{role:'user',content:user}],{json:true});
    lightBtn.innerHTML=o;lightBtn.disabled=false;
    if(!out){toast('AI не ответил');return;}
    try{
      const d=JSON.parse(out);_lightData=d;
      const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
      const practicals=(d.practicals||[]).map(p=>'• '+esc(p)).join('<br>')||'(нет)';
      $('lightBody').innerHTML=`
        <div class="text-base font-semibold mb-2 text-violet-300">💡 ${esc(d.setup_name)}</div>
        <div class="grid grid-cols-1 gap-2 mb-3">
          <div class="rounded-lg p-2 bg-black/20"><b>🔑 Key:</b> ${esc(d.key?.angle)} · ${esc(d.key?.type)} · ${esc(d.key?.color_temp)} · ${esc(d.key?.intensity)}</div>
          <div class="rounded-lg p-2 bg-black/20"><b>🌗 Fill:</b> ratio ${esc(d.fill?.ratio)} · ${esc(d.fill?.source)}</div>
          <div class="rounded-lg p-2 bg-black/20"><b>🌟 Back:</b> ${esc(d.back?.purpose)} · ${esc(d.back?.color)}</div>
          <div class="rounded-lg p-2 bg-black/20"><b>💡 Practicals:</b><br>${practicals}</div>
          <div class="rounded-lg p-2 bg-black/20"><b>🌫 Atmosphere:</b> ${esc(d.atmosphere)}</div>
          <div class="rounded-lg p-2 bg-amber-500/10 border border-amber-500/30"><b>🎬 Reference:</b> ${esc(d.reference)}</div>
        </div>
        <div class="rounded-lg p-2 bg-violet-500/10 border border-violet-500/30">
          <div class="text-[10px] uppercase tracking-wider opacity-60 mb-1">Короткое описание для поля Lighting:</div>
          <div class="font-mono text-xs">${esc(d.short)}</div>
        </div>`;
      $('lightApplyShort').classList.remove('hidden');
      $('lightApplyFull').classList.remove('hidden');
      lightModal.classList.remove('hidden');
    }catch(e){toast('JSON err');console.debug(e);}
  };

  $('lightApplyShort').onclick=()=>{
    if(!_lightData?.short)return;
    $('lighting').value=_lightData.short;
    $('lighting').dispatchEvent(new Event('input',{bubbles:true}));
    try{generate();}catch(e){}
    lightModal.classList.add('hidden');
    toast('💡 Применено в Lighting');
  };
  $('lightApplyFull').onclick=async()=>{
    if(!_lightData)return;
    const full=`Lighting setup: ${_lightData.setup_name}
Key: ${_lightData.key?.angle}, ${_lightData.key?.type}, ${_lightData.key?.color_temp}, ${_lightData.key?.intensity}
Fill: ratio ${_lightData.fill?.ratio}, ${_lightData.fill?.source}
Back: ${_lightData.back?.purpose}, ${_lightData.back?.color}
Practicals: ${(_lightData.practicals||[]).join(', ')}
Atmosphere: ${_lightData.atmosphere}
Reference: ${_lightData.reference}`;
    try{await navigator.clipboard.writeText(full);toast('📋 Скопировано');}catch(e){toast('Ошибка копирования');}
  };

  /* ============================================================
     COMMAND PALETTE INTEGRATION
     ============================================================ */
  try{
    if(typeof CMDS!=='undefined'){
      CMDS.push({n:'🎵 Audio prompts (Suno/SFX/Voice)',h:()=>audioBtn.click()});
      CMDS.push({n:'🎭 Dialogue writer',h:()=>dlgBtn.click()});
      CMDS.push({n:'🎞 Reference video → multi-shot',h:()=>refVidBtn.click()});
      CMDS.push({n:'📸 Mood-board (4 варианта)',h:()=>moodBtn.click()});
      CMDS.push({n:'💡 Lighting cinematographer',h:()=>lightBtn.click()});
    }
  }catch(e){}

  console.log('%c[Lumen v15.9] Tier 2 enhancements loaded: Audio / Dialogue / RefVideo / Moodboard / Lighting','color:#a78bfa');
})();
