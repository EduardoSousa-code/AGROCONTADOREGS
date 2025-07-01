import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Scale, 
  Hash, 
  Calendar, 
  FileText, 
  Save, 
  ArrowLeft,
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { SupplyService } from '../services/supplyService';
import type { CreateSupplyData } from '../services/supplyService';

interface SupplyFormData {
  name: string;
  unit: string;
  currentStock: string;
  minStockLevel: string;
  maxStockLevel: string;
  expiryDate: string;
  description: string;
}

export default function AddSupply() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState<SupplyFormData>({
    name: '',
    unit: '',
    currentStock: '',
    minStockLevel: '',
    maxStockLevel: '',
    expiryDate: '',
    description: ''
  });

  // Unidades comuns para insumos agrícolas
  const commonUnits = [
    'kg',
    'litros',
    'toneladas',
    'sacas',
    'metros',
    'unidades',
    'caixas',
    'fardos',
    'galões',
    'gramas'
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
      newErrors.name = 'Nome do insumo é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unidade é obrigatória';
    }

    if (!formData.currentStock.trim()) {
      newErrors.currentStock = 'Estoque atual é obrigatório';
    } else {
      const currentStock = parseFloat(formData.currentStock.replace(',', '.'));
      if (isNaN(currentStock) || currentStock < 0) {
        newErrors.currentStock = 'Estoque atual deve ser um número não negativo';
      }
    }

    if (!formData.minStockLevel.trim()) {
      newErrors.minStockLevel = 'Nível mínimo é obrigatório';
    } else {
      const minStock = parseFloat(formData.minStockLevel.replace(',', '.'));
      if (isNaN(minStock) || minStock < 0) {
        newErrors.minStockLevel = 'Nível mínimo deve ser um número não negativo';
      }
    }

    if (!formData.maxStockLevel.trim()) {
      newErrors.maxStockLevel = 'Nível máximo é obrigatório';
    } else {
      const maxStock = parseFloat(formData.maxStockLevel.replace(',', '.'));
      if (isNaN(maxStock) || maxStock < 0) {
        newErrors.maxStockLevel = 'Nível máximo deve ser um número não negativo';
      }
      
      // Verificar se nível máximo é maior que o mínimo
      const minStock = parseFloat(formData.minStockLevel.replace(',', '.'));
      if (!isNaN(minStock) && !isNaN(maxStock) && maxStock < minStock) {
        newErrors.maxStockLevel = 'Nível máximo deve ser maior ou igual ao nível mínimo';
      }
    }

    // Validar data de validade se fornecida
    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Início do dia atual
      
      if (expiryDate < today) {
        newErrors.expiryDate = 'Data de validade não pode ser no passado';
      }
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
      const supplyData: CreateSupplyData = {
        name: formData.name.trim(),
        unit: formData.unit.trim(),
        currentStock: parseFloat(formData.currentStock.replace(',', '.')),
        minStockLevel: parseFloat(formData.minStockLevel.replace(',', '.')),
        maxStockLevel: parseFloat(formData.maxStockLevel.replace(',', '.')),
        expiryDate: formData.expiryDate || null,
        description: formData.description.trim() || null
      };
      
      const result = await SupplyService.createSupply(user.id, supplyData);
      
      if (result.success) {
        setSuccessMessage('Insumo adicionado com sucesso!');
        
        // Limpar formulário após sucesso
        setFormData({
          name: '',
          unit: '',
          currentStock: '',
          minStockLevel: '',
          maxStockLevel: '',
          expiryDate: '',
          description: ''
        });
        
        // Remover mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccessMessage(''), 3000);
        
        console.log('✅ Insumo salvo:', result.data);
      } else {
        setErrors({ general: result.error || 'Erro ao salvar insumo. Tente novamente.' });
      }
      
    } catch (error) {
      console.error('💥 Erro inesperado ao salvar insumo:', error);
      setErrors({ general: 'Erro interno do sistema. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: string) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const numericValue = value.replace(/[^\d,.-]/g, '');
    return numericValue;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const formattedValue = formatNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      [fieldName]: formattedValue
    }));
    
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Botão Voltar */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar ao Dashboard
            </button>

            {/* Cabeçalho da Página */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-8 border border-blue-100 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="bg-blue-600 p-3 lg:p-4 rounded-full">
                  <Package className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-blue-800">Adicionar Insumo</h1>
                  <p className="text-blue-600 text-sm lg:text-base">Cadastre insumos e controle o estoque da sua propriedade</p>
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
                  {/* Nome do Insumo */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-blue-700">
                      Nome do Insumo *
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.name ? 'border-red-300' : 'border-blue-200'
                        }`}
                        placeholder="Ex: Fertilizante NPK 20-05-20"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Unidade */}
                  <div className="space-y-2">
                    <label htmlFor="unit" className="block text-sm font-medium text-blue-700">
                      Unidade *
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                      <select
                        id="unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.unit ? 'border-red-300' : 'border-blue-200'
                        }`}
                      >
                        <option value="">Selecione uma unidade</option>
                        {commonUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.unit && (
                      <p className="text-sm text-red-600">{errors.unit}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Estoque Atual */}
                  <div className="space-y-2">
                    <label htmlFor="currentStock" className="block text-sm font-medium text-blue-700">
                      Estoque Atual *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                      <input
                        type="text"
                        id="currentStock"
                        name="currentStock"
                        value={formData.currentStock}
                        onChange={(e) => handleNumberChange(e, 'currentStock')}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.currentStock ? 'border-red-300' : 'border-blue-200'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    {errors.currentStock && (
                      <p className="text-sm text-red-600">{errors.currentStock}</p>
                    )}
                  </div>

                  {/* Nível Mínimo */}
                  <div className="space-y-2">
                    <label htmlFor="minStockLevel" className="block text-sm font-medium text-blue-700">
                      Nível Mínimo *
                    </label>
                    <div className="relative">
                      <TrendingDown className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                      <input
                        type="text"
                        id="minStockLevel"
                        name="minStockLevel"
                        value={formData.minStockLevel}
                        onChange={(e) => handleNumberChange(e, 'minStockLevel')}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.minStockLevel ? 'border-red-300' : 'border-blue-200'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    {errors.minStockLevel && (
                      <p className="text-sm text-red-600">{errors.minStockLevel}</p>
                    )}
                  </div>

                  {/* Nível Máximo */}
                  <div className="space-y-2">
                    <label htmlFor="maxStockLevel" className="block text-sm font-medium text-blue-700">
                      Nível Máximo *
                    </label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                      <input
                        type="text"
                        id="maxStockLevel"
                        name="maxStockLevel"
                        value={formData.maxStockLevel}
                        onChange={(e) => handleNumberChange(e, 'maxStockLevel')}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.maxStockLevel ? 'border-red-300' : 'border-blue-200'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    {errors.maxStockLevel && (
                      <p className="text-sm text-red-600">{errors.maxStockLevel}</p>
                    )}
                  </div>
                </div>

                {/* Data de Validade */}
                <div className="space-y-2">
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-blue-700">
                    Data de Validade
                    <span className="text-xs text-gray-500 ml-2">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      disabled={loading}
                      min={new Date().toISOString().split('T')[0]} // Não permitir datas passadas
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.expiryDate ? 'border-red-300' : 'border-blue-200'
                      }`}
                    />
                  </div>
                  {errors.expiryDate && (
                    <p className="text-sm text-red-600">{errors.expiryDate}</p>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-blue-700">
                    Descrição
                    <span className="text-xs text-gray-500 ml-2">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={loading}
                      rows={4}
                      maxLength={500}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none ${
                        errors.description ? 'border-red-300' : 'border-blue-200'
                      }`}
                      placeholder="Informações adicionais sobre o insumo (ex: marca, fornecedor, observações)"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    {errors.description ? (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Informações adicionais (opcional)</p>
                    )}
                    <p className="text-sm text-gray-400">
                      {formData.description.length}/500
                    </p>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-blue-100">
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
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Salvar Insumo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Dicas */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-yellow-800 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                💡 Dicas para Controle de Estoque
              </h3>
              <ul className="space-y-2 text-sm lg:text-base text-yellow-700">
                <li>• <strong>Nome claro:</strong> Use nomes descritivos que facilitem a identificação</li>
                <li>• <strong>Unidades corretas:</strong> Escolha a unidade que você usa na prática</li>
                <li>• <strong>Níveis de estoque:</strong> Defina níveis mínimo e máximo realistas</li>
                <li>• <strong>Data de validade:</strong> Cadastre para insumos perecíveis</li>
                <li>• <strong>Descrição útil:</strong> Inclua marca, fornecedor ou outras informações importantes</li>
                <li>• <strong>Atualização regular:</strong> Mantenha os dados sempre atualizados</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}