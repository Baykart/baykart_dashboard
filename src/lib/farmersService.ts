import { supabase } from './supabase';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1/farmers/`;

export interface Farmer {
  id: string;
  user: string;
  user_email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string | null;
  gender: string | null;
  region: string;
  district: string;
  village: string;
  address: string;
  years_of_farming: number;
  education_level: string;
  farm_size: string | null;
  primary_crops: string[] | null;
  profile_picture: string | null;
  bio: string | null;
  is_verified: boolean;
  is_active: boolean;
  age: number | null;
  created_at: string;
  updated_at: string;
  // For creating new users
  email?: string;
  password?: string;
}

export interface FarmerCrop {
  id: string;
  farmer: string;
  farmer_name: string;
  crop_name: string;
  area_planted: string | null;
  planting_date: string | null;
  expected_harvest_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerEquipment {
  id: string;
  farmer: string;
  farmer_name: string;
  name: string;
  description: string | null;
  equipment_type: string;
  condition: string;
  purchase_date: string | null;
  value: string | null;
  is_available_for_hire: boolean;
  created_at: string;
  updated_at: string;
}

export interface FarmerActivity {
  id: string;
  farmer: string;
  farmer_name: string;
  activity_type: string;
  title: string;
  description: string;
  date: string;
  duration_hours: string | null;
  cost: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerDetail extends Farmer {
  crops: FarmerCrop[];
  equipment: FarmerEquipment[];
  activities: FarmerActivity[];
}

export interface FarmerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Farmer[];
}

export interface FarmerCropResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FarmerCrop[];
}

export interface FarmerEquipmentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FarmerEquipment[];
}

export interface FarmerActivityResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FarmerActivity[];
}

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}` };
}

export const farmersService = {
  // Farmers
  async getFarmers(params?: {
    region?: string;
    district?: string;
    is_verified?: boolean;
    search?: string;
    sort?: string;
    page?: number;
  }): Promise<FarmerResponse> {
    try {
      const url = new URL(`${API_BASE}farmers/`, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching farmers:', error);
      throw error;
    }
  },

  async getFarmer(id: string): Promise<FarmerDetail> {
    try {
      const response = await fetch(`${API_BASE}farmers/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching farmer:', error);
      throw error;
    }
  },

  async createFarmer(farmerData: Partial<Farmer>): Promise<Farmer> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}farmers/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmerData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create farmer: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating farmer:', error);
      throw error;
    }
  },

  async updateFarmer(id: string, farmerData: Partial<Farmer>): Promise<Farmer> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}farmers/${id}/`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmerData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update farmer: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating farmer:', error);
      throw error;
    }
  },

  async deleteFarmer(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}farmers/${id}/`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete farmer: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting farmer:', error);
      throw error;
    }
  },

  // Crops
  async getCrops(params?: {
    farmer?: string;
    crop_name?: string;
    status?: string;
    search?: string;
    sort?: string;
    page?: number;
  }): Promise<FarmerCropResponse> {
    try {
      const url = new URL(`${API_BASE}crops/`, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crops:', error);
      throw error;
    }
  },

  async createCrop(cropData: Partial<FarmerCrop>): Promise<FarmerCrop> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}crops/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cropData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create crop: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating crop:', error);
      throw error;
    }
  },

  async updateCrop(id: string, cropData: Partial<FarmerCrop>): Promise<FarmerCrop> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}crops/${id}/`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cropData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update crop: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating crop:', error);
      throw error;
    }
  },

  async deleteCrop(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}crops/${id}/`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete crop: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting crop:', error);
      throw error;
    }
  },

  // Equipment
  async getEquipment(params?: {
    farmer?: string;
    equipment_type?: string;
    condition?: string;
    is_available_for_hire?: boolean;
    search?: string;
    sort?: string;
    page?: number;
  }): Promise<FarmerEquipmentResponse> {
    try {
      const url = new URL(`${API_BASE}equipment/`, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  },

  async createEquipment(equipmentData: Partial<FarmerEquipment>): Promise<FarmerEquipment> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}equipment/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create equipment: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  },

  async updateEquipment(id: string, equipmentData: Partial<FarmerEquipment>): Promise<FarmerEquipment> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}equipment/${id}/`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update equipment: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  },

  async deleteEquipment(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}equipment/${id}/`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete equipment: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  },

  // Activities
  async getActivities(params?: {
    farmer?: string;
    activity_type?: string;
    date?: string;
    search?: string;
    sort?: string;
    page?: number;
  }): Promise<FarmerActivityResponse> {
    try {
      const url = new URL(`${API_BASE}activities/`, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },

  async createActivity(activityData: Partial<FarmerActivity>): Promise<FarmerActivity> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}activities/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create activity: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  async updateActivity(id: string, activityData: Partial<FarmerActivity>): Promise<FarmerActivity> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}activities/${id}/`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update activity: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  async deleteActivity(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}activities/${id}/`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete activity: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },
}; 