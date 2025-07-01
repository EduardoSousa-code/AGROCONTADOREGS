import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Minus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Calendar,
  BarChart3,
  Search,
  Filter,
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

export default function SupplyStock() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low-stock' | 'near-expiry'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [movementSupply, setMovementSupply] = useState<Supply | null>(null);
  
  const [formData, setFormData] = useState<SupplyFormData>({
    name: '',
    unit: '',
    currentStock: '',
    minStockLevel: '',
    maxStockLevel: '',
    expiryDate: '',
    description: ''
  });

  const [movementData, setMovementData] = useState<StockMovement>({
    type: 'entrada',
    quantity: '',
    reason: ''
  });

  // Unidades de medida comuns
  const units = [
    'kg', 'g', 'ton', 'L', 'mL', 'un', 'cx', 'sc', 'pct', 'm', 'cm', 'ha'
  ];

  // Buscar insumos
  const fetchSupplies = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await SupplyService.getUserSupplies(user.id);
      
      if (result.success && result.data) {
        setSupplies(result.data);
      } else {
        setError(result.error || 'Erro ao carregar insumos');
      }
    } catch (error) {
      console.error('Erro ao buscar insumos:', error);
      setError('Erro interno do sistema');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar insumos
  const getFilteredSupplies = () => {
    let filtered = supplies;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(supply =>
        supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supply.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (filterType === 'low-stock') {
      filtered = filtered.filter(supply => supply.current_stock <= supply.min_stock_level);
    } else if (filterType === 'near-expiry') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      filtered = filtered.filter(supply => {
        if (!supply.expiry_date) return false;
        const expiryDate = new Date(supply.expiry_date);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
      });
    }

    return filtered;
  };

  // Validar formulário
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.unit) {
      errors.unit = 'Unidade é obrigatória';
    }

    if (!formData.currentStock.trim()) {
      errors.currentStock = 'Estoque atual é obrigatório';
    } else {
      const stock = parseFloat(formData.currentStock);
      if (isNaN(stock) || stock < 0) {
        errors.currentStock = 'Estoque deve ser um número positivo';
      }
    }

    if (!formData.minStockLevel.trim()) {
      errors.minStockLevel = 'Nível mínimo é obrigatório';
    } else {
      const minLevel = parseFloat(formData.minStockLevel);
      if (isNaN(minLevel) || minLevel < 0) {
        errors.minStockLevel = 'Nível mínimo deve ser um número positivo';
      }
    }

    if (!formData.maxStockLevel.trim()) {
      errors.maxStockLevel = 'Nível máximo é obrigatório';
    } else {
      const maxLevel = parseFloat(formData.maxStockLevel);
      const minLevel = parseFloat(formData.minStockLevel);
      if (isNaN(maxLevel) || maxLevel < 0) {
        errors.maxStockLevel = 'Nível máximo deve ser um número positivo';
      } else if (!isNaN(minLevel) && maxLevel < minLevel) {
        errors.maxStockLevel = 'Nível máximo deve ser maior que o mínimo';
      }
    }

    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        errors.expiryDate = 'Data de vencimento não pode ser no passado';
      }
    }

    return errors;
  };

  // Salvar insumo
  const handleSaveSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      return;
    }

    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      const supplyData = {
        name: formData.name.trim(),
        unit: formData.unit,
        currentStock: parseFloat(formData.currentStock),
        minStockLevel: parseFloat(formData.minStockLevel),
        maxStockLevel: parseFloat(formData.maxStockLevel),
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
        setShowForm(false);
        setEditingSupply(null);
        resetForm();
        await fetchSupplies();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.error || 'Erro ao salvar insumo');
      }
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
      setError('Erro interno do sistema');
    } finally {
      setSaving(false);
    }
  };

  // Processar movimentação de estoque
  const handleStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movementSupply || !user) return;

    const quantity = parseFloat(movementData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      setError('Quantidade deve ser um número positivo');
      return;
    }

    if (!movementData.reason.trim()) {
      setError('Motivo é obrigatório');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      let newStock = movementSupply.current_stock;
      
      if (movementData.type === 'entrada') {
        newStock += quantity;
      } else {
        newStock -= quantity;
        if (newStock < 0) {
          setError('Estoque não pode ficar negativo');
          setSaving(false);
          return;
        }
      }

      const result = await SupplyService.updateSupply(user.id, movementSupply.id, {
        currentStock: newStock
      });
      
      if (result.success) {
        setSuccessMessage(`${movementData.type === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
        setMovementSupply(null);
        setMovementData({ type: 'entrada', quantity: '', reason: '' });
        await fetchSupplies();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.error || 'Erro ao registrar movimentação');
      }
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      setError('Erro interno do sistema');
    } finally {
      setSaving(false);
    }
  };

  // Deletar insumo
  const handleDeleteSupply = async (supply: Supply) => {
    if (!user) return;
    
    if (!confirm(`Tem certeza que deseja excluir o insumo "${supply.name}"?`)) {
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      const result = await SupplyService.deleteSupply(user.id, supply.id);
      
      if (result.success) {
        setSuccessMessage('Insumo excluído com sucesso!');
        await fetchSupplies();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.error || 'Erro ao excluir insumo');
      }
    } catch (error) {
      console.error('Erro ao excluir insumo:', error);
      setError('Erro interno do sistema');
    } finally {
      setSaving(false);
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      unit: '',
      currentStock: '',
      minStockLevel: '',
      maxStockLevel: '',
      expiryDate: '',
      description: ''
    });
  };

  // Editar insumo
  const handleEditSupply = (supply: Supply) => {
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

  // Cancelar edição
  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingSupply(null);
    resetForm();
    setError('');
  };

  // Obter status do estoque
  const getStockStatus = (supply: Supply) => {
    if (supply.current_stock <= supply.min_stock_level) {
      return { status: 'low', color: 'text-red-600', bg: 'bg-red-50', label: 'Estoque Baixo' };
    } else if (supply.current_stock >= supply.max_stock_level) {
      return { status: 'high', color: 'text-orange-600', bg: 'bg-orange-50', label: 'Estoque Alto' };
    } else {
      return { status: 'normal', color: 'text-green-600', bg: 'bg-green-50', label: 'Normal' };
    }
  };

  // Verificar se está próximo do vencimento
  const isNearExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return expiry <= thirtyDaysFromNow && expiry >= new Date();
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Carregar dados ao montar
  useEffect(() => {
    fetchSupplies();
  }, [user]);

  const filteredSupplies = getFilteredSupplies();

  if (!user) {
    return <div>Carregando...</div>;
  }

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-3 lg:p-4 rounded-full">
                    <Package className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-blue-800">Estoque Insumo</h1>
                    <p className="text-blue-600 text-sm lg:text-base">Gerencie o estoque de insumos da sua propriedade</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowForm(true)}
                  disabled={saving}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Insumo
                </button>
              </div>

              {/* Mensagens */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-600 font-medium">{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Filtros e Busca */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                  <input
                    type="text"
                    placeholder="Buscar insumos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos os insumos</option>
                    <option value="low-stock">Estoque baixo</option>
                    <option value="near-expiry">Próximo ao vencimento</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-center">
                  <span className="text-sm text-blue-600 font-medium">
                    {filteredSupplies.length} insumo(s) encontrado(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Lista de Insumos */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-blue-600 font-medium">Carregando insumos...</p>
              </div>
            ) : filteredSupplies.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSupplies.map((supply) => {
                  const stockStatus = getStockStatus(supply);
                  const nearExpiry = isNearExpiry(supply.expiry_date);
                  
                  return (
                    <div key={supply.id} className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                      <div className="p-6">
                        {/* Cabeçalho do Card */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-blue-800 truncate">{supply.name}</h3>
                            <p className="text-sm text-blue-600">{supply.unit}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditSupply(supply)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupply(supply)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Status do Estoque */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${stockStatus.bg} ${stockStatus.color}`}>
                          <BarChart3 className="h-3 w-3 mr-1" />
                          {stockStatus.label}
                        </div>

                        {/* Informações do Estoque */}
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Estoque Atual:</span>
                            <span className="font-semibold text-blue-800">{supply.current_stock} {supply.unit}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Mínimo:</span>
                            <span className="text-sm text-gray-800">{supply.min_stock_level} {supply.unit}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Máximo:</span>
                            <span className="text-sm text-gray-800">{supply.max_stock_level} {supply.unit}</span>
                          </div>

                          {supply.expiry_date && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Vencimento:</span>
                              <span className={`text-sm font-medium ${nearExpiry ? 'text-orange-600' : 'text-gray-800'}`}>
                                {formatDate(supply.expiry_date)}
                                {nearExpiry && (
                                  <AlertTriangle className="h-3 w-3 inline ml-1" />
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Barra de Progresso do Estoque */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Min</span>
                            <span>Max</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                supply.current_stock <= supply.min_stock_level
                                  ? 'bg-red-500'
                                  : supply.current_stock >= supply.max_stock_level
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  (supply.current_stock / supply.max_stock_level) * 100,
                                  100
                                )}%`
                              }}
                            />
                          </div>
                        </div>

                        {/* Descrição */}
                        {supply.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{supply.description}</p>
                        )}

                        {/* Botões de Movimentação */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setMovementSupply(supply);
                              setMovementData({ type: 'entrada', quantity: '', reason: '' });
                            }}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Entrada
                          </button>
                          <button
                            onClick={() => {
                              setMovementSupply(supply);
                              setMovementData({ type: 'saida', quantity: '', reason: '' });
                            }}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Saída
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm || filterType !== 'all' ? 'Nenhum insumo encontrado' : 'Nenhum insumo cadastrado'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Comece cadastrando seus primeiros insumos.'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Cadastrar Primeiro Insumo
                  </button>
                )}
              </div>
            )}

            {/* Modal de Formulário */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-blue-800">
                        {editingSupply ? 'Editar Insumo' : 'Novo Insumo'}
                      </h2>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveSupply} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nome */}
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Nome do Insumo *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Fertilizante NPK"
                            required
                          />
                        </div>

                        {/* Unidade */}
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Unidade de Medida *
                          </label>
                          <select
                            value={formData.unit}
                            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                            className="w-full px-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Selecione uma unidade</option>
                            {units.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>

                        {/* Estoque Atual */}
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Estoque Atual *
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={formData.currentStock}
                            onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                            className="w-full px-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            required
                          />
                        </div>

                        {/* Nível Mínimo */}
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Nível Mínimo *
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={formData.minStockLevel}
                            onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: e.target.value }))}
                            className="w-full px-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            required
                          />
                        </div>

                        {/* Nível Máximo */}
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Nível Máximo *
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={formData.maxStockLevel}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxStockLevel: e.target.value }))}
                            className="w-full px-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            required
                          />
                        </div>

                        {/* Data de Vencimento */}
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Data de Vencimento
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                            <input
                              type="date"
                              value={formData.expiryDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Descrição */}
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Informações adicionais sobre o insumo..."
                        />
                      </div>

                      {/* Botões */}
                      <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-blue-100">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 font-medium"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5 mr-2" />
                              {editingSupply ? 'Atualizar' : 'Cadastrar'}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Movimentação */}
            {movementSupply && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-blue-800">
                        {movementData.type === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}
                      </h2>
                      <button
                        onClick={() => setMovementSupply(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-800">{movementSupply.name}</h3>
                      <p className="text-sm text-blue-600">
                        Estoque atual: {movementSupply.current_stock} {movementSupply.unit}
                      </p>
                    </div>

                    <form onSubmit={handleStockMovement} className="space-y-4">
                      {/* Tipo de Movimentação */}
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Tipo de Movimentação
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="entrada"
                              checked={movementData.type === 'entrada'}
                              onChange={(e) => setMovementData(prev => ({ ...prev, type: e.target.value as any }))}
                              className="mr-2"
                            />
                            <span className="text-green-600 font-medium">Entrada</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="saida"
                              checked={movementData.type === 'saida'}
                              onChange={(e) => setMovementData(prev => ({ ...prev, type: e.target.value as any }))}
                              className="mr-2"
                            />
                            <span className="text-red-600 font-medium">Saída</span>
                          </label>
                        </div>
                      </div>

                      {/* Quantidade */}
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Quantidade ({movementSupply.unit})
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          value={movementData.quantity}
                          onChange={(e) => setMovementData(prev => ({ ...prev, quantity: e.target.value }))}
                          className="w-full px-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          required
                        />
                      </div>

                      {/* Motivo */}
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Motivo
                        </label>
                        <input
                          type="text"
                          value={movementData.reason}
                          onChange={(e) => setMovementData(prev => ({ ...prev, reason: e.target.value }))}
                          className="w-full px-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={movementData.type === 'entrada' ? 'Ex: Compra de insumos' : 'Ex: Aplicação na cultura'}
                          required
                        />
                      </div>

                      {/* Botões */}
                      <div className="flex space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setMovementSupply(null)}
                          disabled={saving}
                          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className={`flex-1 flex items-center justify-center px-4 py-3 text-white rounded-lg transition-colors disabled:opacity-50 font-medium ${
                            movementData.type === 'entrada'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          {saving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              {movementData.type === 'entrada' ? (
                                <Plus className="h-5 w-5 mr-2" />
                              ) : (
                                <Minus className="h-5 w-5 mr-2" />
                              )}
                              Confirmar
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}