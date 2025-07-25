import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import FinancialSummary from '../components/FinancialSummary';
import InventoryStock from '../components/InventoryStock';
import RecentActivities from '../components/RecentActivities';
import AIAlerts from '../components/AIAlerts';
import FinancialChart from '../components/FinancialChart';
import { useAuth } from '../contexts/AuthContext';
import { RevenueService } from '../services/revenueService';
import { ExpenseService } from '../services/expenseService';
import { SupplyService } from '../services/supplyService';
import { ActivityService } from '../services/activityService';
import type { Revenue, Expense, Supply, Activity } from '../lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

interface FinancialData {
  monthlyRevenue: number;
  monthlyExpenses: number;
  currentBalance: number;
}

interface StockData {
  totalItems: number;
  lowStock: number;
  nearExpiry: number;
}

interface ChartData {
  revenue: number;
  expenses: number;
  categories: {
    name: string;
    value: number;
    color: string;
  }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estados para dados
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Buscar dados do usuário
  const fetchUserData = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      console.log('📊 Carregando dados do dashboard para usuário:', user.id);
      console.log('🔍 DEBUG - Dados do usuário:', user);

      // Buscar dados em paralelo
      const [revenueResult, expenseResult, supplyResult, activityResult] = await Promise.all([
        RevenueService.getUserRevenues(user.id),
        ExpenseService.getUserExpenses(user.id),
        SupplyService.getUserSupplies(user.id),
        ActivityService.getRecentActivities(user.id)
      ]);

      // Processar resultados
      if (revenueResult.success && revenueResult.data) {
        console.log('✅ Receitas carregadas:', revenueResult.data.length, 'registros');
        console.log('🔍 DEBUG - Primeiras receitas:', revenueResult.data.slice(0, 3));
        setRevenues(revenueResult.data);
      } else {
        console.error('Erro ao carregar receitas:', revenueResult.error);
      }

      if (expenseResult.success && expenseResult.data) {
        console.log('✅ Despesas carregadas:', expenseResult.data.length, 'registros');
        console.log('🔍 DEBUG - Primeiras despesas:', expenseResult.data.slice(0, 3));
        setExpenses(expenseResult.data);
      } else {
        console.error('Erro ao carregar despesas:', expenseResult.error);
      }

      if (supplyResult.success && supplyResult.data) {
        setSupplies(supplyResult.data);
      } else {
        console.error('Erro ao carregar insumos:', supplyResult.error);
      }

      if (activityResult.success && activityResult.data) {
        setActivities(activityResult.data);
      } else {
        console.error('Erro ao carregar atividades:', activityResult.error);
      }

