import { supabase } from '../lib/supabase';
import type { Activity } from '../lib/supabase';

export interface ActivityServiceResponse {
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
   * Buscar atividades do usuário
   */
  static async getUserActivities(
    userId: string,
    limit?: number
  ): Promise<ActivityServiceResponse> {
    console.log('🎯 Buscando atividades do usuário:', userId);
    
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
  ): Promise<ActivityServiceResponse> {
    console.log('📊 Buscando atividades por status:', { userId, status });
    
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
  static async getRecentActivities(userId: string): Promise<ActivityServiceResponse> {
    console.log('⏰ Buscando atividades recentes:', userId);
    
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
}