import hitosRaw from "./data/hitos.json";
import iconInstitucional from "./assets/icon-institucional.svg";
import iconComunidad from "./assets/icon-comunidad.svg";
import iconInternacional from "./assets/icon-internacional.svg";
import iconGlam from "./assets/icon-glam.svg";
import iconEducacion from "./assets/icon-educacion.svg";
import iconDatos from "./assets/icon-datos.svg";

const iconMap = {
  institucional: iconInstitucional,
  comunidad: iconComunidad,
  internacional: iconInternacional,
  glam: iconGlam,
  educacion: iconEducacion,
  datos: iconDatos,
};

export const hitos = [...hitosRaw].sort((a, b) =>
  a.date.localeCompare(b.date),
).map((hito) => ({
  ...hito,
  icon: iconMap[hito.icon] || iconMap[hito.category] || null,
}));

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
