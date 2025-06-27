import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  MapPin,
  Calendar,
  Shield,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    farmName: user?.farmName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateProfileForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.farmName.trim()) {
      newErrors.farmName = 'Nome da propriedade é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;
    if (!user) return;

    setLoading(true);
    setErrors({});
    
    try {
      const result = await updateUserProfile(
        user.id,
        formData.fullName.trim(),
        formData.farmName.trim()
      );
      
      if (result.success) {
        setSuccessMessage('Perfil atualizado com sucesso!');
        setIsEditing(false);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ general: result.error || 'Erro ao atualizar perfil. Tente novamente.' });
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setErrors({ general: 'Erro interno. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      // Aqui você implementaria a mudança de senha no Supabase
      // Por enquanto, simularemos o sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Senha alterada com sucesso!');
      setIsChangingPassword(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ general: 'Erro ao alterar senha. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setFormData({
      fullName: user?.name || '',
      farmName: user?.farmName || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-green-600 hover:text-green-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar ao Dashboard
        </button>

        <div className="space-y-8">
          {/* Cabeçalho do Perfil */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-600 p-4 rounded-full">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-800">Meu Perfil</h1>
                  <p className="text-green-600">Gerencie suas informações pessoais</p>
                </div>
              </div>
              
              {!isEditing && !isChangingPassword && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar Perfil
                </button>
              )}
            </div>

            {/* Mensagem de Sucesso */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-600 font-medium">{successMessage}</p>
              </div>
            )}

            {/* Mensagem de Erro */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Informações do Perfil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome Completo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-green-700">
                  Nome Completo
                </label>
                {isEditing ? (
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.fullName ? 'border-red-300' : 'border-green-200'
                        }`}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <User className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">{user.name}</span>
                  </div>
                )}
              </div>

              {/* E-mail */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-green-700">
                  E-mail
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{user.email}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Não editável
                  </span>
                </div>
              </div>

              {/* Nome da Propriedade */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-green-700">
                  Nome da Propriedade
                </label>
                {isEditing ? (
                  <div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                      <input
                        type="text"
                        name="farmName"
                        value={formData.farmName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.farmName ? 'border-red-300' : 'border-green-200'
                        }`}
                        placeholder="Nome da sua propriedade"
                      />
                    </div>
                    {errors.farmName && (
                      <p className="text-sm text-red-600 mt-1">{errors.farmName}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">{user.farmName}</span>
                  </div>
                )}
              </div>

              {/* Data de Cadastro */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-green-700">
                  Membro desde
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Janeiro 2024</span>
                </div>
              </div>
            </div>

            {/* Botões de Ação - Edição de Perfil */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-green-100">
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            )}
          </div>

          {/* Seção de Segurança */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-600 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-800">Segurança</h2>
                  <p className="text-green-600">Altere sua senha de acesso</p>
                </div>
              </div>
              
              {!isChangingPassword && !isEditing && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar Senha
                </button>
              )}
            </div>

            {isChangingPassword && (
              <div className="space-y-6">
                {/* Senha Atual */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.currentPassword ? 'border-red-300' : 'border-green-200'
                      }`}
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-3"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-green-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-green-500" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-sm text-red-600 mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                {/* Nova Senha */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.newPassword ? 'border-red-300' : 'border-green-200'
                      }`}
                      placeholder="Digite sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-green-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-green-500" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-green-200'
                      }`}
                      placeholder="Confirme sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-green-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-green-500" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Botões de Ação - Mudança de Senha */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-green-100">
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-orange-400"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </div>
              </div>
            )}

            {!isChangingPassword && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-700">
                  <strong>Dica de Segurança:</strong> Use uma senha forte com pelo menos 8 caracteres, 
                  incluindo letras maiúsculas, minúsculas, números e símbolos.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}