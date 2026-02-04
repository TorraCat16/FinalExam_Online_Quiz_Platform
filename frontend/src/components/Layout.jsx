import Navbar from './Navbar';

/**
 * Layout Component
 * 
 * PURPOSE:
 * Provides consistent page structure with navigation.
 * Wraps all authenticated pages.
 * 
 * WHY A LAYOUT COMPONENT?
 * 1. Consistent structure - every page has same navbar
 * 2. Single change point - update navbar in one place
 * 3. Separation of concerns - pages don't worry about layout
 * 4. Future flexibility - can add sidebar, footer later
 * 
 * STRUCTURE:
 * ┌─────────────────────────────┐
 * │         Navbar              │
 * ├─────────────────────────────┤
 * │                             │
 * │         children            │
 * │       (page content)        │
 * │                             │
 * └─────────────────────────────┘
 */
export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
