import "./style.css";
import hitos from "./data/hitos.json";

const timelineEl = document.querySelector("#timeline");

const dialogEl = document.querySelector("#hito-dialog");
const dialogContentEl = dialogEl.querySelector(".dialog-content");
const closeButtonEl = dialogEl.querySelector(".dialog-close");

/* ===== Renderizado inicial ===== */
const hitosOrdenados = [...hitos].sort((a, b) => a.date.localeCompare(b.date));

timelineEl.innerHTML = hitosOrdenados
  .map(
    (hito, index) => `
    <li class="hito" data-index="${index}" data-type="${hito.type ?? "pending"}" data-category="${hito.category}">
      <span class="hito-marker"></span>

      <article class="hito-card">
        <span class="hito-year">${hito.date.slice(0, 4)}</span>
        <h3 class="hito-title">${hito.title}</h3>
        <p class="hito-body">${hito.body}</p>

        <button class="hito-actions""></button>
      </article>
    </li>
  `,
  )
  .join("");

document.querySelectorAll(".hito").forEach((hitoElement, index) => {
  const hito = hitosOrdenados[index];
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

/* ===== SVG ===== */
const svgNS = "http://www.w3.org/2000/svg";
const svgEl = document.createElementNS(svgNS, "svg");
svgEl.setAttribute("class", "timeline-svg");
svgEl.setAttribute("width", "100%");
svgEl.setAttribute("height", "100%");
svgEl.setAttribute("preserveAspectRatio", "none");

timelineEl.prepend(svgEl);

// Crear path para la línea curva
const pathEl = document.createElementNS(svgNS, "path");
pathEl.setAttribute("class", "timeline-path");
pathEl.setAttribute("fill", "none");
pathEl.setAttribute("stroke", "var(--color-accent-blue)");
pathEl.setAttribute("stroke-width", "3");

svgEl.appendChild(pathEl);

/* ===== Timeline ===== */
function getMarkerPositions() {
  const markers = document.querySelectorAll(".hito-marker");
  const timelineRect = timelineEl.getBoundingClientRect();

  return [...markers].map((marker) => {
    const rect = marker.getBoundingClientRect();

    return {
      x: rect.left - timelineRect.left + rect.width / 2,
      y: rect.top - timelineRect.top + rect.height / 2,
    };
  });
}

function buildBezierPath(positions) {
  let pathData = "";

  positions.forEach((point, index) => {
    const { x, y } = point;

    if (index === 0) {
      pathData += `M ${x} ${y} `;
      return;
    }

    const prev = positions[index - 1];

    const controlX1 = prev.x + (x - prev.x) / 3;
    const controlY1 = prev.y;

    const controlX2 = x - (x - prev.x) / 3;
    const controlY2 = y;

    pathData += `C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x} ${y} `;
  });

  return pathData;
}

function hasAdditionalContent(hito) {
  return Boolean(hito.image || hito.url || hito.youtubeId);
}

function isTextTruncated(element) {
  return element.scrollHeight > element.clientHeight;
}

function shouldShowAction(hito, bodyElement) {
  return hasAdditionalContent(hito) || isTextTruncated(bodyElement);
}

function getHitoById(id) {
  return hitosOrdenados.find((hito) => hito.id === id);
}

function renderHitoDialog(hito) {
  dialogContentEl.innerHTML = `
    <span class="dialog-year">${hito.date.slice(0, 4)}</span>
    <h2 class="dialog-title">${hito.title}</h2>
    <p class="dialog-body">${hito.body}</p>

    ${
      hito.image
        ? `
          <img
            class="dialog-image"
            src="${hito.image}"
            alt="${hito.title}"
          />
        `
        : ""
    }
    ${hito.youtubeId ? renderYouTubeEmbed(hito.youtubeId) : ""}
    ${
      hito.url
        ? `
              <a
                class="dialog-link"
                href="${hito.url}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver recurso relacionado
              </a>
            `
        : ""
    }
  `;
}

function renderYouTubeEmbed(youtubeId) {
  return `
    <div class="dialog-video">
      <iframe
        src="https://www.youtube.com/embed/${youtubeId}"
        title="Video relacionado"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
  `;
}

function handleHitoAction(event) {
  const button = event.target.closest(".hito-action");

  if (!button) return;

  const hito = getHitoById(button.dataset.hitoId);

  if (!hito) return;

  renderHitoDialog(hito);
  dialogEl.showModal();
}

function animatePath(pathElement) {
  const length = pathElement.getTotalLength();

  pathElement.style.strokeDasharray = length;
  pathElement.style.strokeDashoffset = length;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      pathElement.style.strokeDashoffset = "0";
    });
  });
}

function renderTimeline() {
  const positions = getMarkerPositions();

  if (positions.length === 0) return;

  const pathData = buildBezierPath(positions);

  pathEl.setAttribute("d", pathData);

  animatePath(pathEl);
}

/* ===== Inicialización ===== */
timelineEl.addEventListener("click", handleHitoAction);

closeButtonEl.addEventListener("click", () => {
  dialogEl.close();
});

setTimeout(renderTimeline, 100);

window.addEventListener("resize", () => {
  setTimeout(renderTimeline, 100);
});
