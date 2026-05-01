/* ============ v7: EVENT BUS (replaces _origX chains) ============ */
window.bus = window.bus || {_h:{}, on(e,f){(this._h[e]=this._h[e]||[]).push(f);return this;}, off(e,f){if(this._h[e])this._h[e]=this._h[e].filter(x=>x!==f);return this;}, emit(e,...a){(this._h[e]||[]).forEach(f=>{try{f(...a);}catch(err){console.error('[bus '+e+']',err);}});return this;}};
/* Use bus.on('after-generate', fn) for hooks instead of overriding window.generate */

/* ============ v7: SAFE AI FIELD APPLY (hoisted, used everywhere) ============ */
/* Flattens objects to strings so AI returning {character:{name:'Alex'}} doesn't yield [object Object] */
function applyAiFields(obj){
  Object.entries(obj||{}).forEach(([k,vl])=>{
    if(typeof document==='undefined'||!document.getElementById||!document.getElementById(k))return;
    if(vl==null)return;
    if(typeof vl==='object')vl=Object.values(vl).filter(x=>typeof x==='string').join(', ')||JSON.stringify(vl);
    document.getElementById(k).value=String(vl);
  });
}
/* Safe localStorage wrapper (handles quota errors) */
function safeLS(k,v){try{localStorage.setItem(k,v);return true;}catch(e){console.warn('localStorage quota:',k,e.message);return false;}}

/* Lumen — Cinematic Prompt Studio v11.0 (by Armen) */

const O={
shot:["wide establishing shot","extreme wide shot","full body shot","medium shot","cowboy shot","close-up","extreme close-up","over-the-shoulder","point-of-view (POV)","top-down aerial","low-angle shot","high-angle shot","Dutch angle"],
camera:["static camera","slow dolly in","dolly out","tracking shot","handheld follow","smooth gimbal","crane up","crane down","orbit around subject","whip pan","slow zoom in","slow zoom out","drone fly-through","steadicam push-in","arc shot","rack focus pull"],
lens:["50mm prime, shallow depth of field","35mm cinematic","85mm portrait, bokeh","24mm wide-angle","anamorphic lens with horizontal flares","macro lens","fisheye","tilt-shift miniature"],
speed:["natural real-time motion","slow motion 120fps","ultra slow motion","time-lapse","hyperlapse","frozen moment with subtle parallax"],
lighting:["soft natural light","golden hour sunlight","blue hour twilight","hard rim lighting","neon backlighting","volumetric god rays","studio three-point lighting","candlelight glow","moonlight","harsh midday sun","cinematic chiaroscuro","colored gels (teal & orange)","practical neon signs"],
time:["dawn","sunrise","morning","midday","afternoon","golden hour","sunset","blue hour","night","midnight"],
weather:["clear sky","light rain","heavy rain with reflections","thunderstorm","dense fog","light mist","snowfall","blizzard","sandstorm","overcast","windy"],
palette:["teal and orange","desaturated muted tones","vibrant neon","pastel dreamy","monochrome black & white","warm sepia","cold cyan blues","rich earthy browns","high-contrast noir","bleach bypass"],
mood:["epic and cinematic","dreamy and ethereal","tense and suspenseful","peaceful and serene","mysterious","romantic","melancholic","energetic and dynamic","nostalgic","heroic","unsettling"],
style:["photorealistic cinematic","Hollywood blockbuster","Studio Ghibli anime","Pixar 3D animation","cyberpunk","film noir","wes anderson symmetric","documentary 16mm film","vintage 80s VHS","hyperrealistic 8K","watercolor animation","stop-motion","Korean drama"]
};
const PRESETS=[
{name:"🎬 Кино",v:{shot:"medium shot",camera:"slow dolly in",lens:"anamorphic lens with horizontal flares",speed:"natural real-time motion",lighting:"cinematic chiaroscuro",time:"blue hour",weather:"light mist",palette:"teal and orange",mood:"epic and cinematic",style:"photorealistic cinematic"}},
{name:"🌃 Киберпанк",v:{shot:"low-angle shot",camera:"tracking shot",lens:"35mm cinematic",speed:"natural real-time motion",lighting:"neon backlighting",time:"night",weather:"heavy rain with reflections",palette:"vibrant neon",mood:"mysterious",style:"cyberpunk"}},
{name:"🌸 Аниме",v:{shot:"medium shot",camera:"smooth gimbal",lens:"50mm prime, shallow depth of field",speed:"natural real-time motion",lighting:"soft natural light",time:"golden hour",weather:"clear sky",palette:"pastel dreamy",mood:"dreamy and ethereal",style:"Studio Ghibli anime"}},
{name:"🛍 Продукт",v:{shot:"close-up",camera:"orbit around subject",lens:"macro lens",speed:"slow motion 120fps",lighting:"studio three-point lighting",time:"midday",weather:"clear sky",palette:"desaturated muted tones",mood:"energetic and dynamic",style:"hyperrealistic 8K"}},
{name:"🏔 Природа",v:{shot:"extreme wide shot",camera:"drone fly-through",lens:"24mm wide-angle",speed:"hyperlapse",lighting:"golden hour sunlight",time:"sunrise",weather:"light mist",palette:"rich earthy browns",mood:"peaceful and serene",style:"documentary 16mm film"}},
{name:"😱 Хоррор",v:{shot:"close-up",camera:"handheld follow",lens:"35mm cinematic",speed:"natural real-time motion",lighting:"candlelight glow",time:"midnight",weather:"dense fog",palette:"monochrome black & white",mood:"tense and suspenseful",style:"film noir"}}
];
const GENRES=[
{name:"🎞 Trailer",v:{lighting:"cinematic chiaroscuro",mood:"epic and cinematic",style:"Hollywood blockbuster",camera:"crane up"}},
{name:"📱 TikTok 9:16",v:{aspect:"9:16",duration:"5s",camera:"handheld follow",lens:"24mm wide-angle",mood:"energetic and dynamic"}},
{name:"🎵 Music video",v:{camera:"smooth gimbal",speed:"slow motion 120fps",lighting:"colored gels (teal & orange)",mood:"dreamy and ethereal"}},
{name:"📺 Реклама",v:{shot:"close-up",camera:"orbit around subject",lighting:"studio three-point lighting",style:"hyperrealistic 8K"}},
{name:"🍔 Food",v:{shot:"extreme close-up",camera:"slow dolly in",lens:"macro lens",speed:"slow motion 120fps",style:"hyperrealistic 8K"}},
{name:"🏠 Real estate",v:{shot:"wide establishing shot",camera:"drone fly-through",lens:"24mm wide-angle",lighting:"golden hour sunlight"}},
{name:"🎮 Game cinematic",v:{shot:"low-angle shot",camera:"orbit around subject",lighting:"volumetric god rays",mood:"heroic"}},
{name:"🌿 ASMR",v:{shot:"extreme close-up",camera:"static camera",lens:"macro lens",speed:"slow motion 120fps",mood:"peaceful and serene"}},
{name:"📰 Documentary",v:{camera:"handheld follow",lens:"35mm cinematic",style:"documentary 16mm film"}}
];
const DIRS=[
{name:"Blade Runner 2049",d:"Villeneuve · neo-noir",v:{lighting:"colored gels (teal & orange)",palette:"teal and orange",style:"cyberpunk",mood:"mysterious",camera:"slow dolly in",lens:"anamorphic lens with horizontal flares",time:"night",weather:"heavy rain with reflections"}},
{name:"Wes Anderson",d:"симметрия, пастель",v:{shot:"medium shot",camera:"static camera",palette:"pastel dreamy",style:"wes anderson symmetric",lighting:"soft natural light",mood:"nostalgic"}},
{name:"Studio Ghibli",d:"Миядзаки",v:{style:"Studio Ghibli anime",lighting:"soft natural light",palette:"pastel dreamy",mood:"dreamy and ethereal",camera:"smooth gimbal"}},
{name:"Tarantino",d:"стилизация",v:{shot:"close-up",camera:"slow zoom in",lens:"anamorphic lens with horizontal flares",palette:"warm sepia",style:"Hollywood blockbuster",mood:"tense and suspenseful"}},
{name:"Christopher Nolan",d:"эпично, IMAX",v:{shot:"extreme wide shot",camera:"crane up",lens:"24mm wide-angle",palette:"desaturated muted tones",style:"Hollywood blockbuster",mood:"epic and cinematic"}},
{name:"Tarkovsky",d:"длинные планы",v:{shot:"wide establishing shot",camera:"static camera",speed:"frozen moment with subtle parallax",palette:"desaturated muted tones",mood:"melancholic",style:"documentary 16mm film"}},
{name:"Kubrick",d:"perfect symmetry",v:{shot:"wide establishing shot",camera:"slow zoom in",lens:"24mm wide-angle",palette:"high-contrast noir",mood:"unsettling"}},
{name:"David Fincher",d:"тёмная цифра",v:{lighting:"hard rim lighting",palette:"cold cyan blues",style:"film noir",mood:"tense and suspenseful",camera:"steadicam push-in"}},
{name:"Pixar",d:"3D-анимация",v:{style:"Pixar 3D animation",lighting:"soft natural light",palette:"vibrant neon",mood:"energetic and dynamic"}},
{name:"Mad Max",d:"пыль, контраст",v:{lighting:"harsh midday sun",palette:"warm sepia",weather:"sandstorm",camera:"tracking shot"}},
{name:"A24 horror",d:"slow burn",v:{lens:"35mm cinematic",style:"film noir",mood:"unsettling",lighting:"candlelight glow",camera:"static camera"}},
{name:"Korean drama",d:"romance",v:{style:"Korean drama",lighting:"golden hour sunlight",time:"golden hour",palette:"warm sepia",mood:"romantic"}}
];
const IDEAS=[
{subject:"a lone astronaut in a worn white spacesuit",action:"slowly walks across an alien red desert",scene:"vast martian-like landscape",details:"dust kicked up, helmet reflecting"},
{subject:"a majestic white tiger with glowing blue eyes",action:"prowls through tall grass",scene:"misty bamboo forest at dawn",details:"sun rays piercing"},
{subject:"a young woman with red hair in a long coat",action:"runs through a crowded neon street",scene:"futuristic Tokyo with holograms",details:"rain reflections"},
{subject:"a samurai in dark lacquered armor",action:"slowly draws his katana",scene:"ancient Japanese temple",details:"cherry blossoms swirling"}
];
const RU={"wide establishing shot":"общий план","medium shot":"средний план","close-up":"крупный","static camera":"статичная","slow dolly in":"медленный наезд","tracking shot":"проводка","orbit around subject":"облёт","drone fly-through":"пролёт"};
const CONFLICTS=[{a:["night","midnight"],b:["golden hour sunlight","harsh midday sun"],msg:"Время суток ↔ освещение"},{a:["dense fog","heavy rain"],b:["clear sky"],msg:"Погода противоречит ясному небу"},{a:["monochrome black & white"],b:["vibrant neon","teal and orange"],msg:"Ч/б ↔ цветная палитра"},{a:["static camera"],b:["whip pan","drone fly-through","tracking shot"],msg:"Противоречие в камере"}];
const ANTI_NEG="morphing artifacts, warping, jittery motion, frame skipping, deformed limbs, extra fingers, distorted faces, text artifacts, watermark, low quality, blurry, flickering";
const TRANS=["cut","dissolve","match cut","smash cut","fade to black"];
const COST={'480p':0.005,'720p':0.012,'1080p':0.024};
const AIP={openai:{base:'https://api.openai.com/v1',model:'gpt-4o-mini'},ollama:{base:'http://localhost:11434/v1',model:'llama3.2'},deepseek:{base:'https://api.deepseek.com',model:'deepseek-chat'}};

const $=id=>document.getElementById(id);
const v=id=>($(id)?.value||'').trim();
function toast(m,type){
  const t=$('toast');if(!t)return;
  // auto-detect type from leading emoji if not explicit
  if(!type){
    if(/^(✓|✅|🎉|💾|★)/.test(m))type='success';
    else if(/^(❌|✗|⚠|🚫)/.test(m))type='error';
    else if(/^(⏳|🔄)/.test(m))type='loading';
    else if(/^(ℹ|💡|📋|🔗|🕘|📥|🌓|📊)/.test(m))type='info';
  }
  const icons={success:'check-circle-2',error:'x-circle',loading:'loader-2',info:'info'};
  t.className='toast';
  if(type)t.classList.add('toast-'+type);
  // strip leading icon emoji if we have a Lucide icon
  const cleaned=type?m.replace(/^[^\w\s\dа-яё]+\s*/iu,'').trim():m;
  const ico=type?`<span class="toast-ico"><i data-lucide="${icons[type]}"></i></span>`:'';
  t.innerHTML=ico+'<span>'+cleaned+'</span>';
  if(type&&window.refreshIcons)window.refreshIcons();
  t.classList.add('show');
  clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),type==='error'?2800:1900);
}
toast.dismiss=()=>{const t=$('toast');t&&t.classList.remove('show');};

['shot','camera','lens','speed','lighting','time','weather','palette','mood','style'].forEach(id=>{const s=$(id);O[id].forEach((x,i)=>{const o=document.createElement('option');o.textContent=x;if(i===0)o.selected=1;s.appendChild(o);});});

const presetsEl=$('presets'), genresEl=$('genres'), dirsEl=$('directors');
function renderPresets(){[...presetsEl.querySelectorAll('[data-p]')].forEach(b=>b.remove());
  const all=[...PRESETS.map(p=>({...p,b:1})),...loadList('seedance_user_presets').map(p=>({...p,b:0}))];
  all.forEach((p,i)=>{const btn=document.createElement('button');btn.dataset.p=i;btn.className="soft-btn text-xs px-3 py-1.5 rounded-full";
    btn.innerHTML=p.b?p.name:`${p.name} <span data-del class="opacity-50 ml-1">✕</span>`;
    btn.onclick=e=>{if(e.target.dataset.del!==undefined){e.stopPropagation();const a=loadList('seedance_user_presets');a.splice(i-PRESETS.length,1);saveList('seedance_user_presets',a);renderPresets();return;}
      Object.entries(p.v).forEach(([k,vl])=>{if($(k))$(k).value=vl});[...presetsEl.querySelectorAll('[data-p]')].forEach(c=>c.classList.remove('chip-active'));btn.classList.add('chip-active');generate();};
    presetsEl.insertBefore(btn,$('savePresetBtn'));});}
renderPresets();
$('savePresetBtn').onclick=()=>{const n=prompt('Название:');if(!n)return;const vv={};['shot','camera','lens','speed','lighting','time','weather','palette','mood','style'].forEach(k=>vv[k]=$(k).value);const a=loadList('seedance_user_presets');a.push({name:'⭐ '+n,v:vv});saveList('seedance_user_presets',a);renderPresets();toast('Сохранено');};

GENRES.forEach(g=>{const b=document.createElement('button');b.className="soft-btn text-xs px-3 py-1.5 rounded-full";b.textContent=g.name;
  b.onclick=()=>{Object.entries(g.v).forEach(([k,vl])=>{if($(k))$(k).value=vl});generate();};genresEl.appendChild(b);});

DIRS.forEach(dr=>{const b=document.createElement('button');b.className="dir-card text-left p-3 rounded-xl border border-white/10 bg-black/10";
  b.innerHTML=`<div class="font-medium text-sm">${dr.name}</div><div class="text-[11px] subtle mt-0.5">${dr.d}</div>`;
  b.onclick=()=>{Object.entries(dr.v).forEach(([k,vl])=>{if($(k))$(k).value=vl});toast('Стиль: '+dr.name);generate();};dirsEl.appendChild(b);});

function makeDrag(c){c.addEventListener('dragstart',e=>{const r=e.target.closest('[draggable]');if(!r)return;r.classList.add('dragging');});
  c.addEventListener('dragend',()=>{[...c.children].forEach(x=>x.classList.remove('dragging'));reindexShots();saveState();});
  c.addEventListener('dragover',e=>{e.preventDefault();const d=c.querySelector('.dragging');if(!d)return;
    const a=[...c.children].find(x=>x!==d&&e.clientY<x.getBoundingClientRect().top+x.offsetHeight/2);
    if(a)c.insertBefore(d,a);else c.appendChild(d);});}

const beatsEl=$('beats');
function addBeat(t="0–3s",cam="camera slowly pushes in",sub="subject begins to move"){
  const r=document.createElement('div');r.className="grid grid-cols-12 gap-2";r.draggable=true;
  r.innerHTML=`<div class="drag-handle col-span-1 pt-2.5 text-center subtle">⠿</div>
    <input class="field col-span-2 bt" value="${t}"/><input class="field col-span-4 bc" value="${cam}"/><input class="field col-span-4 bs" value="${sub}"/>
    <div class="col-span-1 flex gap-1"><button class="soft-btn text-xs flex-1" data-dup>📋</button><button class="soft-btn text-xs flex-1" data-rm>✕</button></div>`;
  r.querySelector('[data-rm]').onclick=()=>{r.remove();saveState();};
  r.querySelector('[data-dup]').onclick=()=>{addBeat(r.querySelector('.bt').value,r.querySelector('.bc').value,r.querySelector('.bs').value);saveState();};
  beatsEl.appendChild(r);
}
makeDrag(beatsEl);$('addBeat').onclick=()=>{addBeat("","","");saveState();};
const getBeats=()=>!$('useTimeline').checked?[]:[...beatsEl.querySelectorAll('[draggable]')].map(r=>({t:r.querySelector('.bt').value.trim(),cam:r.querySelector('.bc').value.trim(),sub:r.querySelector('.bs').value.trim()})).filter(b=>b.cam||b.sub);

const shotsEl=$('shots');
function addShot(dur="3s",cam="medium shot, slow dolly in",act="subject walks toward camera",tr="cut"){
  const r=document.createElement('div');r.className="grid grid-cols-12 gap-2";r.draggable=true;
  r.innerHTML=`<div class="drag-handle col-span-1 pt-2.5 text-center subtle">⠿<div class="text-[10px] sidx">#1</div></div>
    <input class="field col-span-2 sd" value="${dur}"/><input class="field col-span-3 sc" value="${cam}"/><input class="field col-span-3 sa" value="${act}"/>
    <select class="field col-span-2 st">${TRANS.map(t=>`<option ${t===tr?'selected':''}>${t}</option>`).join('')}</select>
    <div class="col-span-1 flex gap-1"><button class="soft-btn text-xs flex-1" data-dup>📋</button><button class="soft-btn text-xs flex-1" data-rm>✕</button></div>`;
  r.querySelector('[data-rm]').onclick=()=>{r.remove();reindexShots();saveState();};
  r.querySelector('[data-dup]').onclick=()=>{addShot(r.querySelector('.sd').value,r.querySelector('.sc').value,r.querySelector('.sa').value,r.querySelector('.st').value);saveState();};
  shotsEl.appendChild(r);reindexShots();
}
makeDrag(shotsEl);
function reindexShots(){[...shotsEl.querySelectorAll('.sidx')].forEach((e,i)=>e.textContent='#'+(i+1));}
const getShots=()=>!$('useShots').checked?[]:[...shotsEl.querySelectorAll('[draggable]')].map(r=>({dur:r.querySelector('.sd').value.trim(),cam:r.querySelector('.sc').value.trim(),act:r.querySelector('.sa').value.trim(),tr:r.querySelector('.st').value})).filter(s=>s.cam||s.act);
$('addShot').onclick=()=>{addShot("","","","cut");saveState();};

function applyW(s){if(!$('useWeights').checked)return s;[v('subject'),v('lighting'),v('style'),v('mood')].filter(Boolean).forEach(k=>{const re=new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');s=s.replace(re,`(${k}:1.3)`);});return s;}
function shakeT(){const x=+$('shake').value;if(x===0)return null;if(x<25)return"subtle handheld micro-shake";if(x<50)return"light handheld shake";if(x<75)return"strong handheld shake";return"aggressive shaky cam";}

function checkWarn(){
  const all=['lighting','time','weather','palette','mood','style'].map(v).join(' ').toLowerCase()+' '+(v('subject')+' '+v('scene')).toLowerCase();
  const w=[];CONFLICTS.forEach(c=>{if(c.a.some(x=>all.includes(x))&&c.b.some(x=>all.includes(x)))w.push(c.msg);});
  if(getCurTab()==='i2v'&&!imgState.img)w.push("I2V: добавьте первый кадр");
  if(!v('subject')){w.push("Нет главного объекта");$('subject').classList.add('invalid');}else $('subject').classList.remove('invalid');
  if($('useShots').checked&&getShots().length<2)w.push("Multi-shot: меньше 2 шотов");
  if(!v('action')&&!$('useShots').checked&&!$('useTimeline').checked)w.push("Нет действия — может получиться статичный кадр");
  const e=$('warnings');if(w.length){e.classList.remove('hidden');e.innerHTML='⚠ '+w.join(' · ');}else e.classList.add('hidden');
}

function buildEn(opts={}){
  const i2v=getCurTab()==='i2v';
  const sub=v('subject')||(i2v?"the subject in the reference image":"a cinematic subject");
  const beats=getBeats(),shots=getShots();
  const sty=opts.style||v('style'),cam=opts.camera||v('camera'),lens=opts.lens||v('lens'),light=opts.lighting||v('lighting');
  const p=[];
  if(i2v){p.push(`animate the reference image: ${sub}`);if(imgState.imgLast)p.push('with smooth interpolation to the final reference frame');if(v('motion'))p.push(v('motion'));}
  else if(shots.length)p.push(`${sty} sequence of ${shots.length} shots featuring ${sub}`);
  else p.push(`${sty}, ${v('shot')} of ${sub}`);
  if(v('character'))p.push(v('character'));
  if(v('action')&&!shots.length)p.push(v('action'));
  if(v('scene')&&!i2v)p.push(`set in ${v('scene')}`);
  if(!i2v)p.push(`${v('time')}, ${v('weather')}`);
  p.push(`${light}, ${v('palette')} color grading`);
  p.push(`shot on ${lens}, ${cam}, ${v('speed')}`);
  const sh=shakeT();if(sh)p.push(sh);
  if(v('speedRamp'))p.push(v('speedRamp'));
  p.push(`${v('mood')} atmosphere`);
  if(v('details'))p.push(v('details'));
  if($('loopMode').checked)p.push("seamlessly loops back to the first frame");
  if($('autoQuality').checked)p.push("ultra-detailed, sharp focus, high dynamic range, professional cinematography");
  let en=p.join(", ")+".";
  if(shots.length)en+="\n\nShots (multi-shot, same character throughout):\n"+shots.map((s,i)=>`Shot ${i+1} (${s.dur||'?'}, ${s.tr}): ${s.cam}. ${s.act}`).join('\n');
  if(beats.length)en+="\n\nTimeline:\n"+beats.map(b=>`• ${b.t||''}: camera — ${b.cam}; subject — ${b.sub}`).join('\n');
  const au=[v('ambient')&&`ambient: ${v('ambient')}`,v('sfx')&&`sfx: ${v('sfx')}`,v('dialogue')&&`dialogue: ${v('dialogue')}`].filter(Boolean);
  if(au.length)en+=`\n\nAudio: ${au.join(' | ')}`;
  en+=`\n\nAspect ratio: ${v('aspect')} | Duration: ${v('duration')} | Resolution: ${v('res')}`;
  let neg=v('negative');if($('autoNeg').checked)neg=(neg?neg+', ':'')+ANTI_NEG;
  if(neg)en+=`\nNegative prompt: ${neg}`;
  return applyW(en);
}

function generate(){
  const en=buildEn();const i2v=getCurTab()==='i2v';
  const ru=s=>RU[s]||s;const r=[];
  if(i2v)r.push(`оживить референс: ${v('subject')||'объект'}`);
  else if(getShots().length)r.push(`${v('style')} — серия из ${getShots().length} шотов`);
  else r.push(`${v('style')} — ${ru(v('shot'))}: ${v('subject')||'объект'}`);
  if(v('character'))r.push(v('character'));
  if(v('action')&&!getShots().length)r.push(v('action'));
  if(v('scene')&&!i2v)r.push(`место: ${v('scene')}`);
  if(!i2v)r.push(`${v('time')}, ${v('weather')}`);
  r.push(`свет: ${v('lighting')}; палитра: ${v('palette')}`);
  r.push(`камера: ${ru(v('camera'))}, ${v('lens')}`);
  r.push(`настроение: ${v('mood')}`);
  if(v('details'))r.push(v('details'));
  if($('loopMode').checked)r.push("бесшовный луп");
  let rus=r.join('. ')+'.';
  const sh=getShots(),be=getBeats();
  if(sh.length)rus+='\n\nШоты:\n'+sh.map((s,i)=>`Шот ${i+1} (${s.dur},${s.tr}): ${s.cam}. ${s.act}`).join('\n');
  if(be.length)rus+='\n\nКадры:\n'+be.map(b=>`• ${b.t}: ${b.cam}; ${b.sub}`).join('\n');
  rus+=`\n\nФормат: ${v('aspect')} | ${v('duration')} | ${v('res')}`;
  $('outRu').value=rus;renderEn(en);
  $('aspectLabel').textContent=v('aspect');updAspect();
  $('kDur').textContent=v('duration');$('kRes').textContent=v('res');
  const dur=parseInt(v('duration'))||5;$('kCost').textContent='~$'+((COST[v('res')]||0.012)*dur).toFixed(2);
  $('wordCount').textContent=en.trim().split(/\s+/).length;$('charCount').textContent=en.length;
  checkWarn();pushHist(en);saveState();
}
function renderEn(en){const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));$('outEnView').innerHTML=esc(en).replace(/\(([^()]+):(\d+\.?\d*)\)/g,'<span class="weight-token" title="$2">$1</span>');$('outEnView').dataset.raw=en;}
function updAspect(){const [a,b]=v('aspect').split(':').map(Number);const x=$('aspectBox');x.style.width='80px';x.style.height=Math.min(Math.round(80*b/a),90)+'px';}

const getCurTab=()=>document.querySelector('.tab.tab-active').dataset.tab;
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('tab-active'));t.classList.add('tab-active');$('i2vBlock').classList.toggle('hidden',t.dataset.tab!=='i2v');generate();});

const imgState={img:null,imgLast:null};
function wireDrop(k,id){const d=document.querySelector(`[data-drop="${k}"]`),ph=document.querySelector(`[data-ph="${k}"]`),pv=document.querySelector(`[data-preview="${k}"]`),inp=$(id);
  function load(f){const r=new FileReader();r.onload=e=>{pv.src=e.target.result;pv.classList.remove('hidden');ph.classList.add('hidden');imgState[k]=e.target.result;};r.readAsDataURL(f);}
  inp.onchange=e=>{const f=e.target.files[0];if(f)load(f);};
  d.addEventListener('click',()=>inp.click());
  ['dragover','dragenter'].forEach(ev=>d.addEventListener(ev,e=>{e.preventDefault();d.classList.add('border-violet-400');}));
  ['dragleave','drop'].forEach(ev=>d.addEventListener(ev,e=>{e.preventDefault();d.classList.remove('border-violet-400');}));
  d.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f)load(f);});
  document.querySelector(`[data-clear="${k}"]`).onclick=e=>{e.preventDefault();e.stopPropagation();inp.value='';pv.src='';pv.classList.add('hidden');ph.classList.remove('hidden');imgState[k]=null;};}
wireDrop('img','imgFile');wireDrop('imgLast','imgLastFile');

