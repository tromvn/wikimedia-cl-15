import "./style.css";
import { hitos } from "./data.js";
import { initSVG, renderPath } from "./svg.js";
import { initDialog, openDialogById } from "./dialog.js";
import { initFilters, renderActions } from "./filters.js";

const timelineEl = document.querySelector("#timeline");

function renderTimeline() {
  timelineEl.innerHTML = hitos
    .map((hito, index) => {
      const side = index % 2 === 0 ? "left" : "right";
      const type = (index % 3) + 1;

      return `
<li class="hito hito--${side} hito--type${type}"
    data-id="${hito.id}"
    data-type="${hito.type ?? ""}"
    data-category="${hito.category}">
  <span class="hito-marker">
    ${hito.icon ? `<img class="hito-marker-icon" src="${hito.icon}" alt="" />` : ""}
  </span>
  <time class="hito-date">${hito.date.slice(0, 4)}</time>
  <article class="hito-card">
    <h3 class="hito-title">${hito.title}</h3>
    <p class="hito-body">${hito.body}</p>
    <div class="hito-actions"></div>
  </article>
</li>`;
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
  initAnimations();

  const params = new URLSearchParams(window.location.search);
  const hitoId = params.get("hito");
  if (hitoId) {
    setTimeout(() => openDialogById(hitoId), 600);
  }
}

function initAnimations() {
  document.querySelectorAll(".hito").forEach((el, i) => {
    el.style.setProperty("--delay", `${i * 60}ms`);
    el.classList.add("hito--visible");
  });
}

function initResizeHandler() {
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderPath, 100);
  });
}



initApp();
