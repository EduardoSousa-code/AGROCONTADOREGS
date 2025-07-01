import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Save, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Edit3,
  Trash2,
  Calendar,
  Hash,
  FileText,
  Scale,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { SupplyService } from '../services/supplyService';
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

interface StockMovement {
  type: 'entrada' | 'saida';
  quantity: string;
  reason: string;
}

export default function AddSupply() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingSupplies, setLoadingSupplies] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [showStockMovement, setShowStockMovement] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState<SupplyFormData>({
    name: '',
    unit: '',
    currentStock: '',
    minStockLevel: '',
    maxStockLevel: '',
    expiryDate: '',
    description: ''
  });

  const [stockMovement, setStockMovement] = useState<StockMovement>({
    type: 'entrada',
    quantity: '',
    reason: ''
  });

  // Unidades de medida comuns
  const units = [
    'kg', 'g', 'ton', 'L', 'mL', 'un', 'cx', 'sc', 'pct', 'm', 'cm', 'ha'
  ];

  // Buscar insumos do usuário
  const fetchSupplies = async () => {
    if (!user) return;
    
    setLoadingSupplies(true);
    try {
      const result = await SupplyService.getUserSupplies(user.id);
      if (result.success && result.data) {
        setSupplies(result.data);
      } else {
        console.error('Erro ao carregar insumos:', result.error);
      }
    } catch (error) {
      console.error('Erro ao buscar insumos:', error);
    } finally {
      setLoadingSupplies(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStockMovementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStockMovement(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do insumo é obrigatório';
    }

    if (!formData.unit) {
      newErrors.unit = 'Unidade de medida é obrigatória';
    }

    if (!formData.currentStock.trim()) {
      newErrors.currentStock = 'Estoque atual é obrigatório';
    } else {
      const stock = parseFloat(formData.currentStock.replace(',', '.'));
      if (isNaN(stock) || stock < 0) {
        newErrors.currentStock = 'Estoque deve ser um número válido e não negativo';
      }
    }

    if (!formData.minStockLevel.trim()) {
      newErrors.minStockLevel = 'Nível mínimo é obrigatório';
    } else {
      const minLevel = parseFloat(formData.minStockLevel.replace(',', '.'));
      if (isNaN(minLevel) || minLevel < 0) {
        newErrors.minStockLevel = 'Nível mínimo deve ser um número válido e não negativo';
      }
    }

    if (!formData.maxStockLevel.trim()) {
      newErrors.maxStockLevel = 'Nível máximo é obrigatório';
    } else {
      const maxLevel = parseFloat(formData.maxStockLevel.replace(',', '.'));
      const minLevel = parseFloat(formData.minStockLevel.replace(',', '.'));
      if (isNaN(maxLevel) || maxLevel < 0) {
        newErrors.maxStockLevel = 'Nível máximo deve ser um número válido e não negativo';
      } else if (!isNaN(minLevel) && maxLevel < minLevel) {
        newErrors.maxStockLevel = 'Nível máximo deve ser maior que o nível mínimo';
      }
    }

    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        newErrors.expiryDate = 'Data de vencimento não pode ser no passado';
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
      const supplyData = {
        name: formData.name.trim(),
        unit: formData.unit,
        currentStock: parseFloat(formData.currentStock.replace(',', '.')),
        minStockLevel: parseFloat(formData.minStockLevel.replace(',', '.')),
        maxStockLevel: parseFloat(formData.maxStockLevel.replace(',', '.')),
        expiryDate: formData.expiryDate || null,
        description: formData.description.trim() || null
      };

      let result;
      if (editingSupply) {
        result = await SupplyService.updateSupply(user.id, editingSupply.id, supplyData);
      } else {
        result = await SupplyService.createSupply(user.id, supplyData);
      }
      
      if (result.success) {
        setSuccessMessage(editingSupply ? 'Insumo atualizado com sucesso!' : 'Insumo cadastrado com sucesso!');
        
        // Limpar formulário
        setFormData({
          name: '',
          unit: '',
          currentStock: '',
          minStockLevel: '',
          maxStockLevel: '',
          expiryDate: '',
          description: ''
        });
        
        setShowForm(false);
        setEditingSupply(null);
        
        // Recarregar lista de insumos
        await fetchSupplies();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ general: result.error || 'Erro ao salvar insumo. Tente novamente.' });
      }
      
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
      setErrors({ general: 'Erro interno do sistema. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStockMovementSubmit = async (supplyId: string) => {
    if (!stockMovement.quantity.trim() || !stockMovement.reason.trim()) {
      return;
    }

    const quantity = parseFloat(stockMovement.quantity.replace(',', '.'));
    if (isNaN(quantity) || quantity <= 0) {
      return;
    }

    try {
      const supply = supplies.find(s => s.id === supplyId);
      if (!supply) return;

      const newStock = stockMovement.type === 'entrada' 
        ? supply.current_stock + quantity 
        : supply.current_stock - quantity;

      if (newStock < 0) {
        setErrors({ stockMovement: 'Quantidade de saída maior que o estoque disponível' });
        return;
      }

      const result = await SupplyService.updateSupply(user!.id, supplyId, {
        currentStock: newStock
      });

      if (result.success) {
        setSuccessMessage(`${stockMovement.type === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
        setShowStockMovement(null);
        setStockMovement({ type: 'entrada', quantity: '', reason: '' });
        await fetchSupplies();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
    }
  };

  const handleEdit = (supply: Supply) => {
    setEditingSupply(supply);
    setFormData({
      name: supply.name,
      unit: supply.unit,
      currentStock: supply.current_stock.toString(),
      minStockLevel: supply.min_stock_level.toString(),
      maxStockLevel: supply.max_stock_level.toString(),
      expiryDate: supply.expiry_date || '',
      description: supply.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (supplyId: string) => {
    if (!confirm('Tem certeza que deseja excluir este insumo?')) {
      return;
    }

    try {
      const result = await SupplyService.deleteSupply(user!.id, supplyId);
      if (result.success) {
        setSuccessMessage('Insumo excluído com sucesso!');
        await fetchSupplies();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Erro ao excluir insumo:', error);
    }
  };

  const getStockStatus = (supply: Supply) => {
    if (supply.current_stock <= supply.min_stock_level) {
      return { status: 'low', color: 'text-red-600', bg: 'bg-red-50', label: 'Estoque Baixo' };
    } else if (supply.current_stock >= supply.max_stock_level) {
      return { status: 'high', color: 'text-orange-600', bg: 'bg-orange-50', label: 'Estoque Alto' };
    } else {
      return { status: 'normal', color: 'text-green-600', bg: 'bg-green-50', label: 'Estoque Normal' };
    }
  };

  const isNearExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= today;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Backdrop overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-3 lg:p-4 rounded-full">
                    <Package className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-blue-800">Adicionar Insumo</h1>
                    <p className="text-blue-600 text-sm lg:text-base">Gerencie o estoque de insumos da sua propriedade</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingSupply(null);
                    setFormData({
                      name: '',
                      unit: '',
                      currentStock: '',
                      minStockLevel: '',
                      maxStockLevel: '',
                      expiryDate: '',
                      description: ''
                    });
                  }}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Insumo
                </button>
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
            </div>

            {/* Formulário de Cadastro/Edição */}
            {showForm && (
              <div className="bg-white rounded-xl shadow-lg p-4 lg:p-8 border border-blue-100 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl lg:text-2xl font-bold text-blue-800">
                    {editingSupply ? 'Editar Insumo' : 'Cadastrar Novo Insumo'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingSupply(null);
                      setErrors({});
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <EyeOff className="h-5 w-5" />
                  </button>
                </div>

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
                          placeholder="Ex: Fertilizante NPK"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Unidade de Medida */}
                    <div className="space-y-2">
                      <label htmlFor="unit" className="block text-sm font-medium text-blue-700">
                        Unidade de Medida *
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
                          {units.map((unit) => (
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
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
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

                  {/* Data de Vencimento */}
                  <div className="space-y-2">
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-blue-700">
                      Data de Vencimento (Opcional)
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
                        min={new Date().toISOString().split('T')[0]}
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
                      Descrição (Opcional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={loading}
                        rows={3}
                        maxLength={500}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none ${
                          errors.description ? 'border-red-300' : 'border-blue-200'
                        }`}
                        placeholder="Informações adicionais sobre o insumo"
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      {formData.description.length}/500
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-blue-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingSupply(null);
                        setErrors({});
                      }}
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
                          {editingSupply ? 'Atualizar Insumo' : 'Salvar Insumo'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de Insumos */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-100">
              <div className="p-4 lg:p-6 border-b border-blue-100">
                <h2 className="text-xl lg:text-2xl font-bold text-blue-800">Insumos Cadastrados</h2>
                <p className="text-blue-600 text-sm lg:text-base">Gerencie seus insumos e controle o estoque</p>
              </div>

              <div className="p-4 lg:p-6">
                {loadingSupplies ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                    <span className="text-blue-600 font-medium">Carregando insumos...</span>
                  </div>
                ) : supplies.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum insumo cadastrado</h3>
                    <p className="text-gray-500 mb-4">
                      Comece cadastrando seus primeiros insumos para controlar o estoque.
                    </p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Cadastrar Primeiro Insumo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {supplies.map((supply) => {
                      const stockStatus = getStockStatus(supply);
                      const nearExpiry = isNearExpiry(supply.expiry_date);
                      
                      return (
                        <div key={supply.id} className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
                                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
                                  {supply.name}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                                    {stockStatus.label}
                                  </span>
                                  {nearExpiry && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                                      Vence em Breve
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Estoque Atual</p>
                                  <p className="font-medium text-gray-800">
                                    {supply.current_stock} {supply.unit}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Mín/Máx</p>
                                  <p className="font-medium text-gray-800">
                                    {supply.min_stock_level}/{supply.max_stock_level} {supply.unit}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Vencimento</p>
                                  <p className="font-medium text-gray-800">
                                    {supply.expiry_date ? formatDate(supply.expiry_date) : 'Não informado'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Unidade</p>
                                  <p className="font-medium text-gray-800">{supply.unit}</p>
                                </div>
                              </div>
                              
                              {supply.description && (
                                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                                  {supply.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-4">
                              <button
                                onClick={() => setShowStockMovement(showStockMovement === supply.id ? null : supply.id)}
                                className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                              >
                                <Package className="h-4 w-4 mr-1" />
                                Movimentar
                              </button>
                              <button
                                onClick={() => handleEdit(supply)}
                                className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                              >
                                <Edit3 className="h-4 w-4 mr-1" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(supply.id)}
                                className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </button>
                            </div>
                          </div>
                          
                          {/* Formulário de Movimentação de Estoque */}
                          {showStockMovement === supply.id && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <h4 className="text-lg font-semibold text-gray-800 mb-4">Movimentar Estoque</h4>
                              
                              {errors.stockMovement && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                  <p className="text-sm text-red-600">{errors.stockMovement}</p>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Movimentação
                                  </label>
                                  <select
                                    name="type"
                                    value={stockMovement.type}
                                    onChange={handleStockMovementChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="entrada">Entrada</option>
                                    <option value="saida">Saída</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantidade
                                  </label>
                                  <input
                                    type="text"
                                    name="quantity"
                                    value={stockMovement.quantity}
                                    onChange={handleStockMovementChange}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo
                                  </label>
                                  <input
                                    type="text"
                                    name="reason"
                                    value={stockMovement.reason}
                                    onChange={handleStockMovementChange}
                                    placeholder="Ex: Compra, Uso na plantação"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
                                <button
                                  onClick={() => {
                                    setShowStockMovement(null);
                                    setStockMovement({ type: 'entrada', quantity: '', reason: '' });
                                    setErrors({});
                                  }}
                                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => handleStockMovementSubmit(supply.id)}
                                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                  Confirmar {stockMovement.type === 'entrada' ? 'Entrada' : 'Saída'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Dicas */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 lg:p-6 mt-8">
              <h3 className="text-lg lg:text-xl font-semibold text-green-800 mb-3">💡 Dicas para Gestão de Insumos</h3>
              <ul className="space-y-2 text-sm lg:text-base text-green-700">
                <li>• <strong>Controle de estoque:</strong> Mantenha sempre os níveis mínimo e máximo atualizados</li>
                <li>• <strong>Vencimentos:</strong> Cadastre datas de vencimento para evitar perdas</li>
                <li>• <strong>Movimentações:</strong> Registre entradas e saídas para controle preciso</li>
                <li>• <strong>Unidades:</strong> Use unidades padronizadas para facilitar o controle</li>
                <li>• <strong>Descrições:</strong> Adicione informações importantes como marca, fornecedor, etc.</li>
                <li>• <strong>Alertas:</strong> Fique atento aos alertas de estoque baixo e vencimento próximo</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}