function loadList(k){try{return JSON.parse(localStorage.getItem(k)||"[]")}catch{return[]}}
function saveList(k,a){safeLS(k,JSON.stringify(a.slice(0,50)))}
let sideTab=localStorage.getItem('seedance_sidetab')||'hist';
document.querySelector(`.sideTab[data-side="${sideTab}"]`)?.classList.add('tab-active');
document.querySelectorAll('.sideTab').forEach(b=>b.classList.toggle('tab-active',b.dataset.side===sideTab));
function pushHist(en){const a=loadList('seedance_hist');if(a[0]&&a[0].en===en)return;a.unshift({t:Date.now(),en});saveList('seedance_hist',a);renderList();}
function renderList(){
  const k=sideTab==='hist'?'seedance_hist':'seedance_fav';const arr=loadList(k);const q=$('listSearch').value.toLowerCase();
  const fl=q?arr.filter(it=>it.en.toLowerCase().includes(q)):arr;const ul=$('listView');
  if(!fl.length){ul.innerHTML=`<li class="subtle text-xs">${arr.length?'Не найдено':(sideTab==='hist'?'История пуста':'Нет избранного')}</li>`;return;}
  const groups={};fl.forEach(it=>{const d=new Date(it.t).toLocaleDateString();(groups[d]=groups[d]||[]).push({...it,_i:arr.indexOf(it)});});
  ul.innerHTML='';Object.entries(groups).forEach(([day,items])=>{
    const h=document.createElement('li');h.className="text-[10px] subtle uppercase mt-2 mb-1";h.textContent=day;ul.appendChild(h);
    items.forEach(it=>{const li=document.createElement('li');li.className="bg-black/5 border border-white/10 rounded-lg p-2.5 cursor-pointer flex gap-2";
      li.innerHTML=`<div class="flex-1 min-w-0"><div class="text-[10px] subtle">${new Date(it.t).toLocaleTimeString().slice(0,5)} · ${it.en.replace(/[\n<>]/g,' ').slice(0,50)}…</div><div class="text-xs line-clamp-2 mt-0.5">${it.en.replace(/[<>]/g,'').slice(0,180)}…</div></div><button class="text-xs subtle">✕</button>`;
      li.onclick=()=>{renderEn(it.en);toast('Загружено');};
      li.querySelector('button').onclick=e=>{e.stopPropagation();arr.splice(it._i,1);saveList(k,arr);renderList();};
      ul.appendChild(li);});});
}
$('listSearch').oninput=renderList;
document.querySelectorAll('.sideTab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.sideTab').forEach(x=>x.classList.remove('tab-active'));b.classList.add('tab-active');sideTab=b.dataset.side;safeLS('seedance_sidetab',sideTab);renderList();});
$('clearList').onclick=()=>{if(!confirm('Очистить?'))return;localStorage.removeItem(sideTab==='hist'?'seedance_hist':'seedance_fav');renderList();};
$('favBtn').onclick=()=>{const en=$('outEnView').dataset.raw||$('outEnView').textContent;if(!en)return;const a=loadList('seedance_fav');a.unshift({t:Date.now(),en});saveList('seedance_fav',a);toast('★');renderList();};

$('generate').onclick=generate;
$('reset').onclick=()=>{['subject','character','action','scene','details','negative','motion','ambient','sfx','dialogue','speedRamp','oneLineIdea'].forEach(i=>$(i).value='');document.querySelectorAll('main select').forEach(s=>s.selectedIndex=0);$('aspect').value='16:9';$('duration').value='5s';$('res').value='720p';$('shake').value=0;$('shakeVal').textContent='0%';beatsEl.innerHTML='';shotsEl.innerHTML='';$('useTimeline').checked=$('useShots').checked=$('loopMode').checked=false;};
$('randomBtn').onclick=()=>{const i=IDEAS[Math.floor(Math.random()*IDEAS.length)];$('subject').value=i.subject;$('action').value=i.action;$('scene').value=i.scene;$('details').value=i.details;const p=PRESETS[Math.floor(Math.random()*PRESETS.length)];Object.entries(p.v).forEach(([k,vl])=>$(k).value=vl);generate();};
async function copy(id,btn){const t=id==='outEnView'?$('outEnView').dataset.raw||$('outEnView').textContent:$(id).value;if(!t)return;try{await navigator.clipboard.writeText(t);toast('✓');}catch(e){console.debug(e)}}
$('copyEn').onclick=e=>copy('outEnView',e.currentTarget);$('copyRu').onclick=e=>copy('outRu',e.currentTarget);window.copy=copy;
$('shake').oninput=()=>{$('shakeVal').textContent=$('shake').value+'%';debG();};

function dl(n,c,m='text/plain'){const b=new Blob([c],{type:m}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(u),100);}
$('exportTxt').onclick=()=>dl(`lumen-${Date.now()}.txt`,$('outEnView').dataset.raw||'');
$('exportJson').onclick=()=>dl(`lumen-${Date.now()}.json`,JSON.stringify(collectState(),null,2),'application/json');
function b64(s){return btoa(String.fromCharCode(...new TextEncoder().encode(s)));}
function ub64(s){return new TextDecoder().decode(new Uint8Array([...atob(s)].map(c=>c.charCodeAt(0))));}
$('shareBtn').onclick=async()=>{const u=location.origin+location.pathname+'#s='+b64(JSON.stringify(collectState()));try{await navigator.clipboard.writeText(u);toast('🔗 Ссылка скопирована');}catch{prompt('',u);}};

const FIELDS=['subject','character','action','scene','details','motion','negative','ambient','sfx','dialogue','speedRamp','shot','camera','lens','speed','lighting','time','weather','palette','mood','style','aspect','duration','res','shake'];
const FLAGS=['useWeights','autoQuality','autoNeg','autoGen','useTimeline','useShots','loopMode'];
function collectState(){const o={tab:getCurTab(),locale:$('locale').value,beats:[...beatsEl.querySelectorAll('[draggable]')].map(r=>({t:r.querySelector('.bt').value,cam:r.querySelector('.bc').value,sub:r.querySelector('.bs').value})),shots:[...shotsEl.querySelectorAll('[draggable]')].map(r=>({dur:r.querySelector('.sd').value,cam:r.querySelector('.sc').value,act:r.querySelector('.sa').value,tr:r.querySelector('.st').value}))};FIELDS.forEach(f=>o[f]=$(f).value);FLAGS.forEach(f=>o[f]=$(f).checked);return o;}
function applyState(s){if(!s)return;FIELDS.forEach(f=>{if(s[f]!=null&&$(f))$(f).value=s[f]});if(s.locale)$('locale').value=s.locale;FLAGS.forEach(f=>{if(s[f]!=null&&$(f))$(f).checked=s[f]});beatsEl.innerHTML='';(s.beats||[]).forEach(b=>addBeat(b.t,b.cam,b.sub));shotsEl.innerHTML='';(s.shots||[]).forEach(sh=>addShot(sh.dur,sh.cam,sh.act,sh.tr||'cut'));if(s.tab)document.querySelector(`.tab[data-tab="${s.tab}"]`)?.click();$('shakeVal').textContent=($('shake').value||0)+'%';}
function saveState(){try{safeLS('seedance_state',JSON.stringify(collectState()));}catch(e){console.debug(e)}}
function loadStateFn(){if(location.hash.startsWith('#s=')){try{applyState(JSON.parse(ub64(location.hash.slice(3))));toast('Загружено');return;}catch(e){console.debug(e)}}const r=localStorage.getItem('seedance_state');if(r){try{applyState(JSON.parse(r));}catch(e){console.debug(e)}}}

function syncThemeIcon(){const t=document.documentElement.dataset.theme;const i=document.querySelector('#themeBtn i[data-lucide]');if(i){i.setAttribute('data-lucide',t==='dark'?'moon':'sun');try{window.refreshIcons&&window.refreshIcons()}catch(e){}}}
$('themeBtn').onclick=()=>{const c=document.documentElement.dataset.theme,n=c==='dark'?'light':'dark';document.documentElement.dataset.theme=n;safeLS('seedance_theme',n);syncThemeIcon();};
const sT=localStorage.getItem('seedance_theme');if(sT)document.documentElement.dataset.theme=sT;else if(matchMedia('(prefers-color-scheme: light)').matches)document.documentElement.dataset.theme='light';
setTimeout(syncThemeIcon,150);

const aiModal=$('aiModal'),varsModal=$('varsModal');
$('aiSettingsBtn').onclick=()=>{aiModal.classList.remove('hidden');$('aiBase').value=localStorage.getItem('ai_base')||'https://api.openai.com/v1';$('aiKey').value=localStorage.getItem('ai_key')||'';$('aiModel').value=localStorage.getItem('ai_model')||'gpt-4o-mini';};
$('aiSave').onclick=()=>{safeLS('ai_base',$('aiBase').value);safeLS('ai_key',$('aiKey').value);safeLS('ai_model',$('aiModel').value);aiModal.classList.add('hidden');toast('Сохранено');};
document.querySelectorAll('[data-aip]').forEach(b=>b.onclick=()=>{const p=AIP[b.dataset.aip];$('aiBase').value=p.base;$('aiModel').value=p.model;});

function aiCfg(){return{base:(localStorage.getItem('ai_base')||'https://api.openai.com/v1').replace(/\/$/,''),key:localStorage.getItem('ai_key'),model:localStorage.getItem('ai_model')||'gpt-4o-mini'};}
function needKey(){const c=aiCfg();const local=c.base.includes('localhost')||c.base.includes('11434');if(!c.key&&!local){toast('Нужен AI ключ (⚙ AI)');aiModal.classList.remove('hidden');return null;}return c;}

async function aiCall(messages,{json=false,stream=false,onChunk=null}={}){
  const c=needKey();if(!c)return null;
  const body={model:c.model,messages,temperature:0.85};if(json)body.response_format={type:'json_object'};if(stream)body.stream=true;
  const r=await fetch(c.base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',...(c.key?{'Authorization':'Bearer '+c.key}:{})},body:JSON.stringify(body)});
  if(stream){const rd=r.body.getReader(),de=new TextDecoder();let buf='',full='';while(1){const{done,value}=await rd.read();if(done)break;buf+=de.decode(value,{stream:true});const ls=buf.split('\n');buf=ls.pop()||'';for(const l of ls){if(!l.startsWith('data:'))continue;const d=l.slice(5).trim();if(d==='[DONE]')return full;try{const j=JSON.parse(d);const t=j.choices?.[0]?.delta?.content||'';full+=t;onChunk&&onChunk(t,full);}catch(e){console.debug(e)}}}return full;}
  const j=await r.json();if(j.error){toast('AI: '+j.error.message);return null;}return j.choices?.[0]?.message?.content;
}

$('aiAutoFill').onclick=async()=>{
  const idea=v('oneLineIdea');if(!idea){toast('Введите идею');return;}if(!needKey())return;
  const btn=$('aiAutoFill'),o=btn.textContent;btn.textContent='⏳';btn.disabled=true;
  const sys=`From a one-line idea (any language) produce JSON with cinematic English values for keys: subject, character, action, scene, details, shot, camera, lens, speed, lighting, time, weather, palette, mood, style, ambient, sfx. For selects pick the closest match from these allowed values:\nshot: ${O.shot.join(' | ')}\ncamera: ${O.camera.join(' | ')}\nlens: ${O.lens.join(' | ')}\nspeed: ${O.speed.join(' | ')}\nlighting: ${O.lighting.join(' | ')}\ntime: ${O.time.join(' | ')}\nweather: ${O.weather.join(' | ')}\npalette: ${O.palette.join(' | ')}\nmood: ${O.mood.join(' | ')}\nstyle: ${O.style.join(' | ')}\nReply ONLY as JSON.`;
  const out=await aiCall([{role:'system',content:sys},{role:'user',content:idea}],{json:true});
  if(out){try{applyAiFields(JSON.parse(out));generate();toast('⚡ Заполнено');}catch{toast('AI: не JSON');}}
  btn.textContent=o;btn.disabled=false;
};

$('aiEnhanceBtn').onclick=async()=>{if(!needKey())return;generate();const draft=$('outEnView').dataset.raw;
  const btn=$('aiEnhanceBtn'),o=btn.textContent;btn.textContent='⏳';btn.disabled=true;
  $('outEnView').textContent='';
  const sys='You are a senior cinematographer rewriting prompts for ByteDance Seedance 2.0 text-to-video. Rewrite into vivid cinematic English under 220 words. Keep structure: subject, action, scene, time/weather, lighting, color grading, camera/lens/movement, mood, style, quality tags. Preserve aspect ratio, duration, resolution, negative prompt and any timeline/audio sections.';
  const out=await aiCall([{role:'system',content:sys},{role:'user',content:draft}],{stream:true,onChunk:(_,full)=>{$('outEnView').textContent=full;}});
  if(out){renderEn(out);toast('✨');pushHist(out);}
  btn.textContent=o;btn.disabled=false;};

$('aiCritiqueBtn').onclick=async()=>{if(!needKey())return;generate();
  const out=await aiCall([{role:'system',content:'You are a critique assistant for video prompts. List 3-6 specific issues and concrete fixes in Russian. Be terse, bullet points only.'},{role:'user',content:$('outEnView').dataset.raw}]);
  if(out)alert('🩺 Критика:\n\n'+out);};

/* (was: aiReverseBtn override using prompt() — superseded by askText version below) */

$('abBtn').onclick=async()=>{
  const variants=[
    {label:'A · базовый'},
    {label:'B · широкий план',shot:O.shot[0],camera:'crane up',lens:O.lens[3]},
    {label:'C · крупный план',shot:'close-up',camera:'slow dolly in',lens:'85mm portrait, bokeh'},
    {label:'D · динамика',camera:'tracking shot',speed:'slow motion 120fps',lens:'anamorphic lens with horizontal flares'}
  ];
  const grid=$('varsGrid');grid.innerHTML='';varsModal.classList.remove('hidden');
  $('varsTitle').textContent='4 варианта (выберите лучший)';
  variants.forEach(va=>{const en=buildEn(va);const c=document.createElement('div');c.className="bg-black/10 border border-white/10 rounded-xl p-3 hover:border-violet-400/40 cursor-pointer";
    c.innerHTML=`<div class="font-medium text-sm mb-1">${va.label}</div><div class="text-xs subtle whitespace-pre-wrap max-h-40 overflow-auto scrollbar">${en.replace(/[<>]/g,'').slice(0,400)}…</div>`;
    c.onclick=()=>{renderEn(en);pushHist(en);varsModal.classList.add('hidden');toast('Выбран '+va.label);};grid.appendChild(c);});
};

window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();generate();}if(e.key==='Escape'){aiModal.classList.add('hidden');varsModal.classList.add('hidden');}});

let _gT;function debG(){clearTimeout(_gT);_gT=setTimeout(()=>{if($('autoGen').checked)generate();},500);}
document.querySelectorAll('main input, main select, main textarea').forEach(el=>{el.addEventListener('change',()=>{saveState();debG();});el.addEventListener('input',debG);});

loadStateFn();
if(!v('subject')){$('subject').value="a young woman with silver hair in a translucent neon raincoat";$('action').value="walking slowly through a crowded street, turning to look at the camera";$('scene').value="a futuristic Tokyo alley with holographic signs";$('details').value="rain reflections on the wet asphalt";Object.entries(PRESETS[1].v).forEach(([k,vl])=>$(k).value=vl);}
if(!beatsEl.children.length){addBeat("0–2s","slow dolly in","subject stands still");addBeat("2–5s","push to close-up","subject turns to camera");}
if(!shotsEl.children.length){addShot("3s","wide establishing shot, static","subject walks into frame","cut");addShot("4s","medium tracking shot","same character continues, looks ahead","dissolve");addShot("3s","close-up, slow push-in","same character turns to camera","cut");}
generate();renderList();

/* ============ v4: LIBRARIES ============ */
const SUBJECTS=[
  {n:"Cyberpunk samurai",d:"Воин будущего в чёрной броне с неоновой катаной",v:"a cyberpunk samurai warrior in obsidian armor with a glowing neon katana, cybernetic eye implant, tattered red scarf"},
  {n:"Space marine",d:"Космодесантник в скафандре с винтовкой",v:"a battle-worn space marine in heavy power armor, helmet visor reflecting plasma, holding a futuristic rifle"},
  {n:"Fairy princess",d:"Эльфийка в платье из лепестков",v:"an ethereal fairy princess with translucent gossamer wings, flower-petal dress, glowing freckles"},
  {n:"Vintage detective",d:"Сыщик в плаще и шляпе, нуар",v:"a 1940s noir detective in a long trench coat, fedora pulled low, cigarette smoke curling"},
  {n:"Astronaut",d:"Космонавт в потёртом скафандре",v:"a lone astronaut in a worn white spacesuit, helmet visor reflecting alien stars"},
  {n:"Wizard",d:"Старый маг с посохом",v:"an old wise wizard with a long silver beard, weathered robes, glowing rune-etched staff"},
  {n:"Ninja",d:"Чёрный ниндзя на крышах",v:"a stealthy ninja in black shozoku, only piercing eyes visible, traditional katana on back"},
  {n:"Cowboy",d:"Ковбой в пыльной шляпе",v:"a weather-beaten cowboy in a dusty wide-brimmed hat, leather duster coat, hand resting on revolver"},
  {n:"Mech pilot",d:"Пилот гигантского робота",v:"a young mech pilot in a sleek pressure suit, neural cables connected to her temples"},
  {n:"Tiger",d:"Белый тигр с голубыми глазами",v:"a majestic white Bengal tiger with glowing ice-blue eyes, fur dusted with snow"},
  {n:"Dragon",d:"Древний дракон в облаках",v:"an ancient red dragon with iridescent scales, leathery wings spanning the sky"},
  {n:"Robot",d:"Маленький эмоциональный робот",v:"a small endearing robot with glowing blue eyes, dented metal body, antenna twitching"}
];
const SCENES=[
  {n:"Cyberpunk Tokyo",d:"Неон, дождь, голограммы",v:"a neon-soaked futuristic Tokyo alley, holographic advertisements towering above, rain pouring on wet asphalt with reflections"},
  {n:"Mars desert",d:"Марсианская пустыня",v:"a vast martian-like red desert with jagged rock formations under a pale orange sky, distant dust storm"},
  {n:"Bamboo forest",d:"Бамбуковый лес в тумане",v:"a dense misty bamboo forest at dawn, sun rays piercing through tall stalks, soft moss-covered ground"},
  {n:"Underwater city",d:"Город на дне океана",v:"an ancient sunken city with bioluminescent coral, schools of fish weaving between marble columns"},
  {n:"Alpine road",d:"Серпантин в горах",v:"a winding mountain road carved into alpine cliffs at sunset, golden light kissing snow peaks"},
  {n:"Abandoned city",d:"Постапокалипсис",v:"a post-apocalyptic abandoned city street, cracked concrete overgrown with vines, distant ruins"},
  {n:"Japanese temple",d:"Древний храм с сакурой",v:"an ancient Japanese temple courtyard with stone lanterns, cherry blossom petals swirling in the wind"},
  {n:"Space station",d:"Орбитальная станция",v:"the interior of a sleek orbital space station with curved windows showing Earth below, soft LED panels"},
  {n:"Medieval tavern",d:"Средневековая таверна",v:"a warm candlelit medieval tavern interior, oak beams, fireplace crackling, patrons in shadow"},
  {n:"Desert oasis",d:"Оазис ночью",v:"a desert oasis under a star-filled night sky, palm trees reflecting in still water, sand dunes glowing"},
  {n:"Neon arcade",d:"Игровой автомат-зал",v:"a retro 80s neon arcade interior, CRT screens flickering, fog machine haze, vibrant pink and cyan lights"},
  {n:"Foggy moor",d:"Туманные пустоши",v:"a desolate windswept moor blanketed in thick fog at dawn, gnarled dead trees silhouetted"}
];
const LIGHT_RECIPES=[
  {n:"Rembrandt portrait",d:"Классический портретный свет",v:{lighting:"studio three-point lighting",mood:"melancholic"}},
  {n:"Golden hour magic",d:"Тёплый закатный свет",v:{lighting:"golden hour sunlight",time:"golden hour",palette:"warm sepia",mood:"romantic"}},
  {n:"Neon noir",d:"Цветные неоновые лампы",v:{lighting:"colored gels (teal & orange)",palette:"teal and orange",mood:"mysterious"}},
  {n:"Single candle",d:"Одна свеча в темноте",v:{lighting:"candlelight glow",time:"midnight",palette:"warm sepia",mood:"unsettling"}},
  {n:"Volumetric god rays",d:"Лучи через окно/туман",v:{lighting:"volumetric god rays",weather:"light mist",mood:"dreamy and ethereal"}},
  {n:"Hard noir",d:"Жёсткий контурный свет",v:{lighting:"hard rim lighting",palette:"high-contrast noir",mood:"tense and suspenseful"}},
  {n:"Soft window",d:"Мягкий рассеянный из окна",v:{lighting:"soft natural light",time:"morning",mood:"peaceful and serene"}},
  {n:"Moonlight blue",d:"Холодный лунный свет",v:{lighting:"moonlight",time:"midnight",palette:"cold cyan blues",mood:"melancholic"}},
  {n:"Practical neons",d:"Вывески, фонари в кадре",v:{lighting:"practical neon signs",time:"night",palette:"vibrant neon",mood:"energetic and dynamic"}},
  {n:"Chiaroscuro",d:"Глубокая светотень",v:{lighting:"cinematic chiaroscuro",palette:"high-contrast noir",mood:"epic and cinematic"}}
];
const LENS_PSY={"50mm prime, shallow depth of field":"естественное восприятие, ровно как глаз","35mm cinematic":"вовлекающий, репортажный","85mm portrait, bokeh":"интимный, изолирует героя","24mm wide-angle":"драматичный, ощущение пространства","anamorphic lens with horizontal flares":"эпичный кинолук, широкий формат","macro lens":"микро-детали, текстура","fisheye":"сюр, искажение","tilt-shift miniature":"эффект игрушечного мира"};

function openLib(title,items,onPick){
  $('libTitle').textContent=title; const g=$('libGrid'); g.innerHTML='';
  items.forEach(it=>{const c=document.createElement('button'); c.className="dir-card text-left p-3 rounded-xl border border-white/10 bg-black/10";
    c.innerHTML=`<div class="font-medium text-sm">${it.n}</div><div class="text-[11px] subtle mt-0.5">${it.d}</div>`;
    c.onclick=()=>{onPick(it); libModal.classList.add('hidden');}; g.appendChild(c);});
  libModal.classList.remove('hidden');
}
$('libSubjBtn').onclick=()=>openLib('📚 Каталог героев',SUBJECTS,it=>{$('subject').value=it.v; generate();});
$('libSceneBtn').onclick=()=>openLib('🌆 Каталог сцен',SCENES,it=>{$('scene').value=it.v; generate();});
$('libLightBtn').onclick=()=>openLib('💡 Световые рецепты',LIGHT_RECIPES,it=>{Object.entries(it.v).forEach(([k,vl])=>{if($(k))$(k).value=vl}); generate();});

/* ============ Lens psychology tooltips ============ */
const lensSel=$('lens');
const lensHint=document.createElement('div'); lensHint.className="text-[11px] subtle mt-1"; lensSel.parentElement.appendChild(lensHint);
function updLensHint(){lensHint.textContent='💡 '+(LENS_PSY[lensSel.value]||'');}
lensSel.addEventListener('change',updLensHint); updLensHint();

/* ============ Inline ✨ buttons ============ */
['subject','character','action','scene','details'].forEach(id=>{
  const inp=$(id); if(!inp) return;
  const wrap=document.createElement('div'); wrap.className="relative";
  inp.parentElement.insertBefore(wrap,inp); wrap.appendChild(inp);
  inp.classList.add('!pr-9');
  const b=document.createElement('button'); b.type='button'; b.className="absolute right-2 top-1/2 -translate-y-1/2 text-sm hover:scale-110 transition"; b.title="AI расширить это поле"; b.innerHTML="✨";
  b.onclick=async()=>{if(!needKey())return; const cur=inp.value.trim(); if(!cur){toast('Сначала впишите что-нибудь'); return;}
    b.innerHTML='⏳';
    const ctx=`Field: ${id}. Other context: subject=${v('subject')}, scene=${v('scene')}, style=${v('style')}, mood=${v('mood')}.`;
    const out=await aiCall([{role:'system',content:'You expand a single short phrase into vivid cinematic English (max 25 words). Return only the rewritten phrase, no quotes, no preamble.'},{role:'user',content:ctx+'\n\nPhrase: '+cur}]);
    if(out){inp.value=out.trim().replace(/^["']|["']$/g,''); generate();}
    b.innerHTML='✨';};
  wrap.appendChild(b);
});

/* ============ Vision AI for I2V image ============ */
async function runVision(dataUrl){
  if(!needKey()) return;
  const c=aiCfg(); if(!c.key){toast('Нужен AI ключ');return;}
  if(!confirm('🖼 Распознать через AI Vision и заполнить поля? (нужна vision-модель: gpt-4o, gpt-4o-mini, claude-3-5-sonnet)')) return;
  toast('🖼 AI смотрит...');
  try{
    const r=await fetch(c.base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},body:JSON.stringify({
      model:c.model,
      response_format:{type:'json_object'},
      messages:[{role:'user',content:[
        {type:'text',text:'Describe this image for a video-generation prompt. Reply ONLY as JSON with these keys (cinematic English values): subject, scene, details, style, mood, lighting, palette, time, weather. For lighting/mood/style/palette/time/weather pick short cinematic terms.'},
        {type:'image_url',image_url:{url:dataUrl}}
      ]}]
    })});
    const j=await r.json();
    if(j.error){toast('Vision: '+j.error.message); console.error(j.error); return;}
    const txt=j.choices?.[0]?.message?.content;
    if(!txt){toast('Vision: пустой ответ'); return;}
    applyAiFields(JSON.parse(txt));
    generate(); toast('✓ Распознано');
  }catch(e){toast('Vision ошибка: '+e.message); console.error(e);}
}
// Hook into imgState.img writes via setter — works for both file picker AND drag-drop, after FileReader finishes
let _imgVal=imgState.img,_imgLastVal=imgState.imgLast;
Object.defineProperty(imgState,'img',{get:()=>_imgVal,set:v=>{const fresh=v && v!==_imgVal; _imgVal=v; if(fresh) runVision(v);},configurable:true});
Object.defineProperty(imgState,'imgLast',{get:()=>_imgLastVal,set:v=>{_imgLastVal=v;},configurable:true});

/* ============ AI refine buttons ============ */
document.querySelectorAll('[data-refine]').forEach(b=>b.onclick=async()=>{
  if(!needKey())return; const cur=$('outEnView').dataset.raw||'';
  if(!cur){toast('Сначала сгенерируйте');return;}
  const op=b.dataset.refine; const o=b.textContent; b.textContent='⏳';
  $('outEnView').textContent='';
  const out=await aiCall([{role:'system',content:`Rewrite the prompt to be ${op}. Keep the structure (subject/scene/camera/lighting/etc), keep aspect/duration/resolution, keep negative prompt. Reply only with the rewritten prompt.`},{role:'user',content:cur}],{stream:true,onChunk:(_,full)=>{$('outEnView').textContent=full;}});
  if(out){renderEn(out); pushHist(out); toast('✓ '+op);}
  b.textContent=o;
});
$('negSuggestBtn').onclick=async()=>{
  if(!needKey()) return; const cur=$('outEnView').dataset.raw||''; if(!cur){toast('Сначала сгенерируйте');return;}
  const out=await aiCall([{role:'system',content:'Suggest 5-8 negative prompt tokens (comma-separated, English) most relevant to fix likely artifacts in this video prompt. Return only the comma-separated list.'},{role:'user',content:cur}]);
  if(out){$('negative').value=(v('negative')?v('negative')+', ':'')+out.trim(); generate(); toast('⛔ negative обновлён');}
};

/* ============ Replace prompt() with modal ============ */
function askText(title,hint){return new Promise(res=>{
  $('textTitle').textContent=title; $('textHint').textContent=hint||''; $('textArea').value=''; textModal.classList.remove('hidden');
  const ok=$('textOk'); const cleanup=()=>{ok.onclick=null;};
  ok.onclick=()=>{const v=$('textArea').value.trim(); textModal.classList.add('hidden'); cleanup(); res(v||null);};
});}
$('aiReverseBtn').onclick=async()=>{if(!needKey())return;
  const src=await askText('🔍 Распознать промт','Вставьте готовый промт для распознавания'); if(!src)return; toast('🔍...');
  const sys='Extract fields from a video-generation prompt. Reply ONLY as JSON with keys: subject, character, action, scene, details, shot, camera, lens, speed, lighting, time, weather, palette, mood, style, ambient, sfx, dialogue, negative, aspect, duration, res. Use closest cinematic English term for selects.';
  const out=await aiCall([{role:'system',content:sys},{role:'user',content:src}],{json:true});
  if(out){try{applyAiFields(JSON.parse(out)); generate(); toast('✓');}catch{toast('Ошибка JSON');}}
};

/* ============ Critique panel instead of alert ============ */
$('aiCritiqueBtn').onclick=async()=>{if(!needKey())return; generate();
  $('critBody').innerHTML='⏳ Анализирую...'; critPanel.classList.remove('hidden');
  const out=await aiCall([{role:'system',content:'You are a senior cinematographer giving critique on a video prompt. List 4-7 specific issues and concrete fixes. Use Russian, terse markdown bullet points.'},{role:'user',content:$('outEnView').dataset.raw}]);
  if(out){const html=out.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/^- /gm,'• ').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>'); $('critBody').innerHTML=html;}
};

/* ============ Compare modal ============ */
$('cmpBtn').onclick=()=>{$('cmpA').value=$('outEnView').dataset.raw||''; $('cmpB').value=''; $('cmpOut').innerHTML=''; cmpModal.classList.remove('hidden');};
$('cmpDiff').onclick=()=>{
  const a=$('cmpA').value.split('\n'),b=$('cmpB').value.split('\n'); const max=Math.max(a.length,b.length); const out=[];
  for(let i=0;i<max;i++){const la=a[i]||'',lb=b[i]||'';
    if(la===lb) out.push(`<span class="subtle">  ${la.replace(/[<>]/g,'')}</span>`);
    else{if(la) out.push(`<span style="color:#f87171">- ${la.replace(/[<>]/g,'')}</span>`); if(lb) out.push(`<span style="color:#4ade80">+ ${lb.replace(/[<>]/g,'')}</span>`);}}
  $('cmpOut').innerHTML=out.join('\n');
};

/* ============ Markdown export ============ */
$('exportMd').onclick=()=>{const en=$('outEnView').dataset.raw||''; const ru=$('outRu').value;
  const md=`# Lumen Prompt\n\n_Generated by Lumen — Cinematic Prompt Studio (by Armen) · ${new Date().toLocaleString()}_\n\n## English\n\n\`\`\`\n${en}\n\`\`\`\n\n## Русский\n\n\`\`\`\n${ru}\n\`\`\`\n\n## Параметры\n\n- **Aspect:** ${v('aspect')}\n- **Duration:** ${v('duration')}\n- **Resolution:** ${v('res')}\n- **Style:** ${v('style')}\n- **Mood:** ${v('mood')}\n`;
  dl(`lumen-${Date.now()}.md`,md,'text/markdown');};

/* ============ Speak (TTS) ============ */
$('speakBtn').onclick=()=>{const t=$('outEnView').dataset.raw||''; if(!t) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang='en-US'; u.rate=0.95; speechSynthesis.speak(u); toast('🔊');};

/* (was: Tags in favorites manual askText — superseded by AI auto-tags below) */
const origRender=renderList;
window.renderList=function(){origRender(); if(sideTab!=='fav') return;
  const arr=loadList('seedance_fav'); const tags=[...new Set(arr.flatMap(x=>x.tags||[]))]; if(!tags.length) return;
  const ul=$('listView'); const bar=document.createElement('li'); bar.className="flex flex-wrap gap-1 mb-2";
  bar.innerHTML='<span class="text-[10px] subtle self-center mr-1">тэги:</span>'+tags.map(t=>`<button class="soft-btn text-[10px] px-2 py-0.5 rounded-full" data-tag="${t}">#${t}</button>`).join('');
  ul.insertBefore(bar,ul.firstChild);
  bar.querySelectorAll('[data-tag]').forEach(b=>b.onclick=()=>{$('listSearch').value=b.dataset.tag; renderList();});
};

/* ============ Floating chat (natural language editing) ============ */
$('chatToggle').onclick=()=>chatPanel.classList.toggle('hidden');
function chatAdd(role,txt){const log=$('chatLog'); const el=document.createElement('div');
  el.className=role==='user'?'bg-violet-500/20 rounded-lg p-2 ml-6':'bg-black/20 rounded-lg p-2 mr-6';
  el.textContent=txt; log.appendChild(el); log.scrollTop=log.scrollHeight;}
async function chatRun(){
  const q=$('chatInput').value.trim(); if(!q) return; if(!needKey()) return;
  chatAdd('user',q); $('chatInput').value=''; chatAdd('ai','⏳...');
  const log=$('chatLog'); const last=log.lastChild;
  const state=collectState();
  const sys=`You are an editor for a video prompt form. Given the current form state (JSON) and user's instruction, return ONLY a JSON patch with the keys to change. Available keys: ${[...FIELDS,...FLAGS].join(', ')}. For select fields use values from the allowed lists. Reply ONLY with JSON.\n\nAllowed values:\nshot: ${O.shot.join(' | ')}\ncamera: ${O.camera.join(' | ')}\nlighting: ${O.lighting.join(' | ')}\nstyle: ${O.style.join(' | ')}\nmood: ${O.mood.join(' | ')}\ntime: ${O.time.join(' | ')}\nweather: ${O.weather.join(' | ')}\npalette: ${O.palette.join(' | ')}`;
  const out=await aiCall([{role:'system',content:sys},{role:'user',content:'Current state:\n'+JSON.stringify(state,(k,vl)=>['beats','shots'].includes(k)?undefined:vl)+'\n\nInstruction: '+q}],{json:true});
  if(out){try{const patch=JSON.parse(out); const changed=[]; Object.entries(patch).forEach(([k,vl])=>{const el=$(k); if(!el) return; if(el.type==='checkbox') el.checked=!!vl; else el.value=vl; changed.push(k);});
    last.textContent='✓ Изменено: '+changed.join(', '); generate();}catch{last.textContent='Не удалось распарсить ответ AI';}}
  else last.textContent='Ошибка AI';
}
$('chatSend').onclick=chatRun; $('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')chatRun();});

