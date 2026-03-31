// Animal Definitions with Traits and Rarity
const ANIMAL_POOL = [
    {
        name: "Lion",
        emoji: "🦁",
        rarity: 5,
        traits: ["Majestic", "Bold"]
    },
    {
        name: "Elephant",
        emoji: "🐘",
        rarity: 4,
        traits: ["Wise", "Gentle"]
    },
    {
        name: "Giraffe",
        emoji: "🦒",
        rarity: 4,
        traits: ["Graceful", "Tall"]
    },
    {
        name: "Zebra",
        emoji: "🦓",
        rarity: 3,
        traits: ["Striped", "Swift"]
    },
    {
        name: "Cheetah",
        emoji: "🐆",
        rarity: 5,
        traits: ["Fast", "Sleek"]
    },
    {
        name: "Rhino",
        emoji: "🦏",
        rarity: 4,
        traits: ["Strong", "Ancient"]
    },
    {
        name: "Hippo",
        emoji: "🦛",
        rarity: 3,
        traits: ["Hefty", "Playful"]
    },
    {
        name: "Fox",
        emoji: "🦊",
        rarity: 2,
        traits: ["Clever", "Curious"]
    },
    {
        name: "Deer",
        emoji: "🦌",
        rarity: 2,
        traits: ["Gentle", "Alert"]
    },
    {
        name: "Bear",
        emoji: "🐻",
        rarity: 3,
        traits: ["Strong", "Mysterious"]
    },
    {
        name: "Wolf",
        emoji: "🐺",
        rarity: 4,
        traits: ["Wild", "Social"]
    },
    {
        name: "Buffalo",
        emoji: "🐃",
        rarity: 3,
        traits: ["Powerful", "Social"]
    }
];

// Game Configuration
const CONFIG = {
    WORLD_WIDTH: 2000,
    WORLD_HEIGHT: 2000,
    PLAYER_SPEED: 120, // pixels per second
    ANIMAL_INTERACTION_RANGE: 40,
    ANIMALS_TO_COLLECT: 6,
    ANIMALS_IN_WORLD: 20
};

// Game State
let gameState = {
    playerX: 1000,
    playerY: 1000,
    moving: false,
    direction: { x: 0, y: 0 },
    animals: [],
    collectedAnimals: [],
    score: 0,
    gameOver: false,
    cameraX: 0,
    cameraY: 0
};

// Joystick State
let joystickState = {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    radius: 50
};

// Initialize Game
function initGame() {
    gameState = {
        playerX: 1000,
        playerY: 1000,
        moving: false,
        direction: { x: 0, y: 0 },
        animals: [],
        collectedAnimals: [],
        score: 0,
        gameOver: false,
        cameraX: 0,
        cameraY: 0
    };
    
    generateAnimals();
    setupEventListeners();
    updateUI();
    gameLoop();
}

// Generate Random Animals in the World
function generateAnimals() {
    const usedNames = new Set();
    
    while (gameState.animals.length < CONFIG.ANIMALS_IN_WORLD) {
        const animalTemplate = ANIMAL_POOL[Math.floor(Math.random() * ANIMAL_POOL.length)];
        
        // Create unique instance with variation
        const animal = {
            ...animalTemplate,
            id: Math.random(),
            x: Math.random() * CONFIG.WORLD_WIDTH,
            y: Math.random() * CONFIG.WORLD_HEIGHT,
            befriended: false,
            personality: generatePersonality()
        };
        
        // Ensure not too close to player start
        const dist = Math.hypot(animal.x - gameState.playerX, animal.y - gameState.playerY);
        if (dist > 200) {
            gameState.animals.push(animal);
        }
    }
}

// Generate Random Personality Traits
function generatePersonality() {
    const personalities = [
        "Loves to jump",
        "Very curious",
        "Loves to sing",
        "Shy but friendly",
        "Always happy",
        "Deep thinker",
        "Adventurous",
        "Loves to rest",
        "Comedy lover",
        "Nature enthusiast"
    ];
    return personalities[Math.floor(Math.random() * personalities.length)];
}

