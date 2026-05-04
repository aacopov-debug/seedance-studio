/* ============================================================
   LUMEN — STORY MODE MODULE (extracted from app.js v15.2)
   ============================================================
   Multi-scene story generator: one big idea → N connected scenes
   sharing a consistent hero. Includes header button, modal UI,
   AI scene-graph generator (storyExpand), per-scene preview via
   DALL·E (generateScenePreview), batch preview, ZIP+TXT export,
   and "as multi-shot" loader that pumps scenes into Pro Mode shots.

   Exports as globals (used by continuity.js and fcpxml.js):
   - STORY                  current story state {hero,title,scenes[]}
   - renderStory            rerender modal scene list
   - saveStory              persist to localStorage
   - loadJSZip              lazy CDN loader (also used by fcpxml.js)
   - generateScenePreview   per-scene DALL·E render

   Dependencies (globals from app.js):
   - aiCall, aiFetchJson, aiCfg, needKey   AI core
   - $, v, toast, safeLS, dl, generate     core helpers
   - shotsEl, addShot                       Pro Mode multi-shot
   ============================================================ */

/* Lazy-load JSZip from CDN for ZIP export (also used by fcpxml.js) */
function loadJSZip(){
  if(window.JSZip)return Promise.resolve(window.JSZip);
  return new Promise((res,rej)=>{
    const sc=document.createElement('script');
    sc.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    sc.onload=()=>res(window.JSZip);sc.onerror=()=>rej(new Error('JSZip load failed'));
    document.head.appendChild(sc);
  });
}

/* In-memory current story */
let STORY={hero:'',title:'',scenes:[]};
function loadStory(){try{const r=localStorage.getItem('seedance_story');if(r)STORY=JSON.parse(r);}catch(e){console.debug(e)}}
function saveStory(){safeLS('seedance_story',JSON.stringify(STORY));}
loadStory();

/* Header button */
const storyBtn=document.createElement('button');
storyBtn.id='storyBtn';storyBtn.className='soft-btn text-xs px-3 py-1.5 ml-2';
storyBtn.innerHTML='🎬 Story';storyBtn.title='Multi-scene story mode (одна идея → N связанных сцен)';
document.querySelector('header > div:last-child').appendChild(storyBtn);

/* Modal HTML */
const storyHTML=`
<div id="storyModal" class="hidden fixed inset-0 z-[55] grid place-items-center p-3 bg-black/60 backdrop-blur" onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="glass rounded-2xl p-5 max-w-5xl w-full max-h-[92vh] overflow-auto scrollbar" onclick="event.stopPropagation()">
    <div class="flex items-center justify-between mb-3 gap-2 flex-wrap">
      <h2 class="font-semibold text-lg">🎬 Story Mode — multi-scene</h2>
      <div class="flex gap-2 flex-wrap">
        <button id="storyClear" class="soft-btn text-xs px-3 py-1.5">🗑 Очистить</button>
        <button id="storyClose" class="soft-btn text-xs px-3 py-1.5">×</button>
      </div>
    </div>
    <div class="grid sm:grid-cols-3 gap-2 mb-3">
      <div class="sm:col-span-3">
        <label class="block text-xs subtle mb-1">💡 Большая идея (любой язык)</label>
        <textarea id="storyIdea" rows="2" class="field" placeholder="напр.: молодая хакерша находит послание из будущего и решает изменить историю"></textarea>
      </div>
      <div>
        <label class="block text-xs subtle mb-1">🎚 Кол-во сцен: <span id="storyNVal">5</span></label>
        <input type="range" id="storyN" min="3" max="10" value="5" class="w-full"/>
      </div>
      <div>
        <label class="block text-xs subtle mb-1">🎭 Жанр / тон</label>
        <select id="storyTone" class="field !py-1.5 text-sm">
          <option value="cinematic drama">Кинодрама</option>
          <option value="cyberpunk thriller">Cyberpunk thriller</option>
          <option value="neo-noir">Neo-noir</option>
          <option value="anime adventure">Anime adventure</option>
          <option value="horror suspense">Horror</option>
          <option value="comedy short">Комедия</option>
          <option value="documentary">Документальный</option>
          <option value="commercial ad">Реклама</option>
          <option value="music video">Музыкальный клип</option>
          <option value="action blockbuster">Action blockbuster</option>
          <option value="fantasy epic">Fantasy epic</option>
        </select>
      </div>
      <div>
        <label class="block text-xs subtle mb-1">⏱ Длина сцены</label>
        <select id="storyDur" class="field !py-1.5 text-sm">
          <option value="3s">3s</option><option value="5s" selected>5s</option><option value="8s">8s</option><option value="10s">10s</option>
        </select>
      </div>
    </div>
    <div class="flex gap-2 mb-4 flex-wrap">
      <button id="storyExpand" class="btn-primary px-4 py-2 rounded-lg text-sm">✨ Развернуть в сценарий</button>
      <button id="storyPrevAll" class="soft-btn text-xs px-3 py-2">🖼 Превью всех</button>
      <button id="storyExportZip" class="soft-btn text-xs px-3 py-2">📦 Экспорт ZIP</button>
      <button id="storyExportTxt" class="soft-btn text-xs px-3 py-2">📄 Экспорт .txt</button>
      <button id="storyAsShots" class="soft-btn text-xs px-3 py-2">🎞 Как multi-shot</button>
    </div>
    <div id="storyHero" class="hidden text-xs subtle mb-3 p-2 bg-violet-500/10 border border-violet-500/30 rounded-lg"></div>
    <div id="storyScenes" class="space-y-3"></div>
  </div>
</div>`;
document.body.insertAdjacentHTML('beforeend',storyHTML);

