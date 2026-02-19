import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import { router } from './Router/Routes'
import AuthProvider from './Authentication/AuthProvider'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster position="top-center" />
   <AuthProvider><RouterProvider router={router} /></AuthProvider>
  </StrictMode>,
)
