import { supabase } from '../lib/supabase';
import type { Supply } from '../lib/supabase';

export interface SupplyServiceResponse {
  success: boolean;
  data?: Supply[];
  error?: string;
}

export interface StockSummary {
  totalItems: number;
  lowStock: number;
  nearExpiry: number;
}

export class SupplyService {
  /**
   * Buscar insumos do usuário
   */
  static async getUserSupplies(userId: string): Promise<SupplyServiceResponse> {
    console.log('📦 Buscando insumos do usuário:', userId);
    
    try {
      const { data, error } = await supabase
        .from('supplies')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar insumos:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar insumos. Tente novamente.' 
        };
      }

      console.log(`✅ ${data?.length || 0} insumos encontrados`);
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar insumos:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  }

  /**
   * Calcular resumo do estoque
   */
  static calculateStockSummary(supplies: Supply[]): StockSummary {
    const totalItems = supplies.length;
    
    // Itens com estoque baixo (abaixo do nível mínimo)
    const lowStock = supplies.filter(supply => 
      supply.current_stock <= supply.min_stock_level
    ).length;
    
    // Itens próximos do vencimento (próximos 30 dias)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const nearExpiry = supplies.filter(supply => {
      if (!supply.expiry_date) return false;
      const expiryDate = new Date(supply.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
    }).length;

    return {
      totalItems,
      lowStock,
      nearExpiry
    };
  }

  /**
   * Buscar insumos com estoque baixo
   */
  static async getLowStockSupplies(userId: string): Promise<SupplyServiceResponse> {
    console.log('⚠️ Buscando insumos com estoque baixo:', userId);
    
    try {
      const { data, error } = await supabase
        .from('supplies')
        .select('*')
        .eq('user_id', userId)
        .filter('current_stock', 'lte', 'min_stock_level')
        .order('current_stock', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar insumos com estoque baixo:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar insumos com estoque baixo.' 
        };
      }

      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar insumos com estoque baixo:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema.' 
      };
    }
  }

  /**
   * Buscar insumos próximos do vencimento
   */
  static async getNearExpirySupplies(userId: string, days: number = 30): Promise<SupplyServiceResponse> {
    console.log('📅 Buscando insumos próximos do vencimento:', userId);
    
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      const { data, error } = await supabase
        .from('supplies')
        .select('*')
        .eq('user_id', userId)
        .not('expiry_date', 'is', null)
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar insumos próximos do vencimento:', error);
        return { 
          success: false, 
          error: 'Erro ao carregar insumos próximos do vencimento.' 
        };
      }

      return { success: true, data: data || [] };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar insumos próximos do vencimento:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema.' 
      };
    }
  }
}