import { supabase } from './supabase';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1/`;

// Debug: Log the API base URL
console.log('🔍 DashboardService - API_BASE:', API_BASE);

export interface DashboardStats {
  totalAgriServices: number;
  totalVideos: number;
  totalNewsArticles: number;
  totalFeedPosts: number;
  totalEvents: number;
  totalMarketPrices: number;
  totalCropCategories: number;
  totalCrops: number;
  totalCropCareProducts: number;
  totalFarmers: number;
  recentActivities: Activity[];
  systemStats: SystemStats;
  launchMetrics: LaunchMetrics;
  businessMetrics: BusinessMetrics;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface SystemStats {
  status: string;
  lastUpdate: string;
  serverLoad: number;
  activeUsers: number;
}

export interface LaunchMetrics {
  platformReach: string;
  marketCoverage: string;
  serviceProviders: number;
  contentLibrary: number;
  communityGrowth: number;
  launchStatus: string;
  supportAvailability: string;
}

export interface BusinessMetrics {
  totalUsers: number;
  activeUsers: number;
  userRetention: number;
  appDownloads: number;
  contentViews: number;
  weeklyGrowth: number;
  platformUptime: number;
  supportTickets: number;
}

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}` };
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('Fetching dashboard stats...');
      
      // Fetch data from multiple endpoints
      const [agriServices, videos, news, marketPrices, farmingCategories, farmingCrops, cropCareProducts, farmers] = await Promise.all([
        fetch(`${API_BASE}agriservices/services/`).then(res => {
          console.log('Agri services response:', res.status);
          return res.json();
        }),
        fetch(`${API_BASE}content/videos/`).then(res => {
          console.log('Videos response:', res.status);
          return res.json();
        }),
        fetch(`${API_BASE}content/news_articles/`).then(res => {
          console.log('News response:', res.status);
          return res.json();
        }),
        fetch(`${API_BASE}farming/market-prices/`).then(res => {
          console.log('Market prices response:', res.status);
          return res.json();
        }),
        fetch(`${API_BASE}farming/categories/`).then(res => {
          console.log('Farming categories response:', res.status);
          return res.json();
        }),
        fetch(`${API_BASE}farming/crops/`).then(res => {
          console.log('Farming crops response:', res.status);
          return res.json();
        }),
        fetch(`${API_BASE}cropcare/products/`).then(res => {
          console.log('Crop care products response:', res.status);
          return res.json();
        }),
        fetch(`${API_BASE}farmers/farmers/`).then(res => {
          console.log('Farmers response:', res.status);
          return res.json();
        }),
      ]);

      console.log('All API calls completed successfully');

      // Try to fetch feeds with authentication
      let feeds = { count: 0 };
      try {
        const headers = await getAuthHeaders();
        feeds = await fetch(`${API_BASE}feeds/posts/`, { headers }).then(res => res.json());
        console.log('Feeds fetched successfully');
      } catch (error) {
        console.log('Feeds endpoint requires authentication, using default value');
      }

      // Try to fetch events
      let events = { count: 0 };
      try {
        events = await fetch(`${API_BASE}events/events/`).then(res => res.json());
        console.log('Events fetched successfully');
      } catch (error) {
        console.log('Events endpoint error, using default value:', error);
      }

      // Get recent activities
      const recentActivities = await this.getRecentActivities();

      // Get system stats
      const systemStats = await this.getSystemStats();

      // Calculate launch metrics
      const launchMetrics = {
        platformReach: "Gambia",
        marketCoverage: "7 Regions",
        serviceProviders: agriServices.count || 0,
        contentLibrary: videos.count || 0,
        communityGrowth: feeds.count || 0,
        launchStatus: "Active",
        supportAvailability: "24/7",
      };

      // Calculate business metrics (mock data for now, can be connected to real analytics)
      const businessMetrics = {
        totalUsers: 2847,
        activeUsers: 1234,
        userRetention: 78,
        appDownloads: 1234,
        contentViews: 8456,
        weeklyGrowth: 15,
        platformUptime: 99.9,
        supportTickets: 12,
      };

      const result = {
        totalAgriServices: agriServices.count || 0,
        totalVideos: videos.count || 0,
        totalNewsArticles: news.count || 0,
        totalFeedPosts: feeds.count || 0,
        totalEvents: events.count || 0,
        totalMarketPrices: marketPrices.count || 0,
        totalCropCategories: farmingCategories.count || 0,
        totalCrops: farmingCrops.count || 0,
        totalCropCareProducts: cropCareProducts.count || 0,
        totalFarmers: farmers.count || 0,
        recentActivities,
        systemStats,
        launchMetrics,
        businessMetrics,
      };

      console.log('Dashboard stats result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalAgriServices: 0,
        totalVideos: 0,
        totalNewsArticles: 0,
        totalFeedPosts: 0,
        totalEvents: 0,
        totalMarketPrices: 0,
        totalCropCategories: 0,
        totalCrops: 0,
        totalCropCareProducts: 0,
        totalFarmers: 0,
        recentActivities: [],
        systemStats: {
          status: 'Error',
          lastUpdate: new Date().toISOString(),
          serverLoad: 0,
          activeUsers: 0,
        },
        launchMetrics: {
          platformReach: "Gambia",
          marketCoverage: "7 Regions",
          serviceProviders: 0,
          contentLibrary: 0,
          communityGrowth: 0,
          launchStatus: "Error",
          supportAvailability: "24/7",
        },
        businessMetrics: {
          totalUsers: 0,
          activeUsers: 0,
          userRetention: 0,
          appDownloads: 0,
          contentViews: 0,
          weeklyGrowth: 0,
          platformUptime: 0,
          supportTickets: 0,
        },
      };
    }
  },

  async getRecentActivities(): Promise<Activity[]> {
    try {
      const activities: Activity[] = [];
      const [agriServices, marketPrices, farmingCategories, farmingCrops] = await Promise.all([
        fetch(`${API_BASE}agriservices/services/?limit=5`).then(res => res.json()),
        fetch(`${API_BASE}farming/market-prices/?limit=5`).then(res => res.json()),
        fetch(`${API_BASE}farming/categories/?limit=5`).then(res => res.json()),
        fetch(`${API_BASE}farming/crops/?limit=5`).then(res => res.json()),
      ]);

      // Add agri services activities
      if (agriServices.results) {
        agriServices.results.forEach((service: any) => {
          activities.push({
            id: service.id.toString(),
            type: 'agri_service',
            description: `New agri service: ${service.name}`,
            timestamp: service.date_submitted,
          });
        });
      }

      // Add market prices activities
      if (marketPrices.results) {
        marketPrices.results.forEach((price: any) => {
          activities.push({
            id: price.id.toString(),
            type: 'market_price',
            description: `New market price: ${price.crop_name} at ${price.location}`,
            timestamp: price.created_at,
          });
        });
      }

      // Add farming categories activities
      if (farmingCategories.results) {
        farmingCategories.results.forEach((category: any) => {
          activities.push({
            id: category.id.toString(),
            type: 'crop_category',
            description: `New crop category: ${category.name}`,
            timestamp: category.created_at,
          });
        });
      }

      // Add farming crops activities
      if (farmingCrops.results) {
        farmingCrops.results.forEach((crop: any) => {
          activities.push({
            id: crop.id.toString(),
            type: 'crop',
            description: `New crop: ${crop.name} (${crop.category_display})`,
            timestamp: crop.created_at,
          });
        });
      }

      // Sort by timestamp (newest first) and return top 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  },

  async getSystemStats(): Promise<SystemStats> {
    try {
      const healthResponse = await fetch('/health/');
      const healthData = await healthResponse.json();
      
      return {
        status: healthData.status === 'healthy' ? 'Operational' : 'Issues Detected',
        lastUpdate: new Date().toISOString(),
        serverLoad: Math.floor(Math.random() * 100), // Mock data for now
        activeUsers: Math.floor(Math.random() * 1000) + 100, // Mock data for now
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {
        status: 'Unknown',
        lastUpdate: new Date().toISOString(),
        serverLoad: 0,
        activeUsers: 0,
      };
    }
  },
}; 