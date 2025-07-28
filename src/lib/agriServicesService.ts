const API_BASE = '/api/v1/';

export interface AgriService {
  id: number;
  name: string;
  category: string;
  category_display: string;
  description: string;
  location: string;
  coverage_area: string;
  contact_info: string;
  pricing_notes: string;
  availability: string;
  image_url?: string;
  is_active: boolean;
  is_verified: boolean;
  date_submitted: string;
  submitted_by: number;
  submitted_by_name: string;
}

export interface AgriServiceStats {
  total_services: number;
  active_services: number;
  verified_services: number;
  category_stats: Array<{
    category: string;
    count: number;
  }>;
  top_locations: Array<{
    location: string;
    count: number;
  }>;
}

export interface CategorySummary {
  category: string;
  count: number;
}

export interface LocationSummary {
  location: string;
  count: number;
}

// Get all agri services
export const getAgriServices = async (): Promise<{ results: AgriService[] }> => {
  try {
    const response = await fetch(`${API_BASE}agriservices/services/`);
    if (!response.ok) {
      throw new Error('Failed to fetch agri services');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching agri services:', error);
    throw error;
  }
};

// Get a single agri service
export const getAgriService = async (id: number): Promise<AgriService> => {
  try {
    const response = await fetch(`${API_BASE}agriservices/services/${id}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch agri service');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching agri service:', error);
    throw error;
  }
};

// Add a new agri service
export const addAgriService = async (serviceData: Partial<AgriService>): Promise<AgriService> => {
  try {
    const response = await fetch(`${API_BASE}agriservices/services/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    if (!response.ok) {
      throw new Error('Failed to add agri service');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding agri service:', error);
    throw error;
  }
};

// Update an agri service
export const updateAgriService = async (id: number, serviceData: Partial<AgriService>): Promise<AgriService> => {
  try {
    const response = await fetch(`${API_BASE}agriservices/services/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    if (!response.ok) {
      throw new Error('Failed to update agri service');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating agri service:', error);
    throw error;
  }
};

// Delete an agri service
export const deleteAgriService = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}agriservices/services/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete agri service');
    }
  } catch (error) {
    console.error('Error deleting agri service:', error);
    throw error;
  }
};

// Get agri services statistics
export const getAgriServiceStats = async (): Promise<AgriServiceStats> => {
  try {
    const response = await fetch(`${API_BASE}agriservices/services/stats/`);
    if (!response.ok) {
      throw new Error('Failed to fetch agri service stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching agri service stats:', error);
    throw error;
  }
};

// Get categories summary
export const getCategoriesSummary = async (): Promise<CategorySummary[]> => {
  try {
    const response = await fetch(`${API_BASE}agriservices/services/categories/`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories summary');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories summary:', error);
    throw error;
  }
};

// Get locations summary
export const getLocationsSummary = async (): Promise<LocationSummary[]> => {
  try {
    const response = await fetch(`${API_BASE}agriservices/services/locations/`);
    if (!response.ok) {
      throw new Error('Failed to fetch locations summary');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching locations summary:', error);
    throw error;
  }
};

// Search agri services
export const searchAgriServices = async (params: {
  q?: string;
  category?: string;
  location?: string;
  verified?: boolean;
}): Promise<{ results: AgriService[] }> => {
  try {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.category) searchParams.append('category', params.category);
    if (params.location) searchParams.append('location', params.location);
    if (params.verified !== undefined) searchParams.append('verified', params.verified.toString());

    const response = await fetch(`${API_BASE}agriservices/services/search/?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to search agri services');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching agri services:', error);
    throw error;
  }
}; 