/* ============ Undo / Redo ============ */
const HIST=[],FUTURE=[]; let _ignoreState=false;
function snapshot(){if(_ignoreState)return; const s=JSON.stringify(collectState()); if(HIST[HIST.length-1]===s) return; HIST.push(s); if(HIST.length>50)HIST.shift(); FUTURE.length=0; updUndoBtns();}
function updUndoBtns(){$('undoBtn').disabled=HIST.length<2; $('redoBtn').disabled=!FUTURE.length;}
$('undoBtn').onclick=()=>{if(HIST.length<2)return; FUTURE.push(HIST.pop()); _ignoreState=true; applyState(JSON.parse(HIST[HIST.length-1])); _ignoreState=false; generate(); updUndoBtns();};
$('redoBtn').onclick=()=>{const s=FUTURE.pop(); if(!s)return; HIST.push(s); _ignoreState=true; applyState(JSON.parse(s)); _ignoreState=false; generate(); updUndoBtns();};
document.querySelectorAll('main input, main select, main textarea').forEach(el=>el.addEventListener('change',snapshot));
snapshot();

/* ============ Slash commands (canonical bindSlash below) ============ */

/* ============ Bug fixes ============ */
// Reset shake slider
const origReset=$('reset').onclick; $('reset').onclick=()=>{origReset(); $('shake').value=0; $('shakeVal').textContent='0%'; $('useWeights').checked=false; $('autoQuality').checked=true; $('autoNeg').checked=true; HIST.length=0; FUTURE.length=0; snapshot();};

// Better Ctrl+Z/Y
window.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){e.preventDefault(); $('undoBtn').click();}
  if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){e.preventDefault(); $('redoBtn').click();}
});

/* ============ Progress indicator ============ */
const progBar=document.createElement('div'); progBar.className="text-xs subtle mt-2 flex items-center gap-2";
$('warnings').parentElement.insertBefore(progBar,$('warnings'));
function updProgress(){
  const main=['subject','action','scene','details','character'];
  const filled=main.filter(f=>v(f)).length;
  const pct=Math.round(filled/main.length*100);
  progBar.innerHTML=`<div class="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all" style="width:${pct}%"></div></div><span>${filled}/${main.length}</span>`;
}
// v7: single generate wrapper + bus hooks (replaces 3-level _origGen chain)
const _baseGen=generate;
let _genBusy=false;
window.generate=function(){
  if(_genBusy)return;
  _genBusy=true;
  try{
    if(!progBar.parentElement)$('warnings').parentElement.insertBefore(progBar,$('warnings'));
    _baseGen();
    updProgress();
    bus.emit('after-generate');
  }finally{_genBusy=false;}
};
updProgress();

/* ============ v5/v7: BUGFIXES ============ */
// Reset HIST via bus (no chain)
bus.on('reset-after',()=>{HIST.length=0;FUTURE.length=0;snapshot();updUndoBtns();});
// hook reset onclick once
(function(){const r=$('reset').onclick;$('reset').onclick=()=>{r&&r();bus.emit('reset-after');};})();
// Slash commands in ALL text fields
const _applyPreset=i=>{Object.entries(PRESETS[i].v).forEach(([k,vl])=>$(k).value=vl);generate();};
const _setTheme=t=>{document.documentElement.dataset.theme=t;safeLS('seedance_theme',t);};
const SLASH_CMDS={
  '/random':()=>$('randomBtn').click(),
  '/clear':()=>$('reset').click(),
  '/dark':()=>_setTheme('dark'),
  '/light':()=>_setTheme('light'),
  '/cinema':()=>_applyPreset(0),
  '/cyberpunk':()=>_applyPreset(1),
  '/anime':()=>_applyPreset(2),
  '/horror':()=>_applyPreset(5),
  '/score':()=>$('scoreBtn').click(),
  '/iterate':()=>$('iterBtn').click(),
  '/preview':()=>$('previewBtn').click()
};
function bindSlash(el){
  el.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    const v0=el.value.trim();
    const fn=SLASH_CMDS[v0];
    if(!fn)return;
    e.preventDefault();el.value='';fn();toast('▶ '+v0);
  });
}
['subject','character','action','scene','details','motion'].forEach(id=>{const el=$(id);if(el)bindSlash(el);});
// Vision skip-confirm in session
let _visionSkip=false;
window.runVision=async function(dataUrl){if(!needKey())return;const c=aiCfg();if(!c.key){toast('Нужен ключ');return;}
  if(!_visionSkip){const ok=confirm('🖼 Распознать через AI Vision? (модель должна поддерживать vision)\n\nOK=да и больше не спрашивать в этой сессии. Cancel=пропустить.');if(!ok)return;_visionSkip=true;}
  toast('🖼 AI смотрит...');
  try{const r=await fetch(c.base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},body:JSON.stringify({model:c.model,response_format:{type:'json_object'},messages:[{role:'user',content:[{type:'text',text:'Describe this image for video generation. Reply ONLY as JSON with keys: subject, scene, details, style, mood, lighting, palette, time, weather. Use cinematic English.'},{type:'image_url',image_url:{url:dataUrl}}]}]})});
    const j=await r.json();if(j.error){toast('Vision: '+j.error.message);return;}const t=j.choices?.[0]?.message?.content;if(!t)return;applyAiFields(JSON.parse(t));generate();toast('✓');}catch(e){toast('Vision: '+e.message);}};

/* ============ v5: COMMAND PALETTE (Ctrl+K) ============ */
const cmdPalHTML=`<div id="cmdPal" class="hidden fixed inset-0 z-[60] grid place-items-start pt-24 p-4 bg-black/60 backdrop-blur" onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="glass rounded-2xl p-3 max-w-xl w-full" onclick="event.stopPropagation()">
    <input id="cmdInp" class="field text-base" placeholder="🔍 команда, пресет, действие..." autocomplete="off"/>
    <div id="cmdList" class="mt-2 max-h-80 overflow-auto scrollbar"></div>
    <div class="text-[10px] subtle mt-1 px-2">↑↓ навигация · Enter применить · Esc закрыть</div>
  </div></div>`;
document.body.insertAdjacentHTML('beforeend',cmdPalHTML);
const CMDS=[
  {n:'🎲 Случайная идея',h:()=>$('randomBtn').click()},
  {n:'✨ AI улучшить',h:()=>$('aiEnhanceBtn').click()},
  {n:'🩺 Критика',h:()=>$('aiCritiqueBtn').click()},
  {n:'🎲 4 варианта',h:()=>$('abBtn').click()},
  {n:'📊 Сравнить',h:()=>$('cmpBtn').click()},
  {n:'🔗 Поделиться ссылкой',h:()=>$('shareBtn').click()},
  {n:'⚙ AI настройки',h:()=>$('aiSettingsBtn').click()},
  {n:'🌓 Сменить тему',h:()=>$('themeBtn').click()},
  {n:'📚 Каталог героев',h:()=>$('libSubjBtn').click()},
  {n:'🌆 Каталог сцен',h:()=>$('libSceneBtn').click()},
  {n:'💡 Световые рецепты',h:()=>$('libLightBtn').click()},
  {n:'💬 Открыть чат',h:()=>chatPanel.classList.remove('hidden')},
  {n:'📋 Сбросить форму',h:()=>$('reset').click()},
  {n:'↶ Undo',h:()=>$('undoBtn').click()},
  {n:'↷ Redo',h:()=>$('redoBtn').click()},
  {n:'🔊 Озвучить',h:()=>$('speakBtn').click()},
  {n:'.txt',h:()=>$('exportTxt').click()},
  {n:'.md',h:()=>$('exportMd').click()},
  {n:'.json',h:()=>$('exportJson').click()}
];
PRESETS.forEach(p=>CMDS.push({n:'Пресет: '+p.name,h:()=>{Object.entries(p.v).forEach(([k,vl])=>$(k).value=vl);generate();}}));
DIRS.forEach(d=>CMDS.push({n:'Стиль: '+d.name,h:()=>{Object.entries(d.v).forEach(([k,vl])=>{if($(k))$(k).value=vl;});generate();}}));
GENRES.forEach(g=>CMDS.push({n:'Жанр: '+g.name,h:()=>{Object.entries(g.v).forEach(([k,vl])=>{if($(k))$(k).value=vl;});generate();}}));
let _cmdSel=0;
function renderCmd(q=''){const ql=q.toLowerCase();const list=CMDS.filter(c=>c.n.toLowerCase().includes(ql)).slice(0,30);_cmdSel=Math.min(_cmdSel,list.length-1);if(_cmdSel<0)_cmdSel=0;
  $('cmdList').innerHTML=list.map((c,i)=>`<div class="cmd-item px-3 py-2 rounded-lg cursor-pointer text-sm ${i===_cmdSel?'bg-violet-500/30':''}" data-i="${i}">${c.n}</div>`).join('');
  $('cmdList').querySelectorAll('.cmd-item').forEach(el=>{el.onmouseenter=()=>{_cmdSel=+el.dataset.i;renderCmd($('cmdInp').value);};el.onclick=()=>{list[+el.dataset.i].h();$('cmdPal').classList.add('hidden');};});
  return list;
}
function openCmdPal(){$('cmdInp').value='';_cmdSel=0;renderCmd();$('cmdPal').classList.remove('hidden');setTimeout(()=>$('cmdInp').focus(),0);}
$('cmdInp').addEventListener('input',e=>renderCmd(e.target.value));
$('cmdInp').addEventListener('keydown',e=>{const list=renderCmd($('cmdInp').value);if(e.key==='ArrowDown'){e.preventDefault();_cmdSel=Math.min(_cmdSel+1,list.length-1);renderCmd($('cmdInp').value);}else if(e.key==='ArrowUp'){e.preventDefault();_cmdSel=Math.max(_cmdSel-1,0);renderCmd($('cmdInp').value);}else if(e.key==='Enter'){e.preventDefault();list[_cmdSel]&&list[_cmdSel].h();$('cmdPal').classList.add('hidden');}else if(e.key==='Escape'){$('cmdPal').classList.add('hidden');}});
window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openCmdPal();}});

/* ============ v5: AI IMAGE PREVIEW (first frame) ============ */
const previewBlock=document.createElement('div');previewBlock.className="glass rounded-2xl p-5 mt-5";
previewBlock.innerHTML=`<div class="flex items-center justify-between mb-3 gap-2 flex-wrap"><h2 class="font-semibold">🖼 AI превью первого кадра</h2><div class="flex gap-2"><select id="previewModel" class="field !w-auto !py-1.5 text-xs"><option value="dall-e-3">DALL·E 3</option><option value="gpt-image-1">gpt-image-1</option></select><button id="previewBtn" class="btn-primary px-3 py-1.5 rounded-lg text-xs">🎨 Сгенерировать кадр</button></div></div><div id="previewImg" class="hidden"></div><p class="text-[11px] subtle">Использует image-API провайдера. Промт автоматически адаптируется под still-image.</p>`;
document.querySelector('aside').appendChild(previewBlock);
$('previewBtn').onclick=async()=>{if(!needKey())return;const c=aiCfg();if(!c.key)return;const en=$('outEnView').dataset.raw||'';if(!en){toast('Сначала сгенерируйте');return;}
  $('previewBtn').textContent='⏳';$('previewImg').classList.add('hidden');
  try{const stillPrompt=en.split('\n')[0]+', single still cinematic frame, '+v('lighting')+', '+v('palette');
    const r=await fetch(c.base+'/images/generations',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},body:JSON.stringify({model:$('previewModel').value,prompt:stillPrompt.slice(0,3800),size:v('aspect')==='9:16'?'1024x1792':v('aspect')==='1:1'?'1024x1024':'1792x1024',n:1})});
    const j=await r.json();if(j.error){toast('Image: '+j.error.message);return;}const url=j.data?.[0]?.url||(j.data?.[0]?.b64_json?'data:image/png;base64,'+j.data[0].b64_json:null);
    if(url){$('previewImg').innerHTML=`<img src="${url}" class="w-full rounded-lg mb-2"/><div class="flex gap-2"><a href="${url}" download="preview.png" class="soft-btn text-xs px-2 py-1">⬇ Скачать</a><button onclick="navigator.clipboard.writeText('${url}');toast('URL скопирован')" class="soft-btn text-xs px-2 py-1">📋 URL</button></div>`;$('previewImg').classList.remove('hidden');toast('✓');}
  }catch(e){toast('Image: '+e.message);}finally{$('previewBtn').textContent='🎨 Сгенерировать кадр';}};

/* ============ v5: AUTO-ITERATE LOOP ============ */
const iterBtn=document.createElement('button');iterBtn.id='iterBtn';iterBtn.className="soft-btn text-xs px-3 py-1.5";iterBtn.innerHTML='🔄 Auto-iterate';iterBtn.title='AI критикует и сам применяет правки 3 раунда';
$('aiReverseBtn').parentElement.appendChild(iterBtn);
iterBtn.onclick=async()=>{if(!needKey())return;generate();const o=iterBtn.textContent;
  for(let i=1;i<=3;i++){iterBtn.textContent=`🔄 раунд ${i}/3...`;
    const cur=$('outEnView').dataset.raw;
    const out=await aiCall([{role:'system',content:'You are a senior cinematographer. Critique and IMPROVE this video prompt in one pass. Reply with ONLY the improved prompt, no commentary. Keep aspect/duration/resolution/negative.'},{role:'user',content:cur}]);
    if(!out)break;renderEn(out);pushHist(out);await new Promise(r=>setTimeout(r,300));}
  iterBtn.textContent=o;toast('✓ 3 раунда');};

/* ============ v5: VARIANTS MEMORY ============ */
const _origAB=$('abBtn').onclick;$('abBtn').onclick=async()=>{_origAB&&_origAB();
  setTimeout(()=>{const cards=$('varsGrid').children;[...cards].forEach((card,i)=>{const star=document.createElement('button');star.className="soft-btn text-xs px-2 py-1 mt-2";star.innerHTML='★ В избранное';star.onclick=ev=>{ev.stopPropagation();const txt=card.querySelector('div.text-xs').textContent.replace(/…$/,'');const a=loadList('seedance_fav');a.unshift({t:Date.now(),en:txt,tags:['variant-'+'ABCD'[i]]});saveList('seedance_fav',a);toast('★');renderList();};card.appendChild(star);});},100);};

