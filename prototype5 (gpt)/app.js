// Agent: ChatGPT 5.4 Xhigh, time taken: 12min11, app.js 923 lines

const WORLD = {
	width: 2400,
	height: 1800,
	revealRadius: 215,
	interactRadius: 108,
	trackerRadius: 420,
	joystickRadius: 72,
	joystickThreshold: 10,
	goalCount: 6
};

const rarityConfig = {
	common: {
		label: "Common",
		color: "#77b05f",
		shadow: "rgba(119, 176, 95, 0.26)",
		points: [85, 120],
		spawnBand: [220, 650]
	},
	uncommon: {
		label: "Uncommon",
		color: "#e29f4a",
		shadow: "rgba(226, 159, 74, 0.26)",
		points: [140, 205],
		spawnBand: [480, 900]
	},
	rare: {
		label: "Rare",
		color: "#d85c52",
		shadow: "rgba(216, 92, 82, 0.24)",
		points: [250, 340],
		spawnBand: [760, 1180]
	},
	mythic: {
		label: "Mythic",
		color: "#5474ce",
		shadow: "rgba(84, 116, 206, 0.24)",
		points: [410, 560],
		spawnBand: [980, 1450]
	}
};

const speciesPool = [
	{ key: "rabbit", name: "Rabbit", emoji: "🐇", rarity: "common", hideout: "clover patch" },
	{ key: "duck", name: "Duck", emoji: "🦆", rarity: "common", hideout: "puddle ring" },
	{ key: "turtle", name: "Turtle", emoji: "🐢", rarity: "common", hideout: "warm stone pond" },
	{ key: "squirrel", name: "Squirrel", emoji: "🐿️", rarity: "common", hideout: "acorn grove" },
	{ key: "hedgehog", name: "Hedgehog", emoji: "🦔", rarity: "common", hideout: "fern circle" },
	{ key: "goat", name: "Goat", emoji: "🐐", rarity: "common", hideout: "breezy ridge" },
	{ key: "frog", name: "Frog", emoji: "🐸", rarity: "common", hideout: "lily pocket" },
	{ key: "lamb", name: "Lamb", emoji: "🐑", rarity: "common", hideout: "daisy field" },
	{ key: "fox", name: "Fox", emoji: "🦊", rarity: "uncommon", hideout: "berry hollow" },
	{ key: "deer", name: "Deer", emoji: "🦌", rarity: "uncommon", hideout: "willow trail" },
	{ key: "otter", name: "Otter", emoji: "🦦", rarity: "uncommon", hideout: "river curl" },
	{ key: "peacock", name: "Peacock", emoji: "🦚", rarity: "uncommon", hideout: "sun garden" },
	{ key: "koala", name: "Koala", emoji: "🐨", rarity: "uncommon", hideout: "eucalyptus corner" },
	{ key: "raccoon", name: "Raccoon", emoji: "🦝", rarity: "uncommon", hideout: "lantern stump" },
	{ key: "swan", name: "Swan", emoji: "🦢", rarity: "uncommon", hideout: "mirror pond" },
	{ key: "llama", name: "Llama", emoji: "🦙", rarity: "uncommon", hideout: "wind terrace" },
	{ key: "panda", name: "Panda", emoji: "🐼", rarity: "rare", hideout: "bamboo pocket" },
	{ key: "owl", name: "Owl", emoji: "🦉", rarity: "rare", hideout: "moonshade tree" },
	{ key: "flamingo", name: "Flamingo", emoji: "🦩", rarity: "rare", hideout: "rose marsh" },
	{ key: "seal", name: "Seal", emoji: "🦭", rarity: "rare", hideout: "misty pool" },
	{ key: "dolphin", name: "Dolphin", emoji: "🐬", rarity: "rare", hideout: "splash spring" },
	{ key: "parrot", name: "Parrot", emoji: "🦜", rarity: "rare", hideout: "mango perch" },
	{ key: "leopard", name: "Leopard", emoji: "🐆", rarity: "rare", hideout: "amber grass" },
	{ key: "kangaroo", name: "Kangaroo", emoji: "🦘", rarity: "rare", hideout: "long-hop plain" },
	{ key: "elephant", name: "Elephant", emoji: "🐘", rarity: "mythic", hideout: "echo field" },
	{ key: "giraffe", name: "Giraffe", emoji: "🦒", rarity: "mythic", hideout: "golden lookout" },
	{ key: "tiger", name: "Tiger", emoji: "🐅", rarity: "mythic", hideout: "striped meadow" },
	{ key: "gorilla", name: "Gorilla", emoji: "🦍", rarity: "mythic", hideout: "thunder grove" },
	{ key: "zebra", name: "Zebra", emoji: "🦓", rarity: "mythic", hideout: "horizon run" },
	{ key: "rhino", name: "Rhino", emoji: "🦏", rarity: "mythic", hideout: "dusty flats" }
];

