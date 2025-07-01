import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  FileText, 
  Tag, 
  Save, 
  ArrowLeft,
  Loader2,
  Activity
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { RevenueService } from '../services/revenueService';
import { ActivityService } from '../services/activityService';
import type { Activity as ActivityType } from '../lib/supabase';

interface RevenueFormData {
  value: string;
  description: string;
  date: string;
  category: string;
  activityId: string;
}

export default function RecordRevenue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [activities, setActivities] = useState<ActivityType[]>([]);
  
  const [formData, setFormData] = useState<RevenueFormData>({
    value: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Data atual
    category: '',
    activityId: ''
  });

  // Categorias de receita comuns para fazendas
  const revenueCategories = [
    'Venda de Grãos',
    'Venda de Gado',
    'Venda de Leite',
    'Venda de Frutas',
    'Venda de Hortaliças',
    'Arrendamento de Terra',
    'Prestação de Serviços',
    'Subsídios Governamentais',
    'Outros'
  ];

  // Buscar atividades do usuário
  const fetchActivities = async () => {
    if (!user) return;

    setLoadingActivities(true);
    try {
      const result = await ActivityService.getUserActivities(user.id);
      
      if (result.success && result.data) {
        setActivities(result.data);
        console.log('✅ Atividades carregadas:', result.data.length);
      } else {
        console.error('Erro ao carregar atividades:', result.error);
        // Não mostrar erro para o usuário, apenas log
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar atividades:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Carregar atividades quando o componente montar
  useEffect(() => {
    fetchActivities();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.value.trim()) {
      newErrors.value = 'Valor é obrigatório';
    } else {
      const numericValue = parseFloat(formData.value.replace(',', '.'));
      if (isNaN(numericValue) || numericValue <= 0) {
        newErrors.value = 'Valor deve ser um número positivo';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Descrição deve ter pelo menos 5 caracteres';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Final do dia atual
      
      if (selectedDate > today) {
        newErrors.date = 'Data não pode ser futura';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ general: 'Usuário não autenticado. Faça login novamente.' });
      return;
    }

    // LOG DE DEPURAÇÃO: Verificar user.id antes de enviar
    console.log('🔍 DEBUG - User ID sendo enviado para RevenueService:', user.id);
    console.log('🔍 DEBUG - Dados do usuário completos:', user);
    console.log('🔍 DEBUG - Dados do formulário:', formData);

    setLoading(true);
    setErrors({});
    
    try {
      const numericValue = parseFloat(formData.value.replace(',', '.'));
      
      const result = await RevenueService.createRevenue(user.id, {
        value: numericValue,
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        activityId: formData.activityId || null
      });
      
      if (result.success) {
        setSuccessMessage('Receita lançada com sucesso!');
        
        // Limpar formulário após sucesso
        setFormData({
          value: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          category: '',
          activityId: ''
        });
        
        // Remover mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccessMessage(''), 3000);
        
        console.log('✅ Receita salva:', result.data);
      } else {
        console.log('❌ DEBUG - Erro retornado pelo RevenueService:', result.error);
        setErrors({ general: result.error || 'Erro ao salvar receita. Tente novamente.' });
      }
      
    } catch (error) {
      console.error('💥 Erro inesperado ao salvar receita:', error);
      setErrors({ general: 'Erro interno do sistema. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const numericValue = value.replace(/[^\d,.-]/g, '');
    return numericValue;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    setFormData(prev => ({
      ...prev,
      value: formattedValue
    }));
    
    if (errors.value) {
      setErrors(prev => ({
        ...prev,
        value: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Botão Voltar */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-green-600 hover:text-green-700 font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar ao Dashboard
            </button>

            {/* Cabeçalho da Página */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-8 border border-green-100 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="bg-green-600 p-3 lg:p-4 rounded-full">
                  <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-green-800">Lançar Receita</h1>
                  <p className="text-green-600 text-sm lg:text-base">Registre as entradas de faturamento da sua propriedade</p>
                </div>
              </div>

              {/* Mensagem de Sucesso */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-600 font-medium">{successMessage}</p>
                </div>
              )}

              {/* Mensagem de Erro Geral */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Valor */}
                  <div className="space-y-2">
                    <label htmlFor="value" className="block text-sm font-medium text-green-700">
                      Valor (R$) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                      <input
                        type="text"
                        id="value"
                        name="value"
                        value={formData.value}
                        onChange={handleValueChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.value ? 'border-red-300' : 'border-green-200'
                        }`}
                        placeholder="0,00"
                      />
                    </div>
                    {errors.value && (
                      <p className="text-sm text-red-600">{errors.value}</p>
                    )}
                  </div>

                  {/* Data */}
                  <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-medium text-green-700">
                      Data *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        disabled={loading}
                        max={new Date().toISOString().split('T')[0]} // Não permitir datas futuras
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.date ? 'border-red-300' : 'border-green-200'
                        }`}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-green-700">
                    Categoria *
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.category ? 'border-red-300' : 'border-green-200'
                      }`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {revenueCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Atividade */}
                <div className="space-y-2">
                  <label htmlFor="activityId" className="block text-sm font-medium text-green-700">
                    Atividade
                    <span className="text-xs text-gray-500 ml-2">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                    <select
                      id="activityId"
                      name="activityId"
                      value={formData.activityId}
                      onChange={handleInputChange}
                      disabled={loading || loadingActivities}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.activityId ? 'border-red-300' : 'border-green-200'
                      }`}
                    >
                      <option value="">Selecione uma atividade (opcional)</option>
                      {activities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.name} - {activity.status === 'planejada' ? 'Planejada' : 
                           activity.status === 'em_andamento' ? 'Em Andamento' : 
                           activity.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                        </option>
                      ))}
                    </select>
                    {loadingActivities && (
                      <div className="absolute right-3 top-3">
                        <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.activityId && (
                    <p className="text-sm text-red-600">{errors.activityId}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Vincule esta receita a uma atividade específica para melhor controle
                  </p>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-green-700">
                    Descrição *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={loading}
                      rows={4}
                      maxLength={500}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none ${
                        errors.description ? 'border-red-300' : 'border-green-200'
                      }`}
                      placeholder="Descreva a origem da receita (ex: Venda de 100 sacas de milho para cooperativa)"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    {errors.description ? (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Mínimo 5 caracteres</p>
                    )}
                    <p className="text-sm text-gray-400">
                      {formData.description.length}/500
                    </p>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-green-100">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Salvar Receita
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Dicas */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-blue-800 mb-3">💡 Dicas para Lançamento de Receitas</h3>
              <ul className="space-y-2 text-sm lg:text-base text-blue-700">
                <li>• <strong>Seja específico:</strong> Detalhe a origem da receita para melhor controle</li>
                <li>• <strong>Data correta:</strong> Use sempre a data real da transação</li>
                <li>• <strong>Categoria adequada:</strong> Escolha a categoria que melhor representa a receita</li>
                <li>• <strong>Vincule à atividade:</strong> Conecte receitas às atividades correspondentes para análises detalhadas</li>
                <li>• <strong>Documentação:</strong> Mantenha sempre os comprovantes das vendas</li>
                <li>• <strong>Valores precisos:</strong> Use vírgula ou ponto para separar decimais (ex: 1500,50)</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}