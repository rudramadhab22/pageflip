# PageFlip

Realistic 3D PDF book reader — React + Vite frontend only. PDFs stay on the user’s device.

## Phase map

| Phase | Focus |
| --- | --- |
| **1** | Architecture, Tailwind, local library (IndexedDB + localStorage), home upload UX |
| **2** | 3D hardcover reader, PDF.js page rendering, React PageFlip turns |
| **3** | Reading controls: nav, zoom, fullscreen, bookmarks, progress |
| **4** | Large-PDF progressive rendering, responsive polish, edge-case hardening |

## Develop

```bash
npm install
npm run dev
```

## Architecture (Phase 1)

```
src/
  pages/           HomePage, ReaderPage
  components/      home, layout, reader, ui
  context/         LibraryProvider
  hooks/           usePdfUpload
  services/        IndexedDB PDFs, recent books, progress, bookmarks
  lib/             constants, formatters, PDF metadata probe
  styles/          Tailwind theme tokens
```

## License

MIT — see [LICENSE](LICENSE).
