import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1a202c',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            fontSize: '0.875rem',
            fontWeight: '500',
          },
          success: { iconTheme: { primary: '#38a169', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e53e3e', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
