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
const levelTwoButton = document.querySelector('#level-two-button');
const levelThreeButton = document.querySelector('#level-three-button');
const levelFourButton = document.querySelector('#level-four-button');
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
  fourSpikeGroupChance: 0.5,
  spikePairOffsets: [-.14, .14],
  laserPulseDuration: 1,
  laserPulseCycle: 2,
};

const LEVELS = {
  level1: {
    name: 'Level 1',
    targetMetres: 50,
    obstacleOffsets: [0, -.56, -.56, .56, -.56, .56, .56, 0],
    obstacleSpacing: 6,
  },
  level2: {
    name: 'Level 2',
    targetMetres: 50,
    obstacleSpacing: 6,
    obstacleSchedule: [
      { type: 'spike-group', lanes: [-.56, 0] },
      { type: 'spike-group', lanes: [.56, 0] },
      { type: 'cube', offset: .56 },
      { type: 'cube', offset: 0 },
      { type: 'cube', offset: -.56 },
      { type: 'cube', offset: 0 },
      { type: 'cube', offset: .56 },
      { type: 'spike-group', lanes: [-.56, .56] },
    ],
  },
  level3: {
    name: 'Level 3',
    targetMetres: 50,
    obstacleSpacing: 4,
    obstacleSchedule: [
      { type: 'cube', offset: .56 },
      { type: 'cube', offset: 0 },
      { type: 'spike-group', lanes: [-.56, 0] },
      { type: 'cube', offset: 0 },
      { type: 'cube', offset: -.56 },
      { type: 'spike-group', lanes: [.56, 0] },
      { type: 'spike-group', lanes: [-.56, .56] },
      { type: 'spike-group', lanes: [0] },
      { type: 'spike-group', lanes: [.56] },
      { type: 'cube', offset: 0 },
      { type: 'cube', offset: .56 },
      { type: 'cube', offset: 0 },
    ],
    curvePoints: [
      { metres: 10, offset: 0 },
      { metres: 14, offset: .14 },
      { metres: 18, offset: -.14 },
      { metres: 22, offset: .14 },
      { metres: 26, offset: 0 },
    ],
  },
  level4: {
    name: 'Level 4',
    targetMetres: 100,
    obstacleSpacing: 4,
    startingSpeedMultiplier: 1.2,
    obstacleSchedule: [
      { type: 'spike-group', lanes: [.56, 0] },
      { type: 'spike-group', lanes: [-.56, 0] },
      { type: 'laser-cube', offset: .56, laserEnteredAt: null },
      { type: 'cube', offset: 0 },
      { type: 'cube', offset: -.56 },
      { type: 'cube', offset: 0 },
      { type: 'spike-group', lanes: [.56, 0] },
      { type: 'laser-cube', offset: .56, laserEnteredAt: null },
      { type: 'laser-cube', offset: -.56, laserEnteredAt: null },
      { type: 'cube', offset: 0 },
      { type: 'spike-group', lanes: [-.56, .56] },
      { type: 'cube', offset: -.56 },
      { type: 'laser-cube', offset: 0, laserEnteredAt: null },
      { type: 'spike-group', lanes: [.56] },
      { type: 'spike-group', lanes: [-.56] },
      { type: 'spike-group', lanes: [.56, 0] },
      { type: 'spike-group', lanes: [-.56, 0] },
      { type: 'laser-cube', offset: .56, laserEnteredAt: null },
      { type: 'cube', offset: 0 },
      { type: 'cube', offset: -.56 },
      { type: 'cube', offset: 0 },
      { type: 'spike-group', lanes: [.56, 0] },
      { type: 'laser-cube', offset: .56, laserEnteredAt: null },
      { type: 'laser-cube', offset: -.56, laserEnteredAt: null },
    ],
    curvePoints: [
      { metres: 10, offset: 0 },
      { metres: 14, offset: .14 },
      { metres: 18, offset: -.14 },
      { metres: 22, offset: 0 },
    ],
  },
};

const PATH_LINE_SPACING = 78;
const PATH_SCROLL_PER_DISTANCE = 4.4;
const PATH_START_Y = -70;
const HIGH_SCORE_KEY_PREFIX = 'skyfall-high-score';
const LEGACY_HIGH_SCORE_KEY = 'skyfall-high-score';
const LEVEL_ONE_COMPLETE_KEY = 'skyfall-level-one-complete';
const LEVEL_TWO_COMPLETE_KEY = 'skyfall-level-two-complete';
const LEVEL_THREE_COMPLETE_KEY = 'skyfall-level-three-complete';
const JUMP_DURATION = 0.6;
const SPIKE_CLEARANCE_RATIO = 0.7;

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

