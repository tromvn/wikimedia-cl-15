# Wikimedia Chile — 15 años

Micrositio conmemorativo por los 15 años de Wikimedia Chile. Línea de tiempo interactiva con hitos, trazado SVG y búsqueda/filtros.

## Stack

- [Vite](https://vitejs.dev/) — bundler y dev server
- [Tailwind CSS v4](https://tailwindcss.com/) — utilidades CSS
- Vanilla JS (ESM) — sin framework

## Requisitos

- Node.js >= 18
- `pnpm` ([instalación](https://pnpm.io/installation))

## Desarrollo

```bash
pnpm install
pnpm run dev
```

Abrir `http://localhost:5173` en el navegador.

```bash
pnpm run dev --host   # para acceder desde otros dispositivos
```

## Build

```bash
pnpm run build
pnpm run preview
```

## Ramas

| Rama | Descripción |
|------|-------------|
| `test/revision-errores` | Rama base. Timeline en grid 3 columnas con trazado SVG curvo animado. |
| `test/flex-alternado` | Timeline en flex alternado (izquierda/derecha), sin grid ni `hashOffset`. |
| `test/timeline-elegante` | Diseño elegante: ícono-centro, badge de fecha, card, sin SVG path. |
| `test/timeline-carretera` | Timeline con trazado zigzag / curva Bézier suave e ítems posicionados absolutos. |
| `test/refactor-estructural` | Experimental, congelada. |
| `master` | Estable, desactualizada. |

Para clonar y probar una rama:

```bash
git clone https://github.com/tromvn/wikimedia-cl-15.git
cd wikimedia-cl-15
git checkout <rama>
pnpm install
pnpm run dev
```

## Estructura

```
src/
├── main.js              # Punto de entrada, render de timeline
├── data.js              # Datos, iconos, filtrado
├── filters.js           # Búsqueda y filtros
├── dialog.js            # Modal con <dialog>
├── style.css            # Punto de entrada CSS
├── styles/
│   ├── theme.css        # Variables de diseño
│   ├── base.css         # Reset y tipografía
│   ├── layout.css       # .site-main
│   ├── header.css       # Header global
│   ├── hero.css         # Hero con numeral "15"
│   ├── footer.css       # Footer
│   ├── timeline.css     # Estilos de la línea de tiempo
│   └── dialog.css       # Panel modal
├── data/
│   └── hitos.json       # ~30 hitos (única fuente de datos)
└── assets/
    ├── icon-*.svg        # Íconos por categoría
    └── ornamento-*.svg   # Decoraciones del hero
```

## Funcionalidades comunes

- Filtro combinado por tipo (Artículos) y categoría (Institucional, Comunidad, Internacional, GLAM, Educación, Datos)
- Búsqueda con debounce de 200 ms
- Deep linking: `?hito=id` abre el diálogo automáticamente
- Dialog nativo `<dialog>` con foco restaurado al cerrar
- Animaciones de entrada escalonadas

## Por mejorar

- Diseño y posición de los dialogs
- Diseño visual de las tarjetas
- Paleta de colores
