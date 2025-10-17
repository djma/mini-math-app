export const mountUrlTwo = () => {
  document.body.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.minHeight = "100vh";
  wrapper.style.display = "grid";
  wrapper.style.placeItems = "center";
  wrapper.style.padding = "48px 24px";
  wrapper.style.background =
    "linear-gradient(135deg, rgba(16, 185, 129, 0.85), rgba(59, 130, 246, 0.9))";
  wrapper.style.fontFamily =
    '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  wrapper.style.color = "#0f172a";
  wrapper.style.textAlign = "center";
  wrapper.style.gap = "16px";

  const heading = document.createElement("h1");
  heading.textContent = "URL 2 playground coming soon";
  heading.style.margin = "0";
  heading.style.fontSize = "clamp(32px, 6vw, 56px)";
  heading.style.fontWeight = "800";

  const description = document.createElement("p");
  description.textContent =
    "We are about to build a fresh mini webapp here. Check back shortly!";
  description.style.margin = "0";
  description.style.fontSize = "clamp(18px, 2.6vw, 22px)";
  description.style.opacity = "0.8";

  wrapper.appendChild(heading);
  wrapper.appendChild(description);
  document.body.appendChild(wrapper);
};
