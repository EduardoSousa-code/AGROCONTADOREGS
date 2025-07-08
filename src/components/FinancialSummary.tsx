import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Eye } from 'lucide-react';

interface FinancialData {
  monthlyRevenue: number;
  monthlyExpenses: number;
  currentBalance: number;
}

interface FinancialSummaryProps {
  data: FinancialData;
}

export default function FinancialSummary({ data }: FinancialSummaryProps) {
  const navigate = useNavigate();
  const profit = data.monthlyRevenue - data.monthlyExpenses;
  const isProfit = profit >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleViewDetails = () => {
    navigate('/reports');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-green-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold text-green-800 flex items-center">
          <DollarSign className="h-6 w-6 mr-2 text-green-600" />
          Resumo Financeiro
        </h2>
        <button 
          onClick={handleViewDetails}
          className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Receitas */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-600 font-medium">Receitas do Mês</p>
              <p className="text-xl lg:text-2xl font-bold text-green-800 truncate">{formatCurrency(data.monthlyRevenue)}</p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0 ml-2" />
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-600 font-medium">Despesas do Mês</p>
              <p className="text-xl lg:text-2xl font-bold text-red-800 truncate">{formatCurrency(data.monthlyExpenses)}</p>
            </div>
            <TrendingDown className="h-6 w-6 lg:h-8 lg:w-8 text-red-600 flex-shrink-0 ml-2" />
          </div>
        </div>

        {/* Saldo */}
        <div className={`${isProfit ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4 sm:col-span-2 lg:col-span-1`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                Saldo Atual
              </p>
              <p className={`text-xl lg:text-2xl font-bold ${isProfit ? 'text-green-800' : 'text-red-800'} truncate`}>
                {formatCurrency(data.currentBalance)}
              </p>
            </div>
            {isProfit ? (
              <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0 ml-2" />
            ) : (
              <TrendingDown className="h-6 w-6 lg:h-8 lg:w-8 text-red-600 flex-shrink-0 ml-2" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}