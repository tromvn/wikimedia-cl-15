import hitosRaw from "./data/hitos.json";

export const hitos = [...hitosRaw].sort((a, b) =>
  a.date.localeCompare(b.date),
);

export function getHitoById(id) {
  return hitos.find((h) => h.id === id);
}

export function hasAdditionalContent(hito) {
  return Boolean(hito.image || hito.url || hito.youtubeId);
}

export function isTextTruncated(element) {
  return element.scrollHeight > element.clientHeight;
}

export function shouldShowAction(hito, bodyElement) {
  return hasAdditionalContent(hito) || isTextTruncated(bodyElement);
}

export function getFilteredHitos(filterType, searchQuery) {
  return hitos.filter((hito) => {
    if (filterType && hito.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !hito.title.toLowerCase().includes(q) &&
        !hito.body.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}
