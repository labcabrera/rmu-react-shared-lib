import React, { ComponentType, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

/**
 * Standalone entry of an MFE (its src/Bootstrap.tsx): renders the App outside the shell under
 * `basename`. Inside the shell the App is mounted by Module Federation instead.
 */
export function bootstrapMfe(App: ComponentType, basename: string, elementId = 'app') {
  const rootElement = document.getElementById(elementId);
  if (!rootElement) throw new Error(`Root element with id "${elementId}" not found`);
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
}
