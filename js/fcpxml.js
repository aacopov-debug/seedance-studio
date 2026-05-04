/* ============================================================
   LUMEN — FCPXML EXPORT MODULE (extracted from app.js v15.0)
   ============================================================
   Exports Story Mode timeline as FCPXML 1.10 ZIP package:
   - story.fcpxml (timeline with N scenes, markers, notes)
   - media/ folder with placeholder PNGs or fetched AI preview URLs
   - story.json (full state backup)
   - README.txt (import instructions for FCP/Resolve/Premiere)

   Dependencies (globals from app.js):
   - STORY, CONTINUITY       from Story Mode
   - $, toast, safeLS         DOM/util helpers
   - loadJSZip                lazy CDN loader from Story Mode
   Loaded AFTER app.js via <script defer> so storyModal exists.
   ============================================================ */

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

/* Inject button into Story Mode modal toolbar */
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
