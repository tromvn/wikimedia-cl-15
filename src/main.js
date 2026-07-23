import "./style.css";
import { hitos } from "./data.js";
import { initDialog, openDialogById } from "./dialog.js";
import { initFilters, renderActions } from "./filters.js";

const ROAD_MARGIN = 120;
const ROAD_SEGMENT_HEIGHT = 360;
const MARKER_Y_BASE = 80;

const timelineEl = document.querySelector("#timeline");

function buildSmoothPath(positions, tension = 0.25) {
  if (positions.length < 2) return "";
  let d = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 0; i < positions.length - 1; i++) {
    const p0 = positions[i - 1] || positions[i];
    const p1 = positions[i];
    const p2 = positions[i + 1];
    const p3 = positions[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function renderTimeline() {
  const roadWidth = timelineEl.offsetWidth;
  const count = hitos.length;
  const totalHeight = ROAD_SEGMENT_HEIGHT * count + 160;

  timelineEl.style.minHeight = `${totalHeight}px`;

  const positions = hitos.map((_, index) => ({
    x: index % 2 === 0 ? roadWidth - ROAD_MARGIN : ROAD_MARGIN,
    y: MARKER_Y_BASE + 90 + index * ROAD_SEGMENT_HEIGHT,
  }));

  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.id = "road";
  svg.classList.add("timeline-road");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("viewBox", `0 0 ${roadWidth} ${totalHeight}`);

  const pathEl = document.createElementNS(svgNS, "path");
  pathEl.classList.add("timeline-path");
  pathEl.setAttribute("d", buildSmoothPath(positions));

  svg.appendChild(pathEl);
  timelineEl.appendChild(svg);

  const itemsContainer = document.createElement("div");
  itemsContainer.id = "timeline-items";
  itemsContainer.classList.add("timeline-items");
  timelineEl.appendChild(itemsContainer);

  hitos.forEach((hito, index) => {
    const markerX = positions[index].x;
    const markerY = positions[index].y;
    const side = index % 2 === 0 ? "left" : "right";

    const item = document.createElement("div");
    item.className = `timeline-item ${side}`;
    item.style.left = `${markerX}px`;
    item.style.top = `${markerY}px`;
    item.dataset.id = hito.id;

    item.innerHTML = `
      <span class="marker">
        ${hito.icon ? `<img class="marker-icon" src="${hito.icon}" alt="" />` : ""}
      </span>
      <article class="card">
        <div class="year">${hito.date.slice(0, 4)}</div>
        <h3 class="title">${hito.title}</h3>
        <p class="description">${hito.body}</p>
      </article>
    `;

    itemsContainer.appendChild(item);
  });

  createDecorations(timelineEl, totalHeight);
  observeItems();
}

function createDecorations(container, totalHeight) {
  const sizes = ["small", "medium", "large"];
  for (let i = 0; i < 12; i++) {
    const blob = document.createElement("span");
    blob.className = `blob ${sizes[Math.floor(Math.random() * sizes.length)]}`;
    blob.style.left = `${Math.random() * 85 + 5}%`;
    blob.style.top = `${Math.random() * (totalHeight - 160) + 80}px`;
    container.appendChild(blob);
  }
}

function observeItems() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    { threshold: 0.2 },
  );

  document.querySelectorAll(".timeline-item").forEach((item) => observer.observe(item));
}

function initApp() {
  renderTimeline();
  initDialog();
  initFilters();

  const params = new URLSearchParams(window.location.search);
  const hitoId = params.get("hito");
  if (hitoId) {
    setTimeout(() => openDialogById(hitoId), 600);
  }
}

initApp();
