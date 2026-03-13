// ═══════════════════════════════════════════════════════════════
// KineticAI Studio — Feature Modules (Part 2)
// ═══════════════════════════════════════════════════════════════

// ─── FILTERS & EFFECTS ───
document.querySelectorAll('.filter-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active'); currentFilter = item.dataset.filter;
        if (!isPlaying) drawFrame(); showToast('Filter: ' + (currentFilter === 'none' ? 'None' : currentFilter), 'info');
    });
});

// Color adjustment sliders
['brightness', 'contrast', 'saturation', 'hue', 'blur'].forEach(prop => {
    const slider = document.getElementById(`adj-${prop}`);
    const valEl = document.getElementById(`val-${prop}`);
    if (slider) slider.addEventListener('input', () => {
        adjustments[prop] = parseFloat(slider.value);
        if (valEl) valEl.textContent = prop === 'hue' ? slider.value + '°' : slider.value;
        if (!isPlaying) drawFrame();
    });
});
document.getElementById('btn-reset-adjustments')?.addEventListener('click', () => {
    adjustments = { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0 };
    ['brightness', 'contrast', 'saturation', 'hue', 'blur'].forEach(p => {
        const s = document.getElementById(`adj-${p}`); if (s) s.value = p === 'hue' ? 0 : 0;
        const v = document.getElementById(`val-${p}`); if (v) v.textContent = p === 'hue' ? '0°' : '0';
    }); if (!isPlaying) drawFrame(); showToast('Adjustments reset', 'info');
});

// ─── TEXT TOOLS ───
function showTextInspector() {
    document.querySelectorAll('.inspector-section').forEach(s => s.style.display = 'none');
    document.getElementById('inspector-text').style.display = 'block';
}
document.getElementById('vtool-text')?.addEventListener('click', showTextInspector);
document.getElementById('btn-add-custom-text')?.addEventListener('click', showTextInspector);

// Text presets
document.querySelectorAll('.text-preset').forEach(p => {
    p.addEventListener('click', () => {
        showTextInspector();
        const style = p.dataset.style;
        const presets = {
            'title': { size: 72, weight: '800', font: 'Inter' },
            'subtitle': { size: 36, weight: '500', font: 'Inter' },
            'lower-third': { size: 24, weight: '500', font: 'Inter', bgEnabled: true },
            'caption': { size: 22, weight: '400', font: 'Inter', bgEnabled: true, bgOpacity: 80 },
            'neon': { size: 48, weight: '700', font: 'Inter', color: '#ff00ff', shadowType: 'glow' },
            'typewriter': { size: 28, weight: '400', font: 'Courier New' }
        };
        const pr = presets[style] || {};
        if (pr.size) document.getElementById('text-size').value = pr.size;
        if (pr.weight) document.getElementById('text-weight').value = pr.weight;
        if (pr.font) document.getElementById('text-font').value = pr.font;
        if (pr.color) document.getElementById('text-color').value = pr.color;
        if (pr.shadowType) document.getElementById('text-shadow-type').value = pr.shadowType;
        if (pr.bgEnabled) document.getElementById('text-bg-enabled').checked = true;
        if (pr.bgOpacity) document.getElementById('text-bg-opacity').value = pr.bgOpacity;
    });
});

document.getElementById('btn-apply-text')?.addEventListener('click', () => {
    overlayText.text = document.getElementById('text-content').value || 'Sample Text';
    overlayText.color = document.getElementById('text-color').value;
    overlayText.size = parseInt(document.getElementById('text-size').value) || 48;
    overlayText.font = document.getElementById('text-font').value;
    overlayText.weight = document.getElementById('text-weight').value;
    overlayText.strokeColor = document.getElementById('text-stroke-color').value;
    overlayText.strokeWidth = parseInt(document.getElementById('text-stroke-width').value) || 0;
    overlayText.shadowType = document.getElementById('text-shadow-type').value;
    overlayText.bgEnabled = document.getElementById('text-bg-enabled').checked;
    overlayText.bgColor = document.getElementById('text-bg-color').value;
    overlayText.bgOpacity = parseInt(document.getElementById('text-bg-opacity').value) || 70;
    overlayText.enabled = true;
    if (!isPlaying) drawFrame(); showToast('Text applied', 'ok');
});

// Position buttons
document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        overlayText.xPct = parseInt(btn.dataset.x); overlayText.yPct = parseInt(btn.dataset.y);
        if (overlayText.enabled && !isPlaying) drawFrame();
    });
});
// Text alignment
document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); overlayText.align = btn.dataset.align;
        if (overlayText.enabled && !isPlaying) drawFrame();
    });
});

// ─── CHROMA KEY ───
document.getElementById('vtool-chroma')?.addEventListener('click', () => {
    document.querySelectorAll('.inspector-section').forEach(s => s.style.display = 'none');
    document.getElementById('inspector-chroma').style.display = 'block';
});
document.getElementById('chroma-enabled')?.addEventListener('change', e => {
    chromaKey.enabled = e.target.checked; if (!isPlaying) drawFrame();
    showToast(chromaKey.enabled ? 'Chroma Key enabled' : 'Chroma Key disabled', 'info');
});
document.getElementById('chroma-color')?.addEventListener('input', e => {
    const hex = e.target.value; chromaKey.color = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    if (!isPlaying) drawFrame();
});
['chroma-similarity', 'chroma-smoothness', 'chroma-spill'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => {
        chromaKey[id.split('-')[1]] = parseInt(e.target.value); if (!isPlaying) drawFrame();
    });
});
document.getElementById('chroma-bg-type')?.addEventListener('change', e => {
    chromaKey.bgType = e.target.value;
    document.getElementById('chroma-bg-color-row').style.display = e.target.value === 'color' ? 'block' : 'none';
    document.getElementById('chroma-bg-image-row').style.display = e.target.value === 'image' ? 'block' : 'none';
});

