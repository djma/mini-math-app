import { disableContextMenuAndZoom } from "../utils/interactionGuards";

// Tune these to taste.
const PADDLE_HEIGHT = 180;
const PADDLE_WIDTH = 16;
const PADDLE_X_OFFSET = 32;
const BALL_RADIUS = 12;
const BASE_BALL_SPEED = 420; // px per second
const SPEED_AFTER_PADDLE_HIT = 1.02; // light boost so volleys accelerate

type Side = "left" | "right";

type PaddleState = {
  y: number;
  element: HTMLDivElement;
  scoreEl: HTMLSpanElement;
  score: number;
  activePointer: number | null;
};

type BallState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const injectStyles = () => {
  if (document.getElementById("pong-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "pong-styles";
  style.textContent = `
    :root {
      color-scheme: light;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f4e3c1;
      color: #0f172a;
    }

    .pong {
      position: relative;
      width: 100%;
      height: 100%;
      display: grid;
      align-items: stretch;
      justify-items: stretch;
      isolation: isolate;
      touch-action: none;
      user-select: none;
    }

    .pong__arena {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
    }

    .pong__net {
      position: absolute;
      top: 0;
      left: 50%;
      width: 4px;
      height: 100%;
      transform: translateX(-50%);
      background-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.8) 0,
        rgba(0, 0, 0, 0.8) 40%,
        transparent 40%,
        transparent 100%
      );
      background-size: 4px 20px;
      opacity: 0.7;
    }

    .pong__scoreboard {
      position: absolute;
      top: 20px;
      left: 0;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      pointer-events: none;
      z-index: 2;
    }

    .pong__score {
      justify-self: center;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #0f172a;
      font-size: clamp(64px, 8vw, 96px);
      text-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
      min-width: 2ch;
      text-align: center;
    }

    .pong__paddle {
      position: absolute;
      width: ${PADDLE_WIDTH}px;
      height: ${PADDLE_HEIGHT}px;
      border-radius: 12px;
      background: #0b0b0b;
      box-shadow:
        0 12px 24px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      transform: translate(-50%, -50%);
      will-change: transform;
      touch-action: none;
    }

    .pong__ball {
      position: absolute;
      width: ${BALL_RADIUS * 2}px;
      height: ${BALL_RADIUS * 2}px;
      border-radius: 50%;
      background: #000000;
      box-shadow: none;
      transform: translate(-50%, -50%);
      will-change: transform;
    }

    .pong__serve-indicator {
      position: absolute;
      top: 0;
      left: 0;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
      pointer-events: none;
      transform-origin: center;
      transition: transform 0.12s ease-out, opacity 0.16s ease-out;
      z-index: 3;
      opacity: 0;
    }

  `;

  document.head.appendChild(style);
};

const randomServeAngle = (toward: Side) => {
  const base = toward === "right" ? 0 : Math.PI;
  const spread = (Math.PI / 2) * (Math.random() - 0.5); // +/-45deg
  return base + spread;
};

export const mountPong = () => {
  disableContextMenuAndZoom();
  injectStyles();

  document.body.innerHTML = "";

  const root = document.createElement("div");
  root.className = "pong";

  const arena = document.createElement("div");
  arena.className = "pong__arena";
  root.appendChild(arena);

  const net = document.createElement("div");
  net.className = "pong__net";
  arena.appendChild(net);

  const scoreboard = document.createElement("div");
  scoreboard.className = "pong__scoreboard";

  const leftScore = document.createElement("div");
  leftScore.className = "pong__score";
  leftScore.innerHTML = `<span id="pong-left-score">0</span>`;

  const rightScore = document.createElement("div");
  rightScore.className = "pong__score";
  rightScore.innerHTML = `<span id="pong-right-score">0</span>`;

  scoreboard.append(leftScore, rightScore);
  root.appendChild(scoreboard);

  const ballEl = document.createElement("div");
  ballEl.className = "pong__ball";
  arena.appendChild(ballEl);

  const serveIndicatorEl = document.createElement("div");
  serveIndicatorEl.className = "pong__serve-indicator";
  // serveIndicatorEl.textContent = "▲";
  // serveIndicatorEl.textContent = "^";
  serveIndicatorEl.textContent = "↑";
  arena.appendChild(serveIndicatorEl);

  const paddles: Record<Side, PaddleState> = {
    left: {
      y: window.innerHeight / 2,
      element: document.createElement("div"),
      scoreEl: leftScore.querySelector("span") as HTMLSpanElement,
      score: 0,
      activePointer: null,
    },
    right: {
      y: window.innerHeight / 2,
      element: document.createElement("div"),
      scoreEl: rightScore.querySelector("span") as HTMLSpanElement,
      score: 0,
      activePointer: null,
    },
  };

  paddles.left.element.className = "pong__paddle";
  paddles.right.element.className = "pong__paddle";
  arena.append(paddles.left.element, paddles.right.element);

  const state: {
    width: number;
    height: number;
    playing: boolean;
    serveTo: Side;
    ball: BallState;
    lastTime: number;
  } = {
    width: window.innerWidth,
    height: window.innerHeight,
    playing: false,
    serveTo: Math.random() > 0.5 ? "left" : "right",
    ball: { x: window.innerWidth / 2, y: window.innerHeight / 2, vx: 0, vy: 0 },
    lastTime: performance.now(),
  };
  let currentServeAngle = randomServeAngle(state.serveTo);

  const clampPaddleY = (y: number) =>
    clamp(y, PADDLE_HEIGHT / 2, state.height - PADDLE_HEIGHT / 2);

  const updateServeIndicator = () => {
    if (state.playing) {
      serveIndicatorEl.style.opacity = "0";
      return;
    }

    const angleDeg = (currentServeAngle * 180) / Math.PI + 90;
    serveIndicatorEl.style.opacity = "1";
    serveIndicatorEl.style.transform = `translate(${state.ball.x}px, ${
      state.ball.y
    }px) translate(-50%, -50%) rotate(${angleDeg}deg) translate(0, ${
      -BALL_RADIUS * 3
    }px)`;
  };

  const updatePaddlePosition = (side: Side) => {
    const x =
      side === "left"
        ? PADDLE_X_OFFSET + PADDLE_WIDTH / 2
        : state.width - PADDLE_X_OFFSET - PADDLE_WIDTH / 2;
    const y = clampPaddleY(paddles[side].y);
    paddles[side].y = y;
    paddles[
      side
    ].element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  };

  const updateBallPosition = () => {
    ballEl.style.transform = `translate(${state.ball.x}px, ${state.ball.y}px) translate(-50%, -50%)`;
  };

  const startServe = (toward: Side) => {
    state.playing = false;
    state.serveTo = toward;
    state.ball.x = state.width / 2;
    state.ball.y = state.height / 2;
    state.ball.vx = 0;
    state.ball.vy = 0;
    updateBallPosition();

    currentServeAngle = randomServeAngle(toward);
    updateServeIndicator();

    let count = 3;

    const tick = () => {
      if (count > 1) {
        count -= 1;
        setTimeout(tick, 750);
        return;
      }

      const speed = BASE_BALL_SPEED;
      state.ball.vx = Math.cos(currentServeAngle) * speed;
      state.ball.vy = Math.sin(currentServeAngle) * speed;
      state.playing = true;
      updateServeIndicator();
    };

    setTimeout(tick, 750);
  };

  const handleScore = (side: Side) => {
    paddles[side].score += 1;
    paddles[side].scoreEl.textContent = paddles[side].score.toString();
    startServe(Math.random() > 0.5 ? "left" : "right");
  };

  const handleResize = () => {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    updatePaddlePosition("left");
    updatePaddlePosition("right");
    if (!state.playing) {
      state.ball.x = state.width / 2;
      state.ball.y = state.height / 2;
      updateBallPosition();
      updateServeIndicator();
    }
  };

  const setPaddleYFromPointer = (side: Side, clientY: number) => {
    paddles[side].y = clampPaddleY(clientY);
    updatePaddlePosition(side);
  };

  arena.addEventListener("pointerdown", (event) => {
    const side: Side = event.clientX < state.width / 2 ? "left" : "right";
    paddles[side].activePointer = event.pointerId;
    arena.setPointerCapture(event.pointerId);
    setPaddleYFromPointer(side, event.clientY);
  });

  arena.addEventListener("pointermove", (event) => {
    (["left", "right"] as Side[]).forEach((side) => {
      if (paddles[side].activePointer === event.pointerId) {
        setPaddleYFromPointer(side, event.clientY);
      }
    });
  });

  const releasePointer = (pointerId: number) => {
    (["left", "right"] as Side[]).forEach((side) => {
      if (paddles[side].activePointer === pointerId) {
        paddles[side].activePointer = null;
      }
    });
  };

  ["pointerup", "pointercancel", "pointerout", "pointerleave"].forEach(
    (eventName) => {
      arena.addEventListener(eventName, (event) => {
        releasePointer((event as PointerEvent).pointerId);
      });
    }
  );

  window.addEventListener("resize", handleResize);

  const checkPaddleCollision = (side: Side) => {
    const paddleX =
      side === "left"
        ? PADDLE_X_OFFSET + PADDLE_WIDTH / 2
        : state.width - PADDLE_X_OFFSET - PADDLE_WIDTH / 2;
    const paddleY = paddles[side].y;
    const halfHeight = PADDLE_HEIGHT / 2;

    const withinY =
      state.ball.y + BALL_RADIUS >= paddleY - halfHeight &&
      state.ball.y - BALL_RADIUS <= paddleY + halfHeight;

    if (!withinY) {
      return false;
    }

    if (
      side === "left" &&
      state.ball.x - BALL_RADIUS <= paddleX + PADDLE_WIDTH / 2
    ) {
      state.ball.x = paddleX + PADDLE_WIDTH / 2 + BALL_RADIUS;
    } else if (
      side === "right" &&
      state.ball.x + BALL_RADIUS >= paddleX - PADDLE_WIDTH / 2
    ) {
      state.ball.x = paddleX - PADDLE_WIDTH / 2 - BALL_RADIUS;
    } else {
      return false;
    }

    const offset = (state.ball.y - paddleY) / halfHeight;
    const speed =
      Math.hypot(state.ball.vx, state.ball.vy) * SPEED_AFTER_PADDLE_HIT;
    const angleAdjust = offset * 0.6; // tilt the reflection
    const baseAngle = side === "left" ? 0 : Math.PI;
    const signedAdjust = side === "left" ? angleAdjust : -angleAdjust;
    const newAngle = baseAngle + signedAdjust;

    state.ball.vx = Math.cos(newAngle) * speed;
    state.ball.vy = Math.sin(newAngle) * speed;
    return true;
  };

  const step = (now: number) => {
    const delta = (now - state.lastTime) / 1000;
    state.lastTime = now;

    if (state.playing) {
      const maxDelta = Math.min(delta, 0.032);
      state.ball.x += state.ball.vx * maxDelta;
      state.ball.y += state.ball.vy * maxDelta;

      if (state.ball.y - BALL_RADIUS <= 0) {
        state.ball.y = BALL_RADIUS;
        state.ball.vy = Math.abs(state.ball.vy);
      } else if (state.ball.y + BALL_RADIUS >= state.height) {
        state.ball.y = state.height - BALL_RADIUS;
        state.ball.vy = -Math.abs(state.ball.vy);
      }

      checkPaddleCollision("left");
      checkPaddleCollision("right");

      if (state.ball.x < -BALL_RADIUS) {
        handleScore("right");
      } else if (state.ball.x > state.width + BALL_RADIUS) {
        handleScore("left");
      }

      updateBallPosition();
    }

    requestAnimationFrame(step);
  };

  updatePaddlePosition("left");
  updatePaddlePosition("right");
  updateBallPosition();
  startServe(state.serveTo);
  requestAnimationFrame(step);

  document.body.appendChild(root);
};
