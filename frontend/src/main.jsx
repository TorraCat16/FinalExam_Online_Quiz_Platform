import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

/**
 * Application Entry Point
 * 
 * Structure (outside to inside):
 * 1. StrictMode - Highlights potential problems during development
 * 2. BrowserRouter - Enables client-side routing (URL-based navigation)
 * 3. AuthProvider - Makes auth state available to all components
 * 4. App - The actual application with routes
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
