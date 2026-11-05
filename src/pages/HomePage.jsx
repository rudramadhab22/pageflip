import { DropZone } from '../components/home/DropZone'
import { HeroStage } from '../components/home/HeroStage'
import { RecentBooks } from '../components/home/RecentBooks'
import { AppShell } from '../components/layout/AppShell'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { useLibrary } from '../context/LibraryContext'
import { usePdfUpload } from '../hooks/usePdfUpload'
import { APP_NAME } from '../lib/constants'

export function HomePage() {
  const { recentBooks, removeBook, setImportError, importWarning, setImportWarning } =
    useLibrary()
  const upload = usePdfUpload()

  return (
    <AppShell>
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="order-2 lg:order-1">
          <p className="mb-3 text-xs tracking-[0.22em] text-gilt uppercase">PDF, turned physical</p>
          <h1 className="font-display text-5xl leading-[0.95] text-ink-100 text-balance sm:text-6xl lg:text-7xl">
            {APP_NAME}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-300 sm:text-lg">
            Open any PDF as a hardcover book with realistic page turns — private, local, and built
            for focused reading.
          </p>

          <div className="mt-8 space-y-3">
            <ErrorBanner
              message={upload.importError}
              onDismiss={() => setImportError(null)}
            />
            {importWarning ? (
              <ErrorBanner
                tone="warning"
                message={importWarning}
                onDismiss={() => setImportWarning(null)}
              />
            ) : null}
            <DropZone {...upload} />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <HeroStage />
        </div>
      </section>

      <RecentBooks books={recentBooks} onRemove={removeBook} />
    </AppShell>
  )
}
