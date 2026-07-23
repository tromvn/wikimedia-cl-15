import "./style.css";
import { hitos } from "./data.js";
import { initDialog, openDialogById } from "./dialog.js";
import { initFilters, renderActions } from "./filters.js";

const ROAD_MARGIN = 120;
const ROAD_SEGMENT_HEIGHT = 360;
const MARKER_Y_BASE = 80;

const timelineEl = document.querySelector("#timeline");

function buildSpinePath(positions, centerX) {
  if (positions.length < 2) return "";
  const first = positions[0];
  const last = positions[positions.length - 1];

  let d = `M ${centerX} ${first.y} L ${centerX} ${last.y}`;

  for (const p of positions) {
    d += ` M ${centerX} ${p.y} L ${p.x} ${p.y}`;
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
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("viewBox", `0 0 ${roadWidth} ${totalHeight}`);

  const pathEl = document.createElementNS(svgNS, "path");
  pathEl.classList.add("timeline-path");
  pathEl.setAttribute("d", buildSpinePath(positions, roadWidth / 2));

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
