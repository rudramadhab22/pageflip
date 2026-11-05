import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'
import './styles/reader.css'

// StrictMode disabled: PDF.js + react-pageflip remount twice and cancel in-flight page renders.
createRoot(document.getElementById('root')).render(<App />)
