import { supabase } from './supabase';

export interface GovernmentScheme {
  id: string;
  title: string;
  category: string;
  state: string;
  description: string;
  brief?: string;
  website_url?: string;
  image_url?: string;
  publish_date: string;
  application_mode?: string;
  eligibility_criteria?: any;
  benefits?: any;
  required_documents?: any;
  created_at: string;
  updated_at: string;
}

export const schemeService = {
  async getSchemes() {
    const { data, error } = await supabase
      .from('government_schemes')
      .select('*')
      .order('publish_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getSchemeById(id: string) {
    const { data, error } = await supabase
      .from('government_schemes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getSchemesByCategory(category: string) {
    const { data, error } = await supabase
      .from('government_schemes')
      .select('*')
      .eq('category', category)
      .order('publish_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getSchemesByState(state: string) {
    const { data, error } = await supabase
      .from('government_schemes')
      .select('*')
      .eq('state', state)
      .order('publish_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createScheme(scheme: Omit<GovernmentScheme, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString();
    const schemeWithTimestamps = {
      ...scheme,
      created_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from('government_schemes')
      .insert([schemeWithTimestamps])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateScheme(id: string, updates: Partial<Omit<GovernmentScheme, 'id' | 'created_at'>>) {
    const updatedScheme = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('government_schemes')
      .update(updatedScheme)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteScheme(id: string) {
    const { error } = await supabase
      .from('government_schemes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 