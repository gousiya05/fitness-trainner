import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppRouter from '@/routes/AppRouter'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111120',
            color: '#e2e8f0',
            border: '1px solid rgba(0,255,135,0.2)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          success: { iconTheme: { primary: '#00ff87', secondary: '#07070e' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#07070e' } },
          loading: { iconTheme: { primary: '#00ff87', secondary: 'transparent' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
