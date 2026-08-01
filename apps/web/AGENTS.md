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

## Component layout

```text
components/
  export/                 # reusable capture/share only
  charts/
    shared/               # ExpandableChartContainer, legend, tooltip, d3
    dashboard/            # dashboard/item-page charts
  top/
    types.ts              # TopItem
    TopItemsPage.tsx
    topItemsChartColors.ts
    views/                # on-screen grid/list/pie/bubble
    export/               # portrait offscreen layouts
```

- Keep `TopItem` in `top/types.ts` — do not define it on the page.
- Top Items interactive views live in `top/views/`; export layouts in `top/export/`.
- Do not put Top Items–only UI in `charts/dashboard/`.

## Top items export

- Offscreen capture plumbing: `src/components/export/` (`useOffscreenExport`, `html2canvas-pro`).
- Portrait canvas is 1080×1920 (`PORTRAIT_EXPORT_SIZE`).
- Use `top/export/*` for capture — never `ExpandableChartContainer` chrome.
- Pie/bubble export layouts are frameless; chart + legend fill space below the page header.
- Grid export images must stay **square** (`aspect-square`).
- Cap list export at 15 items; grid export at 12 items (3×4).
- Disable pie/bubble entrance animations on export; bubble photos use HTML `<img>` when `animate` is false.
- Prefer larger typography on export surfaces.
