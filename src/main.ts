import p5 from "p5";

type SketchParams = {
  lineLengthScale: number;
};

const params: SketchParams = {
  lineLengthScale: 0.6,
};

const createControls = (p: p5, onChange: () => void) => {
  const container = p.createDiv();
  container.id("controls");
  container.style("position", "absolute");
  container.style("top", "16px");
  container.style("left", "16px");
  container.style("padding", "14px");
  container.style("background", "rgba(250, 250, 250, 0.95)");
  container.style("border", "1px solid #bbb");
  container.style("border-radius", "4px");
  container.style("font-family", "sans-serif");
  container.style("font-size", "14px");
  container.style("color", "#1a1a1a");
  container.style("box-shadow", "0 2px 6px rgba(0, 0, 0, 0.1)");

  const labelText = () =>
    `Line length scale: ${params.lineLengthScale.toFixed(2)}`;
  const label = p.createDiv(labelText());
  label.parent(container);
  label.style("margin-bottom", "8px");
  label.style("font-weight", "600");
  label.style("color", "#1a1a1a");

  const slider = p.createSlider(0, 2, params.lineLengthScale, 0.01);
  slider.parent(container);
  slider.style("width", "200px");
  slider.input(() => {
    params.lineLengthScale = Number(slider.value());
    label.html(labelText());
    onChange();
  });
};

const lineLengthFactor = 0.2; // scales normalized radial distance into line length

// (x - 0)(x - 1) + k = y
//

const lineLengthFromNormRadius = (normRadius: number, scale: number) => {
  return scale * (normRadius + 0.2) * (normRadius - 1.2) + 0.1;
  // normRadius * lineLengthFactor;
};

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.angleMode("degrees");
    p.noLoop();
    createControls(p, () => {
      p.redraw();
    });
    p.redraw();
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    p.redraw();
  };

  p.draw = () => {
    p.background("#ffffff");
    p.translate(p.width / 2, p.height / 2);

    const maxRadius = Math.min(p.width, p.height) * 0.45;
    const totalPoints = 1020;
    const goldenAngle = 137.50776405003785;
    p.noFill();

    for (let i = 0; i < totalPoints; i += 1) {
      const ratio = i / (totalPoints - 1);
      const normRadius = Math.sqrt(ratio);
      const r = normRadius * maxRadius;
      const angle = p.radians(i * goldenAngle);
      const unitX = Math.cos(angle);
      const unitY = Math.sin(angle);
      const lineLength =
        lineLengthFromNormRadius(normRadius, params.lineLengthScale) *
        maxRadius;
      const startRadius = Math.max(0, r - lineLength / 2);
      const endRadius = startRadius + lineLength;
      const x1 = unitX * startRadius;
      const y1 = unitY * startRadius;
      const x2 = unitX * endRadius;
      const y2 = unitY * endRadius;
      p.strokeWeight(1);
      p.stroke(0);
      p.line(x1, y1, x2, y2);
    }
  };
};

new p5(sketch);
