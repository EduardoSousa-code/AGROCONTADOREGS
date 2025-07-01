import { supabase } from '../lib/supabase';
import type { ActivityInsert, Activity } from '../lib/supabase';

export interface CreateActivityData {
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
}

export interface ActivityServiceResponse {
  success: boolean;
  data?: Activity;
  error?: string;
}

export interface ActivitiesListResponse {
  success: boolean;
  data?: Activity[];
  error?: string;
}

export interface ActivityItem {
  id: string;
  name: string;
  type: string;
  date: string;
}

export class ActivityService {
  /**
   * Criar uma nova atividade
   */
  static async createActivity(
    userId: string, 
    activityData: CreateActivityData
  ): Promise<ActivityServiceResponse> {
    console.log('🎯 Criando nova atividade:', { userId, ...activityData });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating activity creation');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const insertData: ActivityInsert = {
        user_id: userId,
        name: activityData.name.trim(),
        description: activityData.description?.trim() || null,
        start_date: activityData.startDate,
        end_date: activityData.endDate || null,
        status: activityData.status
      };

      const { data, error } = await supabase
        .from('activities')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar atividade:', error);
        
        if (error.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'Erro de permissão. Verifique se você está logado.' 
          };
        }
        
        if (error.message.includes('check constraint')) {
          return { 
            success: false, 
            error: 'Dados inválidos. Verifique se a data de fim é posterior à data de início.' 
          };
        }
        
        return { 
          success: false, 
          error: 'Erro ao salvar atividade. Tente novamente.' 
        };
      }

      if (!data) {
        return { 
          success: false, 
          error: 'Erro interno: dados não retornados após inserção.' 
        };
      }

      console.log('✅ Atividade criada com sucesso:', data);
      return { success: true, data };

    } catch (error) {
      console.error('💥 Erro inesperado ao criar atividade:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  }

  /**
   * Buscar atividades do usuário
   */
  static async getUserActivities(
    userId: string,
    limit?: number
  ): Promise<ActivitiesListResponse> {
    console.log('🎯 Buscando atividades do usuário:', userId);
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty activities');
      return { success: true, data: [] };
    }
    
    try {
      let query = supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar atividades:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar atividades. Tente novamente.' 
        };
      }

      console.log(`✅ ${data?.length || 0} atividades encontradas`);
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar atividades:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  }

  /**
   * Converter atividades para formato do componente RecentActivities
   */
  static formatActivitiesForDisplay(activities: Activity[]): ActivityItem[] {
    return activities.map(activity => ({
      id: activity.id,
      name: activity.name,
      type: this.getStatusDisplayName(activity.status),
      date: this.formatRelativeDate(activity.start_date)
    }));
  }

  /**
   * Obter nome de exibição para o status
   */
  private static getStatusDisplayName(status: string): string {
    const statusMap: { [key: string]: string } = {
      'planejada': 'Planejada',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Formatar data relativa (ex: "2 horas atrás", "1 dia atrás")
   */
  private static formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 0) {
      if (diffInHours === 0) {
        return 'Agora mesmo';
      } else if (diffInHours === 1) {
        return '1 hora atrás';
      } else {
        return `${diffInHours} horas atrás`;
      }
    } else if (diffInDays === 1) {
      return '1 dia atrás';
    } else if (diffInDays <= 7) {
      return `${diffInDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }

  /**
   * Buscar atividades por status
   */
  static async getActivitiesByStatus(
    userId: string,
    status: string
  ): Promise<ActivitiesListResponse> {
    console.log('📊 Buscando atividades por status:', { userId, status });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty activities for status');
      return { success: true, data: [] };
    }
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar atividades por status:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar atividades por status.' 
        };
      }

      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar atividades por status:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema.' 
      };
    }
  }

  /**
   * Buscar atividades recentes (últimos 30 dias)
   */
  static async getRecentActivities(userId: string): Promise<ActivitiesListResponse> {
    console.log('⏰ Buscando atividades recentes:', userId);
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty recent activities');
      return { success: true, data: [] };
    }
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .gte('start_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('start_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erro ao buscar atividades recentes:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar atividades recentes.' 
        };
      }

      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar atividades recentes:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema.' 
      };
    }
  }

  /**
   * Atualizar uma atividade
   */
  static async updateActivity(
    userId: string,
    activityId: string,
    updateData: Partial<CreateActivityData>
  ): Promise<ActivityServiceResponse> {
    console.log('📝 Atualizando atividade:', { userId, activityId, updateData });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating activity update');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const updatePayload: Partial<ActivityInsert> = {};
      
      if (updateData.name !== undefined) updatePayload.name = updateData.name.trim();
      if (updateData.description !== undefined) updatePayload.description = updateData.description?.trim() || null;
      if (updateData.startDate !== undefined) updatePayload.start_date = updateData.startDate;
      if (updateData.endDate !== undefined) updatePayload.end_date = updateData.endDate || null;
      if (updateData.status !== undefined) updatePayload.status = updateData.status;

      const { data, error } = await supabase
        .from('activities')
        .update(updatePayload)
        .eq('id', activityId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar atividade:', error);
        return { 
          success: false, 
          error: 'Erro ao atualizar atividade. Tente novamente.' 
        };
      }

      if (!data) {
        return { 
          success: false, 
          error: 'Atividade não encontrada ou você não tem permissão para editá-la.' 
        };
      }

      console.log('✅ Atividade atualizada com sucesso:', data);
      return { success: true, data };

    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar atividade:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  }

  /**
   * Deletar uma atividade
   */
  static async deleteActivity(
    userId: string, 
    activityId: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log('🗑️ Deletando atividade:', { userId, activityId });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating activity deletion');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao deletar atividade:', error);
        return { 
          success: false, 
          error: 'Erro ao deletar atividade. Tente novamente.' 
        };
      }

      console.log('✅ Atividade deletada com sucesso');
      return { success: true };

    } catch (error) {
      console.error('💥 Erro inesperado ao deletar atividade:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  }
}