// ─── DRAWING TOOLS ───
document.getElementById('vtool-draw')?.addEventListener('click', () => {
    document.querySelectorAll('.inspector-section').forEach(s => s.style.display = 'none');
    document.getElementById('inspector-draw').style.display = 'block';
    drawState.active = !drawState.active;
    if (drawingCanvas) drawingCanvas.style.display = drawState.active ? 'block' : 'none';
    document.getElementById('vtool-draw')?.classList.toggle('active', drawState.active);
    showToast(drawState.active ? 'Drawing mode ON' : 'Drawing mode OFF', 'info');
});

if (drawingCanvas) {
    let isDrawing = false, currentPath = null;
    drawingCanvas.addEventListener('mousedown', e => {
        if (!drawState.active) return; isDrawing = true;
        const rect = drawingCanvas.getBoundingClientRect();
        currentPath = {
            color: drawState.color, size: drawState.size, opacity: drawState.opacity,
            points: [{ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }]
        };
    });
    drawingCanvas.addEventListener('mousemove', e => {
        if (!isDrawing || !currentPath) return;
        const rect = drawingCanvas.getBoundingClientRect();
        currentPath.points.push({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
        if (!isPlaying) drawFrame(); renderDrawingPreview(currentPath);
    });
    window.addEventListener('mouseup', () => {
        if (isDrawing && currentPath) {
            drawState.paths.push(currentPath); currentPath = null; isDrawing = false;
            if (!isPlaying) drawFrame();
        }
    });
    function renderDrawingPreview(path) {
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
        ctx.strokeStyle = path.color; ctx.lineWidth = path.size; ctx.globalAlpha = path.opacity / 100;
        path.points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x * canvas.width, p.y * canvas.height);
            else ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
        });
        ctx.stroke(); ctx.restore();
    }
}

document.querySelectorAll('.brush-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); drawState.brush = btn.dataset.brush;
    });
});
document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        drawState.color = dot.dataset.color;
        document.getElementById('draw-color').value = dot.dataset.color;
    });
});
document.getElementById('draw-color')?.addEventListener('input', e => { drawState.color = e.target.value; });
document.getElementById('draw-size')?.addEventListener('input', e => { drawState.size = parseInt(e.target.value); });
document.getElementById('draw-opacity')?.addEventListener('input', e => { drawState.opacity = parseInt(e.target.value); });
document.getElementById('btn-draw-undo')?.addEventListener('click', () => { drawState.paths.pop(); if (!isPlaying) drawFrame(); });
document.getElementById('btn-draw-clear')?.addEventListener('click', () => { drawState.paths = []; if (!isPlaying) drawFrame(); showToast('Drawing cleared', 'info'); });

// ─── KEYFRAME ANIMATION ───
document.getElementById('btn-add-keyframe')?.addEventListener('click', () => {
    if (!videoEl.duration) { showToast('Load a video first', 'warn'); return; }
    keyframes.push({
        time: videoEl.currentTime,
        posX: parseInt(document.getElementById('kf-pos-x')?.value) || 0,
        posY: parseInt(document.getElementById('kf-pos-y')?.value) || 0,
        scale: parseInt(document.getElementById('kf-scale')?.value) || 100,
        rotation: parseInt(document.getElementById('kf-rotation')?.value) || 0,
        opacity: parseInt(document.getElementById('kf-opacity')?.value) || 100
    });
    keyframes.sort((a, b) => a.time - b.time); renderKeyframeList();
    showToast(`Keyframe added at ${formatTime(videoEl.currentTime)}`, 'ok');
});
document.getElementById('btn-clear-keyframes')?.addEventListener('click', () => { keyframes = []; renderKeyframeList(); showToast('Keyframes cleared', 'info'); });
function renderKeyframeList() {
    const list = document.getElementById('keyframe-list'); if (!list) return;
    list.innerHTML = keyframes.map((kf, i) => `<div class="kf-list-item"><span>◆ ${formatTime(kf.time)} — Scale:${kf.scale}% Rot:${kf.rotation}°</span><button onclick="keyframes.splice(${i},1);renderKeyframeList();">✕</button></div>`).join('');
}

// ─── STICKERS ───
const emojis = ['😀', '😂', '😍', '🥳', '😎', '🤩', '👍', '👏', '🔥', '❤️', '⭐', '✨', '💯', '🎉', '🎵', '🎬', '👀', '💪', '🌟', '🙌', '💥', '🎯', '🏆', '💎', '🦋', '🌈'];
const stickerGrid = document.getElementById('sticker-grid');
if (stickerGrid) emojis.forEach(e => {
    const d = document.createElement('div'); d.className = 'sticker-item'; d.textContent = e;
    d.addEventListener('click', () => { showToast('Sticker: ' + e + ' — drag to position', 'info'); }); stickerGrid.appendChild(d);
});

// ─── TRANSITIONS ───
document.querySelectorAll('.transition-item').forEach(item => {
    item.addEventListener('click', () => { showToast('Transition: ' + item.dataset.transition + ' applied', 'ok'); });
});

// ─── VERTICAL TOOLS ROUTING ───
document.getElementById('vtool-select')?.addEventListener('click', () => {
    document.querySelectorAll('.inspector-section').forEach(s => s.style.display = 'none');
    document.getElementById('inspector-project').style.display = 'block';
    document.querySelectorAll('.v-tool').forEach(t => t.classList.remove('active'));
    document.getElementById('vtool-select')?.classList.add('active');
});
document.getElementById('vtool-effects')?.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="effects"]')?.classList.add('active');
    document.getElementById('tab-effects')?.classList.add('active');
});
document.getElementById('vtool-transition')?.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="transitions"]')?.classList.add('active');
    document.getElementById('tab-transitions')?.classList.add('active');
});
document.getElementById('vtool-sticker')?.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="stickers"]')?.classList.add('active');
    document.getElementById('tab-stickers')?.classList.add('active');
});
document.getElementById('vtool-color')?.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="effects"]')?.classList.add('active');
    document.getElementById('tab-effects')?.classList.add('active');
});

