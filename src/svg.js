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

function buildRoundedPath(points, cornerRadius) {
  if (points.length < 2) return "";

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const dxIn = curr.x - prev.x;
    const dyIn = curr.y - prev.y;
    const lenIn = Math.sqrt(dxIn * dxIn + dyIn * dyIn);
    const dxOut = next.x - curr.x;
    const dyOut = next.y - curr.y;
    const lenOut = Math.sqrt(dxOut * dxOut + dyOut * dyOut);

    const r = Math.min(cornerRadius, lenIn / 2, lenOut / 2);

    if (r <= 0) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const ratioIn = r / lenIn;
    const ratioOut = r / lenOut;

    const tx = curr.x - dxIn * ratioIn;
    const ty = curr.y - dyIn * ratioIn;
    const ex = curr.x + dxOut * ratioOut;
    const ey = curr.y + dyOut * ratioOut;

    d += ` L ${tx} ${ty}`;
    d += ` Q ${curr.x} ${curr.y}, ${ex} ${ey}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;

  return d;
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

  const pathData = buildRoundedPath(extended, 16);
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
