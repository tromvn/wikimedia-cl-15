import { getHitoById } from "./data.js";

const dialogEl = document.querySelector("#hito-dialog");
const dialogContentEl = dialogEl.querySelector(".dialog-content");
const closeButtonEl = dialogEl.querySelector(".dialog-close");

function renderYouTubeEmbed(youtubeId) {
  return `
    <div class="dialog-video">
      <iframe
        src="https://www.youtube.com/embed/${youtubeId}"
        title="Video relacionado"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
  `;
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
            loading="lazy"
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

function updateUrl(hitoId) {
  const url = new URL(window.location);
  if (hitoId) {
    url.searchParams.set("hito", hitoId);
  } else {
    url.searchParams.delete("hito");
  }
  history.replaceState(null, "", url);
}

function handleHitoAction(event) {
  const button = event.target.closest(".hito-action");
  if (!button) return;

  const hito = getHitoById(button.dataset.hitoId);
  if (!hito) return;

  openHitoDialog(hito.id);
}

function openHitoDialog(id) {
  const hito = getHitoById(id);
  if (!hito) return;

  renderHitoDialog(hito);
  dialogEl.showModal();
  updateUrl(hito.id);
}

function handleClose() {
  dialogEl.close();
  updateUrl(null);
}

export function initDialog() {
  document.querySelector("#timeline").addEventListener("click", handleHitoAction);

  closeButtonEl.addEventListener("click", handleClose);

  dialogEl.addEventListener("click", (event) => {
    if (event.target === dialogEl) {
      handleClose();
    }
  });

  dialogEl.addEventListener("close", () => updateUrl(null));
}

export function openDialogById(id) {
  const el = document.querySelector(`.hito[data-id="${id}"]`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  openHitoDialog(id);
}
