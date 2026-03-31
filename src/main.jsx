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


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SearchProvider>
            <RouterProvider router={router} />
          </SearchProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster position="top-center" />
    </ErrorBoundary>
  </StrictMode>
)