let interactionsDisabled = false;

export const disableContextMenuAndZoom = () => {
  if (interactionsDisabled) {
    return;
  }
  interactionsDisabled = true;

  // Prevent browser UI gestures so dragging stays consistent across devices.
  const preventDefault = (event: Event) => {
    event.preventDefault();
  };

  document.addEventListener("contextmenu", preventDefault);

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
    }
  };

  document.addEventListener("wheel", handleWheel, { passive: false });

  document.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === "+" || event.key === "-" || event.key === "=" || event.key === "0")
    ) {
      event.preventDefault();
    }
  });

  ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    document.addEventListener(eventName as any, preventDefault, { passive: false });
  });
};
