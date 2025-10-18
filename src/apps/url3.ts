import { disableContextMenuAndZoom } from "../utils/interactionGuards";

const MIN_VALUE = 1;
const MAX_VALUE = 5;
const DEFAULT_X = 3;
const DEFAULT_Y = 3;
const X_COLOR = "#f97316";
const Y_COLOR = "#0ea5e9";

type SliderKey = "x" | "y";
type Orientation = "vertical" | "horizontal";
type BallShape = "circle" | "oval";

type SliderElements = {
  container: HTMLDivElement;
  title: HTMLDivElement;
  shapes: HTMLDivElement;
  decrement: HTMLButtonElement;
  increment: HTMLButtonElement;
  value: HTMLSpanElement;
  orientation: Orientation;
};

type SliderPositions = {
  orientation: Orientation;
  values: number[];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const hexToRgb = (hex: string) => {
  const sanitized = hex.replace("#", "");
  const normalized =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => char + char)
          .join("")
      : sanitized;

  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;

  return { r, g, b };
};

const withAlpha = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ensureStyles = () => {
  if (document.getElementById("url3-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "url3-styles";
  style.textContent = `
    :root {
      color-scheme: light;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      min-width: 100vw;
      background: radial-gradient(circle at top, #dbeafe 0%, #fefce8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(16px, 6vw, 48px);
      font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
    }

    .url3__root {
      width: min(960px, 100%);
    }

    .url3__card {
      background: rgba(255, 255, 255, 0.96);
      border-radius: clamp(20px, 4vw, 36px);
      box-shadow:
        0 30px 70px rgba(15, 23, 42, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.65);
      padding: clamp(28px, 5vw, 42px);
    }

    .url3__board {
      display: grid;
      grid-template-columns: minmax(150px, 200px) 1fr;
      grid-template-rows: 1fr auto;
      gap: clamp(20px, 4vw, 32px);
      align-items: stretch;
    }

    .url3__slider {
      background: rgba(241, 245, 249, 0.78);
      border-radius: clamp(16px, 3vw, 20px);
      padding: clamp(18px, 3vw, 22px);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
      display: grid;
      gap: clamp(12px, 2.6vw, 16px);
      justify-items: center;
    }

    .url3__slider--vertical {
      grid-column: 1;
      grid-row: 1 / span 2;
      align-content: center;
    }

    .url3__slider--horizontal {
      grid-column: 1 / span 2;
      grid-row: 2;
    }

    .url3__slider-title {
      font-size: clamp(14px, 2.1vw, 17px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(15, 23, 42, 0.7);
    }

    .url3__slider-shapes {
      position: relative;
      pointer-events: none;
    }

    .url3__slider-shapes--vertical {
      width: clamp(64px, 7vw, 76px);
      height: clamp(240px, 46vh, 320px);
    }

    .url3__slider-shapes--horizontal {
      width: clamp(260px, 52vw, 440px);
      height: clamp(64px, 7vw, 76px);
    }

    .url3__slider-controls {
      display: grid;
      grid-auto-flow: column;
      gap: clamp(12px, 2.6vw, 18px);
      align-items: center;
    }

    .url3__slider-arrow {
      border: none;
      cursor: pointer;
      width: clamp(36px, 4vw, 44px);
      height: clamp(36px, 4vw, 44px);
      border-radius: 50%;
      background: linear-gradient(135deg, #1e3a8a, #2563eb);
      color: #f8fafc;
      font-size: clamp(16px, 2.4vw, 20px);
      font-weight: 700;
      display: grid;
      place-items: center;
      box-shadow:
        0 12px 22px rgba(37, 99, 235, 0.26),
        inset 0 1px 0 rgba(255, 255, 255, 0.45);
      transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
    }

    .url3__slider-arrow:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow:
        0 16px 28px rgba(37, 99, 235, 0.32),
        inset 0 1px 0 rgba(255, 255, 255, 0.55);
    }

    .url3__slider-arrow:active:not(:disabled) {
      transform: translateY(0);
      box-shadow:
        0 10px 18px rgba(37, 99, 235, 0.24),
        inset 0 1px 0 rgba(255, 255, 255, 0.35);
    }

    .url3__slider-arrow:disabled {
      opacity: 0.45;
      cursor: default;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
    }

    .url3__slider-value {
      min-width: 2ch;
      text-align: center;
      font-size: clamp(18px, 2.8vw, 22px);
      font-weight: 700;
      color: rgba(15, 23, 42, 0.85);
    }

    .url3__ball {
      --ball-color: #f97316;
      position: relative;
      display: grid;
      place-items: center;
      font-weight: 700;
      color: #0f172a;
      text-shadow: 0 2px 6px rgba(255, 255, 255, 0.5);
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.94), var(--ball-color));
      border: 2px solid rgba(15, 23, 42, 0.1);
      box-shadow: 0 12px 24px rgba(148, 163, 184, 0.28);
      pointer-events: none;
    }

    .url3__ball-shape--circle {
      width: clamp(42px, 4.4vw, 52px);
      height: clamp(42px, 4.4vw, 52px);
      border-radius: 50%;
    }

    .url3__ball-shape--oval {
      width: clamp(88px, 9vw, 120px);
      height: clamp(46px, 5vw, 62px);
      padding: 0 clamp(12px, 3.2vw, 20px);
      border-radius: clamp(28px, 5vw, 36px);
    }

    .url3__ball--slider {
      position: absolute;
      transform: translate(-50%, -50%);
    }

    .url3__ball--group {
      width: clamp(38px, 4vw, 46px);
      height: clamp(38px, 4vw, 46px);
      border-radius: 50%;
      position: absolute;
      transform: translate(-50%, -50%);
      box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
    }

    .url3__multiplication-area {
      grid-column: 2;
      grid-row: 1;
      position: relative;
      border-radius: clamp(18px, 4vw, 28px);
      background: linear-gradient(150deg, rgba(191, 219, 254, 0.4), rgba(134, 239, 172, 0.35));
      padding: clamp(28px, 4vw, 44px);
      min-height: clamp(260px, 44vh, 360px);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .url3__groups {
      width: 100%;
      display: flex;
      gap: clamp(18px, 4vw, 28px);
      justify-content: center;
      align-items: center;
      position: relative;
      z-index: 1;
      flex-wrap: nowrap;
    }

    .url3__groups--vertical {
      flex-direction: column;
    }

    .url3__groups--horizontal {
      flex-direction: row;
    }

    .url3__group {
      --group-color: #f97316;
      position: relative;
      padding: clamp(26px, 4vw, 34px);
      border-radius: 999px;
      border: 2px solid var(--group-color);
      background: linear-gradient(
        160deg,
        rgba(255, 255, 255, 0.95),
        rgba(255, 255, 255, 0.8)
      );
      box-shadow: 0 18px 36px rgba(15, 23, 42, 0.14);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: clamp(150px, 26vw, 190px);
      min-width: clamp(220px, 32vw, 320px);
    }

    .url3__group--vertical {
      width: min(90%, 460px);
    }

    .url3__group--horizontal {
      flex: 1 1 clamp(200px, 26vw, 280px);
    }

    .url3__group::before {
      content: "";
      position: absolute;
      inset: clamp(10px, 1.6vw, 14px);
      border-radius: 999px;
      border: 2px dashed rgba(15, 23, 42, 0.12);
      pointer-events: none;
    }

    .url3__group-balls {
      position: relative;
      width: 100%;
      height: clamp(68px, 8vw, 84px);
    }

    .url3__group-balls--vertical {
      width: clamp(82px, 10vw, 104px);
      height: clamp(160px, 30vw, 220px);
    }

    .url3__group-badge {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      width: clamp(32px, 4vw, 40px);
      height: clamp(32px, 4vw, 40px);
      border-radius: 50%;
      background: var(--group-color);
      color: #ffffff;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: clamp(14px, 2.2vw, 18px);
      box-shadow: 0 10px 18px rgba(15, 23, 42, 0.16);
    }

    .url3__controls {
      position: absolute;
      bottom: clamp(24px, 4vw, 32px);
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: clamp(12px, 2.6vw, 18px);
      z-index: 2;
    }

    .url3__button {
      border: none;
      outline: none;
      cursor: pointer;
      width: clamp(68px, 8vw, 88px);
      height: clamp(68px, 8vw, 88px);
      border-radius: 50%;
      background: #0f172a;
      color: #f8fafc;
      font-size: clamp(26px, 3.8vw, 38px);
      font-weight: 700;
      display: grid;
      place-items: center;
      box-shadow:
        0 20px 34px rgba(15, 23, 42, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, 0.32);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }

    .url3__button:hover {
      transform: translateY(-2px);
      box-shadow:
        0 26px 40px rgba(15, 23, 42, 0.34),
        inset 0 3px 6px rgba(255, 255, 255, 0.4);
    }

    .url3__button:active {
      transform: translateY(0);
      box-shadow:
        0 18px 26px rgba(15, 23, 42, 0.24),
        inset 0 1px 2px rgba(255, 255, 255, 0.28);
    }

    .url3__toggle {
      border: none;
      cursor: pointer;
      background: rgba(15, 23, 42, 0.12);
      color: #0f172a;
      padding: 10px 20px;
      border-radius: 999px;
      font-size: clamp(15px, 2.2vw, 18px);
      font-weight: 600;
      backdrop-filter: blur(6px);
      transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
    }

    .url3__toggle:hover {
      transform: translateY(-1px);
      background: rgba(15, 23, 42, 0.2);
    }

    .url3__toggle--active {
      background: #0f172a;
      color: #f8fafc;
    }

    @media (max-width: 840px) {
      .url3__board {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
      }

      .url3__slider--vertical {
        grid-column: 1;
        grid-row: 1;
      }

      .url3__multiplication-area {
        grid-column: 1;
        grid-row: 2;
        min-height: clamp(280px, 56vh, 400px);
      }

      .url3__slider--horizontal {
        grid-column: 1;
        grid-row: 3;
      }

      .url3__group {
        width: 100%;
      }

      .url3__controls {
        position: static;
        transform: none;
        margin-top: clamp(18px, 4vw, 24px);
      }
    }
  `;

  document.head.appendChild(style);
};

const createBall = (
  label: string,
  color: string,
  variant: "slider" | "group",
  shape: BallShape
) => {
  const ball = document.createElement("span");
  ball.className = "url3__ball";
  ball.classList.add(`url3__ball-shape--${shape}`);
  ball.classList.add(`url3__ball--${variant}`);
  ball.style.setProperty("--ball-color", color);
  ball.textContent = label;
  return ball;
};

const createSlider = (
  key: SliderKey,
  orientation: Orientation,
  initialValue: number
): SliderElements => {
  const container = document.createElement("div");
  container.className = `url3__slider url3__slider--${orientation}`;
  container.dataset.sliderKey = key;

  const title = document.createElement("div");
  title.className = "url3__slider-title";
  container.appendChild(title);

  const shapes = document.createElement("div");
  shapes.className = "url3__slider-shapes";
  shapes.classList.add(`url3__slider-shapes--${orientation}`);
  shapes.setAttribute("aria-hidden", "true");
  container.appendChild(shapes);

  const controls = document.createElement("div");
  controls.className = "url3__slider-controls";

  const decrement = document.createElement("button");
  decrement.type = "button";
  decrement.className = "url3__slider-arrow";
  decrement.textContent = "←";
  decrement.setAttribute("aria-label", `Decrease ${key}`);

  const value = document.createElement("span");
  value.className = "url3__slider-value";

  const increment = document.createElement("button");
  increment.type = "button";
  increment.className = "url3__slider-arrow";
  increment.textContent = "→";
  increment.setAttribute("aria-label", `Increase ${key}`);

  controls.appendChild(decrement);
  controls.appendChild(value);
  controls.appendChild(increment);
  container.appendChild(controls);

  return {
    container,
    title,
    shapes,
    decrement,
    increment,
    value,
    orientation,
  };
};

export const mountUrlThree = () => {
  disableContextMenuAndZoom();
  document.body.innerHTML = "";
  ensureStyles();

  const root = document.createElement("div");
  root.className = "url3__root";

  const card = document.createElement("div");
  card.className = "url3__card";

  const board = document.createElement("div");
  board.className = "url3__board";

  const sliderX = createSlider("x", "vertical", DEFAULT_X);
  const sliderY = createSlider("y", "horizontal", DEFAULT_Y);

  const groupsArea = document.createElement("div");
  groupsArea.className = "url3__multiplication-area";

  const groupsContainer = document.createElement("div");
  groupsContainer.className = "url3__groups";
  groupsArea.appendChild(groupsContainer);

  const controls = document.createElement("div");
  controls.className = "url3__controls";

  const multiplyButton = document.createElement("button");
  multiplyButton.className = "url3__button";
  multiplyButton.type = "button";
  multiplyButton.textContent = "×";

  const toggleButton = document.createElement("button");
  toggleButton.className = "url3__toggle";
  toggleButton.type = "button";
  toggleButton.textContent = "↔";

  controls.appendChild(multiplyButton);
  controls.appendChild(toggleButton);
  groupsArea.appendChild(controls);

  board.appendChild(sliderX.container);
  board.appendChild(groupsArea);
  board.appendChild(sliderY.container);

  card.appendChild(board);
  root.appendChild(card);
  document.body.appendChild(root);

  const sliderMap: Record<SliderKey, SliderElements> = {
    x: sliderX,
    y: sliderY,
  };

  const state: {
    xValue: number;
    yValue: number;
    isCommuted: boolean;
    hasMultiplied: boolean;
    positions: Record<SliderKey, SliderPositions>;
  } = {
    xValue: DEFAULT_X,
    yValue: DEFAULT_Y,
    isCommuted: false,
    hasMultiplied: false,
    positions: {
      x: { orientation: sliderX.orientation, values: [] },
      y: { orientation: sliderY.orientation, values: [] },
    },
  };

  const getSliderColor = (key: SliderKey) => {
    if (!state.isCommuted) {
      return key === "x" ? X_COLOR : Y_COLOR;
    }
    return key === "x" ? Y_COLOR : X_COLOR;
  };

  const isGroupAxis = (key: SliderKey) =>
    (!state.isCommuted && key === "x") || (state.isCommuted && key === "y");

  const getGroupKey = (): SliderKey => (state.isCommuted ? "y" : "x");
  const getItemsKey = (): SliderKey => (state.isCommuted ? "x" : "y");

  const getGroupCount = () =>
    getGroupKey() === "x" ? state.xValue : state.yValue;

  const getItemsPerGroup = () =>
    getItemsKey() === "x" ? state.xValue : state.yValue;

  const updateSliderTitle = (key: SliderKey) => {
    const slider = sliderMap[key];
    const value = key === "x" ? state.xValue : state.yValue;
    slider.title.textContent = `${key} = ${value}`;
  };

  const updateSliderControls = (key: SliderKey) => {
    const slider = sliderMap[key];
    const value = key === "x" ? state.xValue : state.yValue;
    slider.value.textContent = String(value);
    slider.decrement.disabled = value <= MIN_VALUE;
    slider.increment.disabled = value >= MAX_VALUE;
  };

  const renderSliderShapes = (key: SliderKey) => {
    const slider = sliderMap[key];
    const value = key === "x" ? state.xValue : state.yValue;
    const color = getSliderColor(key);
    const shape: BallShape = isGroupAxis(key) ? "oval" : "circle";
    const { orientation } = slider;

    slider.shapes.innerHTML = "";

    const count = clamp(value, MIN_VALUE, MAX_VALUE);
    const denominator = count > 1 ? count - 1 : 1;
    const positions: number[] = [];

    for (let index = 0; index < count; index += 1) {
      const ratio = count === 1 ? 0.5 : index / denominator;
      const normalized =
        orientation === "horizontal" ? ratio : 1 - ratio; // vertical values measured from bottom
      positions.push(normalized);

      const ball = createBall(String(index + 1), color, "slider", shape);

      if (orientation === "horizontal") {
        ball.style.left = `${ratio * 100}%`;
        ball.style.top = "50%";
      } else {
        ball.style.left = "50%";
        ball.style.top = `${normalized * 100}%`;
      }

      slider.shapes.appendChild(ball);
    }

    state.positions[key] = { orientation, values: positions };
  };

  const refreshSlider = (key: SliderKey) => {
    updateSliderTitle(key);
    updateSliderControls(key);
    renderSliderShapes(key);
  };

  const refreshSliders = () => {
    refreshSlider("x");
    refreshSlider("y");
  };

  const renderGroups = () => {
    state.hasMultiplied = true;
    groupsContainer.innerHTML = "";

    const groupKey = getGroupKey();
    const itemKey = getItemsKey();
    const groupSlider = sliderMap[groupKey];
    const itemSlider = sliderMap[itemKey];

    const groupColor = getSliderColor(groupKey);
    const itemColor = getSliderColor(itemKey);
    const groupCount = getGroupCount();
    const itemsPerGroup = getItemsPerGroup();
    const itemPositions = state.positions[itemKey];

    groupsContainer.classList.toggle(
      "url3__groups--vertical",
      groupSlider.orientation === "vertical"
    );
    groupsContainer.classList.toggle(
      "url3__groups--horizontal",
      groupSlider.orientation === "horizontal"
    );

    const fallbackDenominator = itemsPerGroup > 1 ? itemsPerGroup - 1 : 1;

    let counter = 1;
    for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
      const group = document.createElement("div");
      group.className = "url3__group";
      group.classList.add(`url3__group--${groupSlider.orientation}`);
      group.style.setProperty("--group-color", withAlpha(groupColor, 0.65));
      group.style.borderColor = withAlpha(groupColor, 0.55);
      group.style.background = `linear-gradient(160deg, rgba(255, 255, 255, 0.96), ${withAlpha(
        groupColor,
        0.2
      )})`;

      const badge = document.createElement("span");
      badge.className = "url3__group-badge";
      badge.textContent = String(groupIndex + 1);
      badge.style.background = groupColor;
      group.appendChild(badge);

      const ballTray = document.createElement("div");
      ballTray.className = "url3__group-balls";
      ballTray.classList.add(`url3__group-balls--${itemSlider.orientation}`);

      for (let itemIndex = 0; itemIndex < itemsPerGroup; itemIndex += 1) {
        const normalized =
          itemPositions.values[itemIndex] ??
          (itemSlider.orientation === "horizontal"
            ? (itemsPerGroup === 1 ? 0.5 : itemIndex / fallbackDenominator)
            : 1 -
              (itemsPerGroup === 1 ? 0.5 : itemIndex / fallbackDenominator));

        const ball = createBall(
          String(counter),
          itemColor,
          "group",
          "circle"
        );

        if (itemSlider.orientation === "horizontal") {
          ball.style.left = `${normalized * 100}%`;
          ball.style.top = "50%";
        } else {
          ball.style.left = "50%";
          ball.style.top = `${normalized * 100}%`;
        }

        ballTray.appendChild(ball);
        counter += 1;
      }

      group.appendChild(ballTray);
      groupsContainer.appendChild(group);
    }
  };

  const updateAll = () => {
    refreshSliders();
    if (state.hasMultiplied) {
      renderGroups();
    }
  };

  const adjustValue = (key: SliderKey, delta: number) => {
    if (key === "x") {
      state.xValue = clamp(state.xValue + delta, MIN_VALUE, MAX_VALUE);
    } else {
      state.yValue = clamp(state.yValue + delta, MIN_VALUE, MAX_VALUE);
    }
    updateAll();
  };

  sliderX.decrement.addEventListener("click", () => adjustValue("x", -1));
  sliderX.increment.addEventListener("click", () => adjustValue("x", 1));
  sliderY.decrement.addEventListener("click", () => adjustValue("y", -1));
  sliderY.increment.addEventListener("click", () => adjustValue("y", 1));

  multiplyButton.addEventListener("click", () => {
    renderGroups();
  });

  toggleButton.addEventListener("click", () => {
    state.isCommuted = !state.isCommuted;
    toggleButton.classList.toggle("url3__toggle--active", state.isCommuted);
    updateAll();
  });

  refreshSliders();
};