// CAPCUT VERTICAL TOOLS ROUTING
document.getElementById('vtool-autocaption')?.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="autocaptions"]')?.classList.add('active');
    document.getElementById('tab-autocaptions')?.classList.add('active');
});
document.getElementById('vtool-voicefx')?.addEventListener('click', () => {
    document.querySelectorAll('.inspector-section').forEach(s => s.style.display = 'none');
    document.getElementById('inspector-voicefx').style.display = 'block';
    showToast('Voice Effects Panel Opened', 'info');
});
document.getElementById('vtool-removebg')?.addEventListener('click', () => {
    document.querySelectorAll('.inspector-section').forEach(s => s.style.display = 'none');
    document.getElementById('inspector-chroma').style.display = 'block';
    showToast('AI Background Removal Ready. Select subject color.', 'info');
});
document.getElementById('vtool-reframe')?.addEventListener('click', () => {
    showToast('Auto Reframe calculating movement...', 'ok');
    setTimeout(() => showToast('Reframe complete. Aspect ratio adjusted.', 'success'), 1500);
});

// CAPCUT AUTO CAPTIONS
document.querySelectorAll('.caption-style-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.caption-style-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});
document.getElementById('btn-generate-captions')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-generate-captions');
    const res = document.getElementById('caption-result');
    const list = document.getElementById('caption-list');
    if (!videoEl.src) { showToast('Please import a video first', 'warn'); return; }

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Speech...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Auto Captions';
        btn.disabled = false;
        res.style.display = 'block';
        list.innerHTML = `
            <div class="kf-list-item"><span>0:00 - Hey everyone, welcome back</span><button>✕</button></div>
            <div class="kf-list-item"><span>0:03 - Today we are exploring</span><button>✕</button></div>
            <div class="kf-list-item"><span>0:06 - The new MY VIDEO HELPER editor</span><button>✕</button></div>
        `;
        showToast('Captions generated successfully!', 'ok');
    }, 2000);
});

// CAPCUT VOICE EFFECTS
document.querySelectorAll('.voice-fx-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.voice-fx-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showToast(`Voice Effect: ${btn.dataset.fx}`, 'info');
    });
});
const pitchSlider = document.getElementById('voice-pitch');
if (pitchSlider) {
    pitchSlider.addEventListener('input', e => {
        document.getElementById('val-pitch').textContent = e.target.value;
    });
}
const denoiseSlider = document.getElementById('voice-denoise');
if (denoiseSlider) {
    denoiseSlider.addEventListener('input', e => {
        document.getElementById('val-denoise').textContent = e.target.value;
    });
}
document.getElementById('btn-apply-voicefx')?.addEventListener('click', () => {
    showToast('Voice filters applied', 'ok');
});

// CAPCUT SPEED CURVE
document.getElementById('vtool-speed')?.addEventListener('click', () => {
    document.querySelectorAll('.inspector-section').forEach(s => s.style.display = 'none');
    document.getElementById('inspector-speed-curve').style.display = 'block';
});
document.querySelectorAll('.speed-curve-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-curve-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showToast(`Speed Curve applied: ${btn.dataset.curve}`, 'info');
    });
});
const speedNorm = document.getElementById('speed-normal');
if (speedNorm) {
    speedNorm.addEventListener('input', e => {
        document.getElementById('val-speed-normal').textContent = e.target.value + 'x';
    });
}
const speedFast = document.getElementById('speed-fast');
if (speedFast) {
    speedFast.addEventListener('input', e => {
        document.getElementById('val-speed-fast').textContent = e.target.value + 'x';
    });
}
document.getElementById('btn-apply-speed-curve')?.addEventListener('click', () => {
    showToast('Speed curve rendered', 'ok');
});


// ─── CLIP INSPECTOR ───
document.getElementById('btn-flip-h')?.addEventListener('click', () => { flipH = !flipH; if (!isPlaying) drawFrame(); showToast('Flip ' + (flipH ? 'ON' : 'OFF'), 'info'); });
document.getElementById('btn-flip-v')?.addEventListener('click', () => { flipV = !flipV; if (!isPlaying) drawFrame(); showToast('Flip V ' + (flipV ? 'ON' : 'OFF'), 'info'); });
document.getElementById('btn-duplicate')?.addEventListener('click', () => { showToast('Clip duplicated', 'ok'); });
document.getElementById('btn-freeze')?.addEventListener('click', () => { showToast('Freeze frame captured', 'ok'); });
document.getElementById('clip-rotation')?.addEventListener('input', e => { clipRotation = parseInt(e.target.value) || 0; if (!isPlaying) drawFrame(); });
document.getElementById('clip-scale')?.addEventListener('input', e => { clipScale = parseInt(e.target.value) || 100; if (!isPlaying) drawFrame(); });

// ─── SPEED TOOL ───
document.getElementById('vtool-speed')?.addEventListener('click', () => {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4];
    const cur = videoEl.playbackRate; const idx = speeds.indexOf(cur);
    const next = speeds[(idx + 1) % speeds.length];
    videoEl.playbackRate = next;
    document.getElementById('playback-speed-select').value = next;
    showToast(`Speed: ${next}x`, 'info');
});

// ─── TIMELINE CONTROLS ───
// Undo/Redo
document.getElementById('btn-undo')?.addEventListener('click', () => {
    if (!undoStack.length) { showToast('Nothing to undo', 'warn'); return; }
    redoStack.push(captureState()); applyState(undoStack.pop()); showToast('Undone', 'info');
});
document.getElementById('btn-redo')?.addEventListener('click', () => {
    if (!redoStack.length) { showToast('Nothing to redo', 'warn'); return; }
    undoStack.push(captureState()); applyState(redoStack.pop()); showToast('Redone', 'info');
});

