import { supabase } from '@/lib/supabaseClient';

export interface Order {
  id: string;
  order_id: string;
  user_id: string;
  total_amount: number;
  discount_amount?: number;
  shipping_amount?: number;
  currency: string;
  order_date: string;
  shipping_address: any;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  users?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  products?: {
    name: string;
    unit: string;
  };
}

export interface OrderInput {
  user_id: string;
  total_amount: number;
  discount_amount?: number;
  shipping_amount?: number;
  currency: string;
  shipping_address: any; // JSONB type
  payment_method: string;
  payment_status?: string;
  delivery_status?: string;
  expected_delivery_date?: string;
}

export interface OrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// Get all orders for a user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('order_date', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }

  return data || [];
};

// Get a single order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    throw error;
  }

  return data;
};

// Get order items for an order
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) {
    console.error(`Error fetching items for order ${orderId}:`, error);
    throw error;
  }

  return data || [];
};

// Create a new order with items
export const createOrder = async (
  orderInput: OrderInput,
  orderItems: OrderItemInput[]
): Promise<{ order: Order; items: OrderItem[] }> => {
  // Generate a unique order ID (you might want to use a more sophisticated method)
  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Start a transaction
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      ...orderInput,
      order_id: orderId,
      order_date: new Date().toISOString(),
      payment_status: orderInput.payment_status || 'pending',
      delivery_status: orderInput.delivery_status || 'processing',
      discount_amount: orderInput.discount_amount || 0,
      shipping_amount: orderInput.shipping_amount || 0
    }])
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  // Insert order items
  const itemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order.id
  }));

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId)
    .select();

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    // In a real application, you might want to delete the order if items insertion fails
    throw itemsError;
  }

  // Update product stock quantities (in a real app, you might want to use a database function for this)
  for (const item of orderItems) {
    const { error: updateError } = await supabase.rpc('update_product_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity
    });
    
    if (updateError) {
      console.error(`Error updating stock for product ${item.product_id}:`, updateError);
      // Log but continue - don't fail the order creation
    }
  }

  return { order, items };
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  delivery_status: Order['delivery_status']
): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ delivery_status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }

  return data;
};

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            unit
          )
        ),
        users (
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getOrder(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            unit
          )
        ),
        users (
          full_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateOrderStatus(id: string, delivery_status: Order['delivery_status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ delivery_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePaymentStatus(id: string, payment_status: Order['payment_status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product (
            name,
            unit
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}; 