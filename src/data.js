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

export function shouldShowAction(hito, isTruncated) {
  return hasAdditionalContent(hito) || isTruncated;
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