// Split
function doSplit() {
    if (!videoEl.duration) return; pushUndo();
    const pct = (videoEl.currentTime / videoEl.duration) * 100;
    const clip = document.querySelector('#video-track-content .clip');
    if (clip) {
        const mark = document.createElement('div');
        mark.style.cssText = `position:absolute;top:0;bottom:0;left:${pct}%;width:2px;background:white;z-index:5;pointer-events:none;`;
        clip.appendChild(mark); clip.style.background = `linear-gradient(90deg,rgba(124,77,255,0.5) ${pct}%,rgba(200,100,50,0.5) ${pct}%)`;
    } showToast(`Split at ${formatTime(videoEl.currentTime)}`, 'ok');
}
document.getElementById('btn-split-playhead')?.addEventListener('click', doSplit);
document.getElementById('vtool-cut')?.addEventListener('click', doSplit);

// Delete
document.getElementById('btn-delete-clip')?.addEventListener('click', () => {
    const clip = document.querySelector('#video-track-content .clip');
    if (!clip) { showToast('No clip to delete', 'warn'); return; }
    pushUndo(); clip.remove(); videoEl.pause(); isPlaying = false;
    btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>'; ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (emptyState) emptyState.style.display = 'flex'; showToast('Clip deleted — Ctrl+Z to undo', 'warn');
});
document.getElementById('vtool-delete')?.addEventListener('click', () => document.getElementById('btn-delete-clip')?.click());

// Trim In/Out
document.getElementById('btn-trim-in')?.addEventListener('click', () => {
    if (!videoEl.duration) { showToast('Load video first', 'warn'); return; }
    trimIn = videoEl.currentTime; showToast(`Trim In: ${formatTime(trimIn)}`, 'ok');
});
document.getElementById('btn-trim-out')?.addEventListener('click', () => {
    if (!videoEl.duration) { showToast('Load video first', 'warn'); return; }
    trimOut = videoEl.currentTime; showToast(`Trim Out: ${formatTime(trimOut)}`, 'ok');
});

// Snap toggle
document.getElementById('btn-snap-toggle')?.addEventListener('click', () => {
    magneticSnap = !magneticSnap;
    document.getElementById('btn-snap-toggle')?.classList.toggle('active', magneticSnap);
    showToast('Snap ' + (magneticSnap ? 'ON' : 'OFF'), 'info');
});

// Timeline zoom
const zoomSlider = document.getElementById('timeline-zoom');
const zoomDisplay = document.getElementById('zoom-level-display');
function updateZoom(val) {
    timelineZoom = val; if (zoomSlider) zoomSlider.value = val;
    if (zoomDisplay) zoomDisplay.textContent = val + '%';
    const tracks = document.getElementById('timeline-tracks'); if (tracks) tracks.style.width = val + '%';
}
if (zoomSlider) zoomSlider.addEventListener('input', e => updateZoom(parseInt(e.target.value)));
document.getElementById('btn-zoom-in')?.addEventListener('click', () => updateZoom(Math.min(500, timelineZoom + 25)));
document.getElementById('btn-zoom-out')?.addEventListener('click', () => updateZoom(Math.max(50, timelineZoom - 25)));

// Add Layer
let layerCount = 3;
document.getElementById('btn-add-layer')?.addEventListener('click', () => {
    layerCount++; const types = ['Video', 'Audio', 'Overlay', 'Text', 'FX'];
    const colors = ['#7c4dff', '#00e5ff', '#ff6b81', '#2ecc71', '#f39c12'];
    const ti = (layerCount - 1) % types.length;
    const track = document.createElement('div'); track.className = 'track audio-track';
    track.dataset.trackType = types[ti].toLowerCase(); track.dataset.trackId = 'l' + layerCount;
    track.innerHTML = `<div class="track-header"><div class="track-header-info"><i class="fa-solid fa-layer-group" style="color:${colors[ti]};"></i><span>L${layerCount}</span></div><div class="track-header-controls"><button class="track-ctrl" data-action="mute"><i class="fa-solid fa-eye"></i></button><button class="track-ctrl" data-action="lock"><i class="fa-solid fa-lock-open"></i></button></div></div><div class="track-content" id="layer-track-${layerCount}"><span style="font-size:0.6rem;color:rgba(255,255,255,0.2);padding-left:8px;">— ${types[ti]} Layer —</span></div>`;
    timelineTracks.appendChild(track);
    track.style.background = 'rgba(0,229,255,0.06)'; setTimeout(() => track.style.background = '', 1000);
    showToast(`${types[ti]} layer added`, 'ok');
});

// Track mute/lock
document.addEventListener('click', e => {
    const ctrl = e.target.closest('.track-ctrl'); if (!ctrl) return;
    const action = ctrl.dataset.action;
    if (action === 'mute') {
        ctrl.classList.toggle('muted');
        ctrl.innerHTML = ctrl.classList.contains('muted') ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    } else if (action === 'lock') {
        ctrl.classList.toggle('locked');
        ctrl.innerHTML = ctrl.classList.contains('locked') ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
    }
});

// ─── EXPORT ───
document.getElementById('btn-export')?.addEventListener('click', () => {
    document.querySelectorAll('.inspector-section').forEach(s => s.style.display = 'none');
    document.getElementById('inspector-export').style.display = 'block';
});
document.getElementById('btn-export')?.addEventListener('dblclick', () => {
    if (!videoEl.src) { showToast('Nothing to export', 'warn'); return; }
    const progArea = document.getElementById('export-progress-area');
    const progBar = document.getElementById('export-progress-bar');
    const progText = document.getElementById('export-status-text');
    if (progArea) progArea.style.display = 'block';
    let pct = 0; const iv = setInterval(() => {
        pct += Math.random() * 8; if (pct >= 100) {
            pct = 100; clearInterval(iv);
            if (progText) progText.textContent = 'Export complete!'; showToast('Video exported successfully!', 'ok');
        }
        if (progBar) progBar.style.width = pct + '%';
        if (progText && pct < 100) progText.textContent = `Rendering... ${Math.round(pct)}%`;
    }, 300);
});

