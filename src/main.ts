const INITIAL_BALL_COUNT = 10;
const MAX_BALL_COUNT = 20;
const MERGE_DURATION_MS = 15000;

type BoxState = {
  id: string;
  element: HTMLDivElement;
  countValue: HTMLSpanElement;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const injectStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    :root {
      color-scheme: light;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #eef2ff 0%, #fdf2f8 100%);
      min-height: 100vh;
      min-width: 100vw;
      overflow: hidden;
    }

    .board {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: stretch;
      justify-content: stretch;
      padding: clamp(16px, 4vw, 40px);
    }

    .play-area {
      position: relative;
      width: 100%;
      height: 100%;
      background: #ffffff;
      border-radius: clamp(20px, 5vw, 40px);
      box-shadow: 0 30px 70px rgba(15, 23, 42, 0.18);
      overflow: hidden;
    }

    .control-panel {
      position: absolute;
      top: clamp(20px, 4vw, 48px);
      left: clamp(20px, 4vw, 48px);
      display: flex;
      gap: 16px;
      background: rgba(255, 255, 255, 0.92);
      border-radius: 999px;
      padding: 10px 16px;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
      backdrop-filter: blur(10px);
    }

    .control-button {
      border: none;
      outline: none;
      background: #111827;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 999px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.02em;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease,
        background 0.15s ease;
    }

    .control-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px rgba(17, 24, 39, 0.22);
    }

    .control-button:active {
      transform: translateY(0);
      box-shadow: 0 4px 12px rgba(17, 24, 39, 0.28);
    }

    .boxes {
      position: absolute;
      bottom: clamp(24px, 6vw, 48px);
      left: 50%;
      transform: translateX(-50%);
      width: min(92vw, 1200px);
      display: flex;
      align-items: stretch;
      justify-content: center;
      gap: clamp(8px, 2vw, 16px);
    }

    .boxes--merged {
      justify-content: center;
      gap: 0;
    }

    .box {
      flex: 1;
      padding: clamp(32px, 7vw, 72px);
      border-radius: clamp(24px, 7vw, 48px);
      border: clamp(3px, 0.6vw, 6px) dashed #c7d2fe;
      background: rgba(99, 102, 241, 0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: clamp(16px, 3vw, 28px);
      transition: border-color 0.2s ease, background 0.2s ease,
        box-shadow 0.2s ease;
      min-height: clamp(220px, 32vh, 380px);
      pointer-events: none;
    }

    .box--active {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.2);
      box-shadow: 0 0 0 clamp(10px, 2vw, 16px) rgba(99, 102, 241, 0.12);
    }

    .box__count {
      font-size: clamp(48px, 10vw, 96px);
      font-weight: 700;
      color: #1f2937;
      min-width: 1ch;
    }

    .ball {
      width: clamp(42px, 5.6vw, 62px);
      height: clamp(42px, 5.6vw, 62px);
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #d8d8d8 0%, #888888 28%, #3e3e3e 60%, #0c0c0c 100%);
      border: clamp(2px, 0.4vw, 3px) solid #2a2a2a;
      color: #fefefe;
      font-weight: 600;
      font-size: clamp(16px, 2vw, 24px);
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      user-select: none;
      touch-action: none;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28),
        0 6px 12px rgba(0, 0, 0, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.48),
        inset 0 -3px 6px rgba(0, 0, 0, 0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .ball--dragging {
      transform: scale(1.08);
      box-shadow: 0 0 0 clamp(6px, 1.2vw, 12px) rgba(255, 255, 255, 0.94),
        0 28px 52px rgba(0, 0, 0, 0.38);
      cursor: grabbing;
    }

    .ball--inside {
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28),
        0 6px 12px rgba(0, 0, 0, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.48),
        inset 0 -3px 6px rgba(0, 0, 0, 0.35);
    }

    .merge-control {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      z-index: 120;
    }

    .merge-control__button {
      border: none;
      outline: none;
      background: #ffffff;
      color: #111827;
      width: clamp(48px, 6vw, 72px);
      height: clamp(48px, 6vw, 72px);
      border-radius: 50%;
      font-size: clamp(20px, 3vw, 32px);
      font-weight: 700;
      box-shadow: 0 16px 30px rgba(15, 23, 42, 0.16);
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease,
        background 0.18s ease, color 0.18s ease;
    }

    .merge-control__button:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.22);
    }

    .merge-control__button[aria-pressed="true"] {
      background: #6366f1;
      color: #ffffff;
      box-shadow: 0 24px 44px rgba(99, 102, 241, 0.28);
    }

    .merge-control--floating {
      top: clamp(24px, 6vw, 64px);
      transform: translate(-50%, 0);
    }
  `;

  document.head.appendChild(style);
};

injectStyles();

const root = document.createElement("div");
root.className = "board";
document.body.appendChild(root);

const playArea = document.createElement("div");
playArea.className = "play-area";
root.appendChild(playArea);

const boxesContainer = document.createElement("div");
boxesContainer.className = "boxes";
playArea.appendChild(boxesContainer);

const balls: HTMLDivElement[] = [];
let boxes: BoxState[] = [];
let dragOrder = 1;
let isMerged = false;
let mergeTimeoutId: number | null = null;

const createBox = (id: string): BoxState => {
  const element = document.createElement("div");
  element.className = "box";
  element.dataset.boxId = id;

  const countValue = document.createElement("span");
  countValue.className = "box__count";
  countValue.textContent = "0";

  element.append(countValue);

  return { id, element, countValue };
};

const updateCounts = () => {
  if (boxes.length === 0) {
    return;
  }

  const insideBalls = boxes.map(
    () => [] as { ball: HTMLDivElement; centerX: number }[]
  );
  const boxRects = boxes.map((box) => box.element.getBoundingClientRect());

  for (const ball of balls) {
    const rect = ball.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let assignedIndex: number | null = null;
    for (let i = 0; i < boxRects.length; i += 1) {
      const boxRect = boxRects[i];
      const inside =
        centerX >= boxRect.left &&
        centerX <= boxRect.right &&
        centerY >= boxRect.top &&
        centerY <= boxRect.bottom;

      if (inside) {
        assignedIndex = i;
        insideBalls[i].push({ ball, centerX });
        break;
      }
    }

    ball.classList.toggle("ball--inside", assignedIndex !== null);
  }

  balls.forEach((ball) => {
    ball.textContent = "";
  });

  boxes.forEach((box, index) => {
    const count = insideBalls[index].length;
    box.countValue.textContent = String(count);

    const sortedByPosition = insideBalls[index]
      .slice()
      .sort((a, b) => a.centerX - b.centerX);

    sortedByPosition.forEach(({ ball }, ballIndex) => {
      ball.textContent = String(ballIndex + 1);
    });
  });
};

const attachDrag = (ball: HTMLDivElement) => {
  let activePointerId: number | null = null;
  let offsetX = 0;
  let offsetY = 0;

  const handlePointerDown = (event: PointerEvent) => {
    event.preventDefault();
    activePointerId = event.pointerId;
    const rect = ball.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    ball.setPointerCapture(activePointerId);
    ball.classList.add("ball--dragging");
    ball.style.zIndex = String(100 + dragOrder);
    dragOrder += 1;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (activePointerId === null || event.pointerId !== activePointerId) {
      return;
    }

    const boardRect = playArea.getBoundingClientRect();
    const nextLeft = event.clientX - boardRect.left - offsetX;
    const nextTop = event.clientY - boardRect.top - offsetY;
    const maxLeft = boardRect.width - ball.offsetWidth;
    const maxTop = boardRect.height - ball.offsetHeight;

    ball.style.left = `${clamp(nextLeft, 0, maxLeft)}px`;
    ball.style.top = `${clamp(nextTop, 0, maxTop)}px`;

    updateCounts();
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (activePointerId === null || event.pointerId !== activePointerId) {
      return;
    }

    ball.classList.remove("ball--dragging");
    ball.releasePointerCapture(activePointerId);
    activePointerId = null;
    updateCounts();
  };

  ball.addEventListener("pointerdown", handlePointerDown);
  ball.addEventListener("pointermove", handlePointerMove);
  ball.addEventListener("pointerup", handlePointerUp);
  ball.addEventListener("pointercancel", handlePointerUp);
};

const collectExistingBalls = (exclude: HTMLDivElement) =>
  balls.filter((candidate) => candidate !== exclude && candidate.isConnected);

const findAvailablePosition = (
  radius: number,
  ballWidth: number,
  ballHeight: number,
  existingBalls: HTMLDivElement[],
  warnOnFailure: boolean
) => {
  const areaWidth = playArea.clientWidth;
  const areaHeight = playArea.clientHeight;
  const playAreaRect = playArea.getBoundingClientRect();
  const activeBoxRects = boxes
    .filter((box) => box.element.style.display !== "none")
    .map((box) => box.element.getBoundingClientRect());
  const sortedBoxRects = activeBoxRects.slice().sort((a, b) => a.left - b.left);
  const gapRect =
    sortedBoxRects.length === 2
      ? (() => {
          const [first, second] = sortedBoxRects;
          const gapWidth = second.left - first.right;
          if (gapWidth <= 0) {
            return null;
          }
          return {
            left: first.right,
            right: second.left,
            top: Math.min(first.top, second.top),
            bottom: Math.max(first.bottom, second.bottom),
          };
        })()
      : null;
  const baseMarginX = Math.min(Math.max(areaWidth * 0.04, 32), 160);
  const baseMarginY = Math.min(Math.max(areaHeight * 0.05, 32), 160);
  const effectiveMarginX = Math.min(
    baseMarginX,
    Math.max(0, (areaWidth - ballWidth) / 2)
  );
  const effectiveMarginY = Math.min(
    baseMarginY,
    Math.max(0, (areaHeight - ballHeight) / 2)
  );
  const minLeft = effectiveMarginX;
  const maxLeft = areaWidth - effectiveMarginX - ballWidth;
  const minTop = effectiveMarginY;
  const maxTop = areaHeight - effectiveMarginY - ballHeight;

  const horizontalRange = Math.max(0, maxLeft - minLeft);
  const verticalRange = Math.max(0, maxTop - minTop);

  let warningShown = false;

  for (let attempt = 1; attempt <= 1000; attempt += 1) {
    const candidateLeft =
      horizontalRange > 0 ? minLeft + Math.random() * horizontalRange : minLeft;
    const candidateTop =
      verticalRange > 0 ? minTop + Math.random() * verticalRange : minTop;
    const centerX = candidateLeft + radius;
    const centerY = candidateTop + radius;
    let collisionDetected = false;
    const ballLeftAbs = playAreaRect.left + candidateLeft;
    const ballTopAbs = playAreaRect.top + candidateTop;
    const ballRightAbs = ballLeftAbs + ballWidth;
    const ballBottomAbs = ballTopAbs + ballHeight;

    for (const other of existingBalls) {
      const otherRadius = other.offsetWidth / 2;
      const otherLeft = parseFloat(other.style.left || "0");
      const otherTop = parseFloat(other.style.top || "0");
      const otherCenterX = otherLeft + otherRadius;
      const otherCenterY = otherTop + otherRadius;
      const distance = Math.hypot(
        centerX - otherCenterX,
        centerY - otherCenterY
      );

      if (distance < radius + otherRadius) {
        collisionDetected = true;
        break;
      }
    }

    if (!collisionDetected) {
      const overlapsBox = activeBoxRects.some((boxRect) => {
        const separated =
          ballRightAbs <= boxRect.left ||
          ballLeftAbs >= boxRect.right ||
          ballBottomAbs <= boxRect.top ||
          ballTopAbs >= boxRect.bottom;
        return !separated;
      });

      if (overlapsBox) {
        collisionDetected = true;
      }
    }

    if (!collisionDetected && gapRect) {
      const separatedFromGap =
        ballRightAbs <= gapRect.left ||
        ballLeftAbs >= gapRect.right ||
        ballBottomAbs <= gapRect.top ||
        ballTopAbs >= gapRect.bottom;
      if (!separatedFromGap) {
        collisionDetected = true;
      }
    }

    if (!collisionDetected) {
      return { left: candidateLeft, top: candidateTop };
    }

    if (warnOnFailure && attempt === 100 && !warningShown) {
      window.alert("Clean up please!");
      warningShown = true;
    }
  }

  return null;
};

const placeBall = (ball: HTMLDivElement, warnOnFailure = false) => {
  const ballWidth = ball.offsetWidth;
  const ballHeight = ball.offsetHeight;
  const radius = ballWidth / 2;
  const otherBalls = collectExistingBalls(ball);
  const availablePosition = findAvailablePosition(
    radius,
    ballWidth,
    ballHeight,
    otherBalls,
    warnOnFailure
  );

  if (availablePosition) {
    ball.style.left = `${availablePosition.left}px`;
    ball.style.top = `${availablePosition.top}px`;
  } else {
    const fallbackLeft = Math.max(0, (playArea.clientWidth - ballWidth) / 2);
    const fallbackTop = Math.max(0, (playArea.clientHeight - ballHeight) / 2);
    ball.style.left = `${fallbackLeft}px`;
    ball.style.top = `${fallbackTop}px`;
  }

  clampBallToBounds(ball);
};

const addBall = () => {
  if (balls.length >= MAX_BALL_COUNT) {
    return;
  }

  const ball = document.createElement("div");
  ball.className = "ball";
  ball.textContent = "";
  ball.style.zIndex = String(10 + balls.length);

  playArea.appendChild(ball);
  balls.push(ball);
  attachDrag(ball);
  placeBall(ball, true);
  updateCounts();
};

const removeBall = () => {
  if (balls.length === 0) {
    return;
  }

  const outsideIndex = balls.findIndex(
    (candidate) => !candidate.classList.contains("ball--inside")
  );
  const removedBall =
    outsideIndex >= 0 ? balls.splice(outsideIndex, 1)[0] : balls.pop();

  if (!removedBall) {
    return;
  }

  removedBall.remove();
  updateCounts();
};

const clampBallToBounds = (ball: HTMLDivElement) => {
  const maxLeft = Math.max(0, playArea.clientWidth - ball.offsetWidth);
  const maxTop = Math.max(0, playArea.clientHeight - ball.offsetHeight);
  const currentLeft = parseFloat(ball.style.left || "0");
  const currentTop = parseFloat(ball.style.top || "0");

  ball.style.left = `${clamp(currentLeft, 0, maxLeft)}px`;
  ball.style.top = `${clamp(currentTop, 0, maxTop)}px`;
};

const controlPanel = document.createElement("div");
controlPanel.className = "control-panel";

const removeButton = document.createElement("button");
removeButton.type = "button";
removeButton.className = "control-button";
removeButton.textContent = "-1";
removeButton.addEventListener("click", () => removeBall());

const addButton = document.createElement("button");
addButton.type = "button";
addButton.className = "control-button";
addButton.textContent = "+1";
addButton.addEventListener("click", () => addBall());

controlPanel.append(removeButton, addButton);
playArea.appendChild(controlPanel);

const leftBox = createBox("left");
const rightBox = createBox("right");
const mergedBox = createBox("merged");
mergedBox.element.style.display = "none";

const mergeControl = document.createElement("div");
mergeControl.className = "merge-control";

const mergeButton = document.createElement("button");
mergeButton.type = "button";
mergeButton.className = "merge-control__button";
mergeButton.setAttribute("aria-pressed", "false");
mergeButton.textContent = "+";
mergeControl.appendChild(mergeButton);

boxesContainer.append(
  leftBox.element,
  mergeControl,
  rightBox.element,
  mergedBox.element
);

const setMergedState = (merged: boolean) => {
  isMerged = merged;
  mergeButton.setAttribute("aria-pressed", merged ? "true" : "false");
  mergeControl.classList.toggle("merge-control--floating", merged);
  boxesContainer.classList.toggle("boxes--merged", merged);
  leftBox.element.style.display = merged ? "none" : "flex";
  rightBox.element.style.display = merged ? "none" : "flex";
  mergedBox.element.style.display = merged ? "flex" : "none";
  boxes = merged ? [mergedBox] : [leftBox, rightBox];
  if (!merged && mergeTimeoutId !== null) {
    window.clearTimeout(mergeTimeoutId);
    mergeTimeoutId = null;
  }
  mergeControl.style.display = merged ? "none" : "flex";
  if (!merged) {
    mergeButton.textContent = "+";
  }
  updateCounts();
};

const scheduleUnmerge = () => {
  if (mergeTimeoutId !== null) {
    window.clearTimeout(mergeTimeoutId);
  }
  mergeTimeoutId = window.setTimeout(() => {
    setMergedState(false);
    mergeTimeoutId = null;
  }, MERGE_DURATION_MS);
};

mergeButton.addEventListener("click", () => {
  if (isMerged) {
    return;
  }

  setMergedState(true);
  scheduleUnmerge();
});

setMergedState(false);

for (let i = 0; i < INITIAL_BALL_COUNT; i += 1) {
  addBall();
}

window.addEventListener("resize", () => {
  balls.forEach((ball) => clampBallToBounds(ball));
  updateCounts();
});
