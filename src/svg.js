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
  stop1.style.setProperty("stop-color", "var(--color-brand)");
  const stop2 = document.createElementNS(svgNS, "stop");
  stop2.setAttribute("offset", "100%");
  stop2.style.setProperty("stop-color", "var(--color-accent-blue)");

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svgEl.appendChild(defs);

  glowEl = document.createElementNS(svgNS, "path");
  glowEl.setAttribute("class", "timeline-glow");
  glowEl.setAttribute("fill", "none");
  glowEl.setAttribute("stroke", "var(--color-accent-blue)");
  glowEl.setAttribute("stroke-width", "24");
  glowEl.setAttribute("opacity", "0.08");
  glowEl.setAttribute("stroke-linecap", "round");
  glowEl.setAttribute("stroke-linejoin", "round");

  pathEl = document.createElementNS(svgNS, "path");
  pathEl.setAttribute("class", "timeline-path");
  pathEl.setAttribute("fill", "none");
  pathEl.setAttribute("stroke", "url(#timeline-gradient)");
  pathEl.setAttribute("stroke-width", "8");
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

function buildSmoothPath(positions, tension = 0) {
  if (positions.length < 2) return "";

  const first = positions[0];
  const second = positions[1];
  const virtualStart = {
    x: first.x + (first.x - second.x),
    y: first.y + (first.y - second.y),
  };

  const last = positions[positions.length - 1];
  const secondToLast = positions[positions.length - 2];
  const virtualEnd = {
    x: last.x + (last.x - secondToLast.x),
    y: last.y + (last.y - secondToLast.y),
  };

  const extended = [virtualStart, ...positions, virtualEnd];

  let pathData = `M ${positions[0].x} ${positions[0].y} `;

  for (let i = 1; i < extended.length - 2; i++) {
    const p0 = extended[i - 1];
    const p1 = extended[i];
    const p2 = extended[i + 1];
    const p3 = extended[i + 2];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    pathData += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `;
  }

  return pathData;
}

function animatePath() {
  const length = pathEl.getTotalLength();

  pathEl.style.strokeDasharray = length;
  pathEl.style.strokeDashoffset = length;
  glowEl.style.strokeDasharray = length;
  glowEl.style.strokeDashoffset = length;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      pathEl.style.strokeDashoffset = "0";
      glowEl.style.strokeDashoffset = "0";
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

  const visibleHitos = timelineEl.querySelectorAll(".hito:not(.hito--hidden)");
  const timelineRect = timelineEl.getBoundingClientRect();
  const cardRects = [...visibleHitos].map((hito) => {
    const card = hito.querySelector(".hito-card");
    const rect = card.getBoundingClientRect();
    return {
      top: rect.top - timelineRect.top,
      bottom: rect.bottom - timelineRect.top,
    };
  });

  const extended = [];

  for (let i = 0; i < positions.length; i++) {
    extended.push(positions[i]);
    if (i < positions.length - 1) {
      const ncY = cardRects[i].bottom + 16;
      const ncBelow = { x: positions[i].x, y: ncY };
      const ncAbove = { x: positions[i + 1].x, y: ncY };
      extended.push(ncBelow, ncAbove);
    }
  }

  const pathData = buildSmoothPath(extended);
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