/* ============ v5: CHARACTER CONSISTENCY auto-vsivanie ============ */
const consistBtn=document.createElement('button');consistBtn.className="soft-btn text-xs px-3 py-1.5 ml-2";consistBtn.innerHTML='🎭 Авто-токен героя';consistBtn.title='AI создаст уникальный consistency-токен и вошьёт во все шоты';
$('useShots').parentElement.appendChild(consistBtn);
consistBtn.onclick=async()=>{if(!v('subject')){toast('Заполни subject');return;}if(!needKey())return;consistBtn.textContent='⏳';
  const out=await aiCall([{role:'system',content:'Create a unique consistency token for video multi-shot. Format: "same character throughout: [3-5 specific visual features in English]". Reply with ONLY the line.'},{role:'user',content:v('subject')+(v('character')?'. '+v('character'):'')}]);
  if(out){$('character').value=out.trim().replace(/^["']|["']$/g,'');[...shotsEl.querySelectorAll('.sc')].forEach(el=>{if(!el.value.includes('same character'))el.value=(el.value+', same character').replace(/^,\s*/,'');});generate();toast('✓ Токен создан');}
  consistBtn.textContent='🎭 Авто-токен героя';};

/* ============ v5: RULE OF THIRDS overlay ============ */
const aspBox=$('aspectBox');aspBox.style.position='relative';
const grid=document.createElement('div');grid.style.cssText='position:absolute;inset:0;pointer-events:none;background:linear-gradient(to right,transparent 33%,rgba(255,255,255,.3) 33%,rgba(255,255,255,.3) 33.5%,transparent 33.5%,transparent 66%,rgba(255,255,255,.3) 66%,rgba(255,255,255,.3) 66.5%,transparent 66.5%),linear-gradient(to bottom,transparent 33%,rgba(255,255,255,.3) 33%,rgba(255,255,255,.3) 33.5%,transparent 33.5%,transparent 66%,rgba(255,255,255,.3) 66%,rgba(255,255,255,.3) 66.5%,transparent 66.5%);';aspBox.appendChild(grid);

/* ============ v5: BEATS AUTO-GENERATE ============ */
const beatsAuto=document.createElement('button');beatsAuto.className="soft-btn text-xs px-3 py-1.5 ml-2";beatsAuto.innerHTML='✨ AI разбить на beats';
$('addBeat').parentElement.appendChild(beatsAuto);
beatsAuto.onclick=async()=>{if(!needKey())return;const en=$('outEnView').dataset.raw||'';if(!en){toast('Сначала сгенерируйте');return;}beatsAuto.textContent='⏳';
  const dur=parseInt(v('duration'))||5;const n=Math.min(5,Math.max(3,Math.round(dur/2)));
  const out=await aiCall([{role:'system',content:`Break this video prompt into exactly ${n} timeline beats. Reply ONLY as JSON: {"beats":[{"t":"0-2s","cam":"camera action","sub":"subject action"},...]}. English, terse.`},{role:'user',content:en}],{json:true});
  if(out){try{const d=JSON.parse(out);beatsEl.innerHTML='';d.beats.forEach(b=>addBeat(b.t,b.cam,b.sub));$('useTimeline').checked=true;generate();toast('✓ '+d.beats.length+' beats');}catch{toast('JSON err');}}
  beatsAuto.textContent='✨ AI разбить на beats';};

/* ============ v5: PROMPT SCORING (5-axis) ============ */
const scoreBox=document.createElement('div');scoreBox.id='scoreBox';scoreBox.className="text-xs mt-2 hidden bg-black/10 rounded-lg p-3 border border-white/10";
$('outEnView').parentElement.insertBefore(scoreBox,$('outEnView').nextSibling);
const scoreBtn=document.createElement('button');scoreBtn.id='scoreBtn';scoreBtn.className="soft-btn text-[11px] px-2 py-1 rounded";scoreBtn.innerHTML='📊 Score';scoreBtn.title='AI оценит промт по 5 осям';
$('negSuggestBtn').parentElement.appendChild(scoreBtn);
scoreBtn.onclick=async()=>{if(!needKey())return;const en=$('outEnView').dataset.raw||'';if(!en)return;scoreBtn.textContent='⏳';
  const out=await aiCall([{role:'system',content:'Score this video prompt on 5 axes 0-10. Reply ONLY as JSON: {"clarity":N,"specificity":N,"cinematography":N,"mood":N,"executability":N,"weakest":"axis name","tip":"one short fix in Russian"}'},{role:'user',content:en}],{json:true});
  if(out){try{const d=JSON.parse(out);
    const lab={clarity:'Clarity',specificity:'Specificity',cinematography:'Cinematography',mood:'Mood',executability:'Executability'};
    scoreBox.innerHTML=Object.entries(lab).map(([k,l])=>{const n=d[k]||0;const cl=n>=8?'#4ade80':n>=5?'#facc15':'#f87171';return `<div class="flex items-center gap-2 mb-1"><span class="w-28 subtle">${l}</span><div class="flex-1 h-1.5 bg-black/30 rounded"><div style="width:${n*10}%;height:100%;background:${cl};border-radius:inherit"></div></div><span class="w-6 text-right">${n}</span></div>`;}).join('')+`<div class="mt-2 subtle">⚠ слабее всего: <b>${d.weakest}</b></div><div class="text-amber-400">💡 ${d.tip}</div>`;
    scoreBox.classList.remove('hidden');}catch{toast('JSON err');}}
  scoreBtn.textContent='📊 Score';};

/* ============ v5: PREDICT FAILURE MODES ============ */
const failBtn=document.createElement('button');failBtn.className="soft-btn text-[11px] px-2 py-1 rounded";failBtn.innerHTML='🔮 Риски';failBtn.title='AI предскажет где могут быть артефакты';
$('negSuggestBtn').parentElement.appendChild(failBtn);
failBtn.onclick=async()=>{if(!needKey())return;const en=$('outEnView').dataset.raw||'';if(!en)return;failBtn.textContent='⏳';
  const out=await aiCall([{role:'system',content:'Predict likely artifacts/failures when generating this video prompt. Be specific (hands, faces, motion, text, etc). Reply in Russian, terse markdown bullets, max 5.'},{role:'user',content:en}]);
  if(out){$('critBody').innerHTML='<div class="font-semibold mb-2">🔮 Прогноз рисков</div>'+out.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/^- /gm,'• ').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');critPanel.classList.remove('hidden');}
  failBtn.textContent='🔮 Риски';};

/* ============ v5: VOICE INPUT ============ */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){const micBtn=document.createElement('button');micBtn.className="soft-btn text-xs px-3 py-1.5 ml-2";micBtn.innerHTML='🎤';micBtn.title='Голосовой ввод (расскажи идею)';
  $('oneLineIdea').parentElement.appendChild(micBtn);
  let rec=null;micBtn.onclick=()=>{if(rec){rec.stop();return;}rec=new SR();rec.lang=$('locale').value==='ru'?'ru-RU':'en-US';rec.continuous=false;rec.interimResults=true;
    rec.onresult=ev=>{const r=ev.results[ev.results.length-1];$('oneLineIdea').value=r[0].transcript;};
    rec.onend=()=>{micBtn.innerHTML='🎤';rec=null;toast('🎤 готово');};
    rec.onerror=e=>{toast('🎤 '+e.error);micBtn.innerHTML='🎤';rec=null;};
    rec.start();micBtn.innerHTML='🔴';toast('🎤 говорите...');};}

/* ============ v5/v7: GENERATION COUNTER (via bus, no chain) ============ */
const genCount=parseInt(localStorage.getItem('seedance_count')||'0');
const counterEl=document.createElement('span');counterEl.className="text-xs subtle";counterEl.id='counter';counterEl.textContent='🔢 '+genCount;
document.querySelector('header > div:last-child').appendChild(counterEl);
bus.on('after-generate',()=>{const n=parseInt(localStorage.getItem('seedance_count')||'0')+1;safeLS('seedance_count',n);counterEl.textContent='🔢 '+n;});

/* ============ v5: AUTO-THEME BY TIME ============ */
if(!localStorage.getItem('seedance_theme')){const h=new Date().getHours();document.documentElement.dataset.theme=(h>=7&&h<19)?'light':'dark';}

/* ============ v5: FONT SCALE ============ */
const fsBox=document.createElement('div');fsBox.className="flex gap-1 ml-2";fsBox.innerHTML='<button class="soft-btn px-2 py-1 text-xs" id="fsDn">A−</button><button class="soft-btn px-2 py-1 text-xs" id="fsUp">A+</button>';
document.querySelector('header > div:last-child').appendChild(fsBox);
let fs=parseFloat(localStorage.getItem('seedance_fs')||'1');function applyFS(){document.documentElement.style.fontSize=(fs*16)+'px';safeLS('seedance_fs',fs);}applyFS();
$('fsDn').onclick=()=>{fs=Math.max(0.8,fs-0.1);applyFS();};$('fsUp').onclick=()=>{fs=Math.min(1.4,fs+0.1);applyFS();};

/* ============ v5: SMART PASTE ============ */
window.addEventListener('paste',async e=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
  const txt=e.clipboardData.getData('text').trim();if(!txt||txt.length<20)return;
  if(txt.startsWith('{')&&txt.includes('"subject"')){try{applyState(JSON.parse(txt));toast('✓ State импортирован');return;}catch(e){console.debug(e)}}
  if(txt.startsWith('http')&&txt.includes('#s=')){location.hash=txt.split('#')[1];loadStateFn();toast('✓ Из ссылки');return;}
  if(confirm('📋 Вставленный текст похож на промт. Распознать поля через AI?')){
    if(!needKey())return;
    const out=await aiCall([{role:'system',content:'Extract fields from a video-generation prompt. Reply ONLY as JSON with keys: subject, character, action, scene, details, shot, camera, lens, speed, lighting, time, weather, palette, mood, style, ambient, sfx, dialogue, negative, aspect, duration, res.'},{role:'user',content:txt}],{json:true});
    if(out){try{const d=JSON.parse(out);Object.entries(d).forEach(([k,vl])=>{if($(k)&&vl)$(k).value=vl;});generate();toast('✓');}catch{toast('JSON err');}}
  }
});

/* ============ v5: ICONIC SHOTS dictionary ============ */
const ICONIC=[
  {n:"Vertigo dolly zoom",d:"Hitchcock — головокружение",v:{shot:"medium shot",camera:"slow dolly in",lens:"50mm prime, shallow depth of field",speed:"natural real-time motion",mood:"unsettling"}},
  {n:"Kubrick stare",d:"взгляд исподлобья",v:{shot:"close-up",camera:"slow dolly in",lens:"24mm wide-angle",lighting:"hard rim lighting",mood:"unsettling"}},
  {n:"Tarantino trunk shot",d:"вид из багажника",v:{shot:"low-angle shot",camera:"static camera",lens:"24mm wide-angle",mood:"tense and suspenseful"}},
  {n:"Spielberg face",d:"освещённое лицо в восхищении",v:{shot:"close-up",camera:"slow dolly in",lighting:"volumetric god rays",mood:"epic and cinematic"}},
  {n:"One-shot oner",d:"длинный план без склеек",v:{shot:"medium shot",camera:"smooth gimbal",speed:"natural real-time motion",lens:"35mm cinematic"}},
  {n:"Hero crane reveal",d:"раскрытие героя кран-снизу-вверх",v:{shot:"low-angle shot",camera:"crane up",lens:"24mm wide-angle",lighting:"golden hour sunlight",mood:"heroic"}},
  {n:"Money shot orbit",d:"облёт вокруг героя",v:{shot:"medium shot",camera:"orbit around subject",speed:"slow motion 120fps",lens:"35mm cinematic",mood:"epic and cinematic"}},
  {n:"Fincher push-in",d:"медленный наезд напряжения",v:{shot:"close-up",camera:"steadicam push-in",lens:"50mm prime, shallow depth of field",lighting:"hard rim lighting",mood:"tense and suspenseful"}},
  {n:"Anderson centered",d:"идеальная симметрия Уэса",v:{shot:"medium shot",camera:"static camera",lens:"35mm cinematic",palette:"pastel dreamy",mood:"nostalgic"}},
  {n:"Bond opening",d:"кран от объекта в небо",v:{shot:"extreme wide shot",camera:"crane up",lens:"24mm wide-angle",lighting:"golden hour sunlight",mood:"epic and cinematic"}},
  {n:"Horror handheld",d:"тряска POV-преследования",v:{shot:"point-of-view (POV)",camera:"handheld follow",lens:"24mm wide-angle",speed:"natural real-time motion",mood:"tense and suspenseful"}},
  {n:"Anime hair flutter",d:"ветер в волосах, slowmo",v:{shot:"close-up",camera:"smooth gimbal",speed:"slow motion 120fps",lighting:"golden hour sunlight",style:"Studio Ghibli anime",mood:"dreamy and ethereal"}},
  {n:"Music video drop",d:"быстрый whip pan",v:{shot:"medium shot",camera:"whip pan",speed:"slow motion 120fps",lighting:"colored gels (teal & orange)",mood:"energetic and dynamic"}},
  {n:"Drone reveal",d:"облёт пейзажа",v:{shot:"extreme wide shot",camera:"drone fly-through",lens:"24mm wide-angle",lighting:"golden hour sunlight",mood:"epic and cinematic"}},
  {n:"Macro detail",d:"микро-деталь продукта",v:{shot:"extreme close-up",camera:"slow dolly in",lens:"macro lens",speed:"slow motion 120fps",lighting:"studio three-point lighting"}}
];
const NEG_LIB=[
  {n:"👤 Лица",v:"distorted faces, asymmetrical eyes, deformed mouth, melting features, double pupils"},
  {n:"✋ Руки",v:"extra fingers, missing fingers, fused hands, distorted hands, mutated palm"},
  {n:"🚶 Движение",v:"jittery motion, frame skipping, frozen limbs, uncanny walk cycle, sliding feet"},
  {n:"📝 Текст",v:"text artifacts, gibberish letters, watermark, signature, logo distortion"},
  {n:"🎨 Качество",v:"blurry, low quality, low resolution, jpeg artifacts, oversaturated, washed out"},
  {n:"🤖 Анимация",v:"plastic skin, doll-like, uncanny valley, stiff facial expressions, dead eyes"},
  {n:"🌫 Артефакты",v:"morphing artifacts, warping, flickering, banding, ghosting, color fringing"},
  {n:"🐾 Животные",v:"extra legs, deformed paws, mutated tails, asymmetrical ears, broken anatomy"}
];
const SOUND_LIB=[
  {n:"🌧 City rain",v:{ambient:"heavy city rain, distant traffic, occasional thunder",sfx:"footsteps on wet pavement, neon signs buzzing"}},
  {n:"🌲 Forest dawn",v:{ambient:"forest birdsong, gentle wind through leaves, distant stream",sfx:"twigs cracking underfoot, owl hoot fading"}},
  {n:"🚀 Space station",v:{ambient:"low atmospheric hum, ventilation drone, distant beeping",sfx:"sliding doors hiss, fingers tap glass console"}},
  {n:"🍺 Medieval tavern",v:{ambient:"crowd murmur, fireplace crackling, distant lute music",sfx:"mugs clink, wooden chairs scrape, laughter bursts"}},
  {n:"🌊 Underwater",v:{ambient:"muffled deep ocean rumble, whale song echo, bubbles rising",sfx:"diving bell ping, slow heart beat, gear creaks"}},
  {n:"🏃 Action chase",v:{ambient:"adrenaline pulse, urban background din",sfx:"running footsteps, panting breath, dodging obstacles, tires screeching"}},
  {n:"🌃 Cyberpunk street",v:{ambient:"distant hover-car traffic, holo-ad jingles, light rain",sfx:"neon flicker, electric arc, hydraulic hiss"}},
  {n:"🍔 Food close-up",v:{ambient:"warm kitchen ambience, soft background jazz",sfx:"sizzling oil, knife on board, glass clink"}},
  {n:"🌌 Cosmic ambient",v:{ambient:"deep space drone, ethereal pads, distant pulsar",sfx:"none, pure cosmic stillness"}},
  {n:"🎮 Game cinematic",v:{ambient:"orchestral swell, low brass tension",sfx:"sword unsheathe, magic charge, heavy footstep"}}
];
$('libSubjBtn').parentElement.insertAdjacentHTML('beforeend','<button id="libIconic" class="soft-btn text-xs px-3 py-1.5" title="Iconic shots">🎬 Iconic</button><button id="libNeg" class="soft-btn text-xs px-3 py-1.5" title="Negative library">⛔ Neg</button><button id="libSound" class="soft-btn text-xs px-3 py-1.5" title="Sound library">🎼 Sound</button>');
$('libIconic').onclick=()=>openLib('🎬 Iconic shots',ICONIC,it=>{Object.entries(it.v).forEach(([k,vl])=>{if($(k))$(k).value=vl;});generate();});
$('libNeg').onclick=()=>openLib('⛔ Negative-наборы',NEG_LIB,it=>{$('negative').value=(v('negative')?v('negative')+', ':'')+it.v;generate();});
$('libSound').onclick=()=>openLib('🎼 Звуковые пресеты',SOUND_LIB,it=>{Object.entries(it.v).forEach(([k,vl])=>{if($(k))$(k).value=vl;});generate();});

/* ============ v5: MULTI-MODEL templates ============ */
const MODELS={
  seedance:{n:"🎬 Seedance 2.0",max:10,res:["480p","720p","1080p"],hint:"Структура: subject → action → scene → camera → light → style"},
  runway:{n:"🎥 Runway Gen-3",max:10,res:["768p","1280p"],hint:"Краткие визуальные описания, мощно с motion brush"},
  kling:{n:"🇨🇳 Kling 1.5",max:10,res:["720p","1080p"],hint:"Поддерживает китайский, длинные сцены до 10s"},
  hailuo:{n:"🌶 Hailuo MiniMax",max:6,res:["720p","1080p"],hint:"Хорошо с физикой и эмоциями"},
  sora:{n:"🌀 Sora",max:60,res:["1080p"],hint:"Длинные сюжетные ролики, до 60s"},
  veo:{n:"🅖 Google Veo",max:8,res:["1080p","4k"],hint:"Высокое качество, native audio"},
  wan:{n:"🐼 Wan 2.1",max:5,res:["480p","720p"],hint:"Open-source, локальный запуск"}
};
const modelSel=document.createElement('select');modelSel.id='modelSel';modelSel.className="field !w-auto !py-1.5 text-xs ml-2";
Object.entries(MODELS).forEach(([k,m])=>{const o=document.createElement('option');o.value=k;o.textContent=m.n;modelSel.appendChild(o);});
modelSel.value=localStorage.getItem('seedance_model')||'seedance';
document.querySelector('header > div:last-child').insertBefore(modelSel,$('counter'));
const modelHint=document.createElement('div');modelHint.className="text-xs subtle px-6 max-w-7xl mx-auto -mt-2 mb-2";
document.querySelector('main').parentElement.insertBefore(modelHint,document.querySelector('main'));
function applyModel(){const m=MODELS[modelSel.value];safeLS('seedance_model',modelSel.value);modelHint.innerHTML=`💡 <b>${m.n}:</b> ${m.hint} · max ${m.max}s · res: ${m.res.join('/')}`;
  const dur=$('duration');[...dur.options].forEach(o=>{const n=parseInt(o.textContent);o.disabled=n>m.max;});
  const res=$('res');[...res.options].forEach(o=>o.style.display=m.res.some(r=>o.textContent.includes(r.replace('p','')))?'':'none');}
modelSel.addEventListener('change',()=>{applyModel();generate();});applyModel();

/* ============ v5: IMAGE-AS-STYLE toggle ============ */
const styleToggle=document.createElement('label');styleToggle.className="flex items-center gap-2 text-xs subtle mt-2";
styleToggle.innerHTML='<input type="checkbox" id="imgAsStyle" class="accent-violet-500"> 🎨 Использовать как style-reference (только light/palette/mood/style)';
$('i2vBlock').appendChild(styleToggle);
const _origRunVision=window.runVision;window.runVision=async function(dataUrl){
  if($('imgAsStyle')?.checked){if(!needKey())return;const c=aiCfg();if(!c.key)return;
    if(!_visionSkip){if(!confirm('🎨 Извлечь только стиль (light/palette/mood/style)?'))return;_visionSkip=true;}
    toast('🎨 AI читает стиль...');
    try{const r=await fetch(c.base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},body:JSON.stringify({model:c.model,response_format:{type:'json_object'},messages:[{role:'user',content:[{type:'text',text:'Extract ONLY visual style from this image. Reply as JSON: {"lighting":"...","palette":"...","mood":"...","style":"..."}. Use cinematic English.'},{type:'image_url',image_url:{url:dataUrl}}]}]})});
      const j=await r.json();const t=j.choices?.[0]?.message?.content;const d=JSON.parse(t);Object.entries(d).forEach(([k,vl])=>{if($(k)&&vl)$(k).value=vl;});generate();toast('✓ Стиль');}catch(e){toast('Style: '+e.message);}return;}
  return _origRunVision(dataUrl);
};

/* ============ v5: STORYBOARD per-shot preview ============ */
const sbBtn=document.createElement('button');sbBtn.className="soft-btn text-xs px-3 py-1.5 ml-2";sbBtn.innerHTML='🎬 AI Storyboard';sbBtn.title='Сгенерировать превью каждого шота';
$('useShots').parentElement.appendChild(sbBtn);
sbBtn.onclick=async()=>{const shots=getShots();if(!shots.length){toast('Нет шотов');return;}if(!needKey())return;const c=aiCfg();if(!c.key)return;
  const sbBox=document.createElement('div');sbBox.className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3";
  if(shotsEl.parentElement.querySelector('.sb-box'))shotsEl.parentElement.querySelector('.sb-box').remove();
  sbBox.classList.add('sb-box');shotsEl.parentElement.appendChild(sbBox);
  for(let i=0;i<shots.length;i++){const card=document.createElement('div');card.className="bg-black/10 rounded-lg overflow-hidden border border-white/10";
    card.innerHTML=`<div class="aspect-video bg-black/30 grid place-items-center text-xs subtle">⏳ shot ${i+1}</div><div class="p-2 text-[10px]">Shot ${i+1}: ${shots[i].cam.slice(0,40)}</div>`;sbBox.appendChild(card);
    try{const p=`cinematic still, ${v('subject')}, ${shots[i].cam}, ${shots[i].act}, ${v('lighting')}, ${v('palette')}, ${v('style')}`;
      const r=await fetch(c.base+'/images/generations',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},body:JSON.stringify({model:'dall-e-3',prompt:p.slice(0,3800),size:'1792x1024',n:1})});
      const j=await r.json();const url=j.data?.[0]?.url;if(url)card.querySelector('div').outerHTML=`<img src="${url}" class="w-full aspect-video object-cover"/>`;
    }catch(e){card.querySelector('div').textContent='✕ '+e.message;}}
  toast('✓ Storyboard');};

/* ============ v5: RECENTLY USED in selects ============ */
const RECENT_KEY='seedance_recent';
function getRecent(){try{return JSON.parse(localStorage.getItem(RECENT_KEY)||'{}');}catch{return{};}}
function pushRecent(k,val){const r=getRecent();r[k]=[val,...(r[k]||[]).filter(x=>x!==val)].slice(0,3);safeLS(RECENT_KEY,JSON.stringify(r));}
['shot','camera','lens','lighting','style','mood','palette'].forEach(id=>{const sel=$(id);sel.addEventListener('change',()=>pushRecent(id,sel.value));
  const refresh=()=>{const r=getRecent()[id]||[];if(!r.length)return;[...sel.querySelectorAll('option[data-recent]')].forEach(o=>o.remove());r.slice().reverse().forEach(val=>{const o=document.createElement('option');o.dataset.recent='1';o.textContent='🕒 '+val;o.value=val;sel.insertBefore(o,sel.firstChild);});};refresh();});

/* ============ v6: BUGFIXES ============ */
// debounce progBar updates (was running on every keystroke)
let _progT;const _origUpd=updProgress;window.updProgress=function(){clearTimeout(_progT);_progT=setTimeout(_origUpd,200);};
// Reset clears preview + sb-box
const _r3=$('reset').onclick;$('reset').onclick=()=>{_r3&&_r3();const p=$('previewImg');if(p){p.classList.add('hidden');p.innerHTML='';}document.querySelectorAll('.sb-box,#scoreBox').forEach(el=>{if(el.id==='scoreBox'){el.classList.add('hidden');el.innerHTML='';}else el.remove();});};
// chatPanel z above toggle
chatPanel.style.zIndex='45';$('chatToggle').style.zIndex='44';
// score 0% min width
const _sc=document.createElement('style');_sc.textContent='#scoreBox div[style*="width:0%"]{min-width:2px}';document.head.appendChild(_sc);

/* ============ v6: API KEY obfuscation (XOR base64) ============ */
const _xk='seedance_v6_salt_8723';function _xor(s){return [...s].map((c,i)=>String.fromCharCode(c.charCodeAt(0)^_xk.charCodeAt(i%_xk.length))).join('');}
const _origAiCfg=aiCfg;window.aiCfg=function(){const c=_origAiCfg();if(c.key&&c.key.startsWith('XOR:')){try{c.key=_xor(atob(c.key.slice(4)));}catch(e){console.debug(e)}}return c;};
const _aiKey=$('aiKey');_aiKey.addEventListener('blur',()=>{if(_aiKey.value&&!_aiKey.value.startsWith('XOR:')){const enc='XOR:'+btoa(_xor(_aiKey.value));safeLS('seedance_ai_key',enc);_aiKey.value=enc;}});
// On load, decrypt for display (kept as XOR: in storage)
if(_aiKey.value.startsWith('XOR:'))_aiKey.placeholder='🔒 ключ зашифрован';

/* ============ v6: STATE VERSIONING ============ */
const SCHEMA_V=6;const _sv=parseInt(localStorage.getItem('seedance_schema')||'0');
if(_sv<SCHEMA_V){safeLS('seedance_schema',SCHEMA_V);console.info('Seedance schema migrated to v'+SCHEMA_V);}

/* ============ v6: BANK (Characters + Scenes) ============ */
function loadBank(k){try{return JSON.parse(localStorage.getItem(k)||'[]');}catch{return[];}}
function saveBank(k,a){safeLS(k,JSON.stringify(a));}
function bankUI(title,key,fields){
  $('libTitle').textContent=title;const g=$('libGrid');g.innerHTML='';
  const arr=loadBank(key);
  const addBtn=document.createElement('button');addBtn.className="dir-card text-left p-3 rounded-xl border-2 border-dashed border-violet-500/40 bg-violet-500/5";
  addBtn.innerHTML='<div class="font-medium text-sm">➕ Сохранить текущее</div><div class="text-[11px] subtle mt-0.5">'+fields.join(', ')+'</div>';
  addBtn.onclick=async()=>{const name=await askText('Имя записи','Например: Maya, Detective Cole, Cyberpunk Tokyo');if(!name)return;const obj={n:name,d:new Date().toLocaleDateString(),v:{}};fields.forEach(f=>obj.v[f]=v(f));arr.push(obj);saveBank(key,arr);bankUI(title,key,fields);toast('💾');};
  g.appendChild(addBtn);
  arr.forEach((it,i)=>{const c=document.createElement('div');c.className="dir-card text-left p-3 rounded-xl border border-white/10 bg-black/10 relative";
    c.innerHTML=`<div class="font-medium text-sm">${it.n}</div><div class="text-[11px] subtle mt-0.5">${it.d} · ${(Object.values(it.v)[0]||'').slice(0,50)}</div><button class="absolute top-2 right-2 text-xs subtle hover:text-red-400" data-rm="${i}">✕</button>`;
    c.onclick=ev=>{if(ev.target.dataset.rm){arr.splice(+ev.target.dataset.rm,1);saveBank(key,arr);bankUI(title,key,fields);return;}Object.entries(it.v).forEach(([k,vl])=>{if($(k)&&vl)$(k).value=vl;});generate();libModal.classList.add('hidden');toast('✓ '+it.n);};
    g.appendChild(c);});
  libModal.classList.remove('hidden');
}
$('libSubjBtn').parentElement.insertAdjacentHTML('beforeend','<button id="bankChar" class="soft-btn text-xs px-3 py-1.5" title="Мои герои">🎭 My</button><button id="bankSc" class="soft-btn text-xs px-3 py-1.5" title="Мои сцены">🎪 My</button>');
$('bankChar').onclick=()=>bankUI('🎭 Банк героев','seedance_char_bank',['subject','character','details']);
$('bankSc').onclick=()=>bankUI('🎪 Банк сцен','seedance_scene_bank',['scene','details','time','weather','lighting','palette']);

/* ============ v6: ACTION VERBS picker ============ */
const VERBS=['lunges','stalks','glides','shatters','ignites','dissolves','emerges','plunges','levitates','pivots','sprints','crouches','reaches','spins','collapses','vaults','crawls','strides','soars','recoils','grasps','hurls','whispers','screams','laughs','weeps','smirks','glares','trembles','meditates'];
const verbBtn=document.createElement('button');verbBtn.className="text-xs subtle ml-2 hover:text-violet-400";verbBtn.innerHTML='💪 verbs';verbBtn.title='Каталог ярких глаголов';
$('action').parentElement.parentElement.insertBefore(verbBtn,$('action').parentElement.nextSibling);
verbBtn.onclick=()=>{const items=VERBS.map(v=>({n:v,d:''}));openLib('💪 Action verbs',items,it=>{const cur=v('action');$('action').value=cur?cur+', '+it.n:it.n;generate();});};

/* ============ v6: PARTICLES / FX selector ============ */
const FX=['dust motes floating','falling cherry blossoms','floating embers','heavy rain','snowfall','sparks flying','smoke drifting','fog tendrils','autumn leaves','glowing fireflies','sand particles','bokeh light orbs','steam clouds','water droplets','glitter trail'];
const fxRow=document.createElement('div');fxRow.className="mt-2";
fxRow.innerHTML='<label class="block text-xs subtle mb-1">🌬 Эффекты / частицы</label><select id="fx" class="field"><option value="">— нет —</option>'+FX.map(f=>`<option>${f}</option>`).join('')+'</select>';
$('details').parentElement.parentElement.appendChild(fxRow);
$('fx').addEventListener('change',generate);

/* ============ v6: FILM STOCK presets ============ */
const STOCKS=[
  {n:"Kodak Portra 400",d:"тёплый портретный",v:{palette:"warm sepia",style:"35mm film grain",mood:"nostalgic"}},
  {n:"Cinestill 800T",d:"ночной с halation",v:{palette:"vibrant neon",style:"35mm film grain",lighting:"practical neon signs",mood:"mysterious"}},
  {n:"Fuji Velvia 50",d:"сочные природные",v:{palette:"rich vibrant",style:"35mm film grain",mood:"epic and cinematic"}},
  {n:"16mm grainy",d:"арт-хаус документ.",v:{style:"16mm film grain, vintage look",palette:"desaturated muted",mood:"melancholic"}},
  {n:"Super 8 vintage",d:"ретро домашнее видео",v:{style:"super 8 film, heavy grain, light leaks",palette:"warm sepia",mood:"nostalgic"}},
  {n:"Kodak Vision3 500T",d:"кино-стандарт ночь",v:{style:"35mm cinematic film",palette:"teal and orange",lighting:"hard rim lighting"}},
  {n:"Black & white classic",d:"чёрно-белый Феллини",v:{palette:"high-contrast noir",style:"black and white classic film",lighting:"chiaroscuro"}},
  {n:"Polaroid SX-70",d:"мягкий ретро",v:{palette:"pastel dreamy",style:"polaroid instant film, soft focus",mood:"dreamy and ethereal"}}
];
$('libSound').insertAdjacentHTML('afterend','<button id="libStock" class="soft-btn text-xs px-3 py-1.5" title="Film stock">🎞 Stock</button><button id="libHooks" class="soft-btn text-xs px-3 py-1.5" title="Trending hooks">🔥 Hooks</button>');
$('libStock').onclick=()=>openLib('🎞 Film stock',STOCKS,it=>{Object.entries(it.v).forEach(([k,vl])=>{if($(k))$(k).value=vl;});generate();});

/* ============ v6: TRENDING HOOKS library ============ */
const HOOKS=[
  {n:"POV: ты обнаружил",d:"первое лицо тайна",v:"point-of-view shot, the camera approaches "},
  {n:"3 секунды до...",d:"таймер напряжения",v:"countdown tension intro, urgent close-up of "},
  {n:"Что если бы...",d:"альтернативная реальность",v:"alternate reality reveal, slow camera tilt down to "},
  {n:"Не моргай!",d:"гипноз внимания",v:"hypnotic close-up, locked stare into camera, "},
  {n:"Wait for it...",d:"slow build to drop",v:"slow building anticipation tracking shot, then sudden reveal of "},
  {n:"Никто не ожидал",d:"шок-трансформация",v:"unexpected transformation reveal, dramatic push-in on "},
  {n:"Один в кадре",d:"одиночество героя",v:"isolated subject in vast empty environment, slow zoom out from "},
  {n:"Зеркало правды",d:"раскрытие через отражение",v:"mirror reflection reveal, slow rack focus to mirror showing "},
  {n:"Последняя минута",d:"финальный отсчёт",v:"final countdown intensity, frantic handheld follow on "},
  {n:"Тайна за дверью",d:"intrigue door open",v:"slow door opening reveal, light spilling onto "},
  {n:"Контраст эпох",d:"старое vs новое",v:"split contrast, past vs future juxtaposition with "},
  {n:"Beauty close-up",d:"эстетика детали",v:"hyper-aesthetic macro detail of "},
  {n:"Speed run",d:"ускоренное преодоление",v:"timelapse compressed action sequence of "},
  {n:"Reverse reveal",d:"обратная съёмка",v:"reversed playback dramatic reveal of "},
  {n:"Tabletop GOD shot",d:"сверху вниз вертикально",v:"top-down god view static shot of "}
];
$('libHooks').onclick=()=>openLib('🔥 Trending hooks',HOOKS,it=>{$('subject').value=it.v+v('subject');generate();});

/* ============ v6: GOAL-DRIVEN MODE ============ */
const goalBtn=document.createElement('button');goalBtn.className="soft-btn text-xs px-3 py-1.5";goalBtn.innerHTML='🎯 Goal mode';goalBtn.title='Опиши цель — AI соберёт всю форму';
$('aiAutoFill').parentElement.appendChild(goalBtn);
/* applyAiFields now hoisted at top of file */
goalBtn.onclick=async()=>{if(!needKey())return;const goal=await askText('🎯 Цель ролика','Не описание сцены, а ЦЕЛЬ. Например: "вызвать ностальгию", "продать беговые кроссовки за 5 секунд", "показать одиночество в большом городе"');if(!goal)return;
  toast('🎯 AI думает...');
  const sys='You are a senior creative director. Given a GOAL (in any language), design a complete video prompt. Reply ONLY as JSON with these keys: subject, character, action, scene, details, shot, camera, lens, speed, lighting, time, weather, palette, mood, style, ambient, sfx, dialogue, negative. CRITICAL: ALL VALUES MUST BE IN ENGLISH ONLY. Use cinematic English terminology. Each value MUST be a flat string (NEVER an object or array). If a field does not apply, use empty string "". Make every choice serve the goal.';
  const out=await aiCall([{role:'system',content:sys},{role:'user',content:'GOAL: '+goal}],{json:true});
  if(out){try{const d=JSON.parse(out);applyAiFields(d);generate();toast('🎯 Готово');}catch{toast('JSON err');}}
};

/* ============ v7: TRANSLATE FIELDS RU→EN ============ */
const trBtn=document.createElement('button');trBtn.className="soft-btn text-xs px-3 py-1.5";trBtn.innerHTML='🔄 RU→EN';trBtn.title='Перевести все поля формы на английский';
$('aiAutoFill').parentElement.appendChild(trBtn);
trBtn.onclick=async()=>{if(!needKey())return;
  const TR_FIELDS=['subject','character','action','scene','details','motion','negative','ambient','sfx','dialogue','speedRamp'];
  const data={};TR_FIELDS.forEach(f=>{const val=v(f);if(val)data[f]=val;});
  if(!Object.keys(data).length){toast('Пусто');return;}
  trBtn.textContent='⏳';
  const sys='Translate all values to cinematic English. Keep keys exactly as given. Reply ONLY as JSON with the same keys. Each value must be a flat English string (NEVER an object). Use professional cinematography vocabulary. If a value is already English, refine it for cinematic clarity but keep meaning.';
  const out=await aiCall([{role:'system',content:sys},{role:'user',content:JSON.stringify(data)}],{json:true});
  if(out){try{applyAiFields(JSON.parse(out));generate();toast('✓ переведено');}catch{toast('JSON err');}}
  trBtn.textContent='🔄 RU→EN';
};