      console.log('✅ Dados do dashboard carregados com sucesso');

    } catch (error) {
      console.error('💥 Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard. Tente recarregar a página.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular dados financeiros do mês atual com UTC
  const calculateFinancialData = (): FinancialData => {
    const currentDate = new Date();
    const currentMonth = currentDate.getUTCMonth();
    const currentYear = currentDate.getUTCFullYear();

    console.log('🔍 DEBUG - Calculando dados financeiros para:', {
      currentMonth: currentMonth + 1, // +1 porque getUTCMonth() retorna 0-11
      currentYear,
      totalRevenues: revenues.length,
      totalExpenses: expenses.length
    });

    // Filtrar receitas e despesas do mês atual usando UTC
    const monthlyRevenues = revenues.filter(revenue => {
      // Adicionar 'T00:00:00Z' para garantir que seja tratado como UTC
      const revenueDate = new Date(revenue.date + 'T00:00:00Z');
      const revenueMonth = revenueDate.getUTCMonth();
      const revenueYear = revenueDate.getUTCFullYear();
      
      const isCurrentMonth = revenueMonth === currentMonth && revenueYear === currentYear;
      
      if (isCurrentMonth) {
        console.log('🔍 DEBUG - Receita do mês atual:', {
          date: revenue.date,
          value: revenue.value,
          description: revenue.description
        });
      }
      
      return isCurrentMonth;
    });

    const monthlyExpenses = expenses.filter(expense => {
      // Adicionar 'T00:00:00Z' para garantir que seja tratado como UTC
      const expenseDate = new Date(expense.date + 'T00:00:00Z');
      const expenseMonth = expenseDate.getUTCMonth();
      const expenseYear = expenseDate.getUTCFullYear();
      
      const isCurrentMonth = expenseMonth === currentMonth && expenseYear === currentYear;
      
      if (isCurrentMonth) {
        console.log('🔍 DEBUG - Despesa do mês atual:', {
          date: expense.date,
          value: expense.value,
          description: expense.description
        });
      }
      
      return isCurrentMonth;
    });

    // Calcular totais
    const monthlyRevenue = monthlyRevenues.reduce((sum, revenue) => sum + revenue.value, 0);
    const monthlyExpensesTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.value, 0);
    
    // Calcular saldo atual (todas as receitas - todas as despesas)
    const totalRevenues = revenues.reduce((sum, revenue) => sum + revenue.value, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.value, 0);
    const currentBalance = totalRevenues - totalExpenses;

    console.log('🔍 DEBUG - Resultado dos cálculos financeiros:', {
      monthlyRevenuesCount: monthlyRevenues.length,
      monthlyExpensesCount: monthlyExpenses.length,
      monthlyRevenue,
      monthlyExpensesTotal,
      totalRevenues,
      totalExpenses,
      currentBalance
    });

    return {
      monthlyRevenue,
      monthlyExpenses: monthlyExpensesTotal,
      currentBalance
    };
  };

  // Calcular dados do estoque
  const calculateStockData = (): StockData => {
    return SupplyService.calculateStockSummary(supplies);
  };

  // Calcular dados do gráfico financeiro com UTC
  const calculateChartData = (): ChartData => {
    const currentDate = new Date();
    const currentMonth = currentDate.getUTCMonth();
    const currentYear = currentDate.getUTCFullYear();

    // Filtrar despesas do mês atual usando UTC
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date + 'T00:00:00Z');
      return expenseDate.getUTCMonth() === currentMonth && expenseDate.getUTCFullYear() === currentYear;
    });

    // Filtrar receitas do mês atual usando UTC
    const monthlyRevenues = revenues.filter(revenue => {
      const revenueDate = new Date(revenue.date + 'T00:00:00Z');
      return revenueDate.getUTCMonth() === currentMonth && revenueDate.getUTCFullYear() === currentYear;
    });

    const revenue = monthlyRevenues.reduce((sum, rev) => sum + rev.value, 0);
    const expensesTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.value, 0);

    // Agrupar despesas por categoria
    const categoryMap = new Map<string, number>();
    monthlyExpenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, existing + expense.value);
    });

    // Cores para as categorias
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
    
    const categories = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Mostrar apenas as 6 maiores categorias

    return {
      revenue,
      expenses: expensesTotal,
      categories
    };
  };

  // Formatar atividades para exibição
  const formatActivitiesForDisplay = () => {
    return ActivityService.formatActivitiesForDisplay(activities);
  };

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Calcular dados processados
  const financialData = calculateFinancialData();
  const stockData = calculateStockData();
  const chartData = calculateChartData();
  const recentActivities = formatActivitiesForDisplay();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-green-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="flex flex-1 relative">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Backdrop overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchUserData}
                  className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-green-600 font-medium">Carregando dados do dashboard...</p>
              </div>
            ) : (
              <>
                {/* Card 1 - Resumo Financeiro */}
                <FinancialSummary data={financialData} />
                
                {/* Card 2 - Visão Financeira */}
                <FinancialChart data={chartData} />
                
                {/* Card 3 - Estoque de Insumos */}
                <InventoryStock data={stockData} />
                
                {/* Grid para Cards 4 e 5 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Card 4 - Atividades Recentes */}
                  <RecentActivities activities={recentActivities} />
                  
                  {/* Card 5 - Alertas da IA */}
                  <AIAlerts 
                    alerts={[]} 
                    noAlertsMessage="A funcionalidade de alertas inteligentes será implementada em breve. Por enquanto, monitore seus dados através dos outros painéis."
                  />
                </div>

                {/* Mensagem quando não há dados */}
                {revenues.length === 0 && expenses.length === 0 && supplies.length === 0 && activities.length === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 lg:p-8 text-center">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Bem-vindo ao AgroContador!</h3>
                    <p className="text-blue-600 mb-4">
                      Comece registrando suas receitas, despesas, insumos e atividades para ver seus dados aqui.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">📈 Lançar Receita</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">📉 Lançar Despesa</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">📦 Adicionar Insumo</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">🎯 Nova Atividade</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}