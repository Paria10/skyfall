const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const metresValue = document.querySelector('#metres-value');
const runCounters = document.querySelector('.run-counters');
const levelProgress = document.querySelector('#level-progress');
const selectedOption = document.querySelector('#selected-option');
const headerHighScore = document.querySelector('#header-high-score');
const gameOver = document.querySelector('#game-over');
const retryButton = document.querySelector('#retry-button');
const nextLevelButton = document.querySelector('#next-level-button');
const gameOverMetres = document.querySelector('#game-over-metres');
const highScoreValue = document.querySelector('#high-score');
const confetti = document.querySelector('#confetti');
const menuButton = document.querySelector('#menu-button');
const gameMenu = document.querySelector('#game-menu');
const freePlayButton = document.querySelector('#free-play-button');
const levelOneButton = document.querySelector('#level-one-button');
const playButton = document.querySelector('#play-button');
const restartButton = document.querySelector('#restart-button');
const countdown = document.querySelector('#countdown');
const runEndedLabel = document.querySelector('#run-ended-label');

const level = {
  targetDistance: 1000,
  distancePerSecond: 16.7,
  speedIncreaseInterval: 5,
  speedMultiplier: 1.2,
  pathTopWidth: 0.14,
  pathBottomWidth: 0.42,
  curveStartGap: { min: 8, max: 14 },
  curveGap: { min: 7, max: 13 },
  curveBendLength: { min: 3, max: 5 },
  curveReturnLength: { min: 3, max: 5 },
  curveIntensity: { min: 0.09, max: 0.19 },
  obstacleOffsets: [-.56, 0, .56],
  obstacleGap: { min: 38, max: 58 },
};

const LEVELS = {
  level1: {
    targetMetres: 50,
    obstacleOffsets: [0, -.56, -.56, .56, -.56, .56, .56, 0],
    obstacleSpacing: 6,
  },
};

const PATH_LINE_SPACING = 78;
const PATH_SCROLL_PER_DISTANCE = 4.4;
const PATH_START_Y = -70;
const HIGH_SCORE_KEY_PREFIX = 'skyfall-high-score';
const LEGACY_HIGH_SCORE_KEY = 'skyfall-high-score';
const LEVEL_ONE_COMPLETE_KEY = 'skyfall-level-one-complete';

function highScoreKey(gameType) {
  return `${HIGH_SCORE_KEY_PREFIX}-${gameType}`;
}

function loadHighScore(gameType) {
  try {
    const savedScore = localStorage.getItem(highScoreKey(gameType));
    const legacyScore = gameType === 'freeplay' ? localStorage.getItem(LEGACY_HIGH_SCORE_KEY) : null;
    return Math.max(0, Number.parseInt(savedScore ?? legacyScore, 10) || 0);
  } catch {
    return 0;
  }
}

let highScore = loadHighScore('freeplay');

function loadLevelOneCompletion() {
  try {
    return localStorage.getItem(LEVEL_ONE_COMPLETE_KEY) === 'true';
  } catch {
    return false;
  }
}

let levelOneComplete = loadLevelOneCompletion();

function renderHighScore() {
  headerHighScore.textContent = `High score: ${highScore}m`;
}

function getMetres() {
  return Math.floor((state.distance * PATH_SCROLL_PER_DISTANCE) / PATH_LINE_SPACING);
}

function updateHighScore(metres) {
  highScore = metres;
  renderHighScore();
  try {
    localStorage.setItem(highScoreKey(state.gameType), String(highScore));
  } catch {
    // Continue without persistence when browser storage is unavailable.
  }
}

const state = {
  distance: 0,
  playerOffset: 0,
  velocity: 0,
  keys: new Set(),
  lastFrame: 0,
  width: 0,
  height: 0,
  pixelRatio: 1,
  elapsed: 0,
  obstacles: [],
  nextObstacleDistance: 0,
  mode: 'ready',
  countdown: 3,
  newHighScore: false,
  curves: [],
  nextCurveMetres: 0,
  gameType: 'freeplay',
};

function activeLevel() {
  return state.gameType === 'freeplay' ? null : LEVELS[state.gameType];
}

function updateNextLevelButton() {
  nextLevelButton.hidden = !(state.gameType === 'level1' && levelOneComplete);
}

function markLevelOneComplete() {
  levelOneComplete = true;
  try {
    localStorage.setItem(LEVEL_ONE_COMPLETE_KEY, 'true');
  } catch {
    // Continue without persistence when browser storage is unavailable.
  }
}

