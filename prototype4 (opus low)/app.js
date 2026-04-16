// Agent: Claude Opus - Low, time taken: 2min56, app.js 591 lines

(() => {
  'use strict';

  // ── Constants ──
  const WORLD_W = 3000;
  const WORLD_H = 3000;
  const PLAYER_SPEED = 3;
  const ANIMAL_COUNT = 40;
  const TEAM_SIZE = 6;
  const INTERACT_DIST = 60;
  const JOYSTICK_DEAD = 12;
  const JOYSTICK_MAX = 60;

  // ── Animal data pools ──
  const ANIMAL_TYPES = [
    { emoji: '🦁', name: 'Lion',       rarity: 'legendary', points: 500 },
    { emoji: '🐘', name: 'Elephant',   rarity: 'epic',      points: 350 },
    { emoji: '🦒', name: 'Giraffe',    rarity: 'epic',      points: 300 },
    { emoji: '🦓', name: 'Zebra',      rarity: 'rare',      points: 200 },
    { emoji: '🦛', name: 'Hippo',      rarity: 'rare',      points: 200 },
    { emoji: '🐊', name: 'Crocodile',  rarity: 'rare',      points: 180 },
    { emoji: '🦏', name: 'Rhino',      rarity: 'epic',      points: 320 },
    { emoji: '🐆', name: 'Leopard',    rarity: 'legendary', points: 450 },
    { emoji: '🦩', name: 'Flamingo',   rarity: 'uncommon',  points: 120 },
    { emoji: '🐗', name: 'Warthog',    rarity: 'common',    points: 60  },
    { emoji: '🦜', name: 'Parrot',     rarity: 'uncommon',  points: 100 },
    { emoji: '🐒', name: 'Monkey',     rarity: 'common',    points: 50  },
    { emoji: '🐍', name: 'Snake',      rarity: 'uncommon',  points: 110 },
    { emoji: '🦅', name: 'Eagle',      rarity: 'rare',      points: 220 },
    { emoji: '🐢', name: 'Tortoise',   rarity: 'common',    points: 40  },
    { emoji: '🦎', name: 'Lizard',     rarity: 'common',    points: 30  },
    { emoji: '🐃', name: 'Buffalo',    rarity: 'uncommon',  points: 130 },
    { emoji: '🦚', name: 'Peacock',    rarity: 'rare',      points: 240 },
    { emoji: '🐫', name: 'Camel',      rarity: 'uncommon',  points: 90  },
    { emoji: '🦃', name: 'Turkey',     rarity: 'common',    points: 35  },
  ];

  const RARITY_WEIGHTS = { common: 30, uncommon: 25, rare: 20, epic: 15, legendary: 10 };

  const PERSONALITIES = [
    'Shy & Gentle', 'Bold & Curious', 'Playful & Silly', 'Wise & Calm',
    'Grumpy but Lovable', 'Mischievous', 'Sleepy & Relaxed', 'Energetic & Wild',
    'Mysterious & Quiet', 'Friendly & Social', 'Proud & Majestic', 'Goofy & Clumsy'
  ];

  const TRAITS = [
    'loves belly rubs', 'afraid of butterflies', 'sings at dawn',
    'collects shiny rocks', 'does a little dance', 'snores loudly',
    'always hungry', 'tells bad jokes', 'very photogenic',
    'hides behind bushes', 'loves splashing in water', 'naps constantly'
  ];

  // ── World decoration ──
  const TREE_EMOJIS = ['🌳', '🌴', '🌵', '🌲'];
  const FLOWER_EMOJIS = ['🌸', '🌺', '🌻', '💐', '🌷'];
  const ROCK_EMOJIS = ['🪨', '⛰️'];
  const BUSH_EMOJIS = ['🌿', '☘️', '🍃'];

  // ── State ──
  let canvas, ctx, dpr;
  let screenW, screenH;
  let player = { x: WORLD_W / 2, y: WORLD_H / 2, dir: 0, walking: false, frame: 0 };
  let camera = { x: 0, y: 0 };
  let animals = [];
  let decorations = [];
  let collection = [];
  let score = 0;
  let nearAnimal = null;
  let gameRunning = false;
  let joystick = { active: false, ox: 0, oy: 0, dx: 0, dy: 0, touchId: null };
  let keys = { up: false, down: false, left: false, right: false };
  let mouse = { active: false, ox: 0, oy: 0, dx: 0, dy: 0 };

  // ── DOM refs ──
  const collectionCountEl = document.getElementById('collection-count');
  const scoreDisplayEl = document.getElementById('score-display');
  const collectionBarEl = document.getElementById('collection-bar');
  const interactPromptEl = document.getElementById('interact-prompt');
  const animalModalEl = document.getElementById('animal-modal');
  const modalEmoji = document.getElementById('modal-emoji');
  const modalName = document.getElementById('modal-name');
  const modalPersonality = document.getElementById('modal-personality');
  const modalRarity = document.getElementById('modal-rarity');
  const modalPoints = document.getElementById('modal-points');
  const modalBtn = document.getElementById('modal-btn');
  const endScreenEl = document.getElementById('end-screen');
  const endCollectionEl = document.getElementById('end-collection');
  const endScoreEl = document.getElementById('end-score');
  const startScreenEl = document.getElementById('start-screen');

  // ── Helpers ──
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function weightedPickAnimalType() {
    const pool = [];
    for (const t of ANIMAL_TYPES) {
      const w = RARITY_WEIGHTS[t.rarity] || 10;
      for (let i = 0; i < w; i++) pool.push(t);
    }
    return pick(pool);
  }

  // ── Init ──
  function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    setupTouch();
    setupMouse();
    setupKeyboard();
    buildCollectionBar();

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    modalBtn.addEventListener('click', confirmBefriend);
    interactPromptEl.addEventListener('click', tryBefriend);
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    screenW = window.innerWidth;
    screenH = window.innerHeight;
    canvas.width = screenW * dpr;
    canvas.height = screenH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildCollectionBar() {
    collectionBarEl.innerHTML = '';
    for (let i = 0; i < TEAM_SIZE; i++) {
      const slot = document.createElement('div');
      slot.className = 'collection-slot';
      slot.textContent = '?';
      collectionBarEl.appendChild(slot);
    }
  }

  function updateHUD() {
    collectionCountEl.textContent = `🐾 ${collection.length} / ${TEAM_SIZE}`;
    scoreDisplayEl.textContent = `⭐ ${score}`;
    const slots = collectionBarEl.children;
    for (let i = 0; i < TEAM_SIZE; i++) {
      if (i < collection.length) {
        slots[i].textContent = collection[i].emoji;
        slots[i].classList.add('filled');
      } else {
        slots[i].textContent = '?';
        slots[i].classList.remove('filled');
      }
    }
  }

  // ── World generation ──
  function generateWorld() {
    animals = [];
    decorations = [];

    // Place animals
    for (let i = 0; i < ANIMAL_COUNT; i++) {
      const type = weightedPickAnimalType();
      animals.push({
        ...type,
        x: rand(100, WORLD_W - 100),
        y: rand(100, WORLD_H - 100),
        personality: pick(PERSONALITIES),
        trait: pick(TRAITS),
        befriended: false,
        bobOffset: rand(0, Math.PI * 2),
        wanderAngle: rand(0, Math.PI * 2),
        wanderTimer: rand(60, 200),
        visible: true
      });
    }

    // Trees
    for (let i = 0; i < 200; i++) {
      decorations.push({ emoji: pick(TREE_EMOJIS), x: rand(0, WORLD_W), y: rand(0, WORLD_H), size: rand(28, 44) });
    }
    // Flowers
    for (let i = 0; i < 150; i++) {
      decorations.push({ emoji: pick(FLOWER_EMOJIS), x: rand(0, WORLD_W), y: rand(0, WORLD_H), size: rand(14, 22) });
    }
    // Rocks
    for (let i = 0; i < 50; i++) {
      decorations.push({ emoji: pick(ROCK_EMOJIS), x: rand(0, WORLD_W), y: rand(0, WORLD_H), size: rand(18, 30) });
    }
    // Bushes
    for (let i = 0; i < 100; i++) {
      decorations.push({ emoji: pick(BUSH_EMOJIS), x: rand(0, WORLD_W), y: rand(0, WORLD_H), size: rand(16, 26) });
    }

    // Sort decorations by y for depth
    decorations.sort((a, b) => a.y - b.y);
  }

  // ── Keyboard ──
  function setupKeyboard() {
    const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
    window.addEventListener('keydown', e => {
      if (keyMap[e.key]) { keys[keyMap[e.key]] = true; e.preventDefault(); }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (nearAnimal && gameRunning && animalModalEl.classList.contains('hidden')) tryBefriend(); }
    });
    window.addEventListener('keyup', e => { if (keyMap[e.key]) keys[keyMap[e.key]] = false; });
  }

  // ── Mouse ──
  function setupMouse() {
    canvas.addEventListener('mousedown', e => {
      if (!gameRunning || !animalModalEl.classList.contains('hidden')) return;
      mouse.active = true; mouse.ox = e.clientX; mouse.oy = e.clientY; mouse.dx = 0; mouse.dy = 0;
    });
    canvas.addEventListener('mousemove', e => {
      if (!mouse.active) return;
      mouse.dx = e.clientX - mouse.ox; mouse.dy = e.clientY - mouse.oy;
    });
    window.addEventListener('mouseup', () => { mouse.active = false; mouse.dx = 0; mouse.dy = 0; });
  }

  // ── Touch / Joystick ──
  function setupTouch() {
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });
  }

  function onTouchStart(e) {
    e.preventDefault();
    if (!gameRunning || animalModalEl.classList.contains('hidden') === false) return;
    const t = e.changedTouches[0];
    if (joystick.active) return;
    joystick.active = true;
    joystick.touchId = t.identifier;
    joystick.ox = t.clientX;
    joystick.oy = t.clientY;
    joystick.dx = 0;
    joystick.dy = 0;
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (!joystick.active) return;
    for (const t of e.changedTouches) {
      if (t.identifier === joystick.touchId) {
        joystick.dx = t.clientX - joystick.ox;
        joystick.dy = t.clientY - joystick.oy;
      }
    }
  }

  function onTouchEnd(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === joystick.touchId) {
        joystick.active = false;
        joystick.dx = 0;
        joystick.dy = 0;
      }
    }
  }

  // ── Game flow ──
  function startGame() {
    startScreenEl.classList.add('hidden');
    player = { x: WORLD_W / 2, y: WORLD_H / 2, dir: 0, walking: false, frame: 0 };
    collection = [];
    score = 0;
    nearAnimal = null;
    generateWorld();
    updateHUD();
    gameRunning = true;
    requestAnimationFrame(loop);
  }

  function restartGame() {
    endScreenEl.classList.add('hidden');
    startGame();
  }

  function tryBefriend() {
    if (!nearAnimal || !gameRunning) return;
    showModal(nearAnimal);
  }

  function showModal(animal) {
    modalEmoji.textContent = animal.emoji;
    modalName.textContent = animal.name;
    modalPersonality.textContent = `"${animal.personality}" — ${animal.trait}`;
    modalRarity.textContent = animal.rarity.toUpperCase();
    modalRarity.className = `rarity-${animal.rarity}`;
    modalPoints.textContent = `+${animal.points} ⭐`;
    animalModalEl.classList.remove('hidden');
  }

  function confirmBefriend() {
    if (!nearAnimal) return;
    nearAnimal.befriended = true;
    nearAnimal.visible = false;
    collection.push({ emoji: nearAnimal.emoji, name: nearAnimal.name, rarity: nearAnimal.rarity, points: nearAnimal.points, personality: nearAnimal.personality, trait: nearAnimal.trait });
    score += nearAnimal.points;
    nearAnimal = null;
    animalModalEl.classList.add('hidden');
    interactPromptEl.classList.add('hidden');
    updateHUD();

    if (collection.length >= TEAM_SIZE) {
      endGame();
    }
  }

  function endGame() {
    gameRunning = false;
    endCollectionEl.innerHTML = '';
    for (const a of collection) {
      const div = document.createElement('div');
      div.className = 'end-animal';
      div.textContent = a.emoji;
      div.title = `${a.name} (${a.rarity}) — ${a.points}⭐`;
      endCollectionEl.appendChild(div);
    }
    endScoreEl.textContent = `Total Score: ${score} ⭐`;
    endScreenEl.classList.remove('hidden');
  }

  // ── Game loop ──
  let lastTime = 0;
  function loop(ts) {
    if (!gameRunning) return;
    const dt = Math.min((ts - lastTime) / 16.67, 3);
    lastTime = ts;

    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    // Input → movement
    let mx = 0, my = 0;

    // Keyboard
    if (keys.left) mx -= 1;
    if (keys.right) mx += 1;
    if (keys.up) my -= 1;
    if (keys.down) my += 1;

    // Touch joystick
    const touchMag = Math.hypot(joystick.dx, joystick.dy);
    if (joystick.active && touchMag > JOYSTICK_DEAD) {
      const clamped = Math.min(touchMag, JOYSTICK_MAX);
      mx += (joystick.dx / touchMag) * (clamped / JOYSTICK_MAX);
      my += (joystick.dy / touchMag) * (clamped / JOYSTICK_MAX);
    }

    // Mouse joystick
    const mouseMag = Math.hypot(mouse.dx, mouse.dy);
    if (mouse.active && mouseMag > JOYSTICK_DEAD) {
      const clamped = Math.min(mouseMag, JOYSTICK_MAX);
      mx += (mouse.dx / mouseMag) * (clamped / JOYSTICK_MAX);
      my += (mouse.dy / mouseMag) * (clamped / JOYSTICK_MAX);
    }

    const inputMag = Math.hypot(mx, my);
    if (inputMag > 0.1) {
      const nm = Math.min(inputMag, 1);
      const nx = mx / inputMag;
      const ny = my / inputMag;
      const speed = PLAYER_SPEED * nm * dt;
      player.x = clamp(player.x + nx * speed, 20, WORLD_W - 20);
      player.y = clamp(player.y + ny * speed, 20, WORLD_H - 20);
      player.dir = Math.atan2(ny, nx);
      player.walking = true;
      player.frame += 0.15 * dt;
    } else {
      player.walking = false;
    }

    // Animal wander
    for (const a of animals) {
      if (a.befriended || !a.visible) continue;
      a.wanderTimer -= dt;
      if (a.wanderTimer <= 0) {
        a.wanderAngle = rand(0, Math.PI * 2);
        a.wanderTimer = rand(80, 250);
      }
      a.x = clamp(a.x + Math.cos(a.wanderAngle) * 0.3 * dt, 40, WORLD_W - 40);
      a.y = clamp(a.y + Math.sin(a.wanderAngle) * 0.3 * dt, 40, WORLD_H - 40);
    }

    // Proximity check
    nearAnimal = null;
    let minD = Infinity;
    for (const a of animals) {
      if (a.befriended || !a.visible) continue;
      const d = dist(player, a);
      if (d < INTERACT_DIST && d < minD) {
        minD = d;
        nearAnimal = a;
      }
    }

    if (nearAnimal && animalModalEl.classList.contains('hidden')) {
      interactPromptEl.classList.remove('hidden');
    } else {
      interactPromptEl.classList.add('hidden');
    }

    // Camera
    camera.x = clamp(player.x - screenW / 2, 0, WORLD_W - screenW);
    camera.y = clamp(player.y - screenH / 2, 0, WORLD_H - screenH);
  }

  // ── Rendering ──
  function render() {
    ctx.clearRect(0, 0, screenW, screenH);

    // Sky / ground gradient
    const grd = ctx.createLinearGradient(0, 0, 0, screenH);
    grd.addColorStop(0, '#87CEEB');
    grd.addColorStop(0.3, '#90EE90');
    grd.addColorStop(1, '#7CCD7C');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, screenW, screenH);

    // Ground pattern (subtle grid)
    ctx.save();
    ctx.translate(-camera.x % 80, -camera.y % 80);
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    for (let x = -80; x <= screenW + 80; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, -80); ctx.lineTo(x, screenH + 80); ctx.stroke();
    }
    for (let y = -80; y <= screenH + 80; y += 80) {
      ctx.beginPath(); ctx.moveTo(-80, y); ctx.lineTo(screenW + 80, y); ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Gather all drawable entities for y-sorting
    const drawables = [];

    // Decorations
    for (const d of decorations) {
      if (d.x > camera.x - 50 && d.x < camera.x + screenW + 50 &&
          d.y > camera.y - 50 && d.y < camera.y + screenH + 50) {
        drawables.push({ y: d.y, type: 'deco', data: d });
      }
    }

    // Animals
    for (const a of animals) {
      if (!a.visible || a.befriended) continue;
      if (a.x > camera.x - 50 && a.x < camera.x + screenW + 50 &&
          a.y > camera.y - 50 && a.y < camera.y + screenH + 50) {
        drawables.push({ y: a.y, type: 'animal', data: a });
      }
    }

    // Player
    drawables.push({ y: player.y, type: 'player', data: player });

    // Sort by y
    drawables.sort((a, b) => a.y - b.y);

    const now = performance.now() / 1000;

    for (const d of drawables) {
      if (d.type === 'deco') {
        ctx.globalAlpha = 1.0;
        ctx.font = `${d.data.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(d.data.emoji, d.data.x, d.data.y);
      } else if (d.type === 'animal') {
        const a = d.data;
        const bob = Math.sin(now * 2 + a.bobOffset) * 3;
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(a.x, a.y + 4, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Emoji with distance-based opacity
        const aDist = dist(player, a);
        const opacity = aDist < INTERACT_DIST ? 1.0 : aDist < 200 ? 0.4 + 0.6 * (1 - (aDist - INTERACT_DIST) / (200 - INTERACT_DIST)) : 0.4;
        ctx.globalAlpha = opacity;
        ctx.font = '32px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(a.emoji, a.x, a.y + bob);
        // Rarity indicator
        if (a.rarity === 'legendary') {
          ctx.font = '10px serif';
          ctx.fillText('✨', a.x + 14, a.y - 20 + bob);
        } else if (a.rarity === 'epic') {
          ctx.font = '8px serif';
          ctx.fillText('💜', a.x + 12, a.y - 18 + bob);
        }
        ctx.globalAlpha = 1.0;
        // Nearby highlight
        if (a === nearAnimal) {
          ctx.strokeStyle = 'rgba(255,255,100,0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(a.x, a.y - 10, 24, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (d.type === 'player') {
        const p = d.data;
        ctx.globalAlpha = 1.0;
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 4, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Walking bob
        const walkBob = p.walking ? Math.sin(p.frame * 4) * 3 : 0;
        ctx.font = '34px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('🧑‍🌾', p.x, p.y + walkBob);
      }
    }

    // World border
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, WORLD_W, WORLD_H);

    ctx.restore();

    // Draw joystick overlay (touch or mouse)
    const activeJoy = joystick.active ? joystick : mouse.active ? mouse : null;
    if (activeJoy) {
      const jox = activeJoy === joystick ? joystick.ox : mouse.ox;
      const joy = activeJoy === joystick ? joystick.oy : mouse.oy;
      const jdx = activeJoy.dx, jdy = activeJoy.dy;
      const mag = Math.hypot(jdx, jdy);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(jox, joy, JOYSTICK_MAX, 0, Math.PI * 2);
      ctx.fill();
      const clampedMag = Math.min(mag, JOYSTICK_MAX);
      const kx = mag > 0 ? jox + (jdx / mag) * clampedMag : jox;
      const ky = mag > 0 ? joy + (jdy / mag) * clampedMag : joy;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(kx, ky, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Minimap
    const mmW = 80, mmH = 80, mmPad = 12;
    const mmX = screenW - mmW - mmPad;
    const mmY = screenH - mmH - mmPad - 20;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(mmX, mmY, mmW, mmH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mmX, mmY, mmW, mmH);
    // Player dot
    const px = mmX + (player.x / WORLD_W) * mmW;
    const py = mmY + (player.y / WORLD_H) * mmH;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
    // Animal dots
    for (const a of animals) {
      if (a.befriended || !a.visible) continue;
      const ax = mmX + (a.x / WORLD_W) * mmW;
      const ay = mmY + (a.y / WORLD_H) * mmH;
      ctx.fillStyle = a.rarity === 'legendary' ? '#f1c40f' : a.rarity === 'epic' ? '#9b59b6' : a.rarity === 'rare' ? '#e67e22' : 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(ax, ay, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Boot ──
  init();
})();