/* ============ v6: SELF-CONSISTENCY CHECK ============ */
const consBtn=document.createElement('button');consBtn.className="soft-btn text-[11px] px-2 py-1 rounded";consBtn.innerHTML='🔁 Check';consBtn.title='AI ищет противоречия в промте';
$('negSuggestBtn').parentElement.appendChild(consBtn);
consBtn.onclick=async()=>{if(!needKey())return;const en=$('outEnView').dataset.raw||'';if(!en)return;consBtn.textContent='⏳';
  const out=await aiCall([{role:'system',content:'Read this video prompt CAREFULLY. List any internal contradictions or implausibilities (e.g. "night" vs "golden hour", "calm" vs "explosion", impossible camera moves, time/light mismatches). If none, say "✓ Противоречий не найдено". Russian, max 5 short bullets.'},{role:'user',content:en}]);
  if(out){$('critBody').innerHTML='<div class="font-semibold mb-2">🔁 Self-consistency</div>'+out.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/^- /gm,'• ');critPanel.classList.remove('hidden');}
  consBtn.textContent='🔁 Check';};

/* ============ v6: NEGATIVE auto-validate ============ */
$('negative').addEventListener('blur',async()=>{const neg=v('negative');const en=$('outEnView').dataset.raw||'';if(!neg||!en||!aiCfg().key)return;
  const out=await aiCall([{role:'system',content:'Check if the negative prompt CONTRADICTS positive prompt. Reply ONLY as JSON: {"conflicts":["item1",...]} (max 3, in Russian) or {"conflicts":[]} if all good.'},{role:'user',content:'Positive: '+en+'\n\nNegative: '+neg}],{json:true,silent:true});
  if(out){try{const d=JSON.parse(out);if(d.conflicts&&d.conflicts.length){toast('⚠ neg-конфликт: '+d.conflicts.join('; '));}}catch(e){console.debug(e)}}});

/* ============ v6: PROMPT MUTATOR ============ */
const mutBtn=document.createElement('button');mutBtn.className="soft-btn text-xs px-3 py-1.5";mutBtn.innerHTML='🧪 Mutate';mutBtn.title='5 случайных мутаций → AI выбирает лучшую';
$('aiReverseBtn').parentElement.appendChild(mutBtn);
mutBtn.onclick=async()=>{if(!needKey())return;const en=$('outEnView').dataset.raw||'';if(!en)return;mutBtn.textContent='🧪 1/6...';
  const muts=[];const ops=['shorter','more cinematic','darker mood','add unexpected element','more sensory detail'];
  for(let i=0;i<ops.length;i++){mutBtn.textContent=`🧪 ${i+1}/6...`;const o=await aiCall([{role:'system',content:'Mutate this video prompt: '+ops[i]+'. Reply ONLY with the mutated prompt.'},{role:'user',content:en}]);if(o)muts.push(o);}
  mutBtn.textContent='🧪 6/6 judge...';
  const judge=await aiCall([{role:'system',content:'You are an AI judge. Pick the BEST of these video prompts (most cinematic, evocative, executable). Reply ONLY with the number 1-'+muts.length},{role:'user',content:muts.map((m,i)=>`#${i+1}\n${m}`).join('\n\n---\n\n')}]);
  const idx=parseInt(judge)-1;if(muts[idx]){renderEn(muts[idx]);pushHist(muts[idx]);toast('🏆 winner #'+(idx+1));}
  mutBtn.textContent='🧪 Mutate';};

/* ============ v6: BEST-OF-N tournament ============ */
// (uses existing 4-variants modal) — add AI judge button into it
const _origAB6=$('abBtn').onclick;$('abBtn').onclick=async()=>{await Promise.resolve(_origAB6&&_origAB6());
  setTimeout(()=>{if(!$('varsGrid'))return;const judgeBtn=document.createElement('button');judgeBtn.className="btn-primary px-3 py-1.5 rounded-lg text-xs mt-3 w-full";judgeBtn.innerHTML='🏆 AI выбери лучший';
    if(!$('varsGrid').nextElementSibling||!$('varsGrid').nextElementSibling.classList.contains('judge'))$('varsGrid').parentElement.insertBefore(judgeBtn,$('varsGrid').nextSibling);
    judgeBtn.classList.add('judge');
    judgeBtn.onclick=async()=>{judgeBtn.textContent='⏳';const variants=[...$('varsGrid').children].map(c=>c.querySelector('.text-xs').textContent.replace(/…$/,''));
      const j=await aiCall([{role:'system',content:'Pick the most cinematic and evocative video prompt. Reply ONLY with the letter A/B/C/D.'},{role:'user',content:variants.map((v,i)=>'ABCD'[i]+'.\n'+v).join('\n\n')}]);
      const i='ABCD'.indexOf((j||'').trim().toUpperCase()[0]);if(i>=0){[...$('varsGrid').children].forEach((c,k)=>{c.style.outline=k===i?'2px solid #4ade80':'';});toast('🏆 '+'ABCD'[i]);}
      judgeBtn.innerHTML='🏆 AI выбери лучший';};},150);};

/* ============ v6: FEW-SHOT from favorites ============ */
const _origEnh=$('aiEnhanceBtn').onclick;$('aiEnhanceBtn').onclick=async function(...a){
  const favs=loadList('seedance_fav').slice(0,3);if(favs.length){window._fewShot=favs.map(f=>'Example of style I prefer:\n'+f.en).join('\n\n---\n\n');}
  return _origEnh&&_origEnh(...a);};

/* ============ v6: COLOR GRADING visualizer ============ */
const PALMAP={"vibrant neon":["#ff006e","#fb5607","#ffbe0b","#3a86ff","#8338ec","#06ffa5"],"teal and orange":["#0a7e8c","#1ba6b3","#f4a259","#e76f51","#264653","#f4d35e"],"warm sepia":["#704214","#a47148","#c69963","#e8c39e","#f4e1c1","#52310c"],"cold cyan blues":["#0a2540","#1a5fb4","#62a0ea","#99c1f1","#cce4f7","#e5f1fa"],"pastel dreamy":["#fcd5ce","#f8edeb","#fae1dd","#e8e8e4","#d8e2dc","#ffd6ff"],"high-contrast noir":["#000","#1a1a1a","#3d3d3d","#7a7a7a","#bdbdbd","#fff"],"desaturated muted":["#5a5a5a","#7d7d7d","#9c9c9c","#b8b8b8","#d4d4d4","#e8e8e8"],"rich vibrant":["#d62828","#003049","#fcbf49","#eae2b7","#f77f00","#264653"]};
const palStrip=document.createElement('div');palStrip.className="flex gap-0.5 mt-1 h-3 rounded overflow-hidden";
$('palette').parentElement.appendChild(palStrip);
function updPalStrip(){const p=PALMAP[v('palette')]||['#444','#555','#666','#777','#888','#999'];palStrip.innerHTML=p.map(c=>`<div style="flex:1;background:${c}"></div>`).join('');}
$('palette').addEventListener('change',updPalStrip);updPalStrip();

/* ============ v6: LIVE TINT background ============ */
function updTint(){const p=PALMAP[v('palette')];if(!p)return;const c=p[1]||p[0];document.body.style.boxShadow='inset 0 0 200px '+c+'15';}
$('palette').addEventListener('change',updTint);updTint();

/* ============ v6: SIDE-BY-SIDE EN/RU toggle ============ */
const sbsBtn=document.createElement('button');sbsBtn.className="soft-btn text-xs px-2.5 py-1.5";sbsBtn.innerHTML='📜 SbS';sbsBtn.title='EN/RU side-by-side';
$('exportTxt').parentElement.insertBefore(sbsBtn,$('exportTxt'));
let _sbs=false;sbsBtn.onclick=()=>{_sbs=!_sbs;const wrap=$('outEnView').parentElement;
  if(_sbs){wrap.classList.add('grid','grid-cols-2','gap-3');$('outEnView').classList.add('col-span-1','max-h-[36rem]');$('outRu').classList.add('col-span-1','!max-h-[36rem]');sbsBtn.classList.add('!bg-violet-500/30');}
  else{wrap.classList.remove('grid','grid-cols-2','gap-3');$('outEnView').classList.remove('col-span-1','max-h-[36rem]');$('outRu').classList.remove('col-span-1','!max-h-[36rem]');sbsBtn.classList.remove('!bg-violet-500/30');}};

/* ============ v6: MULTI-LANG preview (EN+RU+CN+JP) ============ */
const mlBtn=document.createElement('button');mlBtn.className="soft-btn text-xs px-2.5 py-1.5";mlBtn.innerHTML='🌐';mlBtn.title='Перевести на CN+JP+ES';
$('exportTxt').parentElement.insertBefore(mlBtn,$('exportTxt'));
mlBtn.onclick=async()=>{if(!needKey())return;const en=$('outEnView').dataset.raw||'';if(!en)return;mlBtn.textContent='⏳';
  const out=await aiCall([{role:'system',content:'Translate this video prompt to Chinese, Japanese, Spanish. Reply ONLY as JSON: {"cn":"...","jp":"...","es":"..."}'},{role:'user',content:en}],{json:true});
  if(out){try{const d=JSON.parse(out);const html=`<div class="space-y-3"><div><div class="text-[10px] subtle uppercase">中文 (Chinese — для Kling)</div><div class="field text-sm whitespace-pre-wrap">${d.cn}</div></div><div><div class="text-[10px] subtle uppercase">日本語 (Japanese)</div><div class="field text-sm whitespace-pre-wrap">${d.jp}</div></div><div><div class="text-[10px] subtle uppercase">Español</div><div class="field text-sm whitespace-pre-wrap">${d.es}</div></div></div>`;
    const m=document.createElement('div');m.id='mlBox';m.className="mt-3";const old=$('mlBox');if(old)old.remove();m.innerHTML=html;$('outRu').parentElement.appendChild(m);toast('✓');}catch{toast('JSON err');}}
  mlBtn.textContent='🌐';};

/* ============ v6/v7: AUTO-TAGS on favorite (non-blocking) ============ */
$('favBtn').onclick=()=>{const en=$('outEnView').dataset.raw||$('outEnView').textContent;if(!en)return;
  const entry={t:Date.now(),en,tags:[]};
  const a=loadList('seedance_fav');a.unshift(entry);saveList('seedance_fav',a);toast('★');renderList();
  // generate tags in background (fire-and-forget)
  if(aiCfg().key){aiCall([{role:'system',content:'Generate 2-4 short tags (English single words) for this video prompt. Reply ONLY as comma-separated list.'},{role:'user',content:en}],{silent:true}).then(out=>{if(!out)return;entry.tags=out.split(',').map(s=>s.trim().replace(/[^a-z0-9-]/gi,'').toLowerCase()).filter(Boolean).slice(0,4);saveList('seedance_fav',a);renderList();}).catch(()=>{});}
};

/* ============ v6: HOVER PREVIEW в истории ============ */
const tip=document.createElement('div');tip.id='hovTip';tip.className="hidden fixed z-50 max-w-md p-3 glass rounded-lg text-xs shadow-2xl pointer-events-none";document.body.appendChild(tip);
$('listView').addEventListener('mouseover',e=>{const li=e.target.closest('[data-en]');if(!li)return;tip.textContent=li.dataset.en;tip.classList.remove('hidden');});
$('listView').addEventListener('mousemove',e=>{tip.style.left=Math.min(e.clientX+15,window.innerWidth-tip.offsetWidth-10)+'px';tip.style.top=Math.min(e.clientY+15,window.innerHeight-tip.offsetHeight-10)+'px';});
$('listView').addEventListener('mouseout',()=>tip.classList.add('hidden'));
const _origRen2=renderList;window.renderList=function(){_origRen2();[...$('listView').querySelectorAll('li')].forEach(li=>{const t=li.querySelector('.line-clamp-2,.line-clamp-3,div');if(t&&!li.dataset.en)li.dataset.en=t.textContent;});};renderList();

/* ============ v6: INLINE HELP icons ============ */
const HELP={'Идея':'Заполни subject (главный объект), action (действие), scene (где). Это основа. Остальное — детали кинематографии.','Камера':'shot — крупность, camera — движение, lens — объектив. Психология объективов под селектом.','Освещение и палитра':'lighting — источник, palette — цветовая гамма, mood — общее настроение. Под palette показана живая палитра.','Multi-shot':'Если включить useShots — промт станет рассказом из N шотов. Auto-токен героя сохраняет консистентность.'};
document.querySelectorAll('.glass h2').forEach(h=>{const t=h.textContent.trim();if(HELP[t]){const q=document.createElement('button');q.className="ml-2 text-xs subtle hover:text-violet-400";q.textContent='?';q.title=HELP[t];q.onclick=ev=>{ev.stopPropagation();alert(t+'\n\n'+HELP[t]);};h.appendChild(q);}});

