import "./style.css";
import { hitos } from "./data.js";
import { initDialog, openDialogById } from "./dialog.js";
import { initFilters, renderActions } from "./filters.js";

const ROAD_MARGIN = 120;
const ROAD_SEGMENT_HEIGHT = 360;
const CURVE_RADIUS = 80;
const MARKER_Y_BASE = 80;

const timelineEl = document.querySelector("#timeline");

function renderTimeline() {
  const roadWidth = timelineEl.offsetWidth;
  const count = hitos.length;
  const totalHeight = ROAD_SEGMENT_HEIGHT * count + 160;

  timelineEl.style.minHeight = `${totalHeight}px`;

  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.id = "road";
  svg.classList.add("timeline-road");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("viewBox", `0 0 ${roadWidth} ${totalHeight}`);

  const pathOuter = document.createElementNS(svgNS, "path");
  pathOuter.id = "road-path";
  pathOuter.classList.add("timeline-road-path");

  const pathCenter = document.createElementNS(svgNS, "path");
  pathCenter.id = "road-center";
  pathCenter.classList.add("timeline-road-center");

  svg.appendChild(pathOuter);
  svg.appendChild(pathCenter);
  timelineEl.appendChild(svg);

  let d = "";
  let y = MARKER_Y_BASE;
  const left = ROAD_MARGIN;
  const right = roadWidth - ROAD_MARGIN;

  for (let i = 0; i < count; i++) {
    if (i === 0) d += `M ${left} ${y}`;

    if (i % 2 === 0) {
      d += `H ${right - CURVE_RADIUS} Q ${right} ${y} ${right} ${y + CURVE_RADIUS} V ${y + ROAD_SEGMENT_HEIGHT - CURVE_RADIUS} Q ${right} ${y + ROAD_SEGMENT_HEIGHT} ${right - CURVE_RADIUS} ${y + ROAD_SEGMENT_HEIGHT} H ${left + CURVE_RADIUS}`;
    } else {
      d += `H ${left + CURVE_RADIUS} Q ${left} ${y} ${left} ${y + CURVE_RADIUS} V ${y + ROAD_SEGMENT_HEIGHT - CURVE_RADIUS} Q ${left} ${y + ROAD_SEGMENT_HEIGHT} ${left + CURVE_RADIUS} ${y + ROAD_SEGMENT_HEIGHT} H ${right - CURVE_RADIUS}`;
    }

    y += ROAD_SEGMENT_HEIGHT;
  }

  pathOuter.setAttribute("d", d);
  pathCenter.setAttribute("d", d);

  const itemsContainer = document.createElement("div");
  itemsContainer.id = "timeline-items";
  itemsContainer.classList.add("timeline-items");
  timelineEl.appendChild(itemsContainer);

  y = MARKER_Y_BASE;
  hitos.forEach((hito, index) => {
    const markerX = index % 2 === 0 ? right : left;
    const markerY = MARKER_Y_BASE + CURVE_RADIUS + index * ROAD_SEGMENT_HEIGHT;
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