function loadLevelTwoCompletion() {
  try {
    return localStorage.getItem(LEVEL_TWO_COMPLETE_KEY) === 'true';
  } catch {
    return false;
  }
}

let levelTwoComplete = loadLevelTwoCompletion();

function loadLevelThreeCompletion() {
  try {
    return localStorage.getItem(LEVEL_THREE_COMPLETE_KEY) === 'true';
  } catch {
    return false;
  }
}

let levelThreeComplete = loadLevelThreeCompletion();

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
  jumpHeight: 0,
  jumpVelocity: 0,
};

const touchControl = {
  pointerId: null,
  startX: 0,
  lastX: 0,
  isDragging: false,
};

const TOUCH_DRAG_THRESHOLD = 8;

function activeLevel() {
  return state.gameType === 'freeplay' ? null : LEVELS[state.gameType];
}

function nextLevelGameType() {
  if (state.gameType === 'level1' && levelOneComplete) return 'level2';
  if (state.gameType === 'level2' && levelTwoComplete) return 'level3';
  if (state.gameType === 'level3' && levelThreeComplete) return 'level4';
  return null;
}

function updateNextLevelButton() {
  const nextLevel = nextLevelGameType();
  nextLevelButton.hidden = !nextLevel;
  nextLevelButton.disabled = !nextLevel;
}

function markLevelOneComplete() {
  levelOneComplete = true;
  try {
    localStorage.setItem(LEVEL_ONE_COMPLETE_KEY, 'true');
  } catch {
    // Continue without persistence when browser storage is unavailable.
  }
}

function markLevelTwoComplete() {
  levelTwoComplete = true;
  try {
    localStorage.setItem(LEVEL_TWO_COMPLETE_KEY, 'true');
  } catch {
    // Continue without persistence when browser storage is unavailable.
  }
}

function markLevelThreeComplete() {
  levelThreeComplete = true;
  try {
    localStorage.setItem(LEVEL_THREE_COMPLETE_KEY, 'true');
  } catch {
    // Continue without persistence when browser storage is unavailable.
  }
}