storyBtn.onclick=()=>{$('storyModal').classList.remove('hidden');renderStory();};
$('storyClose').onclick=()=>$('storyModal').classList.add('hidden');
$('storyClear').onclick=()=>{if(!confirm('Очистить текущий сценарий?'))return;STORY={hero:'',title:'',scenes:[]};saveStory();renderStory();};
$('storyN').oninput=e=>$('storyNVal').textContent=e.target.value;

function renderStory(){
  const hero=$('storyHero'),wrap=$('storyScenes');
  if(STORY.hero){hero.classList.remove('hidden');hero.innerHTML='<b>🎭 Hero:</b> '+STORY.hero+(STORY.title?'<br><b>📖 Title:</b> '+STORY.title:'');}
  else hero.classList.add('hidden');
  if(!STORY.scenes.length){wrap.innerHTML='<div class="text-xs subtle text-center p-6">Введите идею и нажмите ✨ Развернуть</div>';return;}
  wrap.innerHTML='';
  STORY.scenes.forEach((sc,i)=>{
    const card=document.createElement('div');
    card.className='border border-white/10 rounded-xl p-3 bg-black/10';
    card.innerHTML=`
      <div class="flex items-start gap-3 flex-wrap">
        <div id="storyImg${i}" class="w-32 aspect-video bg-black/30 rounded-lg flex-shrink-0 grid place-items-center text-xs subtle overflow-hidden">—</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <div class="font-semibold text-sm">Scene ${i+1}: ${sc.title||''}</div>
            <div class="flex gap-1">
              <button data-act="prev" data-i="${i}" class="soft-btn text-[10px] px-2 py-0.5">🖼</button>
              <button data-act="load" data-i="${i}" class="soft-btn text-[10px] px-2 py-0.5">⏎ В форму</button>
              <button data-act="del" data-i="${i}" class="soft-btn text-[10px] px-2 py-0.5 hover:!bg-red-500/30">✕</button>
            </div>
          </div>
          <textarea data-edit="${i}" rows="3" class="field text-xs">${(sc.prompt||'').replace(/</g,'&lt;')}</textarea>
        </div>
      </div>`;
    wrap.appendChild(card);
  });
  // wire
  wrap.querySelectorAll('[data-act]').forEach(b=>{
    b.onclick=()=>{
      const i=+b.dataset.i,act=b.dataset.act;
      if(act==='del'){STORY.scenes.splice(i,1);saveStory();renderStory();}
      else if(act==='load'){loadSceneToForm(STORY.scenes[i]);toast('⏎ Сцена загружена');}
      else if(act==='prev')generateScenePreview(i);
    };
  });
  wrap.querySelectorAll('[data-edit]').forEach(t=>{
    t.oninput=()=>{STORY.scenes[+t.dataset.edit].prompt=t.value;saveStory();};
  });
  // restore previews
  STORY.scenes.forEach((sc,i)=>{if(sc.imgUrl){const slot=$('storyImg'+i);if(slot)slot.innerHTML=`<img src="${sc.imgUrl}" class="w-full h-full object-cover"/>`;}});
}

$('storyExpand').onclick=async()=>{
  const idea=$('storyIdea').value.trim();
  if(!idea){toast('Введите идею');return;}
  if(!needKey())return;
  const N=+$('storyN').value,tone=$('storyTone').value,dur=$('storyDur').value;
  $('storyExpand').textContent='⏳ AI пишет...';
  const sys=`You are a senior screenwriter and director. Given a high-level idea, design EXACTLY ${N} connected video scenes that flow as a single story. Use the tone: "${tone}". Maintain a CONSISTENT main character across all scenes. ALL VALUES MUST BE IN ENGLISH. Reply ONLY as JSON:
{"hero":"detailed cinematic description of main character (3-5 visual features, English)","title":"short story title","scenes":[{"title":"3-word scene name","prompt":"complete cinematic English video prompt for this scene including subject, action, scene, camera, lighting, mood. ~30-50 words. Mention the hero with consistency tag."}]}
Each scene's "prompt" must be a flat string. Avoid nested objects.`;
  const out=await aiCall([{role:'system',content:sys},{role:'user',content:idea}],{json:true});
  $('storyExpand').textContent='✨ Развернуть в сценарий';
  if(!out){toast('AI: пусто');return;}
  try{
    const d=JSON.parse(out);
    if(!d.scenes||!Array.isArray(d.scenes)){toast('AI вернул не сценарий');return;}
    STORY={hero:String(d.hero||''),title:String(d.title||''),scenes:d.scenes.slice(0,N).map(s=>({title:String(s.title||''),prompt:typeof s.prompt==='object'?Object.values(s.prompt).join(', '):String(s.prompt||''),imgUrl:''}))};
    saveStory();renderStory();
    toast('✓ '+STORY.scenes.length+' сцен');
  }catch(e){toast('JSON err: '+e.message);}
};

