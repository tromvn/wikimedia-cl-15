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

  const itemsContainer = document.createElement("div");
  itemsContainer.id = "timeline-items";
  itemsContainer.classList.add("timeline-items");
  timelineEl.appendChild(itemsContainer);

  const ITEM_W = 600;
  const centerX = roadWidth / 2;
  const MARKER_HALF = 44;
  const GAP = 27;

  hitos.forEach((hito, index) => {
    const markerX = index % 2 === 0
      ? centerX - MARKER_HALF - GAP - 130
      : centerX + MARKER_HALF + GAP + 130;
    const markerY = MARKER_Y_BASE + 90 + index * ROAD_SEGMENT_HEIGHT;
    const side = index % 2 === 0 ? "item-left" : "item-right";

    const item = document.createElement("div");
    item.className = `timeline-item ${side}`;
    item.style.left = `${markerX - ITEM_W / 2}px`;
    item.style.top = `${markerY}px`;
    item.dataset.id = hito.id;

    item.innerHTML = `
      <span class="marker">
        ${hito.icon ? `<img class="marker-icon" src="${hito.icon}" alt="" />` : ""}
      </span>
      <article class="card">
        <h3 class="title">${hito.title}</h3>
        <p class="description">${hito.body}</p>
      </article>
    `;

    itemsContainer.appendChild(item);
  });

  const timelineRect = timelineEl.getBoundingClientRect();
  const markerEls = itemsContainer.querySelectorAll(".marker");
  const positions = [...markerEls].map((marker) => {
    const rect = marker.getBoundingClientRect();
    return {
      x: rect.left - timelineRect.left + rect.width / 2,
      y: rect.top - timelineRect.top + rect.height / 2,
    };
  });

  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.id = "road";
  svg.classList.add("timeline-road");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("viewBox", `0 0 ${roadWidth} ${totalHeight}`);

  const pathEl = document.createElementNS(svgNS, "path");
  pathEl.classList.add("timeline-path");
  pathEl.setAttribute("d", buildSpinePath(positions, centerX));

  svg.appendChild(pathEl);

  const yearGroup = document.createElementNS(svgNS, "g");
  yearGroup.setAttribute("class", "timeline-year-labels");
  positions.forEach((pos, i) => {
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", centerX);
    text.setAttribute("y", pos.y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.textContent = hitos[i].date.slice(0, 4);
    yearGroup.appendChild(text);
  });
  svg.appendChild(yearGroup);

  timelineEl.prepend(svg);

  observeItems();
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
