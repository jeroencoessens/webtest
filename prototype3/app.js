/* ============================================================
   Safari Pals — Full Game
   ============================================================ */

      // Agent: Opus 4.6, time taken: 4min41, app.js 716 lines

(() => {
    "use strict";

    // ── Constants ──────────────────────────────────────────────
    const WORLD_W = 3200;
    const WORLD_H = 3200;
    const TILE = 64;
    const PLAYER_SPEED = 180;           // px / sec
    const BEFRIEND_DIST = 70;
    const JOYSTICK_DEAD = 12;
    const JOYSTICK_MAX = 60;
    const TEAM_SIZE = 6;
    const ANIMAL_COUNT = 30;            // total scattered in world
    const WANDER_RADIUS = 80;
    const WANDER_SPEED = 30;

    // ── Rarity tiers ──────────────────────────────────────────
    const RARITIES = [
        { name: "Common",    weight: 40, color: "#999",    points: 100,  stars: "⭐" },
        { name: "Uncommon",  weight: 28, color: "#43a047", points: 250,  stars: "⭐⭐" },
        { name: "Rare",      weight: 18, color: "#1e88e5", points: 500,  stars: "⭐⭐⭐" },
        { name: "Epic",      weight: 10, color: "#8e24aa", points: 1000, stars: "⭐⭐⭐⭐" },
        { name: "Legendary", weight: 4,  color: "#f9a825", points: 2500, stars: "⭐⭐⭐⭐⭐" },
    ];

    // ── Animal pool ───────────────────────────────────────────
    const ANIMAL_POOL = [
        { emoji: "🦁", species: "Lion" },
        { emoji: "🐘", species: "Elephant" },
        { emoji: "🦒", species: "Giraffe" },
        { emoji: "🦓", species: "Zebra" },
        { emoji: "🦛", species: "Hippo" },
        { emoji: "🐆", species: "Leopard" },
        { emoji: "🦏", species: "Rhino" },
        { emoji: "🐊", species: "Crocodile" },
        { emoji: "🦩", species: "Flamingo" },
        { emoji: "🐃", species: "Buffalo" },
        { emoji: "🦅", species: "Eagle" },
        { emoji: "🐒", species: "Monkey" },
        { emoji: "🐍", species: "Snake" },
        { emoji: "🦎", species: "Lizard" },
        { emoji: "🐢", species: "Tortoise" },
        { emoji: "🦜", species: "Parrot" },
        { emoji: "🐗", species: "Warthog" },
        { emoji: "🦔", species: "Hedgehog" },
        { emoji: "🐺", species: "Wolf" },
        { emoji: "🦊", species: "Fox" },
        { emoji: "🐻", species: "Bear" },
        { emoji: "🦌", species: "Deer" },
        { emoji: "🐫", species: "Camel" },
        { emoji: "🦃", species: "Turkey" },
        { emoji: "🦉", species: "Owl" },
    ];

    const PERSONALITIES = [
        "Shy", "Playful", "Grumpy", "Curious", "Brave",
        "Sleepy", "Jolly", "Gentle", "Wild", "Mischievous",
        "Wise", "Goofy", "Proud", "Calm", "Fierce",
    ];

    const TRAIT_ADJECTIVES = [
        "Tiny", "Giant", "Golden", "Silver", "Shadow",
        "Crystal", "Swift", "Ancient", "Baby", "Spotted",
        "Striped", "Fluffy", "Shiny", "Mystic", "Royal",
    ];

    // ── Biome colours ─────────────────────────────────────────
    const BIOME_GRASS = ["#5a9e3e", "#4e8c36", "#65a844", "#52933a"];
    const BIOME_SAND  = ["#d4b87a", "#c9ad6f", "#dfc185", "#bea265"];
    const BIOME_WATER = ["#3b8ecf", "#3582c0", "#4198d8", "#2d78b5"];

    // ── Environment decorations ───────────────────────────────
    const TREE_EMOJIS = ["🌳", "🌴", "🌲", "🌿", "🌵", "🍀"];
    const ROCK_EMOJIS = ["🪨", "🪵"];
    const FLOWER_EMOJIS = ["🌸", "🌺", "🌻", "💐", "🌷"];

    // ── DOM refs ──────────────────────────────────────────────
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const hudScore = document.getElementById("score-value");
    const hudCount = document.getElementById("collection-count");
    const collectionSlots = document.getElementById("collection-slots");
    const befriendPrompt = document.getElementById("befriend-prompt");
    const befriendEmoji = document.getElementById("befriend-emoji");
    const befriendName = document.getElementById("befriend-name");
    const befriendTrait = document.getElementById("befriend-trait");
    const befriendRarity = document.getElementById("befriend-rarity");
    const befriendBtn = document.getElementById("befriend-btn");
    const gameOverScreen = document.getElementById("game-over");
    const finalTeam = document.getElementById("final-team");
    const finalScore = document.getElementById("final-score");
    const playAgainBtn = document.getElementById("play-again-btn");
    const titleScreen = document.getElementById("title-screen");
    const startBtn = document.getElementById("start-btn");

    // ── State ─────────────────────────────────────────────────
    let dpr = 1;
    let cw = 0, ch = 0;
    let player = { x: 0, y: 0, dir: 0, moving: false, frame: 0 };
    let camera = { x: 0, y: 0 };
    let animals = [];
    let decorations = [];
    let biomeMap = [];              // 2D array of biome IDs
    let team = [];
    let score = 0;
    let gameRunning = false;
    let paused = false;             // when prompt is up
    let pendingAnimal = null;

    // Joystick
    let joystick = {
        active: false,
        originX: 0, originY: 0,
        currentX: 0, currentY: 0,
        dx: 0, dy: 0,
    };

    // Timing
    let lastTime = 0;

    // ── Helpers ───────────────────────────────────────────────
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
    function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

    function pickRarity() {
        const total = RARITIES.reduce((s, r) => s + r.weight, 0);
        let roll = Math.random() * total;
        for (const r of RARITIES) {
            roll -= r.weight;
            if (roll <= 0) return r;
        }
        return RARITIES[0];
    }

    // ── Biome generation ──────────────────────────────────────
    // Simple zone-based biome: Perlin-like using layered sin noise
    function generateBiomeMap() {
        const cols = Math.ceil(WORLD_W / TILE);
        const rows = Math.ceil(WORLD_H / TILE);
        biomeMap = [];
        // Random phase offsets for variety
        const ox1 = rand(0, 1000), oy1 = rand(0, 1000);
        const ox2 = rand(0, 1000), oy2 = rand(0, 1000);
        for (let r = 0; r < rows; r++) {
            biomeMap[r] = [];
            for (let c = 0; c < cols; c++) {
                const nx = c / cols;
                const ny = r / rows;
                const v =
                    Math.sin((nx * 6 + ox1) * 2) * 0.3 +
                    Math.sin((ny * 5 + oy1) * 2.5) * 0.3 +
                    Math.sin((nx * 12 + oy2) + (ny * 10 + ox2)) * 0.4;
                if (v < -0.35) biomeMap[r][c] = 2;       // water
                else if (v < -0.05) biomeMap[r][c] = 1;  // sand
                else biomeMap[r][c] = 0;                  // grass
            }
        }
    }

    function getBiome(wx, wy) {
        const c = Math.floor(wx / TILE);
        const r = Math.floor(wy / TILE);
        if (r < 0 || c < 0 || r >= biomeMap.length || c >= (biomeMap[0]?.length || 0)) return 0;
        return biomeMap[r][c];
    }

    function isWater(wx, wy) { return getBiome(wx, wy) === 2; }

    // ── Decoration generation ─────────────────────────────────
    function generateDecorations() {
        decorations = [];
        const count = 350;
        for (let i = 0; i < count; i++) {
            const x = rand(40, WORLD_W - 40);
            const y = rand(40, WORLD_H - 40);
            const biome = getBiome(x, y);
            if (biome === 2) continue;  // no deco on water
            let emoji;
            const roll = Math.random();
            if (biome === 1) {
                emoji = roll < 0.4 ? pick(ROCK_EMOJIS) : roll < 0.6 ? "🌵" : pick(FLOWER_EMOJIS);
            } else {
                emoji = roll < 0.5 ? pick(TREE_EMOJIS) : roll < 0.75 ? pick(FLOWER_EMOJIS) : pick(ROCK_EMOJIS);
            }
            decorations.push({ x, y, emoji, size: rand(18, 30) });
        }
    }

    // ── Animal generation ─────────────────────────────────────
    function generateAnimal() {
        let x, y, attempts = 0;
        do {
            x = rand(100, WORLD_W - 100);
            y = rand(100, WORLD_H - 100);
            attempts++;
        } while (isWater(x, y) && attempts < 50);
        if (isWater(x, y)) { x = WORLD_W / 2; y = WORLD_H / 2; }

        const base = pick(ANIMAL_POOL);
        const rarity = pickRarity();
        const adj = pick(TRAIT_ADJECTIVES);
        const personality = pick(PERSONALITIES);
        const name = adj + " " + base.species;

        return {
            x, y,
            homeX: x, homeY: y,
            emoji: base.emoji,
            species: base.species,
            name, rarity, personality,
            wanderAngle: rand(0, Math.PI * 2),
            wanderTimer: rand(0, 3),
            discovered: false,
            befriended: false,
            bobPhase: rand(0, Math.PI * 2),
        };
    }

    function generateAnimals() {
        animals = [];
        for (let i = 0; i < ANIMAL_COUNT; i++) {
            animals.push(generateAnimal());
        }
    }

    // ── Init / reset ──────────────────────────────────────────
    function resize() {
        dpr = window.devicePixelRatio || 1;
        cw = window.innerWidth;
        ch = window.innerHeight;
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
        canvas.style.width = cw + "px";
        canvas.style.height = ch + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initGame() {
        generateBiomeMap();
        generateDecorations();
        generateAnimals();

        // Find a grass spawn
        player.x = WORLD_W / 2;
        player.y = WORLD_H / 2;
        let tries = 0;
        while (isWater(player.x, player.y) && tries < 100) {
            player.x = rand(200, WORLD_W - 200);
            player.y = rand(200, WORLD_H - 200);
            tries++;
        }
        player.dir = 0;
        player.moving = false;
        player.frame = 0;

        team = [];
        score = 0;
        paused = false;
        pendingAnimal = null;
        gameRunning = true;

        hudScore.textContent = "0";
        hudCount.textContent = "0";
        buildCollectionSlots();
        befriendPrompt.classList.add("hidden");
        gameOverScreen.classList.add("hidden");
    }

    function buildCollectionSlots() {
        collectionSlots.innerHTML = "";
        for (let i = 0; i < TEAM_SIZE; i++) {
            const slot = document.createElement("div");
            slot.className = "collection-slot";
            slot.textContent = "?";
            collectionSlots.appendChild(slot);
        }
    }

    function updateCollectionSlots() {
        const slots = collectionSlots.children;
        for (let i = 0; i < TEAM_SIZE; i++) {
            if (i < team.length) {
                slots[i].textContent = team[i].emoji;
                slots[i].classList.add("filled");
            }
        }
    }

    // ── Touch / joystick ──────────────────────────────────────
    function getTouchPos(e) {
        const t = e.changedTouches ? e.changedTouches[0] : e;
        return { x: t.clientX, y: t.clientY };
    }

    function onTouchStart(e) {
        if (paused || !gameRunning) return;
        e.preventDefault();
        const p = getTouchPos(e);
        joystick.active = true;
        joystick.originX = p.x;
        joystick.originY = p.y;
        joystick.currentX = p.x;
        joystick.currentY = p.y;
        joystick.dx = 0;
        joystick.dy = 0;
    }

    function onTouchMove(e) {
        if (!joystick.active) return;
        e.preventDefault();
        const p = getTouchPos(e);
        joystick.currentX = p.x;
        joystick.currentY = p.y;
        let dx = p.x - joystick.originX;
        let dy = p.y - joystick.originY;
        const len = Math.hypot(dx, dy);
        if (len > JOYSTICK_MAX) {
            dx = (dx / len) * JOYSTICK_MAX;
            dy = (dy / len) * JOYSTICK_MAX;
        }
        joystick.dx = dx;
        joystick.dy = dy;
    }

    function onTouchEnd(e) {
        e.preventDefault();
        joystick.active = false;
        joystick.dx = 0;
        joystick.dy = 0;
    }

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });

    // Mouse fallback for desktop
    let mouseDown = false;
    canvas.addEventListener("mousedown", (e) => {
        if (paused || !gameRunning) return;
        mouseDown = true;
        joystick.active = true;
        joystick.originX = e.clientX;
        joystick.originY = e.clientY;
        joystick.currentX = e.clientX;
        joystick.currentY = e.clientY;
        joystick.dx = 0;
        joystick.dy = 0;
    });
    canvas.addEventListener("mousemove", (e) => {
        if (!mouseDown) return;
        joystick.currentX = e.clientX;
        joystick.currentY = e.clientY;
        let dx = e.clientX - joystick.originX;
        let dy = e.clientY - joystick.originY;
        const len = Math.hypot(dx, dy);
        if (len > JOYSTICK_MAX) {
            dx = (dx / len) * JOYSTICK_MAX;
            dy = (dy / len) * JOYSTICK_MAX;
        }
        joystick.dx = dx;
        joystick.dy = dy;
    });
    canvas.addEventListener("mouseup", () => {
        mouseDown = false;
        joystick.active = false;
        joystick.dx = 0;
        joystick.dy = 0;
    });

    // ── Befriend UI ───────────────────────────────────────────
    function showBefriendPrompt(animal) {
        paused = true;
        pendingAnimal = animal;
        befriendEmoji.textContent = animal.emoji;
        befriendName.textContent = animal.name;
        befriendTrait.textContent = `"${animal.personality}" personality`;
        befriendRarity.textContent = animal.rarity.name + " " + animal.rarity.stars;
        befriendRarity.className = "rarity-" + animal.rarity.name.toLowerCase();
        befriendPrompt.classList.remove("hidden");
    }

    befriendBtn.addEventListener("click", () => {
        if (!pendingAnimal) return;
        const animal = pendingAnimal;
        animal.befriended = true;
        team.push(animal);
        score += animal.rarity.points;

        hudScore.textContent = score;
        hudCount.textContent = team.length;
        updateCollectionSlots();

        befriendPrompt.classList.add("hidden");
        pendingAnimal = null;
        paused = false;

        if (team.length >= TEAM_SIZE) {
            endGame();
        }
    });

    // ── Game over ─────────────────────────────────────────────
    function endGame() {
        gameRunning = false;
        paused = true;
        finalTeam.innerHTML = "";
        for (const a of team) {
            const div = document.createElement("div");
            div.className = "final-animal";
            div.innerHTML =
                `<span class="final-animal-emoji">${a.emoji}</span>` +
                `<span class="final-animal-name">${a.name}</span>` +
                `<span class="final-animal-pts">+${a.rarity.points}</span>`;
            finalTeam.appendChild(div);
        }
        finalScore.textContent = "Score: " + score;
        gameOverScreen.classList.remove("hidden");
    }

    playAgainBtn.addEventListener("click", () => {
        gameOverScreen.classList.add("hidden");
        initGame();
    });

    startBtn.addEventListener("click", () => {
        titleScreen.classList.add("hidden");
        initGame();
        requestAnimationFrame(loop);
    });

    // ── Update ────────────────────────────────────────────────
    function update(dt) {
        if (!gameRunning || paused) return;

        // Player movement from joystick
        const jLen = Math.hypot(joystick.dx, joystick.dy);
        player.moving = jLen > JOYSTICK_DEAD;
        if (player.moving) {
            const nx = joystick.dx / jLen;
            const ny = joystick.dy / jLen;
            const speedFactor = clamp(jLen / JOYSTICK_MAX, 0, 1);
            const spd = PLAYER_SPEED * speedFactor * dt;
            let newX = player.x + nx * spd;
            let newY = player.y + ny * spd;
            // Clamp to world
            newX = clamp(newX, 20, WORLD_W - 20);
            newY = clamp(newY, 20, WORLD_H - 20);
            // Block water
            if (!isWater(newX, newY)) {
                player.x = newX;
                player.y = newY;
            } else if (!isWater(newX, player.y)) {
                player.x = newX;
            } else if (!isWater(player.x, newY)) {
                player.y = newY;
            }
            // Determine facing direction (4-way)
            if (Math.abs(nx) > Math.abs(ny)) {
                player.dir = nx > 0 ? 1 : 3; // right : left
            } else {
                player.dir = ny > 0 ? 2 : 0; // down : up
            }
            player.frame += dt * 6;
        }

        // Camera follow
        camera.x = player.x - cw / 2;
        camera.y = player.y - ch / 2;
        camera.x = clamp(camera.x, 0, WORLD_W - cw);
        camera.y = clamp(camera.y, 0, WORLD_H - ch);

        // Animal wander & proximity check
        for (const a of animals) {
            if (a.befriended) continue;

            // Wander
            a.wanderTimer -= dt;
            if (a.wanderTimer <= 0) {
                a.wanderAngle = rand(0, Math.PI * 2);
                a.wanderTimer = rand(1.5, 4);
            }
            let ax = a.x + Math.cos(a.wanderAngle) * WANDER_SPEED * dt;
            let ay = a.y + Math.sin(a.wanderAngle) * WANDER_SPEED * dt;
            // Keep near home
            if (Math.hypot(ax - a.homeX, ay - a.homeY) > WANDER_RADIUS) {
                a.wanderAngle = Math.atan2(a.homeY - a.y, a.homeX - a.x) + rand(-0.5, 0.5);
            }
            ax = clamp(ax, 20, WORLD_W - 20);
            ay = clamp(ay, 20, WORLD_H - 20);
            if (!isWater(ax, ay)) { a.x = ax; a.y = ay; }

            a.bobPhase += dt * 3;

            // Discovery check
            const d = dist(player, a);
            if (d < 200) a.discovered = true;
            if (d < BEFRIEND_DIST && !paused) {
                showBefriendPrompt(a);
            }
        }
    }

    // ── Render ────────────────────────────────────────────────
    function drawTiles() {
        const startC = Math.max(0, Math.floor(camera.x / TILE));
        const startR = Math.max(0, Math.floor(camera.y / TILE));
        const endC = Math.min(Math.ceil(WORLD_W / TILE), Math.ceil((camera.x + cw) / TILE) + 1);
        const endR = Math.min(Math.ceil(WORLD_H / TILE), Math.ceil((camera.y + ch) / TILE) + 1);

        for (let r = startR; r < endR; r++) {
            for (let c = startC; c < endC; c++) {
                const b = biomeMap[r]?.[c] ?? 0;
                const palette = b === 2 ? BIOME_WATER : b === 1 ? BIOME_SAND : BIOME_GRASS;
                ctx.fillStyle = palette[(r * 7 + c * 13) % palette.length];
                ctx.fillRect(c * TILE - camera.x, r * TILE - camera.y, TILE + 1, TILE + 1);
            }
        }
    }

    function drawDecorations() {
        for (const d of decorations) {
            const sx = d.x - camera.x;
            const sy = d.y - camera.y;
            if (sx < -40 || sx > cw + 40 || sy < -40 || sy > ch + 40) continue;
            ctx.font = d.size + "px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(d.emoji, sx, sy);
        }
    }

    function drawAnimals() {
        for (const a of animals) {
            if (a.befriended) continue;
            const sx = a.x - camera.x;
            const sy = a.y - camera.y;
            if (sx < -60 || sx > cw + 60 || sy < -60 || sy > ch + 60) continue;

            const bob = Math.sin(a.bobPhase) * 3;

            if (!a.discovered) {
                // Hidden: show rustling grass indicator
                ctx.font = "22px serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.globalAlpha = 0.5 + Math.sin(a.bobPhase * 1.5) * 0.2;
                ctx.fillText("🌾", sx, sy + bob);
                ctx.globalAlpha = 1;
            } else {
                // Visible
                // Shadow
                ctx.fillStyle = "rgba(0,0,0,0.15)";
                ctx.beginPath();
                ctx.ellipse(sx, sy + 16, 14, 5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Emoji
                ctx.font = "32px serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(a.emoji, sx, sy + bob);

                // Rarity indicator dot
                ctx.fillStyle = a.rarity.color;
                ctx.beginPath();
                ctx.arc(sx, sy - 22, 4, 0, Math.PI * 2);
                ctx.fill();

                // Exclamation if close
                const d = dist(player, a);
                if (d < 120) {
                    ctx.font = "16px sans-serif";
                    ctx.fillStyle = "#fff";
                    ctx.fillText("❗", sx + 18, sy - 18 + bob);
                }
            }
        }
    }

    function drawPlayer() {
        const sx = player.x - camera.x;
        const sy = player.y - camera.y;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.beginPath();
        ctx.ellipse(sx, sy + 18, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Walk bob
        const bob = player.moving ? Math.sin(player.frame * 2) * 3 : 0;

        // Player emoji with direction
        const dirEmojis = ["🧑‍🌾", "🧑‍🌾", "🧑‍🌾", "🧑‍🌾"];
        ctx.font = "34px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Flip left/right
        ctx.save();
        ctx.translate(sx, sy + bob);
        if (player.dir === 3) ctx.scale(-1, 1);
        ctx.fillText(dirEmojis[player.dir], 0, 0);
        ctx.restore();

        // Walking dust
        if (player.moving) {
            ctx.globalAlpha = 0.3;
            ctx.font = "12px serif";
            const dustOff = Math.sin(player.frame * 3) * 4;
            ctx.fillText("💨", sx - 10 + dustOff, sy + 16);
            ctx.globalAlpha = 1;
        }
    }

    function drawJoystick() {
        if (!joystick.active) return;

        // Outer ring
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(joystick.originX, joystick.originY, JOYSTICK_MAX, 0, Math.PI * 2);
        ctx.stroke();

        // Inner knob
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.arc(
            joystick.originX + joystick.dx,
            joystick.originY + joystick.dy,
            20, 0, Math.PI * 2
        );
        ctx.fill();
    }

    function drawMinimap() {
        const mw = 90, mh = 90;
        const mx = cw - mw - 14;
        const my = ch - mh - 80;

        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.roundRect(mx - 2, my - 2, mw + 4, mh + 4, 8);
        ctx.fill();

        // Draw biome tiles on minimap
        const cols = biomeMap[0]?.length || 1;
        const rows = biomeMap.length || 1;
        const tw = mw / cols;
        const th = mh / rows;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const b = biomeMap[r][c];
                ctx.fillStyle = b === 2 ? "#3b8ecf" : b === 1 ? "#d4b87a" : "#5a9e3e";
                ctx.fillRect(mx + c * tw, my + r * th, Math.ceil(tw), Math.ceil(th));
            }
        }

        // Animals as dots
        for (const a of animals) {
            if (a.befriended) continue;
            if (a.discovered) {
                ctx.fillStyle = a.rarity.color;
                ctx.beginPath();
                ctx.arc(mx + (a.x / WORLD_W) * mw, my + (a.y / WORLD_H) * mh, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Player dot
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(mx + (player.x / WORLD_W) * mw, my + (player.y / WORLD_H) * mh, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function render() {
        ctx.clearRect(0, 0, cw, ch);
        drawTiles();
        drawDecorations();
        drawAnimals();
        drawPlayer();
        drawMinimap();
        drawJoystick();
    }

    // ── Loop ──────────────────────────────────────────────────
    function loop(time) {
        const dt = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        resize();
        update(dt);
        render();

        requestAnimationFrame(loop);
    }

    // ── Boot ──────────────────────────────────────────────────
    resize();
    window.addEventListener("resize", resize);
})();