function updateSelectedOption() {
  const selectedLevel = activeLevel();
  selectedOption.textContent = selectedLevel ? 'Level 1' : 'Free Play';
  runCounters.classList.toggle('is-level', Boolean(selectedLevel));
  levelProgress.hidden = !selectedLevel;
  levelProgress.textContent = '0%';
  updateNextLevelButton();
}

function loadSelectedHighScore() {
  highScore = loadHighScore(state.gameType);
  renderHighScore();
}

function updateLevelProgress(metres) {
  const selectedLevel = activeLevel();
  if (!selectedLevel) return;
  levelProgress.textContent = `${Math.min(100, Math.floor((metres / selectedLevel.targetMetres) * 100))}%`;
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  state.width = bounds.width;
  state.height = bounds.height;
  canvas.width = Math.round(bounds.width * state.pixelRatio);
  canvas.height = Math.round(bounds.height * state.pixelRatio);
  context.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
}

function pathHalfWidthAt(y) {
  const depth = Math.max(0, Math.min(1, y / state.height));
  const width = level.pathTopWidth + (level.pathBottomWidth - level.pathTopWidth) * depth;
  return state.width * width;
}

function smoothstep(value) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function trackScrollAt(y) {
  return state.distance * PATH_SCROLL_PER_DISTANCE - (y - PATH_START_Y);
}

function pathCenterAt(y) {
  const trackScroll = trackScrollAt(y);
  const curveOffset = state.curves.reduce((offset, curve) => {
    const start = curve.startMetres * PATH_LINE_SPACING;
    const bendEnd = start + curve.bendMetres * PATH_LINE_SPACING;
    const returnEnd = bendEnd + curve.returnMetres * PATH_LINE_SPACING;

    if (trackScroll < start || trackScroll > returnEnd) return offset;
    if (trackScroll <= bendEnd) return offset + smoothstep((trackScroll - start) / (bendEnd - start)) * curve.offset;
    return offset + (1 - smoothstep((trackScroll - bendEnd) / (returnEnd - bendEnd))) * curve.offset;
  }, 0);

  return state.width / 2 + state.width * curveOffset;
}

function drawPath() {
  const pathTop = PATH_START_Y;
  const pathBottom = state.height + 2;
  const slices = 48;
  const step = (pathBottom - pathTop) / slices;
  const leftEdge = [];
  const rightEdge = [];

  for (let index = 0; index <= slices; index += 1) {
    const y = pathTop + step * index;
    const center = pathCenterAt(y);
    const halfWidth = pathHalfWidthAt(y);
    leftEdge.push({ x: center - halfWidth, y });
    rightEdge.push({ x: center + halfWidth, y });
  }

  context.beginPath();
  leftEdge.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
  [...rightEdge].reverse().forEach((point) => context.lineTo(point.x, point.y));
  context.closePath();
  context.fillStyle = '#fff8df';
  context.fill();

  context.save();
  context.clip();
  const stripeSpacing = PATH_LINE_SPACING;
  const stripeHeight = 11;
  const scroll = (state.distance * PATH_SCROLL_PER_DISTANCE) % stripeSpacing;
  for (let y = -stripeSpacing + scroll; y < state.height + stripeSpacing; y += stripeSpacing) {
    context.fillStyle = 'rgba(244, 211, 145, .45)';
    context.fillRect(0, y, state.width, stripeHeight);
  }
  context.restore();

  context.strokeStyle = '#f3d792';
  context.lineWidth = 4;
  context.beginPath();
  leftEdge.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
  context.stroke();
  context.beginPath();
  rightEdge.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
  context.stroke();
}

function drawBall() {
  const restingY = state.height * 0.76;
  const bounce = Math.abs(Math.sin(state.elapsed * 7.2)) * 7;
  const y = restingY - bounce;
  const radius = Math.min(27, Math.max(18, state.width * 0.053));
  const x = pathCenterAt(restingY) + state.playerOffset;

  context.beginPath();
  context.ellipse(x, restingY + radius * 1.05, radius * .9, radius * .3, 0, 0, Math.PI * 2);
  context.fillStyle = 'rgba(89, 124, 106, .20)';
  context.fill();

  const ball = context.createRadialGradient(x - radius * .32, y - radius * .42, radius * .1, x, y, radius * 1.1);
  ball.addColorStop(0, '#fff8f3');
  ball.addColorStop(.24, '#ffc2ad');
  ball.addColorStop(1, '#f38777');
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = ball;
  context.fill();
  context.strokeStyle = 'rgba(255, 255, 255, .75)';
  context.lineWidth = 3;
  context.stroke();
}

