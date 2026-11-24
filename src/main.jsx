import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { StoreProvider } from './lib/store'
import { Toaster } from './components/ui/sonner'

createRoot(document.getElementById('root')).render(
  <StoreProvider>
    <App />
    <Toaster position="top-center" richColors closeButton />
  </StoreProvider>
)
