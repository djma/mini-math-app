import { disableContextMenuAndZoom } from "../utils/interactionGuards";

const TAU = Math.PI * 2;
const TOTAL_MINUTES = 12 * 60;
const MINUTES_PER_HOUR = 60;

const normalizeTime = (value: number) => {
  const normalized = value % TOTAL_MINUTES;
  return normalized < 0 ? normalized + TOTAL_MINUTES : normalized;
};

const formatDigitalTime = (minutes: number) => {
  const normalized = normalizeTime(minutes);
  let hours = Math.floor(normalized / MINUTES_PER_HOUR);
  let mins = Math.floor(normalized % MINUTES_PER_HOUR);

  if (mins === MINUTES_PER_HOUR) {
    mins = 0;
    hours = (hours + 1) % 12;
  }

  const displayHour = hours === 0 ? 12 : hours;
  const minuteString = mins.toString().padStart(2, "0");
  return `${displayHour}:${minuteString}`;
};

const ensureStyles = () => {
  if (document.getElementById("url4-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "url4-styles";
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
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(24px, 5vw, 64px);
      background: radial-gradient(circle at top, #fdf2f8 0%, #e0f2fe 60%, #bfdbfe 100%);
      font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
    }

    .url4__root {
      width: min(520px, 100%);
    }

    .url4__card {
      background: rgba(255, 255, 255, 0.96);
      border-radius: clamp(26px, 5vw, 36px);
      padding: clamp(28px, 6vw, 44px);
      box-shadow:
        0 30px 60px rgba(15, 23, 42, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.7);
      display: grid;
      gap: clamp(24px, 5vw, 36px);
      justify-items: center;
    }

    .url4__title {
      margin: 0;
      font-size: clamp(20px, 3.6vw, 28px);
      font-weight: 700;
      text-align: center;
      letter-spacing: 0.02em;
      color: rgba(15, 23, 42, 0.9);
    }

    .url4__clock {
      position: relative;
      width: min(420px, calc(100vw - 96px));
      aspect-ratio: 1 / 1;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #ffffff 0%, #f8fafc 55%, #e2e8f0 100%);
      border: clamp(10px, 2.6vw, 14px) solid rgba(15, 23, 42, 0.05);
      box-shadow:
        0 20px 50px rgba(15, 23, 42, 0.12),
        inset 0 6px 10px rgba(255, 255, 255, 0.8),
        inset 0 -6px 12px rgba(15, 23, 42, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .url4__face {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }

    .url4__marker {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      transform: rotate(var(--angle));
    }

    .url4__marker-line {
      position: absolute;
      top: clamp(14px, 4.4vw, 22px);
      left: 50%;
      width: clamp(2px, 0.4vw, 3px);
      height: clamp(12px, 2.6vw, 18px);
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.35);
      transform: translateX(-50%);
    }

    .url4__marker-line--major {
      top: clamp(10px, 3.6vw, 18px);
      width: clamp(3px, 0.5vw, 4px);
      height: clamp(20px, 4vw, 28px);
      background: rgba(15, 23, 42, 0.55);
    }

    .url4__number {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: clamp(16px, 3vw, 22px);
      font-weight: 600;
      color: rgba(15, 23, 42, 0.85);
      text-shadow: 0 6px 12px rgba(15, 23, 42, 0.06);
      pointer-events: none;
    }

    .url4__hand {
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: 50% 100%;
      transform: translate(-50%, -100%) rotate(var(--angle, 0deg));
      border-radius: 999px;
      cursor: grab;
      touch-action: none;
      user-select: none;
      transition: box-shadow 0.2s ease;
    }

    .url4__hand::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translate(-50%, 60%);
      width: clamp(10px, 2vw, 14px);
      height: clamp(10px, 2vw, 14px);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.78);
      box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.18);
    }

    .url4__hand--hour {
      width: clamp(12px, 2.4vw, 16px);
      height: 28.8%;
      background: linear-gradient(180deg, #f87171 0%, #b91c1c 100%);
      box-shadow: 0 10px 18px rgba(239, 68, 68, 0.28);
    }

    .url4__hand--minute {
      width: clamp(8px, 1.8vw, 12px);
      height: 46%;
      background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
      box-shadow: 0 12px 20px rgba(59, 130, 246, 0.28);
    }

    .url4__hand--dragging {
      cursor: grabbing;
      box-shadow: 0 14px 24px rgba(15, 23, 42, 0.2);
    }

    .url4__pivot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: clamp(18px, 3.2vw, 24px);
      height: clamp(18px, 3.2vw, 24px);
      background: radial-gradient(circle, #ffffff 0%, #cbd5f5 100%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow:
        0 6px 16px rgba(15, 23, 42, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.9);
      pointer-events: none;
    }

    .url4__digital {
      font-size: clamp(28px, 7vw, 44px);
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #1f2937;
      text-shadow: 0 10px 20px rgba(15, 23, 42, 0.15);
    }

    .url4__hint {
      margin: 0;
      text-align: center;
      font-size: clamp(14px, 3.2vw, 17px);
      line-height: 1.4;
      color: rgba(15, 23, 42, 0.7);
      max-width: 32ch;
    }
  `;
  document.head.appendChild(style);
};

export const mountUrlFour = () => {
  disableContextMenuAndZoom();
  document.body.innerHTML = "";
  ensureStyles();

  const root = document.createElement("div");
  root.className = "url4__root";

  const card = document.createElement("div");
  card.className = "url4__card";

  const clock = document.createElement("div");
  clock.className = "url4__clock";

  const face = document.createElement("div");
  face.className = "url4__face";

  for (let i = 0; i < 60; i += 1) {
    const marker = document.createElement("div");
    marker.className = "url4__marker";
    marker.style.setProperty("--angle", `${i * 6}deg`);

    const line = document.createElement("div");
    line.className = "url4__marker-line";
    if (i % 5 === 0) {
      line.classList.add("url4__marker-line--major");
    }

    marker.appendChild(line);
    face.appendChild(marker);
  }

  const numberRadius = 34;
  for (let i = 1; i <= 12; i += 1) {
    const number = document.createElement("div");
    number.className = "url4__number";
    number.textContent = `${i}`;

    const angle = (i / 12) * TAU;
    const xOffset = Math.sin(angle) * numberRadius;
    const yOffset = Math.cos(angle) * numberRadius;

    number.style.left = `${50 + xOffset}%`;
    number.style.top = `${50 - yOffset}%`;

    face.appendChild(number);
  }

  const minuteHand = document.createElement("div");
  minuteHand.className = "url4__hand url4__hand--minute";

  const hourHand = document.createElement("div");
  hourHand.className = "url4__hand url4__hand--hour";

  const pivot = document.createElement("div");
  pivot.className = "url4__pivot";

  face.appendChild(minuteHand);
  face.appendChild(hourHand);
  face.appendChild(pivot);
  clock.appendChild(face);

  const digital = document.createElement("div");
  digital.className = "url4__digital";

  card.appendChild(clock);
  card.appendChild(digital);
  root.appendChild(card);
  document.body.appendChild(root);

  const angleFromPointer = (event: PointerEvent) => {
    const rect = face.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const raw = Math.atan2(event.clientY - cy, event.clientX - cx);
    const adjusted = raw + Math.PI / 2;
    const normalized = (adjusted + TAU) % TAU;
    return Number.isNaN(normalized) ? 0 : normalized;
  };

  const normalizeAngleDelta = (delta: number) => {
    const wrapped = ((((delta + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
    return Number.isNaN(wrapped) ? 0 : wrapped;
  };

  const initial = new Date();
  let timeMinutes = normalizeTime(
    (initial.getHours() % 12) * MINUTES_PER_HOUR + initial.getMinutes()
  );

  const updateClock = () => {
    timeMinutes = normalizeTime(timeMinutes);
    const minuteAngle =
      ((timeMinutes % MINUTES_PER_HOUR) / MINUTES_PER_HOUR) * 360;
    const hourAngle = (timeMinutes / TOTAL_MINUTES) * 360;

    minuteHand.style.setProperty("--angle", `${minuteAngle}deg`);
    hourHand.style.setProperty("--angle", `${hourAngle}deg`);
    digital.textContent = formatDigitalTime(timeMinutes);
  };

  let isHourDragging = false;
  let hourPointerId: number | null = null;

  const setTimeFromHour = (event: PointerEvent) => {
    const angle = angleFromPointer(event);
    timeMinutes = normalizeTime((angle / TAU) * TOTAL_MINUTES);
    updateClock();
  };

  hourHand.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    isHourDragging = true;
    hourPointerId = event.pointerId;
    hourHand.classList.add("url4__hand--dragging");
    hourHand.setPointerCapture(event.pointerId);
    setTimeFromHour(event);
  });

  hourHand.addEventListener("pointermove", (event) => {
    if (!isHourDragging || event.pointerId !== hourPointerId) {
      return;
    }
    setTimeFromHour(event);
  });

  const endHourDrag = (event: PointerEvent) => {
    if (event.pointerId !== hourPointerId) {
      return;
    }
    isHourDragging = false;
    hourPointerId = null;
    hourHand.classList.remove("url4__hand--dragging");
    try {
      hourHand.releasePointerCapture(event.pointerId);
    } catch {
      // capture was already released
    }
  };

  hourHand.addEventListener("pointerup", endHourDrag);
  hourHand.addEventListener("pointercancel", endHourDrag);

  let minuteDragState: { pointerId: number; previousAngle: number } | null =
    null;

  minuteHand.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const angle = angleFromPointer(event);
    minuteDragState = { pointerId: event.pointerId, previousAngle: angle };
    minuteHand.classList.add("url4__hand--dragging");
    minuteHand.setPointerCapture(event.pointerId);
  });

  minuteHand.addEventListener("pointermove", (event) => {
    if (!minuteDragState || event.pointerId !== minuteDragState.pointerId) {
      return;
    }

    const angle = angleFromPointer(event);
    const delta = normalizeAngleDelta(angle - minuteDragState.previousAngle);
    const minuteDelta = (delta / TAU) * MINUTES_PER_HOUR;
    timeMinutes = normalizeTime(timeMinutes + minuteDelta);
    minuteDragState.previousAngle = angle;
    updateClock();
  });

  const endMinuteDrag = (event: PointerEvent) => {
    if (!minuteDragState || event.pointerId !== minuteDragState.pointerId) {
      return;
    }
    minuteHand.classList.remove("url4__hand--dragging");
    minuteDragState = null;
    try {
      minuteHand.releasePointerCapture(event.pointerId);
    } catch {
      // capture was already released
    }
  };

  minuteHand.addEventListener("pointerup", endMinuteDrag);
  minuteHand.addEventListener("pointercancel", endMinuteDrag);

  updateClock();
};