function getObstacleBaseY(obstacle) {
  const pathStart = PATH_START_Y;
  const exitMargin = Math.max(120, state.width * .18);
  const pathTravelLength = state.height - pathStart + exitMargin;
  const pathScroll = state.distance * PATH_SCROLL_PER_DISTANCE;
  const spawnScroll = obstacle.targetMetres === undefined
    ? obstacle.spawnScroll
    : obstacle.targetMetres * PATH_LINE_SPACING - (state.height * .76 - pathStart);
  const travel = pathScroll - spawnScroll;
  if (travel < 0 || travel > pathTravelLength) return null;
  return pathStart + travel;
}

function getCubeGeometry(obstacle, baseY) {
  const position = baseY / state.height;
  const pathHalfWidth = pathHalfWidthAt(baseY);
  const centerX = pathCenterAt(baseY) + pathHalfWidth * obstacle.offset;
  const scale = .62 + position;
  const size = Math.max(34, state.width * .11 * scale);
  const cubeHeight = size * 1.05;
  const depthY = -size * .24;
  const backWidth = size * .62;

  const frontBottomLeft = { x: centerX - size / 2, y: baseY };
  const frontBottomRight = { x: centerX + size / 2, y: baseY };
  const frontTopLeft = { x: frontBottomLeft.x, y: baseY - cubeHeight };
  const frontTopRight = { x: frontBottomRight.x, y: baseY - cubeHeight };
  const backCenterX = centerX;
  const backTopLeft = { x: backCenterX - backWidth / 2, y: frontTopLeft.y + depthY };
  const backTopRight = { x: backCenterX + backWidth / 2, y: frontTopRight.y + depthY };

  return {
    front: [frontBottomLeft, frontBottomRight, frontTopRight, frontTopLeft],
    top: [frontTopLeft, frontTopRight, backTopRight, backTopLeft],
    shadow: { centerX, baseY, size },
  };
}

function fillFace(points, color) {
  context.beginPath();
  points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.strokeStyle = 'rgba(255, 255, 255, .72)';
  context.lineWidth = 2;
  context.stroke();
}

function drawCube(obstacle, baseY) {
  const cube = getCubeGeometry(obstacle, baseY);
  const { centerX, size } = cube.shadow;

  context.beginPath();
  context.ellipse(centerX, baseY + size * .12, size * .68, size * .18, 0, 0, Math.PI * 2);
  context.fillStyle = 'rgba(89, 124, 106, .18)';
  context.fill();

  fillFace(cube.top, '#ffd5a5');
  fillFace(cube.front, '#ed927f');
}

function drawObstacles(foreground) {
  const ballY = state.height * .76 - Math.abs(Math.sin(state.elapsed * 7.2)) * 7;
  const radius = Math.min(27, Math.max(18, state.width * .053));
  state.obstacles.forEach((obstacle) => {
    const baseY = getObstacleBaseY(obstacle);
    if (baseY === null || (baseY > ballY + radius) !== foreground) return;
    drawCube(obstacle, baseY);
  });
}

function randomBetween(range) {
  return range.min + Math.random() * (range.max - range.min);
}

function addRandomCurve() {
  const direction = Math.random() < .5 ? -1 : 1;
  const bendMetres = randomBetween(level.curveBendLength);
  const returnMetres = randomBetween(level.curveReturnLength);
  state.curves.push({
    startMetres: state.nextCurveMetres,
    bendMetres,
    returnMetres,
    offset: direction * randomBetween(level.curveIntensity),
  });
  state.nextCurveMetres += bendMetres + returnMetres + randomBetween(level.curveGap);
}

function resetCurves() {
  state.curves = [];
  state.nextCurveMetres = randomBetween(level.curveStartGap);
  addRandomCurve();
}

function updateCurves() {
  const currentMetres = getMetres();
  const horizonMetres = currentMetres + 24;
  while (state.nextCurveMetres <= horizonMetres) addRandomCurve();
  state.curves = state.curves.filter((curve) => {
    const curveEnd = curve.startMetres + curve.bendMetres + curve.returnMetres;
    return curveEnd >= currentMetres - 12;
  });
}

