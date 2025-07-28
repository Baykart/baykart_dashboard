const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1/`;

export interface MarketplaceProduct {
  id: string;
  seller: string;
  seller_name: string;
  category: string;
  category_name: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  formatted_price: string;
  quantity_available: number;
  unit: string;
  condition: string;
  location: string;
  district: string | null;
  village: string | null;
  main_image: string | null;
  additional_images: string[];
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  contact_phone: string | null;
  contact_email: string | null;
  views_count: number;
  favorites_count: number;
  average_rating: number;
  rating_count: number;
  is_favorited: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getMarketplaceProducts(params = "") {
  const res = await fetch(`${API_BASE}marketplace/products/${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getMarketplaceCategories() {
  const res = await fetch(`${API_BASE}marketplace/categories/`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function addMarketplaceProduct(data: any) {
  const res = await fetch(`${API_BASE}marketplace/products/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add product");
  return res.json();
}

export async function updateMarketplaceProduct(id: string, data: any) {
  const res = await fetch(`${API_BASE}marketplace/products/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteMarketplaceProduct(id: string) {
  const res = await fetch(`${API_BASE}marketplace/products/${id}/`, {
    method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
  return true;
}

export async function getMarketplaceStats() {
  const res = await fetch(`${API_BASE}marketplace/products/stats/`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
} 