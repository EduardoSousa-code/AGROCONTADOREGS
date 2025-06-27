import React from 'react';
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
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-green-800 flex items-center">
          <Package className="h-6 w-6 mr-2 text-green-600" />
          Estoque de Insumos
        </h2>
        <button className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
          <Eye className="h-4 w-4 mr-2" />
          Ver Estoque
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total de Insumos */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total de Insumos</p>
              <p className="text-3xl font-bold text-blue-800">{data.totalItems}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Estoque Baixo */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Estoque Baixo</p>
              <p className="text-3xl font-bold text-yellow-800">{data.lowStock}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        {/* Validade Próxima */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Vence em Breve</p>
              <p className="text-3xl font-bold text-orange-800">{data.nearExpiry}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}