const personalities = [
	"curious",
	"gentle",
	"bold",
	"shy",
	"playful",
	"sunny",
	"wise",
	"mischievous",
	"patient",
	"spirited",
	"dreamy",
	"clever",
	"steady",
	"dramatic"
];

const traits = [
	"collects perfect pebbles",
	"knows a shortcut through the tall grass",
	"poses proudly for every snapshot",
	"shares lucky leaves with new friends",
	"hums before every adventure",
	"guards the coziest napping spots",
	"spins in tiny circles when excited",
	"spots puddles before anyone else",
	"keeps a secret list of pretty flowers",
	"leaves treasure trails in the dirt",
	"sings to passing clouds at sunrise",
	"loves cloud-watching in the open meadow"
];

const favoriteThings = [
	"amber berries",
	"cool puddles",
	"soft clover",
	"wildflower perfume",
	"windy ridges",
	"sun-warmed stones",
	"sparkly streams",
	"quiet shade",
	"butterfly shadows",
	"mossy paths"
];

const namePrefixes = [
	"Mossy",
	"Golden",
	"Pebble",
	"Sunlit",
	"Dapple",
	"Breezy",
	"Velvet",
	"Maple",
	"Starry",
	"Clover",
	"River",
	"Honey",
	"Willow",
	"Rustle"
];

const decorEmojis = ["🌿", "🌼", "🍄", "🌸", "🍀", "🌾", "🪨"];
const habitatColors = [
	"rgba(255, 230, 178, 0.28)",
	"rgba(127, 185, 96, 0.2)",
	"rgba(120, 198, 221, 0.18)",
	"rgba(244, 185, 108, 0.18)"
];
const directionGlyph = { north: "↑", south: "↓", east: "→", west: "←" };
const rarityRank = { common: 1, uncommon: 2, rare: 3, mythic: 4 };

const refs = {
	gameView: document.getElementById("gameView"),
	world: document.getElementById("world"),
	decorLayer: document.getElementById("decorLayer"),
	animalLayer: document.getElementById("animalLayer"),
	player: document.getElementById("player"),
	playerCompass: document.getElementById("playerCompass"),
	joystick: document.getElementById("joystick"),
	joystickKnob: document.getElementById("joystickKnob"),
	trackerText: document.getElementById("trackerText"),
	scoreValue: document.getElementById("scoreValue"),
	teamValue: document.getElementById("teamValue"),
	rarestValue: document.getElementById("rarestValue"),
	encounterTitle: document.getElementById("encounterTitle"),
	encounterCopy: document.getElementById("encounterCopy"),
	encounterRarity: document.getElementById("encounterRarity"),
	encounterPoints: document.getElementById("encounterPoints"),
	befriendButton: document.getElementById("befriendButton"),
	collectionGrid: document.getElementById("collectionGrid"),
	toast: document.getElementById("toast"),
	endOverlay: document.getElementById("endOverlay"),
	endSummary: document.getElementById("endSummary"),
	finalTeam: document.getElementById("finalTeam"),
	restartButton: document.getElementById("restartButton")
};

