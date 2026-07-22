let pathEl = null;
let glowEl = null;
let timelineEl = null;
let animated = false;

export function initSVG(timelineContainer) {
  timelineEl = timelineContainer;

  if (pathEl) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const svgEl = document.createElementNS(svgNS, "svg");
  svgEl.setAttribute("class", "timeline-svg");
  svgEl.setAttribute("width", "100%");
  svgEl.setAttribute("height", "100%");
  svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const defs = document.createElementNS(svgNS, "defs");
  const gradient = document.createElementNS(svgNS, "linearGradient");
  gradient.setAttribute("id", "timeline-gradient");
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("y1", "0%");
  gradient.setAttribute("x2", "100%");
  gradient.setAttribute("y2", "100%");

  const stop1 = document.createElementNS(svgNS, "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "var(--color-brand)");
  const stop2 = document.createElementNS(svgNS, "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "var(--color-accent-blue)");

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svgEl.appendChild(defs);

  glowEl = document.createElementNS(svgNS, "path");
  glowEl.setAttribute("class", "timeline-glow");
  glowEl.setAttribute("fill", "none");
  glowEl.setAttribute("stroke", "var(--color-accent-blue)");
  glowEl.setAttribute("stroke-width", "12");
  glowEl.setAttribute("opacity", "0.12");

  pathEl = document.createElementNS(svgNS, "path");
  pathEl.setAttribute("class", "timeline-path");
  pathEl.setAttribute("fill", "none");
  pathEl.setAttribute("stroke", "url(#timeline-gradient)");
  pathEl.setAttribute("stroke-width", "3");
  pathEl.setAttribute("stroke-linecap", "round");
  pathEl.setAttribute("stroke-linejoin", "round");

  svgEl.appendChild(glowEl);
  svgEl.appendChild(pathEl);
  timelineEl.prepend(svgEl);
}

function getMarkerPositions() {
  const visibleHitos = timelineEl.querySelectorAll(".hito:not(.hito--hidden)");
  const markers = [...visibleHitos].map((hito) =>
    hito.querySelector(".hito-marker"),
  );

  if (markers.length === 0) return [];

  const timelineRect = timelineEl.getBoundingClientRect();

  return markers.map((marker) => {
    const rect = marker.getBoundingClientRect();
    return {
      x: rect.left - timelineRect.left + rect.width / 2,
      y: rect.top - timelineRect.top + rect.height / 2,
    };
  });
}

function buildBezierPath(positions) {
  let pathData = "";

  positions.forEach((point, index) => {
    const { x, y } = point;

    if (index === 0) {
      pathData += `M ${x} ${y} `;
      return;
    }

    const prev = positions[index - 1];
    const dx = x - prev.x;
    const dy = y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const tension = 0.35;
    const controlX1 = prev.x + dx * tension;
    const controlY1 = prev.y + dy * 0.1;
    const controlX2 = x - dx * tension;
    const controlY2 = y - dy * 0.1;

    pathData += `C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x} ${y} `;
  });

  return pathData;
}

function animatePath() {
  const length = pathEl.getTotalLength();

  pathEl.style.strokeDasharray = length;
  pathEl.style.strokeDashoffset = length;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      pathEl.style.strokeDashoffset = "0";
    });
  });
}

export function renderPath() {
  if (!pathEl) return;

  const positions = getMarkerPositions();
  if (positions.length === 0) {
    pathEl.setAttribute("d", "");
    glowEl.setAttribute("d", "");
    return;
  }

  const pathData = buildBezierPath(positions);
  pathEl.setAttribute("d", pathData);
  glowEl.setAttribute("d", pathData);

  if (!animated) {
    animatePath();
    animated = true;
  } else {
    pathEl.style.strokeDasharray = "";
    pathEl.style.strokeDashoffset = "";
    glowEl.style.strokeDasharray = "";
    glowEl.style.strokeDashoffset = "";
  }
}
