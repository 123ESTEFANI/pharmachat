import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Limpieza de service workers antiguos (PWA) que interceptan y bloquean
// las peticiones a Supabase con errores net::ERR_FAILED
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
      console.log('Service worker antiguo eliminado')
    }
  })
  if ('caches' in window) {
    caches.keys().then((keys) => {
      for (const key of keys) caches.delete(key)
    })
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