// Setup Event Listeners
function setupEventListeners() {
    const gameWorld = document.getElementById('game-world');
    const joystickContainer = document.getElementById('joystick-container');
    
    // Touch Events for Joystick
    gameWorld.addEventListener('touchstart', handleTouchStart, false);
    gameWorld.addEventListener('touchmove', handleTouchMove, false);
    gameWorld.addEventListener('touchend', handleTouchEnd, false);
    
    // Restart Button
    document.getElementById('restart-btn').addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        initGame();
    });
    
    // Befriend Button
    document.getElementById('befriend-btn').addEventListener('click', befriendAnimal);
}

// Touch Event Handlers
function handleTouchStart(e) {
    if (gameState.gameOver) return;
    
    const touch = e.touches[0];
    joystickState.active = true;
    joystickState.startX = touch.clientX;
    joystickState.startY = touch.clientY;
    joystickState.currentX = touch.clientX;
    joystickState.currentY = touch.clientY;
    
    showJoystick();
}

function handleTouchMove(e) {
    if (!joystickState.active || gameState.gameOver) return;
    
    const touch = e.touches[0];
    joystickState.currentX = touch.clientX;
    joystickState.currentY = touch.clientY;
    
    updateJoystickPosition();
    updatePlayerDirection();
}

function handleTouchEnd(e) {
    joystickState.active = false;
    gameState.direction = { x: 0, y: 0 };
    gameState.moving = false;
    hideJoystick();
}

// Joystick UI Functions
function showJoystick() {
    const container = document.getElementById('joystick-container');
    container.style.left = joystickState.startX + 'px';
    container.style.top = joystickState.startY + 'px';
    container.classList.remove('hidden');
}

function hideJoystick() {
    document.getElementById('joystick-container').classList.add('hidden');
}

function updateJoystickPosition() {
    const dx = joystickState.currentX - joystickState.startX;
    const dy = joystickState.currentY - joystickState.startY;
    const distance = Math.hypot(dx, dy);
    const maxDistance = joystickState.radius;
    
    let stickX = dx;
    let stickY = dy;
    
    if (distance > maxDistance) {
        const ratio = maxDistance / distance;
        stickX *= ratio;
        stickY *= ratio;
    }
    
    const stick = document.getElementById('joystick-stick');
    stick.style.transform = `translate(${stickX}px, ${stickY}px)`;
}

function updatePlayerDirection() {
    const dx = joystickState.currentX - joystickState.startX;
    const dy = joystickState.currentY - joystickState.startY;
    const distance = Math.hypot(dx, dy);
    
    if (distance > 20) {
        gameState.moving = true;
        gameState.direction.x = dx / Math.max(distance, 1);
        gameState.direction.y = dy / Math.max(distance, 1);
    } else {
        gameState.moving = false;
        gameState.direction.x = 0;
        gameState.direction.y = 0;
    }
}

// Update Player Position
function updatePlayerPosition(deltaTime) {
    if (gameState.moving) {
        const moveDistance = CONFIG.PLAYER_SPEED * deltaTime;
        gameState.playerX += gameState.direction.x * moveDistance;
        gameState.playerY += gameState.direction.y * moveDistance;
        
        // World boundaries
        gameState.playerX = Math.max(0, Math.min(gameState.playerX, CONFIG.WORLD_WIDTH));
        gameState.playerY = Math.max(0, Math.min(gameState.playerY, CONFIG.WORLD_HEIGHT));
    }
}

// Update Camera to Follow Player
function updateCamera() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    gameState.cameraX = gameState.playerX - viewportWidth / 2;
    gameState.cameraY = gameState.playerY - viewportHeight / 2;
    
    gameState.cameraX = Math.max(0, Math.min(gameState.cameraX, CONFIG.WORLD_WIDTH - viewportWidth));
    gameState.cameraY = Math.max(0, Math.min(gameState.cameraY, CONFIG.WORLD_HEIGHT - viewportHeight));
}

