# Web app agents

## JSX section comments

When a component renders distinct visual regions (rank, image, content, stats, controls, etc.), label each region with a short JSX comment header, matching `CompactRankListCard`:

```tsx
{/* Rank */}
{/* Image */}
{/* Content */}
{/* Stats */}
```

Do this for new and edited UI components in `apps/web`, especially cards and export layouts.

## Top items export

- Offscreen export lives under `src/components/export/` (`useOffscreenExport`, `html2canvas-pro`, loading overlay, share/download helpers).
- Portrait canvas is 1080×1920 (`PORTRAIT_EXPORT_SIZE`).
- Grid/list/pie/bubble exports use dedicated components (`TopItemsExportGrid`, `TopItemsExportList`, `TopItemsExportPie`, `TopItemsExportBubble`) — do not reuse on-screen chart chrome (`ExpandableChartContainer`) for capture.
- Pie/bubble export layouts are frameless (no inner card title); chart + legend fill the canvas below the page header.
- Grid export images must stay **square** (`aspect-square`), sized to fit each cell.
- Cap list export at 10 items; grid export at 12 items (3×4).
- For pie/bubble export, disable entrance animations; bubble photos use HTML `<img>` when `animate` is false (export) and SVG `<image>` when `animate` is true.
- Prefer larger typography on export surfaces so text stays readable on the portrait image.