/* ============ v6: CHANGELOG modal on version bump ============ */
const _lastV=localStorage.getItem('seedance_seen_v')||'0';
if(_lastV!=='6'){setTimeout(()=>{const m=document.createElement('div');m.className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur";m.innerHTML=`<div class="glass rounded-2xl p-6 max-w-lg w-full"><div class="flex items-start justify-between mb-3 gap-3"><div class="flex items-center gap-3"><div class="logo-mark w-10 h-10 rounded-xl grid place-items-center flex-shrink-0"><svg viewBox="0 0 48 48" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="24" cy="24" r="5.5" fill="white"/><circle cx="24" cy="24" r="2.6" fill="#fde68a"/><g><path d="M24 4v8M24 36v8M4 24h8M36 24h8" stroke="white" stroke-width="2.4" stroke-linecap="round"/></g><g><path d="M9.86 9.86l5.66 5.66M32.49 32.49l5.66 5.66M9.86 38.14l5.66-5.66M32.49 15.52l5.66-5.66" stroke="white" stroke-width="2.4" stroke-linecap="round" opacity=".75"/></g></svg></div><div><h3 class="font-extrabold text-lg leading-tight"><span class="grad-text">Lumen</span></h3><div class="text-[11px] subtle font-medium mt-0.5">Cinematic Prompt Studio · <span style="color:#c4b5fd">by Armen</span></div></div></div><button class="text-2xl subtle hover:text-white transition" onclick="this.closest('.fixed').remove()" aria-label="Close">×</button></div>
<div class="text-sm space-y-2"><b>Новое:</b><ul class="list-disc pl-5 text-xs space-y-1 subtle">
<li>🎯 Goal mode — опиши цель, AI соберёт форму</li>
<li>🎭🎪 My — банк своих героев и сцен</li>
<li>🧪 Mutate — 5 мутаций + AI-судья</li>
<li>🏆 Tournament — AI выбирает лучший из 4 вариантов</li>
<li>🌐 EN+CN+JP+ES перевод</li>
<li>📜 SbS — side-by-side EN/RU</li>
<li>🎞 Stock — film-эмуляция (Portra/Cinestill/16mm)</li>
<li>🔥 Hooks — вирусные зачины TikTok</li>
<li>💪 Verbs · 🌬 FX · 🔁 Self-check · 🎨 Live palette · 🔒 Encrypted key</li>
</ul><button class="btn-primary px-4 py-2 rounded-lg text-sm mt-2 w-full" onclick="safeLS('seedance_seen_v','6');this.closest('.fixed').remove()">Понял, поехали</button></div></div>`;document.body.appendChild(m);},800);}

/* ============================================================ */
/* ============ v7: STORY MODE (multi-scene) ================== */
/* ============================================================ */

/* Lazy-load JSZip from CDN for ZIP export */
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
    const r=await fetch(c.base+'/images/generations',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},body:JSON.stringify({model:'dall-e-3',prompt,size:'1792x1024',n:1})});
    const j=await r.json();
    if(j.error){if(slot)slot.textContent='✕';toast('Image: '+j.error.message);return;}
    const url=j.data?.[0]?.url||(j.data?.[0]?.b64_json?'data:image/png;base64,'+j.data[0].b64_json:null);
    if(url){sc.imgUrl=url;saveStory();if(slot)slot.innerHTML=`<img src="${url}" class="w-full h-full object-cover"/>`;}
  }catch(e){if(slot)slot.textContent='✕ '+e.message.slice(0,15);}
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

/* ============================================================ */
/* ============ v7.1: CONTINUITY CHECKER ====================== */
/* ============================================================ */

/* Inject button + result panel into Story modal */
(function injectContinuity(){
  const bar=document.querySelector('#storyModal .flex.gap-2.mb-4');
  if(!bar)return;
  const b=document.createElement('button');
  b.id='storyContinuity';b.className='soft-btn text-xs px-3 py-2';
  b.innerHTML='🔍 Continuity check';
  b.title='AI ищет разрывы между сценами: одежда героя, время суток, погода, реквизит, локация';
  bar.appendChild(b);
  const panel=document.createElement('div');
  panel.id='storyContinuityPanel';panel.className='hidden mb-3';
  $('storyHero').insertAdjacentElement('afterend',panel);
})();

const SEV={high:'bg-red-500/20 border-red-500/40 text-red-200',med:'bg-amber-500/20 border-amber-500/40 text-amber-200',low:'bg-sky-500/20 border-sky-500/40 text-sky-200'};
const SEV_ICON={high:'🔴',med:'🟡',low:'🔵'};

let CONTINUITY={issues:[],score:null,ts:0};

function renderContinuity(){
  const p=$('storyContinuityPanel');if(!p)return;
  if(!CONTINUITY.issues.length&&CONTINUITY.score==null){p.classList.add('hidden');p.innerHTML='';return;}
  p.classList.remove('hidden');
  const scoreColor=CONTINUITY.score>=80?'text-emerald-300':CONTINUITY.score>=50?'text-amber-300':'text-red-300';
  let html=`<div class="border border-white/10 rounded-xl p-3 bg-black/20">
    <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
      <div class="font-semibold text-sm">🔍 Continuity Report</div>
      <div class="flex items-center gap-3 text-xs">
        <span>Score: <b class="${scoreColor}">${CONTINUITY.score??'—'}/100</b></span>
        <span class="subtle">Issues: ${CONTINUITY.issues.length}</span>
        <button id="continuityClose" class="soft-btn text-[10px] px-2 py-0.5">×</button>
      </div>
    </div>`;
  if(!CONTINUITY.issues.length)html+='<div class="text-xs subtle p-3 text-center">✅ Разрывов не найдено</div>';
  else{
    html+='<div class="space-y-2">';
    CONTINUITY.issues.forEach((it,idx)=>{
      const sev=SEV[it.severity]||SEV.med;
      const fromLabel=it.scene_from!=null?`Scene ${it.scene_from+1}`:'all';
      const toLabel=it.scene_to!=null?`Scene ${it.scene_to+1}`:'';
      html+=`<div class="rounded-lg border ${sev} p-2 text-xs">
        <div class="flex items-center justify-between gap-2 mb-1 flex-wrap">
          <div><b>${SEV_ICON[it.severity]||'🟡'} ${(it.type||'').toUpperCase()}</b> · ${fromLabel}${toLabel?' → '+toLabel:''}</div>
          <div class="flex gap-1">
            ${it.scene_to!=null?`<button data-cfix="${idx}" class="soft-btn text-[10px] px-2 py-0.5">🔧 Применить fix</button>`:''}
            <button data-cdel="${idx}" class="soft-btn text-[10px] px-2 py-0.5">✕</button>
          </div>
        </div>
        <div class="opacity-90">${(it.description||'').replace(/</g,'&lt;')}</div>
        ${it.fix_suggestion?`<div class="mt-1 pt-1 border-t border-white/10 opacity-80"><b>💡 Fix:</b> ${(it.fix_suggestion||'').replace(/</g,'&lt;')}</div>`:''}
      </div>`;
    });
    html+='</div>';
  }
  html+='</div>';
  p.innerHTML=html;
  $('continuityClose').onclick=()=>{CONTINUITY={issues:[],score:null,ts:0};renderContinuity();};
  p.querySelectorAll('[data-cdel]').forEach(b=>b.onclick=()=>{CONTINUITY.issues.splice(+b.dataset.cdel,1);renderContinuity();});
  p.querySelectorAll('[data-cfix]').forEach(b=>b.onclick=()=>applyContinuityFix(+b.dataset.cfix));
}

$('storyContinuity').onclick=async()=>{
  if(!STORY.scenes.length){toast('Нет сцен для проверки');return;}
  if(!needKey())return;
  const btn=$('storyContinuity');btn.textContent='⏳ AI анализ...';btn.disabled=true;
  const scenesText=STORY.scenes.map((s,i)=>`Scene ${i+1} ("${s.title||''}"): ${s.prompt}`).join('\n\n');
  const sys=`You are a script supervisor checking video continuity. Given a hero description and a list of scenes, find ALL discontinuities between them: wardrobe changes, time-of-day jumps, weather inconsistencies, prop appearances/disappearances, location mismatches, lighting contradictions, character feature drift.
Reply ONLY as JSON:
{"score":0-100,"issues":[{"type":"wardrobe|time|weather|prop|location|lighting|character|other","scene_from":<0-based index>,"scene_to":<0-based index>,"severity":"high|med|low","description":"<1 sentence in Russian>","fix_suggestion":"<concrete English text to insert into scene_to's prompt to resolve this>"}]}
Score 100 = perfect continuity, 0 = chaos. If only one scene, focus on internal consistency with hero. Return [] if no issues.`;
  const user=`HERO: ${STORY.hero||'(not specified)'}\n\nSCENES:\n${scenesText}`;
  const out=await aiCall([{role:'system',content:sys},{role:'user',content:user}],{json:true});
  btn.textContent='🔍 Continuity check';btn.disabled=false;
  if(!out){toast('AI: пусто');return;}
  try{
    const d=JSON.parse(out);
    CONTINUITY={
      issues:Array.isArray(d.issues)?d.issues.map(i=>({
        type:String(i.type||'other'),
        scene_from:typeof i.scene_from==='number'?i.scene_from:null,
        scene_to:typeof i.scene_to==='number'?i.scene_to:null,
        severity:['high','med','low'].includes(i.severity)?i.severity:'med',
        description:String(i.description||''),
        fix_suggestion:String(i.fix_suggestion||'')
      })):[],
      score:typeof d.score==='number'?Math.round(d.score):null,
      ts:Date.now()
    };
    renderContinuity();
    if(!CONTINUITY.issues.length)toast('✅ Разрывов не найдено');
    else toast(`⚠ Найдено: ${CONTINUITY.issues.length}, score ${CONTINUITY.score}/100`);
  }catch(e){toast('JSON err: '+e.message);}
};

async function applyContinuityFix(idx){
  const issue=CONTINUITY.issues[idx];if(!issue||issue.scene_to==null)return;
  const scene=STORY.scenes[issue.scene_to];if(!scene){toast('Сцена не найдена');return;}
  if(!needKey())return;
  toast('🔧 AI переписывает сцену...');
  const sys=`You are a script editor. Rewrite the given video scene prompt to fix this continuity issue. Keep the original intent, length (~30-50 words), and cinematic English style. Return ONLY the new prompt as a flat plain string, no JSON, no quotes, no labels.`;
  const user=`HERO: ${STORY.hero}\n\nORIGINAL SCENE PROMPT:\n${scene.prompt}\n\nCONTINUITY ISSUE: ${issue.description}\n\nFIX TO APPLY: ${issue.fix_suggestion}`;
  const out=await aiCall([{role:'system',content:sys},{role:'user',content:user}],{json:false});
  if(!out){toast('AI: пусто');return;}
  scene.prompt=out.trim().replace(/^["']|["']$/g,'').slice(0,800);
  saveStory();
  CONTINUITY.issues.splice(idx,1);
  renderStory();renderContinuity();
  toast('✓ Сцена обновлена');
}

/* ============================================================ */
/* ============ v7.2: FCPXML EXPORT (timeline) ================ */
/* ============================================================ */

function _xmlEsc(s){return String(s||'').replace(/[<>&"']/g,c=>({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));}

function makePlaceholderPng(text,w=1920,h=1080){
  return new Promise(res=>{
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d');
    const grad=ctx.createLinearGradient(0,0,w,h);
    grad.addColorStop(0,'#1a1033');grad.addColorStop(1,'#0a0518');
    ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(168,85,247,0.4)';ctx.lineWidth=8;
    ctx.strokeRect(40,40,w-80,h-80);
    ctx.fillStyle='#a78bfa';ctx.font='bold 36px sans-serif';ctx.textAlign='left';
    ctx.fillText('🎬 SEEDANCE STORY · placeholder',80,110);
    ctx.fillStyle='#fff';ctx.font='bold 96px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const words=String(text).split(' ');const lines=[];let line='';
    words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w-300){lines.push(line);line=wd;}else line=t;});
    if(line)lines.push(line);
    const lh=120,y0=h/2-(lines.length-1)*lh/2;
    lines.forEach((ln,i)=>ctx.fillText(ln,w/2,y0+i*lh));
    c.toBlob(b=>res(b),'image/png');
  });
}

function buildFCPXML(story,opts){
  const fps=opts.fps||24,W=1920,H=1080,durSec=opts.durSec||5;
  const frames=sec=>Math.round(sec*fps);
  const rat=sec=>`${frames(sec)}/${fps}s`;
  const scenes=story.scenes;
  let rid=1;
  const fMain=`r${rid++}`,fStill=`r${rid++}`;
  let resXML=`
    <format id="${fMain}" name="FFVideoFormat1080p${fps}" frameDuration="100/${fps*100}s" width="${W}" height="${H}" colorSpace="1-1-1 (Rec. 709)"/>
    <format id="${fStill}" name="FFVideoFormatRateUndefined" width="${W}" height="${H}"/>`;
  const assetIds=[];
  scenes.forEach((sc,i)=>{
    const id=`r${rid++}`;assetIds[i]=id;
    const fname=`media/preview-${String(i+1).padStart(2,'0')}.png`;
    resXML+=`
    <asset id="${id}" name="preview-${i+1}" start="0s" hasVideo="1" format="${fStill}" duration="0s">
      <media-rep kind="original-media" src="${fname}"/>
    </asset>`;
  });
  let offset=0;
  const spineXML=scenes.map((sc,i)=>{
    const d=rat(durSec),off=rat(offset);offset+=durSec;
    const name=_xmlEsc(`Scene ${i+1}: ${sc.title||''}`);
    const note=_xmlEsc(sc.prompt||'');
    const markers=(opts.continuity?.issues||[])
      .filter(it=>it.scene_to===i)
      .map(it=>`<marker start="0s" duration="40/${fps}s" value="${_xmlEsc((it.severity||'').toUpperCase()+': '+(it.description||''))}"/>`).join('');
    return `<video ref="${assetIds[i]}" offset="${off}" name="${name}" start="0s" duration="${d}"><note>${note}</note>${markers}</video>`;
  }).join('\n            ');
  const totalDur=rat(scenes.length*durSec);
  const projName=_xmlEsc(story.title||'Untitled Story');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.10">
  <resources>${resXML}
  </resources>
  <library>
    <event name="Seedance Story">
      <project name="${projName}">
        <sequence format="${fMain}" duration="${totalDur}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
            ${spineXML}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
}

/* Inject button */
(function injectFcpxml(){
  const bar=document.querySelector('#storyModal .flex.gap-2.mb-4');
  if(!bar)return;
  const b=document.createElement('button');
  b.id='storyFcpxml';b.className='soft-btn text-xs px-3 py-2';
  b.innerHTML='📽 FCPXML';
  b.title='Экспорт таймлайна для Final Cut Pro / DaVinci Resolve / Premiere Pro';
  bar.appendChild(b);
})();

$('storyFcpxml').onclick=async()=>{
  if(!STORY.scenes.length){toast('Нет сцен');return;}
  const btn=$('storyFcpxml');btn.textContent='⏳';btn.disabled=true;
  try{
    const JSZip=await loadJSZip();
    const zip=new JSZip();
    const durSec=parseInt(($('storyDur').value||'5s').replace('s',''))||5;
    const fps=24;
    // Process previews
    const mediaFolder=zip.folder('media');
    for(let i=0;i<STORY.scenes.length;i++){
      const sc=STORY.scenes[i];
      const fname=`preview-${String(i+1).padStart(2,'0')}.png`;
      btn.textContent=`⏳ ${i+1}/${STORY.scenes.length}`;
      let blob=null;
      if(sc.imgUrl&&sc.imgUrl.startsWith('http')){
        try{const r=await fetch(sc.imgUrl);blob=await r.blob();}catch(e){console.debug(e)}
      }
      if(!blob){
        blob=await makePlaceholderPng(`Scene ${i+1}: ${sc.title||'untitled'}`);
      }
      mediaFolder.file(fname,blob);
    }
    const xml=buildFCPXML(STORY,{fps,durSec,continuity:CONTINUITY});
    zip.file('story.fcpxml',xml);
    zip.file('story.json',JSON.stringify(STORY,null,2));
    zip.file('README.txt',
`SEEDANCE STORY → FCPXML EXPORT
================================

Содержимое:
  story.fcpxml      — таймлайн для импорта
  media/            — превью-картинки (placeholder для сцен без AI-картинки)
  story.json        — резерв (полный state сценария)

Импорт:

▸ Final Cut Pro (Mac):
    File → Import → XML... → выбери story.fcpxml

▸ DaVinci Resolve (Win/Mac/Linux):
    File → Import → Timeline... → выбери story.fcpxml
    (Resolve автоматически найдёт media/ рядом)

▸ Adobe Premiere Pro:
    File → Import → выбери story.fcpxml
    (Premiere поддерживает FCPXML 1.x частично; если ругается —
     открой проект сначала в Resolve и пересохрани в .xml)

Что в таймлайне:
  • ${STORY.scenes.length} клипов на главной видео-дорожке
  • Длительность: ${durSec}с каждый, ${fps}fps, 1920×1080
  • Имена клипов = названия сцен
  • В <note> каждого клипа — полный английский промт сцены
  • Маркеры на клипах = continuity issues (если делал проверку)

После импорта замени placeholder-картинки на реальные mp4 от
Seedance/Runway/Kling — таймлайн уже собран, просто drag-and-drop.

Сгенерировано: ${new Date().toISOString()}
Story: "${STORY.title||'Untitled'}"
Hero: ${STORY.hero||'(не задан)'}
`);
    const blob=await zip.generateAsync({type:'blob'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`story-fcpxml-${Date.now()}.zip`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('📽 FCPXML ZIP готов');
  }catch(e){toast('FCPXML err: '+e.message);}
  btn.textContent='📽 FCPXML';btn.disabled=false;
};

/* ============================================================ */
/* ============ v7.3: USER MANUAL link ======================== */
/* ============================================================ */
(function injectManualBtn(){
  const headerRight=document.querySelector('header > div:last-child');
  if(!headerRight)return;
  const b=document.createElement('a');
  b.id='manualBtn';b.href='MANUAL.html';b.target='_blank';b.rel='noopener';
  b.className='soft-btn text-xs px-3 py-1.5 ml-1';
  b.innerHTML='📖 Руководство';
  b.title='Открыть полное руководство пользователя (можно сохранить в PDF: Ctrl+P)';
  headerRight.appendChild(b);
})();

/* Command palette integration */
try{
  CMDS.push({n:'🎬 Story Mode',h:()=>$('storyBtn').click()});
  CMDS.push({n:'🔍 Continuity check',h:()=>{$('storyBtn').click();setTimeout(()=>$('storyContinuity').click(),300);}});
  CMDS.push({n:'📽 Export FCPXML',h:()=>{$('storyBtn').click();setTimeout(()=>$('storyFcpxml').click(),300);}});
  CMDS.push({n:'📖 Открыть руководство',h:()=>window.open('MANUAL.html','_blank')});
}catch(e){console.debug(e)}

/* ============================================================ */
/* ============ v7.4: PROTECTIVE LAYER ======================== */
/* ============================================================ */

/* --- 1. Error log + global handlers --- */
const ERR_LOG_KEY='seedance_errors';
const ERR_LOG_MAX=20;
function logError(src,err){
  try{
    const arr=JSON.parse(localStorage.getItem(ERR_LOG_KEY)||'[]');
    arr.unshift({t:Date.now(),src,msg:String(err?.message||err||'unknown'),stack:String(err?.stack||'').slice(0,500)});
    safeLS(ERR_LOG_KEY,JSON.stringify(arr.slice(0,ERR_LOG_MAX)));
  }catch(e){console.warn('logError failed',e);}
  console.error('['+src+']',err);
}
window.addEventListener('error',e=>{
  logError('window.error',e.error||e.message);
  if(e.message&&!/ResizeObserver|Script error/.test(e.message))toast('⚠ '+String(e.message).slice(0,80));
});
window.addEventListener('unhandledrejection',e=>{
  logError('unhandled-promise',e.reason);
  const m=e.reason?.message||String(e.reason||'Promise rejection');
  toast('⚠ '+m.slice(0,80));
});

/* --- 2. localStorage quota monitor --- */
function lsUsage(){
  let total=0;
  try{for(const k in localStorage){if(Object.prototype.hasOwnProperty.call(localStorage,k))total+=(k.length+(localStorage[k]||'').length);}}catch(e){console.debug(e)}
  return {bytes:total,kb:(total/1024).toFixed(1),mb:(total/1048576).toFixed(2),pct:Math.round(total/(5*1024*1024)*100)};
}
let _lastQuotaWarn=0;
function checkLSQuota(silent){
  const u=lsUsage();
  if(u.pct>=80&&Date.now()-_lastQuotaWarn>120000){
    _lastQuotaWarn=Date.now();
    if(!silent)toast(`⚠ Хранилище ${u.pct}% (${u.kb}KB). Ctrl+K → "Очистить"`);
  }
  return u;
}
function lsCleanup(){
  let freed=0;const before=lsUsage().bytes;
  try{
    if(typeof STORY!=='undefined'&&STORY?.scenes){
      STORY.scenes.forEach(s=>{if(s.imgUrl){delete s.imgUrl;freed++;}});
      saveStory();
    }
  }catch(e){logError('cleanup-story',e);}
  try{
    ['seedance_hist','seedance_fav'].forEach(k=>{
      const a=JSON.parse(localStorage.getItem(k)||'[]');
      if(a.length>10)safeLS(k,JSON.stringify(a.slice(0,10)));
    });
  }catch(e){logError('cleanup-list',e);}
  const saved=Math.max(0,before-lsUsage().bytes);
  toast(`🧹 Освобождено ${(saved/1024).toFixed(1)}KB${freed?' (превью: '+freed+')':''}`);
  if(typeof renderStory==='function')renderStory();
}

/* --- 3. Auto-backup before AI ops --- */
const SAFETY_KEY='seedance_safety_backup';
function safetyBackup(){
  try{
    const snap={ts:Date.now(),state:collectState(),story:typeof STORY!=='undefined'?STORY:null};
    safeLS(SAFETY_KEY,JSON.stringify(snap));
  }catch(e){logError('backup',e);}
}
function safetyRestore(){
  const r=localStorage.getItem(SAFETY_KEY);
  if(!r){toast('Нет backup');return;}
  try{
    const s=JSON.parse(r);
    const ago=Math.round((Date.now()-s.ts)/1000);
    if(!confirm(`Восстановить backup от ${new Date(s.ts).toLocaleTimeString()} (${ago}с назад)?\n\nТекущее состояние перезапишется.`))return;
    if(s.state)applyState(s.state);
    if(s.story&&typeof STORY!=='undefined'){Object.assign(STORY,s.story);saveStory();if(typeof renderStory==='function')renderStory();}
    if(typeof generate==='function')generate();
    toast('🚑 Восстановлено');
  }catch(e){logError('restore',e);toast('Backup битый: '+e.message);}
}

/* --- 4. Wrap aiCall with timeout + retry --- */
const AI_TIMEOUT_MS=60000;
const _origAiCall=window.aiCall;
async function aiCallSafe(messages,opts={}){
  safetyBackup();
  const maxAttempts=2;
  let lastErr=null;
  for(let attempt=1;attempt<=maxAttempts;attempt++){
    try{
      const result=await Promise.race([
        _origAiCall(messages,opts),
        new Promise((_,rej)=>setTimeout(()=>rej(new Error('AI timeout '+(AI_TIMEOUT_MS/1000)+'s')),AI_TIMEOUT_MS))
      ]);
      return result;
    }catch(e){
      lastErr=e;
      logError('aiCall-attempt-'+attempt,e);
      const retryable=/timeout|network|fetch|Failed to fetch|NetworkError/i.test(e.message||'');
      if(attempt<maxAttempts&&retryable){
        toast(`⏱ Сеть: повтор ${attempt}/${maxAttempts-1}...`);
        await new Promise(r=>setTimeout(r,1500));
        continue;
      }
      toast('⚠ AI: '+String(e.message||e).slice(0,80));
      return null;
    }
  }
  return null;
}
window.aiCall=aiCallSafe;

/* --- 5. Schema validation helper --- */
function assertShape(obj,schema,ctx='?'){
  for(const [k,t] of Object.entries(schema)){
    const val=obj?.[k];
    if(val==null&&t.endsWith('?'))continue;
    const baseType=t.replace('?','');
    if(baseType==='string'&&typeof val!=='string')throw new Error(`${ctx}.${k}: expected string, got ${typeof val}`);
    if(baseType==='array'&&!Array.isArray(val))throw new Error(`${ctx}.${k}: expected array`);
    if(baseType==='number'&&typeof val!=='number')throw new Error(`${ctx}.${k}: expected number`);
    if(baseType==='object'&&(typeof val!=='object'||Array.isArray(val)))throw new Error(`${ctx}.${k}: expected object`);
  }
  return true;
}
window.assertShape=assertShape;

/* --- 6. Self-test panel + Error log viewer --- */
function runSelfTest(){
  const tests=[];
  const T=(name,fn)=>{
    try{const r=fn();tests.push([name,r===false?'fail':'ok',typeof r==='string'?r:(r===true||r===undefined?'':String(r))]);}
    catch(e){tests.push([name,'fail',e.message]);}
  };
  T('localStorage write',()=>safeLS('__sdtest__','1'));
  T('localStorage read',()=>localStorage.getItem('__sdtest__')==='1');
  try{localStorage.removeItem('__sdtest__');}catch(e){console.debug(e)}
  T('LS quota',()=>{const u=lsUsage();return (u.pct<80?'OK ':'WARN ')+u.kb+'KB ('+u.pct+'%)';});
  T('DOM critical elements',()=>{
    const ids=['outEnView','subject','action','aiKey','storyBtn','manualBtn','reset','aiSettingsBtn'];
    const missing=ids.filter(id=>!$(id));
    return missing.length?'missing: '+missing.join(','):ids.length+' present';
  });
  T('AI key configured',()=>{const c=aiCfg();return c.key?'yes':'no (set in ⚙ AI)';});
  T('AI base URL',()=>aiCfg().base);
  T('AI model',()=>aiCfg().model);
  T('Canvas API',()=>typeof document.createElement('canvas').getContext==='function'?'yes':false);
  T('JSZip',()=>typeof window.JSZip!=='undefined'?'cached':'lazy (will load on demand)');
  T('Web Speech API',()=>typeof window.SpeechRecognition!=='undefined'||typeof window.webkitSpeechRecognition!=='undefined'?'yes':'not supported');
  T('Clipboard API',()=>navigator.clipboard?'yes':'fallback only');
  T('STORY structure',()=>{
    if(typeof STORY==='undefined')return false;
    return STORY&&typeof STORY.hero==='string'&&Array.isArray(STORY.scenes)?STORY.scenes.length+' scenes':'invalid';
  });
  T('Command palette',()=>Array.isArray(CMDS)&&CMDS.length>5?CMDS.length+' commands':false);
  T('Error journal',()=>{const a=JSON.parse(localStorage.getItem(ERR_LOG_KEY)||'[]');return a.length+' entries';});
  T('Safety backup',()=>localStorage.getItem(SAFETY_KEY)?'present':'none yet');
  T('aiCall wrapper',()=>window.aiCall===aiCallSafe?'active':false);

  const pass=tests.filter(t=>t[1]==='ok').length;
  const allOk=pass===tests.length;
  document.getElementById('selfTestModal')?.remove();
  const html=`
<div class="fixed inset-0 z-[60] grid place-items-center p-3 bg-black/60 backdrop-blur" id="selfTestModal" onclick="if(event.target===this)this.remove()">
  <div class="glass rounded-2xl p-5 max-w-2xl w-full max-h-[85vh] overflow-auto scrollbar" onclick="event.stopPropagation()">
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold text-lg">🔧 Self-test · <span class="${allOk?'text-emerald-400':'text-amber-400'}">${pass}/${tests.length}</span></h2>
      <button class="soft-btn text-xs px-3 py-1.5" onclick="this.closest('#selfTestModal').remove()">×</button>
    </div>
    <table class="w-full text-xs">
      <thead><tr class="text-left subtle"><th class="pb-2 pr-2">Test</th><th class="pb-2 pr-2">Status</th><th class="pb-2">Detail</th></tr></thead>
      <tbody>${tests.map(([n,s,d])=>`<tr class="border-t border-white/10"><td class="py-1.5 pr-2">${n}</td><td class="py-1.5 pr-2"><span class="${s==='ok'?'text-emerald-400':'text-red-400'}">${s==='ok'?'✓ ok':'✕ fail'}</span></td><td class="py-1.5 subtle">${(d||'').replace(/</g,'&lt;')}</td></tr>`).join('')}</tbody>
    </table>
    <div class="mt-4 flex gap-2 flex-wrap">
      <button class="soft-btn text-xs px-3 py-2" onclick="window.showErrorLog()">🐛 Журнал ошибок</button>
      <button class="soft-btn text-xs px-3 py-2" onclick="window.lsCleanup()">🧹 Очистить хранилище</button>
      <button class="soft-btn text-xs px-3 py-2" onclick="window.safetyRestore()">🚑 Backup</button>
      <button class="soft-btn text-xs px-3 py-2" onclick="window.runSelfTest()">🔄 Re-run</button>
    </div>
  </div>
</div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}

function showErrorLog(){
  const arr=JSON.parse(localStorage.getItem(ERR_LOG_KEY)||'[]');
  document.getElementById('errLogModal')?.remove();
  const body=arr.length
    ?arr.map(e=>`<div class="text-xs mb-2 p-2 rounded border border-red-500/30 bg-red-500/10"><div class="subtle text-[10px]">${new Date(e.t).toLocaleString()} · <b>${e.src}</b></div><div class="font-mono break-all">${(e.msg||'').replace(/</g,'&lt;').slice(0,400)}</div>${e.stack?`<details class="mt-1"><summary class="subtle cursor-pointer text-[10px]">stack</summary><pre class="text-[10px] opacity-70 whitespace-pre-wrap">${(e.stack||'').replace(/</g,'&lt;')}</pre></details>`:''}</div>`).join('')
    :'<div class="text-xs subtle text-center p-6">✅ Журнал пуст — ошибок не зафиксировано</div>';
  const html=`
<div class="fixed inset-0 z-[60] grid place-items-center p-3 bg-black/60 backdrop-blur" id="errLogModal" onclick="if(event.target===this)this.remove()">
  <div class="glass rounded-2xl p-5 max-w-3xl w-full max-h-[85vh] overflow-auto scrollbar" onclick="event.stopPropagation()">
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold">🐛 Журнал ошибок (${arr.length})</h2>
      <div class="flex gap-2">
        ${arr.length?`<button class="soft-btn text-xs px-3 py-1.5" onclick="if(confirm('Очистить?')){localStorage.removeItem('${ERR_LOG_KEY}');this.closest('#errLogModal').remove();window.toast('🗑 Журнал очищен');}">🗑 Очистить</button>`:''}
        <button class="soft-btn text-xs px-3 py-1.5" onclick="this.closest('#errLogModal').remove()">×</button>
      </div>
    </div>
    ${body}
  </div>
</div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}

window.runSelfTest=runSelfTest;
window.showErrorLog=showErrorLog;
window.lsCleanup=lsCleanup;
window.safetyRestore=safetyRestore;
window.lsUsage=lsUsage;

try{
  CMDS.push({n:'🔧 Self-test (диагностика)',h:runSelfTest});
  CMDS.push({n:'🐛 Журнал ошибок',h:showErrorLog});
  CMDS.push({n:'🚑 Восстановить backup',h:safetyRestore});
  CMDS.push({n:'🧹 Очистить хранилище',h:()=>{if(confirm('Удалить превью Story и сократить историю до 10?'))lsCleanup();}});
}catch(e){console.debug(e)}

/* First-run quota check + periodic */
setTimeout(()=>checkLSQuota(),3000);
setInterval(()=>checkLSQuota(true),60000);

/* ============================================================ */
/* ============ v8: SIMPLE MODE (for SMM/marketing) =========== */
/* ============================================================ */

const SIMPLE_TEMPLATES={
  tiktok:{
    icon:'📱',label:'TikTok',sub:'9:16 · 8с · хук',
    aspect:'9:16',duration:'8s',
    fields:{style:'cinematic, dynamic, trending',shot:'medium close-up',camera:'handheld energetic, fast cuts',speed:'fast-paced',mood:'energetic, attention-grabbing',details:'strong hook in first second, vertical framing optimized for mobile, scroll-stopping visual'},
    aiHint:'Hook in 1st second. Fast pacing. Scroll-stopping. Mobile-vertical.'
  },
  reels:{
    icon:'📷',label:'Reels',sub:'9:16 · lifestyle',
    aspect:'9:16',duration:'8s',
    fields:{style:'polished aesthetic, lifestyle premium',shot:'medium shot',camera:'smooth gimbal, slow motion accents',lighting:'soft natural lighting',palette:'pastel dreamy',mood:'aspirational, beautiful'},
    aiHint:'Polished aesthetic. Aspirational. Smooth motion. Lifestyle vibe.'
  },
  shorts:{
    icon:'▶',label:'Shorts',sub:'9:16 · retention',
    aspect:'9:16',duration:'5s',
    fields:{style:'punchy, retention-optimized',shot:'close-up to wide reveal',camera:'dynamic punch-in',speed:'fast',mood:'curiosity, surprise',details:'pattern interrupt, high contrast'},
    aiHint:'Pattern interrupt. Curiosity gap. Punchy reveal.'
  },
  ad:{
    icon:'🛍',label:'Реклама',sub:'продукт-фокус',
    aspect:'9:16',duration:'6s',askProduct:true,askMessage:true,
    fields:{style:'product cinematography, premium commercial',shot:'macro to medium',camera:'slow dolly in, smooth orbital',lighting:'studio softbox hero lighting',palette:'clean, brand colors',mood:'desirable, premium, trustworthy'},
    aiHint:'Product hero. Premium feel. Clean lighting. Buy-now energy.'
  },
  cinema:{
    icon:'🎬',label:'Кино',sub:'16:9 · cinematic',
    aspect:'16:9',duration:'8s',
    fields:{style:'photorealistic, cinematic, film grain',shot:'wide cinematic to medium',camera:'anamorphic dolly, smooth tracking',lens:'anamorphic 50mm',lighting:'cinematic chiaroscuro',palette:'teal and orange',mood:'epic, atmospheric'},
    aiHint:'Cinematic. Anamorphic. Epic mood. Photorealistic.'
  }
};

let _smTemplate='tiktok';

function smRenderTiles(){
  const wrap=document.getElementById('smTiles');if(!wrap)return;
  wrap.innerHTML=Object.entries(SIMPLE_TEMPLATES).map(([k,t])=>`
    <div class="sm-tile${k===_smTemplate?' active':''}" data-tpl="${k}">
      <span class="sm-tile-icon">${t.icon}</span>
      <div class="sm-tile-label">${t.label}</div>
      <div class="sm-tile-sub">${t.sub}</div>
    </div>`).join('');
  wrap.querySelectorAll('.sm-tile').forEach(el=>el.onclick=()=>smSelectTemplate(el.dataset.tpl));
  smUpdateAdFields();
  smUpdateHint();
}

function smSelectTemplate(id){
  _smTemplate=id;
  document.querySelectorAll('#smTiles .sm-tile').forEach(el=>el.classList.toggle('active',el.dataset.tpl===id));
  smUpdateAdFields();
  smUpdateHint();
}

function smUpdateAdFields(){
  const tpl=SIMPLE_TEMPLATES[_smTemplate];
  const ad=document.getElementById('smAdFields');
  if(!ad)return;
  if(tpl.askProduct||tpl.askMessage)ad.classList.remove('sm-hidden');
  else ad.classList.add('sm-hidden');
}

function smUpdateHint(){
  const hint=document.getElementById('smHint');if(!hint)return;
  const c=aiCfg();
  if(c.key)hint.textContent='AI-режим: 3 варианта со score';
  else hint.innerHTML='Без AI: 1 готовый промт. <button class="underline hover:text-violet-400" onclick="document.getElementById(\'aiSettingsBtn\').click()">Подключить AI →</button> для 3 вариантов';
}

function smBuildOfflinePrompt(idea,tpl,brand,message){
  const parts=[];
  if(brand)parts.push(brand);
  if(idea)parts.push(idea);
  if(message)parts.push(`conveying ${message}`);
  Object.values(tpl.fields).forEach(v=>parts.push(v));
  parts.push(`aspect ratio ${tpl.aspect}`,`duration ${tpl.duration}`,'high quality, sharp focus, professional');
  return parts.filter(Boolean).join(', ');
}

function smScoreClass(n){return n>=80?'sm-score-high':n>=60?'sm-score-mid':'sm-score-low';}

/* ===== Batch Export (Markdown / CSV / JSON / TXT) ===== */
function _bxDownload(filename,content,mime){
  try{
    const blob=new Blob([content],{type:mime+';charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=filename;
    document.body.appendChild(a);a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);
  }catch(e){logError('bxDownload',e);toast('⚠ Не удалось скачать');}
}
function _bxStamp(){const d=new Date();const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;}
function _bxCsvEscape(s){s=String(s==null?'':s);return /[",\n;]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}

function bxExportMd(meta,variants){
  const lines=[];
  lines.push(`# Промты — ${meta.idea||'(без идеи)'}`,'');
  lines.push(`> Сгенерировано: ${new Date().toLocaleString('ru-RU')}`);
  if(meta.target)lines.push(`> Цель: ${meta.target}`);
  if(meta.style)lines.push(`> Стиль: ${meta.style}`);
  if(meta.aspect)lines.push(`> Aspect: ${meta.aspect}`);
  if(meta.core)lines.push(`> Ядро: **${meta.core.subject||''}** · **${meta.core.action||''}**${meta.core.object?' · **'+meta.core.object+'**':''}`);
  lines.push('');
  variants.forEach((v,i)=>{
    lines.push(`## ${i+1}. ${v.title||'Вариант '+(i+1)}${typeof v.score==='number'?' — ⭐ '+v.score+'/100':''}`);
    if(v.why)lines.push(`*${v.why}*`);
    lines.push('','**🇬🇧 EN:**','',v.prompt_en||'','');
    if(v.prompt_ru){lines.push('**🇷🇺 RU:**','',v.prompt_ru,'');}
    lines.push('---','');
  });
  return lines.join('\n');
}
function bxExportCsv(meta,variants){
  const head=['#','title','score','approach','prompt_en','prompt_ru','why'];
  const rows=[head.join(',')];
  variants.forEach((v,i)=>{
    rows.push([i+1,v.title||'',v.score==null?'':v.score,v.approach||'',v.prompt_en||'',v.prompt_ru||'',v.why||''].map(_bxCsvEscape).join(','));
  });
  return '\uFEFF'+rows.join('\n'); // BOM for Excel UTF-8
}
function bxExportJson(meta,variants){
  return JSON.stringify({
    app:'seedance-studio',version:'10.7',
    generated_at:new Date().toISOString(),
    idea:meta.idea||null,target:meta.target||null,style:meta.style||null,aspect:meta.aspect||null,
    core:meta.core||null,
    variants:variants.map(v=>({title:v.title||null,score:v.score==null?null:v.score,approach:v.approach||null,prompt_en:v.prompt_en||'',prompt_ru:v.prompt_ru||'',why:v.why||null}))
  },null,2);
}
function bxExportTxt(variants){
  return variants.map((v,i)=>`# ${i+1}. ${v.title||'Variant '+(i+1)}\n${v.prompt_en||''}`).join('\n\n---\n\n');
}

function bxBarHtml(prefix){
  return `<div class="mt-4 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20 flex flex-wrap items-center gap-2" data-bx="${prefix}">
    <span class="text-xs subtle mr-1">📦 Экспорт всех вариантов:</span>
    <button class="soft-btn text-xs px-3 py-1.5" data-bx-fmt="md">📋 Markdown</button>
    <button class="soft-btn text-xs px-3 py-1.5" data-bx-fmt="csv">📊 CSV</button>
    <button class="soft-btn text-xs px-3 py-1.5" data-bx-fmt="json">💾 JSON</button>
    <button class="soft-btn text-xs px-3 py-1.5" data-bx-fmt="txt">📝 TXT (только EN)</button>
  </div>`;
}
function bxWire(container,prefix,meta,variants){
  const bar=container.querySelector(`[data-bx="${prefix}"]`);if(!bar)return;
  bar.querySelectorAll('[data-bx-fmt]').forEach(btn=>{
    btn.onclick=()=>{
      if(!variants||!variants.length){toast('Нечего экспортировать');return;}
      const fmt=btn.dataset.bxFmt;
      const stamp=_bxStamp();
      const base=`lumen-${prefix}-${stamp}`;
      try{
        if(fmt==='md')_bxDownload(base+'.md',bxExportMd(meta,variants),'text/markdown');
        else if(fmt==='csv')_bxDownload(base+'.csv',bxExportCsv(meta,variants),'text/csv');
        else if(fmt==='json')_bxDownload(base+'.json',bxExportJson(meta,variants),'application/json');
        else if(fmt==='txt')_bxDownload(base+'.txt',bxExportTxt(variants),'text/plain');
        toast('📥 Скачано: '+base+'.'+fmt);
      }catch(e){logError('bxExport.'+fmt,e);toast('⚠ Ошибка экспорта');}
    };
  });
}

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
  document.getElementById('phSearch')?.addEventListener('input',phRender);
  document.getElementById('phModal')?.addEventListener('click',e=>{if(e.target.id==='phModal')phToggle(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('phModal')?.classList.contains('sm-hidden'))phToggle(false);});
})();

function smRenderResults(variants){
  const out=document.getElementById('smResults');if(!out)return;
  if(!variants||!variants.length){out.innerHTML='';return;}
  // Backward compat: prompt → prompt_en
  variants.forEach(v=>{if(!v.prompt_en&&v.prompt)v.prompt_en=v.prompt;});
  out.innerHTML=variants.map((v,i)=>`
    <div class="sm-result" data-vi="${i}">
      <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-sm">Вариант ${i+1}</span>
          ${typeof v.score==='number'?`<span class="sm-score ${smScoreClass(v.score)}">⭐ ${v.score}/100</span>`:''}
        </div>
      </div>
      <div class="mb-2">
        <div class="text-[10px] uppercase tracking-wider subtle mb-1">🇬🇧 EN — для вставки в Sora/Runway/Kling</div>
        <div class="text-sm whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-black/20 border border-white/5" data-prompt="en">${(v.prompt_en||'').replace(/</g,'&lt;')}</div>
      </div>
      ${v.prompt_ru?`
      <details class="mb-2">
        <summary class="text-[10px] uppercase tracking-wider subtle cursor-pointer hover:text-violet-400">🇷🇺 RU — перевод для понимания</summary>
        <div class="text-sm whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-black/10 border border-white/5 mt-2 italic" data-prompt="ru">${v.prompt_ru.replace(/</g,'&lt;')}</div>
      </details>`:''}
      <div class="flex flex-wrap gap-1 mt-2">
        <button class="soft-btn text-xs px-2.5 py-1.5" data-sm-copy-en="${i}">📋 EN</button>
        ${v.prompt_ru?`<button class="soft-btn text-xs px-2.5 py-1.5" data-sm-copy-ru="${i}">📋 RU</button>`:''}
        ${aiCfg().key?`<button class="soft-btn text-xs px-2.5 py-1.5" data-sm-improve="${i}">✨ Улучшить</button>`:''}
        <button class="soft-btn text-xs px-2.5 py-1.5" data-sm-pro="${i}" title="Открыть в Pro mode для тонкой настройки">🎛 В Pro</button>
      </div>
      ${v.why?`<div class="text-xs subtle mt-2 italic">💡 ${(v.why||'').replace(/</g,'&lt;')}</div>`:''}
    </div>`).join('');
  out.querySelectorAll('[data-sm-copy-en]').forEach(b=>b.onclick=()=>{const i=+b.dataset.smCopyEn;navigator.clipboard.writeText(variants[i].prompt_en||'');toast('📋 EN скопирован');});
  out.querySelectorAll('[data-sm-copy-ru]').forEach(b=>b.onclick=()=>{const i=+b.dataset.smCopyRu;navigator.clipboard.writeText(variants[i].prompt_ru||'');toast('📋 RU скопирован');});
  out.querySelectorAll('[data-sm-improve]').forEach(b=>b.onclick=async()=>{const i=+b.dataset.smImprove;await smImproveVariant(variants,i);});
  out.querySelectorAll('[data-sm-pro]').forEach(b=>b.onclick=()=>{const i=+b.dataset.smPro;smSendToPro(variants[i].prompt_en||'');});
  // Batch export bar
  if(variants.length){
    const tpl=SIMPLE_TEMPLATES[_smTemplate];
    const meta={idea:document.getElementById('smIdea')?.value.trim()||'',target:'video',style:tpl?.label||'',aspect:tpl?.aspect||''};
    out.insertAdjacentHTML('beforeend',bxBarHtml('video'));
    bxWire(out,'video',meta,variants);
  }
  window._smVariants=variants;
}