const state = {
	player: {
		x: WORLD.width / 2,
		y: WORLD.height / 2,
		speed: 0,
		direction: "south",
		moving: false
	},
	joystick: {
		pointerId: null,
		armed: false,
		visible: false,
		originX: 0,
		originY: 0,
		magnitude: 0,
		direction: null,
		knobX: 0,
		knobY: 0
	},
	camera: {
		width: 0,
		height: 0,
		x: 0,
		y: 0
	},
	animals: [],
	collection: [],
	collectionSlots: [],
	lastTime: 0,
	trackerMessage: "",
	activeEncounterId: null,
	gameOver: false,
	toastTimer: null
};

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
	return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
	return Math.floor(randomBetween(min, max + 1));
}

function pick(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
	const copy = [...list];
	for (let index = copy.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
	}
	return copy;
}

function distanceBetween(x1, y1, x2, y2) {
	return Math.hypot(x2 - x1, y2 - y1);
}

function setText(element, value) {
	if (element.textContent !== value) {
		element.textContent = value;
	}
}

function setTrackerMessage(message) {
	if (state.trackerMessage !== message) {
		state.trackerMessage = message;
		refs.trackerText.textContent = message;
	}
}

function showToast(message) {
	refs.toast.textContent = message;
	refs.toast.classList.add("is-visible");

	if (state.toastTimer) {
		clearTimeout(state.toastTimer);
	}

	state.toastTimer = window.setTimeout(() => {
		refs.toast.classList.remove("is-visible");
	}, 1850);
}

function buildCollectionSlots() {
	refs.collectionGrid.innerHTML = "";
	state.collectionSlots = [];

	for (let index = 0; index < WORLD.goalCount; index += 1) {
		const slot = document.createElement("article");
		slot.className = "collection-slot";
		slot.innerHTML = `
			<div class="slot-index">Frame ${index + 1}</div>
			<div class="slot-avatar">📷</div>
			<div class="slot-title">Empty frame</div>
			<div class="slot-meta">Find a hidden friend</div>
			<div class="slot-trait">Rarer animals score more, but hide farther from camp.</div>
		`;
		refs.collectionGrid.appendChild(slot);
		state.collectionSlots.push(slot);
	}
}

function updateCollectionSlots() {
	state.collectionSlots.forEach((slot, index) => {
		const animal = state.collection[index];
		const avatar = slot.querySelector(".slot-avatar");
		const title = slot.querySelector(".slot-title");
		const meta = slot.querySelector(".slot-meta");
		const trait = slot.querySelector(".slot-trait");

		if (!animal) {
			slot.classList.remove("is-filled");
			slot.style.setProperty("--card-accent", "rgba(199, 183, 152, 0.3)");
			slot.style.setProperty("--card-shadow", "rgba(190, 177, 157, 0.2)");
			avatar.textContent = "📷";
			title.textContent = "Empty frame";
			meta.textContent = "Find a hidden friend";
			trait.textContent = "Rarer animals score more, but hide farther from camp.";
			return;
		}

		slot.classList.add("is-filled");
		slot.style.setProperty("--card-accent", animal.shadow);
		slot.style.setProperty("--card-shadow", animal.shadow);
		avatar.textContent = animal.emoji;
		title.textContent = animal.nickname;
		meta.textContent = `${animal.rarityLabel} • ${animal.points} pts`;
		trait.textContent = `${animal.personality}, ${animal.trait}. Loves ${animal.favoriteThing}.`;
	});
}

function updateHud() {
	refs.scoreValue.textContent = String(state.score);
	refs.teamValue.textContent = `${state.collection.length} / ${WORLD.goalCount}`;

	if (!state.collection.length) {
		refs.rarestValue.textContent = "No friends yet";
		return;
	}

	const topFriend = [...state.collection].sort((left, right) => {
		const rarityGap = rarityRank[right.rarity] - rarityRank[left.rarity];
		return rarityGap || right.points - left.points;
	})[0];

	refs.rarestValue.textContent = `Rarest friend: ${topFriend.nickname} ${topFriend.emoji} · ${topFriend.rarityLabel}`;
}

