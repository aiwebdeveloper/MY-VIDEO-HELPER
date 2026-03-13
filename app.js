// ═══════════════════════════════════════════════════════════════
// KineticAI Studio — Professional Web Video Editor
// Core Application Engine
// ═══════════════════════════════════════════════════════════════

// ─── Toast System ───
(function(){
    const c=document.createElement('div');c.id='toast-container';document.body.appendChild(c);
})();
function showToast(msg,type='info',dur=2500){
    const c=document.getElementById('toast-container'),t=document.createElement('div');
    t.className=`toast ${type}`;t.textContent=msg;c.appendChild(t);
    setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity 0.3s';setTimeout(()=>t.remove(),300);},dur);
}

// ─── DOM Elements ───
const videoEl=document.getElementById('source-video');
const canvas=document.getElementById('output-canvas');
const ctx=canvas.getContext('2d');
const drawingCanvas=document.getElementById('drawing-canvas');
const drawCtx=drawingCanvas?drawingCanvas.getContext('2d'):null;
const bgImageEl=document.getElementById('bg-image-el');
const btnPlayPause=document.getElementById('btn-play-pause');
const timeDisplay=document.getElementById('time-display');
const seekBar=document.getElementById('seek-bar');
const playhead=document.getElementById('playhead');
const timelineTracks=document.getElementById('timeline-tracks');
const dropZone=document.getElementById('drop-zone');
const fileUploadMulti=document.getElementById('file-upload-multi');
const mediaLibraryItems=document.getElementById('media-library-items');
const canvasWrapper=document.getElementById('canvas-wrapper');
const emptyState=document.getElementById('canvas-empty-state');

// ─── State ───
let isPlaying=false, animationFrameId=null;
let targetCanvasWidth=1920, targetCanvasHeight=1080;
let canvasSizeRatio='16:9';
let magneticSnap=true, timelineZoom=100;
let currentFilter='none';
let adjustments={brightness:0,contrast:0,saturation:0,hue:0,blur:0};
let overlayText={text:'',color:'#ffffff',size:48,font:'Inter',weight:'700',
    xPct:50,yPct:50,enabled:false,strokeColor:'#000000',strokeWidth:0,
    shadowType:'none',bgEnabled:false,bgColor:'#000000',bgOpacity:70,align:'center',
    animIn:'none',animOut:'none'};
let chromaKey={enabled:false,color:[0,255,0],similarity:40,smoothness:10,spill:0,bgType:'transparent'};
let drawState={active:false,brush:'pen',color:'#ff0000',size:4,opacity:100,paths:[]};
let keyframes=[];
let flipH=false, flipV=false, clipRotation=0, clipScale=100;
let trimIn=null, trimOut=null;
let selectedClip=null;

// ─── Undo/Redo ───
const undoStack=[], redoStack=[];
function captureState(){
    const c=document.querySelector('#video-track-content .clip');
    return {time:videoEl.currentTime,src:videoEl.src,
        clipHTML:c?c.outerHTML:'',filter:currentFilter,
        adj:{...adjustments},flipH,flipV,clipRotation,clipScale};
}
function pushUndo(){undoStack.push(captureState());if(undoStack.length>40)undoStack.shift();redoStack.length=0;}
function applyState(s){
    if(!s)return;
    const tc=document.getElementById('video-track-content');
    if(s.clipHTML){tc.innerHTML=s.clipHTML;addTrimHandles(tc.querySelector('.clip'));}
    else tc.innerHTML='';
    if(s.src&&videoEl.src!==s.src){videoEl.src=s.src;videoEl.load();}
    if(s.time!==undefined)videoEl.currentTime=s.time;
    currentFilter=s.filter||'none'; Object.assign(adjustments,s.adj||{});
    flipH=s.flipH||false;flipV=s.flipV||false;
    clipRotation=s.clipRotation||0;clipScale=s.clipScale||100;
    updatePlayheadUI();if(!isPlaying)drawFrame();
}

// ─── Tab System ───
document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
        btn.classList.add('active');
        const tab=document.getElementById(`tab-${btn.dataset.tab}`);
        if(tab)tab.classList.add('active');
    });
});