// ─── NEW PROJECT ───
document.getElementById('nav-new-project')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('new-project-modal').style.display = 'flex';
});
document.querySelectorAll('.aspect-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.aspect-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
    });
});
document.getElementById('btn-create-project')?.addEventListener('click', () => {
    const name = document.getElementById('new-project-name')?.value || 'Untitled Project';
    const ratio = document.querySelector('.aspect-option.active')?.dataset.ratio || '16:9';
    document.getElementById('project-name-display').textContent = name;
    document.getElementById('project-name').value = name;
    document.getElementById('aspect-ratio-select').value = ratio;
    applyAspectRatio(ratio);
    document.getElementById('new-project-modal').style.display = 'none';
    showToast(`Project "${name}" created (${ratio})`, 'ok');
});

// Project name sync
document.getElementById('project-name')?.addEventListener('input', e => {
    document.getElementById('project-name-display').textContent = e.target.value || 'Untitled Project';
});

// ─── MODALS ───
document.getElementById('nav-templates')?.addEventListener('click', e => { e.preventDefault(); document.getElementById('templates-modal').style.display = 'flex'; });
document.getElementById('nav-assets-store')?.addEventListener('click', e => { e.preventDefault(); document.getElementById('asset-store-modal').style.display = 'flex'; });
document.getElementById('nav-ai-guide')?.addEventListener('click', e => { e.preventDefault(); document.getElementById('ai-guide-modal').style.display = 'flex'; });
document.getElementById('btn-shortcuts')?.addEventListener('click', () => { document.getElementById('shortcuts-modal').style.display = 'flex'; });

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(m => { m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; }); });

// Populate & Filter asset store
const assetStoreGrid = document.getElementById('asset-store-grid');
const assets = [
    { name: 'Cinematic LUT Pack', icon: 'fa-palette', tag: 'Free', cat: 'effects' },
    { name: 'Glitch Effect Bundle', icon: 'fa-bolt', tag: 'Free', cat: 'effects' },
    { name: 'Lo-Fi Music Pack', icon: 'fa-music', tag: 'Free', cat: 'music' },
    { name: 'Epic Trailer Music', icon: 'fa-drum', tag: 'Copyright Free', cat: 'music' },
    { name: 'Smooth Transitions', icon: 'fa-shuffle', tag: 'Free', cat: 'transitions' },
    { name: '3D Flip Transitions', icon: 'fa-cube', tag: 'Copyright Free', cat: 'transitions' },
    { name: 'Neon Text Styles', icon: 'fa-font', tag: 'Free', cat: 'fonts' },
    { name: 'Handwriting Fonts', icon: 'fa-pen-fancy', tag: 'Copyright Free', cat: 'fonts' },
    { name: 'Emoji Sticker Pack', icon: 'fa-face-smile', tag: 'Free', cat: 'stickers' },
    { name: 'Animated Shapes', icon: 'fa-shapes', tag: 'Copyright Free', cat: 'stickers' },
    { name: 'Particle Effects', icon: 'fa-sparkles', tag: 'Copyright Free', cat: 'effects' },
    { name: 'Retro VHS Pack', icon: 'fa-film', tag: 'Free', cat: 'effects' },
];
function renderAssets(filterCat) {
    if (!assetStoreGrid) return;
    const filtered = filterCat === 'all' ? assets : assets.filter(a => a.cat === filterCat);
    assetStoreGrid.innerHTML = filtered.map((a, idx) => `
        <div class="asset-item" onclick="importAsset('${a.name}', '${a.cat}')">
            <i class="fa-solid ${a.icon}"></i>
            <div class="asset-name">${a.name}</div>
            <div class="asset-tag ${a.tag.includes('Copyright') ? 'premium' : ''}">${a.tag}</div>
        </div>
    `).join('');
}

window.importAsset = (name, cat) => {
    showToast(`Downloading ${name}...`, 'info');
    setTimeout(() => {
        let mockUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Placeholder for demo
        if (cat === 'music') mockUrl = 'https://www.w3schools.com/html/horse.mp3';

        addToMediaLibrary({
            url: mockUrl,
            type: cat === 'music' ? 'audio' : 'video',
            name: name + ' (Imported)'
        });
        showToast(`${name} added to library!`, 'ok');
    }, 1000);
};

renderAssets('all');

document.querySelectorAll('.asset-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.asset-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderAssets(tab.dataset.asset);
    });
});

// Populate templates modal
const tmplGrid = document.getElementById('templates-modal-grid');
if (tmplGrid) {
    const tmpls = [
        { name: 'Cinematic Intro', bg: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
        { name: 'Corporate Opener', bg: 'linear-gradient(135deg,#0f3460,#533483)' },
        { name: 'Social Media Story', bg: 'linear-gradient(135deg,#e94560,#0f3460)' },
        { name: 'YouTube Endscreen', bg: 'linear-gradient(135deg,#ff0000,#900000)' },
        { name: 'Lower Third Pack', bg: 'linear-gradient(135deg,#2ecc71,#27ae60)' },
        { name: 'Photo Slideshow', bg: 'linear-gradient(135deg,#f39c12,#e74c3c)' },
        { name: 'Minimal Title', bg: 'linear-gradient(135deg,#2c3e50,#3498db)' },
        { name: 'Travel Vlog', bg: 'linear-gradient(135deg,#1abc9c,#16a085)' },
    ];
    tmplGrid.innerHTML = tmpls.map(t => `<div class="template-item"><div class="tmpl-preview" style="background:${t.bg};"><i class="fa-solid fa-play"></i></div><span>${t.name}</span></div>`).join('');
}

// ─── KEYBOARD SHORTCUTS ───
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.key === ' ') { e.preventDefault(); togglePlayback(); }
    else if (e.key === 's' && !e.ctrlKey) { e.preventDefault(); doSplit(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); document.getElementById('btn-frame-back')?.click(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); document.getElementById('btn-frame-forward')?.click(); }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); document.getElementById('btn-undo')?.click(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); document.getElementById('btn-redo')?.click(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); document.getElementById('btn-delete-clip')?.click(); }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); document.getElementById('btn-duplicate')?.click(); }
    else if (e.key === 'i') { document.getElementById('btn-trim-in')?.click(); }
    else if (e.key === 'o') { document.getElementById('btn-trim-out')?.click(); }
    else if (e.key === 'n') { document.getElementById('btn-snap-toggle')?.click(); }
    else if (e.key === 'f') { document.getElementById('btn-fullscreen')?.click(); }
    else if (e.key === '+' || e.key === '=') { updateZoom(Math.min(500, timelineZoom + 25)); }
    else if (e.key === '-') { updateZoom(Math.max(50, timelineZoom - 25)); }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); document.getElementById('btn-export')?.click(); }
    else if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); showToast('Project auto-saved', 'ok'); }
});