function buildDecor() {
	refs.decorLayer.innerHTML = "";
	const fragment = document.createDocumentFragment();

	for (let index = 0; index < 12; index += 1) {
		const patch = document.createElement("div");
		patch.className = "habitat-patch";
		patch.style.left = `${randomInt(120, WORLD.width - 120)}px`;
		patch.style.top = `${randomInt(120, WORLD.height - 120)}px`;
		patch.style.width = `${randomInt(180, 320)}px`;
		patch.style.height = `${randomInt(110, 210)}px`;
		patch.style.background = pick(habitatColors);
		patch.style.transform = `translate(-50%, -50%) rotate(${randomInt(-25, 25)}deg)`;
		fragment.appendChild(patch);
	}

	for (let index = 0; index < 88; index += 1) {
		const decor = document.createElement("div");
		decor.className = "decor";
		decor.textContent = pick(decorEmojis);
		decor.style.left = `${randomInt(48, WORLD.width - 48)}px`;
		decor.style.top = `${randomInt(48, WORLD.height - 48)}px`;
		decor.style.fontSize = `${randomInt(18, 40)}px`;
		decor.style.opacity = String(randomBetween(0.52, 0.95));
		fragment.appendChild(decor);
	}

	refs.decorLayer.appendChild(fragment);
}

function chooseSpecies() {
	const grouped = speciesPool.reduce((map, animal) => {
		if (!map[animal.rarity]) {
			map[animal.rarity] = [];
		}

		map[animal.rarity].push(animal);
		return map;
	}, {});

	return shuffle([
		...shuffle(grouped.common).slice(0, 4),
		...shuffle(grouped.uncommon).slice(0, 3),
		...shuffle(grouped.rare).slice(0, 2),
		...shuffle(grouped.mythic).slice(0, 1)
	]);
}

function generateNickname(species, usedNames) {
	for (let attempt = 0; attempt < 20; attempt += 1) {
		const candidate = `${pick(namePrefixes)} ${species.name}`;
		if (!usedNames.has(candidate)) {
			usedNames.add(candidate);
			return candidate;
		}
	}

	const fallback = `${species.name} ${usedNames.size + 1}`;
	usedNames.add(fallback);
	return fallback;
}

function createSpawnPosition(rarity, placedAnimals) {
	const [minBand, maxBand] = rarityConfig[rarity].spawnBand;

	for (let attempt = 0; attempt < 120; attempt += 1) {
		const angle = Math.random() * Math.PI * 2;
		const spread = randomBetween(minBand, maxBand);
		const x = clamp(
			WORLD.width / 2 + Math.cos(angle) * spread + randomBetween(-120, 120),
			96,
			WORLD.width - 96
		);
		const y = clamp(
			WORLD.height / 2 + Math.sin(angle) * spread * 0.78 + randomBetween(-110, 110),
			96,
			WORLD.height - 96
		);

		const farEnough = placedAnimals.every((animal) => distanceBetween(animal.x, animal.y, x, y) > 170);
		if (farEnough) {
			return { x, y };
		}
	}

	return {
		x: randomInt(120, WORLD.width - 120),
		y: randomInt(120, WORLD.height - 120)
	};
}

function createAnimalRecord(species, index, usedNames, placedAnimals) {
	const rarity = rarityConfig[species.rarity];
	const position = createSpawnPosition(species.rarity, placedAnimals);
	const points = randomInt(rarity.points[0], rarity.points[1]);
	const personality = pick(personalities);
	const trait = pick(traits);
	const favoriteThing = pick(favoriteThings);
	const nickname = generateNickname(species, usedNames);

	return {
		id: `${species.key}-${index}`,
		species,
		x: position.x,
		y: position.y,
		nickname,
		points,
		rarity: species.rarity,
		rarityLabel: rarity.label,
		color: rarity.color,
		shadow: rarity.shadow,
		personality,
		trait,
		favoriteThing,
		revealed: false,
		befriended: false,
		isNear: false,
		distance: Infinity,
		element: null,
		avatarElement: null,
		nameElement: null,
		rarityElement: null
	};
}

