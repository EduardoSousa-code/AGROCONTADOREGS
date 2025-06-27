import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  farmName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, farmName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (userId: string, fullName: string, farmName: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Chaves para localStorage
const USER_STORAGE_KEY = 'agrocontador_user';

// Usuário com acesso ilimitado
const UNLIMITED_USER = {
  email: 'oeduardotrafego@gmail.com',
  password: 'Levi@2019',
  profile: {
    id: 'unlimited-user-id',
    name: 'Eduardo Tráfego',
    email: 'oeduardotrafego@gmail.com',
    farmName: 'Fazenda Premium'
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Função para salvar usuário no localStorage
  const saveUserToStorage = (userProfile: User) => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
      console.log('💾 Dados do usuário salvos no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar dados no localStorage:', error);
    }
  };

  // Função para carregar usuário do localStorage
  const loadUserFromStorage = (): User | null => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const userProfile = JSON.parse(storedUser);
        console.log('📱 Dados do usuário carregados do localStorage:', userProfile);
        return userProfile;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do localStorage:', error);
      // Limpar dados corrompidos
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    return null;
  };

  // Função para remover usuário do localStorage
  const removeUserFromStorage = () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log('🗑️ Dados do usuário removidos do localStorage');
    } catch (error) {
      console.error('❌ Erro ao remover dados do localStorage:', error);
    }
  };

  // Função para verificar se é o usuário ilimitado
  const isUnlimitedUser = (email: string, password: string): boolean => {
    return email.toLowerCase() === UNLIMITED_USER.email.toLowerCase() && 
           password === UNLIMITED_USER.password;
  };

  // Função para buscar dados do perfil do usuário
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    console.log('🔍 Buscando perfil do usuário...', {
      userId: supabaseUser.id,
      email: supabaseUser.email,
      timestamp: new Date().toISOString()
    });
    
    try {
      console.log('📡 Iniciando consulta ao Supabase para buscar perfil...');
      console.log('🔑 Dados do usuário Supabase:', {
        id: supabaseUser.id,
        email: supabaseUser.email,
        created_at: supabaseUser.created_at,
        user_metadata: supabaseUser.user_metadata,
        raw_user_meta_data: supabaseUser.raw_user_meta_data
      });

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      console.log('📊 Resposta da consulta Supabase:', {
        profile: profile,
        error: error,
        timestamp: new Date().toISOString()
      });

      if (error) {
        console.error('❌ Erro detalhado ao buscar perfil:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId: supabaseUser.id,
          timestamp: new Date().toISOString()
        });
        
        // Log adicional para erros específicos
        if (error.code === 'PGRST116') {
          console.error('🚫 Erro de Row Level Security - usuário não tem permissão para acessar o perfil');
        } else if (error.code === '42P01') {
          console.error('🗃️ Tabela profiles não existe no banco de dados');
        } else if (error.code === 'PGRST301') {
          console.error('🔍 Múltiplos registros encontrados quando esperado apenas um');
        }
        
        return null;
      }

      if (!profile) {
        console.log('⚠️ Perfil não encontrado para o usuário:', {
          userId: supabaseUser.id,
          email: supabaseUser.email,
          timestamp: new Date().toISOString()
        });
        
        // Verificar se o usuário existe na tabela auth.users
        console.log('🔍 Verificando se usuário existe na tabela auth...');
        
        // Tentar criar perfil automaticamente se não existir
        console.log('🛠️ Tentando criar perfil automaticamente...');
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: supabaseUser.id,
              full_name: supabaseUser.user_metadata?.full_name || supabaseUser.raw_user_meta_data?.full_name || 'Usuário',
              email: supabaseUser.email || '',
              farm_name: supabaseUser.user_metadata?.farm_name || supabaseUser.raw_user_meta_data?.farm_name || 'Minha Propriedade'
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ Erro ao criar perfil automaticamente:', {
              code: createError.code,
              message: createError.message,
              details: createError.details,
              hint: createError.hint,
              timestamp: new Date().toISOString()
            });
            return null;
          }

          if (newProfile) {
            console.log('✅ Perfil criado automaticamente:', newProfile);
            const userProfile = {
              id: newProfile.id,
              name: newProfile.full_name,
              email: newProfile.email,
              farmName: newProfile.farm_name
            };
            return userProfile;
          }
        } catch (createProfileError) {
          console.error('💥 Erro inesperado ao criar perfil automaticamente:', createProfileError);
        }
        
        return null;
      }

      const userProfile = {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        farmName: profile.farm_name
      };

      console.log('👤 Perfil do usuário carregado com sucesso:', {
        profile: userProfile,
        timestamp: new Date().toISOString()
      });
      
      return userProfile;
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar perfil:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        errorStack: error instanceof Error ? error.stack : undefined,
        userId: supabaseUser.id,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  };

  // Função para atualizar perfil do usuário
  const updateUserProfile = async (
    userId: string, 
    fullName: string, 
    farmName: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('📝 Atualizando perfil do usuário:', { userId, fullName, farmName });
    
    try {
      // Verificar se é o usuário ilimitado
      if (userId === UNLIMITED_USER.profile.id) {
        console.log('👑 Atualizando perfil do usuário ilimitado');
        
        // Atualizar dados do usuário ilimitado localmente
        const updatedProfile = {
          ...UNLIMITED_USER.profile,
          name: fullName,
          farmName: farmName
        };
        
        // Atualizar estado e localStorage
        setUser(updatedProfile);
        saveUserToStorage(updatedProfile);
        
        return { success: true };
      }

      // Para usuários normais, atualizar no Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          farm_name: farmName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        return { 
          success: false, 
          error: 'Erro ao salvar alterações. Tente novamente.' 
        };
      }

      if (data) {
        // Atualizar estado local com os dados atualizados
        const updatedUser = {
          id: data.id,
          name: data.full_name,
          email: data.email,
          farmName: data.farm_name
        };

        console.log('✅ Perfil atualizado com sucesso:', updatedUser);
        
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
        
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido ao atualizar perfil' };
    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar perfil:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  };

  // Função de login
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🚀 Iniciando login para:', email);
    setLoading(true);
    
    try {
      // Verificar se é o usuário ilimitado
      if (isUnlimitedUser(email, password)) {
        console.log('👑 Usuário ilimitado detectado - acesso garantido');
        const userProfile = UNLIMITED_USER.profile;
        
        setUser(userProfile);
        setIsAuthenticated(true);
        saveUserToStorage(userProfile);
        
        return { success: true };
      }

      // Processo normal de login para outros usuários
      console.log('🔐 Iniciando autenticação com Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('📡 Resposta da autenticação Supabase:', {
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
        session: data.session ? 'Sessão ativa' : 'Sem sessão',
        error: error,
        timestamp: new Date().toISOString()
      });

      if (error) {
        console.error('❌ Erro na autenticação:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
        } else if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Por favor, confirme seu e-mail antes de fazer login.' };
        } else if (error.message.includes('Too many requests')) {
          return { success: false, error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' };
        } else {
          return { success: false, error: `Erro de autenticação: ${error.message}` };
        }
      }

      if (!data.user) {
        console.error('❌ Usuário não encontrado após autenticação');
        return { success: false, error: 'Erro interno: usuário não encontrado após autenticação.' };
      }

      console.log('✅ Autenticação Supabase bem-sucedida, buscando perfil...');
      
      // Buscar perfil do usuário
      const userProfile = await fetchUserProfile(data.user);
      
      if (userProfile) {
        console.log('✅ Login realizado com sucesso');
        setUser(userProfile);
        setIsAuthenticated(true);
        
        // Salvar no localStorage
        saveUserToStorage(userProfile);
        
        return { success: true };
      } else {
        console.error('❌ Falha ao carregar perfil do usuário');
        // Se não encontrou o perfil, fazer logout do Supabase
        await supabase.auth.signOut();
        return { success: false, error: 'Erro ao carregar dados do perfil. Tente novamente.' };
      }

    } catch (error) {
      console.error('💥 Erro inesperado durante o login:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente em alguns instantes.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Função de registro
  const register = async (
    email: string, 
    password: string, 
    fullName: string, 
    farmName: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('📝 Iniciando registro para:', email, { fullName, farmName });
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            farm_name: farmName
          }
        }
      });

      if (error) {
        // Only log unexpected errors to console, not expected ones like "User already registered"
        const expectedErrors = [
          'User already registered',
          'Password should be at least',
          'Invalid email'
        ];
        
        const isExpectedError = expectedErrors.some(expectedError => 
          error.message.includes(expectedError)
        );
        
        if (!isExpectedError) {
          console.error('❌ Erro no registro:', error);
        }
        
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'Este e-mail já está cadastrado. Tente fazer login.' };
        } else if (error.message.includes('Password should be at least')) {
          return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' };
        } else if (error.message.includes('Invalid email')) {
          return { success: false, error: 'E-mail inválido. Verifique o formato.' };
        } else {
          return { success: false, error: `Erro no cadastro: ${error.message}` };
        }
      }

      if (data.user) {
        console.log('✅ Usuário registrado com sucesso');
        
        // Se o usuário foi criado mas precisa confirmar email
        if (!data.session) {
          return { 
            success: true, 
            error: 'Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de fazer login.' 
          };
        }
        
        // Se já tem sessão ativa, buscar perfil
        const userProfile = await fetchUserProfile(data.user);
        if (userProfile) {
          setUser(userProfile);
          setIsAuthenticated(true);
          saveUserToStorage(userProfile);
        }
        
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido no registro' };
    } catch (error) {
      console.error('💥 Erro inesperado no registro:', error);
      return { success: false, error: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async (): Promise<void> => {
    console.log('👋 Realizando logout...');
    try {
      // Remover do localStorage primeiro
      removeUserFromStorage();
      
      // Se for o usuário ilimitado, apenas limpar estado local
      if (user?.email === UNLIMITED_USER.email) {
        console.log('👑 Logout do usuário ilimitado');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro no logout do Supabase, limpar estado local
      setIsAuthenticated(false);
      setUser(null);
      removeUserFromStorage();
    }
  };

  // Função de recuperação de senha
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('❌ Erro ao enviar email de recuperação:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('💥 Erro inesperado ao enviar email de recuperação:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  // Verificar sessão existente e escutar mudanças
  useEffect(() => {
    console.log('🔄 Verificando sessão existente...');
    
    // Verificar se há uma sessão ativa
    const checkSession = async () => {
      // Primeiro, tentar carregar do localStorage para experiência imediata
      const storedUser = loadUserFromStorage();
      if (storedUser) {
        console.log('⚡ Carregando usuário do localStorage para experiência imediata');
        
        // Se for o usuário ilimitado, sempre manter logado
        if (storedUser.email === UNLIMITED_USER.email) {
          console.log('👑 Usuário ilimitado - mantendo sempre logado');
          setUser(storedUser);
          setIsAuthenticated(true);
          return;
        }
        
        setUser(storedUser);
        setIsAuthenticated(true);
      }

      // Verificar sessão no Supabase (apenas para usuários normais)
      try {
        console.log('🔍 Verificando sessão ativa no Supabase...');
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('📊 Resultado da verificação de sessão:', {
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          timestamp: new Date().toISOString()
        });
        
        if (session?.user) {
          console.log('✅ Sessão ativa encontrada no Supabase');
          const userProfile = await fetchUserProfile(session.user);
          if (userProfile) {
            setUser(userProfile);
            setIsAuthenticated(true);
            // Atualizar localStorage com dados mais recentes
            saveUserToStorage(userProfile);
          } else {
            console.log('❌ Falha ao carregar perfil, fazendo logout...');
            // Se não conseguiu carregar o perfil, fazer logout
            await supabase.auth.signOut();
            setUser(null);
            setIsAuthenticated(false);
            removeUserFromStorage();
          }
        } else {
          console.log('ℹ️ Nenhuma sessão ativa encontrada no Supabase');
          // Se não há sessão válida no Supabase, limpar localStorage (exceto usuário ilimitado)
          if (storedUser && storedUser.email !== UNLIMITED_USER.email) {
            console.log('🧹 Limpando dados expirados do localStorage');
            removeUserFromStorage();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', {
          error: error,
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        });
        
        // Clear local authentication state when Supabase reports session issues
        console.log('🧹 Limpando estado local devido a erro de sessão');
        setUser(null);
        setIsAuthenticated(false);
        
        // Only remove from storage if it's not the unlimited user
        const storedUser = loadUserFromStorage();
        if (storedUser && storedUser.email !== UNLIMITED_USER.email) {
          removeUserFromStorage();
        }
      }
    };

    checkSession();

    // Escutar mudanças de autenticação (apenas para usuários normais)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Estado de autenticação mudou:', {
          event: event,
          hasSession: !!session,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
        
        // Não processar mudanças para o usuário ilimitado
        if (user?.email === UNLIMITED_USER.email) {
          console.log('👑 Ignorando mudanças de auth para usuário ilimitado');
          return;
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Usuário logado via auth state change');
          const userProfile = await fetchUserProfile(session.user);
          if (userProfile) {
            setUser(userProfile);
            setIsAuthenticated(true);
            // Salvar no localStorage
            saveUserToStorage(userProfile);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Usuário deslogado via auth state change');
          setUser(null);
          setIsAuthenticated(false);
          // Remover do localStorage
          removeUserFromStorage();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}