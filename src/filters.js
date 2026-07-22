import {
  hitos,
  getFilteredHitos,
  getHitoById,
  shouldShowAction
} from "./data.js";
import { renderPath } from "./svg.js";

const timelineEl = document.querySelector("#timeline");
const filterButtons = document.querySelectorAll("[data-filter]");
const categoryButtons = document.querySelectorAll("[data-category]");
const searchInput = document.querySelector(".timeline-search input");
const searchClear = document.querySelector(".search-clear");

let activeFilter = null;
let activeCategory = null;
let searchQuery = "";
let debounceTimer = null;

const layoutPattern = ["center", "left", "right"];

function renderVisible(filterType, query, filterCategory) {
  const visibleIds = new Set(
    getFilteredHitos(filterType, query, filterCategory).map((h) => h.id),
  );

  document.querySelectorAll(".hito").forEach((el) => {
    const id = el.dataset.id;
    el.classList.toggle("hito--hidden", !visibleIds.has(id));
  });

  const total = document.querySelectorAll(".hito:not(.hito--hidden)").length;
  const isFiltered = total < hitos.length;
  timelineEl.classList.toggle("timeline--filtered", isFiltered);

  const sectionEl = document.querySelector(".timeline-section");
  if (sectionEl) sectionEl.classList.toggle("timeline-section--filtered", isFiltered);

  const visibleEls = document.querySelectorAll(".hito:not(.hito--hidden)");
  visibleEls.forEach((el, index) => {
    const layout = layoutPattern[index % layoutPattern.length];
    el.classList.remove("hito--left", "hito--center", "hito--right");
    el.classList.add(`hito--${layout}`);
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

  renderVisible(activeFilter, searchQuery, activeCategory);
}

function applySearch() {
  searchQuery = searchInput.value.trim();
  searchClear.classList.toggle("search-clear--visible", searchQuery.length > 0);
  renderVisible(activeFilter, searchQuery, activeCategory);
}

function debouncedSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applySearch, 200);
}

function setActiveCategory(category) {
  activeCategory = activeCategory === category ? null : category;

  categoryButtons.forEach((btn) => {
    const isActive = btn.dataset.category === activeCategory;
    btn.classList.toggle("filter--active", isActive);
    btn.setAttribute("aria-pressed", isActive);
  });

  renderVisible(activeFilter, searchQuery, activeCategory);
}

function clearSearch() {
  searchInput.value = "";
  searchQuery = "";
  searchClear.classList.remove("search-clear--visible");
  renderVisible(activeFilter, searchQuery, activeCategory);
  searchInput.focus();
}

export function initFilters() {
  filterButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => setActiveFilter(btn.dataset.filter));
  });

  categoryButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => setActiveCategory(btn.dataset.category));
  });

  searchInput.addEventListener("input", debouncedSearch);
  searchInput.addEventListener("search", applySearch);
  searchClear.addEventListener("click", clearSearch);
}

export function isTextTruncated(element) {
  return element.scrollHeight > element.clientHeight;
}

export function renderActions() {
  document.querySelectorAll(".hito:not(.hito--hidden)").forEach((hitoElement) => {
    const id = hitoElement.dataset.id;
    const hito = getHitoById(id);

    if (!hito) return;

    const bodyElement = hitoElement.querySelector(".hito-body");
    const actionsElement = hitoElement.querySelector(".hito-actions");

    const truncated = isTextTruncated(bodyElement);

    if (shouldShowAction(hito, truncated)) {
      actionsElement.innerHTML = `
        <button class="hito-action" type="button" data-hito-id="${hito.id}">
          Ver hito
        </button>
      `;
    }
  });
}