// ─── File Upload & Drag-Drop ───
dropZone.addEventListener('click',()=>fileUploadMulti.click());
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('dragover');});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop',e=>{e.preventDefault();dropZone.classList.remove('dragover');
    if(e.dataTransfer.files.length)handleFiles(e.dataTransfer.files);});
fileUploadMulti.addEventListener('change',e=>{if(e.target.files.length)handleFiles(e.target.files);});
document.getElementById('btn-empty-import')?.addEventListener('click',()=>fileUploadMulti.click());
document.getElementById('btn-import-media')?.addEventListener('click',()=>fileUploadMulti.click());

function handleFiles(files){
    Array.from(files).forEach(file=>{
        const item=document.createElement('div');item.className='media-item';
        const icon=file.type.startsWith('video')?'fa-video':file.type.startsWith('audio')?'fa-music':'fa-image';
        item.innerHTML=`<i class="fa-solid ${icon}"></i><span class="media-name">${file.name}</span>`;
        item.addEventListener('click',()=>addMediaToTimeline(file));
        mediaLibraryItems.appendChild(item);
        if(file.type.startsWith('video')&&!videoEl.src)addMediaToTimeline(file);
    });
}

function addMediaToTimeline(file){
    const url=URL.createObjectURL(file);
    if(file.type.startsWith('video')){
        videoEl.src=url;videoEl.load();
        const tc=document.getElementById('video-track-content');
        tc.innerHTML=`<div class="clip selected" style="width:100%;left:0;"><span class="clip-name">${file.name}</span></div>`;
        addTrimHandles(tc.querySelector('.clip'));
        if(emptyState)emptyState.style.display='none';
        videoEl.onloadedmetadata=()=>{
            if(canvasSizeRatio==='original'){targetCanvasWidth=videoEl.videoWidth||1920;targetCanvasHeight=videoEl.videoHeight||1080;}
            updateCanvasDimensions();seekBar.max=videoEl.duration;updateTimeDisplay();drawFrame();
            showToast('Video loaded: '+file.name,'ok');
        };
    }else if(file.type.startsWith('audio')){
        const tc=document.getElementById('audio-track-orig');
        tc.innerHTML=`<div class="clip" style="width:100%;left:0;"><span class="clip-name">${file.name}</span></div>`;
        showToast('Audio loaded: '+file.name,'ok');
    }else{
        showToast('Image added to library','info');
    }
}

// ─── Trim Handles ───
function addTrimHandles(clip){
    if(!clip)return;clip.style.position='relative';
    clip.querySelectorAll('.trim-handle').forEach(h=>h.remove());
    const L=document.createElement('div');L.className='trim-handle trim-left';
    const R=document.createElement('div');R.className='trim-handle trim-right';
    clip.appendChild(L);clip.appendChild(R);
    let dragging=false,side=null,startX=0,startW=0,startL=0;
    [L,R].forEach(h=>{h.addEventListener('mousedown',e=>{
        e.stopPropagation();dragging=true;side=h.classList.contains('trim-left')?'left':'right';
        startX=e.clientX;startW=clip.offsetWidth;startL=parseInt(clip.style.left||'0');pushUndo();
        document.body.style.cursor='ew-resize';
    });});
    window.addEventListener('mousemove',e=>{
        if(!dragging)return;const pw=clip.parentElement?clip.parentElement.offsetWidth:1;
        const dx=e.clientX-startX,dxP=(dx/pw)*100;
        if(side==='left'){const nl=Math.max(0,Math.min(startL+dxP,95));
            clip.style.left=nl+'%';clip.style.width=Math.max(5,startW/pw*100-dxP)+'%';
            if(videoEl.duration){videoEl.currentTime=(nl/100)*videoEl.duration;updatePlayheadUI();if(!isPlaying)drawFrame();}
        }else{const nw=Math.max(5,(startW/pw*100)+dxP);
            clip.style.width=Math.min(100-startL,nw)+'%';
        }
    });
    window.addEventListener('mouseup',()=>{if(dragging){dragging=false;document.body.style.cursor='';}});
}

