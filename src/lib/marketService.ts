import { supabase } from './supabase';
import { MarketPrice } from '../types/supabase';

export interface MarketPriceInput {
  crop: string;
  market: string;
  price: number;
  currency: string;
  unit: string;
  date: string;
  price_trend?: 'up' | 'down' | 'stable';
}

// Get all market prices
export const getMarketPrices = async (): Promise<MarketPrice[]> => {
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching market prices:', error);
    throw error;
  }

  return data || [];
};

// Get market prices for a specific crop
export const getMarketPricesByCrop = async (crop: string): Promise<MarketPrice[]> => {
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .eq('crop', crop)
    .order('date', { ascending: false });

  if (error) {
    console.error(`Error fetching market prices for crop ${crop}:`, error);
    throw error;
  }

  return data || [];
};

// Get market prices for a specific market
export const getMarketPricesByMarket = async (market: string): Promise<MarketPrice[]> => {
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .eq('market', market)
    .order('date', { ascending: false });

  if (error) {
    console.error(`Error fetching market prices for market ${market}:`, error);
    throw error;
  }

  return data || [];
};

// Get market prices for a date range
export const getMarketPricesByDateRange = async (startDate: string, endDate: string): Promise<MarketPrice[]> => {
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error(`Error fetching market prices for date range ${startDate} to ${endDate}:`, error);
    throw error;
  }

  return data || [];
};

// Get a single market price by ID
export const getMarketPriceById = async (id: string): Promise<MarketPrice | null> => {
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching market price with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Create a new market price
export const createMarketPrice = async (marketPrice: MarketPriceInput): Promise<MarketPrice> => {
  const { data, error } = await supabase
    .from('market_prices')
    .insert([marketPrice])
    .select()
    .single();

  if (error) {
    console.error('Error creating market price:', error);
    throw error;
  }

  return data;
};

// Update an existing market price
export const updateMarketPrice = async (id: string, marketPrice: Partial<MarketPriceInput>): Promise<MarketPrice> => {
  const { data, error } = await supabase
    .from('market_prices')
    .update(marketPrice)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating market price with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a market price
export const deleteMarketPrice = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('market_prices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting market price with ID ${id}:`, error);
    throw error;
  }
};

// Get market price trends for a crop
export const getMarketPriceTrends = async (crop: string, days: number = 30): Promise<any[]> => {
  // Calculate the date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('market_prices')
    .select('date, price, market')
    .eq('crop', crop)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    console.error(`Error fetching market price trends for crop ${crop}:`, error);
    throw error;
  }

  // Process data to group by market and format for trend analysis
  const marketData: Record<string, any[]> = {};
  
  data?.forEach(item => {
    if (!marketData[item.market]) {
      marketData[item.market] = [];
    }
    
    marketData[item.market].push({
      date: item.date,
      price: item.price
    });
  });
  
  return Object.keys(marketData).map(market => ({
    market,
    prices: marketData[market]
  }));
}; 