import {
  getFilteredHitos,
  getHitoById,
  shouldShowAction
} from "./data.js";
import { renderPath } from "./svg.js";

const timelineEl = document.querySelector("#timeline");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchInput = document.querySelector(".timeline-search input");

let activeFilter = null;
let searchQuery = "";

function renderVisible(filterType, query) {
  const visibleIds = new Set(
    getFilteredHitos(filterType, query).map((h) => h.id),
  );

  document.querySelectorAll(".hito").forEach((el) => {
    const id = el.dataset.id;
    el.classList.toggle("hito--hidden", !visibleIds.has(id));
  });

  renderPath();
}

function setActiveFilter(type) {
  activeFilter = activeFilter === type ? null : type;

  filterButtons.forEach((btn) => {
    const isActive = btn.dataset.filter === activeFilter;
    btn.classList.toggle("filter--active", isActive);
    btn.setAttribute("aria-pressed", isActive);
  });

  renderVisible(activeFilter, searchQuery);
}

function applySearch() {
  searchQuery = searchInput.value.trim();
  renderVisible(activeFilter, searchQuery);
}

export function initFilters() {
  filterButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => setActiveFilter(btn.dataset.filter));
  });

  searchInput.addEventListener("input", applySearch);
}

export function renderActions() {
  document.querySelectorAll(".hito:not(.hito--hidden)").forEach((hitoElement) => {
    const id = hitoElement.dataset.id;
    const hito = getHitoById(id);

    if (!hito) return;

    const bodyElement = hitoElement.querySelector(".hito-body");
    const actionsElement = hitoElement.querySelector(".hito-actions");

    if (shouldShowAction(hito, bodyElement)) {
      actionsElement.innerHTML = `
        <button class="hito-action" type="button" data-hito-id="${hito.id}">
          Ver hito
        </button>
      `;
    }
  });
}