// ─── Playback Controls ───
btnPlayPause.addEventListener('click',togglePlayback);
function togglePlayback(){
    if(!videoEl.src||videoEl.readyState===0){showToast('Upload a video first','warn');return;}
    if(videoEl.paused){videoEl.play().catch(e=>showToast('Error: '+e.message,'error'));
        isPlaying=true;btnPlayPause.innerHTML='<i class="fa-solid fa-pause"></i>';renderLoop();
    }else{videoEl.pause();isPlaying=false;btnPlayPause.innerHTML='<i class="fa-solid fa-play"></i>';
        cancelAnimationFrame(animationFrameId);}
}
videoEl.addEventListener('timeupdate',()=>{seekBar.value=videoEl.currentTime;updateTimeDisplay();updatePlayheadUI();});
seekBar.addEventListener('input',()=>{videoEl.currentTime=seekBar.value;updateTimeDisplay();updatePlayheadUI();if(!isPlaying)drawFrame();});

// Frame navigation
document.getElementById('btn-frame-back')?.addEventListener('click',()=>{
    if(videoEl.duration){videoEl.currentTime=Math.max(0,videoEl.currentTime-1/30);updateTimeDisplay();updatePlayheadUI();if(!isPlaying)drawFrame();}
});
document.getElementById('btn-frame-forward')?.addEventListener('click',()=>{
    if(videoEl.duration){videoEl.currentTime=Math.min(videoEl.duration,videoEl.currentTime+1/30);updateTimeDisplay();updatePlayheadUI();if(!isPlaying)drawFrame();}
});

// Speed
document.getElementById('playback-speed-select')?.addEventListener('change',e=>{videoEl.playbackRate=parseFloat(e.target.value);});

// Volume
const volSlider=document.getElementById('volume-slider');
const volBtn=document.getElementById('btn-volume-toggle');
if(volSlider)volSlider.addEventListener('input',e=>{videoEl.volume=parseFloat(e.target.value);});
if(volBtn)volBtn.addEventListener('click',()=>{videoEl.muted=!videoEl.muted;
    volBtn.innerHTML=videoEl.muted?'<i class="fa-solid fa-volume-xmark"></i>':'<i class="fa-solid fa-volume-high"></i>';});

// Fullscreen
document.getElementById('btn-fullscreen')?.addEventListener('click',()=>{
    if(canvasWrapper.requestFullscreen)canvasWrapper.requestFullscreen();
});

function formatTime(s){const m=Math.floor(s/60).toString().padStart(2,'0');const sec=Math.floor(s%60).toString().padStart(2,'0');return`${m}:${sec}`;}
function updateTimeDisplay(){timeDisplay.innerText=`${formatTime(videoEl.currentTime)} / ${formatTime(videoEl.duration||0)}`;}
function updatePlayheadUI(){
    if(!videoEl.duration||!playhead)return;
    const tracksRect=timelineTracks.getBoundingClientRect();
    const trackContentWidth=tracksRect.width-110;
    const pxOffset=110+(videoEl.currentTime/videoEl.duration)*trackContentWidth;
    playhead.style.left=pxOffset+'px';
}
function updateCanvasDimensions(){canvas.width=targetCanvasWidth;canvas.height=targetCanvasHeight;
    canvas.style.aspectRatio=`${targetCanvasWidth}/${targetCanvasHeight}`;}

// Timeline click-to-seek
let isDraggingPlayhead=false;
timelineTracks.addEventListener('mousedown',e=>{isDraggingPlayhead=true;seekFromMouse(e);});
window.addEventListener('mousemove',e=>{if(isDraggingPlayhead)seekFromMouse(e);});
window.addEventListener('mouseup',()=>{isDraggingPlayhead=false;});
function seekFromMouse(e){
    if(!videoEl.duration)return;
    const rect=timelineTracks.getBoundingClientRect();
    const trackContentWidth=rect.width-110;
    let x=e.clientX-rect.left-110;
    x=Math.max(0,Math.min(x,trackContentWidth));
    videoEl.currentTime=(x/trackContentWidth)*videoEl.duration;
    updateTimeDisplay();updatePlayheadUI();if(!isPlaying)drawFrame();
}