function createAnimalElement(animal) {
	const card = document.createElement("article");
	card.className = "animal";
	card.style.left = `${animal.x}px`;
	card.style.top = `${animal.y}px`;
	card.style.setProperty("--rarity-color", animal.color);
	card.style.setProperty("--rarity-shadow", animal.shadow);
	card.innerHTML = `
		<div class="animal-shadow"></div>
		<span class="animal-avatar"></span>
		<div class="animal-label">
			<span class="animal-name"></span>
			<span class="animal-rarity"></span>
		</div>
	`;

	animal.element = card;
	animal.avatarElement = card.querySelector(".animal-avatar");
	animal.nameElement = card.querySelector(".animal-name");
	animal.rarityElement = card.querySelector(".animal-rarity");

	updateAnimalVisual(animal);
	refs.animalLayer.appendChild(card);
}

function updateAnimalVisual(animal) {
	if (!animal.element) {
		return;
	}

	animal.element.classList.toggle("is-revealed", animal.revealed);
	animal.element.classList.toggle("is-near", animal.isNear);
	animal.element.classList.toggle("is-befriended", animal.befriended);

	if (animal.befriended) {
		animal.element.setAttribute("aria-hidden", "true");
	}

	animal.avatarElement.textContent = animal.revealed ? animal.species.emoji : "🌿";
	animal.nameElement.textContent = animal.revealed ? animal.nickname : "Hidden";
	animal.rarityElement.textContent = animal.revealed ? animal.rarityLabel : "Rustle";
}

function buildAnimals() {
	refs.animalLayer.innerHTML = "";
	state.animals = [];

	const usedNames = new Set();
	const selectedSpecies = chooseSpecies();

	selectedSpecies.forEach((species, index) => {
		const animal = createAnimalRecord(species, index, usedNames, state.animals);
		state.animals.push(animal);
		createAnimalElement(animal);
	});
}

function updateViewportBounds() {
	state.camera.width = refs.gameView.clientWidth;
	state.camera.height = refs.gameView.clientHeight;
}

function setJoystickVisibility(visible) {
	state.joystick.visible = visible;
	refs.joystick.classList.toggle("is-visible", visible);
}

function resetJoystick() {
	state.joystick.pointerId = null;
	state.joystick.armed = false;
	state.joystick.magnitude = 0;
	state.joystick.direction = null;
	state.joystick.knobX = 0;
	state.joystick.knobY = 0;
	refs.joystickKnob.style.transform = "translate(0px, 0px)";
	setJoystickVisibility(false);
}

