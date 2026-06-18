// ============================================================
// SGT — App Root Component
//
// Hierarquia de Providers (de fora para dentro):
//   BrowserRouter → ToastProvider → AuthProvider → ProjectProvider → TagProvider
//
// AuthProvider é o mais externo dos contexts de domínio porque
// ProjectContext e TagContext dependem do token para chamadas API.
// ToastProvider é ainda mais externo porque AuthContext precisa
// exibir toasts (ex: erro de login, sessão expirada).
//
// Rotas:
//   /login     → PublicRoute → Login
//   /cadastro  → PublicRoute → Cadastro
//   /          → PrivateRoute → Dashboard
//   /dashboard → PrivateRoute → Dashboard
//   *          → redireciona para /
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { TagProvider } from './contexts/TagContext';
import Toast from './components/UI/Toast';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';

// ============================================================
// PrivateRoute — Protege rotas que exigem autenticação
//
// Verifica autenticado (!!token) do AuthContext.
// Se false → redireciona para /login.
// ============================================================
function PrivateRoute({ children }) {
  const { autenticado } = useAuth();
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ============================================================
// PublicRoute — Redireciona usuário já autenticado para /
//
// Impede que um usuário logado veja as telas de login/cadastro.
// ============================================================
function PublicRoute({ children }) {
  const { autenticado } = useAuth();
  if (autenticado) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// ============================================================
// AppRoutes — Definição das rotas e componente Toast global
// ============================================================
function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Rotas públicas */}
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

        {/* Rotas privadas */}
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

        {/* Fallback — qualquer rota não mapeada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast global — renderizado fora das rotas, sempre visível */}
      <Toast />
    </>
  );
}

// ============================================================
// App — Componente raiz com hierarquia de Providers
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ProjectProvider>
            <TagProvider>
              <AppRoutes />
            </TagProvider>
          </ProjectProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
