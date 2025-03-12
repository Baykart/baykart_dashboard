import { supabase } from './supabase/client';

export interface Farmer {
  id: string;
  phone: string;
  full_name: string;
  age?: number;
  location?: string;
  farm_area?: number;
  area_unit?: 'Acre' | 'Hectare';
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export const farmerService = {
  async getFarmers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name');

    if (error) throw error;
    return data;
  },

  async getFarmerById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createFarmer(farmer: Omit<Farmer, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString();
    const farmerWithTimestamps = {
      ...farmer,
      created_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from('users')
      .insert([farmerWithTimestamps])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFarmer(id: string, updates: Partial<Omit<Farmer, 'id' | 'created_at'>>) {
    const updatedFarmer = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .update(updatedFarmer)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFarmer(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 