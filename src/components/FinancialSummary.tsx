import React from 'react';
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
  const profit = data.monthlyRevenue - data.monthlyExpenses;
  const isProfit = profit >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-green-800 flex items-center">
          <DollarSign className="h-6 w-6 mr-2 text-green-600" />
          Resumo Financeiro
        </h2>
        <button className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receitas */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Receitas do Mês</p>
              <p className="text-2xl font-bold text-green-800">{formatCurrency(data.monthlyRevenue)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Despesas do Mês</p>
              <p className="text-2xl font-bold text-red-800">{formatCurrency(data.monthlyExpenses)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Saldo */}
        <div className={`${isProfit ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                Saldo Atual
              </p>
              <p className={`text-2xl font-bold ${isProfit ? 'text-green-800' : 'text-red-800'}`}>
                {formatCurrency(data.currentBalance)}
              </p>
            </div>
            {isProfit ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}