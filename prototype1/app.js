// ============================================================================
// SAFARI FRIENDS - Complete Game Logic
// ============================================================================

// Agent: Haiku 4.5, time taken: 2:04, app.js 430 lines

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;
const CHARACTER_SPEED = 200; // pixels per second
const CHARACTER_RADIUS = 25;
const ANIMAL_RADIUS = 22;
const BEFRIEND_DISTANCE = 60;
const ANIMALS_PER_SPAWN = 15;
const TARGET_COLLECTIONS = 6;

// Animal rarity tiers with spawn probabilities and score multipliers
const ANIMAL_RARITY = {
    COMMON: { weight: 50, scoreMultiplier: 10, glow: false },
    UNCOMMON: { weight: 30, scoreMultiplier: 25, glow: false },
    RARE: { weight: 15, scoreMultiplier: 50, glow: true },
    ULTRA_RARE: { weight: 5, scoreMultiplier: 100, glow: true }
};

// Animal emoji pool - diverse collections
const ANIMALS = {
    COMMON: ['🐇', '🦊', '🐿️', '🦝', '🦌', '🐄', '🐑', '🐐'],
    UNCOMMON: ['🦁', '🐯', '🐻', '🐼', '🦒', '🦓', '🦘', '🦙'],
    RARE: ['🦅', '🦉', '🦋', '🦎', '🐲', '🦑', '🦈', '🦕'],
    ULTRA_RARE: ['🦄', '🦅🔥', '👑🦁', '✨🦋', '🌈🦎', '⭐🦑']
};

// ============================================================================
// GAME CLASSES
// ============================================================================

class Character {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = CHARACTER_RADIUS;
        this.element = null;
    }

    update(dt) {
        // Apply velocity
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Clamp to world boundaries
        this.x = Math.max(this.radius, Math.min(WORLD_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(WORLD_HEIGHT - this.radius, this.y));
    }

    setVelocity(vx, vy) {
        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0) {
            this.vx = (vx / mag) * CHARACTER_SPEED;
            this.vy = (vy / mag) * CHARACTER_SPEED;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
    }

    render(offsetX, offsetY) {
        if (!this.element) return;
        this.element.style.left = (this.x - this.radius + offsetX) + 'px';
        this.element.style.top = (this.y - this.radius + offsetY) + 'px';
    }
}

