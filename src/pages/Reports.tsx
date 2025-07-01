import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowLeft,
  Loader2,
  AlertCircle,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { RevenueService } from '../services/revenueService';
import { ExpenseService } from '../services/expenseService';
import type { Revenue, Expense } from '../lib/supabase';

interface FinancialSummary {
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  revenueCount: number;
  expenseCount: number;
}

interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export default function Reports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // Calcular resumo financeiro
  const calculateSummary = (): FinancialSummary => {
    const totalRevenues = revenues.reduce((sum, revenue) => sum + revenue.value, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.value, 0);
    const netProfit = totalRevenues - totalExpenses;
    
    return {
      totalRevenues,
      totalExpenses,
      netProfit,
      revenueCount: revenues.length,
      expenseCount: expenses.length
    };
  };

  // Calcular resumo por categoria
  const calculateCategorySummary = (data: (Revenue | Expense)[], type: 'revenue' | 'expense'): CategorySummary[] => {
    const categoryMap = new Map<string, { total: number; count: number }>();
    
    data.forEach(item => {
      const existing = categoryMap.get(item.category) || { total: 0, count: 0 };
      categoryMap.set(item.category, {
        total: existing.total + item.value,
        count: existing.count + 1
      });
    });

    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: total > 0 ? (data.total / total) * 100 : 0
    })).sort((a, b) => b.total - a.total);
  };

  // Buscar dados financeiros
  const fetchFinancialData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      let revenuePromise;
      let expensePromise;

      if (dateFilter.startDate && dateFilter.endDate) {
        revenuePromise = RevenueService.getRevenuesByPeriod(user.id, dateFilter.startDate, dateFilter.endDate);
        expensePromise = ExpenseService.getExpensesByPeriod(user.id, dateFilter.startDate, dateFilter.endDate);
      } else {
        revenuePromise = RevenueService.getUserRevenues(user.id);
        expensePromise = ExpenseService.getUserExpenses(user.id);
      }

      const [revenueResult, expenseResult] = await Promise.all([revenuePromise, expensePromise]);

      if (revenueResult.success && revenueResult.data) {
        setRevenues(revenueResult.data);
      } else {
        console.error('Erro ao carregar receitas:', revenueResult.error);
      }

      if (expenseResult.success && expenseResult.data) {
        setExpenses(expenseResult.data);
      } else {
        console.error('Erro ao carregar despesas:', expenseResult.error);
      }

    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      setError('Erro ao carregar dados financeiros. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Gerar PDF
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    setGeneratingPDF(true);
    
    try {
      // Configurações do canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight
      });

      // Configurações do PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular dimensões proporcionais
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // Se a imagem for muito alta, dividir em páginas
      const pageHeight = pdfHeight / ratio;
      let heightLeft = imgHeight;
      let position = 0;

      // Primeira página
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, Math.min(imgHeight * ratio, pdfHeight));
      heightLeft -= pageHeight;

      // Páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position * ratio, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pageHeight;
      }

      // Salvar o PDF
      const fileName = `relatorio-financeiro-${user?.farmName?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchFinancialData();
  }, [user, dateFilter]);

  const summary = calculateSummary();
  const revenueCategorySummary = calculateCategorySummary(revenues, 'revenue');
  const expenseCategorySummary = calculateCategorySummary(expenses, 'expense');

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Botão Voltar */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-orange-600 hover:text-orange-700 font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar ao Dashboard
            </button>

            {/* Cabeçalho da Página */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-8 border border-orange-100 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-600 p-4 rounded-full">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-orange-800">Relatórios Financeiros</h1>
                    <p className="text-orange-600">Visualize e exporte relatórios detalhados da sua propriedade</p>
                  </div>
                </div>
                
                <button
                  onClick={generatePDF}
                  disabled={generatingPDF || loading}
                  className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-orange-400 disabled:cursor-not-allowed font-medium"
                >
                  {generatingPDF ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Gerar Relatório PDF
                    </>
                  )}
                </button>
              </div>

              {/* Filtros de Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-2">
                    Data Inicial
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full pl-10 pr-3 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-2">
                    Data Final
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full pl-10 pr-3 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                    className="w-full md:w-auto flex items-center justify-center px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Limpar Filtros
                  </button>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Conteúdo do Relatório */}
            <div ref={reportRef} className="bg-white rounded-xl shadow-lg border border-orange-100 p-4 lg:p-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600 mr-3" />
                  <span className="text-orange-600 font-medium">Carregando dados financeiros...</span>
                </div>
              ) : (
                <>
                  {/* Cabeçalho do Relatório */}
                  <div className="text-center mb-8 border-b border-gray-200 pb-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">Relatório Financeiro</h2>
                    <p className="text-gray-600">{user.farmName}</p>
                    <p className="text-sm text-gray-500">
                      Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                    </p>
                    {dateFilter.startDate && dateFilter.endDate && (
                      <p className="text-sm text-gray-500 mt-1">
                        Período: {formatDate(dateFilter.startDate)} a {formatDate(dateFilter.endDate)}
                      </p>
                    )}
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="mb-8">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="h-6 w-6 mr-2 text-orange-600" />
                      Resumo Financeiro
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-green-600 font-medium">Total de Receitas</p>
                            <p className="text-xl lg:text-2xl font-bold text-green-800 truncate">{formatCurrency(summary.totalRevenues)}</p>
                            <p className="text-xs text-green-600">{summary.revenueCount} lançamentos</p>
                          </div>
                          <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0 ml-2" />
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-red-600 font-medium">Total de Despesas</p>
                            <p className="text-xl lg:text-2xl font-bold text-red-800 truncate">{formatCurrency(summary.totalExpenses)}</p>
                            <p className="text-xs text-red-600">{summary.expenseCount} lançamentos</p>
                          </div>
                          <TrendingDown className="h-6 w-6 lg:h-8 lg:w-8 text-red-600 flex-shrink-0 ml-2" />
                        </div>
                      </div>

                      <div className={`${summary.netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} rounded-lg p-4 border`}>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                              Lucro Líquido
                            </p>
                            <p className={`text-xl lg:text-2xl font-bold ${summary.netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'} truncate`}>
                              {formatCurrency(summary.netProfit)}
                            </p>
                            <p className={`text-xs ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                              {summary.netProfit >= 0 ? 'Lucro' : 'Prejuízo'}
                            </p>
                          </div>
                          <DollarSign className={`h-6 w-6 lg:h-8 lg:w-8 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'} flex-shrink-0 ml-2`} />
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-600 font-medium">Margem de Lucro</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-800 truncate">
                              {summary.totalRevenues > 0 ? ((summary.netProfit / summary.totalRevenues) * 100).toFixed(1) : '0.0'}%
                            </p>
                            <p className="text-xs text-gray-600">Sobre receitas</p>
                          </div>
                          <PieChart className="h-6 w-6 lg:h-8 lg:w-8 text-gray-600 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receitas por Categoria */}
                  {revenueCategorySummary.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">Receitas por Categoria</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-green-50">
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-left font-semibold text-green-800 text-sm lg:text-base">Categoria</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-right font-semibold text-green-800 text-sm lg:text-base">Valor</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-green-800 text-sm lg:text-base">Qtd</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-green-800 text-sm lg:text-base">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revenueCategorySummary.map((category, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-sm lg:text-base">{category.category}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-right font-medium text-sm lg:text-base">{formatCurrency(category.total)}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center text-sm lg:text-base">{category.count}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center text-sm lg:text-base">{category.percentage.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Despesas por Categoria */}
                  {expenseCategorySummary.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">Despesas por Categoria</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-red-50">
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-left font-semibold text-red-800 text-sm lg:text-base">Categoria</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-right font-semibold text-red-800 text-sm lg:text-base">Valor</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-red-800 text-sm lg:text-base">Qtd</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-red-800 text-sm lg:text-base">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expenseCategorySummary.map((category, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-sm lg:text-base">{category.category}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-right font-medium text-sm lg:text-base">{formatCurrency(category.total)}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center text-sm lg:text-base">{category.count}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center text-sm lg:text-base">{category.percentage.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Detalhamento de Receitas */}
                  {revenues.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">Detalhamento de Receitas</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-green-50">
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-left font-semibold text-green-800 text-sm lg:text-base">Data</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-left font-semibold text-green-800 text-sm lg:text-base">Descrição</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-left font-semibold text-green-800 text-sm lg:text-base">Categoria</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-right font-semibold text-green-800 text-sm lg:text-base">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revenues.map((revenue, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-sm lg:text-base whitespace-nowrap">{formatDate(revenue.date)}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-sm lg:text-base">{revenue.description}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-sm lg:text-base">{revenue.category}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-right font-medium text-sm lg:text-base whitespace-nowrap">{formatCurrency(revenue.value)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Detalhamento de Despesas */}
                  {expenses.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">Detalhamento de Despesas</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-red-50">
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-left font-semibold text-red-800 text-sm lg:text-base">Data</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-left font-semibold text-red-800 text-sm lg:text-base">Descrição</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-left font-semibold text-red-800 text-sm lg:text-base">Categoria</th>
                              <th className="border border-gray-300 px-2 lg:px-4 py-2 text-right font-semibold text-red-800 text-sm lg:text-base">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expenses.map((expense, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-sm lg:text-base whitespace-nowrap">{formatDate(expense.date)}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-sm lg:text-base">{expense.description}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-sm lg:text-base">{expense.category}</td>
                                <td className="border border-gray-300 px-2 lg:px-4 py-2 text-right font-medium text-sm lg:text-base whitespace-nowrap">{formatCurrency(expense.value)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Mensagem quando não há dados */}
                  {revenues.length === 0 && expenses.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum dado financeiro encontrado</h3>
                      <p className="text-gray-500 text-sm lg:text-base">
                        {dateFilter.startDate && dateFilter.endDate 
                          ? 'Não há registros no período selecionado.' 
                          : 'Comece lançando suas receitas e despesas para gerar relatórios.'
                        }
                      </p>
                    </div>
                  )}

                  {/* Rodapé do Relatório */}
                  <div className="border-t border-gray-200 pt-6 mt-8">
                    <div className="text-center text-xs lg:text-sm text-gray-500">
                      <p>Relatório gerado pelo AgroContador - Sistema de Gestão Rural</p>
                      <p>© 2024 AgroContador - Desenvolvido para o campo brasileiro</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}