import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Páginas privadas
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import RecordRevenue from './pages/RecordRevenue';
import RecordExpense from './pages/RecordExpense';
import AddSupply from './pages/AddSupply';
import NewActivity from './pages/NewActivity';
import Reports from './pages/Reports';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Rotas Privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/record-revenue" element={<RecordRevenue />} />
            <Route path="/record-expense" element={<RecordExpense />} />
            <Route path="/add-supply" element={<AddSupply />} />
            <Route path="/new-activity" element={<NewActivity />} />
            <Route path="/reports" element={<Reports />} />
          </Route>



          {/* Rota padrão - redireciona para dashboard se autenticado, senão para login */}
          {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

          {/* Rota 404 - redireciona para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;