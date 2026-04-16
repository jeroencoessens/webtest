/* ═══════════════════════════════════════════════════
   SAFARI FRIENDS  —  app.js
   ═══════════════════════════════════════════════════ */

   // Agent: Sonnet 4.6, time taken: 10min38, app.js 799 lines
   // crashed once

'use strict';

/* ── Canvas setup ───────────────────────────────── */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ── World constants ────────────────────────────── */
const WORLD_W   = 3000;
const WORLD_H   = 3000;
const TILE_SIZE = 80;     // grass tile size
const PLAYER_SPEED = 3;
const ENCOUNTER_DIST = 60;
const TEAM_SIZE = 6;

/* ── Animal definitions ─────────────────────────── */
const RARITIES = {
  common:    { label: 'Common',    color: 'rarity-common',    weight: 40, baseScore: 100 },
  uncommon:  { label: 'Uncommon',  color: 'rarity-uncommon',  weight: 28, baseScore: 250 },
  rare:      { label: 'Rare',      color: 'rarity-rare',      weight: 18, baseScore: 500 },
  epic:      { label: 'Epic',      color: 'rarity-epic',      weight: 10, baseScore: 900 },
  legendary: { label: 'Legendary', color: 'rarity-legendary', weight: 4,  baseScore: 2000 },
};

const ANIMAL_POOL = [
  // ── Common ──────────────────────────────────────
  { emoji: '🐇', species: 'Rabbit',      rarity: 'common'    },
  { emoji: '🐓', species: 'Chicken',     rarity: 'common'    },
  { emoji: '🦔', species: 'Hedgehog',    rarity: 'common'    },
  { emoji: '🐢', species: 'Tortoise',    rarity: 'common'    },
  { emoji: '🦎', species: 'Lizard',      rarity: 'common'    },
  { emoji: '🐿',  species: 'Chipmunk',   rarity: 'common'    },
  { emoji: '🦗', species: 'Cricket',     rarity: 'common'    },
  { emoji: '🐦', species: 'Sparrow',     rarity: 'common'    },
  // ── Uncommon ────────────────────────────────────
  { emoji: '🦊', species: 'Fox',         rarity: 'uncommon'  },
  { emoji: '🦝', species: 'Raccoon',     rarity: 'uncommon'  },
  { emoji: '🦩', species: 'Flamingo',    rarity: 'uncommon'  },
  { emoji: '🦜', species: 'Parrot',      rarity: 'uncommon'  },
  { emoji: '🐨', species: 'Koala',       rarity: 'uncommon'  },
  { emoji: '🦘', species: 'Kangaroo',    rarity: 'uncommon'  },
  // ── Rare ────────────────────────────────────────
  { emoji: '🐆', species: 'Cheetah',     rarity: 'rare'      },
  { emoji: '🦒', species: 'Giraffe',     rarity: 'rare'      },
  { emoji: '🦏', species: 'Rhino',       rarity: 'rare'      },
  { emoji: '🦛', species: 'Hippo',       rarity: 'rare'      },
  { emoji: '🐘', species: 'Elephant',    rarity: 'rare'      },
  { emoji: '🦓', species: 'Zebra',       rarity: 'rare'      },
  // ── Epic ────────────────────────────────────────
  { emoji: '🐅', species: 'Tiger',       rarity: 'epic'      },
  { emoji: '🦁', species: 'Lion',        rarity: 'epic'      },
  { emoji: '🐋', species: 'Whale',       rarity: 'epic'      },
  { emoji: '🦅', species: 'Eagle',       rarity: 'epic'      },
  // ── Legendary ───────────────────────────────────
  { emoji: '🐉', species: 'Dragon',      rarity: 'legendary' },
  { emoji: '🦄', species: 'Unicorn',     rarity: 'legendary' },
  { emoji: '🔱', species: 'Sea Spirit',  rarity: 'legendary' },
];

const TRAITS = [
  'Playful', 'Shy', 'Brave', 'Grumpy', 'Gentle', 'Curious',
  'Mischievous', 'Sleepy', 'Energetic', 'Wise', 'Goofy', 'Stubborn',
  'Friendly', 'Sneaky', 'Cheerful', 'Mysterious', 'Loyal', 'Dramatic',
];

