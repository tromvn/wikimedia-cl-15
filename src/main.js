import "./style.css";
import { hitos } from "./data.js";
import { initSVG, renderPath } from "./svg.js";
import { initDialog } from "./dialog.js";
import { initFilters, renderActions } from "./filters.js";

const timelineEl = document.querySelector("#timeline");

function renderTimeline() {
  const layoutPattern = ["center", "left", "right"];

  timelineEl.innerHTML = hitos
    .map(
      (hito, index) => {
        const layout = layoutPattern[index % layoutPattern.length];


        return `
    <li class="hito hito--${layout}" data-id="${hito.id}" data-type="${hito.type ?? ""}" data-category="${hito.category}">
      <span class="hito-marker">
        ${hito.icon ? `<img class="hito-marker-icon" src="${hito.icon}" alt="" aria-hidden="true" />` : ""}
      </span>

      <article class="hito-card">
        <span class="hito-year">${hito.date.slice(0, 4)}</span>
        <h3 class="hito-title">${hito.title}</h3>
        <p class="hito-body">${hito.body}</p>

        <div class="hito-actions"></div>
      </article>
    </li>
  `;
      })
    .join("");

  renderActions();
  initSVG(timelineEl);
  renderPath();
}

function initApp() {
  renderTimeline();

  initDialog();
  initFilters();

  initResizeHandler();
}

function initResizeHandler() {
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderPath, 100);
  });
};

initApp();