class Animal {
    constructor(x, y, emoji, rarity) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
        this.rarity = rarity;
        this.radius = ANIMAL_RADIUS;
        this.element = null;
        this.collected = false;
    }

    getScore() {
        const rarityTier = this.getRarityTier();
        return ANIMAL_RARITY[rarityTier].scoreMultiplier;
    }

    getRarityTier() {
        if (this.rarity > 95) return 'ULTRA_RARE';
        if (this.rarity > 80) return 'RARE';
        if (this.rarity > 50) return 'UNCOMMON';
        return 'COMMON';
    }

    render(offsetX, offsetY) {
        if (!this.element) return;
        this.element.style.left = (this.x - this.radius + offsetX) + 'px';
        this.element.style.top = (this.y - this.radius + offsetY) + 'px';
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

class Game {
    constructor() {
        this.character = new Character(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
        this.animals = [];
        this.collected = [];
        this.score = 0;
        this.gameOver = false;
        this.lastTime = Date.now();
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.joystickActive = false;
        this.keys = {}; // Persistent keyboard state

        this.setupDOM();
        this.setupControls();
        this.spawnAnimals();
        this.updateCollectionUI();
        this.updateScoreUI();
        this.render(); // Initial render
        this.startGameLoop();
    }

    setupDOM() {
        const viewport = document.getElementById('worldViewport');
        viewport.innerHTML = '';

        // Create character element
        this.character.element = document.createElement('div');
        this.character.element.className = 'game-element character';
        viewport.appendChild(this.character.element);

        this.viewport = viewport;
    }

    spawnAnimals() {
        const viewport = document.getElementById('worldViewport');

        for (let i = 0; i < ANIMALS_PER_SPAWN; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = Math.random() * WORLD_HEIGHT;
            const rarity = Math.random() * 100;
            const emoji = this.selectEmoji(rarity);

            const animal = new Animal(x, y, emoji, rarity);
            animal.element = document.createElement('div');
            animal.element.className = 'game-element animal';

            const rarityTier = animal.getRarityTier();
            if (rarityTier === 'RARE') {
                animal.element.classList.add('rare');
            } else if (rarityTier === 'ULTRA_RARE') {
                animal.element.classList.add('ultra-rare');
            }

            animal.element.textContent = emoji;
            viewport.appendChild(animal.element);

            this.animals.push(animal);
        }
    }

    selectEmoji(rarity) {
        if (rarity > 95) {
            return ANIMALS.ULTRA_RARE[Math.floor(Math.random() * ANIMALS.ULTRA_RARE.length)];
        } else if (rarity > 80) {
            return ANIMALS.RARE[Math.floor(Math.random() * ANIMALS.RARE.length)];
        } else if (rarity > 50) {
            return ANIMALS.UNCOMMON[Math.floor(Math.random() * ANIMALS.UNCOMMON.length)];
        } else {
            return ANIMALS.COMMON[Math.floor(Math.random() * ANIMALS.COMMON.length)];
        }
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.play-again-btn') || this.gameOver) return;
            this.keys[e.key.toLowerCase()] = true;
            this.updateMovement();
        });

        document.addEventListener('keyup', (e) => {
            if (e.target.closest('.play-again-btn')) return;
            this.keys[e.key.toLowerCase()] = false;
            this.updateMovement();
        });

        // Touch controls
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.play-again-btn') || this.gameOver) return;
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.showJoystick(touch.clientX, touch.clientY);
        });

        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.play-again-btn') || !this.joystickActive) return;
            e.preventDefault();
            const touch = e.touches[0];
            this.updateJoystick(touch.clientX, touch.clientY);
        });

        document.addEventListener('touchend', (e) => {
            if (e.target.closest('.play-again-btn')) return;
            e.preventDefault();
            this.hideJoystick();
            this.character.setVelocity(0, 0);
        });

        document.addEventListener('touchcancel', (e) => {
            this.hideJoystick();
            this.character.setVelocity(0, 0);
        });
    }

    updateMovement() {
        let vx = 0;
        let vy = 0;

        // WASD and Arrow keys
        if (this.keys['w'] || this.keys['arrowup']) vy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) vy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) vx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) vx += 1;

        this.character.setVelocity(vx, vy);
    }

    showJoystick(x, y) {
        const container = document.getElementById('joystickContainer');
        container.classList.add('active');
        container.style.left = (x - 60) + 'px';
        container.style.top = (y - 60) + 'px';
        container.style.pointerEvents = 'all';
        this.joystickActive = true;
    }

    hideJoystick() {
        const container = document.getElementById('joystickContainer');
        container.classList.remove('active');
        container.style.pointerEvents = 'none';
        this.joystickActive = false;
    }

    updateJoystick(x, y) {
        const dx = x - this.touchStartX;
        const dy = y - this.touchStartY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 50;
        const clampedDistance = Math.min(distance, maxDistance);

        // Update stick position
        const stick = document.getElementById('joystickStick');
        if (distance > 0) {
            const angle = Math.atan2(dy, dx);
            const offsetX = Math.cos(angle) * clampedDistance;
            const offsetY = Math.sin(angle) * clampedDistance;
            stick.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        } else {
            stick.style.transform = 'translate(-50%, -50%)';
        }

        // Update character velocity
        if (distance > 5) {
            const angle = Math.atan2(dy, dx);
            this.character.setVelocity(Math.cos(angle), Math.sin(angle));
        } else {
            this.character.setVelocity(0, 0);
        }
    }

    checkCollisions() {
        for (let i = this.animals.length - 1; i >= 0; i--) {
            const animal = this.animals[i];
            const dx = this.character.x - animal.x;
            const dy = this.character.y - animal.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < BEFRIEND_DISTANCE && !animal.collected) {
                this.befriendAnimal(animal, i);
            }
        }
    }

    befriendAnimal(animal, index) {
        animal.collected = true;
        animal.remove();
        this.animals.splice(index, 1);

        // Add to collection
        this.collected.push(animal);
        this.score += animal.getScore();

        // Update UI
        this.updateCollectionUI();
        this.updateScoreUI();

        // Check win condition
        if (this.collected.length >= TARGET_COLLECTIONS) {
            this.endGame();
        }
    }

    calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    updateCollectionUI() {
        for (let i = 0; i < TARGET_COLLECTIONS; i++) {
            const slot = document.getElementById('slot' + i);
            if (i < this.collected.length) {
                const animal = this.collected[i];
                slot.textContent = animal.emoji;
                slot.classList.add('filled');
            } else {
                slot.textContent = '';
                slot.classList.remove('filled');
            }
        }
    }

    updateScoreUI() {
        document.getElementById('animalCount').textContent = this.collected.length + '/' + TARGET_COLLECTIONS;
        document.getElementById('scoreDisplay').textContent = this.score;
    }

    endGame() {
        this.gameOver = true;
        const gameOverScreen = document.getElementById('gameOverScreen');
        gameOverScreen.classList.add('show');

        document.getElementById('finalScore').textContent = this.score;

        // Show collection summary
        const summary = document.getElementById('collectionSummary');
        summary.innerHTML = '';
        this.collected.forEach(animal => {
            const item = document.createElement('div');
            item.className = 'collection-item';
            item.textContent = animal.emoji;
            summary.appendChild(item);
        });

        // Setup replay button
        const playAgainBtn = document.getElementById('playAgainBtn');
        playAgainBtn.onclick = () => this.restart();

        // Stop character movement
        this.character.setVelocity(0, 0);
        this.hideJoystick();
    }

    restart() {
        // Reset all game state
        this.character = new Character(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
        this.animals = [];
        this.collected = [];
        this.score = 0;
        this.gameOver = false;
        this.lastTime = Date.now();
        this.keys = {};

        // Clear the screen
        const gameOverScreen = document.getElementById('gameOverScreen');
        gameOverScreen.classList.remove('show');

        // Reset DOM and spawn new animals
        this.setupDOM();
        this.spawnAnimals();
        this.updateCollectionUI();
        this.updateScoreUI();
        this.render();
    }

    update(dt) {
        if (this.gameOver) return;

        this.character.update(dt);
        this.checkCollisions();
    }

    render() {
        // Calculate camera offset to center on character
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const offsetX = centerX - this.character.x;
        const offsetY = centerY - this.character.y;

        // Render character
        this.character.render(offsetX, offsetY);

        // Render animals
        for (let animal of this.animals) {
            animal.render(offsetX, offsetY);
        }
    }

    startGameLoop() {
        const loop = () => {
            const now = Date.now();
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;

            this.update(dt);
            this.render();

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let game;

window.addEventListener('load', () => {
    game = new Game();
});

// Handle visibility change to prevent game running in background
document.addEventListener('visibilitychange', () => {
    if (document.hidden && game && !game.gameOver) {
        game.character.setVelocity(0, 0);
        game.hideJoystick();
    }
});