const DESCS_BY_RARITY = {
  common:    [
    'This little one is always nearby.',
    'There are plenty of these around.',
    'Quite common, but still adorable!',
    'You\'ll spot these everywhere in the savanna.',
  ],
  uncommon:  [
    'Not always easy to find — lucky you!',
    'This one wanders far from its home.',
    'Spotted less often than you\'d think.',
    'A pleasant surprise on your safari!',
  ],
  rare:      [
    'A rare sight — only a few roam this world.',
    'Travellers go days without seeing one.',
    'You are truly fortunate to cross paths.',
    'Rarely seen, often remembered.',
  ],
  epic:      [
    'An epic creature of immense presence.',
    'Very few have ever befriended one.',
    'Legends say it only appears to the worthy.',
    'Your heart races at the sight of it.',
  ],
  legendary: [
    'A legendary beast — said to be myth!',
    'Stories around the campfire come true.',
    'Only the boldest explorers find these.',
    'Your safari will never be forgotten.',
  ],
};

/* ── World decoration types ─────────────────────── */
const BIOME_ZONES = [
  { name: 'grasslands', color: '#6db846', accent: '#5da03a' },
  { name: 'savanna',    color: '#c8a84b', accent: '#a88030' },
  { name: 'jungle',     color: '#3a8f3a', accent: '#2a6f2a' },
  { name: 'desert',     color: '#d4a84b', accent: '#b8882a' },
  { name: 'wetlands',   color: '#5a9e6a', accent: '#3a7e4a' },
];

const DECORATIONS = [
  { emoji: '🌴', offsetY: -18 },
  { emoji: '🌵', offsetY: -16 },
  { emoji: '🌿', offsetY: -6  },
  { emoji: '🍄', offsetY: -6  },
  { emoji: '🌾', offsetY: -6  },
  { emoji: '🪨', offsetY: -4  },
  { emoji: '🌺', offsetY: -6  },
  { emoji: '🌸', offsetY: -6  },
  { emoji: '🌻', offsetY: -10 },
  { emoji: '🏞️', offsetY: -8  },
];

