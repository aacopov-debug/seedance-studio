/* ============================================================
   LUMEN — CONTINUITY CHECKER MODULE (extracted from app.js v15.1)
   ============================================================
   AI-powered script supervisor that finds discontinuities between
   Story Mode scenes: wardrobe, time-of-day, weather, props, location,
   lighting, character drift. Renders interactive issue panel with
   per-issue "Apply fix" (rewrites scene prompt via AI) and dismiss.

   Dependencies (globals from app.js):
   - STORY, renderStory, saveStory   from Story Mode
   - aiCall                          from AI core
   - $, toast, needKey               DOM/util helpers
   Loaded AFTER app.js so storyModal exists when we inject the button.
   Exports CONTINUITY global (used by js/fcpxml.js for timeline markers).
   ============================================================ */

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
