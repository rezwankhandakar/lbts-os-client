import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import { router } from './Router/Routes'
import AuthProvider from './Authentication/AuthProvider'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SearchProvider } from './hooks/SearchContext'
import ErrorBoundary from './Component/ErrorBoundary'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary> {/* ← সব কিছুকে wrap করো */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SearchProvider>
            <RouterProvider router={router} />
          </SearchProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>

    <Toaster position="top-center" />
  </StrictMode>
)