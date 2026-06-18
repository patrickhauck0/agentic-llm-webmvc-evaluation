import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { TagProvider } from './contexts/TagContext';
import { ProjectProvider } from './contexts/ProjectContext';

// Pages
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';

const PrivateRoute = ({ children }) => {
  const { autenticado } = useContext(AuthContext);
  return autenticado ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { autenticado } = useContext(AuthContext);
  return autenticado ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <TagProvider>
            <ProjectProvider>
              <Routes>
                {/* Rotas Públicas */}
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/cadastro" 
                  element={
                    <PublicRoute>
                      <Cadastro />
                    </PublicRoute>
                  } 
                />
                
                {/* Rotas Privadas */}
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </ProjectProvider>
          </TagProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