// Render Game World
function render() {
    const gameWorld = document.getElementById('game-world');
    const animalsContainer = document.getElementById('animals-container');
    
    // Update player position using CSS transform for smooth animation
    const player = document.getElementById('player');
    const screenX = gameState.playerX - gameState.cameraX;
    const screenY = gameState.playerY - gameState.cameraY;
    player.style.transform = `translate(${screenX - 20}px, ${screenY - 20}px)`;
    
    // Update animal positions
    animalsContainer.innerHTML = '';
    gameState.animals.forEach(animal => {
        if (!animal.befriended) {
            const element = document.createElement('div');
            element.className = 'entity animal';
            element.textContent = animal.emoji;
            element.id = 'animal-' + animal.id;
            
            const animalScreenX = animal.x - gameState.cameraX;
            const animalScreenY = animal.y - gameState.cameraY;
            element.style.transform = `translate(${animalScreenX - 20}px, ${animalScreenY - 20}px)`;
            
            animalsContainer.appendChild(element);
        }
    });
    
    // Update background gradient position for world feel
    const bgX = (-gameState.cameraX % 100);
    const bgY = (-gameState.cameraY % 100);
    gameWorld.style.backgroundPosition = `${bgX}px ${bgY}px, 0px 0px`;
}

// Check for Animal Interactions
function checkAnimalInteractions() {
    gameState.animals.forEach(animal => {
        if (animal.befriended) return;
        
        const distance = Math.hypot(
            gameState.playerX - animal.x,
            gameState.playerY - animal.y
        );
        
        if (distance < CONFIG.ANIMAL_INTERACTION_RANGE) {
            showInteractionPrompt(animal);
        }
    });
}

// Show Interaction Prompt
function showInteractionPrompt(animal) {
    const prompt = document.getElementById('interaction-prompt');
    const preview = document.getElementById('animal-preview');
    const info = document.getElementById('animal-info');
    
    preview.textContent = animal.emoji;
    info.innerHTML = `
        <h3>${animal.name}</h3>
        <p class="trait">"${animal.personality}"</p>
        <p class="rarity">Rarity: ${'⭐'.repeat(animal.rarity)}</p>
    `;
    
    prompt.classList.remove('hidden');
    
    // Store current animal for befriending
    window.currentInteractingAnimal = animal;
}

function hideInteractionPrompt() {
    document.getElementById('interaction-prompt').classList.add('hidden');
}

// Befriend Animal
function befriendAnimal() {
    const animal = window.currentInteractingAnimal;
    if (!animal) return;
    
    animal.befriended = true;
    gameState.collectedAnimals.push(animal);
    gameState.score += animal.rarity * 10;
    
    hideInteractionPrompt();
    updateUI();
    
    // Check if game is complete
    if (gameState.collectedAnimals.length >= CONFIG.ANIMALS_TO_COLLECT) {
        endGame();
    }
}

// Update UI
function updateUI() {
    // Update counts
    document.getElementById('animal-count').textContent = gameState.collectedAnimals.length;
    document.getElementById('score-display').textContent = gameState.score;
    
    // Update collection display
    const collectedContainer = document.getElementById('collected-animals');
    collectedContainer.innerHTML = gameState.collectedAnimals.map(animal => `
        <div class="collected-item" title="${animal.name}">
            <div class="emoji">${animal.emoji}</div>
            <div class="name">${animal.name}</div>
        </div>
    `).join('');
}

// End Game
function endGame() {
    gameState.gameOver = true;
    
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreText = document.getElementById('final-score-text');
    const finalCollection = document.getElementById('final-collection');
    
    finalScoreText.textContent = `Final Score: ${gameState.score}`;
    
    finalCollection.innerHTML = gameState.collectedAnimals.map(animal => `
        <div class="final-item">
            <div class="emoji">${animal.emoji}</div>
            <div class="name">${animal.name}</div>
            <div class="rarity">${'⭐'.repeat(animal.rarity)}</div>
        </div>
    `).join('');
    
    gameOverScreen.classList.remove('hidden');
}

// Game Loop
let lastTime = Date.now();

function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    if (!gameState.gameOver) {
        updatePlayerPosition(deltaTime);
        updateCamera();
        checkAnimalInteractions();
    }
    
    render();
    requestAnimationFrame(gameLoop);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    updateCamera();
});

// Start Game
document.addEventListener('DOMContentLoaded', initGame);
