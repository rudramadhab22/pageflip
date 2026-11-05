# PageFlip

Realistic 3D PDF book reader — React + Vite frontend only. PDFs stay on the user’s device.

## Phase map

| Phase | Focus |
| --- | --- |
| **1** ✅ | Architecture, Tailwind, local library, home upload UX |
| **2** ✅ | 3D hardcover reader, PDF.js rendering, React PageFlip turns |
| **3** ✅ | Reading controls: nav, zoom, fullscreen, bookmarks, progress |
| **4** ✅ | Large-PDF progressive windowing, responsive polish, edge-case hardening |

## Develop

```bash
npm install
npm run dev
```

## Architecture

```
src/
  pages/           HomePage, ReaderPage
  components/
    home/          Upload + recent shelf
    reader/        BookStage, BookPage, Workspace, Toolbar, Bookmarks, Progress
    layout/ ui/
  context/         LibraryProvider, PdfReaderProvider
  hooks/           upload, pdf document, flip controls, bookmarks, fullscreen, debounce
  services/        IndexedDB, progress, bookmarks, pdf render, LRU cache, render queue
  lib/             constants, formatters, page windowing, PDF worker
  styles/          Theme + reader hardcover CSS
```

## Phase 4 notes

- PDFs over 80 pages mount a sliding page window (keeps the flipbook light).
- Nearby pages render through a concurrency-limited queue with an LRU image cache.
- Mixed page sizes are sampled for stage aspect; password/empty/corrupt PDFs show clear errors.
- Mobile uses compact chrome, safe-area fullscreen, and lower render cost.

## Reader shortcuts

- `←` / `→` — previous / next page
- `B` — toggle bookmark
- `F` — fullscreen
- `+` / `-` — zoom

## License

MIT — see [LICENSE](LICENSE).
