-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  seller_id uuid NULL,
  name text NOT NULL,
  description text NULL,
  price numeric NOT NULL,
  category text NULL,
  location text NULL,
  stock_quantity integer NULL DEFAULT 0,
  images text[] NULL,
  sowing_season text NULL,
  sowing_method text NULL,
  maturity_days integer NULL,
  status text NULL DEFAULT 'available'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT products_status_check CHECK (
    (
      status = ANY (
        ARRAY[
          'available'::text,
          'sold_out'::text,
          'archived'::text
        ]
      )
    )
  )
);

-- Create index on seller_id
CREATE INDEX IF NOT EXISTS products_seller_id_idx ON public.products USING btree (seller_id);

-- Create product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  name text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT product_categories_pkey PRIMARY KEY (id),
  CONSTRAINT product_categories_name_key UNIQUE (name)
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create trigger for updated_at on addresses
CREATE TRIGGER update_addresses_updated_at BEFORE
UPDATE ON public.addresses FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Create index on user_id for addresses
CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON public.addresses USING btree (user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  buyer_id uuid NULL,
  status text NULL DEFAULT 'pending'::text,
  total_amount numeric NOT NULL,
  shipping_address text NULL,
  payment_status text NULL DEFAULT 'pending'::text,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  shipping_address_id uuid NULL,
  shipping_name text NULL,
  shipping_phone text NULL,
  shipping_address_line1 text NULL,
  shipping_address_line2 text NULL,
  shipping_city text NULL,
  shipping_state text NULL,
  shipping_pincode text NULL,
  order_id text NULL,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_order_id_key UNIQUE (order_id),
  CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES addresses (id),
  CONSTRAINT orders_payment_status_check CHECK (
    (
      payment_status = ANY (
        ARRAY['pending'::text, 'paid'::text, 'failed'::text]
      )
    )
  ),
  CONSTRAINT orders_status_check CHECK (
    (
      status = ANY (
        ARRAY[
          'pending'::text,
          'confirmed'::text,
          'shipped'::text,
          'delivered'::text,
          'cancelled'::text
        ]
      )
    )
  )
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON public.orders USING btree (buyer_id);
CREATE INDEX IF NOT EXISTS orders_shipping_address_id_idx ON public.orders USING btree (shipping_address_id);
CREATE INDEX IF NOT EXISTS orders_order_id_idx ON public.orders USING btree (order_id);

-- Create trigger for updated_at on orders
CREATE TRIGGER update_orders_updated_at BEFORE
UPDATE ON public.orders FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  order_id uuid NULL,
  product_id uuid NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  total numeric NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);

-- Create indexes for order_items
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items USING btree (order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items USING btree (product_id);

-- Apply Row Level Security (RLS) policies

-- Products table RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view available products
CREATE POLICY "Anyone can view available products" ON public.products
  FOR SELECT USING (status = 'available'::text OR auth.uid() = seller_id);

-- Sellers can view their own products regardless of status
CREATE POLICY "Sellers can view all their products" ON public.products
  FOR SELECT USING (auth.uid() = seller_id);

-- Only authenticated users can create products
CREATE POLICY "Authenticated users can create products" ON public.products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = seller_id);

-- Only owners can update their products
CREATE POLICY "Owners can update their products" ON public.products
  FOR UPDATE USING (auth.uid() = seller_id);

-- Only owners can delete their products
CREATE POLICY "Owners can delete their products" ON public.products
  FOR DELETE USING (auth.uid() = seller_id);

-- Product Categories RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view product categories" ON public.product_categories
  FOR SELECT USING (true);

-- Admin users can manage categories (To be implemented with proper admin check)
CREATE POLICY "Authenticated users can insert product categories" ON public.product_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Addresses table RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Users can only view their own addresses
CREATE POLICY "Users can view their own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only create addresses for themselves
CREATE POLICY "Users can create their own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own addresses
CREATE POLICY "Users can update their own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own addresses
CREATE POLICY "Users can delete their own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Orders table RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own orders
CREATE POLICY "Buyers can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = buyer_id);

-- Sellers can view orders containing their products
CREATE POLICY "Sellers can view orders with their products" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
    )
  );

-- Authenticated users can create orders
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    (buyer_id IS NULL OR buyer_id = auth.uid())
  );

-- Buyers can update their own orders
CREATE POLICY "Buyers can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = buyer_id);

-- Order Items table RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own order items
CREATE POLICY "Buyers can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.buyer_id = auth.uid()
    )
  );

-- Sellers can view order items for their products
CREATE POLICY "Sellers can view order items with their products" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = order_items.product_id AND p.seller_id = auth.uid()
    )
  );

-- Authenticated users can create order items
CREATE POLICY "Authenticated users can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND (o.buyer_id IS NULL OR o.buyer_id = auth.uid())
    )
  );

-- Only the product seller can delete order_items
CREATE POLICY "Users can delete their own order items" ON public.order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.buyer_id = auth.uid()
    )
  ); 