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
        min-width: 72px;
        padding: 10px 18px;
        border-radius: 999px;
        border: 2px solid transparent;
        background: rgba(59, 130, 246, 0.12);
        color: #1d4ed8;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
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
        width: clamp(40px, 7vw, 48px);
        height: clamp(40px, 7vw, 48px);
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, rgba(79, 70, 229, 0.28), rgba(15, 23, 42, 0.08));
        opacity: 0;
        transition: opacity 0.24s ease;
        pointer-events: none;
        z-index: 1;
      }

      .slider__shadow--visible {
        opacity: 0.45;
      }

      .slider__arrow {
        position: absolute;
        top: calc(50% - clamp(44px, 8vw, 56px));
        height: 6px;
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(37, 99, 235, 0.2), rgba(29, 78, 216, 0.75));
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 2;
      }

      .slider__arrow--visible {
        opacity: 1;
      }

      .slider__arrow::after {
        content: "";
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        border: 9px solid transparent;
      }

      .slider__arrow--positive::after {
        right: -2px;
        border-left-color: rgba(29, 78, 216, 0.75);
      }

      .slider__arrow--negative::after {
        left: -2px;
        border-right-color: rgba(29, 78, 216, 0.75);
      }

      .slider__arrow--negative {
        background: linear-gradient(90deg, rgba(29, 78, 216, 0.75), rgba(37, 99, 235, 0.2));
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
        top: -32px;
        left: 50%;
        transform: translate(-50%, 0);
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(30, 64, 175, 0.94);
        color: white;
        font-size: 14px;
        font-weight: 600;
        opacity: 0;
        transition: opacity 0.18s ease, transform 0.18s ease;
        pointer-events: none;
      }

      .slider__label--visible {
        opacity: 1;
        transform: translate(-50%, -4px);
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

  const modifiersTitle = document.createElement("span");
  modifiersTitle.className = "modifiers__title";
  modifiersTitle.textContent = "Modifier";
  modifiers.appendChild(modifiersTitle);

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

  const shadow = document.createElement("div");
  shadow.className = "slider__shadow";
  track.appendChild(shadow);

  const arrow = document.createElement("div");
  arrow.className = "slider__arrow";
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

  const modifierButtons: HTMLButtonElement[] = [];

  let dragging = false;
  let ratio = 0;
  let trackRect: DOMRect | null = null;
  let currentIndex = 0;
  let animating = false;
  let pendingIndex: number | null = null;

  const updateAriaValue = (value: number) => {
    thumb.setAttribute("aria-valuenow", String(value));
  };

  const toggleLabel = (visible: boolean, value: number) => {
    label.textContent = String(value);
    label.classList.toggle("slider__label--visible", visible);
  };

  const updateReadout = (value: number) => {
    readoutValue.textContent = String(value);
  };

  const requestMeasurements = () => {
    trackRect = track.getBoundingClientRect();
  };

  const setThumbByRatio = (nextRatio: number) => {
    ratio = clamp(nextRatio, 0, 1);
    thumb.style.left = `${ratio * 100}%`;
  };

  const hideArrow = () => {
    arrow.classList.remove(
      "slider__arrow--visible",
      "slider__arrow--positive",
      "slider__arrow--negative"
    );
    arrow.style.left = "50%";
    arrow.style.right = "50%";
  };

  const hideShadow = () => {
    shadow.classList.remove("slider__shadow--visible");
  };

  const showShadowAt = (targetRatio: number) => {
    shadow.style.left = `${targetRatio * 100}%`;
    shadow.classList.add("slider__shadow--visible");
  };

  const showArrowBetween = (startRatio: number, endRatio: number) => {
    if (startRatio === endRatio) {
      hideArrow();
      return;
    }
    arrow.style.left = `${Math.min(startRatio, endRatio) * 100}%`;
    arrow.style.right = `${(1 - Math.max(startRatio, endRatio)) * 100}%`;
    arrow.classList.add("slider__arrow--visible");
    arrow.classList.toggle("slider__arrow--positive", endRatio > startRatio);
    arrow.classList.toggle("slider__arrow--negative", endRatio < startRatio);
  };

  const snapToNearest = (showLabel = true) => {
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
    toggleLabel(showLabel, closestIndex);
    updateReadout(closestIndex);
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
    toggleLabel(true, targetIndex);
    updateReadout(targetIndex);
  };

  const applyModifier = (delta: number) => {
    if (animating) {
      return;
    }

    const startIndex = currentIndex;
    const targetIndex = clamp(startIndex + delta, 0, NOTCH_COUNT - 1);
    if (targetIndex === startIndex) {
      toggleLabel(true, currentIndex);
      return;
    }

    const startRatio = notchRatios[startIndex];
    const targetRatio = notchRatios[targetIndex];

    showShadowAt(startRatio);
    showArrowBetween(startRatio, targetRatio);

    animating = true;
    pendingIndex = targetIndex;
    thumb.classList.remove("slider__thumb--no-transition");
    toggleLabel(false, targetIndex);

    requestAnimationFrame(() => {
      setThumbByRatio(targetRatio);
    });
  };

  MODIFIERS.forEach((delta) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modifiers__button";
    button.dataset.delta = String(delta);
    button.textContent = delta > 0 ? `+${delta}` : String(delta);
    button.addEventListener("click", () => {
      if (animating) {
        return;
      }
      applyModifier(delta);
    });
    modifierButtons.push(button);
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
    mergeButton.disabled = selectedModifier === null;
  };

  thumb.addEventListener("pointerdown", (event) => {
    if (animating) {
      return;
    }
    event.preventDefault();
    thumb.setPointerCapture(event.pointerId);
    dragging = true;
    thumb.classList.add("slider__thumb--no-transition");
    toggleLabel(false, currentIndex);
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