function getPointerPosition(event) {
	const rect = refs.gameView.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

function updateJoystickVector(deltaX, deltaY) {
	const distance = Math.hypot(deltaX, deltaY);
	const limitedDistance = Math.min(distance, WORLD.joystickRadius);
	const angle = Math.atan2(deltaY, deltaX);

	state.joystick.knobX = Math.cos(angle) * limitedDistance;
	state.joystick.knobY = Math.sin(angle) * limitedDistance;
	state.joystick.magnitude = clamp(limitedDistance / WORLD.joystickRadius, 0, 1);

	if (state.joystick.magnitude < 0.18) {
		state.joystick.direction = null;
	} else if (Math.abs(deltaX) > Math.abs(deltaY)) {
		state.joystick.direction = deltaX > 0 ? "east" : "west";
	} else {
		state.joystick.direction = deltaY > 0 ? "south" : "north";
	}

	refs.joystickKnob.style.transform = `translate(${state.joystick.knobX}px, ${state.joystick.knobY}px)`;
}

function handlePointerDown(event) {
	if (state.gameOver || event.button > 0 || state.joystick.pointerId !== null) {
		return;
	}

	state.joystick.pointerId = event.pointerId;
	state.joystick.armed = true;

	const { x, y } = getPointerPosition(event);
	state.joystick.originX = x;
	state.joystick.originY = y;
	refs.joystick.style.left = `${x}px`;
	refs.joystick.style.top = `${y}px`;
	refs.gameView.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
	if (event.pointerId !== state.joystick.pointerId || !state.joystick.armed) {
		return;
	}

	const { x, y } = getPointerPosition(event);
	const deltaX = x - state.joystick.originX;
	const deltaY = y - state.joystick.originY;

	if (!state.joystick.visible && Math.hypot(deltaX, deltaY) < WORLD.joystickThreshold) {
		return;
	}

	if (!state.joystick.visible) {
		setJoystickVisibility(true);
	}

	updateJoystickVector(deltaX, deltaY);
}

function handlePointerEnd(event) {
	if (event.pointerId !== state.joystick.pointerId) {
		return;
	}

	if (refs.gameView.hasPointerCapture(event.pointerId)) {
		refs.gameView.releasePointerCapture(event.pointerId);
	}

	resetJoystick();
}

function updatePlayer(deltaSeconds) {
	if (state.gameOver || !state.joystick.direction || !state.joystick.visible) {
		state.player.speed = 0;
		state.player.moving = false;
		refs.player.classList.remove("is-moving");
		return;
	}

	const minSpeed = 70;
	const maxSpeed = 215;
	state.player.speed = minSpeed + (maxSpeed - minSpeed) * state.joystick.magnitude;
	state.player.direction = state.joystick.direction;
	state.player.moving = true;

	const distance = state.player.speed * deltaSeconds;

	if (state.player.direction === "north") {
		state.player.y -= distance;
	} else if (state.player.direction === "south") {
		state.player.y += distance;
	} else if (state.player.direction === "west") {
		state.player.x -= distance;
	} else if (state.player.direction === "east") {
		state.player.x += distance;
	}

	state.player.x = clamp(state.player.x, 56, WORLD.width - 56);
	state.player.y = clamp(state.player.y, 56, WORLD.height - 56);
	refs.player.classList.add("is-moving");
}

function renderPlayer() {
	refs.player.style.left = `${state.player.x}px`;
	refs.player.style.top = `${state.player.y}px`;
	refs.playerCompass.textContent = directionGlyph[state.player.direction];
}

function updateCamera() {
	state.camera.x = clamp(state.player.x - state.camera.width / 2, 0, WORLD.width - state.camera.width);
	state.camera.y = clamp(state.player.y - state.camera.height / 2, 0, WORLD.height - state.camera.height);
	refs.world.style.transform = `translate(${-state.camera.x}px, ${-state.camera.y}px)`;
}

function describeDirection(target) {
	if (!target) {
		return "somewhere nearby";
	}

	const deltaX = target.x - state.player.x;
	const deltaY = target.y - state.player.y;
	if (Math.abs(deltaX) > Math.abs(deltaY)) {
		return deltaX > 0 ? "east" : "west";
	}

	return deltaY > 0 ? "south" : "north";
}

function findNearestRemainingAnimal() {
	let nearest = null;

	state.animals.forEach((animal) => {
		if (animal.befriended) {
			return;
		}

		const currentDistance = distanceBetween(state.player.x, state.player.y, animal.x, animal.y);
		animal.distance = currentDistance;

		if (!nearest || currentDistance < nearest.distance) {
			nearest = animal;
		}
	});

	return nearest;
}

function updateEncounterPanel(encounter, nearest) {
	if (state.gameOver) {
		refs.befriendButton.disabled = true;
		refs.befriendButton.textContent = "Safari complete";
		refs.encounterRarity.removeAttribute("data-rarity");
		setText(refs.encounterTitle, "Adventure complete");
		setText(refs.encounterCopy, "Your team is full. Check the final album and head out again for a different mix of hidden animals.");
		setText(refs.encounterRarity, "Finished");
		setText(refs.encounterPoints, `${state.score} pts`);
		return;
	}

	if (encounter) {
		refs.befriendButton.disabled = false;
		refs.befriendButton.textContent = `Befriend ${encounter.species.name}`;
		refs.encounterRarity.dataset.rarity = encounter.rarity;
		setText(refs.encounterTitle, `${encounter.nickname} ${encounter.species.emoji}`);
		setText(
			refs.encounterCopy,
			`${encounter.nickname} is ${encounter.personality}, ${encounter.trait}, and loves ${encounter.favoriteThing} around the ${encounter.species.hideout}.`
		);
		setText(refs.encounterRarity, encounter.rarityLabel);
		setText(refs.encounterPoints, `${encounter.points} pts`);
		return;
	}

	refs.befriendButton.disabled = true;
	refs.befriendButton.textContent = "Befriend";
	refs.encounterRarity.removeAttribute("data-rarity");

	if (nearest) {
		const direction = describeDirection(nearest);
		const roundedDistance = Math.round(nearest.distance / 12);
		const hiddenHint = nearest.revealed
			? `${nearest.nickname} is ${direction}, about ${roundedDistance} steps away.`
			: `A rustle is ${direction}, about ${roundedDistance} steps away.`;

		setText(refs.encounterTitle, nearest.revealed ? "Animal nearby" : "Follow the rustle");
		setText(refs.encounterCopy, `${hiddenHint} Close the gap and the journal will open a befriending prompt.`);
	} else {
		setText(refs.encounterTitle, "No animal in range");
		setText(refs.encounterCopy, "All hidden friends have been met. Fill your album to finish the run.");
	}

	setText(refs.encounterRarity, "Explorer Tip");
	setText(refs.encounterPoints, `${WORLD.goalCount - state.collection.length} slots left`);
}

function updateAwareness() {
	let encounter = null;
	const nearest = findNearestRemainingAnimal();

	state.animals.forEach((animal) => {
		if (animal.befriended) {
			animal.isNear = false;
			updateAnimalVisual(animal);
			return;
		}

		if (!animal.revealed && animal.distance <= WORLD.revealRadius) {
			animal.revealed = true;
			showToast(`You spotted ${animal.nickname} ${animal.species.emoji}`);
			updateAnimalVisual(animal);
		}

		const inRange = animal.revealed && animal.distance <= WORLD.interactRadius;
		animal.isNear = inRange;
		updateAnimalVisual(animal);

		if (inRange && (!encounter || animal.distance < encounter.distance)) {
			encounter = animal;
		}
	});

	state.activeEncounterId = encounter ? encounter.id : null;

	if (nearest) {
		const direction = describeDirection(nearest);
		const roundedDistance = Math.round(nearest.distance / 12);
		const trackerMessage = encounter
			? `${encounter.nickname} is close. Tap Befriend to add them to your album.`
			: nearest.revealed
				? `${nearest.nickname} is ${direction}. Walk closer for a photo-friendly greeting.`
				: `Tracker points ${direction}. Something hidden is about ${roundedDistance} steps away.`;
		setTrackerMessage(trackerMessage);
	} else {
		setTrackerMessage("Your trail is quiet now. Fill the album or restart for a new safari route.");
	}

	updateEncounterPanel(encounter, nearest);
}

function befriendActiveAnimal() {
	if (!state.activeEncounterId || state.gameOver) {
		return;
	}

	const animal = state.animals.find((entry) => entry.id === state.activeEncounterId);
	if (!animal || animal.befriended || animal.distance > WORLD.interactRadius) {
		return;
	}

	animal.befriended = true;
	animal.isNear = false;
	updateAnimalVisual(animal);

	const friendRecord = {
		id: animal.id,
		emoji: animal.species.emoji,
		speciesName: animal.species.name,
		nickname: animal.nickname,
		rarity: animal.rarity,
		rarityLabel: animal.rarityLabel,
		personality: animal.personality,
		trait: animal.trait,
		favoriteThing: animal.favoriteThing,
		points: animal.points,
		shadow: animal.shadow
	};

	state.collection.push(friendRecord);
	state.score += animal.points;
	updateCollectionSlots();
	updateHud();

	window.setTimeout(() => {
		if (animal.element) {
			animal.element.style.display = "none";
		}
	}, 240);

	showToast(`${animal.nickname} joined your safari team for ${animal.points} points.`);

	if (state.collection.length >= WORLD.goalCount) {
		endGame();
		return;
	}

	updateAwareness();
}

function buildFinalTeam() {
	refs.finalTeam.innerHTML = "";

	state.collection.forEach((animal) => {
		const card = document.createElement("article");
		card.className = "final-card";
		card.style.setProperty("--card-accent", animal.shadow);
		card.style.setProperty("--card-shadow", animal.shadow);
		card.innerHTML = `
			<div class="slot-avatar">${animal.emoji}</div>
			<div class="slot-title">${animal.nickname}</div>
			<div class="slot-meta">${animal.rarityLabel} • ${animal.points} pts</div>
			<div class="slot-trait">${animal.personality}, ${animal.trait}.</div>
		`;
		refs.finalTeam.appendChild(card);
	});
}

function endGame() {
	state.gameOver = true;
	resetJoystick();
	updateEncounterPanel(null, null);
	buildFinalTeam();

	const bestFriend = [...state.collection].sort((left, right) => {
		const rarityGap = rarityRank[right.rarity] - rarityRank[left.rarity];
		return rarityGap || right.points - left.points;
	})[0];

	refs.endSummary.textContent = `You found six different animal friends and finished with ${state.score} points. Your rarest photo was ${bestFriend.nickname} the ${bestFriend.rarityLabel.toLowerCase()} ${bestFriend.speciesName.toLowerCase()}.`;
	refs.endOverlay.classList.remove("hidden");
	setTrackerMessage(`Safari complete. Final score: ${state.score}.`);
	showToast(`Safari complete with ${state.score} points.`);
}

function startGame() {
	state.lastTime = 0;
	state.player.x = WORLD.width / 2;
	state.player.y = WORLD.height / 2;
	state.player.direction = "south";
	state.player.speed = 0;
	state.player.moving = false;
	state.collection = [];
	state.activeEncounterId = null;
	state.gameOver = false;
	state.score = 0;
	refs.endOverlay.classList.add("hidden");
	refs.finalTeam.innerHTML = "";

	buildCollectionSlots();
	updateCollectionSlots();
	updateHud();
	buildDecor();
	buildAnimals();
	updateViewportBounds();
	updateCamera();
	renderPlayer();
	setTrackerMessage("Touch and drag anywhere inside the meadow to summon the joystick and start exploring.");
	updateEncounterPanel(null, findNearestRemainingAnimal());
	showToast("Find six hidden animals and build your safari photo team.");
}

function frame(timestamp) {
	if (!state.lastTime) {
		state.lastTime = timestamp;
	}

	const deltaSeconds = Math.min((timestamp - state.lastTime) / 1000, 0.032);
	state.lastTime = timestamp;

	updatePlayer(deltaSeconds);
	renderPlayer();
	updateAwareness();
	updateCamera();
	window.requestAnimationFrame(frame);
}

function attachEvents() {
	refs.gameView.addEventListener("pointerdown", handlePointerDown);
	refs.gameView.addEventListener("pointermove", handlePointerMove);
	refs.gameView.addEventListener("pointerup", handlePointerEnd);
	refs.gameView.addEventListener("pointercancel", handlePointerEnd);
	refs.gameView.addEventListener("lostpointercapture", handlePointerEnd);
	refs.gameView.addEventListener("contextmenu", (event) => event.preventDefault());
	refs.befriendButton.addEventListener("click", befriendActiveAnimal);
	refs.restartButton.addEventListener("click", startGame);
	window.addEventListener("resize", updateViewportBounds);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			resetJoystick();
		}
	});
}

attachEvents();
startGame();
window.requestAnimationFrame(frame);
