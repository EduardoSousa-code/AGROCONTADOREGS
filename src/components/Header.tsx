import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Settings, LogOut, Tractor, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Usar dados do contexto
  const displayName = user?.name || 'Usuário';
  const displayFarmName = user?.farmName || 'Propriedade Rural';

  return (
    <header className="bg-white shadow-sm border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Tractor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-800">AgroContador</h1>
              <p className="text-sm text-green-600">{displayFarmName}</p>
            </div>
          </div>

          {/* Usuário e Ações */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleProfileClick}
              className="hidden sm:block text-right hover:bg-green-50 p-2 rounded-lg transition-colors"
            >
              <p className="text-sm font-medium text-gray-700">{displayName}</p>
              <p className="text-xs text-gray-500">Produtor Rural</p>
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleProfileClick}
                className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                title="Meu Perfil"
              >
                <User className="h-5 w-5 text-green-700" />
              </button>
              <button className="p-2 rounded-lg hover:bg-green-50 transition-colors">
                <Menu className="h-5 w-5 text-green-700" />
              </button>
              <button className="p-2 rounded-lg hover:bg-green-50 transition-colors">
                <Settings className="h-5 w-5 text-green-700" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}