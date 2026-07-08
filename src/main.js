import "./style.css";
import hitos from "./data/hitos.json";

const timelineEl = document.querySelector("#timeline");

// Crear estructura HTML de los hitos
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

// Añadir SVG para la línea curva
const svgNS = "http://www.w3.org/2000/svg";
const svgEl = document.createElementNS(svgNS, "svg");
svgEl.setAttribute("class", "timeline-svg");
svgEl.setAttribute("width", "100%");
svgEl.setAttribute("height", "100%");
svgEl.setAttribute("viewBox", "0 0 100% 100%");
svgEl.setAttribute("preserveAspectRatio", "none");

timelineEl.prepend(svgEl);

// Crear path para la línea curva
const pathEl = document.createElementNS(svgNS, "path");
pathEl.setAttribute("class", "timeline-path");
pathEl.setAttribute("fill", "none");
pathEl.setAttribute("stroke", "var(--color-accent-blue)");
pathEl.setAttribute("stroke-width", "3");

svgEl.appendChild(pathEl);

// Calcular posiciones de los marcadores y dibujar línea curva
function drawCurvedTimeline() {
  const markers = document.querySelectorAll(".hito-marker");
  const hitoElements = document.querySelectorAll(".hito");

  if (markers.length === 0) return;

  let pathData = "";

  markers.forEach((marker, index) => {
    const rect = marker.getBoundingClientRect();
    const hitoRect = hitoElements[index].getBoundingClientRect();
    const timelineRect = timelineEl.getBoundingClientRect();

    // Coordenadas relativas al timeline
    const x = rect.left - timelineRect.left + rect.width / 2;
    const y = rect.top - timelineRect.top + rect.height / 2;

    if (index === 0) {
      // Primer punto: mover a posición inicial
      pathData += `M ${x} ${y} `;
    } else {
      // Puntos intermedios: curva suave
      const prevMarker = markers[index - 1];
      const prevRect = prevMarker.getBoundingClientRect();
      const prevX = prevRect.left - timelineRect.left + prevRect.width / 2;
      const prevY = prevRect.top - timelineRect.top + prevRect.height / 2;

      // Control points para curva bezier
      const controlX1 = prevX + (x - prevX) / 3;
      const controlY1 = prevY;
      const controlX2 = x - (x - prevX) / 3;
      const controlY2 = y;

      pathData += `C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x} ${y} `;
    }
  });

  pathEl.setAttribute("d", pathData);
}

// Dibujar línea curva después de que el DOM esté cargado y renderizado
setTimeout(drawCurvedTimeline, 100);

// Redibujar si hay cambios de tamaño
window.addEventListener("resize", () => {
  setTimeout(drawCurvedTimeline, 100);
});
