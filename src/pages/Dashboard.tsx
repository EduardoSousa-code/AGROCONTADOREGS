import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import FinancialSummary from '../components/FinancialSummary';
import InventoryStock from '../components/InventoryStock';
import RecentActivities from '../components/RecentActivities';
import AIAlerts from '../components/AIAlerts';
import FinancialChart from '../components/FinancialChart';

export default function Dashboard() {
  // Dados de exemplo
  const financialData = {
    monthlyRevenue: 45000,
    monthlyExpenses: 32000,
    currentBalance: 128000
  };

  const stockData = {
    totalItems: 45,
    lowStock: 7,
    nearExpiry: 3
  };

  const recentActivities = [
    { id: '1', name: 'Aplicação de Fertilizante', type: 'Plantio', date: '2 horas atrás' },
    { id: '2', name: 'Compra de Sementes', type: 'Compra', date: '5 horas atrás' },
    { id: '3', name: 'Venda de Milho', type: 'Venda', date: '1 dia atrás' }
  ];

  const aiAlerts = [
    { id: '1', message: 'Despesas com combustível aumentaram 40% este mês', type: 'warning' as const, timestamp: '2 horas atrás' },
    { id: '2', message: 'Previsão favorável para colheita na próxima semana', type: 'info' as const, timestamp: '4 horas atrás' },
    { id: '3', message: 'Estoque de herbicida crítico - reabastecer urgente', type: 'critical' as const, timestamp: '6 horas atrás' }
  ];

  const chartData = {
    revenue: 45000,
    expenses: 32000,
    categories: [
      { name: 'Combustível', value: 8500, color: '#ef4444' },
      { name: 'Sementes', value: 12000, color: '#f97316' },
      { name: 'Fertilizantes', value: 7500, color: '#eab308' },
      { name: 'Manutenção', value: 4000, color: '#22c55e' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Card 1 - Resumo Financeiro */}
            <FinancialSummary data={financialData} />
            
            {/* Card 2 - Estoque de Insumos */}
            <InventoryStock data={stockData} />
            
            {/* Grid para Cards 3, 4 e 5 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card 3 - Atividades Recentes */}
              <RecentActivities activities={recentActivities} />
              
              {/* Card 4 - Alertas da IA */}
              <AIAlerts alerts={aiAlerts} />
            </div>
            
            {/* Card 5 - Gráfico Financeiro */}
            <FinancialChart data={chartData} />
          </div>
        </main>
      </div>
    </div>
  );
}