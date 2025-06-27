import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ChartData {
  revenue: number;
  expenses: number;
  categories: {
    name: string;
    value: number;
    color: string;
  }[];
}

interface FinancialChartProps {
  data: ChartData;
}

export default function FinancialChart({ data }: FinancialChartProps) {
  const total = data.revenue + data.expenses;
  const revenuePercentage = (data.revenue / total) * 100;
  const expensesPercentage = (data.expenses / total) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-green-800 flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-green-600" />
          Visão Financeira
        </h2>
        <TrendingUp className="h-5 w-5 text-green-600" />
      </div>

      {/* Gráfico de Barras Simples */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-700">Receitas vs Despesas</span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600">Receitas</span>
              <span className="font-medium text-green-800">R$ {data.revenue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${revenuePercentage}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-600">Despesas</span>
              <span className="font-medium text-red-800">R$ {data.expenses.toLocaleString()}</span>
            </div>
            <div className="w-full bg-red-100 rounded-full h-3">
              <div 
                className="bg-red-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${expensesPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribuição por Categoria */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Distribuição dos Gastos</h3>
        <div className="grid grid-cols-2 gap-3">
          {data.categories.map((category, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{category.name}</p>
                <p className="text-xs text-gray-500">R$ {category.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}