function setupLevelObstacles() {
  const selectedLevel = activeLevel();
  if (!selectedLevel) return;
  state.obstacles = selectedLevel.obstacleOffsets.map((offset, index) => ({
    offset,
    targetMetres: (index + 1) * selectedLevel.obstacleSpacing,
  }));
}

function drawLevelEndMarker() {
  const selectedLevel = activeLevel();
  if (!selectedLevel) return;
  const baseY = getObstacleBaseY({ targetMetres: selectedLevel.targetMetres });
  if (baseY === null) return;
  const scale = Math.max(.45, Math.min(1.2, baseY / state.height));
  const fontSize = Math.max(24, state.width * .1 * scale);

  context.save();
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `900 ${fontSize}px ui-rounded, system-ui, sans-serif`;
  context.lineWidth = Math.max(2, fontSize * .16);
  context.strokeStyle = '#fffdf9';
  context.fillStyle = '#ef8c78';
  context.strokeText('THE END', pathCenterAt(baseY), baseY);
  context.fillText('THE END', pathCenterAt(baseY), baseY);
  context.restore();
}

function addObstacle() {
  const offsetIndex = Math.floor(Math.random() * level.obstacleOffsets.length);
  state.obstacles.push({
    offset: level.obstacleOffsets[offsetIndex],
    spawnScroll: state.nextObstacleDistance * PATH_SCROLL_PER_DISTANCE,
  });
  const { min, max } = level.obstacleGap;
  state.nextObstacleDistance += min + Math.random() * (max - min);
}

function updateObstacles() {
  if (!activeLevel()) {
    while (state.distance >= state.nextObstacleDistance) addObstacle();
  }
  const pathStart = PATH_START_Y;
  const exitMargin = Math.max(120, state.width * .18);
  const pathTravelLength = state.height - pathStart + exitMargin;
  const scroll = state.distance * PATH_SCROLL_PER_DISTANCE;
  state.obstacles = state.obstacles.filter((obstacle) => obstacle.targetMetres !== undefined
    || scroll - obstacle.spawnScroll <= pathTravelLength);
}

function hasCollision() {
  const ballDepth = state.height * .76;
  const ballX = pathCenterAt(ballDepth) + state.playerOffset;
  const radius = Math.min(27, Math.max(18, state.width * .053));
  const ballDepthRadius = radius * .65;
  return state.obstacles.some((obstacle) => {
    const baseY = getObstacleBaseY(obstacle);
    if (baseY === null || baseY > ballDepth + ballDepthRadius) return false;
    const cube = getCubeGeometry(obstacle, baseY);
    const cubeDepthStart = baseY - cube.shadow.size * .52;
    const cubeDepthEnd = baseY;
    const overlapsDepth = cubeDepthStart <= ballDepth + ballDepthRadius
      && cubeDepthEnd >= ballDepth - ballDepthRadius;
    const overlapsWidth = Math.abs(ballX - cube.shadow.centerX) <= radius + cube.shadow.size / 2;
    return overlapsDepth && overlapsWidth;
  });
}

function hasLeftPath() {
  const playerY = state.height * .76;
  return Math.abs(state.playerOffset) > pathHalfWidthAt(playerY);
}

function endGame(resultLabel = 'RUN ENDED') {
  state.mode = 'gameover';
  state.keys.clear();
  runEndedLabel.textContent = resultLabel;
  gameOverMetres.textContent = `${getMetres()}m`;
  highScoreValue.textContent = `${state.newHighScore ? 'NEW High score' : 'High score'}: ${highScore}m`;
  confetti.hidden = !state.newHighScore;
  updateNextLevelButton();
  gameOver.hidden = false;
  updateControls();
  retryButton.focus();
}

function resetGame() {
  state.distance = 0;
  state.playerOffset = 0;
  state.velocity = 0;
  state.elapsed = 0;
  state.obstacles = [];
  state.nextObstacleDistance = 0;
  if (activeLevel()) {
    state.curves = [];
    setupLevelObstacles();
  } else {
    resetCurves();
  }
  state.mode = 'ready';
  state.countdown = 3;
  state.newHighScore = false;
  state.keys.clear();
  runEndedLabel.textContent = 'RUN ENDED';
  gameOver.hidden = true;
  confetti.hidden = true;
  countdown.hidden = true;
  metresValue.textContent = '0m';
  updateLevelProgress(0);
  updateControls();
}

function closeMenu() {
  gameMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
}

