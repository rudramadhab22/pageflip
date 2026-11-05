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

## Architecture

```
src/
  pages/           HomePage, ReaderPage
  components/
    home/          Upload + recent shelf
    reader/        BookStage, BookPage, ReaderWorkspace, Toolbar, Bookmarks, Progress
    layout/ ui/
  context/         LibraryProvider, PdfReaderProvider
  hooks/           upload, pdf document, flip controls, bookmarks, fullscreen, size
  services/        IndexedDB, recent books, progress, bookmarks, pdf render, page cache
  lib/             constants, formatters, reader page helpers, PDF worker
  styles/          Theme + reader hardcover CSS
```

## Reader shortcuts

- `←` / `→` — previous / next page
- `B` — toggle bookmark
- `F` — fullscreen
- `+` / `-` — zoom

## License

MIT — see [LICENSE](LICENSE).
