import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CMSProvider } from './contexts/CMSContext';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CMSProvider>
          <AppRoutes />
        </CMSProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