/* ── Utility ────────────────────────────────────── */
function rnd(min, max)    { return Math.random() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function dist(a, b)       { return Math.hypot(a.x - b.x, a.y - b.y); }

function weightedPick(items, weightFn) {
  const total = items.reduce((s, i) => s + weightFn(i), 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= weightFn(item);
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function pickRarity() {
  const entries = Object.entries(RARITIES);
  return weightedPick(entries, ([, v]) => v.weight)[0];
}

function pickAnimalOfRarity(rarity) {
  const pool = ANIMAL_POOL.filter(a => a.rarity === rarity);
  return pool[rndInt(0, pool.length - 1)];
}

function pickTrait() { return TRAITS[rndInt(0, TRAITS.length - 1)]; }

function pickDesc(rarity) {
  const pool = DESCS_BY_RARITY[rarity];
  return pool[rndInt(0, pool.length - 1)];
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ── World generation ───────────────────────────── */
function generateWorld() {
  const decorations = [];
  const placed = [];

  // Biome blocks — divide world into rough regions
  const biomes = [];
  const cols = Math.ceil(WORLD_W / 600);
  const rows = Math.ceil(WORLD_H / 600);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      biomes.push({
        x: c * 600, y: r * 600,
        w: 600, h: 600,
        biome: BIOME_ZONES[rndInt(0, BIOME_ZONES.length - 1)],
      });
    }
  }

  // Place ~250 decorations
  for (let i = 0; i < 280; i++) {
    const x = rnd(60, WORLD_W - 60);
    const y = rnd(60, WORLD_H - 60);
    // Keep centre clear of start
    if (Math.hypot(x - WORLD_W / 2, y - WORLD_H / 2) < 180) continue;
    const dec = DECORATIONS[rndInt(0, DECORATIONS.length - 1)];
    decorations.push({ emoji: dec.emoji, x, y, offsetY: dec.offsetY });
    placed.push({ x, y });
  }

  // Animals
  const animals = [];
  const minAnimals = 22; // enough to wander
  for (let i = 0; i < minAnimals; i++) {
    let ax, ay, tries = 0;
    do {
      ax = rnd(120, WORLD_W - 120);
      ay = rnd(120, WORLD_H - 120);
      tries++;
    } while (
      tries < 50 &&
      (Math.hypot(ax - WORLD_W / 2, ay - WORLD_H / 2) < 220 ||
       animals.some(a => dist(a, { x: ax, y: ay }) < 140))
    );

    const rarity = pickRarity();
    const base   = pickAnimalOfRarity(rarity);
    animals.push({
      x: ax, y: ay,
      emoji:   base.emoji,
      species: base.species,
      rarity:  rarity,
      trait:   pickTrait(),
      desc:    pickDesc(rarity),
      collected: false,
      bobOffset: rnd(0, Math.PI * 2),
    });
  }

  return { biomes, decorations, animals };
}

/* ── Game state ─────────────────────────────────── */
let world, player, camera, joystick, team, score, gameActive;

function initGame() {
  world = generateWorld();

  player = {
    x: WORLD_W / 2,
    y: WORLD_H / 2,
    dir: { x: 0, y: 0 },
    moving: false,
    frame: 0,
    frameTimer: 0,
    facing: 'S', // N S E W
  };

  camera = {
    x: player.x - canvas.width / 2,
    y: player.y - canvas.height / 2,
  };

  joystick = {
    active:   false,
    originX:  0,
    originY:  0,
    dx:       0,
    dy:       0,
    touchId:  null,
  };

  team  = [];
  score = 0;
  gameActive = true;

  buildTeamSlots();
  updateScoreHUD();
}

/* ── HUD helpers ────────────────────────────────── */
const teamSlotsEl  = document.getElementById('teamSlots');
const scoreValueEl = document.getElementById('scoreValue');

function buildTeamSlots() {
  teamSlotsEl.innerHTML = '';
  for (let i = 0; i < TEAM_SIZE; i++) {
    const slot = document.createElement('div');
    slot.className = 'team-slot';
    slot.id = `slot-${i}`;
    teamSlotsEl.appendChild(slot);
  }
}

function updateTeamHUD() {
  for (let i = 0; i < TEAM_SIZE; i++) {
    const slot = document.getElementById(`slot-${i}`);
    if (team[i]) {
      slot.textContent = team[i].emoji;
      slot.classList.add('filled');
    } else {
      slot.textContent = '';
      slot.classList.remove('filled');
    }
  }
}

function updateScoreHUD() {
  scoreValueEl.textContent = score.toLocaleString();
}

/* ── Joystick UI ────────────────────────────────── */
const joystickOuter = document.getElementById('joystickOuter');
const joystickInner = document.getElementById('joystickInner');
const JOYSTICK_RADIUS = 38;

function showJoystick(cx, cy) {
  joystickOuter.style.left = cx + 'px';
  joystickOuter.style.top  = cy + 'px';
  joystickOuter.classList.remove('hidden');
  updateJoystickKnob(0, 0);
}

function hideJoystick() {
  joystickOuter.classList.add('hidden');
  joystickInner.style.transform = 'translate(-50%,-50%)';
}

function updateJoystickKnob(dx, dy) {
  const tx = dx * JOYSTICK_RADIUS;
  const ty = dy * JOYSTICK_RADIUS;
  joystickInner.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
}

/* ── Touch controls ─────────────────────────────── */
canvas.addEventListener('touchstart', onTouchStart, { passive: false });
canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
canvas.addEventListener('touchend',   onTouchEnd,   { passive: false });
canvas.addEventListener('touchcancel',onTouchEnd,   { passive: false });

// Keyboard fallback for desktop
const keysDown = {};
window.addEventListener('keydown', e => { keysDown[e.key] = true; });
window.addEventListener('keyup',   e => { keysDown[e.key] = false; });

function onTouchStart(e) {
  e.preventDefault();
  if (!gameActive) return;
  const t = e.changedTouches[0];
  joystick.active  = true;
  joystick.originX = t.clientX;
  joystick.originY = t.clientY;
  joystick.touchId = t.identifier;
  joystick.dx = 0;
  joystick.dy = 0;
  showJoystick(t.clientX, t.clientY);
}

function onTouchMove(e) {
  e.preventDefault();
  if (!joystick.active) return;
  let touch = null;
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === joystick.touchId) {
      touch = e.changedTouches[i]; break;
    }
  }
  if (!touch) return;

  const rawDx = touch.clientX - joystick.originX;
  const rawDy = touch.clientY - joystick.originY;
  const magnitude = Math.hypot(rawDx, rawDy);
  const deadzone  = 8;

  if (magnitude < deadzone) {
    joystick.dx = 0;
    joystick.dy = 0;
  } else {
    const scale = Math.min(magnitude, 55) / 55;
    joystick.dx = (rawDx / magnitude) * scale;
    joystick.dy = (rawDy / magnitude) * scale;
  }
  updateJoystickKnob(joystick.dx, joystick.dy);
}

