import { supabase } from './supabase';

export interface AuditLog {
  id: string;
  timestamp: string;
  user_email: string;
  action: string;
  action_display: string;
  model_name: string;
  object_id: string;
  old_values?: any;
  new_values?: any;
  changed_fields?: string[];
  ip_address?: string;
  request_path?: string;
  request_method?: string;
  description?: string;
  has_changes: boolean;
  changes_summary: string;
  created_at: string;
}

export interface AuditLogStats {
  total_logs: number;
  logs_today: number;
  logs_this_week: number;
  logs_this_month: number;
  actions_breakdown: Record<string, number>;
  models_breakdown: Record<string, number>;
  users_breakdown: Record<string, number>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get audit logs with filtering
export const getAuditLogs = async (params?: {
  page?: number;
  page_size?: number;
  action?: string;
  model_name?: string;
  user_email?: string;
  date_from?: string;
  date_to?: string;
  has_changes?: boolean;
}): Promise<{ results: AuditLog[]; count: number }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
    if (params?.action) searchParams.append('action', params.action);
    if (params?.model_name) searchParams.append('model_name', params.model_name);
    if (params?.user_email) searchParams.append('user_email', params.user_email);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.has_changes !== undefined) searchParams.append('has_changes', params.has_changes.toString());

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/logs/?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      count: data.count || 0,
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

// Get audit log statistics
export const getAuditLogStats = async (): Promise<AuditLogStats> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/logs/stats/`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    throw error;
  }
};

// Get recent activity
export const getRecentActivity = async (limit: number = 10): Promise<AuditLog[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/logs/recent_activity/?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

// Get user activity
export const getUserActivity = async (userEmail: string): Promise<AuditLog[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/logs/user_activity/?user_email=${encodeURIComponent(userEmail)}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

// Get model activity
export const getModelActivity = async (modelName: string): Promise<AuditLog[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/logs/model_activity/?model_name=${encodeURIComponent(modelName)}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching model activity:', error);
    throw error;
  }
}; 