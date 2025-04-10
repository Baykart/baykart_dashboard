// Type definitions for Marketplace database schema

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type ProductStatus = "active" | "out_of_stock" | "deleted";

export interface Order {
  id: string;
  buyer_id: string;
  buyer?: {
    id: string;
    email: string;
    name?: string;
  };
  total_amount: number;
  status: OrderStatus;
  shipping_address: string;
  billing_address: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderInput {
  buyer_id: string;
  total_amount: number;
  status: OrderStatus;
  shipping_address: string;
  billing_address: string;
  payment_method: string;
  payment_status: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
  created_at: string;
}

export interface OrderItemInput {
  order_id?: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ProductCategoryInput {
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  images: string[];
  category_id: string;
  category?: ProductCategory;
  seller_id: string;
  seller?: {
    id: string;
    email: string;
    name?: string;
  };
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  images: string[];
  category_id: string;
  seller_id: string;
  status: ProductStatus;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressInput {
  user_id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingDetails {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
} 