async function smImproveVariant(variants,i){
  if(!needKey())return;
  const v=variants[i];
  toast('✨ Улучшаю...');
  const out=await aiCall([
    {role:'system',content:'Improve this video prompt: stronger hook, more vivid visuals, better cinematic detail. Keep under 200 words. Reply ONLY as JSON: {"prompt_en":"the improved ENGLISH prompt","prompt_ru":"faithful Russian translation, same structure and length"}.'},
    {role:'user',content:'EN: '+(v.prompt_en||'')}
  ],{json:true});
  if(out){
    let en=v.prompt_en,ru=v.prompt_ru;
    try{const jb=JSON.parse(out);if(jb.prompt_en)en=String(jb.prompt_en).trim();if(jb.prompt_ru)ru=String(jb.prompt_ru).trim();}
    catch(_){en=out.trim();}
    variants[i]={...v,prompt_en:en,prompt_ru:ru,score:Math.min(100,(v.score||70)+5),why:'Улучшено: усилен хук и детали'};
    smRenderResults(variants);
    toast('✨ Готово');
  }
}

function smSendToPro(prompt){
  setMode('pro');
  setTimeout(()=>{
    const sub=$('subject');if(sub){sub.value=prompt.slice(0,200);sub.dispatchEvent(new Event('change'));}
    const out=$('outEnView');if(out){out.textContent=prompt;out.dataset.raw=prompt;}
    toast('🎛 Открыт в Pro mode');
  },200);
}

async function smGenerate(){
  const idea=document.getElementById('smIdea').value.trim();
  if(!idea){toast('Опиши идею');document.getElementById('smIdea').focus();return;}
  const tpl=SIMPLE_TEMPLATES[_smTemplate];
  const brand=document.getElementById('smBrand')?.value.trim();
  const message=document.getElementById('smMessage')?.value.trim();
  const btn=document.getElementById('smGenerate');
  const orig=btn.textContent;btn.disabled=true;btn.textContent='⏳ Генерирую...';
  const _smOut=document.getElementById('smResults');
  if(window.skel)window.skel(_smOut,{stages:['Анализирую идею','Подбираю кинематографию','Генерирую 3 варианта'],count:3});
  else _smOut.innerHTML='<div class="text-sm subtle">⏳ Создаю промт...</div>';

  const c=aiCfg();
  try{
    if(c.key){
      const sys=`You are a professional video prompt engineer for AI video generators (Seedance, Runway, Kling, Sora).
Generate exactly 3 DISTINCT cinematic prompts for the same idea.
Format: ${tpl.label} — aspect ratio ${tpl.aspect}, duration ${tpl.duration}.
Style guidance: ${Object.entries(tpl.fields).map(([k,v])=>`${k}: ${v}`).join('; ')}.
${brand?`Product/brand: ${brand}.`:''}
${message?`Core emotional message: ${message}.`:''}
Tactical hints: ${tpl.aiHint}

Each variant must be DIFFERENT in approach (e.g. v1=action-led, v2=emotion-led, v3=product/visual-led).

🌐 LANGUAGE RULE — STRICT
- prompt_en: ALWAYS in ENGLISH (this is what gets pasted into Sora/Runway/Kling), under 180 words, vivid sensory.
- prompt_ru: faithful Russian translation of prompt_en — same structure, same length, technical terms transliterated or kept in parentheses.

Score 0-100 = viral/engagement potential.

Reply ONLY as JSON:
{"variants":[
  {"prompt_en":"...","prompt_ru":"...","score":85,"why":"короткое обоснование на русском, 1 строка"},
  {"prompt_en":"...","prompt_ru":"...","score":...,"why":"..."},
  {"prompt_en":"...","prompt_ru":"...","score":...,"why":"..."}
]}`;
      const out=await aiCall([{role:'system',content:sys},{role:'user',content:idea}],{json:true});
      if(!out)throw new Error('Пустой ответ AI');
      const j=JSON.parse(out);
      assertShape(j,{variants:'array'},'smGenerate');
      j.variants.forEach((v,i)=>{
        if(!v.prompt_en&&v.prompt)v.prompt_en=v.prompt;
        if(!v.prompt_ru)v.prompt_ru='';
        assertShape(v,{prompt_en:'string',score:'number'},'variant['+i+']');
      });
      j.variants.sort((a,b)=>(b.score||0)-(a.score||0));
      smRenderResults(j.variants);
      phPush({mode:'video',idea,meta:{target:'video',style:tpl?.label||'',aspect:tpl?.aspect||'',brand,message},variants:j.variants});
      toast('✨ '+j.variants.length+' вариантов готово');
    }else{
      const prompt=smBuildOfflinePrompt(idea,tpl,brand,message);
      smRenderResults([{prompt,why:'Шаблонная сборка без AI. Подключи AI для 3 вариантов со score.'}]);
      toast('✨ Промт готов');
    }
  }catch(e){
    logError('smGenerate',e);
    document.getElementById('smResults').innerHTML=`<div class="sm-result text-sm text-red-400">⚠ Ошибка: ${e.message.replace(/</g,'&lt;')}<br/><span class="text-xs subtle">Попробуй ещё раз или открой Pro mode.</span></div>`;
  }finally{
    btn.disabled=false;btn.textContent=orig;
  }
}

/* --- Mode toggle --- */
function setMode(m){
  document.body.dataset.mode=m;
  const sm=document.getElementById('simpleMode');
  const pro=document.getElementById('proModeWrap');
  if(sm)sm.classList.toggle('sm-hidden',m!=='simple');
  if(pro)pro.classList.toggle('sm-hidden',m!=='pro');
  const btn=document.getElementById('modeToggle');
  if(btn)btn.innerHTML=m==='simple'?'🎛 Pro':'🟢 Simple';
  safeLS('seedance_ui_mode',m);
  if(m==='simple')smUpdateHint();
}

(function initSimpleMode(){
  smRenderTiles();
  document.getElementById('smGenerate')?.addEventListener('click',smGenerate);
  document.getElementById('smGoPro')?.addEventListener('click',()=>setMode('pro'));
  document.getElementById('modeToggle')?.addEventListener('click',()=>{
    const cur=localStorage.getItem('seedance_ui_mode')||'simple';
    setMode(cur==='simple'?'pro':'simple');
  });
  document.getElementById('smIdea')?.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();smGenerate();}
  });
  // Default mode: simple for first-time users, otherwise last-used
  const saved=localStorage.getItem('seedance_ui_mode');
  setMode(saved||'simple');
})();

try{
  CMDS.push({n:'🟢 Simple mode (для блогеров)',h:()=>setMode('simple')});
  CMDS.push({n:'🎛 Pro mode (полный интерфейс)',h:()=>setMode('pro')});
}catch(e){console.debug(e)}

/* ============================================================ */
/* ============ v9: TEXT-TO-IMAGE ============================ */
/* ============================================================ */

/* --- Core helper: generate image from prompt --- */
async function generateImage(prompt,opts={}){
  const c=needKey();if(!c)return null;
  const {size='1024x1024',quality='standard',model='dall-e-3',n=1}=opts;
  // OpenRouter/Ollama don't support /images/generations
  if(/openrouter|ollama|11434/i.test(c.base)){
    toast('⚠ Этот провайдер не поддерживает генерацию картинок. Нужен ключ OpenAI.');
    return null;
  }
  try{
    const body={model,prompt:prompt.slice(0,3800),size,n};
    if(model==='dall-e-3')body.quality=quality;
    const r=await fetch(c.base+'/images/generations',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},
      body:JSON.stringify(body)
    });
    const j=await r.json();
    if(j.error){toast('Image: '+j.error.message);logError('image',j.error);return null;}
    return (j.data||[]).map(d=>d.url||(d.b64_json?'data:image/png;base64,'+d.b64_json:null)).filter(Boolean);
  }catch(e){
    logError('generateImage',e);
    toast('⚠ Image: '+e.message.slice(0,80));
    return null;
  }
}
window.generateImage=generateImage;

/* --- Simple Mode: preview button on each variant --- */
async function smPreviewVariant(variants,i,btn){
  if(!needKey())return;
  const v=variants[i];
  const orig=btn.textContent;btn.disabled=true;btn.textContent='⏳';
  try{
    const tpl=SIMPLE_TEMPLATES[_smTemplate];
    const size=tpl.aspect==='9:16'?'1024x1792':tpl.aspect==='16:9'?'1792x1024':'1024x1024';
    const stillPrompt='cinematic still frame from video, '+v.prompt.slice(0,500);
    const urls=await generateImage(stillPrompt,{size});
    if(urls&&urls[0]){
      const card=btn.closest('.sm-result');
      let preview=card.querySelector('.sm-preview');
      if(!preview){preview=document.createElement('div');preview.className='sm-preview mt-3';card.appendChild(preview);}
      preview.innerHTML=`<img src="${urls[0]}" class="w-full rounded-lg"/><div class="flex gap-2 mt-2"><a href="${urls[0]}" download="preview-${i+1}.png" class="soft-btn text-xs px-3 py-1.5">⬇ Скачать</a><button class="soft-btn text-xs px-3 py-1.5" onclick="this.closest('.sm-preview').remove()">✕</button></div>`;
      toast('🖼 Кадр готов');
    }
  }finally{btn.disabled=false;btn.textContent=orig;}
}

/* Inject preview button into variant cards by patching smRenderResults */
const _smRenderResultsOrig=smRenderResults;
smRenderResults=function(variants){
  _smRenderResultsOrig(variants);
  // Add preview button to each card
  const out=document.getElementById('smResults');if(!out)return;
  out.querySelectorAll('.sm-result').forEach((card,i)=>{
    if(card.querySelector('[data-sm-preview]'))return;
    const btnRow=card.querySelector('.flex.gap-1');
    if(!btnRow||!aiCfg().key)return;
    const b=document.createElement('button');
    b.className='soft-btn text-xs px-2.5 py-1.5';
    b.dataset.smPreview=i;
    b.textContent='🖼 Превью';
    b.title='Сгенерировать референс-картинку';
    b.onclick=()=>smPreviewVariant(variants,i,b);
    btnRow.insertBefore(b,btnRow.firstChild);
  });
};

/* --- Image Mode (separate text-to-image tool) --- */
const IMG_SIZES=[
  {k:'1024x1024',label:'1:1',sub:'квадрат'},
  {k:'1792x1024',label:'16:9',sub:'горизонталь'},
  {k:'1024x1792',label:'9:16',sub:'вертикаль'}
];
const IMG_STYLES=[
  {k:'',label:'Без стиля',icon:'⚪',sub:'как описано'},
  {k:'photo',label:'Фото',icon:'📷',sub:'photoreal',suffix:', photorealistic, professional photography, 8k, sharp focus, hyperdetailed'},
  {k:'cinema',label:'Кино',icon:'🎬',sub:'cinematic',suffix:', cinematic still, anamorphic, film grain, dramatic lighting, color grading'},
  {k:'anime',label:'Аниме',icon:'🎌',sub:'anime',suffix:', anime style, studio ghibli inspired, cel-shaded, vibrant'},
  {k:'illust',label:'Иллюстрация',icon:'🎨',sub:'illustration',suffix:', digital illustration, concept art, painterly, vivid colors'},
  {k:'3d',label:'3D',icon:'🧊',sub:'3D render',suffix:', 3D render, octane render, volumetric lighting, realistic materials'},
  {k:'minimal',label:'Минимал',icon:'⬜',sub:'minimalist',suffix:', minimalist, clean composition, geometric, soft pastels'},
  {k:'noir',label:'Нуар',icon:'🎩',sub:'noir',suffix:', film noir, black and white, high contrast, moody chiaroscuro'},
  {k:'cyber',label:'Киберпанк',icon:'🤖',sub:'cyberpunk',suffix:', cyberpunk, neon lights, blade runner aesthetic, rain'},
  {k:'fantasy',label:'Фэнтези',icon:'🧙',sub:'fantasy',suffix:', epic fantasy art, dramatic mood, magical atmosphere, intricate'},
  {k:'pixar',label:'Pixar',icon:'🧸',sub:'3D animation',suffix:', Pixar-style 3D animation, expressive cartoon character with oversized eyes and rounded features, soft subsurface scattering, warm cinematic lighting, vibrant saturated colors, family-film aesthetic, octane render'},
  {k:'ghibli',label:'Ghibli',icon:'🌸',sub:'painterly anime',suffix:', Studio Ghibli inspired hand-painted aesthetic, soft watercolor backgrounds, lush mossy greenery, pastel palette, warm nostalgic mood, dreamy bokeh, Miyazaki-style'},
  {k:'unreal',label:'Hyperreal',icon:'🎮',sub:'Unreal Engine 5',suffix:', Unreal Engine 5 cinematic render, PS5-quality materials, ray-traced global illumination, volumetric fog, photogrammetry textures, AAA game cinematic'},
  {k:'wes',label:'Wes Anderson',icon:'🏛',sub:'symmetric pastel',suffix:', Wes Anderson aesthetic, perfectly symmetric centered composition, flat planar staging, retro pastel palette of mint salmon mustard and dusty pink, deadpan whimsical, vintage production design'}
];

let _imgSize='1024x1024';
let _imgStyle='';

function imgRenderTiles(){
  const sizeWrap=document.getElementById('imgSizeTiles');
  const styleWrap=document.getElementById('imgStyleTiles');
  if(!sizeWrap||!styleWrap)return;
  sizeWrap.innerHTML=IMG_SIZES.map(s=>`
    <div class="sm-tile${s.k===_imgSize?' active':''}" data-size="${s.k}">
      <div class="sm-tile-label">${s.label}</div>
      <div class="sm-tile-sub">${s.sub}</div>
    </div>`).join('');
  styleWrap.innerHTML=IMG_STYLES.map(s=>`
    <div class="sm-tile${s.k===_imgStyle?' active':''}" data-style="${s.k}">
      <span class="sm-tile-icon">${s.icon}</span>
      <div class="sm-tile-label">${s.label}</div>
      <div class="sm-tile-sub">${s.sub}</div>
    </div>`).join('');
  sizeWrap.querySelectorAll('.sm-tile').forEach(el=>el.onclick=()=>{_imgSize=el.dataset.size;sizeWrap.querySelectorAll('.sm-tile').forEach(e=>e.classList.toggle('active',e.dataset.size===_imgSize));});
  styleWrap.querySelectorAll('.sm-tile').forEach(el=>el.onclick=()=>{_imgStyle=el.dataset.style;styleWrap.querySelectorAll('.sm-tile').forEach(e=>e.classList.toggle('active',e.dataset.style===_imgStyle));});
  imgUpdateHint();
}

function imgUpdateHint(){
  const hint=document.getElementById('imgHint');if(!hint)return;
  const c=aiCfg();
  if(!c.key){hint.innerHTML='Нужен ключ OpenAI · <button class="underline hover:text-violet-400" onclick="document.getElementById(\'aiSettingsBtn\').click()">Подключить →</button>';return;}
  if(/openrouter|ollama|11434/i.test(c.base)){hint.textContent='⚠ Этот провайдер не поддерживает картинки';return;}
  hint.textContent='~$0.04 за картинку';
}

async function imgTranslateIfNeeded(idea){
  // DALL·E works best with English. If input contains Cyrillic, translate via AI first.
  if(!/[А-Яа-яЁё]/.test(idea))return {en:idea,ru:''};
  try{
    const res=await aiCall([
      {role:'system',content:'Translate the user\'s image idea into vivid, concrete, ENGLISH visual prose optimized for DALL·E 3. Keep all concrete details. Add concrete sensory specifics (lighting, composition, materials) only if input is too vague. Reply ONLY as JSON: {"en":"english version","ru":"slightly polished Russian version of the same idea"}.'},
      {role:'user',content:idea}
    ],{json:true});
    if(res){
      try{const j=JSON.parse(res);return {en:String(j.en||idea),ru:String(j.ru||idea)};}catch(_){return {en:res.trim(),ru:idea};}
    }
  }catch(e){logError('imgTranslate',e);}
  return {en:idea,ru:idea};
}

async function imgGenerate(){
  const idea=document.getElementById('imgIdea').value.trim();
  if(!idea){toast('Опиши картинку');document.getElementById('imgIdea').focus();return;}
  if(!needKey())return;
  const style=IMG_STYLES.find(s=>s.k===_imgStyle);
  const quality=document.getElementById('imgQuality').value;
  const model=document.getElementById('imgModel').value;
  const btn=document.getElementById('imgGenerate');
  const orig=btn.textContent;btn.disabled=true;
  const out=document.getElementById('imgResults');
  const hasCyr=/[А-Яа-яЁё]/.test(idea);
  if(hasCyr){
    btn.textContent='🌐 Перевод → 🖼 Генерация...';
    out.innerHTML='<div class="sm-result text-sm subtle">🌐 Перевожу на английский для DALL·E...</div>';
  }else{
    btn.textContent='⏳ Генерирую (10-30с)...';
    out.innerHTML='<div class="sm-result text-sm subtle">⏳ Создаю картинку, обычно 10-30 секунд...</div>';
  }
  try{
    const {en:ideaEn,ru:ideaRu}=await imgTranslateIfNeeded(idea);
    const fullPrompt=ideaEn+(style?.suffix||'');
    if(hasCyr){btn.textContent='⏳ Генерирую (10-30с)...';out.innerHTML='<div class="sm-result text-sm subtle">⏳ Создаю картинку, обычно 10-30 секунд...</div>';}
    const urls=await generateImage(fullPrompt,{size:_imgSize,quality,model});
    if(urls&&urls[0]){
      const url=urls[0];
      const ruBlock=ideaRu&&ideaRu!==ideaEn?`<details class="mb-2"><summary class="text-[10px] uppercase tracking-wider subtle cursor-pointer hover:text-violet-400">🇷🇺 RU — твой запрос</summary><div class="text-xs subtle p-2 mt-1 rounded bg-black/10 border border-white/5">${ideaRu.replace(/</g,'&lt;')}</div></details>`:'';
      out.innerHTML=`
        <div class="sm-result">
          <img src="${url}" class="w-full rounded-lg mb-3" alt="generated"/>
          <div class="mb-2">
            <div class="text-[10px] uppercase tracking-wider subtle mb-1">🇬🇧 EN — отправлено в DALL·E</div>
            <div class="text-xs p-2 rounded bg-black/20 border border-white/5">${(ideaEn+(style?.suffix||'')).replace(/</g,'&lt;').slice(0,400)}${(ideaEn+(style?.suffix||'')).length>400?'...':''}</div>
          </div>
          ${ruBlock}
          <div class="flex flex-wrap gap-2">
            <a href="${url}" download="image.png" target="_blank" class="soft-btn text-xs px-3 py-1.5">⬇ Скачать</a>
            <button class="soft-btn text-xs px-3 py-1.5" onclick="navigator.clipboard.writeText('${url}');toast('🔗 URL скопирован')">🔗 Копировать URL</button>
            <button class="soft-btn text-xs px-3 py-1.5" onclick="document.getElementById('imgGenerate').click()">🔄 Ещё раз</button>
          </div>
        </div>`;
      toast('🖼 Готово');
    }else{
      out.innerHTML='<div class="sm-result text-sm text-red-400">⚠ Не удалось создать картинку. Проверь ключ и попробуй ещё.</div>';
    }
  }finally{
    btn.disabled=false;btn.textContent=orig;
  }
}

/* --- Inner tabs (Video / Image) inside Simple Mode --- */
function smSetTab(tab){
  document.querySelectorAll('.sm-tab').forEach(b=>b.classList.toggle('tab-active',b.dataset.smtab===tab));
  const v=document.getElementById('smVideoPanel');
  const i=document.getElementById('smImagePanel');
  const t=document.getElementById('smTextPanel');
  const ip=document.getElementById('smI2pPanel');
  if(v)v.classList.toggle('sm-hidden',tab!=='video');
  if(i)i.classList.toggle('sm-hidden',tab!=='image');
  if(t)t.classList.toggle('sm-hidden',tab!=='text');
  if(ip)ip.classList.toggle('sm-hidden',tab!=='i2p');
  safeLS('seedance_sm_tab',tab);
}

(function initImageMode(){
  imgRenderTiles();
  document.getElementById('imgGenerate')?.addEventListener('click',imgGenerate);
  document.getElementById('imgIdea')?.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();imgGenerate();}
  });
  document.querySelectorAll('.sm-tab').forEach(b=>b.onclick=()=>smSetTab(b.dataset.smtab));
  const savedTab=localStorage.getItem('seedance_sm_tab')||'video';
  smSetTab(savedTab);
})();

try{
  CMDS.push({n:'🖼 Image Mode (text-to-image)',h:()=>{setMode('simple');smSetTab('image');document.getElementById('imgIdea')?.focus();}});
}catch(e){console.debug(e)}

/* ============================================================ */
/* ============ v10.1: TEXT → PRO PROMPT ===================== */
/* ============================================================ */

const TXT_TARGETS=[
  {k:'video',icon:'🎬',label:'Видео',sub:'8с · multi-shot'},
  {k:'image',icon:'🖼',label:'Картинка',sub:'1 кадр · still'}
];

/* Aspect ratios — DALL·E 3 only supports 1:1, 16:9, 9:16. Image targets shows only those. */
const TXT_ASPECTS_VIDEO=[
  {k:'9:16',label:'9:16',sub:'TikTok/Reels'},
  {k:'16:9',label:'16:9',sub:'YouTube/кино'},
  {k:'1:1',label:'1:1',sub:'Instagram'},
  {k:'4:5',label:'4:5',sub:'Instagram pro'},
  {k:'21:9',label:'21:9',sub:'cinematic'}
];
const TXT_ASPECTS_IMAGE=[
  {k:'1:1',label:'1:1',sub:'1024×1024',imgSize:'1024x1024'},
  {k:'16:9',label:'16:9',sub:'1792×1024',imgSize:'1792x1024'},
  {k:'9:16',label:'9:16',sub:'1024×1792',imgSize:'1024x1792'}
];

const TXT_STYLES=[
  {k:'cinema',icon:'🎬',label:'Кино',sub:'cinematic',suffix:'cinematic, anamorphic 2x lens, dramatic chiaroscuro lighting, film grain, color graded teal-orange'},
  {k:'photo',icon:'📷',label:'Фото',sub:'photoreal',suffix:'photorealistic editorial photography, sharp focus on subject, shallow depth of field, professional studio lighting, hasselblad medium format'},
  {k:'anime',icon:'🎌',label:'Аниме',sub:'anime',suffix:'anime style, studio ghibli inspired composition, cel-shaded, vibrant saturated palette, hand-drawn aesthetic'},
  {k:'fantasy',icon:'🧙',label:'Фэнтези',sub:'fantasy',suffix:'epic fantasy concept art, magical volumetric atmosphere, intricate detail, painterly, golden hour rim light'},
  {k:'cyber',icon:'🤖',label:'Киберпанк',sub:'cyberpunk',suffix:'cyberpunk, neon-drenched wet streets, blade runner 2049 aesthetic, holographic ambient, magenta and cyan palette, atmospheric haze'},
  {k:'noir',icon:'🎩',label:'Нуар',sub:'noir',suffix:'classic film noir, high-contrast black and white, hard venetian-blind shadows, single source key light, smoke and rain'},
  {k:'illust',icon:'🎨',label:'Иллюстрация',sub:'illustration',suffix:'digital concept illustration, painterly brushwork, vivid colors, dynamic composition, dramatic perspective'},
  {k:'doc',icon:'📰',label:'Документал',sub:'documentary',suffix:'documentary realism, natural available lighting, observational handheld camera, neutral color, authentic environment'},
  {k:'pixar',icon:'🧸',label:'Pixar',sub:'3D animation',suffix:'Pixar-style 3D animation, expressive cartoon character design with oversized eyes and rounded features, soft subsurface scattering on skin, warm friendly cinematic lighting, vibrant saturated colors, family-film aesthetic, polished volumetric atmosphere, octane render quality'},
  {k:'ghibli',icon:'🌸',label:'Ghibli',sub:'painterly anime',suffix:'Studio Ghibli inspired hand-painted aesthetic, soft watercolor backgrounds with cumulus clouds and lush mossy greenery, gentle pastel palette, warm nostalgic mood, dreamy bokeh, painterly brushwork on natural light, Miyazaki-style character expressions'},
  {k:'unreal',icon:'🎮',label:'Hyperreal',sub:'Unreal Engine 5',suffix:'Unreal Engine 5 cinematic render, hyperreal PS5-quality materials with nanite micro-detail, ray-traced global illumination, dynamic volumetric fog, photogrammetry-grade textures, cinematic depth of field, atmospheric god rays, AAA game cinematic'},
  {k:'wes',icon:'🏛',label:'Wes Anderson',sub:'symmetric pastel',suffix:'Wes Anderson aesthetic, perfectly symmetric centered composition, flat planar staging, retro pastel color palette of mint salmon mustard and dusty pink, deadpan whimsical mood, vintage 1970s production design, soft even lighting, meticulously curated frame'}
];

let _txtTarget='video';
let _txtStyle='cinema';
let _txtAspect='9:16';

function _txtAspectList(){return _txtTarget==='image'?TXT_ASPECTS_IMAGE:TXT_ASPECTS_VIDEO;}

function txtRenderTiles(){
  const tWrap=document.getElementById('txtTargetTiles');
  const aWrap=document.getElementById('txtAspectTiles');
  const sWrap=document.getElementById('txtStyleTiles');
  if(!tWrap||!sWrap||!aWrap)return;

  tWrap.innerHTML=TXT_TARGETS.map(t=>`
    <div class="sm-tile${t.k===_txtTarget?' active':''}" data-target="${t.k}">
      <span class="sm-tile-icon">${t.icon}</span>
      <div class="sm-tile-label">${t.label}</div>
      <div class="sm-tile-sub">${t.sub}</div>
    </div>`).join('');

  const aspects=_txtAspectList();
  if(!aspects.find(a=>a.k===_txtAspect))_txtAspect=aspects[0].k;
  aWrap.innerHTML=aspects.map(a=>`
    <div class="sm-tile${a.k===_txtAspect?' active':''}" data-aspect="${a.k}">
      <div class="sm-tile-label">${a.label}</div>
      <div class="sm-tile-sub">${a.sub}</div>
    </div>`).join('');

  sWrap.innerHTML=TXT_STYLES.map(s=>`
    <div class="sm-tile${s.k===_txtStyle?' active':''}" data-style="${s.k}">
      <span class="sm-tile-icon">${s.icon}</span>
      <div class="sm-tile-label">${s.label}</div>
      <div class="sm-tile-sub">${s.sub}</div>
    </div>`).join('');

  tWrap.querySelectorAll('.sm-tile').forEach(el=>el.onclick=()=>{
    _txtTarget=el.dataset.target;
    txtRenderTiles(); // re-render to update aspect list
  });
  aWrap.querySelectorAll('.sm-tile').forEach(el=>el.onclick=()=>{
    _txtAspect=el.dataset.aspect;
    aWrap.querySelectorAll('.sm-tile').forEach(e=>e.classList.toggle('active',e.dataset.aspect===_txtAspect));
  });
  sWrap.querySelectorAll('.sm-tile').forEach(el=>el.onclick=()=>{
    _txtStyle=el.dataset.style;
    sWrap.querySelectorAll('.sm-tile').forEach(e=>e.classList.toggle('active',e.dataset.style===_txtStyle));
  });
  txtUpdateHint();
}

