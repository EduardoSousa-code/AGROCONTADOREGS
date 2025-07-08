import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


export default function PublicRoute() {
  const { isAuthenticated } = useAuth();

  const storedUser = localStorage.getItem('agrocontador_user');

  console.log('PublicRoute isAuthenticated');
  console.log(storedUser);
  if (storedUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}