function onTouchEnd(e) {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === joystick.touchId) {
      joystick.active = false;
      joystick.dx = 0;
      joystick.dy = 0;
      hideJoystick();
      break;
    }
  }
}

/* ── Camera ─────────────────────────────────────── */
function updateCamera() {
  const targetX = player.x - canvas.width  / 2;
  const targetY = player.y - canvas.height / 2;
  // Smooth follow
  camera.x += (targetX - camera.x) * 0.12;
  camera.y += (targetY - camera.y) * 0.12;
  // Clamp to world
  camera.x = clamp(camera.x, 0, WORLD_W - canvas.width);
  camera.y = clamp(camera.y, 0, WORLD_H - canvas.height);
}

/* ── Player movement ────────────────────────────── */
function updatePlayer(dt) {
  let dx = joystick.dx;
  let dy = joystick.dy;

  // Keyboard fallback
  if (keysDown['ArrowLeft']  || keysDown['a']) dx -= 1;
  if (keysDown['ArrowRight'] || keysDown['d']) dx += 1;
  if (keysDown['ArrowUp']    || keysDown['w']) dy -= 1;
  if (keysDown['ArrowDown']  || keysDown['s']) dy += 1;

  const mag = Math.hypot(dx, dy);
  if (mag > 0.08) {
    const norm = mag > 1 ? mag : 1;
    dx /= norm; dy /= norm;

    player.x = clamp(player.x + dx * PLAYER_SPEED, 30, WORLD_W - 30);
    player.y = clamp(player.y + dy * PLAYER_SPEED, 30, WORLD_H - 30);
    player.moving = true;

    // Determine cardinal facing
    if (Math.abs(dx) >= Math.abs(dy)) {
      player.facing = dx > 0 ? 'E' : 'W';
    } else {
      player.facing = dy > 0 ? 'S' : 'N';
    }

    player.frameTimer += dt;
    if (player.frameTimer > 220) {
      player.frame = (player.frame + 1) % 2;
      player.frameTimer = 0;
    }
  } else {
    player.moving = false;
  }
}

/* ── Encounter logic ────────────────────────────── */
let inEncounter = false;
let encounterAnimal = null;

function checkEncounters() {
  if (inEncounter) return;
  for (const animal of world.animals) {
    if (animal.collected) continue;
    if (dist(player, animal) < ENCOUNTER_DIST) {
      triggerEncounter(animal);
      return;
    }
  }
}

function triggerEncounter(animal) {
  inEncounter   = true;
  encounterAnimal = animal;
  gameActive    = false; // pause movement
  hideJoystick();
  joystick.active = false;

  const rar = RARITIES[animal.rarity];
  document.getElementById('encounterEmoji').textContent = animal.emoji;
  document.getElementById('encounterName').textContent  = animal.species;
  document.getElementById('encounterTrait').textContent = `"${animal.trait}"`;
  const rarEl = document.getElementById('encounterRarity');
  rarEl.textContent  = rar.label;
  rarEl.className    = rar.color;
  document.getElementById('encounterDesc').textContent  = animal.desc;

  document.getElementById('encounterPanel').classList.remove('hidden');
}

document.getElementById('btnBefriend').addEventListener('click', () => {
  document.getElementById('encounterPanel').classList.add('hidden');
  befriendAnimal(encounterAnimal);
});

document.getElementById('btnLeave').addEventListener('click', () => {
  document.getElementById('encounterPanel').classList.add('hidden');
  inEncounter   = false;
  encounterAnimal = null;
  gameActive    = true;
});

function befriendAnimal(animal) {
  animal.collected = true;
  const rar = RARITIES[animal.rarity];
  const pts = rar.baseScore + rndInt(0, Math.floor(rar.baseScore * 0.3));
  animal.earnedPts = pts;
  score += pts;
  team.push(animal);

  updateTeamHUD();
  updateScoreHUD();

  // Show collection popup
  document.getElementById('collectionEmoji').textContent = animal.emoji;
  document.getElementById('collectionName').textContent  = `${animal.trait} ${animal.species}`;
  document.getElementById('collectionPts').textContent   = pts.toLocaleString();
  document.getElementById('collectionPopup').classList.remove('hidden');
}

