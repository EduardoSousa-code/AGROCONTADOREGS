import React, { useState, useEffect } from 'react';
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
  TrendingDown,
  Eye,
  Trash2,
  RefreshCw,
  Edit
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { SupplyService } from '../services/supplyService';
import type { CreateSupplyData } from '../services/supplyService';
import type { Supply } from '../lib/supabase';

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
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [supplyListError, setSupplyListError] = useState('');
  
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

  // Buscar insumos do usuário
  const fetchSupplies = async () => {
    if (!user) return;

    setLoadingSupplies(true);
    setSupplyListError('');
    
    try {
      const result = await SupplyService.getUserSupplies(user.id);
      
      if (result.success && result.data) {
        setSupplies(result.data);
        console.log('✅ Insumos carregados:', result.data.length);
      } else {
        console.error('Erro ao carregar insumos:', result.error);
        setSupplyListError(result.error || 'Erro ao carregar lista de insumos.');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar insumos:', error);
      setSupplyListError('Erro interno ao carregar insumos.');
    } finally {
      setLoadingSupplies(false);
    }
  };

  // Deletar insumo
  const handleDeleteSupply = async (supplyId: string, supplyName: string) => {
    if (!user) return;
    
    if (!confirm(`Tem certeza que deseja deletar o insumo "${supplyName}"?`)) {
      return;
    }

    try {
      const result = await SupplyService.deleteSupply(user.id, supplyId);
      
      if (result.success) {
        setSuccessMessage(`Insumo "${supplyName}" deletado com sucesso!`);
        // Atualizar lista
        await fetchSupplies();
        
        // Remover mensagem após 3 segundos
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setSupplyListError(result.error || 'Erro ao deletar insumo.');
      }
    } catch (error) {
      console.error('💥 Erro ao deletar insumo:', error);
      setSupplyListError('Erro interno ao deletar insumo.');
    }
  };

  // Carregar insumos quando o componente montar
  useEffect(() => {
    fetchSupplies();
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
        
        // Atualizar lista de insumos
        await fetchSupplies();
        
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStockStatus = (supply: Supply) => {
    if (supply.current_stock <= supply.min_stock_level) {
      return { status: 'low', color: 'text-red-600 bg-red-50', label: 'Estoque Baixo' };
    } else if (supply.current_stock >= supply.max_stock_level) {
      return { status: 'high', color: 'text-blue-600 bg-blue-50', label: 'Estoque Alto' };
    } else {
      return { status: 'normal', color: 'text-green-600 bg-green-50', label: 'Normal' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
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

            {/* Lista de Insumos */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-8 border border-blue-100 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl lg:text-2xl font-bold text-blue-800 flex items-center">
                  <Eye className="h-6 w-6 mr-2 text-blue-600" />
                  Lista de Insumos
                </h2>
                <button
                  onClick={fetchSupplies}
                  disabled={loadingSupplies}
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingSupplies ? 'animate-spin' : ''}`} />
                  Atualizar Lista
                </button>
              </div>

              {/* Mensagem de Erro da Lista */}
              {supplyListError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{supplyListError}</p>
                </div>
              )}

              {/* Loading da Lista */}
              {loadingSupplies ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                  <span className="text-blue-600 font-medium">Carregando insumos...</span>
                </div>
              ) : supplies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="border border-gray-300 px-2 lg:px-4 py-2 text-left font-semibold text-blue-800 text-sm lg:text-base">Nome</th>
                        <th className="border border-gray-300 px-2 lg:px-4 py-2 text-left font-semibold text-blue-800 text-sm lg:text-base">Descrição</th>
                        <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-blue-800 text-sm lg:text-base">Estoque Atual</th>
                        <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-blue-800 text-sm lg:text-base">Unidade</th>
                        <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-blue-800 text-sm lg:text-base">Nível Mín.</th>
                        <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-blue-800 text-sm lg:text-base">Nível Máx.</th>
                        <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-blue-800 text-sm lg:text-base">Validade</th>
                        <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-blue-800 text-sm lg:text-base">Status</th>
                        <th className="border border-gray-300 px-2 lg:px-4 py-2 text-center font-semibold text-blue-800 text-sm lg:text-base">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplies.map((supply) => {
                        const stockStatus = getStockStatus(supply);
                        return (
                          <tr key={supply.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-2 lg:px-4 py-2 text-sm lg:text-base font-medium">
                              {supply.name}
                            </td>
                            <td className="border border-gray-300 px-2 lg:px-4 py-2 text-sm lg:text-base">
                              {supply.description || '-'}
                            </td>
                            <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center text-sm lg:text-base font-medium">
                              {supply.current_stock}
                            </td>
                            <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center text-sm lg:text-base">
                              {supply.unit}
                            </td>
                            <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center text-sm lg:text-base">
                              {supply.min_stock_level}
                            </td>
                            <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center text-sm lg:text-base">
                              {supply.max_stock_level}
                            </td>
                            <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center text-sm lg:text-base">
                              {supply.expiry_date ? formatDate(supply.expiry_date) : '-'}
                            </td>
                            <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                {stockStatus.label}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-2 lg:px-4 py-2 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleDeleteSupply(supply.id, supply.name)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Deletar insumo"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum insumo cadastrado</h3>
                  <p className="text-gray-500">
                    Comece adicionando seus primeiros insumos usando o formulário acima.
                  </p>
                </div>
              )}
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
                <li>• <strong>Monitoramento:</strong> Fique atento aos alertas de estoque baixo e validade próxima</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}