import { supabase } from '@/lib/supabase';
import { getValidSession } from './authService';

const API_BASE = '/api/v1/market-prices/';

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

async function getAuthHeaders() {
  const session = await getValidSession();
  if (!session) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${session.access_token}` };
}

export const marketPriceService = {
  async getMarketPrices() {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch market prices');
    return res.json();
  },
  async getMarketPrice(id: string) {
    const res = await fetch(`${API_BASE}${id}/`);
    if (!res.ok) throw new Error('Failed to fetch market price');
    return res.json();
  },
  async createMarketPrice(marketPrice) {
    const headers = { ...(await getAuthHeaders()), 'Content-Type': 'application/json' };
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify(marketPrice),
    });
    if (!res.ok) {
      let errorMsg = 'Failed to create market price';
      try {
        const errorData = await res.json();
        errorMsg += ': ' + JSON.stringify(errorData);
      } catch {}
      throw new Error(errorMsg);
    }
    return res.json();
  },
  async updateMarketPrice(id, marketPrice) {
    const headers = { ...(await getAuthHeaders()), 'Content-Type': 'application/json' };
    const res = await fetch(`${API_BASE}${id}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(marketPrice),
    });
    if (!res.ok) throw new Error('Failed to update market price');
    return res.json();
  },
  async deleteMarketPrice(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${id}/`, { method: 'DELETE', headers });
    if (!res.ok) throw new Error('Failed to delete market price');
  },
  // Add more methods as needed for trends, analytics, etc.
}; 