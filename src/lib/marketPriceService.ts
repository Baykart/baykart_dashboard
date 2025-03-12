import { supabase } from '@/lib/supabaseClient';

export interface MarketPrice {
  id: string;
  crop: string;
  market: string;
  price: number;
  currency: string;
  unit: string;
  date: string;
  price_trend?: 'up' | 'down' | 'stable';
  created_at: string;
}

export const marketPriceService = {
  async getMarketPrices(): Promise<MarketPrice[]> {
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMarketPrice(id: string): Promise<MarketPrice> {
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createMarketPrice(marketPrice: Omit<MarketPrice, 'id' | 'created_at'>): Promise<MarketPrice> {
    const { data, error } = await supabase
      .from('market_prices')
      .insert([marketPrice])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMarketPrice(id: string, marketPrice: Partial<MarketPrice>): Promise<MarketPrice> {
    const { data, error } = await supabase
      .from('market_prices')
      .update(marketPrice)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMarketPrice(id: string): Promise<void> {
    const { error } = await supabase
      .from('market_prices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getLatestPrices(): Promise<MarketPrice[]> {
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  },

  async getPricesByCrop(crop: string): Promise<MarketPrice[]> {
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .eq('crop', crop)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  }
}; 