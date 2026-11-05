import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LibraryProvider } from './context/LibraryContext'
import { HomePage } from './pages/HomePage'
import { Spinner } from './components/ui/Spinner'

const ReaderPage = lazy(() =>
  import('./pages/ReaderPage').then((mod) => ({ default: mod.ReaderPage })),
)

function ReaderFallback() {
  return (
    <div className="bg-room flex min-h-dvh flex-col items-center justify-center gap-3 text-ink-300">
      <Spinner className="size-8" label="Loading reader" />
      <p className="text-sm">Opening reader…</p>
    </div>
  )
}

export default function App() {
  return (
    <LibraryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/reader/:bookId"
            element={
              <Suspense fallback={<ReaderFallback />}>
                <ReaderPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LibraryProvider>
  )
}
