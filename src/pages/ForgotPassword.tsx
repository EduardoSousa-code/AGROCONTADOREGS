import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tractor, Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const { resetPassword, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!email.trim()) {
      setError('E-mail é obrigatório');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('E-mail inválido');
      return;
    }

    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setIsSubmitted(true);
        setError('');
      } else {
        setError(result.error || 'Erro ao enviar e-mail. Tente novamente.');
      }
    } catch (error) {
      setError('Erro interno. Tente novamente.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Logo e Título */}
          <div className="text-center">
            <div className="mx-auto bg-green-600 p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
              <Tractor className="h-10 w-10 text-white" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-green-800">AgroContador</h1>
            <p className="mt-2 text-sm text-green-600">Link enviado com sucesso!</p>
          </div>

          {/* Mensagem de Sucesso */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100">
            <div className="text-center space-y-4">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-xl font-bold text-green-800">E-mail enviado!</h2>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                Enviamos um link de recuperação para <strong>{email}</strong>. 
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-xs text-green-700">
                  <strong>Não recebeu o e-mail?</strong> Verifique sua pasta de spam ou lixo eletrônico.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Login
              </Link>
            </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="mx-auto bg-green-600 p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
            <Tractor className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-green-800">AgroContador</h1>
          <p className="mt-2 text-sm text-green-600">Recupere o acesso à sua conta</p>
        </div>

        {/* Formulário de Recuperação */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-green-800 text-center mb-2">
              Esqueceu sua senha?
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

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
                  value={email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    error ? 'border-red-300 focus:border-red-500' : 'border-green-200 focus:border-green-500'
                  }`}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Botão Enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar link de recuperação
                </>
              )}
            </button>

            {/* Link Voltar ao Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar para login
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