document.getElementById('btnCollectionOk').addEventListener('click', () => {
  document.getElementById('collectionPopup').classList.add('hidden');
  inEncounter   = false;
  encounterAnimal = null;

  if (team.length >= TEAM_SIZE) {
    showEndScreen();
  } else {
    gameActive = true;
  }
});

/* ── End screen ─────────────────────────────────── */
function showEndScreen() {
  gameActive = false;
  const grid = document.getElementById('endTeamGrid');
  grid.innerHTML = '';
  team.forEach(a => {
    const card = document.createElement('div');
    card.className = 'end-animal-card';
    card.innerHTML = `
      <span class="end-animal-emoji">${a.emoji}</span>
      <span class="end-animal-name">${a.species}</span>
      <span class="end-animal-pts">+${a.earnedPts.toLocaleString()}</span>`;
    grid.appendChild(card);
  });

  document.getElementById('endScoreVal').textContent = score.toLocaleString();
  document.getElementById('endRank').textContent = scoreRank(score);
  document.getElementById('endScreen').classList.remove('hidden');
}

function scoreRank(s) {
  if (s >= 10000) return '🏆 Legendary Explorer';
  if (s >= 7000)  return '🥇 Master Tracker';
  if (s >= 4500)  return '🥈 Wildlife Expert';
  if (s >= 2500)  return '🥉 Safari Ranger';
  return '🌿 Budding Naturalist';
}

document.getElementById('btnRestart').addEventListener('click', () => {
  document.getElementById('endScreen').classList.add('hidden');
  initGame();
});

/* ── Draw helpers ───────────────────────────────── */
const TEXT_SCALE = 1;         // emoji scale factor for canvas
const EMOJI_SIZE = 36;

function worldToScreen(wx, wy) {
  return { x: wx - camera.x, y: wy - camera.y };
}

function isOnScreen(wx, wy, margin = 80) {
  const sx = wx - camera.x;
  const sy = wy - camera.y;
  return sx > -margin && sx < canvas.width + margin &&
         sy > -margin && sy < canvas.height + margin;
}

function drawEmoji(emoji, sx, sy, size = 32) {
  ctx.save();
  ctx.font = `${size}px serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, sx, sy);
  ctx.restore();
}

/* ── World rendering ────────────────────────────── */
function drawWorld(t) {
  // Background: biome tiles
  for (const b of world.biomes) {
    const sx = b.x - camera.x;
    const sy = b.y - camera.y;
    if (sx + b.w < 0 || sx > canvas.width || sy + b.h < 0 || sy > canvas.height) continue;
    ctx.fillStyle = b.biome.color;
    ctx.fillRect(sx, sy, b.w, b.h);

    // Subtle tile stripe for texture
    ctx.fillStyle = b.biome.accent + '44';
    for (let ty = 0; ty < b.h; ty += TILE_SIZE) {
      for (let tx = 0; tx < b.w; tx += TILE_SIZE) {
        if ((Math.floor((b.x + tx) / TILE_SIZE) + Math.floor((b.y + ty) / TILE_SIZE)) % 2 === 0) {
          ctx.fillRect(sx + tx, sy + ty, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  // World border hint
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth   = 8;
  ctx.strokeRect(-camera.x, -camera.y, WORLD_W, WORLD_H);

  // Decorations
  for (const d of world.decorations) {
    if (!isOnScreen(d.x, d.y)) continue;
    const s = worldToScreen(d.x, d.y);
    drawEmoji(d.emoji, s.x, s.y + d.offsetY, 28);
  }
}

/* ── Animal rendering ───────────────────────────── */
function drawAnimals(t) {
  for (const a of world.animals) {
    if (a.collected) continue;
    if (!isOnScreen(a.x, a.y)) continue;

    const s = worldToScreen(a.x, a.y);
    const bob = Math.sin(t * 0.002 + a.bobOffset) * 4;

    // Proximity glow
    const d = dist(player, a);
    if (d < 140) {
      const alpha = 1 - d / 140;
      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y + 4, 28 + alpha * 12, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,220,80,${alpha * 0.35})`;
      ctx.fill();
      ctx.restore();
    }

    // Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(s.x, s.y + 14, 16, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fill();
    ctx.restore();

    drawEmoji(a.emoji, s.x, s.y - 4 + bob, 38);

    // Rarity indicator dot
    const rarColor = { common:'#6db846', uncommon:'#4a90d9', rare:'#9b59b6', epic:'#e07b39', legendary:'#f1c40f' };
    ctx.save();
    ctx.beginPath();
    ctx.arc(s.x + 14, s.y - 22 + bob, 5, 0, Math.PI * 2);
    ctx.fillStyle = rarColor[a.rarity];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.restore();

    // "!" prompt when very close
    if (d < ENCOUNTER_DIST + 20) {
      const pulse = 0.85 + 0.15 * Math.sin(t * 0.008);
      ctx.save();
      ctx.font = `bold ${22 * pulse}px -apple-system, sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle    = '#fff';
      ctx.shadowColor  = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur   = 4;
      ctx.fillText('!', s.x, s.y - 28 + bob);
      ctx.restore();
    }
  }
}

/* ── Player rendering ───────────────────────────── */
const PLAYER_EMOJI = '🧑‍🦯';

function drawPlayer(t) {
  const s = worldToScreen(player.x, player.y);

  // Shadow
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + 16, 18, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fill();
  ctx.restore();

  // Walk bob
  const walkBob = player.moving ? Math.sin(t * 0.015) * 3 : 0;

  // Direction arrow (small, subtle)
  if (player.moving) {
    const arrowMap = { N: '▲', S: '▼', E: '▶', W: '◀' };
    ctx.save();
    ctx.font         = '10px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = 'rgba(255,255,255,0.55)';
    ctx.fillText(arrowMap[player.facing], s.x, s.y - 36 + walkBob);
    ctx.restore();
  }

  // Player character
  ctx.save();
  ctx.font         = `40px serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'bottom';
  ctx.shadowColor  = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur   = 6;

  // Flip horizontally when facing West
  if (player.facing === 'W') {
    ctx.translate(s.x, s.y + walkBob);
    ctx.scale(-1, 1);
    ctx.fillText('🧭', 0, -2); // compass hat replacement
    ctx.fillText('🧑‍🌾', 0, 8);
  } else {
    ctx.fillText('🧑‍🌾', s.x, s.y + walkBob + 8);
  }
  ctx.restore();

  // Hat/accessory
  drawEmoji('🎩', s.x, s.y - 22 + walkBob, 22);
}

