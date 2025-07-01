import { supabase } from '../lib/supabase';
import type { Supply, SupplyInsert, SupplyUpdate } from '../lib/supabase';

export interface CreateSupplyData {
  name: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  expiryDate?: string | null;
  description?: string | null;
}

export interface SupplyServiceResponse {
  success: boolean;
  data?: Supply;
  error?: string;
}

export interface SuppliesListResponse {
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
   * Criar um novo insumo
   */
  static async createSupply(
    userId: string, 
    supplyData: CreateSupplyData
  ): Promise<SupplyServiceResponse> {
    console.log('📦 Criando novo insumo:', { userId, ...supplyData });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating supply creation');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const insertData: SupplyInsert = {
        user_id: userId,
        name: supplyData.name,
        unit: supplyData.unit,
        current_stock: supplyData.currentStock,
        min_stock_level: supplyData.minStockLevel,
        max_stock_level: supplyData.maxStockLevel,
        expiry_date: supplyData.expiryDate || null,
        description: supplyData.description || null
      };

      const { data, error } = await supabase
        .from('supplies')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar insumo:', error);
        
        if (error.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'Erro de permissão. Verifique se você está logado.' 
          };
        }
        
        if (error.message.includes('check constraint')) {
          return { 
            success: false, 
            error: 'Valores de estoque devem ser válidos e não negativos.' 
          };
        }
        
        return { 
          success: false, 
          error: 'Erro ao salvar insumo. Tente novamente.' 
        };
      }

      if (!data) {
        return { 
          success: false, 
          error: 'Erro interno: dados não retornados após inserção.' 
        };
      }

      console.log('✅ Insumo criado com sucesso:', data);
      return { success: true, data };

    } catch (error) {
      console.error('💥 Erro inesperado ao criar insumo:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  }

  /**
   * Buscar insumos do usuário
   */
  static async getUserSupplies(userId: string): Promise<SuppliesListResponse> {
    console.log('📦 Buscando insumos do usuário:', userId);
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty supplies');
      return { success: true, data: [] };
    }
    
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
   * Atualizar um insumo
   */
  static async updateSupply(
    userId: string,
    supplyId: string,
    updateData: Partial<CreateSupplyData>
  ): Promise<SupplyServiceResponse> {
    console.log('📝 Atualizando insumo:', { userId, supplyId, updateData });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating supply update');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const updatePayload: Partial<SupplyUpdate> = {};
      
      if (updateData.name !== undefined) updatePayload.name = updateData.name;
      if (updateData.unit !== undefined) updatePayload.unit = updateData.unit;
      if (updateData.currentStock !== undefined) updatePayload.current_stock = updateData.currentStock;
      if (updateData.minStockLevel !== undefined) updatePayload.min_stock_level = updateData.minStockLevel;
      if (updateData.maxStockLevel !== undefined) updatePayload.max_stock_level = updateData.maxStockLevel;
      if (updateData.expiryDate !== undefined) updatePayload.expiry_date = updateData.expiryDate;
      if (updateData.description !== undefined) updatePayload.description = updateData.description;

      const { data, error } = await supabase
        .from('supplies')
        .update(updatePayload)
        .eq('id', supplyId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar insumo:', error);
        return { 
          success: false, 
          error: 'Erro ao atualizar insumo. Tente novamente.' 
        };
      }

      if (!data) {
        return { 
          success: false, 
          error: 'Insumo não encontrado ou você não tem permissão para editá-lo.' 
        };
      }

      console.log('✅ Insumo atualizado com sucesso:', data);
      return { success: true, data };

    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar insumo:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  }

  /**
   * Deletar um insumo
   */
  static async deleteSupply(
    userId: string, 
    supplyId: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log('🗑️ Deletando insumo:', { userId, supplyId });
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - simulating supply deletion');
      return { 
        success: false, 
        error: 'Funcionalidade não disponível no modo demonstração.' 
      };
    }
    
    try {
      const { error } = await supabase
        .from('supplies')
        .delete()
        .eq('id', supplyId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao deletar insumo:', error);
        return { 
          success: false, 
          error: 'Erro ao deletar insumo. Tente novamente.' 
        };
      }

      console.log('✅ Insumo deletado com sucesso');
      return { success: true };

    } catch (error) {
      console.error('💥 Erro inesperado ao deletar insumo:', error);
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
  static async getLowStockSupplies(userId: string): Promise<SuppliesListResponse> {
    console.log('⚠️ Buscando insumos com estoque baixo:', userId);
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty low stock supplies');
      return { success: true, data: [] };
    }
    
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
  static async getNearExpirySupplies(userId: string, days: number = 30): Promise<SuppliesListResponse> {
    console.log('📅 Buscando insumos próximos do vencimento:', userId);
    
    // Handle demo user
    if (userId === 'unlimited-user-id') {
      console.log('🎭 Demo user detected - returning empty near expiry supplies');
      return { success: true, data: [] };
    }
    
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