function toggleMenu() {
  const willOpen = gameMenu.hidden;
  gameMenu.hidden = !willOpen;
  menuButton.setAttribute('aria-expanded', String(willOpen));
}

function updateControls() {
  const isPlaying = state.mode === 'playing' || state.mode === 'countdown';
  playButton.textContent = isPlaying ? 'Pause' : 'Play';
  playButton.setAttribute('aria-label', isPlaying ? 'Pause game' : 'Play game');
}

function startCountdown() {
  state.mode = 'countdown';
  state.countdown = 3;
  countdown.textContent = '3';
  countdown.hidden = false;
  updateControls();
}

function togglePlay() {
  if (state.mode === 'ready') {
    startCountdown();
  } else if (state.mode === 'countdown' || state.mode === 'playing') {
    state.mode = 'paused';
    countdown.hidden = true;
    updateControls();
  } else if (state.mode === 'paused') {
    startCountdown();
  }
}

function update(deltaSeconds) {
  if (state.mode === 'countdown') {
    state.countdown -= deltaSeconds;
    if (state.countdown <= 0) {
      state.mode = 'playing';
      countdown.hidden = true;
      updateControls();
    } else {
      countdown.textContent = String(Math.ceil(state.countdown));
    }
    return;
  }
  if (state.mode !== 'playing') return;
  state.elapsed += deltaSeconds;
  const speedStage = Math.floor(state.elapsed / level.speedIncreaseInterval);
  const currentSpeed = level.distancePerSecond * level.speedMultiplier ** speedStage;
  const selectedLevel = activeLevel();
  const targetDistance = selectedLevel
    ? selectedLevel.targetMetres * PATH_LINE_SPACING / PATH_SCROLL_PER_DISTANCE
    : Infinity;
  state.distance = Math.min(targetDistance, state.distance + currentSpeed * deltaSeconds);
  if (!selectedLevel) updateCurves();
  updateObstacles();
  const direction = Number(state.keys.has('ArrowRight')) - Number(state.keys.has('ArrowLeft'));
  state.velocity += direction * state.width * 3.2 * deltaSeconds;
  state.velocity *= Math.pow(.001, deltaSeconds);
  state.playerOffset += state.velocity * deltaSeconds;

  const metres = getMetres();
  metresValue.textContent = `${metres}m`;
  updateLevelProgress(metres);
  if (metres > highScore) {
    state.newHighScore = true;
    updateHighScore(metres);
  }
  if (hasLeftPath() || hasCollision()) {
    endGame();
  } else if (selectedLevel && metres >= selectedLevel.targetMetres) {
    markLevelOneComplete();
    endGame('LEVEL 1 COMPLETE');
  }
}

function render(now) {
  const deltaSeconds = Math.min((now - state.lastFrame) / 1000 || 0, .05);
  state.lastFrame = now;
  update(deltaSeconds);
  context.clearRect(0, 0, state.width, state.height);
  drawPath();
  drawLevelEndMarker();
  drawObstacles(false);
  drawBall();
  drawObstacles(true);
  requestAnimationFrame(render);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    state.keys.add(event.key);
  }
});
window.addEventListener('keyup', (event) => state.keys.delete(event.key));
retryButton.addEventListener('click', resetGame);
menuButton.addEventListener('click', toggleMenu);
freePlayButton.addEventListener('click', () => {
  state.gameType = 'freeplay';
  loadSelectedHighScore();
  updateSelectedOption();
  resetGame();
  closeMenu();
});
levelOneButton.addEventListener('click', () => {
  state.gameType = 'level1';
  loadSelectedHighScore();
  updateSelectedOption();
  resetGame();
  closeMenu();
});
playButton.addEventListener('click', togglePlay);
restartButton.addEventListener('click', resetGame);

resizeCanvas();
resetCurves();
for (let index = 0; index < 30; index += 1) {
  const piece = document.createElement('span');
  piece.className = 'confetti-piece';
  piece.style.left = `${Math.random() * 100}%`;
  piece.style.setProperty('--drift', `${-70 + Math.random() * 140}px`);
  piece.style.setProperty('--delay', `${Math.random() * -1700}ms`);
  piece.style.setProperty('--color', ['#ef8c78', '#f4c85b', '#8bcfc5', '#b7a0e5'][index % 4]);
  confetti.append(piece);
}
renderHighScore();
updateSelectedOption();
updateControls();
requestAnimationFrame(render);
