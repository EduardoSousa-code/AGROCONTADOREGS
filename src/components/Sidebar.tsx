import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp,
  TrendingDown,
  Package, 
  Activity, 
  FileText, 
  Bot,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { 
      icon: TrendingUp, 
      label: 'Lançar Receita', 
      path: '/record-revenue',
      color: 'bg-green-600', 
      hoverColor: 'hover:bg-green-700',
      textColor: 'text-green-700',
      bgHover: 'hover:bg-green-50',
      activeColor: 'bg-green-100 border-green-300'
    },
    { 
      icon: TrendingDown, 
      label: 'Lançar Despesa', 
      path: '/record-expense',
      color: 'bg-red-600', 
      hoverColor: 'hover:bg-red-700',
      textColor: 'text-red-700',
      bgHover: 'hover:bg-red-50',
      activeColor: 'bg-red-100 border-red-300'
    },
    { 
      icon: Package, 
      label: 'Estoque Insumo', 
      path: '/supply-stock',
      color: 'bg-blue-600', 
      hoverColor: 'hover:bg-blue-700',
      textColor: 'text-blue-700',
      bgHover: 'hover:bg-blue-50',
      activeColor: 'bg-blue-100 border-blue-300'
    },
    { 
      icon: Activity, 
      label: 'Nova Atividade', 
      path: '/new-activity',
      color: 'bg-purple-600', 
      hoverColor: 'hover:bg-purple-700',
      textColor: 'text-purple-700',
      bgHover: 'hover:bg-purple-50',
      activeColor: 'bg-purple-100 border-purple-300'
    },
    { 
      icon: FileText, 
      label: 'Ver Relatórios', 
      path: '/reports',
      color: 'bg-orange-600', 
      hoverColor: 'hover:bg-orange-700',
      textColor: 'text-orange-700',
      bgHover: 'hover:bg-orange-50',
      activeColor: 'bg-orange-100 border-orange-300'
    },
    { 
      icon: Bot, 
      label: 'Agente de IA', 
      path: '/ai-agent',
      color: 'bg-indigo-600', 
      hoverColor: 'hover:bg-indigo-700',
      textColor: 'text-indigo-700',
      bgHover: 'hover:bg-indigo-50',
      activeColor: 'bg-indigo-100 border-indigo-300'
    },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white shadow-lg border-r border-green-100 h-full relative z-20">
        <div className="p-6">
          <h2 className="text-lg font-bold text-green-800 mb-6">Menu Principal</h2>
          
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 group border ${
                    isActive 
                      ? `${item.activeColor} border-2` 
                      : `${item.bgHover} ${item.textColor} hover:shadow-md border-transparent`
                  }`}
                >
                  <div className={`${item.color} ${item.hoverColor} p-2 rounded-lg transition-colors group-hover:scale-105 ${
                    isActive ? 'scale-105' : ''
                  }`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <span className={`font-medium text-sm ${
                    isActive ? 'font-semibold' : ''
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-green-100 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-green-800">Menu Principal</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 group border ${
                    isActive 
                      ? `${item.activeColor} border-2` 
                      : `${item.bgHover} ${item.textColor} hover:shadow-md border-transparent`
                  }`}
                >
                  <div className={`${item.color} ${item.hoverColor} p-2 rounded-lg transition-colors group-hover:scale-105 ${
                    isActive ? 'scale-105' : ''
                  }`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <span className={`font-medium text-sm ${
                    isActive ? 'font-semibold' : ''
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}