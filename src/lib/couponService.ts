import { supabase } from './supabase';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_amount: number | null;
  discount_percentage: number | null;
  minimum_purchase: number | null;
  currency: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CouponFormData {
  code: string;
  description?: string;
  discount_amount?: number;
  discount_percentage?: number;
  minimum_purchase?: number;
  currency: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit?: number;
}

// Get all coupons
export const getAllCoupons = async (): Promise<Coupon[]> => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }

  return data || [];
};

// Get active coupons
export const getActiveCoupons = async (): Promise<Coupon[]> => {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', currentDate)
    .gte('end_date', currentDate)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active coupons:', error);
    throw error;
  }

  return data || [];
};

// Get coupon by ID
export const getCouponById = async (id: string): Promise<Coupon | null> => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching coupon:', error);
    throw error;
  }

  return data;
};

// Get coupon by code
export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
    console.error('Error fetching coupon by code:', error);
    throw error;
  }

  return data || null;
};

// Create a new coupon
export const createCoupon = async (couponData: CouponFormData): Promise<Coupon> => {
  const { data, error } = await supabase
    .from('coupons')
    .insert([{
      ...couponData,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }

  return data;
};

// Update a coupon
export const updateCoupon = async (id: string, couponData: Partial<CouponFormData>): Promise<Coupon> => {
  const { data, error } = await supabase
    .from('coupons')
    .update({
      ...couponData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }

  return data;
};

// Delete a coupon
export const deleteCoupon = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

// Toggle coupon active status
export const toggleCouponStatus = async (id: string, isActive: boolean): Promise<Coupon> => {
  const { data, error } = await supabase
    .from('coupons')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling coupon status:', error);
    throw error;
  }

  return data;
};

// Validate a coupon code
export const validateCoupon = async (code: string, purchaseAmount: number): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> => {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .lte('start_date', currentDate)
    .gte('end_date', currentDate)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return { valid: false, message: 'Invalid coupon code' };
    }
    console.error('Error validating coupon:', error);
    throw error;
  }

  const coupon = data as Coupon;

  // Check usage limit
  if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
    return { valid: false, message: 'Coupon usage limit reached', coupon };
  }

  // Check minimum purchase
  if (coupon.minimum_purchase !== null && purchaseAmount < coupon.minimum_purchase) {
    return { 
      valid: false, 
      message: `Minimum purchase amount of ${coupon.minimum_purchase} ${coupon.currency} required`, 
      coupon 
    };
  }

  return { valid: true, coupon };
}; 