function txtUpdateHint(){
  const hint=document.getElementById('txtHint');if(!hint)return;
  const c=aiCfg();
  if(c.key)hint.textContent='Структурированный 10-блочный промт · score · 3 подхода';
  else hint.innerHTML='Нужен AI ключ · <button class="underline hover:text-violet-400" onclick="document.getElementById(\'aiSettingsBtn\').click()">Подключить →</button>';
}

function _aspectToImgSize(aspect){
  // Map any aspect → closest DALL·E 3 supported size
  const map={'1:1':'1024x1024','16:9':'1792x1024','9:16':'1024x1792','21:9':'1792x1024','4:5':'1024x1024'};
  return map[aspect]||'1024x1024';
}

async function txtGenerate(){
  const text=document.getElementById('txtInput').value.trim();
  if(!text){toast('Вставь текст');document.getElementById('txtInput').focus();return;}
  if(text.length<20){toast('Текст слишком короткий (минимум 20 символов)');return;}
  if(!needKey())return;
  const target=TXT_TARGETS.find(t=>t.k===_txtTarget);
  const style=TXT_STYLES.find(s=>s.k===_txtStyle);
  const aspect=_txtAspect;
  const length=document.getElementById('txtLength').value;
  const count=parseInt(document.getElementById('txtCount').value,10);
  const wordCount={short:'80-120',standard:'180-220',detailed:'260-320'}[length]||'180-220';
  const btn=document.getElementById('txtGenerate');
  const orig=btn.textContent;btn.disabled=true;btn.textContent='⏳ Анализирую...';
  const out=document.getElementById('txtResults');
  if(window.skel)window.skel(out,{stages:['Извлекаю ядро идеи','Строю 10-блочную структуру','Генерирую '+count+' '+(count===1?'промт':'варианта')],count:Math.min(count,3)});
  else out.innerHTML='<div class="sm-result text-sm subtle">⏳ Извлекаю суть...</div>';

  try{
    const targetDesc=target.k==='video'
      ?`an 8-second cinematic AI-VIDEO prompt for Sora/Runway/Kling/Veo/Seedance. Aspect ratio: ${aspect}.`
      :`a still-image AI prompt for DALL-E 3/Midjourney/FLUX. Aspect ratio: ${aspect}.`;

    const variantsSpec=count===3
      ?`Generate exactly 3 DISTINCT variants with different creative angles:
1. ACTION-led — emphasis on dynamic motion, kinetic energy, tension. Verbs of action drive the prompt.
2. EMOTION-led — emphasis on character interior, psychological state, intimacy. Faces, micro-expressions, gestures.
3. VISUAL-led — emphasis on composition, color, formal beauty, painterly quality. Light and form lead.`
      :`Generate exactly 1 highly polished prompt combining the strongest elements.`;

    const sys=`You are a senior cinematographer and AI prompt engineer (10+ years). The user gives arbitrary input text (story, poem, post, scene, brief). Extract the visual essence and convert it into ${targetDesc}

🔒 RULE #1 — CORE PRESERVATION (HIGHEST PRIORITY, OVERRIDES EVERYTHING ELSE)
Before writing the prompt, identify literally from user's input:
- SUBJECT — the main noun (e.g. "boy", "detective", "lighthouse")
- ACTION — the main verb (e.g. "watches", "fights", "sleeps")
- OBJECT/TARGET — what they interact with (e.g. "cartoon on TV", "dragon", "old photograph")

This trio is SACRED. It MUST be visible and DOMINANT in every variant.
Every variant MUST literally include the subject performing the action toward/with the object.
Do NOT poetically substitute the action with atmospheric description.
Do NOT lose the object — if user mentioned "TV" or "cartoon" or "phone", it must physically appear in the prompt.

❌ WRONG (loses core):
Input: "boy watches cartoon"
Output: "boy sits gazing up at ethereal moonlight, dreamlike room, scattered toys..."  
[LOST: the cartoon, the act of watching TV]

✅ CORRECT (preserves core):
Input: "boy watches cartoon"
Output: "boy sits cross-legged on floor, eyes locked on TV screen displaying brightly-colored animated cartoon, animated characters reflected in his wide pupils, blue-pink screen light dancing across his face..."
[PRESERVED: boy + watches + cartoon-on-TV, all three visible]

If the user's input is ambiguous about the object, INVENT a specific one and STATE IT CLEARLY. Do not abstract it away.

REQUIRED PROMPT STRUCTURE — every variant must include ALL 10 elements naturally woven into prose (NOT as a list):
1. SUBJECT — who/what with concrete physical specifics (age, build, clothing, expression)
2. ACTION — active verbs, what happens (no static "is standing"; use "strides through", "reaches toward")
3. ENVIRONMENT — where, with sensory specifics (textures, weather, time of day, ambient sound implications)
4. CAMERA — shot type (extreme close-up / close-up / medium / medium long / wide / extreme wide / over-shoulder / POV) + angle (eye-level/low/high/Dutch tilt) + movement for video (static/dolly in/dolly out/tracking/orbital/handheld/crane/whip pan)
5. LENS — focal length specific (24mm wide / 35mm standard / 50mm portrait / 85mm tele / 100mm macro / anamorphic 2x)
6. LIGHTING — source + quality (golden hour backlight, harsh midday sun, single softbox key with feathered edge, neon ambient bath, candlelight rim, moonlight fill, practical sources)
7. PALETTE — color grading (teal-orange, desaturated cool, warm amber, monochrome, pastel, high-contrast)
8. MOOD — emotional tone (intimate, ominous, joyful, contemplative, urgent, melancholic)
9. STYLE — apply the chosen style: ${style.suffix}
10. TECHNICAL — aspect ratio ${aspect}${target.k==='video'?', 24fps cinematic motion':''}, sharp focus on key element, shallow depth of field where appropriate

LENGTH: ${wordCount} words per variant — strict.

FORBIDDEN:
- Vague adjectives ("beautiful", "amazing", "stunning", "gorgeous") — replace with concrete sensory detail
- Generic markers ("8k", "high quality", "masterpiece") used alone — be specific
- Telling not showing ("she is sad" → "tear streaking down her cheek, gaze averted to floor")
- Contradictory descriptors (e.g. both "soft pastel" and "harsh contrast")
- Generic location names without atmosphere ("city" → "rain-slicked Tokyo backstreet under flickering ramen-shop sign")

${variantsSpec}

🌐 LANGUAGE RULE — STRICT
- prompt_en: ALWAYS in ENGLISH — this is for pasting into Sora/Runway/Kling/DALL-E (they work best with English)
- prompt_ru: faithful Russian translation of prompt_en, same structure, same details — for user understanding
The Russian translation must be a real translation, not a separate prompt. Same length, same concepts.

Reply ONLY as JSON:
{
  "core": {
    "subject": "the literal main subject extracted from input (English, 1-3 words)",
    "action": "the literal main verb/action (English, 1-3 words)",
    "object": "the literal object/target the action is on (English, 1-5 words, or empty if truly none)"
  },
  "variants": [
    {
      "prompt_en": "ready-to-paste ENGLISH prompt, ${wordCount} words. MUST include core subject+action+object literally and prominently. Single paragraph.",
      "prompt_ru": "точный русский перевод prompt_en, та же структура, та же длина. Сохраняй все технические термины (lens, aspect ratio, 24fps, anamorphic) транслитерацией или в скобках по-английски.",
      "approach": "${count===3?'action|emotion|visual':'unified'}",
      "title": "Russian short title (3-5 words)",
      "score": 0-100,
      "why": "Russian 1-line rationale why this scores high"
    }
  ],
  "essence": "1-2 sentences in Russian summarizing what you extracted from input text — must mention core action explicitly"
}`;

    const res=await aiCall([{role:'system',content:sys},{role:'user',content:text.slice(0,8000)}],{json:true});
    if(!res)throw new Error('Пустой ответ');
    const j=JSON.parse(res);
    assertShape(j,{variants:'array'},'txtGenerate');
    // Backward compat: if AI returned old "prompt" field, treat as English
    j.variants.forEach((v,i)=>{
      if(!v.prompt_en&&v.prompt)v.prompt_en=v.prompt;
      if(!v.prompt_ru)v.prompt_ru='';
      assertShape(v,{prompt_en:'string'},'variant['+i+']');
    });
    j.variants.sort((a,b)=>(b.score||0)-(a.score||0));

    // CORE PRESERVATION CHECK — verify each English variant includes core action/object
    const core=j.core||{};
    const coreWords=[(core.action||''),(core.object||'')].filter(Boolean).join(' ').toLowerCase().split(/\W+/).filter(w=>w.length>=3);
    j.variants.forEach(v=>{
      const lc=(v.prompt_en||'').toLowerCase();
      const missing=coreWords.filter(w=>!lc.includes(w));
      v._coreMissing=missing.length>0?missing:null;
    });

    const coreHtml=core.subject?`
      <div class="mb-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
        <div class="text-[10px] uppercase tracking-wider subtle mb-1">🔒 Зафиксированное ядро (должно быть в каждом варианте)</div>
        <div class="text-sm font-medium">
          <span class="text-violet-300">${(core.subject||'').replace(/</g,'&lt;')}</span>
          <span class="subtle"> · </span>
          <span class="text-pink-300">${(core.action||'').replace(/</g,'&lt;')}</span>
          ${core.object?`<span class="subtle"> · </span><span class="text-amber-300">${core.object.replace(/</g,'&lt;')}</span>`:''}
        </div>
      </div>`:'';

    out.innerHTML=coreHtml+
      `<div class="text-xs subtle italic mb-3">💡 ${(j.essence||'').replace(/</g,'&lt;')}</div>`+
      j.variants.map((v,i)=>`
        <div class="sm-result" data-vi="${i}">
          <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-sm">📌 ${(v.title||('Вариант '+(i+1))).replace(/</g,'&lt;')}</span>
              ${typeof v.score==='number'?`<span class="sm-score ${smScoreClass(v.score)}">⭐ ${v.score}/100</span>`:''}
              ${v.approach&&v.approach!=='unified'?`<span class="text-[10px] uppercase tracking-wider subtle">${v.approach}</span>`:''}
            </div>
            <span class="text-xs subtle">${target.icon} ${aspect} · ${style.icon} ${style.label}</span>
          </div>
          ${v.why?`<div class="text-xs subtle italic mb-2">💡 ${v.why.replace(/</g,'&lt;')}</div>`:''}
          ${v._coreMissing?`<div class="text-xs mb-2 p-2 rounded bg-red-500/15 border border-red-500/40 text-red-300">⚠ Возможно потеряно ядро: <b>${v._coreMissing.join(', ')}</b> — нажми «🔒 Восстановить ядро»</div>`:''}
          <div class="mb-2">
            <div class="text-[10px] uppercase tracking-wider subtle mb-1">🇬🇧 EN — для вставки в Sora/Runway/Kling/DALL·E</div>
            <div class="text-sm whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-black/20 border border-white/5" data-prompt="en">${v.prompt_en.replace(/</g,'&lt;')}</div>
          </div>
          ${v.prompt_ru?`
          <details class="mb-3">
            <summary class="text-[10px] uppercase tracking-wider subtle cursor-pointer hover:text-violet-400">🇷🇺 RU — перевод для понимания (нажми чтобы развернуть)</summary>
            <div class="text-sm whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-black/10 border border-white/5 mt-2 italic" data-prompt="ru">${v.prompt_ru.replace(/</g,'&lt;')}</div>
          </details>`:''}
          <div class="flex flex-wrap gap-2">
            <button class="soft-btn text-xs px-3 py-1.5" data-act="copyEn">📋 EN</button>
            ${v.prompt_ru?`<button class="soft-btn text-xs px-3 py-1.5" data-act="copyRu">📋 RU</button>`:''}
            <button class="soft-btn text-xs px-3 py-1.5" data-act="image" title="Открыть в Image Mode с aspect ${aspect}">🖼 → В картинку (${aspect})</button>
            <button class="soft-btn text-xs px-3 py-1.5" data-act="preview" title="Сразу сгенерировать кадр">🖼 Превью</button>
            ${target.k==='video'?`<button class="soft-btn text-xs px-3 py-1.5" data-act="pro">🎬 → В Pro mode</button>`:''}
            <button class="soft-btn text-xs px-3 py-1.5" data-act="improve">${v._coreMissing?'🔒 Восстановить ядро':'✨ Ещё детальнее'}</button>
          </div>
        </div>`).join('');

    out.querySelectorAll('.sm-result[data-vi]').forEach((card)=>{
      const i=+card.dataset.vi;const v=j.variants[i];
      const enBox=()=>card.querySelector('[data-prompt="en"]');
      const ruBox=()=>card.querySelector('[data-prompt="ru"]');

      card.querySelector('[data-act="copyEn"]').onclick=()=>{navigator.clipboard.writeText(v.prompt_en||'');toast('📋 EN скопирован');};
      const copyRuBtn=card.querySelector('[data-act="copyRu"]');
      if(copyRuBtn)copyRuBtn.onclick=()=>{navigator.clipboard.writeText(v.prompt_ru||'');toast('📋 RU скопирован');};

      card.querySelector('[data-act="image"]').onclick=()=>{
        document.getElementById('imgIdea').value=v.prompt_en||'';
        const sz=_aspectToImgSize(aspect);
        if(typeof _imgSize!=='undefined'){_imgSize=sz;}
        try{document.querySelectorAll('#imgSizeTiles .sm-tile').forEach(el=>el.classList.toggle('active',el.dataset.size===sz));}catch(e){}
        smSetTab('image');
        toast('🖼 → Image Mode (aspect '+aspect+')');
      };
      card.querySelector('[data-act="preview"]').onclick=async(e)=>{
        const b=e.currentTarget;const o=b.textContent;b.disabled=true;b.textContent='⏳';
        try{
          const urls=await generateImage(v.prompt_en||'',{size:_aspectToImgSize(aspect)});
          if(urls&&urls[0]){
            let prev=card.querySelector('.sm-preview');
            if(!prev){prev=document.createElement('div');prev.className='sm-preview mt-3';card.appendChild(prev);}
            prev.innerHTML=`<img src="${urls[0]}" class="w-full rounded-lg"/><div class="flex gap-2 mt-2"><a href="${urls[0]}" download="preview-${i+1}.png" class="soft-btn text-xs px-3 py-1.5">⬇ Скачать</a><button class="soft-btn text-xs px-3 py-1.5" onclick="this.closest('.sm-preview').remove()">✕</button></div>`;
          }
        }finally{b.disabled=false;b.textContent=o;}
      };
      const proBtn=card.querySelector('[data-act="pro"]');
      if(proBtn)proBtn.onclick=()=>{
        setMode('pro');
        const en=v.prompt_en||'';
        setTimeout(()=>{const sub=$('subject');if(sub){sub.value=en.slice(0,200);sub.dispatchEvent(new Event('change'));}const o=$('outEnView');if(o){o.textContent=en;o.dataset.raw=en;}toast('🎛 Открыт в Pro mode');},200);
      };
      card.querySelector('[data-act="improve"]').onclick=async(e)=>{
        const b=e.currentTarget;const o=b.textContent;b.disabled=true;b.textContent='⏳';
        try{
          let sysImp;
          if(v._coreMissing){
            sysImp=`The user's CORE IDEA is: subject="${core.subject}", action="${core.action}"${core.object?', object="'+core.object+'"':''}.
This prompt LOST the core. Rewrite it so the subject literally and visibly performs the action${core.object?' on/with the object':''}. Keep all cinematic detail (camera, lens, lighting, mood, style) but make sure the central act of "${core.subject} ${core.action}${core.object?' '+core.object:''}" is the visible focal point of the frame, not background atmosphere.
Keep aspect ratio ${aspect} and same length range.
Reply ONLY as JSON: {"prompt_en":"the rewritten ENGLISH prompt","prompt_ru":"faithful Russian translation"}.`;
          }else{
            sysImp=`Improve this AI prompt: add more concrete sensory specifics, replace vague adjectives with precise visual detail, strengthen camera/lens/lighting blocks, deepen mood. CRITICAL: the subject "${core.subject||''}" performing action "${core.action||''}"${core.object?' with "'+core.object+'"':''} must remain the visible focal point. Do NOT lose the core action. Keep aspect ratio ${aspect} and same length range.
Reply ONLY as JSON: {"prompt_en":"the improved ENGLISH prompt","prompt_ru":"faithful Russian translation"}.`;
          }
          const better=await aiCall([{role:'system',content:sysImp},{role:'user',content:'EN: '+(v.prompt_en||'')}],{json:true});
          if(better){
            try{
              const jb=JSON.parse(better);
              if(jb.prompt_en)v.prompt_en=String(jb.prompt_en).trim();
              if(jb.prompt_ru)v.prompt_ru=String(jb.prompt_ru).trim();
            }catch(_){
              // fallback: treat whole reply as English prompt
              v.prompt_en=better.trim();
            }
            v.score=Math.min(100,(v.score||70)+5);
            // Re-check core
            const lc=(v.prompt_en||'').toLowerCase();
            const stillMissing=coreWords.filter(w=>!lc.includes(w));
            v._coreMissing=stillMissing.length>0?stillMissing:null;
            // Re-render boxes
            const en=enBox();if(en)en.textContent=v.prompt_en;
            const ru=ruBox();if(ru&&v.prompt_ru)ru.textContent=v.prompt_ru;
            const warn=card.querySelector('.bg-red-500\\/15');
            if(warn)warn.remove();
            if(v._coreMissing){
              const w=document.createElement('div');
              w.className='text-xs mb-2 p-2 rounded bg-red-500/15 border border-red-500/40 text-red-300';
              w.innerHTML=`⚠ Всё ещё потеряно: <b>${v._coreMissing.join(', ')}</b>`;
              const enWrap=en?en.parentElement:null;
              if(enWrap)enWrap.parentElement.insertBefore(w,enWrap);
            }else{
              b.textContent='✨ Ещё детальнее';
            }
            toast(v._coreMissing?'⚠ Ядро всё ещё неполное':'✨ Готово');
          }
        }finally{b.disabled=false;if(!v._coreMissing||b.textContent==='⏳')b.textContent=o;}
      };
    });
    // Batch export bar
    const meta={idea:text.slice(0,500),target:target.label,style:style.label,aspect,core:j.core||null};
    out.insertAdjacentHTML('beforeend',bxBarHtml('text'));
    bxWire(out,'text',meta,j.variants);
    phPush({mode:'text',idea:text.slice(0,500),meta,variants:j.variants});
    toast('✨ '+j.variants.length+' '+(j.variants.length===1?'вариант':'вариантов')+' готовы');
  }catch(e){
    logError('txtGenerate',e);
    out.innerHTML=`<div class="sm-result text-sm text-red-400">⚠ Ошибка: ${e.message.replace(/</g,'&lt;')}<br/><span class="text-xs subtle">Попробуй другой текст или уменьши длину/количество вариантов.</span></div>`;
  }finally{
    btn.disabled=false;btn.textContent=orig;
  }
}

(function initTextMode(){
  txtRenderTiles();
  document.getElementById('txtGenerate')?.addEventListener('click',txtGenerate);
  document.getElementById('txtInput')?.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();txtGenerate();}
  });
})();

try{
  CMDS.push({n:'📝 Text Mode (любой текст → промт)',h:()=>{setMode('simple');smSetTab('text');document.getElementById('txtInput')?.focus();}});
}catch(e){console.debug(e)}

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
    });
  });
  row.querySelectorAll('[data-role]').forEach(s=>{
    s.addEventListener('change',()=>{
      const i=+s.dataset.role;
      if(i2pState.refs[i])i2pState.refs[i].role=s.value;
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
    const r=await fetch(c.base+'/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},
      signal:ac.signal,
      body:JSON.stringify({
        model:c.model,
        response_format:{type:'json_object'},
        temperature:0.4,
        max_tokens:1500,
        messages:[
          {role:'system',content:systemPrompt},
          {role:'user',content:userContent}
        ]
      })
    });
    console.log('response status:',r.status,'in',Date.now()-t0,'ms');
    if(!r.ok){
      const errTxt=await r.text();
      throw new Error('HTTP '+r.status+': '+errTxt.slice(0,300));
    }
    const j=await r.json();
    if(j.error)throw new Error(j.error.message||'Vision API error');
    const txt=j.choices?.[0]?.message?.content;
    if(!txt)throw new Error('Пустой ответ AI');
    console.log('parsed JSON length:',txt.length,'chars');
    const data=JSON.parse(txt);
    i2pState.analysis=data;
    i2pRenderAnalysis(data);
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
  // Wire keyword chip click → add to modification field
  panel.querySelectorAll('.i2p-tag').forEach(tg=>{
    tg.addEventListener('click',()=>{
      const kw=tg.dataset.kw;
      const mod=document.getElementById('i2pMod');
      if(mod){
        const cur=mod.value.trim();
        mod.value=cur?(cur+', '+kw):kw;
        toast('+ '+kw);
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
    const r=await fetch(c.base+'/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},
      body:JSON.stringify({
        model:c.model,
        response_format:{type:'json_object'},
        messages:[
          {role:'system',content:sys},
          {role:'user',content:[
            {type:'text',text:userMsg},
            {type:'image_url',image_url:{url:i2pState.img}}
          ]}
        ]
      })
    });
    const j=await r.json();
    if(j.error)throw new Error(j.error.message||'Vision API error');
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
  // Defer to next tick: lumenPresets const is declared later in the file (TDZ guard)
  setTimeout(()=>{try{presetsUpdateCount();}catch(e){console.warn('[presets] count init defer',e);}},0);
  document.getElementById('phOpenBtnI2p')?.addEventListener('click',()=>phToggle(true));
})();

try{
  CMDS.push({n:'🔍 Img→Prompt (картинка → промт)',h:()=>{setMode('simple');smSetTab('i2p');}});
  CMDS.push({n:'📚 Библиотека стилей (пресеты)',h:()=>{setMode('simple');smSetTab('i2p');setTimeout(presetsOpen,100);}});
}catch(e){console.debug(e)}

/* ============ STYLE PRESETS LIBRARY (Phase 3) ============ */
const PRESETS_KEY='lumen.presets.v1';
const lumenPresets={
  list(){try{return JSON.parse(localStorage.getItem(PRESETS_KEY)||'[]');}catch(e){return[];}},
  save(rec){const all=this.list();all.unshift(rec);localStorage.setItem(PRESETS_KEY,JSON.stringify(all));},
  remove(id){const all=this.list().filter(p=>p.id!==id);localStorage.setItem(PRESETS_KEY,JSON.stringify(all));},
  exportJson(){return JSON.stringify(this.list(),null,2);},
  importJson(j){
    const arr=JSON.parse(j);
    if(!Array.isArray(arr))throw new Error('Файл должен быть JSON-массивом пресетов');
    const all=this.list();
    const existingIds=new Set(all.map(p=>p.id));
    let added=0;
    arr.forEach(p=>{
      if(p&&p.id&&p.data&&!existingIds.has(p.id)){all.push(p);added++;}
    });
    localStorage.setItem(PRESETS_KEY,JSON.stringify(all));
    return added;
  }
};

function presetsUpdateCount(){
  const el=document.getElementById('presetsCount');
  if(el)el.textContent=String(lumenPresets.list().length);
}

async function presetSaveCurrent(){
  if(!i2pState.analysis){toast('Сначала сделай анализ');return;}
  const isBlend=!!i2pState.analysis.blend_prompt;
  const defaultName=(i2pState.analysis.director_match?.[0]?.name||'')+(isBlend?' Blend':' Style')||('My Style '+(lumenPresets.list().length+1));
  const name=prompt('Название пресета:',defaultName.trim()||'My Style '+(lumenPresets.list().length+1));
  if(!name)return;
  let thumb='';
  try{
    if(i2pState.img)thumb=await i2pDownscale(i2pState.img,240,0.7);
  }catch(e){console.warn('thumb fail',e);}
  lumenPresets.save({
    id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    name:name.trim(),
    createdAt:Date.now(),
    isBlend,
    thumb,
    data:i2pState.analysis
  });
  presetsUpdateCount();
  toast('💾 Стиль «'+name.trim()+'» сохранён');
}

function presetsOpen(){
  const m=document.getElementById('presetsModal');
  if(!m)return;
  presetsRender();
  m.classList.remove('hidden');
}
function presetsClose(){
  document.getElementById('presetsModal')?.classList.add('hidden');
}

function presetsRender(){
  const list=document.getElementById('presetsList');
  if(!list)return;
  const items=lumenPresets.list();
  const esc=s=>String(s||'').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  if(!items.length){
    list.innerHTML='<div class="presets-empty"><div style="font-size:36px;margin-bottom:10px">🎨</div>Пока нет сохранённых стилей.<br>Сделай анализ картинки и нажми <b>«💾 Сохранить стиль»</b>.</div>';
    return;
  }
  list.innerHTML=items.map(p=>{
    const palette=(p.data?.palette||[]).slice(0,5);
    const kw=(p.data?.keywords||[]).slice(0,5).join(' · ');
    const summary=p.data?.summary_ru||p.data?.blend_prompt||'';
    const dt=new Date(p.createdAt||0).toLocaleDateString('ru-RU',{day:'2-digit',month:'short',year:'numeric'});
    const thumbHtml=p.thumb?`<img class="preset-thumb" src="${esc(p.thumb)}" alt="${esc(p.name)}"/>`:'<div class="preset-thumb-empty">🎨</div>';
    const palHtml=palette.length?`<div class="preset-palette">${palette.map(c=>`<span style="background:${esc(c.hex||'#222')}"></span>`).join('')}</div>`:'';
    return `<div class="preset-card" data-id="${esc(p.id)}">
      ${thumbHtml}
      <div class="preset-meta">
        <div class="preset-name">${esc(p.name)}${p.isBlend?'<span class="preset-blend-badge">BLEND</span>':''}</div>
        <div class="preset-date">${dt}</div>
        ${palHtml}
        ${kw?`<div class="preset-tags">${esc(kw)}</div>`:''}
        ${summary?`<div class="preset-summary">${esc(summary)}</div>`:''}
      </div>
      <div class="preset-actions">
        <button class="preset-apply" data-apply="${esc(p.id)}">▶ Применить</button>
        <button class="preset-del" data-del="${esc(p.id)}" title="Удалить">🗑</button>
      </div>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-apply]').forEach(b=>b.addEventListener('click',()=>presetApply(b.dataset.apply)));
  list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.del;
    const p=lumenPresets.list().find(x=>x.id===id);
    if(!p)return;
    if(!confirm('Удалить пресет «'+p.name+'»?'))return;
    lumenPresets.remove(id);
    presetsUpdateCount();
    presetsRender();
  }));
}

function presetApply(id){
  const p=lumenPresets.list().find(x=>x.id===id);
  if(!p){toast('Пресет не найден');return;}
  // Switch to i2p tab if not there
  if(typeof setMode==='function'&&typeof smSetTab==='function'){
    setMode('simple');smSetTab('i2p');
  }
  // Render the analysis
  i2pState.analysis=p.data;
  // If preset has a thumb, optionally show it as primary preview placeholder
  const panel=document.getElementById('i2pAnalysisPanel');
  if(panel)panel.classList.remove('hidden');
  i2pRenderAnalysis(p.data);
  // Push blend_prompt or summary into modification field
  const mod=document.getElementById('i2pMod');
  const txt=p.data.blend_prompt||p.data.summary_ru||'';
  if(mod&&txt)mod.value=txt;
  presetsClose();
  toast('🎨 Стиль «'+p.name+'» применён');
}

function presetsExport(){
  const items=lumenPresets.list();
  if(!items.length){toast('Нечего экспортировать');return;}
  const json=lumenPresets.exportJson();
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='lumen-presets-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),500);
  toast('📤 Экспорт '+items.length+' пресетов');
}

function presetsImport(file){
  const r=new FileReader();
  r.onload=e=>{
    try{
      const added=lumenPresets.importJson(e.target.result);
      presetsUpdateCount();
      presetsRender();
      toast('📥 Добавлено '+added+' пресетов');
    }catch(err){
      console.error(err);
      toast('⚠ Ошибка импорта: '+err.message);
    }
  };
  r.readAsText(file);
}

// Close presets modal on Escape
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!document.getElementById('presetsModal')?.classList.contains('hidden')){
    presetsClose();
  }
});