/* ── Mini-map ───────────────────────────────────── */
function drawMinimap() {
  const mmW = 90, mmH = 90;
  const mmX = canvas.width  - mmW - 14;
  const mmY = canvas.height - mmH - 14;
  const scaleX = mmW / WORLD_W;
  const scaleY = mmH / WORLD_H;

  // Background
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(mmX, mmY, mmW, mmH, 8);
  } else {
    ctx.rect(mmX, mmY, mmW, mmH);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fill();

  // Animals
  for (const a of world.animals) {
    if (a.collected) continue;
    const ax = mmX + a.x * scaleX;
    const ay = mmY + a.y * scaleY;
    ctx.beginPath();
    ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = a.rarity === 'legendary' ? '#f1c40f'
                  : a.rarity === 'epic'      ? '#e07b39'
                  : a.rarity === 'rare'      ? '#9b59b6'
                  : a.rarity === 'uncommon'  ? '#4a90d9'
                  : '#6db846';
    ctx.fill();
  }

  // Player dot
  const px = mmX + player.x * scaleX;
  const py = mmY + player.y * scaleY;
  ctx.beginPath();
  ctx.arc(px, py, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Viewport rect
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(
    mmX + camera.x * scaleX,
    mmY + camera.y * scaleY,
    canvas.width  * scaleX,
    canvas.height * scaleY
  );

  ctx.restore();
}

/* ── Main loop ──────────────────────────────────── */
let lastTime = 0;

function gameLoop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime  = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameActive) {
    updatePlayer(dt);
    updateCamera();
    checkEncounters();
  } else {
    updateCamera(); // still smooth-pan during panels
  }

  drawWorld(timestamp);
  drawAnimals(timestamp);
  drawPlayer(timestamp);
  drawMinimap();

  requestAnimationFrame(gameLoop);
}

/* ── Start button ───────────────────────────────── */
document.getElementById('btnStart').addEventListener('click', () => {
  document.getElementById('startScreen').classList.add('hidden');
  initGame();
  requestAnimationFrame(loop => {
    lastTime = loop;
    requestAnimationFrame(gameLoop);
  });
});
