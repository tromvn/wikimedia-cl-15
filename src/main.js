import "./style.css";
import hitos from "./data/hitos.json";

const timelineEl = document.querySelector("#timeline");

timelineEl.innerHTML = hitos
  .map(
    (hito, index) => `
    <li class="hito" data-index="${index}" data-type="${hito.type ?? "pending"}">
      <span class="hito-year">${hito.year}</span>
      <h3 class="hito-title">${hito.title}</h3>
    </li>
  `,
  )
  .join("");

timelineEl.innerHTML = hitos
  .map(
    (hito, index) => `
    <li class="hito" data-index="${index}" data-type="${hito.type ?? "pending"}">
      <span class="hito-marker"></span>
      <span class="hito-year">${hito.year}</span>
      <h3 class="hito-title">${hito.title}</h3>
    </li>
  `,
  )
  .join("");
