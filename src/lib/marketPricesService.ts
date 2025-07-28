const API_BASE = '/api/v1/';

export interface MarketPrice {
  id: string;
  crop_name: string;
  location: string;
  district?: string;
  village?: string;
  price: number;
  currency: string;
  price_unit: string;
  previous_price?: number;
  market_type: string;
  season: string;
  trend: 'up' | 'down' | 'stable';
  price_change?: number;
  price_change_percentage?: number;
  source?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_by_name?: string;
  date: string;
  notes?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  crop_icon: string;
  formatted_price: string;
  formatted_price_change: string;
  formatted_percentage_change: string;
}

export interface MarketPriceDetail extends MarketPrice {
  trend_icon: string;
  trend_color: string;
}

export interface MarketPriceStats {
  total_prices: number;
  total_crops: number;
  total_locations: number;
  price_stats: {
    avg_price: number;
    min_price: number;
    max_price: number;
  };
  trend_stats: Array<{
    trend: string;
    count: number;
  }>;
  recent_prices: number;
}

export interface MarketPriceTrend {
  crop: string;
  location?: string;
  period: string;
  trends: Array<{
    date: string;
    avg_price: number;
    min_price: number;
    max_price: number;
    price_count: number;
  }>;
}

export interface CropSummary {
  crop_name: string;
  crop_icon: string;
  latest_price: string;
  latest_location: string;
  latest_date: string;
  trend: string;
  price_change_percentage: string;
}

export interface LocationSummary {
  location: string;
  latest_crop: string;
  latest_price: string;
  latest_date: string;
}

// Get all market prices
export const getMarketPrices = async (): Promise<{ results: MarketPrice[] }> => {
  try {
    const response = await fetch(`${API_BASE}farming/market-prices/`);
    if (!response.ok) {
      throw new Error('Failed to fetch market prices');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching market prices:', error);
    throw error;
  }
};

// Get market price by ID
export const getMarketPrice = async (id: string): Promise<MarketPriceDetail> => {
  try {
    const response = await fetch(`${API_BASE}farming/market-prices/${id}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch market price');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching market price:', error);
    throw error;
  }
};

// Add new market price
export const addMarketPrice = async (marketPrice: Partial<MarketPrice>): Promise<MarketPrice> => {
  try {
    const token = localStorage.getItem('supabase.auth.token');
    const response = await fetch(`${API_BASE}farming/market-prices/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(marketPrice),
    });
    if (!response.ok) {
      throw new Error('Failed to add market price');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding market price:', error);
    throw error;
  }
};

// Update market price
export const updateMarketPrice = async (id: string, marketPrice: Partial<MarketPrice>): Promise<MarketPrice> => {
  try {
    const token = localStorage.getItem('supabase.auth.token');
    const response = await fetch(`${API_BASE}farming/market-prices/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(marketPrice),
    });
    if (!response.ok) {
      throw new Error('Failed to update market price');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating market price:', error);
    throw error;
  }
};

// Delete market price
export const deleteMarketPrice = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('supabase.auth.token');
    const response = await fetch(`${API_BASE}farming/market-prices/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete market price');
    }
  } catch (error) {
    console.error('Error deleting market price:', error);
    throw error;
  }
};

// Get market price statistics
export const getMarketPriceStats = async (): Promise<MarketPriceStats> => {
  try {
    const response = await fetch(`${API_BASE}farming/market-prices/stats/`);
    if (!response.ok) {
      throw new Error('Failed to fetch market price stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching market price stats:', error);
    throw error;
  }
};

// Get price trends
export const getMarketPriceTrends = async (crop: string, location?: string, days: number = 30): Promise<MarketPriceTrend> => {
  try {
    const params = new URLSearchParams({
      crop,
      days: days.toString(),
    });
    if (location) {
      params.append('location', location);
    }
    
    const response = await fetch(`${API_BASE}farming/market-prices/trends/?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch market price trends');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching market price trends:', error);
    throw error;
  }
};

// Get crops summary
export const getCropsSummary = async (): Promise<CropSummary[]> => {
  try {
    const response = await fetch(`${API_BASE}farming/market-prices/crops/`);
    if (!response.ok) {
      throw new Error('Failed to fetch crops summary');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching crops summary:', error);
    throw error;
  }
};

// Get locations summary
export const getLocationsSummary = async (): Promise<LocationSummary[]> => {
  try {
    const response = await fetch(`${API_BASE}farming/market-prices/locations/`);
    if (!response.ok) {
      throw new Error('Failed to fetch locations summary');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching locations summary:', error);
    throw error;
  }
};

// Search market prices
export const searchMarketPrices = async (filters: {
  q?: string;
  crop?: string;
  location?: string;
  market_type?: string;
  season?: string;
  trend?: string;
  date_from?: string;
  date_to?: string;
}): Promise<{ results: MarketPrice[] }> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    const response = await fetch(`${API_BASE}farming/market-prices/search/?${params}`);
    if (!response.ok) {
      throw new Error('Failed to search market prices');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching market prices:', error);
    throw error;
  }
}; 