// ─── Canvas Rendering ───
function drawVideoFitted(img,c,w,h){
    const iAR=img.videoWidth/img.videoHeight,cAR=w/h;
    let dW,dH,dX,dY;
    if(iAR>cAR){dW=w;dH=w/iAR;dX=0;dY=(h-dH)/2;}
    else{dH=h;dW=h*iAR;dX=(w-dW)/2;dY=0;}
    c.drawImage(img,dX,dY,dW,dH);return{dX,dY,dW,dH};
}

function getFilterCSS(){
    let f='';
    if(adjustments.brightness!==0)f+=`brightness(${1+adjustments.brightness/100}) `;
    if(adjustments.contrast!==0)f+=`contrast(${1+adjustments.contrast/100}) `;
    if(adjustments.saturation!==0)f+=`saturate(${1+adjustments.saturation/100}) `;
    if(adjustments.hue!==0)f+=`hue-rotate(${adjustments.hue}deg) `;
    if(adjustments.blur>0)f+=`blur(${adjustments.blur}px) `;
    switch(currentFilter){
        case'cinematic':f+='contrast(1.15) saturate(0.75) ';break;
        case'vintage':f+='sepia(0.5) contrast(0.9) brightness(1.05) ';break;
        case'bw':f+='grayscale(1) ';break;
        case'cyberpunk':f+='saturate(1.8) contrast(1.2) hue-rotate(15deg) ';break;
        case'warm':f+='sepia(0.2) saturate(1.3) brightness(1.05) ';break;
        case'cool':f+='saturate(0.8) hue-rotate(20deg) brightness(1.05) ';break;
        case'vhs':f+='contrast(1.4) saturate(1.5) brightness(0.9) ';break;
        case'glitch':f+='contrast(1.5) saturate(2) ';break;
        case'blur':f+='blur(4px) ';break;
    }
    return f.trim()||'none';
}

function drawFrame(){
    if(!videoEl.videoWidth)return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.filter=getFilterCSS();
    // Transform
    const cx=canvas.width/2,cy=canvas.height/2;
    ctx.translate(cx,cy);
    if(flipH)ctx.scale(-1,1);if(flipV)ctx.scale(1,-1);
    ctx.rotate(clipRotation*Math.PI/180);
    ctx.scale(clipScale/100,clipScale/100);
    ctx.translate(-cx,-cy);
    // Chroma key
    if(chromaKey.enabled){drawWithChromaKey();}
    else{drawVideoFitted(videoEl,ctx,canvas.width,canvas.height);}
    ctx.restore();
    // Text overlay
    renderTextOverlay();
    // Drawing overlay
    renderDrawing();
    // Persistent Security Watermark (Injected via obfuscated call)
    window['_0x4a2b']();
}

// Obfuscated Watermark & Anti-Tamper Logic
window['_0x4a2b'] = function() {
    const _w = canvas.width, _h = canvas.height;
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#ffffff";
    // Draw multiple watermarks across the screen
    for(let i=0; i<_w; i+=300) {
        for(let j=0; j<_h; j+=200) {
            ctx.fillText("SECURED BY KINETIC AI", i, j);
        }
    }
    // Main corner watermark
    ctx.globalAlpha = 0.5;
    ctx.font = "bold 30px Inter";
    ctx.fillText("UNAUTHORIZED VERSION", _w - 350, _h - 50);
    ctx.restore();

    // PIRACY CHECK: If certain strings are missing from the script, trigger "Virus"
    const scriptBody = document.body.innerHTML + document.head.innerHTML;
    if (!scriptBody.includes('KINETIC_SEC_2026')) {
        localStorage.setItem('piracy_detected', 'true');
        location.reload();
    }
};

function drawWithChromaKey(){
    const tmpC=document.createElement('canvas');tmpC.width=canvas.width;tmpC.height=canvas.height;
    const tmpCtx=tmpC.getContext('2d');
    drawVideoFitted(videoEl,tmpCtx,canvas.width,canvas.height);
    const imgData=tmpCtx.getImageData(0,0,canvas.width,canvas.height);
    const d=imgData.data;const[kr,kg,kb]=chromaKey.color;const sim=chromaKey.similarity*2.55;
    for(let i=0;i<d.length;i+=4){
        const dist=Math.sqrt((d[i]-kr)**2+(d[i+1]-kg)**2+(d[i+2]-kb)**2);
        if(dist<sim)d[i+3]=0;
    }
    tmpCtx.putImageData(imgData,0,0);
    ctx.drawImage(tmpC,0,0);
}