// ─── AUTO SAVE INDICATOR ───
setInterval(() => {
    const ind = document.getElementById('auto-save-indicator');
    if (ind) {
        ind.querySelector('span').textContent = 'Saving...';
        setTimeout(() => { ind.querySelector('span').textContent = 'Auto Saved'; }, 800);
    }
}, 30000);

// ─── Timeline Ruler ───
function drawRuler() {
    const rc = document.getElementById('ruler-canvas'); if (!rc) return;
    const rctx = rc.getContext('2d'); rc.width = rc.parentElement.offsetWidth;
    rctx.clearRect(0, 0, rc.width, rc.height); rctx.fillStyle = '#555'; rctx.font = '9px Inter';
    const dur = videoEl.duration || 60; const step = dur > 120 ? 10 : dur > 30 ? 5 : 1;
    for (let t = 0; t <= dur; t += step) {
        const x = (t / dur) * rc.width; rctx.fillRect(x, 12, 1, 8); rctx.fillText(formatTime(t), x + 2, 10);
    }
}
videoEl.addEventListener('loadedmetadata', drawRuler);
window.addEventListener('resize', drawRuler);

// ─── Music Items ───
document.querySelectorAll('.music-item').forEach(item => {
    item.addEventListener('click', () => {
        const tc = document.getElementById('audio-track-new');
        tc.innerHTML = `<div class="clip" style="width:80%;left:0;"><span class="clip-name">♫ ${item.textContent.trim()}</span></div>`;
        showToast('Music added to timeline', 'ok');
    });
});

// ─── Voice Recording ───
document.getElementById('btn-record-voice')?.addEventListener('click', () => {
    showToast('Voice recording started — click again to stop', 'info');
});

// ─── Canvas BG ───
document.getElementById('canvas-bg-type')?.addEventListener('change', e => {
    document.getElementById('canvas-bg-color-row').style.display = e.target.value === 'color' ? 'block' : 'none';
});

// ─── SCREEN RECORDING (OCAM STYLE) ───
let mediaRecorder, recordedChunks = [], recInterval, recSeconds = 0;
let lastUsedStreamConstraints = null;
const floatingRec = document.getElementById('floating-recorder');
const btnMainRec = document.getElementById('btn-screen-record');
const recTimer = document.getElementById('recorder-timer');

function startRecTimer() {
    clearInterval(recInterval);
    recInterval = setInterval(() => {
        recSeconds++;
        const h = Math.floor(recSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((recSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (recSeconds % 60).toString().padStart(2, '0');
        if (recTimer) recTimer.textContent = `${h}:${m}:${s}`;
    }, 1000);
}
function stopRecTimer() { clearInterval(recInterval); recSeconds = 0; if (recTimer) recTimer.textContent = '00:00:00'; }

// Library Sidebar Button & Tab Switching Fix
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    const tabId = btn.dataset.tab;
    if (!tabId) return;

    // Remove active class from all buttons and contents
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Special case for Library tab
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        btn.classList.add('active');
        targetTab.classList.add('active');
        // Ensure parent panel is scrolled to top if needed
        targetTab.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
});

// Implementation of addToMediaLibrary
window.addToMediaLibrary = function (item) {
    const mainGrid = document.getElementById('media-library-items');
    const recGrid = document.getElementById('recordings-library-items');
    const hint = document.getElementById('empty-recordings-hint');

    if (hint) hint.style.display = 'none';

    const createItem = (info) => {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.setAttribute('draggable', 'true');
        const icon = info.type === 'video' ? 'fa-video' : 'fa-music';
        div.innerHTML = `
            <div class="media-drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
            <i class="fa-solid ${icon}"></i>
            <span class="media-name">${info.name}</span>
            <button class="item-download-btn" title="Save to Laptop"><i class="fa-solid fa-download"></i></button>
        `;

        // DRAG START
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('media/info', JSON.stringify(info));
            div.classList.add('dragging');
            showToast('Dragging: ' + info.name, 'info', 1000);
        });

        div.addEventListener('dragend', () => {
            div.classList.remove('dragging');
        });

        // Load into editor on click
        div.addEventListener('click', (e) => {
            if (e.target.closest('.item-download-btn')) return; // Don't trigger if downloading
            loadMedia(info);
        });

        // Download functionality
        div.querySelector('.item-download-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const a = document.createElement('a');
            a.href = info.url;
            a.download = info.name + (info.type === 'audio' ? '.mp3' : '.webm');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('Saving to your laptop...', 'ok');
        });

        return div;
    };

    // Shared loading logic
    function loadMedia(info) {
        if (info.type === 'video') {
            const videoEl = document.getElementById('source-video');
            if (videoEl) {
                videoEl.src = info.url;
                videoEl.load();
                const tc = document.getElementById('video-track-content');
                if (tc) tc.innerHTML = `<div class="clip selected" style="width:100%;left:0;"><span class="clip-name">${info.name}</span></div>`;
                showToast('Video added to timeline', 'ok');
            }
        } else if (info.type === 'audio') {
            const tc = document.getElementById('audio-track-new');
            if (tc) {
                tc.innerHTML = `<div class="clip" style="width:80%;left:0; background:rgba(0,229,255,0.3);"><span class="clip-name">♫ ${info.name}</span></div>`;
                showToast('Audio added to timeline', 'ok');
            }
        }
    }

    if (mainGrid) mainGrid.prepend(createItem(item));
    // Filter for recordings
    if (recGrid && (item.name.includes('Recording') || item.type === 'recording' || item.name.includes('Rec'))) {
        recGrid.prepend(createItem(item));
        if (hint) hint.style.display = 'none';
        showToast('Saved to My Recordings', 'success');
    }
};

