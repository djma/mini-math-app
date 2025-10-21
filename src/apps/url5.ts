import { disableContextMenuAndZoom } from "../utils/interactionGuards";

const INITIAL_BALL_COUNT = 20;
const BALL_SELECTION_PADDING = 10;

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
      --ball-size: clamp(42px, 5.6vw, 62px);
      --ball-selection-padding: ${BALL_SELECTION_PADDING}px;
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
      -webkit-touch-callout: none;
      user-select: none;
    }

    .board {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: stretch;
      justify-content: stretch;
      padding: clamp(16px, 4vw, 40px);
      padding-bottom: calc(clamp(16px, 4vw, 40px) + 24px);
    }

    @supports (padding-bottom: calc(16px + env(safe-area-inset-bottom))) {
      .board {
        padding-bottom: calc(
          clamp(16px, 4vw, 40px) + 24px + env(safe-area-inset-bottom)
        );
      }
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
      position: absolute;
      width: calc(var(--ball-size) + var(--ball-selection-padding) * 2);
      height: calc(var(--ball-size) + var(--ball-selection-padding) * 2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      user-select: none;
      touch-action: none;
      transition: transform 0.2s ease;
    }

    .ball__visual {
      position: relative;
      width: var(--ball-size);
      height: var(--ball-size);
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #d8d8d8 0%, #888888 28%, #3e3e3e 60%, #0c0c0c 100%);
      border: clamp(2px, 0.4vw, 3px) solid #2a2a2a;
      color: #fefefe;
      font-weight: 600;
      font-size: clamp(16px, 2vw, 24px);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28),
        0 6px 12px rgba(0, 0, 0, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.48),
        inset 0 -3px 6px rgba(0, 0, 0, 0.35);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }

    .ball__label {
      pointer-events: none;
      line-height: 1;
    }

    .ball--dragging {
      transform: scale(1.08);
      cursor: grabbing;
    }

    .ball--dragging .ball__visual {
      box-shadow: 0 0 0 clamp(6px, 1.2vw, 12px) rgba(255, 255, 255, 0.94),
        0 28px 52px rgba(0, 0, 0, 0.38);
    }

    .ball--inside .ball__visual {
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
      pointer-events: none;
      z-index: 120;
    }

    .merge-control__state {
      width: clamp(64px, 7vw, 86px);
      height: clamp(64px, 7vw, 86px);
      border-radius: clamp(22px, 4vw, 32px);
      background: rgba(255, 255, 255, 0.95);
      color: #1f2937;
      font-size: clamp(32px, 8vw, 56px);
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 46px rgba(15, 23, 42, 0.16);
      user-select: none;
      pointer-events: none;
      transition:
        background 0.18s ease,
        color 0.18s ease,
        box-shadow 0.18s ease;
    }

    .merge-control__state[data-state="greater"] {
      background: #6366f1;
      color: #ffffff;
      box-shadow: 0 24px 54px rgba(99, 102, 241, 0.28);
    }

    .merge-control__state[data-state="less"] {
      background: #f59e0b;
      color: #111827;
      box-shadow: 0 24px 54px rgba(245, 158, 11, 0.32);
    }

    .merge-control__state[data-state="equal"] {
      background: rgba(255, 255, 255, 0.95);
      color: #1f2937;
    }
  `;

  document.head.appendChild(style);
};

injectStyles();
disableContextMenuAndZoom();

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
const ballLabels = new WeakMap<HTMLDivElement, HTMLSpanElement>();
let boxes: BoxState[] = [];
let dragOrder = 1;
let comparisonState: HTMLDivElement | null = null;

const getNumericStyleValue = (
  element: HTMLElement,
  property: "left" | "top"
) => {
  const raw = element.style[property];
  if (!raw) {
    return 0;
  }
  const parsed = Number.parseFloat(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getBallVisualDiameter = (ball: HTMLDivElement) =>
  Math.max(0, ball.offsetWidth - BALL_SELECTION_PADDING * 2);

const getBallVisualRadius = (ball: HTMLDivElement) =>
  getBallVisualDiameter(ball) / 2;

const getBallCircleLeft = (ball: HTMLDivElement) =>
  getNumericStyleValue(ball, "left") + BALL_SELECTION_PADDING;

const getBallCircleTop = (ball: HTMLDivElement) =>
  getNumericStyleValue(ball, "top") + BALL_SELECTION_PADDING;

const getBallCenter = (ball: HTMLDivElement) => {
  const radius = getBallVisualRadius(ball);
  return {
    x: getBallCircleLeft(ball) + radius,
    y: getBallCircleTop(ball) + radius,
  };
};

const getBallLabel = (ball: HTMLDivElement) => {
  const cached = ballLabels.get(ball);
  if (cached) {
    return cached;
  }
  const found = ball.querySelector<HTMLSpanElement>(".ball__label");
  if (found) {
    ballLabels.set(ball, found);
    return found;
  }
  return null;
};

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
    const label = getBallLabel(ball);
    if (label) {
      label.textContent = "";
    }
  });

  boxes.forEach((box, index) => {
    const count = insideBalls[index].length;
    box.countValue.textContent = String(count);

    const sortedByPosition = insideBalls[index]
      .slice()
      .sort((a, b) => a.centerX - b.centerX);

    sortedByPosition.forEach(({ ball }, ballIndex) => {
      const label = getBallLabel(ball);
      if (label) {
        label.textContent = String(ballIndex + 1);
      }
    });
  });

  if (comparisonState) {
    const leftIndex = boxes.findIndex((box) => box.id === "left");
    const rightIndex = boxes.findIndex((box) => box.id === "right");
    const leftCount =
      leftIndex === -1 ? 0 : insideBalls[leftIndex]?.length ?? 0;
    const rightCount =
      rightIndex === -1 ? 0 : insideBalls[rightIndex]?.length ?? 0;

    let state: "less" | "equal" | "greater" = "equal";
    let symbol = "=";

    if (leftCount > rightCount) {
      state = "greater";
      symbol = ">";
    } else if (leftCount < rightCount) {
      state = "less";
      symbol = "<";
    }

    comparisonState.dataset.state = state;
    comparisonState.textContent = symbol;
  }
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
    const visualSize = getBallVisualDiameter(ball);
    const minLeft = -BALL_SELECTION_PADDING;
    const minTop = -BALL_SELECTION_PADDING;
    const maxLeft = boardRect.width - visualSize - BALL_SELECTION_PADDING;
    const maxTop = boardRect.height - visualSize - BALL_SELECTION_PADDING;

    ball.style.left = `${clamp(nextLeft, minLeft, maxLeft)}px`;
    ball.style.top = `${clamp(nextTop, minTop, maxTop)}px`;

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
  circleWidth: number,
  circleHeight: number,
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
    Math.max(0, (areaWidth - circleWidth) / 2)
  );
  const effectiveMarginY = Math.min(
    baseMarginY,
    Math.max(0, (areaHeight - circleHeight) / 2)
  );
  const minCircleLeft = effectiveMarginX;
  const maxCircleLeft = areaWidth - effectiveMarginX - circleWidth;
  const minCircleTop = effectiveMarginY;
  const maxCircleTop = areaHeight - effectiveMarginY - circleHeight;

  const horizontalRange = Math.max(0, maxCircleLeft - minCircleLeft);
  const verticalRange = Math.max(0, maxCircleTop - minCircleTop);

  let warningShown = false;

  for (let attempt = 1; attempt <= 1000; attempt += 1) {
    const candidateCircleLeft =
      horizontalRange > 0
        ? minCircleLeft + Math.random() * horizontalRange
        : minCircleLeft;
    const candidateCircleTop =
      verticalRange > 0
        ? minCircleTop + Math.random() * verticalRange
        : minCircleTop;
    const centerX = candidateCircleLeft + radius;
    const centerY = candidateCircleTop + radius;
    let collisionDetected = false;
    const circleLeftAbs = playAreaRect.left + candidateCircleLeft;
    const circleTopAbs = playAreaRect.top + candidateCircleTop;
    const circleRightAbs = circleLeftAbs + circleWidth;
    const circleBottomAbs = circleTopAbs + circleHeight;

    for (const other of existingBalls) {
      const otherRadius = getBallVisualRadius(other);
      const { x: otherCenterX, y: otherCenterY } = getBallCenter(other);
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
          circleRightAbs <= boxRect.left ||
          circleLeftAbs >= boxRect.right ||
          circleBottomAbs <= boxRect.top ||
          circleTopAbs >= boxRect.bottom;
        return !separated;
      });

      if (overlapsBox) {
        collisionDetected = true;
      }
    }

    if (!collisionDetected && gapRect) {
      const separatedFromGap =
        circleRightAbs <= gapRect.left ||
        circleLeftAbs >= gapRect.right ||
        circleBottomAbs <= gapRect.top ||
        circleTopAbs >= gapRect.bottom;
      if (!separatedFromGap) {
        collisionDetected = true;
      }
    }

    if (!collisionDetected) {
      return {
        left: candidateCircleLeft - BALL_SELECTION_PADDING,
        top: candidateCircleTop - BALL_SELECTION_PADDING,
      };
    }

    if (warnOnFailure && attempt === 100 && !warningShown) {
      window.alert("Clean up please!");
      warningShown = true;
    }
  }

  return null;
};

const placeBall = (ball: HTMLDivElement, warnOnFailure = false) => {
  const visualDiameter = getBallVisualDiameter(ball);
  const radius = visualDiameter / 2;
  const otherBalls = collectExistingBalls(ball);
  const availablePosition = findAvailablePosition(
    radius,
    visualDiameter,
    visualDiameter,
    otherBalls,
    warnOnFailure
  );

  if (availablePosition) {
    ball.style.left = `${availablePosition.left}px`;
    ball.style.top = `${availablePosition.top}px`;
  } else {
    const fallbackCircleLeft = Math.max(
      0,
      (playArea.clientWidth - visualDiameter) / 2
    );
    const fallbackCircleTop = Math.max(
      0,
      (playArea.clientHeight - visualDiameter) / 2
    );
    ball.style.left = `${fallbackCircleLeft - BALL_SELECTION_PADDING}px`;
    ball.style.top = `${fallbackCircleTop - BALL_SELECTION_PADDING}px`;
  }

  clampBallToBounds(ball);
};

const createBall = () => {
  const ball = document.createElement("div");
  ball.className = "ball";
  ball.style.zIndex = String(10 + balls.length);
  const visual = document.createElement("div");
  visual.className = "ball__visual";
  const label = document.createElement("span");
  label.className = "ball__label";
  visual.appendChild(label);
  ball.appendChild(visual);
  ballLabels.set(ball, label);

  playArea.appendChild(ball);
  balls.push(ball);
  attachDrag(ball);
  placeBall(ball, true);
  updateCounts();
};

const clampBallToBounds = (ball: HTMLDivElement) => {
  const visualDiameter = getBallVisualDiameter(ball);
  const minLeft = -BALL_SELECTION_PADDING;
  const minTop = -BALL_SELECTION_PADDING;
  const maxLeft =
    playArea.clientWidth - visualDiameter - BALL_SELECTION_PADDING;
  const maxTop =
    playArea.clientHeight - visualDiameter - BALL_SELECTION_PADDING;
  const currentLeft = getNumericStyleValue(ball, "left");
  const currentTop = getNumericStyleValue(ball, "top");

  ball.style.left = `${clamp(currentLeft, minLeft, maxLeft)}px`;
  ball.style.top = `${clamp(currentTop, minTop, maxTop)}px`;
};

const leftBox = createBox("left");
const rightBox = createBox("right");

const mergeControl = document.createElement("div");
mergeControl.className = "merge-control";

comparisonState = document.createElement("div");
comparisonState.className = "merge-control__state";
comparisonState.dataset.state = "equal";
comparisonState.textContent = "=";
mergeControl.appendChild(comparisonState);

boxesContainer.append(leftBox.element, mergeControl, rightBox.element);
boxes = [leftBox, rightBox];

for (let i = 0; i < INITIAL_BALL_COUNT; i += 1) {
  createBall();
}

window.addEventListener("resize", () => {
  balls.forEach((ball) => clampBallToBounds(ball));
  updateCounts();
});
