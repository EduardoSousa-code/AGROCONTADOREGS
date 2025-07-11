import { supabase, withTimeout } from '../lib/supabase';
import type { ExpenseInsert, Expense } from '../lib/supabase';

export interface CreateExpenseData {
  value: number;
  description: string;
  category: string;
  activityId?: string | null;
  date: string;
}

export interface ExpenseServiceResponse {
  success: boolean;
  data?: Expense;
  error?: string;
}

export interface ExpensesListResponse {
  success: boolean;
  data?: Expense[];
  error?: string;
}

export class ExpenseService {
  /**
   * Criar uma nova despesa
   */
  static async createExpense(
    userId: string, 
    expenseData: CreateExpenseData
  ): Promise<ExpenseServiceResponse> {
    console.log('💸 Criando nova despesa:', { userId, ...expenseData });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating expense creation');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const insertData: ExpenseInsert = {
        user_id: userId,
        value: expenseData.value,
        description: expenseData.description.trim(),
        category: expenseData.category,
        activity_id: expenseData.activityId || null,
        date: expenseData.date
      };

      const insertQuery = supabase
        .from('expenses')
        .insert(insertData)
        .select()
        .single();

      const { data, error } = await withTimeout(insertQuery);

      if (error) {
        console.error('❌ Erro ao criar despesa:', error);
        
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
          error: 'Erro ao salvar despesa. Tente novamente.' 
        };
      }

      if (!data) {
        return { 
          success: false, 
          error: 'Erro interno: dados não retornados após inserção.' 
        };
      }

      console.log('✅ Despesa criada com sucesso:', data);
      return { success: true, data };

    } catch (error) {
      console.error('💥 Erro inesperado ao criar despesa:', error);
      
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
   * Buscar despesas do usuário
   */
  static async getUserExpenses(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ExpensesListResponse> {
    console.log('📊 Buscando despesas do usuário:', userId);
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty expenses');
      return { success: true, data: [] };
    }
    
    try {
      let query = supabase
        .from('expenses')
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
        console.error('❌ Erro ao buscar despesas:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar despesas. Tente novamente.' 
        };
      }

      console.log(`✅ ${data?.length || 0} despesas encontradas`);
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar despesas:', error);
      
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
   * Buscar despesas por período
   */
  static async getExpensesByPeriod(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ExpensesListResponse> {
    console.log('📅 Buscando despesas por período:', { userId, startDate, endDate });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty expenses for period');
      return { success: true, data: [] };
    }
    
    try {
      const query = supabase
        .from('expenses')
        .select('*, activities(name)')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      const { data, error } = await withTimeout(query);

      if (error) {
        console.error('❌ Erro ao buscar despesas por período:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar despesas do período. Tente novamente.' 
        };
      }

      console.log(`✅ ${data?.length || 0} despesas encontradas no período`);
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar despesas por período:', error);
      
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
   * Calcular total de despesas por período
   */
  static async getTotalExpenseByPeriod(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; total?: number; error?: string }> {
    try {
      const result = await this.getExpensesByPeriod(userId, startDate, endDate);
      
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const total = result.data.reduce((sum, expense) => sum + expense.value, 0);
      
      return { success: true, total };

    } catch (error) {
      console.error('💥 Erro ao calcular total de despesas:', error);
      return { 
        success: false, 
        error: 'Erro ao calcular total de despesas.' 
      };
    }
  };

  /**
   * Buscar despesas por categoria
   */
  static async getExpensesByCategory(
    userId: string,
    category: string
  ): Promise<ExpensesListResponse> {
    console.log('🏷️ Buscando despesas por categoria:', { userId, category });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty expenses for category');
      return { success: true, data: [] };
    }
    
    try {
      const query = supabase
        .from('expenses')
        .select('*, activities(name)')
        .eq('user_id', userId)
        .eq('category', category)
        .order('date', { ascending: false });

      const { data, error } = await withTimeout(query);

      if (error) {
        console.error('❌ Erro ao buscar despesas por categoria:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar despesas da categoria. Tente novamente.' 
        };
      }

      console.log(`✅ ${data?.length || 0} despesas encontradas na categoria ${category}`);
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar despesas por categoria:', error);
      
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
   * Buscar despesas por atividade
   */
  static async getExpensesByActivity(
    userId: string,
    activityId: string
  ): Promise<ExpensesListResponse> {
    console.log('🎯 Buscando despesas por atividade:', { userId, activityId });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty expenses for activity');
      return { success: true, data: [] };
    }
    
    try {
      const query = supabase
        .from('expenses')
        .select('*, activities(name)')
        .eq('user_id', userId)
        .eq('activity_id', activityId)
        .order('date', { ascending: false });

      const { data, error } = await withTimeout(query);

      if (error) {
        console.error('❌ Erro ao buscar despesas por atividade:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar despesas da atividade. Tente novamente.' 
        };
      }

      console.log(`✅ ${data?.length || 0} despesas encontradas na atividade`);
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar despesas por atividade:', error);
      
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
   * Deletar uma despesa
   */
  static async deleteExpense(
    userId: string, 
    expenseId: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log('🗑️ Deletando despesa:', { userId, expenseId });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating expense deletion');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const deleteQuery = supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', userId);

      const { error } = await withTimeout(deleteQuery);

      if (error) {
        console.error('❌ Erro ao deletar despesa:', error);
        return { 
          success: false, 
          error: 'Erro ao deletar despesa. Tente novamente.' 
        };
      }

      console.log('✅ Despesa deletada com sucesso');
      return { success: true };

    } catch (error) {
      console.error('💥 Erro inesperado ao deletar despesa:', error);
      
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
   * Atualizar uma despesa
   */
  static async updateExpense(
    userId: string,
    expenseId: string,
    updateData: Partial<CreateExpenseData>
  ): Promise<ExpenseServiceResponse> {
    console.log('📝 Atualizando despesa:', { userId, expenseId, updateData });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating expense update');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const updatePayload: Partial<ExpenseInsert> = {};
      
      if (updateData.value !== undefined) updatePayload.value = updateData.value;
      if (updateData.description !== undefined) updatePayload.description = updateData.description.trim();
      if (updateData.category !== undefined) updatePayload.category = updateData.category;
      if (updateData.activityId !== undefined) updatePayload.activity_id = updateData.activityId;
      if (updateData.date !== undefined) updatePayload.date = updateData.date;

      const updateQuery = supabase
        .from('expenses')
        .update(updatePayload)
        .eq('id', expenseId)
        .eq('user_id', userId)
        .select()
        .single();

      const { data, error } = await withTimeout(updateQuery);

      if (error) {
        console.error('❌ Erro ao atualizar despesa:', error);
        return { 
          success: false, 
          error: 'Erro ao atualizar despesa. Tente novamente.' 
        };
      }

      if (!data) {
        return { 
          success: false, 
          error: 'Despesa não encontrada ou você não tem permissão para editá-la.' 
        };
      }

      console.log('✅ Despesa atualizada com sucesso:', data);
      return { success: true, data };

    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar despesa:', error);
      
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