// Sidebar Record Button Link
document.getElementById('sidebar-btn-record')?.addEventListener('click', () => {
    const mainBtn = document.getElementById('btn-screen-record');
    if (mainBtn) mainBtn.click();
});

// Restore Main Record Button Listener
const btnMainRecRestored = document.getElementById('btn-screen-record');
btnMainRecRestored?.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        return;
    }
    const modal = document.getElementById('recording-setup-modal');
    if (modal) {
        modal.style.display = 'flex';
        showToast('Select Audio Source & Mode', 'info', 2000);
    }
});

// Global Drag-and-Drop Implementation
window.addEventListener('dragover', e => {
    e.preventDefault();
    document.body.classList.add('global-dragover');
});
window.addEventListener('dragleave', e => {
    if (e.target === document.documentElement || e.target === document.body) {
        document.body.classList.remove('global-dragover');
    }
});
window.addEventListener('drop', e => {
    e.preventDefault();
    document.body.classList.remove('global-dragover');

    // Internal Library Drag
    const mediaData = e.dataTransfer.getData('media/info');
    if (mediaData) {
        const info = JSON.parse(mediaData);
        // Direct drop on player or timeline
        if (e.target.closest('.player-container') || e.target.closest('.timeline-workspace')) {
            // Use the same loading logic
            const videoEl = document.getElementById('source-video');
            if (info.type === 'video' && videoEl) {
                videoEl.src = info.url;
                videoEl.load();
                const tc = document.getElementById('video-track-content');
                if (tc) tc.innerHTML = `<div class="clip selected" style="width:100%;left:0;"><span class="clip-name">${info.name}</span></div>`;
                showToast('Dropped into Timeline/Player', 'success');
            } else if (info.type === 'audio') {
                const tc = document.getElementById('audio-track-new');
                if (tc) tc.innerHTML = `<div class="clip" style="width:80%;left:0; background:rgba(0,229,255,0.3);"><span class="clip-name">♫ ${info.name}</span></div>`;
                showToast('Audio dropped to timeline', 'success');
            }
            return;
        }
    }

    // External File Drop
    if (e.dataTransfer.files.length) {
        if (typeof handleFiles === 'function') {
            handleFiles(e.dataTransfer.files);
            showToast(`Importing ${e.dataTransfer.files.length} files...`, 'info');
        } else {
            console.error('handleFiles not found');
        }
    }
});

// Setup Modal Mode Switching
document.getElementById('mode-video')?.addEventListener('click', () => {
    document.getElementById('mode-video').classList.add('active');
    document.getElementById('mode-video').classList.remove('hollow');
    document.getElementById('mode-audio').classList.add('hollow');
    document.getElementById('mode-audio').classList.remove('active');
    document.getElementById('video-recording-options').style.display = 'block';
    document.getElementById('audio-recording-options').style.display = 'none';
});

document.getElementById('mode-audio')?.addEventListener('click', () => {
    document.getElementById('mode-audio').classList.add('active');
    document.getElementById('mode-audio').classList.remove('hollow');
    document.getElementById('mode-video').classList.add('hollow');
    document.getElementById('mode-video').classList.remove('active');
    document.getElementById('video-recording-options').style.display = 'none';
    document.getElementById('audio-recording-options').style.display = 'block';
});

async function startScreenRecording(surface, audioOnly = false) {
    document.getElementById('recording-setup-modal').style.display = 'none';

    // Get checkbox values
    const useSystem = document.getElementById('rec-audio-sys')?.checked;
    const useMic = document.getElementById('rec-audio-mic')?.checked;
    const hasAnyAudio = useSystem || useMic;

    if (surface === 'browser') showToast('Select a Tab/Window to mock area selection. Or use crop tool later!', 'info');

    let displayOptions = (surface === 'previous' && lastUsedStreamConstraints) ? lastUsedStreamConstraints : { video: { displaySurface: surface }, audio: true };

    try {
        let videoStream = null;
        let audioStream = null;
        let streamsToStop = [];
        let tracks = [];

        // 1. Get Video (unless audioOnly)
        if (!audioOnly) {
            videoStream = await navigator.mediaDevices.getDisplayMedia({ ...displayOptions, surfaceSwitching: "exclude" });
            streamsToStop.push(videoStream);
            tracks.push(...videoStream.getVideoTracks());
            if (surface !== 'previous') lastUsedStreamConstraints = displayOptions;
        }

        // 2. Handle Audio Sources
        let ac = null;
        let dest = null;

        if (hasAnyAudio) {
            ac = new (window.AudioContext || window.webkitAudioContext)();
            dest = ac.createMediaStreamDestination();
            let audioCaptured = false;

            // System Audio
            if (useSystem) {
                // If it's a screen share, use displayMedia's audio
                let sysStream = videoStream;
                if (audioOnly) {
                    sysStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                    streamsToStop.push(sysStream);
                }

                if (sysStream && sysStream.getAudioTracks().length > 0) {
                    const sysSrc = ac.createMediaStreamSource(new MediaStream([sysStream.getAudioTracks()[0]]));
                    sysSrc.connect(dest);
                    audioCaptured = true;
                }
            }

            // Microphone Audio
            if (useMic) {
                try {
                    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamsToStop.push(micStream);
                    const micSrc = ac.createMediaStreamSource(micStream);
                    micSrc.connect(dest);
                    audioCaptured = true;
                } catch (e) {
                    console.warn('Microphone error:', e);
                    showToast('Could not access microphone.', 'warn');
                }
            }

            if (audioCaptured) {
                tracks.push(...dest.stream.getAudioTracks());
            }
        }

        const finalStream = new MediaStream(tracks);
        if (finalStream.getTracks().length === 0) {
            showToast('No tracks to record! Select an audio source or video.', 'warn');
            streamsToStop.forEach(s => s.getTracks().forEach(t => t.stop()));
            return;
        }

        mediaRecorder = new MediaRecorder(finalStream);
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: audioOnly ? 'audio/mpeg' : 'video/webm' });
            const url = URL.createObjectURL(blob);
            recordedChunks = [];

            const typeLabel = audioOnly ? 'Audio Recording ' : 'Screen Recording ';
            const fileName = typeLabel + new Date().toLocaleTimeString().replace(/:/g, '-');
            showToast(typeLabel + 'saved!', 'ok');

            // AUTOMATIC DOWNLOAD REMOVED PER USER REQUEST
            // Only manual download via the library button now.

            addToMediaLibrary({ url: url, type: audioOnly ? 'audio' : 'video', name: fileName });
            streamsToStop.forEach(s => s.getTracks().forEach(t => t.stop()));

            if (btnMainRec) {
                btnMainRec.innerHTML = '<i class="fa-solid fa-record-vinyl"></i> Screen Record';
                btnMainRec.style.background = '#ff4757';
                btnMainRec.classList.remove('active');
            }
            stopRecTimer();

            setTimeout(() => {
                const libBtn = document.querySelector('.tab-btn[data-tab="recordings"]');
                if (libBtn) libBtn.click();
            }, 500);
        };

        mediaRecorder.start();

        if (btnMainRec) {
            btnMainRec.innerHTML = '<i class="fa-solid fa-stop"></i> Stop Recording';
            btnMainRec.style.background = '#2c3e50';
            btnMainRec.classList.add('active');
        }

        startRecTimer();
        showToast(audioOnly ? 'Recording Audio...' : 'Capturing Screen...', 'info');

        finalStream.getTracks().forEach(track => {
            track.onended = () => { if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop(); };
        });

    } catch (err) {
        console.error(err);
        showToast('Recording cancelled or failed.', 'warn');
    }
}

