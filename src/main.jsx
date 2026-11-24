import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Anti-Theft Protection: Prevent right-click and unauthorized asset saving on images & videos
if (typeof window !== 'undefined') {
  window.addEventListener('contextmenu', (e) => {
    if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO')) {
      e.preventDefault();
    }
  }, { capture: true });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
