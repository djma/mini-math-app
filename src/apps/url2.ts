const NOTCH_COUNT = 6;

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
        width: min(520px, calc(100vw - 48px));
        background: rgba(255, 255, 255, 0.92);
        border-radius: 28px;
        padding: clamp(28px, 4vw, 40px);
        box-shadow:
          0 40px 90px rgba(30, 41, 59, 0.32),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        display: grid;
        gap: clamp(24px, 4vw, 32px);
      }

      .url2__title {
        margin: 0;
        text-align: center;
        font-size: clamp(28px, 5vw, 40px);
        font-weight: 700;
        color: #1e293b;
      }

      .slider {
        position: relative;
        padding: 36px clamp(16px, 6vw, 24px);
      }

      .slider__track {
        position: relative;
        margin: 0 auto;
        width: min(440px, calc(100% - 16px));
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
      }

      .slider__thumb:active {
        cursor: grabbing;
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

  const title = document.createElement("h1");
  title.className = "url2__title";
  title.textContent = "Pick a notch";

  const slider = document.createElement("div");
  slider.className = "slider";

  const track = document.createElement("div");
  track.className = "slider__track";

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

  const createNotch = (index: number) => {
    const notch = document.createElement("span");
    notch.className = "slider__notch";
    notch.dataset.index = String(index);
    notch.style.left =
      index === 0
        ? "0%"
        : index === NOTCH_COUNT - 1
        ? "100%"
        : `${(index / (NOTCH_COUNT - 1)) * 100}%`;
    return notch;
  };

  for (let i = 0; i < NOTCH_COUNT; i += 1) {
    track.appendChild(createNotch(i));
  }

  track.appendChild(thumb);
  slider.appendChild(track);

  card.appendChild(title);
  card.appendChild(slider);

  root.appendChild(card);
  document.body.appendChild(root);

  let dragging = false;
  let ratio = 0;
  let trackRect: DOMRect;

  const notchRatios = Array.from({ length: NOTCH_COUNT }, (_, index) =>
    index / (NOTCH_COUNT - 1)
  );

  const updateAriaValue = (value: number) => {
    thumb.setAttribute("aria-valuenow", String(value));
  };

  const toggleLabel = (visible: boolean, value: number) => {
    label.textContent = String(value);
    label.classList.toggle("slider__label--visible", visible);
  };

  const requestMeasurements = () => {
    trackRect = track.getBoundingClientRect();
  };

  const setThumbByRatio = (nextRatio: number) => {
    ratio = clamp(nextRatio, 0, 1);
    thumb.style.left = `${ratio * 100}%`;
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
    updateAriaValue(closestIndex);
    toggleLabel(showLabel, closestIndex);
    return closestIndex;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragging) {
      return;
    }
    event.preventDefault();
    if (!trackRect) {
      requestMeasurements();
    }
    const relative =
      event.clientX - trackRect.left;
    const nextRatio = trackRect.width
      ? relative / trackRect.width
      : 0;
    setThumbByRatio(nextRatio);
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (!dragging) {
      return;
    }
    event.preventDefault();
    thumb.releasePointerCapture(event.pointerId);
    dragging = false;
    snapToNearest();
  };

  thumb.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    thumb.setPointerCapture(event.pointerId);
    dragging = true;
    toggleLabel(false, Number(label.textContent ?? "0"));
    requestMeasurements();
  });

  thumb.addEventListener("pointermove", handlePointerMove);
  thumb.addEventListener("pointerup", handlePointerUp);
  thumb.addEventListener("pointercancel", handlePointerUp);

  window.addEventListener("resize", requestMeasurements);

  // Ensure initial measurements and snap state are set after layout.
  requestAnimationFrame(() => {
    requestMeasurements();
    snapToNearest(false);
  });
};
