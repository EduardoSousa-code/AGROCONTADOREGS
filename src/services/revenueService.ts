import { supabase, withTimeout } from '../lib/supabase';
import type { RevenueInsert, Revenue } from '../lib/supabase';

export interface CreateRevenueData {
  value: number;
  description: string;
  category: string;
  date: string;
  activityId?: string | null;
}

export interface RevenueServiceResponse {
  success: boolean;
  data?: Revenue;
  error?: string;
}

export interface RevenuesListResponse {
  success: boolean;
  data?: Revenue[];
  error?: string;
}

export class RevenueService {
  /**
   * Criar uma nova receita
   */
  static async createRevenue(
    userId: string, 
    revenueData: CreateRevenueData
  ): Promise<RevenueServiceResponse> {
    // LOG DE DEPURAÇÃO: Verificar userId recebido
    console.log('🔍 DEBUG - User ID recebido por createRevenue:', userId);
    console.log('🔍 DEBUG - Dados da receita recebidos:', revenueData);
    console.log('💰 Criando nova receita:', { userId, ...revenueData });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating revenue creation');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const insertData: RevenueInsert = {
        user_id: userId,
        value: revenueData.value,
        description: revenueData.description.trim(),
        category: revenueData.category,
        date: revenueData.date,
        activity_id: revenueData.activityId || null
      };

      console.log('🔍 DEBUG - Dados que serão inseridos no Supabase:', insertData);

      const insertQuery = supabase
        .from('revenues')
        .insert(insertData)
        .select()
        .single();

      const { data, error } = await withTimeout(insertQuery);

      console.log('🔍 DEBUG - Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro ao criar receita:', error);
        console.error('🔍 DEBUG - Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'Erro de permissão. Verifique se você está logado.' 
          };
        }
        
        if (error.message.includes('check constraint')) {
          return { 
            success: false, 
            error: 'Valor deve ser maior que zero.' 
          };
        }
        
        return { 
          success: false, 
          error: 'Erro ao salvar receita. Tente novamente.' 
        };
      }

      if (!data) {
        console.error('🔍 DEBUG - Dados não retornados após inserção');
        return { 
          success: false, 
          error: 'Erro interno: dados não retornados após inserção.' 
        };
      }

      console.log('✅ Receita criada com sucesso:', data);
      return { success: true, data };

    } catch (error) {
      console.error('💥 Erro inesperado ao criar receita:', error);
      console.error('🔍 DEBUG - Stack trace do erro:', error);
      
      if (error instanceof Error && error.message.includes('expirou')) {
        return { 
          success: false, 
          error: 'Operação demorou muito para responder. Verifique sua conexão e tente novamente.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  };

  /**
   * Buscar receitas do usuário
   */
  static async getUserRevenues(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<RevenuesListResponse> {
    console.log('📊 Buscando receitas do usuário:', userId);
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty revenues');
      return { success: true, data: [] };
    }
    
    try {
      let query = supabase
        .from('revenues')
        .select('*, activities(name)')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error } = await withTimeout(query);

      if (error) {
        console.error('❌ Erro ao buscar receitas:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar receitas. Tente novamente.' 
        };
      }

      console.log(`✅ ${data?.length || 0} receitas encontradas`);
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar receitas:', error);
      
      if (error instanceof Error && error.message.includes('expirou')) {
        return { 
          success: false, 
          error: 'Operação demorou muito para responder. Verifique sua conexão e tente novamente.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  };

  /**
   * Buscar receitas por período
   */
  static async getRevenuesByPeriod(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<RevenuesListResponse> {
    console.log('📅 Buscando receitas por período:', { userId, startDate, endDate });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty revenues for period');
      return { success: true, data: [] };
    }
    
    try {
      const query = supabase
        .from('revenues')
        .select('*, activities(name)')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      const { data, error } = await withTimeout(query);

      if (error) {
        console.error('❌ Erro ao buscar receitas por período:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar receitas do período. Tente novamente.' 
        };
      }

      console.log(`✅ ${data?.length || 0} receitas encontradas no período`);
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar receitas por período:', error);
      
      if (error instanceof Error && error.message.includes('expirou')) {
        return { 
          success: false, 
          error: 'Operação demorou muito para responder. Verifique sua conexão e tente novamente.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  };

  /**
   * Calcular total de receitas por período
   */
  static async getTotalRevenueByPeriod(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; total?: number; error?: string }> {
    try {
      const result = await this.getRevenuesByPeriod(userId, startDate, endDate);
      
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const total = result.data.reduce((sum, revenue) => sum + revenue.value, 0);
      
      return { success: true, total };

    } catch (error) {
      console.error('💥 Erro ao calcular total de receitas:', error);
      return { 
        success: false, 
        error: 'Erro ao calcular total de receitas.' 
      };
    }
  };

  /**
   * Deletar uma receita
   */
  static async deleteRevenue(
    userId: string, 
    revenueId: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log('🗑️ Deletando receita:', { userId, revenueId });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating revenue deletion');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const deleteQuery = supabase
        .from('revenues')
        .delete()
        .eq('id', revenueId)
        .eq('user_id', userId);

      const { error } = await withTimeout(deleteQuery);

      if (error) {
        console.error('❌ Erro ao deletar receita:', error);
        return { 
          success: false, 
          error: 'Erro ao deletar receita. Tente novamente.' 
        };
      }

      console.log('✅ Receita deletada com sucesso');
      return { success: true };

    } catch (error) {
      console.error('💥 Erro inesperado ao deletar receita:', error);
      
      if (error instanceof Error && error.message.includes('expirou')) {
        return { 
          success: false, 
          error: 'Operação demorou muito para responder. Verifique sua conexão e tente novamente.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  };
}