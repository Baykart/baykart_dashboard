import { supabase } from '@/lib/supabase';
import { Product, ProductInput, ProductStatus, ProductCategory, ProductCategoryInput } from '@/types/marketplace';

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
};

// Get products by seller ID
export const getProductsBySeller = async (sellerId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products for seller ${sellerId}:`, error);
    throw error;
  }

  return data || [];
};

// Get products by category
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products in category ${categoryId}:`, error);
    throw error;
  }

  return data || [];
};

// Get a single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Create a new product
export const createProduct = async (product: ProductInput): Promise<Product> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to create a product');
  }

  const productData = {
    ...product,
    seller_id: userId,
    status: product.status || 'active' as ProductStatus
  };

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
};

// Update an existing product
export const updateProduct = async (id: string, updates: Partial<ProductInput>): Promise<Product> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to update a product');
  }

  // First check if the user is the owner of the product
  const { data: existingProduct, error: fetchError } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error(`Error fetching product with ID ${id}:`, fetchError);
    throw fetchError;
  }

  if (existingProduct.seller_id !== userId) {
    throw new Error('You can only update your own products');
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .eq('seller_id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to delete a product');
  }

  // First check if the user is the owner of the product
  const { data: existingProduct, error: fetchError } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error(`Error fetching product with ID ${id}:`, fetchError);
    throw fetchError;
  }

  if (existingProduct.seller_id !== userId) {
    throw new Error('You can only delete your own products');
  }

  const { error } = await supabase
    .from('products')
    .update({ status: 'deleted' })
    .eq('id', id)
    .eq('seller_id', userId);

  if (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};

// Update product status
export const updateProductStatus = async (id: string, status: ProductStatus): Promise<Product> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to update product status');
  }

  const { data, error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', id)
    .eq('seller_id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating status for product ${id}:`, error);
    throw error;
  }

  return data;
};

// Upload product images
export const uploadProductImage = async (file: File): Promise<string> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to upload images');
  }

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `product-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('marketplace')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('marketplace')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Get all product categories
export const getProductCategories = async (): Promise<ProductCategory[]> => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching product categories:', error);
    throw error;
  }

  return data || [];
};

// Create a new product category
export const createProductCategory = async (name: string): Promise<ProductCategory> => {
  const { data, error } = await supabase
    .from('product_categories')
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error('Error creating product category:', error);
    throw error;
  }

  return data;
};

// Delete a product category
export const deleteProductCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting product category with ID ${id}:`, error);
    throw error;
  }
};

// Search products
export const searchProducts = async (query: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error searching products with query ${query}:`, error);
    throw error;
  }

  return data || [];
}; 