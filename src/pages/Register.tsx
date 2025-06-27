import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tractor, User, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    farmName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { register, loading } = useAuth();
  const navigate = useNavigate();

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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.farmName.trim()) {
      newErrors.farmName = 'Nome da propriedade é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.farmName
      );

      if (result.success) {
        // Redirecionar para login com mensagem de sucesso
        navigate('/login', { 
          state: { 
            message: 'Cadastro realizado com sucesso! Faça login para continuar.' 
          }
        });
      } else {
        setErrors({ general: result.error || 'Erro ao realizar cadastro. Tente novamente.' });
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setErrors({ general: 'Erro interno. Tente novamente.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="mx-auto bg-green-600 p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
            <Tractor className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-green-800">AgroContador</h1>
          <p className="mt-2 text-sm text-green-600">Crie sua conta e comece a gerenciar sua propriedade</p>
        </div>

        {/* Formulário de Cadastro */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Mensagem de Erro Geral */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Campo Nome Completo */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-green-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-green-500" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.fullName ? 'border-red-300 focus:border-red-500' : 'border-green-200 focus:border-green-500'
                  }`}
                  placeholder="Seu nome completo"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Campo Nome da Propriedade */}
            <div>
              <label htmlFor="farmName" className="block text-sm font-medium text-green-700 mb-2">
                Nome da Propriedade
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <input
                  id="farmName"
                  name="farmName"
                  type="text"
                  required
                  value={formData.farmName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.farmName ? 'border-red-300 focus:border-red-500' : 'border-green-200 focus:border-green-500'
                  }`}
                  placeholder="Ex: Fazenda São José"
                />
              </div>
              {errors.farmName && (
                <p className="mt-1 text-sm text-red-600">{errors.farmName}</p>
              )}
            </div>

            {/* Campo E-mail */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-green-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-green-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.email ? 'border-red-300 focus:border-red-500' : 'border-green-200 focus:border-green-500'
                  }`}
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-green-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-green-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.password ? 'border-red-300 focus:border-red-500' : 'border-green-200 focus:border-green-500'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-green-500 hover:text-green-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-green-500 hover:text-green-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-green-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-green-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-green-200 focus:border-green-500'
                  }`}
                  placeholder="Digite a senha novamente"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-green-500 hover:text-green-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-green-500 hover:text-green-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Botão Cadastrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar'
              )}
            </button>

            {/* Link Voltar ao Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Já tenho uma conta
              </Link>
            </div>
          </form>
        </div>

        {/* Rodapé */}
        <div className="text-center">
          <p className="text-xs text-green-600">
            © 2024 AgroContador - Desenvolvido para o campo brasileiro
          </p>
        </div>
      </div>
    </div>
  );
}