function updateSelectedOption() {
  const selectedLevel = activeLevel();
  selectedOption.textContent = selectedLevel ? selectedLevel.name : 'Free Play';
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

function maxJumpHeight() {
  return Math.max(58, Math.min(92, state.height * .16));
}

function resetJump() {
  state.jumpHeight = 0;
  state.jumpVelocity = 0;
}

function startJump() {
  if (state.mode !== 'playing' || state.jumpHeight > 0) return;
  const height = maxJumpHeight();
  state.jumpVelocity = (4 * height) / JUMP_DURATION;
  state.jumpHeight = .01;
}

function updateJump(deltaSeconds) {
  if (state.jumpHeight <= 0) return;
  const gravity = (8 * maxJumpHeight()) / (JUMP_DURATION ** 2);
  state.jumpHeight += state.jumpVelocity * deltaSeconds;
  state.jumpVelocity -= gravity * deltaSeconds;
  if (state.jumpHeight <= 0) resetJump();
}

function clearsSpikes() {
  return state.jumpHeight > 0;
}

function smoothstep(value) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function trackScrollAt(y) {
  return state.distance * PATH_SCROLL_PER_DISTANCE - (y - PATH_START_Y);
}

function levelCurveOffsetAt(trackScroll, curvePoints) {
  const metres = trackScroll / PATH_LINE_SPACING;
  let previous = { metres: 0, offset: 0 };
  for (const point of curvePoints) {
    if (metres <= point.metres) {
      const transition = (metres - previous.metres) / (point.metres - previous.metres);
      return previous.offset + (point.offset - previous.offset) * smoothstep(transition);
    }
    previous = point;
  }
  return previous.offset;
}

function pathCenterAt(y) {
  const trackScroll = trackScrollAt(y);
  const selectedLevel = activeLevel();
  const curveOffset = selectedLevel?.curvePoints
    ? levelCurveOffsetAt(trackScroll, selectedLevel.curvePoints)
    : state.curves.reduce((offset, curve) => {
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
  const bounce = state.jumpHeight > 0 ? 0 : Math.abs(Math.sin(state.elapsed * 7.2)) * 7;
  const y = restingY - bounce - state.jumpHeight;
  const radius = Math.min(27, Math.max(18, state.width * 0.053));
  const x = pathCenterAt(restingY) + state.playerOffset;
  const jumpRatio = state.jumpHeight / maxJumpHeight();

  context.beginPath();
  context.ellipse(x, restingY + radius * 1.05, radius * (.9 - jumpRatio * .25), radius * (.3 - jumpRatio * .12), 0, 0, Math.PI * 2);
  context.fillStyle = `rgba(89, 124, 106, ${.2 - jumpRatio * .1})`;
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

function getLaserEmitter(cube) {
  const topY = cube.front[2].y;
  const bottomY = cube.front[0].y;
  return { x: cube.shadow.centerX, y: topY + (bottomY - topY) * .48 };
}

function drawLaserCube(obstacle, baseY) {
  const cube = getCubeGeometry(obstacle, baseY);
  const { centerX, size } = cube.shadow;

  context.beginPath();
  context.ellipse(centerX, baseY + size * .12, size * .68, size * .18, 0, 0, Math.PI * 2);
  context.fillStyle = 'rgba(89, 124, 106, .18)';
  context.fill();

  fillFace(cube.top, '#ffd5a5');
  fillFace(cube.front, '#ed927f');

  const emitter = getLaserEmitter(cube);
  context.beginPath();
  context.arc(emitter.x, emitter.y, Math.max(3, size * .1), 0, Math.PI * 2);
  context.fillStyle = '#4e3d70';
  context.fill();
  context.strokeStyle = '#fff2f6';
  context.lineWidth = Math.max(1.5, size * .025);
  context.stroke();
}

function isLaserActive(obstacle) {
  if (obstacle.laserEnteredAt === null || obstacle.laserEnteredAt === undefined) return false;
  const cyclePosition = (state.elapsed - obstacle.laserEnteredAt) % level.laserPulseCycle;
  return cyclePosition >= level.laserPulseDuration;
}

function laserBeamPoints(obstacle, cube) {
  const emitter = getLaserEmitter(cube);
  const points = [emitter];
  const startY = Math.max(emitter.y + 1, PATH_START_Y);
  const endY = state.height + 2;
  const step = Math.max(20, state.height / 18);
  for (let y = startY; y < endY; y += step) {
    points.push({
      x: pathCenterAt(y) + pathHalfWidthAt(y) * obstacle.offset,
      y,
    });
  }
  points.push({
    x: pathCenterAt(endY) + pathHalfWidthAt(endY) * obstacle.offset,
    y: endY,
  });
  return points;
}

function drawLaserBeam(obstacle, baseY) {
  if (!isLaserActive(obstacle)) return;
  const cube = getCubeGeometry(obstacle, baseY);
  const points = laserBeamPoints(obstacle, cube);

  context.save();
  context.beginPath();
  points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
  context.strokeStyle = '#ff4f62';
  context.lineWidth = Math.max(3, cube.shadow.size * .08);
  context.shadowColor = '#ff4f62';
  context.shadowBlur = Math.max(10, cube.shadow.size * .5);
  context.stroke();
  context.strokeStyle = '#fff5f6';
  context.lineWidth = Math.max(1, cube.shadow.size * .022);
  context.shadowBlur = 0;
  context.stroke();
  context.restore();
}

function getSpikeGeometry(laneOffset, pairOffset, baseY) {
  const position = baseY / state.height;
  const pathHalfWidth = pathHalfWidthAt(baseY);
  const centerX = pathCenterAt(baseY) + pathHalfWidth * (laneOffset + pairOffset);
  const scale = .62 + position;
  const size = Math.max(17, state.width * .055 * scale);
  const apex = { x: centerX, y: baseY - size * 1.2 };
  const frontLeft = { x: centerX - size / 2, y: baseY };
  const frontRight = { x: centerX + size / 2, y: baseY };
  const backLeft = { x: centerX - size * .33, y: baseY - size * .18 };
  const backRight = { x: centerX + size * .33, y: baseY - size * .18 };

  return {
    front: [apex, frontRight, frontLeft],
    right: [apex, backRight, frontRight],
    left: [apex, frontLeft, backLeft],
    back: [apex, backLeft, backRight],
    shadow: { centerX, baseY, size },
  };
}

function getSpikes(obstacle, baseY) {
  return obstacle.lanes.flatMap((laneOffset) => level.spikePairOffsets.map((pairOffset) => (
    getSpikeGeometry(laneOffset, pairOffset, baseY)
  )));
}

function drawSpike(spike) {
  const { centerX, baseY, size } = spike.shadow;
  context.beginPath();
  context.ellipse(centerX, baseY + size * .1, size * .58, size * .15, 0, 0, Math.PI * 2);
  context.fillStyle = 'rgba(89, 124, 106, .18)';
  context.fill();

  fillFace(spike.back, '#f5c985');
  fillFace(spike.left, '#dc7f76');
  fillFace(spike.right, '#c66063');
  fillFace(spike.front, '#ef9787');
}

function drawSpikeGroup(obstacle, baseY) {
  getSpikes(obstacle, baseY).forEach(drawSpike);
}

function drawObstacle(obstacle, baseY) {
  if (obstacle.type === 'spike-group') {
    drawSpikeGroup(obstacle, baseY);
  } else if (obstacle.type === 'laser-cube') {
    drawLaserCube(obstacle, baseY);
  } else {
    drawCube(obstacle, baseY);
  }
}

function drawObstacles(foreground) {
  const ballY = state.height * .76 - Math.abs(Math.sin(state.elapsed * 7.2)) * 7;
  const radius = Math.min(27, Math.max(18, state.width * .053));
  state.obstacles.forEach((obstacle) => {
    const baseY = getObstacleBaseY(obstacle);
    if (baseY === null) return;
    if ((baseY > ballY + radius) === foreground) drawObstacle(obstacle, baseY);
    if (foreground && obstacle.type === 'laser-cube') drawLaserBeam(obstacle, baseY);
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
  const schedule = selectedLevel.obstacleSchedule ?? selectedLevel.obstacleOffsets.map((offset) => ({
    type: 'cube',
    offset,
  }));
  state.obstacles = schedule.map((obstacle, index) => ({
    ...obstacle,
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
  const spawnScroll = state.nextObstacleDistance * PATH_SCROLL_PER_DISTANCE;
  const obstacleType = Math.floor(Math.random() * 3);
  if (obstacleType === 0) {
    const firstLaneIndex = Math.floor(Math.random() * level.obstacleOffsets.length);
    const lanes = [level.obstacleOffsets[firstLaneIndex]];
    const laneCount = Math.random() < level.fourSpikeGroupChance ? 2 : 1;
    if (laneCount === 2) {
      const remainingLanes = level.obstacleOffsets.filter((_, index) => index !== firstLaneIndex);
      lanes.push(remainingLanes[Math.floor(Math.random() * remainingLanes.length)]);
    }
    state.obstacles.push({ type: 'spike-group', lanes, spawnScroll });
  } else {
    const offsetIndex = Math.floor(Math.random() * level.obstacleOffsets.length);
    state.obstacles.push({
      type: obstacleType === 1 ? 'cube' : 'laser-cube',
      offset: level.obstacleOffsets[offsetIndex],
      spawnScroll,
      laserEnteredAt: null,
    });
  }
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
  state.obstacles.forEach((obstacle) => {
    if (obstacle.type !== 'laser-cube' || obstacle.laserEnteredAt !== null) return;
    const baseY = getObstacleBaseY(obstacle);
    if (baseY !== null && baseY >= 0) obstacle.laserEnteredAt = state.elapsed;
  });
}

function hasLaserBeamCollision(obstacle, baseY, ballX, ballDepth, radius) {
  if (!isLaserActive(obstacle)) return false;
  const cube = getCubeGeometry(obstacle, baseY);
  const points = laserBeamPoints(obstacle, cube);
  const beamRadius = Math.max(3, cube.shadow.size * .08) / 2;
  return points.slice(1).some((point, index) => {
    const start = points[index];
    const segmentX = point.x - start.x;
    const segmentY = point.y - start.y;
    const segmentLengthSquared = segmentX ** 2 + segmentY ** 2;
    const progress = segmentLengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
      ((ballX - start.x) * segmentX + (ballDepth - start.y) * segmentY) / segmentLengthSquared));
    const closestX = start.x + segmentX * progress;
    const closestY = start.y + segmentY * progress;
    return Math.hypot(ballX - closestX, ballDepth - closestY) <= radius + beamRadius;
  });
}

function hasCollision() {
  const ballDepth = state.height * .76;
  const ballX = pathCenterAt(ballDepth) + state.playerOffset;
  const radius = Math.min(27, Math.max(18, state.width * .053));
  const ballDepthRadius = radius * .65;
  return state.obstacles.some((obstacle) => {
    const baseY = getObstacleBaseY(obstacle);
    if (baseY === null) return false;
    if (obstacle.type === 'laser-cube' && hasLaserBeamCollision(obstacle, baseY, ballX, ballDepth, radius)) {
      return true;
    }
    if (baseY > ballDepth + ballDepthRadius) return false;
    if (obstacle.type === 'spike-group' && clearsSpikes()) return false;
    const shapes = obstacle.type === 'spike-group'
      ? getSpikes(obstacle, baseY)
      : [getCubeGeometry(obstacle, baseY)];
    return shapes.some((shape) => {
      const depthLength = obstacle.type === 'spike-group' ? .38 : .52;
      const shapeDepthStart = baseY - shape.shadow.size * depthLength;
      const shapeDepthEnd = baseY;
      const overlapsDepth = shapeDepthStart <= ballDepth + ballDepthRadius
        && shapeDepthEnd >= ballDepth - ballDepthRadius;
      const overlapsWidth = Math.abs(ballX - shape.shadow.centerX) <= radius + shape.shadow.size / 2;
      return overlapsDepth && overlapsWidth;
    });
  });
}

function hasLeftPath() {
  const playerY = state.height * .76;
  return Math.abs(state.playerOffset) > pathHalfWidthAt(playerY);
}

function endGame(resultLabel = 'RUN ENDED') {
  state.mode = 'gameover';
  state.keys.clear();
  resetJump();
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
  resetJump();
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
  resetJump();
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
    resetJump();
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
  updateJump(deltaSeconds);
  const speedStage = Math.floor(state.elapsed / level.speedIncreaseInterval);
  const selectedLevel = activeLevel();
  const startingSpeed = selectedLevel?.startingSpeedMultiplier ?? 1;
  const currentSpeed = level.distancePerSecond * startingSpeed * level.speedMultiplier ** speedStage;
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
    if (state.gameType === 'level1') markLevelOneComplete();
    if (state.gameType === 'level2') markLevelTwoComplete();
    if (state.gameType === 'level3') markLevelThreeComplete();
    endGame(`${selectedLevel.name.toUpperCase()} COMPLETE`);
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
  if (event.code === 'Space') {
    if (state.mode === 'playing') {
      event.preventDefault();
      if (!event.repeat) startJump();
    }
    return;
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    state.keys.add(event.key);
  }
});
window.addEventListener('keyup', (event) => state.keys.delete(event.key));
canvas.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse' || state.mode !== 'playing') return;
  event.preventDefault();
  touchControl.pointerId = event.pointerId;
  touchControl.startX = event.clientX;
  touchControl.lastX = event.clientX;
  touchControl.isDragging = false;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (event.pointerId !== touchControl.pointerId) return;
  event.preventDefault();
  const movedDistance = event.clientX - touchControl.startX;
  if (Math.abs(movedDistance) >= TOUCH_DRAG_THRESHOLD) touchControl.isDragging = true;
  if (touchControl.isDragging) {
    state.playerOffset += event.clientX - touchControl.lastX;
    state.velocity = 0;
  }
  touchControl.lastX = event.clientX;
});
function finishTouchControl(event) {
  if (event.pointerId !== touchControl.pointerId) return;
  event.preventDefault();
  const shouldJump = !touchControl.isDragging && state.mode === 'playing';
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  touchControl.pointerId = null;
  if (shouldJump) startJump();
}
canvas.addEventListener('pointerup', finishTouchControl);
canvas.addEventListener('pointercancel', finishTouchControl);
retryButton.addEventListener('click', resetGame);
menuButton.addEventListener('click', toggleMenu);
function selectGameType(gameType) {
  state.gameType = gameType;
  loadSelectedHighScore();
  updateSelectedOption();
  resetGame();
  closeMenu();
}

freePlayButton.addEventListener('click', () => selectGameType('freeplay'));
levelOneButton.addEventListener('click', () => selectGameType('level1'));
levelTwoButton.addEventListener('click', () => selectGameType('level2'));
levelThreeButton.addEventListener('click', () => selectGameType('level3'));
levelFourButton.addEventListener('click', () => selectGameType('level4'));
nextLevelButton.addEventListener('click', () => {
  const nextLevel = nextLevelGameType();
  if (nextLevel) selectGameType(nextLevel);
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
