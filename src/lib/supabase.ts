import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          farm_name: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          farm_name: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          farm_name?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      revenues: {
        Row: {
          id: string;
          user_id: string;
          value: number;
          description: string;
          category: string;
          date: string;
          created_at: string;
          updated_at: string;
          activity_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          value: number;
          description: string;
          category: string;
          date: string;
          created_at?: string;
          updated_at?: string;
          activity_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          value?: number;
          description?: string;
          category?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
          activity_id?: string | null;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          value: number;
          description: string;
          category: string;
          activity_id: string | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          value: number;
          description: string;
          category: string;
          activity_id?: string | null;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          value?: number;
          description?: string;
          category?: string;
          activity_id?: string | null;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      supplies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          unit: string;
          current_stock: number;
          min_stock_level: number;
          max_stock_level: number;
          expiry_date: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          unit: string;
          current_stock?: number;
          min_stock_level?: number;
          max_stock_level?: number;
          expiry_date?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          unit?: string;
          current_stock?: number;
          min_stock_level?: number;
          max_stock_level?: number;
          expiry_date?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Tipos específicos para as tabelas
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Revenue = Database['public']['Tables']['revenues']['Row'];
export type RevenueInsert = Database['public']['Tables']['revenues']['Insert'];
export type RevenueUpdate = Database['public']['Tables']['revenues']['Update'];

export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export type Supply = Database['public']['Tables']['supplies']['Row'];
export type SupplyInsert = Database['public']['Tables']['supplies']['Insert'];
export type SupplyUpdate = Database['public']['Tables']['supplies']['Update'];

export type Activity = Database['public']['Tables']['activities']['Row'];
export type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
export type ActivityUpdate = Database['public']['Tables']['activities']['Update'];