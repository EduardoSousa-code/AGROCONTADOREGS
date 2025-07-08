import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, Calendar, Eye } from 'lucide-react';

interface StockData {
  totalItems: number;
  lowStock: number;
  nearExpiry: number;
}

interface InventoryStockProps {
  data: StockData;
}

export default function InventoryStock({ data }: InventoryStockProps) {
  const navigate = useNavigate();

  const handleViewStock = () => {
    navigate('/add-supply');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-green-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold text-green-800 flex items-center">
          <Package className="h-6 w-6 mr-2 text-green-600" />
          Estoque de Insumos
        </h2>
        <button 
          onClick={handleViewStock}
          className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Estoque
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Total de Insumos */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-600 font-medium">Total de Insumos</p>
              <p className="text-2xl lg:text-3xl font-bold text-blue-800">{data.totalItems}</p>
            </div>
            <Package className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0 ml-2" />
          </div>
        </div>

        {/* Estoque Baixo */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-yellow-600 font-medium">Estoque Baixo</p>
              <p className="text-2xl lg:text-3xl font-bold text-yellow-800">{data.lowStock}</p>
            </div>
            <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600 flex-shrink-0 ml-2" />
          </div>
        </div>

        {/* Validade Próxima */}
        <div className="bg-orange-50 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-orange-600 font-medium">Vence em Breve</p>
              <p className="text-2xl lg:text-3xl font-bold text-orange-800">{data.nearExpiry}</p>
            </div>
            <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0 ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
}