const NOTCH_COUNT = 6;
const MODIFIERS = [-2, -1, 1, 2];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const mountUrlTwo = () => {
  document.body.innerHTML = "";

  const existingStyles = document.getElementById("url2-slider-styles");
  if (!existingStyles) {
    const style = document.createElement("style");
    style.id = "url2-slider-styles";
    style.textContent = `
      :root {
        color-scheme: light;
      }

      .url2__root {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: clamp(24px, 5vw, 72px);
        background: radial-gradient(circle at top, #c7d2fe, #1e3a8a);
        font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        color: #0f172a;
      }

      .url2__card {
        width: min(620px, calc(100vw - 48px));
        background: rgba(255, 255, 255, 0.94);
        border-radius: 28px;
        padding: clamp(28px, 5vw, 44px);
        box-shadow:
          0 40px 90px rgba(30, 41, 59, 0.32),
          inset 0 1px 0 rgba(255, 255, 255, 0.85);
      }

      .modifiers {
        display: grid;
        gap: clamp(12px, 3vw, 16px);
        justify-items: center;
        padding-top: clamp(16px, 4vw, 24px);
      }

      .modifiers__list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
      }

      .modifiers__button {
        min-width: 96px;
        padding: 12px 18px;
        border-radius: 999px;
        border: 2px solid transparent;
        background: rgba(59, 130, 246, 0.12);
        color: #1d4ed8;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition:
          transform 0.16s ease,
          box-shadow 0.16s ease,
          border-color 0.16s ease,
          background 0.16s ease;
      }

      .modifiers__button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(37, 99, 235, 0.18);
      }

      .modifiers__button:active {
        transform: translateY(1px);
        background: linear-gradient(135deg, #6366f1, #2563eb);
        color: #ffffff;
        box-shadow: inset 0 2px 4px rgba(15, 23, 42, 0.25);
      }

      .modifiers__button--active {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
        box-shadow:
          0 12px 24px rgba(29, 78, 216, 0.28),
          inset 0 2px 4px rgba(255, 255, 255, 0.25);
      }

      .slider-area {
        display: grid;
        gap: clamp(20px, 4vw, 28px);
        justify-items: center;
      }

      .slider__readout {
        font-size: clamp(44px, 12vw, 64px);
        font-weight: 800;
        color: #1d4ed8;
        line-height: 1;
        text-shadow: 0 10px 20px rgba(29, 78, 216, 0.18);
      }

      .slider {
        position: relative;
        width: min(460px, calc(100vw - 96px));
        padding: clamp(28px, 6vw, 36px) clamp(14px, 5vw, 20px);
      }

      .slider__track {
        position: relative;
        margin: 0 auto;
        width: 100%;
        height: 12px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.35);
        overflow: visible;
      }

      .slider__notch {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 4px;
        height: 18px;
        border-radius: 999px;
        background: rgba(30, 41, 59, 0.45);
        z-index: 1;
      }

      .slider__shadow {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: clamp(44px, 8vw, 52px);
        height: clamp(44px, 8vw, 52px);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.24s ease;
        z-index: 1;
      }

      .slider__shadow-ring {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 3px solid rgba(59, 130, 246, 0.45);
        background: rgba(148, 163, 184, 0.08);
        box-shadow:
          0 16px 32px rgba(59, 130, 246, 0.2),
          inset 0 0 0 12px rgba(59, 130, 246, 0.05);
      }

      .slider__shadow-ring::after {
        content: "";
        position: absolute;
        inset: -16px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.24), rgba(59, 130, 246, 0));
        opacity: 0.8;
      }

      .slider__shadow-label {
        position: absolute;
        top: calc(100% + 12px);
        left: 50%;
        transform: translateX(-50%);
        font-size: 16px;
        font-weight: 600;
        color: rgba(29, 78, 216, 0.9);
        text-shadow: 0 6px 14px rgba(29, 78, 216, 0.18);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.24s ease;
      }

      .slider__shadow--visible {
        opacity: 1;
      }

      .slider__shadow--visible .slider__shadow-label {
        opacity: 1;
      }

      .slider__arrow {
        position: absolute;
        top: calc(50% - clamp(44px, 8vw, 56px));
        height: 8px;
        border-radius: 999px;
        background: transparent;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 0;
      }

      .slider__trail {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        height: 12px;
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.4));
        opacity: 0;
        pointer-events: none;
        transition:
          opacity 0.24s ease,
          left 0.32s cubic-bezier(0.22, 1, 0.36, 1),
          width 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        z-index: 0;
      }

      .slider__trail--visible {
        opacity: 1;
      }

      .slider__arrow-body {
        flex: 1;
        height: 100%;
        border-radius: 999px;
        box-shadow: 0 10px 20px rgba(29, 78, 216, 0.25);
      }

      .slider__arrow-label {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translate(-50%, -100%);
        padding: 6px 16px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(191, 219, 254, 0.85);
        font-size: 15px;
        font-weight: 600;
        color: #0f172a;
        letter-spacing: 0.01em;
        box-shadow:
          0 12px 24px rgba(30, 64, 175, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.85);
        opacity: 0;
        transition: opacity 0.24s ease;
        pointer-events: none;
      }

      .slider__arrow--visible .slider__arrow-label {
        opacity: 1;
      }

      .slider__arrow--visible {
        opacity: 1;
      }

      .slider__arrow-tip {
        width: 0;
        height: 0;
        border-top: 9px solid transparent;
        border-bottom: 9px solid transparent;
        border-left: 9px solid transparent;
        border-right: 9px solid transparent;
      }

      .slider__arrow--positive {
        flex-direction: row;
      }

      .slider__arrow--positive .slider__arrow-tip {
        border-left-color: rgba(29, 78, 216, 0.75);
        margin-left: -2px;
      }

      .slider__arrow--negative {
        flex-direction: row-reverse;
      }

      .slider__arrow--negative .slider__arrow-tip {
        border-right-color: rgba(29, 78, 216, 0.75);
        margin-right: -2px;
      }

      .slider__thumb {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: clamp(44px, 8vw, 52px);
        height: clamp(44px, 8vw, 52px);
        border-radius: 50%;
        background: linear-gradient(150deg, #6366f1, #2563eb);
        box-shadow:
          0 15px 30px rgba(79, 70, 229, 0.35),
          inset 0 2px 8px rgba(255, 255, 255, 0.3);
        touch-action: none;
        cursor: grab;
        display: grid;
        place-items: center;
        transition: left 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        z-index: 3;
      }

      .slider__thumb:active {
        cursor: grabbing;
      }

      .slider__thumb--no-transition {
        transition: none !important;
      }

      .slider__label {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #ffffff;
        font-size: 20px;
        font-weight: 600;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  const root = document.createElement("div");
  root.className = "url2__root";

  const card = document.createElement("div");
  card.className = "url2__card";

  const layout = document.createElement("div");
  layout.className = "url2__layout";

  const modifiers = document.createElement("div");
  modifiers.className = "modifiers";

  const modifiersList = document.createElement("div");
  modifiersList.className = "modifiers__list";
  modifiers.appendChild(modifiersList);

  const sliderArea = document.createElement("div");
  sliderArea.className = "slider-area";

  const readout = document.createElement("div");
  readout.className = "slider__readout";
  sliderArea.appendChild(readout);

  const slider = document.createElement("div");
  slider.className = "slider";

  const track = document.createElement("div");
  track.className = "slider__track";

  const trail = document.createElement("div");
  trail.className = "slider__trail";
  track.appendChild(trail);

  const shadow = document.createElement("div");
  shadow.className = "slider__shadow";
  const shadowRing = document.createElement("div");
  shadowRing.className = "slider__shadow-ring";
  const shadowLabel = document.createElement("span");
  shadowLabel.className = "slider__shadow-label";
  shadow.appendChild(shadowRing);
  shadow.appendChild(shadowLabel);
  track.appendChild(shadow);

  const arrow = document.createElement("div");
  arrow.className = "slider__arrow";
  const arrowBody = document.createElement("div");
  arrowBody.className = "slider__arrow-body";
  const arrowTip = document.createElement("span");
  arrowTip.className = "slider__arrow-tip";
  const arrowLabel = document.createElement("span");
  arrowLabel.className = "slider__arrow-label";
  arrow.appendChild(arrowBody);
  arrow.appendChild(arrowTip);
  arrow.appendChild(arrowLabel);
  track.appendChild(arrow);

  const notchRatios = Array.from({ length: NOTCH_COUNT }, (_, index) =>
    index / (NOTCH_COUNT - 1)
  );

  const createNotch = (index: number) => {
    const notch = document.createElement("span");
    notch.className = "slider__notch";
    notch.dataset.index = String(index);
    notch.style.left =
      index === 0
        ? "0%"
        : index === NOTCH_COUNT - 1
        ? "100%"
        : `${notchRatios[index] * 100}%`;
    return notch;
  };

  for (let i = 0; i < NOTCH_COUNT; i += 1) {
    track.appendChild(createNotch(i));
  }

  const thumb = document.createElement("div");
  thumb.className = "slider__thumb";
  thumb.setAttribute("role", "slider");
  thumb.setAttribute("aria-valuemin", "0");
  thumb.setAttribute("aria-valuemax", String(NOTCH_COUNT - 1));
  thumb.setAttribute("aria-valuenow", "0");
  thumb.setAttribute("tabindex", "0");

  const label = document.createElement("div");
  label.className = "slider__label";
  label.textContent = "0";
  thumb.appendChild(label);

  track.appendChild(thumb);
  slider.appendChild(track);
  sliderArea.appendChild(slider);

  layout.appendChild(modifiers);
  layout.appendChild(sliderArea);

  card.appendChild(layout);
  root.appendChild(card);
  document.body.appendChild(root);

  const readoutValue = document.createElement("span");
  readoutValue.textContent = "0";
  readout.appendChild(readoutValue);

  type ModifierButton = {
    button: HTMLButtonElement;
    delta: number;
  };

  const modifierButtons: ModifierButton[] = [];

  let dragging = false;
  let ratio = 0;
  let trackRect: DOMRect | null = null;
  let currentIndex = 0;
  let baseIndex = 0;
  let activeModifier: number | null = null;
  let animating = false;
  let pendingIndex: number | null = null;

  const updateAriaValue = (value: number) => {
    thumb.setAttribute("aria-valuenow", String(value));
  };

  const isIndexAvailable = (index: number) =>
    index >= 0 && index <= NOTCH_COUNT - 1;

  const canApplyModifier = (origin: number, delta: number) =>
    isIndexAvailable(origin + delta);

  const formatDelta = (value: number) =>
    value > 0 ? `+${value}` : String(value);

  const formatExpression = (origin: number, delta: number) => {
    const operator = delta >= 0 ? "+" : "-";
    const absoluteDelta = Math.abs(delta);
    return `${origin} ${operator} ${absoluteDelta}`;
  };

  const setLabelValue = (value: number) => {
    label.textContent = String(value);
  };

  const updateReadout = () => {
    if (activeModifier === null) {
      readoutValue.textContent = String(baseIndex);
      return;
    }
    readoutValue.textContent = formatExpression(baseIndex, activeModifier);
  };

  const updateModifierButtons = () => {
    modifierButtons.forEach(({ button, delta }) => {
      const isActive = activeModifier === delta;
      const isAvailable = canApplyModifier(baseIndex, delta);
      button.disabled = !isActive && !isAvailable;
      button.classList.toggle("modifiers__button--active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.textContent = formatDelta(delta);
    });
  };

  const requestMeasurements = () => {
    trackRect = track.getBoundingClientRect();
  };

  const setThumbByRatio = (nextRatio: number) => {
    ratio = clamp(nextRatio, 0, 1);
    thumb.style.left = `${ratio * 100}%`;
  };

  const hideTrail = () => {
    trail.classList.remove("slider__trail--visible");
    trail.style.left = "50%";
    trail.style.width = "0%";
  };

  const showTrailBetween = (startRatio: number, endRatio: number) => {
    if (startRatio === endRatio) {
      hideTrail();
      return;
    }
    const minRatio = Math.min(startRatio, endRatio);
    const maxRatio = Math.max(startRatio, endRatio);
    trail.style.left = `${minRatio * 100}%`;
    trail.style.width = `${(maxRatio - minRatio) * 100}%`;
    const isPositive = endRatio > startRatio;
    trail.style.background = isPositive
      ? "linear-gradient(90deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.4))"
      : "linear-gradient(270deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.4))";
    trail.classList.add("slider__trail--visible");
  };

  const hideArrow = () => {
    arrow.classList.remove(
      "slider__arrow--visible",
      "slider__arrow--positive",
      "slider__arrow--negative"
    );
    arrow.style.left = "50%";
    arrow.style.right = "50%";
    arrowBody.style.background = "transparent";
    arrowLabel.textContent = "";
    hideTrail();
  };

  const hideShadow = () => {
    shadow.classList.remove("slider__shadow--visible");
    shadowLabel.textContent = "";
  };

  const showShadowAt = (targetRatio: number, value: number) => {
    shadow.style.left = `${targetRatio * 100}%`;
    shadowLabel.textContent = String(value);
    shadow.classList.add("slider__shadow--visible");
  };

  const showArrowBetween = (
    startRatio: number,
    endRatio: number,
    deltaValue: number
  ) => {
    if (startRatio === endRatio) {
      hideArrow();
      return;
    }
    showTrailBetween(startRatio, endRatio);
    arrow.style.left = `${Math.min(startRatio, endRatio) * 100}%`;
    arrow.style.right = `${(1 - Math.max(startRatio, endRatio)) * 100}%`;
    const isPositive = endRatio > startRatio;
    arrowBody.style.background = isPositive
        ? "linear-gradient(90deg, rgba(37, 99, 235, 0.2), rgba(29, 78, 216, 0.75))"
        : "linear-gradient(90deg, rgba(29, 78, 216, 0.75), rgba(37, 99, 235, 0.2))";
    arrow.classList.add("slider__arrow--visible");
    arrow.classList.remove("slider__arrow--positive", "slider__arrow--negative");
    arrow.classList.add(isPositive ? "slider__arrow--positive" : "slider__arrow--negative");
    arrowLabel.textContent = formatDelta(deltaValue);
  };

  const snapToNearest = () => {
    const closestIndex = notchRatios.reduce(
      (nearest, notchRatio, index) => {
        const distance = Math.abs(ratio - notchRatio);
        return distance < nearest.distance
          ? { distance, index }
          : nearest;
      },
      { distance: Number.POSITIVE_INFINITY, index: 0 }
    ).index;

    const targetRatio = notchRatios[closestIndex];
    setThumbByRatio(targetRatio);
    currentIndex = closestIndex;
    pendingIndex = null;
    updateAriaValue(closestIndex);
    setLabelValue(closestIndex);
    if (activeModifier === null) {
      baseIndex = closestIndex;
    }
    updateReadout();
    updateModifierButtons();
    hideArrow();
    hideShadow();
    animating = false;
    return closestIndex;
  };

  const finishAnimation = (targetIndex: number) => {
    currentIndex = targetIndex;
    ratio = notchRatios[targetIndex];
    animating = false;
    pendingIndex = null;
    updateAriaValue(targetIndex);
    setLabelValue(targetIndex);
    if (activeModifier === null) {
      baseIndex = targetIndex;
    }
    updateReadout();
    updateModifierButtons();
  };

  const animateThumbToIndex = (
    targetIndex: number,
    arrowOriginIndex: number | null,
    arrowDelta: number | null = null
  ) => {
    if (animating) {
      return;
    }

    const clampedTarget = clamp(targetIndex, 0, NOTCH_COUNT - 1);

    if (clampedTarget === currentIndex) {
      setLabelValue(currentIndex);
      if (
        arrowOriginIndex === null ||
        arrowDelta === null ||
        !isIndexAvailable(arrowOriginIndex)
      ) {
        hideArrow();
        hideShadow();
      } else {
        const originRatio = notchRatios[arrowOriginIndex];
        const targetRatio = notchRatios[clampedTarget];
        showShadowAt(originRatio, arrowOriginIndex);
        showArrowBetween(originRatio, targetRatio, arrowDelta);
      }
      return;
    }

    const targetRatio = notchRatios[clampedTarget];

    if (
      arrowOriginIndex !== null &&
      arrowDelta !== null &&
      isIndexAvailable(arrowOriginIndex)
    ) {
      const originRatio = notchRatios[arrowOriginIndex];
      showShadowAt(originRatio, arrowOriginIndex);
      showArrowBetween(originRatio, targetRatio, arrowDelta);
    } else {
      hideArrow();
      hideShadow();
    }

    animating = true;
    pendingIndex = clampedTarget;
    thumb.classList.remove("slider__thumb--no-transition");
    setLabelValue(clampedTarget);

    requestAnimationFrame(() => {
      setThumbByRatio(targetRatio);
    });
  };

  const activateModifier = (delta: number) => {
    if (!canApplyModifier(baseIndex, delta)) {
      return;
    }
    activeModifier = delta;
    updateModifierButtons();
    updateReadout();
    const targetIndex = baseIndex + delta;
    animateThumbToIndex(targetIndex, baseIndex, delta);
  };

  const deactivateModifier = () => {
    if (activeModifier === null) {
      return;
    }
    const originIndex = currentIndex;
    activeModifier = null;
    updateModifierButtons();
    updateReadout();
    if (originIndex === baseIndex) {
      hideArrow();
      hideShadow();
      setLabelValue(baseIndex);
      return;
    }
    animateThumbToIndex(baseIndex, originIndex, null);
  };

  const clearModifierForDrag = () => {
    if (activeModifier === null) {
      return;
    }
    activeModifier = null;
    baseIndex = currentIndex;
    setLabelValue(currentIndex);
    hideArrow();
    hideShadow();
    updateReadout();
    updateModifierButtons();
  };

  const handleModifierToggle = (delta: number) => {
    if (activeModifier === delta) {
      deactivateModifier();
      return;
    }
    activateModifier(delta);
  };

  MODIFIERS.forEach((delta) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modifiers__button";
    button.dataset.delta = String(delta);
    button.setAttribute("aria-pressed", "false");
    button.textContent = formatDelta(delta);

    button.addEventListener("click", () => {
      if (animating) {
        return;
      }
      handleModifierToggle(delta);
    });

    modifierButtons.push({
      button,
      delta,
    });
    modifiersList.appendChild(button);
  });

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragging || animating) {
      return;
    }
    event.preventDefault();
    if (!trackRect) {
      requestMeasurements();
    }
    if (!trackRect) {
      return;
    }
    const relative = event.clientX - trackRect.left;
    const nextRatio = trackRect.width ? relative / trackRect.width : 0;
    setThumbByRatio(nextRatio);
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (!dragging) {
      return;
    }
    event.preventDefault();
    dragging = false;
    thumb.classList.remove("slider__thumb--no-transition");
    if (thumb.hasPointerCapture(event.pointerId)) {
      thumb.releasePointerCapture(event.pointerId);
    }
    snapToNearest();
  };

  thumb.addEventListener("pointerdown", (event) => {
    if (animating) {
      return;
    }
    if (activeModifier !== null) {
      clearModifierForDrag();
    }
    event.preventDefault();
    thumb.setPointerCapture(event.pointerId);
    dragging = true;
    thumb.classList.add("slider__thumb--no-transition");
    setLabelValue(currentIndex);
    hideArrow();
    hideShadow();
    requestMeasurements();
  });

  thumb.addEventListener("pointermove", handlePointerMove);
  thumb.addEventListener("pointerup", handlePointerUp);
  thumb.addEventListener("pointercancel", handlePointerUp);

  thumb.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "left" || pendingIndex === null) {
      return;
    }
    finishAnimation(pendingIndex);
  });

  window.addEventListener("resize", requestMeasurements);

  requestAnimationFrame(() => {
    requestMeasurements();
    setThumbByRatio(0);
    snapToNearest();
  });
};
