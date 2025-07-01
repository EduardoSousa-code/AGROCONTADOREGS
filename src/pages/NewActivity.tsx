import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  FileText, 
  Save, 
  ArrowLeft,
  Loader2,
  Play,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { ActivityService } from '../services/activityService';
import type { CreateActivityData } from '../services/activityService';

interface ActivityFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function NewActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState<ActivityFormData>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0], // Data atual
    endDate: '',
    status: 'planejada'
  });

  // Status disponíveis para atividades
  const activityStatuses = [
    { value: 'planejada', label: 'Planejada', icon: Clock, color: 'text-blue-600' },
    { value: 'em_andamento', label: 'Em Andamento', icon: Play, color: 'text-orange-600' },
    { value: 'concluida', label: 'Concluída', icon: CheckCircle, color: 'text-green-600' },
    { value: 'cancelada', label: 'Cancelada', icon: XCircle, color: 'text-red-600' }
  ];

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

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da atividade é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    // Validar data de fim se fornecida
    if (formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate < startDate) {
        newErrors.endDate = 'Data de fim deve ser posterior à data de início';
      }
    }

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
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

    setLoading(true);
    setErrors({});
    
    try {
      const activityData: CreateActivityData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        status: formData.status
      };
      
      const result = await ActivityService.createActivity(user.id, activityData);
      
      if (result.success) {
        setSuccessMessage('Atividade criada com sucesso!');
        
        // Limpar formulário após sucesso
        setFormData({
          name: '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          status: 'planejada'
        });
        
        // Remover mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccessMessage(''), 3000);
        
        console.log('✅ Atividade salva:', result.data);
      } else {
        setErrors({ general: result.error || 'Erro ao salvar atividade. Tente novamente.' });
      }
      
    } catch (error) {
      console.error('💥 Erro inesperado ao salvar atividade:', error);
      setErrors({ general: 'Erro interno do sistema. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusConfig = activityStatuses.find(s => s.value === status);
    return statusConfig ? statusConfig.icon : Clock;
  };

  const getStatusColor = (status: string) => {
    const statusConfig = activityStatuses.find(s => s.value === status);
    return statusConfig ? statusConfig.color : 'text-blue-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Botão Voltar */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-purple-600 hover:text-purple-700 font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar ao Dashboard
            </button>

            {/* Cabeçalho da Página */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-8 border border-purple-100 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="bg-purple-600 p-3 lg:p-4 rounded-full">
                  <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-purple-800">Nova Atividade</h1>
                  <p className="text-purple-600 text-sm lg:text-base">Planeje e organize as atividades da sua propriedade</p>
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
                {/* Nome da Atividade */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-purple-700">
                    Nome da Atividade *
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.name ? 'border-red-300' : 'border-purple-200'
                      }`}
                      placeholder="Ex: Plantio de Milho - Talhão 1"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Data de Início */}
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="block text-sm font-medium text-purple-700">
                      Data de Início *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.startDate ? 'border-red-300' : 'border-purple-200'
                        }`}
                      />
                    </div>
                    {errors.startDate && (
                      <p className="text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  {/* Data de Fim */}
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="block text-sm font-medium text-purple-700">
                      Data de Fim
                      <span className="text-xs text-gray-500 ml-2">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        disabled={loading}
                        min={formData.startDate} // Não permitir data anterior ao início
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.endDate ? 'border-red-300' : 'border-purple-200'
                        }`}
                      />
                    </div>
                    {errors.endDate && (
                      <p className="text-sm text-red-600">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-medium text-purple-700">
                    Status *
                  </label>
                  <div className="relative">
                    {React.createElement(getStatusIcon(formData.status), {
                      className: `absolute left-3 top-3 h-5 w-5 ${getStatusColor(formData.status)}`
                    })}
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.status ? 'border-red-300' : 'border-purple-200'
                      }`}
                    >
                      {activityStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status}</p>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-purple-700">
                    Descrição
                    <span className="text-xs text-gray-500 ml-2">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={loading}
                      rows={4}
                      maxLength={1000}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none ${
                        errors.description ? 'border-red-300' : 'border-purple-200'
                      }`}
                      placeholder="Descreva os detalhes da atividade (ex: área a ser plantada, variedade, equipamentos necessários, etc.)"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    {errors.description ? (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Detalhes e observações sobre a atividade</p>
                    )}
                    <p className="text-sm text-gray-400">
                      {formData.description.length}/1000
                    </p>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-purple-100">
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
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Criar Atividade
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Dicas */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-indigo-800 mb-3">💡 Dicas para Planejamento de Atividades</h3>
              <ul className="space-y-2 text-sm lg:text-base text-indigo-700">
                <li>• <strong>Nome descritivo:</strong> Use nomes que identifiquem claramente a atividade e local</li>
                <li>• <strong>Datas realistas:</strong> Considere fatores climáticos e disponibilidade de recursos</li>
                <li>• <strong>Status adequado:</strong> Mantenha o status atualizado conforme o progresso</li>
                <li>• <strong>Descrição detalhada:</strong> Inclua informações importantes como área, variedades, equipamentos</li>
                <li>• <strong>Planejamento antecipado:</strong> Cadastre atividades com antecedência para melhor organização</li>
                <li>• <strong>Acompanhamento:</strong> Revise regularmente o status das atividades em andamento</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}