async function generateScenePreview(i){
  if(!needKey())return;
  const c=aiCfg();if(!c.key)return;
  const sc=STORY.scenes[i];if(!sc)return;
  const slot=$('storyImg'+i);if(slot)slot.innerHTML='⏳';
  try{
    const prompt=`cinematic still frame, ${STORY.hero}, ${sc.prompt}`.slice(0,3800);
    const j=await aiFetchJson(c,'/images/generations',{model:'dall-e-3',prompt,size:'1792x1024',n:1});
    const url=j.data?.[0]?.url||(j.data?.[0]?.b64_json?'data:image/png;base64,'+j.data[0].b64_json:null);
    if(url){sc.imgUrl=url;saveStory();if(slot)slot.innerHTML=`<img src="${url}" class="w-full h-full object-cover"/>`;}
  }catch(e){if(slot)slot.textContent='✕ '+e.message.slice(0,15);toast('Image: '+e.message.slice(0,120));}
}

$('storyPrevAll').onclick=async()=>{
  if(!STORY.scenes.length){toast('Нет сцен');return;}
  if(!confirm(`Сгенерировать ${STORY.scenes.length} картинок? Это займёт ~${STORY.scenes.length*8}с и стоит ~$${(STORY.scenes.length*0.04).toFixed(2)}.`))return;
  $('storyPrevAll').textContent='⏳';
  for(let i=0;i<STORY.scenes.length;i++){
    $('storyPrevAll').textContent=`⏳ ${i+1}/${STORY.scenes.length}`;
    await generateScenePreview(i);
  }
  $('storyPrevAll').textContent='🖼 Превью всех';toast('✓');
};

function loadSceneToForm(sc){
  if(!sc)return;
  $('subject').value=STORY.hero||v('subject');
  $('action').value=sc.prompt||'';
  $('scene').value=sc.title||'';
  $('character').value=STORY.hero||'';
  generate();
  $('storyModal').classList.add('hidden');
}

$('storyAsShots').onclick=()=>{
  if(!STORY.scenes.length){toast('Нет сцен');return;}
  $('character').value=STORY.hero||v('character');
  shotsEl.innerHTML='';
  STORY.scenes.forEach((sc)=>{
    addShot('5s','medium shot',sc.prompt.slice(0,200),'cut');
  });
  $('useShots').checked=true;
  generate();
  $('storyModal').classList.add('hidden');
  toast('🎞 '+STORY.scenes.length+' shots');
};

$('storyExportTxt').onclick=()=>{
  if(!STORY.scenes.length){toast('Нет сцен');return;}
  const lines=[`# ${STORY.title||'Untitled Story'}`,'',`Hero: ${STORY.hero}`,'','---',''];
  STORY.scenes.forEach((sc,i)=>{lines.push(`## Scene ${i+1}: ${sc.title}`,'',sc.prompt,'','---','');});
  dl(`story-${Date.now()}.md`,lines.join('\n'),'text/markdown');
};

$('storyExportZip').onclick=async()=>{
  if(!STORY.scenes.length){toast('Нет сцен');return;}
  $('storyExportZip').textContent='⏳';
  try{
    const JSZip=await loadJSZip();
    const zip=new JSZip();
    zip.file('00_story.md',`# ${STORY.title||'Untitled'}\n\nHero: ${STORY.hero}\n\n${STORY.scenes.length} scenes`);
    zip.file('story.json',JSON.stringify(STORY,null,2));
    STORY.scenes.forEach((sc,i)=>{
      const num=String(i+1).padStart(2,'0');
      zip.file(`scene-${num}-${(sc.title||'untitled').replace(/[^a-z0-9]+/gi,'-').slice(0,30)}.txt`,sc.prompt);
    });
    // fetch image previews if any
    const imgPromises=STORY.scenes.map(async(sc,i)=>{
      if(!sc.imgUrl||!sc.imgUrl.startsWith('http'))return;
      try{const r=await fetch(sc.imgUrl);const b=await r.blob();zip.file(`preview-${String(i+1).padStart(2,'0')}.png`,b);}catch(e){console.debug(e)}
    });
    await Promise.all(imgPromises);
    const blob=await zip.generateAsync({type:'blob'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`story-${Date.now()}.zip`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('📦 ZIP готов');
  }catch(e){toast('ZIP: '+e.message);}
  $('storyExportZip').textContent='📦 Экспорт ZIP';
};