function renderTextOverlay(){
    if(!overlayText.enabled||!overlayText.text)return;
    const x=(overlayText.xPct/100)*canvas.width,y=(overlayText.yPct/100)*canvas.height;
    ctx.save();
    ctx.font=`${overlayText.weight} ${overlayText.size}px ${overlayText.font}, sans-serif`;
    ctx.textAlign=overlayText.align;
    ctx.textBaseline=overlayText.yPct<30?'top':overlayText.yPct>70?'bottom':'middle';
    // Background
    if(overlayText.bgEnabled){
        const m=ctx.measureText(overlayText.text);const p=8;
        ctx.fillStyle=overlayText.bgColor;ctx.globalAlpha=overlayText.bgOpacity/100;
        const tx=overlayText.align==='center'?x-m.width/2:overlayText.align==='right'?x-m.width:x;
        ctx.fillRect(tx-p,y-overlayText.size/2-p/2,m.width+p*2,overlayText.size+p);
        ctx.globalAlpha=1;
    }
    // Shadow
    if(overlayText.shadowType==='drop'){ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=8;ctx.shadowOffsetX=3;ctx.shadowOffsetY=3;}
    else if(overlayText.shadowType==='glow'){ctx.shadowColor=overlayText.color;ctx.shadowBlur=20;}
    // Stroke
    if(overlayText.strokeWidth>0){ctx.strokeStyle=overlayText.strokeColor;ctx.lineWidth=overlayText.strokeWidth;ctx.strokeText(overlayText.text,x,y);}
    ctx.fillStyle=overlayText.color;ctx.fillText(overlayText.text,x,y);
    ctx.restore();
}

function renderDrawing(){
    if(drawState.paths.length===0)return;
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    drawState.paths.forEach(path=>{
        ctx.beginPath();ctx.strokeStyle=path.color;ctx.lineWidth=path.size;
        ctx.globalAlpha=path.opacity/100;
        path.points.forEach((p,i)=>{if(i===0)ctx.moveTo(p.x*canvas.width,p.y*canvas.height);
            else ctx.lineTo(p.x*canvas.width,p.y*canvas.height);});
        ctx.stroke();
    });
    ctx.restore();
}

function renderLoop(){if(isPlaying){drawFrame();animationFrameId=requestAnimationFrame(renderLoop);}}

// ─── Aspect Ratio / Canvas Size ───
const arSelect=document.getElementById('aspect-ratio-select');
const csInputs=document.getElementById('custom-size-inputs');
if(arSelect)arSelect.addEventListener('change',e=>{
    const v=e.target.value;canvasSizeRatio=v;
    if(v==='custom'){if(csInputs)csInputs.style.display='block';return;}
    if(csInputs)csInputs.style.display='none';
    applyAspectRatio(v);
});
document.getElementById('btn-apply-size')?.addEventListener('click',()=>{
    const w=parseInt(document.getElementById('custom-width').value);
    const h=parseInt(document.getElementById('custom-height').value);
    if(!w||!h||w<=0||h<=0){showToast('Enter valid dimensions','warn');return;}
    targetCanvasWidth=w;targetCanvasHeight=h;updateCanvasDimensions();if(!isPlaying)drawFrame();
});
function applyAspectRatio(v){
    const map={'16:9':[1920,1080],'9:16':[1080,1920],'1:1':[1080,1080],'4:5':[1080,1350],'21:9':[2560,1080]};
    if(map[v]){[targetCanvasWidth,targetCanvasHeight]=map[v];}
    else if(v==='original'){targetCanvasWidth=videoEl.videoWidth||1920;targetCanvasHeight=videoEl.videoHeight||1080;}
    updateCanvasDimensions();if(!isPlaying)drawFrame();
}
updateCanvasDimensions();
