let pathEl = null;
let timelineEl = null;
let animated = false;

export function initSVG(timelineContainer) {
  timelineEl = timelineContainer;

  const svgNS = "http://www.w3.org/2000/svg";
  const svgEl = document.createElementNS(svgNS, "svg");
  svgEl.setAttribute("class", "timeline-svg");
  svgEl.setAttribute("width", "100%");
  svgEl.setAttribute("height", "100%");
  svgEl.setAttribute("preserveAspectRatio", "none");

  pathEl = document.createElementNS(svgNS, "path");
  pathEl.setAttribute("class", "timeline-path");
  pathEl.setAttribute("fill", "none");
  pathEl.setAttribute("stroke", "var(--color-accent-blue)");
  pathEl.setAttribute("stroke-width", "3");

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
    const controlX1 = prev.x + (x - prev.x) / 3;
    const controlY1 = prev.y;
    const controlX2 = x - (x - prev.x) / 3;
    const controlY2 = y;

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
    return;
  }

  const pathData = buildBezierPath(positions);
  pathEl.setAttribute("d", pathData);

  if (!animated) {
    animatePath();
    animated = true;
  }
}
