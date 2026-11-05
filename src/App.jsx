import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LibraryProvider } from './context/LibraryContext'
import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'

export default function App() {
  return (
    <LibraryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reader/:bookId" element={<ReaderPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LibraryProvider>
  )
}
