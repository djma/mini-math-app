const normalizePathname = (pathname: string) => {
  if (!pathname || pathname === "/") {
    return "/";
  }
  return pathname.replace(/\/+$/, "") || "/";
};

const showStatusMessage = (message: string) => {
  document.body.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.display = "grid";
  wrapper.style.placeItems = "center";
  wrapper.style.minHeight = "100vh";
  wrapper.style.padding = "40px 24px";
  wrapper.style.background = "radial-gradient(circle at top, #1e3a8a, #0f172a)";
  wrapper.style.color = "#f8fafc";
  wrapper.style.fontFamily =
    '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

  const text = document.createElement("div");
  text.style.display = "grid";
  text.style.gap = "16px";
  text.style.textAlign = "center";

  const heading = document.createElement("h1");
  heading.textContent = message;
  heading.style.margin = "0";
  heading.style.fontSize = "clamp(28px, 4vw, 48px)";
  heading.style.fontWeight = "700";

  const hint = document.createElement("p");
  hint.textContent = "Try visiting /1 or check back soon for new experiments.";
  hint.style.margin = "0";
  hint.style.fontSize = "clamp(16px, 2vw, 20px)";
  hint.style.opacity = "0.7";

  text.appendChild(heading);
  text.appendChild(hint);
  wrapper.appendChild(text);
  document.body.appendChild(wrapper);
};

const start = async () => {
  const normalizedPath = normalizePathname(window.location.pathname);

  if (normalizedPath === "/") {
    window.location.replace("/1");
    return;
  }

  const routes: Record<string, () => Promise<void>> = {
    "/1": async () => {
      await import("./apps/url1");
    },
    "/2": async () => {
      const app = await import("./apps/url2");
      if ("mountUrlTwo" in app && typeof app.mountUrlTwo === "function") {
        app.mountUrlTwo();
      }
    },
  };

  const handler = routes[normalizedPath];

  if (!handler) {
    showStatusMessage("That page is not available.");
    return;
  }

  try {
    await handler();
  } catch (error) {
    console.error(`Failed to initialize route ${normalizedPath}`, error);
    showStatusMessage("We hit a snag loading that experience.");
  }
};

void start();
