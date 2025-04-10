import { supabase } from '@/lib/supabase';
import { Order, OrderInput, OrderItem, OrderItemInput, OrderStatus, PaymentStatus } from '@/types/marketplace';

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return data || [];
};

// Get orders by buyer ID
export const getOrdersByBuyer = async (buyerId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching orders for buyer ${buyerId}:`, error);
    throw error;
  }

  return data || [];
};

// Get orders for a seller - simplified version
export const getOrdersBySeller = async (sellerId: string): Promise<Order[]> => {
  // For simplicity, we're just returning orders
  // In a real implementation, you would filter by seller
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching orders for seller ${sellerId}:`, error);
    throw error;
  }

  return data || [];
};

// Get a single order by ID
export const getOrderById = async (id: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Create a new order with items
export const createOrder = async (
  orderInput: OrderInput,
  orderItems: OrderItemInput[]
): Promise<Order> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId && !orderInput.buyer_id) {
    throw new Error('User must be authenticated to create an order');
  }

  // Generate a unique order ID
  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Start a transaction
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      ...orderInput,
      buyer_id: orderInput.buyer_id || userId,
      order_id: orderId,
      status: orderInput.status || 'pending',
      payment_status: orderInput.payment_status || 'pending'
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

  // Update product stock quantities
  for (const item of orderItems) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', item.product_id)
      .single();

    if (productError) {
      console.error(`Error fetching product ${item.product_id}:`, productError);
      continue;
    }

    const newQuantity = Math.max(0, product.stock_quantity - item.quantity);
    
    // If stock goes to 0, mark as sold out
    const updateData = {
      stock_quantity: newQuantity,
      ...(newQuantity === 0 ? { status: 'sold_out' } : {})
    };

    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', item.product_id);
    
    if (updateError) {
      console.error(`Error updating stock for product ${item.product_id}:`, updateError);
      // Log but continue - don't fail the order creation
    }
  }

  // Return the full order with items
  const { data: fullOrder, error: fetchError } = await supabase
    .from('orders')
    .select(`
      *,
      buyer:buyer_id (
        id,
        email,
        full_name,
        phone
      ),
      items:order_items (
        *,
        product:product_id (
          id,
          name,
          price,
          images
        )
      )
    `)
    .eq('id', order.id)
    .single();

  if (fetchError) {
    console.error(`Error fetching complete order details:`, fetchError);
    // Still return the basic order if we can't fetch the complete details
    return { ...order, items };
  }

  return fullOrder;
};

// Update order status
export const updateOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<Order> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to update order status');
  }

  // Check if user is admin or the buyer of this order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('buyer_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error(`Error fetching order ${id}:`, fetchError);
    throw fetchError;
  }

  // Check permissions (implement your own admin check)
  const isAdmin = false; // TODO: Implement admin check
  if (!isAdmin && order.buyer_id !== userId) {
    throw new Error('You do not have permission to update this order');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating status for order ${id}:`, error);
    throw error;
  }

  return data;
};

// Update payment status
export const updatePaymentStatus = async (
  id: string,
  paymentStatus: PaymentStatus
): Promise<Order> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to update payment status');
  }

  // Check if user is admin or the buyer of this order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('buyer_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error(`Error fetching order ${id}:`, fetchError);
    throw fetchError;
  }

  // Check permissions (implement your own admin check)
  const isAdmin = false; // TODO: Implement admin check
  if (!isAdmin && order.buyer_id !== userId) {
    throw new Error('You do not have permission to update this order');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating payment status for order ${id}:`, error);
    throw error;
  }

  return data;
};

// Get order items
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