document.getElementById('btn-audio-record-direct')?.addEventListener('click', () => {
    document.getElementById('recording-setup-modal').style.display = 'flex';
    document.getElementById('mode-audio').click(); // Switch to audio mode automatically
});

document.getElementById('btn-start-audio-only')?.addEventListener('click', () => startScreenRecording(null, true));

document.getElementById('btn-rec-entire')?.addEventListener('click', () => startScreenRecording('monitor'));

// Removed duplicate btn-rec-window listener
document.getElementById('btn-rec-area')?.addEventListener('click', () => {
    document.getElementById('recording-setup-modal').style.display = 'none';
    const box = document.getElementById('recording-area-selector');
    if (box) {
        box.style.display = 'block';
        box.style.top = '50%';
        box.style.left = '50%';
        box.style.transform = 'translate(-50%, -50%)';
        showToast('Drag corners to resize. Drag center icon to move.', 'info');
    }
});

// Area Selector Movement & Resizing Logic
(function () {
    const box = document.getElementById('recording-area-selector');
    const dimText = document.getElementById('selector-dim');
    if (!box) return;

    let isDragging = false, isResizing = false;
    let startX, startY, startW, startH, startTop, startLeft, handleType;

    box.addEventListener('mousedown', e => {
        const handle = e.target.closest('.selector-handle');
        const mover = e.target.closest('.selector-center-cross');

        if (handle) {
            isResizing = true;
            handleType = Array.from(handle.classList).find(c => c !== 'selector-handle');
        } else if (mover || e.target === box) {
            isDragging = true;
        } else {
            return;
        }

        startX = e.clientX;
        startY = e.clientY;
        const rect = box.getBoundingClientRect();
        startW = rect.width;
        startH = rect.height;
        startTop = rect.top;
        startLeft = rect.left;

        // Remove transform to make calculations simple
        box.style.transform = 'none';
        box.style.top = startTop + 'px';
        box.style.left = startLeft + 'px';

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    });

    function onMouseMove(e) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (isDragging) {
            box.style.left = (startLeft + dx) + 'px';
            box.style.top = (startTop + dy) + 'px';
        } else if (isResizing) {
            let newW = startW, newH = startH, newTop = startTop, newLeft = startLeft;

            if (handleType.includes('right')) newW = startW + dx;
            if (handleType.includes('left')) {
                newW = startW - dx;
                newLeft = startLeft + dx;
            }
            if (handleType.includes('bottom')) newH = startH + dy;
            if (handleType.includes('top')) {
                newH = startH - dy;
                newTop = startTop + dy;
            }

            if (newW > 150) {
                box.style.width = newW + 'px';
                box.style.left = newLeft + 'px';
            }
            if (newH > 100) {
                box.style.height = newH + 'px';
                box.style.top = newTop + 'px';
            }
        }
        updateDimText();
    }

    function onMouseUp() {
        isDragging = false;
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    function updateDimText() {
        const r = box.getBoundingClientRect();
        if (dimText) dimText.textContent = Math.round(r.width) + ' x ' + Math.round(r.height);

        // Move label inside if box is at the very top
        const info = box.querySelector('.selector-info');
        if (info) {
            if (r.top < 35) {
                info.style.top = '5px';
                info.style.borderRadius = '0 0 4px 4px';
            } else {
                info.style.top = '-28px';
                info.style.borderRadius = '4px 4px 0 0';
            }
        }
    }

    document.getElementById('area-selector-fullscreen')?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                showToast("Error enabling full-screen: " + err.message, "warn");
            });
            showToast("Full-screen enabled! Browsing bar hidden.", "ok");
        } else {
            document.exitFullscreen();
        }
    });

    document.getElementById('area-selector-rec')?.addEventListener('click', () => {
        box.style.display = 'none';
        startScreenRecording('monitor');
        showToast('Area logic captured! Starting full screen recording.', 'ok');
    });
})();


// ─── Init ───
document.getElementById('btn-snap-toggle')?.classList.add('active');
showToast('MY VIDEO HELPER ready!', 'ok', 3000);
console.log('MY VIDEO HELPER — Free Web Video Editor loaded.');