// Cancel an order
export const cancelOrder = async (id: string): Promise<Order> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to cancel an order');
  }

  // Check if user is admin or the buyer of this order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('buyer_id, status')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error(`Error fetching order ${id}:`, fetchError);
    throw fetchError;
  }

  // Check permissions (implement your own admin check)
  const isAdmin = false; // TODO: Implement admin check
  if (!isAdmin && order.buyer_id !== userId) {
    throw new Error('You do not have permission to cancel this order');
  }

  // Only allow cancellation if order is pending or confirmed
  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw new Error(`Cannot cancel order in status ${order.status}`);
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error cancelling order ${id}:`, error);
    throw error;
  }

  // Return the stock to inventory
  const { data: items } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', id);

  if (items && items.length > 0) {
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity, status')
        .eq('id', item.product_id)
        .single();

      if (productError) {
        console.error(`Error fetching product ${item.product_id}:`, productError);
        continue;
      }

      const newQuantity = product.stock_quantity + item.quantity;
      const updateData = {
        stock_quantity: newQuantity,
        ...(product.status === 'sold_out' ? { status: 'available' } : {})
      };

      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', item.product_id);
      
      if (updateError) {
        console.error(`Error updating stock for product ${item.product_id}:`, updateError);
      }
    }
  }

  return data;
};

// Get all orders for a user (as buyer)
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    throw error;
  }

  return data || [];
};

// Get orders for a seller
export const getSellerOrders = async (sellerId: string): Promise<Order[]> => {
  // First get all order items where the product belongs to this seller
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*, products!inner(*)")
    .eq("products.seller_id", sellerId);

  if (itemsError) {
    console.error(`Error fetching order items for seller ${sellerId}:`, itemsError);
    throw itemsError;
  }

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  // Extract unique order IDs
  const orderIds = [...new Set(orderItems.map(item => item.order_id))];

  // Get all orders with those IDs
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .in("id", orderIds)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error(`Error fetching orders for seller ${sellerId}:`, ordersError);
    throw ordersError;
  }

  return orders || [];
};

// Get order history
export const getOrderHistory = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching order history for user ${userId}:`, error);
    throw error;
  }

  return data || [];
};

// Get order items for a specific order
export const getOrderItemsForSpecificOrder = async (orderId: string): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from("order_items")
    .select("*, products(*)")
    .eq("order_id", orderId);

  if (error) {
    console.error(`Error fetching order items for order ${orderId}:`, error);
    throw error;
  }

  return data || [];
};

export const orderService = {
  /**
   * Get all orders for a specific user
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          buyer:buyer_id (id, email, name)
        `)
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user orders:", error);
        throw new Error(error.message);
      }

      return data as Order[];
    } catch (error) {
      console.error("Error in getUserOrders:", error);
      throw error;
    }
  },

  /**
   * Get all orders for a specific seller
   */
  async getSellerOrders(sellerId: string): Promise<Order[]> {
    try {
      // First get order items where product seller matches the sellerId
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          order_id,
          product:product_id (seller_id)
        `)
        .eq("product.seller_id", sellerId);

      if (itemsError) {
        console.error("Error fetching seller order items:", itemsError);
        throw new Error(itemsError.message);
      }

      // Extract unique order IDs
      const orderIds = [
        ...new Set(orderItems.map((item) => item.order_id)),
      ];

      if (orderIds.length === 0) {
        return [];
      }

      // Fetch the orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          buyer:buyer_id (id, email, name)
        `)
        .in("id", orderIds)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching seller orders:", ordersError);
        throw new Error(ordersError.message);
      }

      return orders as Order[];
    } catch (error) {
      console.error("Error in getSellerOrders:", error);
      throw error;
    }
  },

  /**
   * Get a specific order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          buyer:buyer_id (id, email, name),
          order_items:order_items (
            *,
            product:product_id (*)
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) {
        console.error(`Error fetching order ${orderId}:`, error);
        throw new Error(error.message);
      }

      return data as Order;
    } catch (error) {
      console.error("Error in getOrderById:", error);
      throw error;
    }
  },

  /**
   * Create a new order
   */
  async createOrder(
    order: OrderInput,
    orderItems: OrderItemInput[]
  ): Promise<Order> {
    try {
      // Use a transaction to ensure both order and order items are created
      const { data, error } = await supabase.rpc("create_order", {
        order_data: order,
        items_data: orderItems,
      });

      if (error) {
        console.error("Error creating order:", error);
        throw new Error(error.message);
      }

      return data as Order;
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating order ${orderId} status:`, error);
        throw new Error(error.message);
      }

      return data as Order;
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      throw error;
    }
  },

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, "cancelled");
  },

  /**
   * Get order history for a user
   */
  async getOrderHistory(userId: string): Promise<Order[]> {
    return this.getUserOrders(userId);
  },

  /**
   * Get order items for a specific order
   */
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          *,
          product:product_id (*)
        `)
        .eq("order_id", orderId);

      if (error) {
        console.error(`Error fetching order items for order ${orderId}:`, error);
        throw new Error(error.message);
      }

      return data as OrderItem[];
    } catch (error) {
      console.error("Error in getOrderItems:", error);
      throw error;
    }
  },
}; 