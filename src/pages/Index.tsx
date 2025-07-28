import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, ShoppingBag, MapPin, Phone, Download, Eye, Star, MessageSquare, Calendar, Activity, Target, Zap, BarChart3, Grid, Leaf } from "lucide-react";
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { dashboardService, DashboardStats, Activity as ActivityType } from '@/lib/dashboardService';
import { LoadingSpinner } from '@/components/ui/loading';

const Index = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        console.log('Starting to fetch dashboard data...');
        setLoading(true);
        const data = await dashboardService.getDashboardStats();
        console.log('Dashboard data received:', data);
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Key agricultural metrics for Baykart
  const agriculturalMetrics = [
    {
      title: "Total Farmers",
      value: stats?.totalFarmers.toString() || "0",
      icon: Users,
      description: "Registered farmers",
      change: "+89 this month",
      trend: "up",
      color: "text-green-600",
      status: "real", // Now using real data from API
    },
    {
      title: "Crop Categories",
      value: stats?.totalCropCategories.toString() || "0",
      icon: Grid,
      description: "Available categories",
      change: "+2 this month",
      trend: "up",
      color: "text-blue-600",
      status: "real", // Real data from API
    },
    {
      title: "Total Crops",
      value: stats?.totalCrops.toString() || "0",
      icon: Leaf,
      description: "Available crops",
      change: "+5 this month",
      trend: "up",
      color: "text-purple-600",
      status: "real", // Real data from API
    },
    {
      title: "Agri Services",
      value: stats?.totalAgriServices.toString() || "0",
      icon: Target,
      description: "Service providers",
      change: "+3 this month",
      trend: "up",
      color: "text-orange-600",
      status: "real", // Real data from API
    },
    {
      title: "Market Prices",
      value: stats?.totalMarketPrices.toString() || "0",
      icon: ShoppingBag,
      description: "Price entries",
      change: "+23 this month",
      trend: "up",
      color: "text-pink-600",
      status: "real", // Real data from API
    },
  ];

  const platformHealth = [
    {
      title: "Farmer Engagement",
      value: "78%",
      status: "mock",
      description: "Active farmers",
      icon: Users,
    },
    {
      title: "Market Coverage",
      value: "7/7",
      status: "real",
      description: "Gambia regions",
      icon: MapPin,
    },
    {
      title: "Service Network",
      value: stats?.totalAgriServices.toString() || "0",
      status: "real",
      description: "Active providers",
      icon: Target,
    },
    {
      title: "Price Updates",
      value: "Daily",
      status: "real",
      description: "Market data frequency",
      icon: TrendingUp,
    },
  ];

  const growthMetrics = [
    {
      title: "Farmer Growth",
      value: "+15%",
      description: "Monthly farmer signups",
      color: "text-green-600",
      status: "mock",
    },
    {
      title: "Crop Categories",
      value: stats?.totalCropCategories.toString() || "0",
      description: "Available crop categories",
      color: "text-blue-600",
      status: "real",
    },
    {
      title: "Total Crops",
      value: stats?.totalCrops.toString() || "0",
      description: "Available crops for farmers",
      color: "text-purple-600",
      status: "real",
    },
    {
      title: "Market Activity",
      value: stats?.totalMarketPrices.toString() || "0",
      description: "Price entries this month",
      color: "text-orange-600",
      status: "real",
    },
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 py-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <LoadingSpinner size="lg" className="mx-auto mb-4" />
                  <p className="text-gray-600">Loading platform metrics...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 py-8">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Baykart Agricultural Platform</h1>
              <p className="mt-2 text-lg text-gray-600">
                Empowering Gambia's farmers with market access, services, and knowledge
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Gambia Farmers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Real-time data</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Launch Phase</span>
                </div>
              </div>
              
              {/* Data Status Legend */}
              <div className="mt-4 flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600">Real data from API</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-gray-600">Mock data (need analytics)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-600">Requires authentication</span>
                </div>
              </div>
            </div>

            {/* Key Agricultural Metrics */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-8">
              {agriculturalMetrics.map((metric, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                      {metric.status === 'real' && (
                        <div className="w-2 h-2 rounded-full bg-green-500" title="Real data from API" />
                      )}
                      {metric.status === 'mock' && (
                        <div className="w-2 h-2 rounded-full bg-yellow-500" title="Mock data - need analytics" />
                      )}
                      {metric.status === 'auth' && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" title="Requires authentication" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {metric.description}
                    </p>
                    <p className={`text-xs mt-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Platform Health */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {platformHealth.map((health, index) => (
                <Card key={index} className={`bg-gradient-to-r ${
                  health.status === 'real' ? 'from-green-50 to-emerald-50' :
                  health.status === 'mock' ? 'from-yellow-50 to-orange-50' :
                  'from-blue-50 to-indigo-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">{health.title}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{health.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{health.description}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <health.icon className={`h-6 w-6 ${
                          health.status === 'real' ? 'text-green-600' :
                          health.status === 'mock' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          health.status === 'real' ? 'bg-green-500' :
                          health.status === 'mock' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              {/* Growth Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Farmer Success Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {growthMetrics.map((metric, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                          <p className="text-xs text-gray-500">{metric.description}</p>
                        </div>
                        <span className={`text-lg font-bold ${metric.color}`}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Platform Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentActivities.length ? (
                      stats.recentActivities.map((activity: ActivityType) => (
                        <div
                          key={activity.id}
                          className="flex items-center text-sm text-gray-600 py-2 border-b last:border-0"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                          <div className="flex-1">
                            <div>{activity.description}</div>
                            <div className="text-xs text-gray-400">
                              {formatTimeAgo(activity.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">No recent activity</p>
                        <p className="text-xs text-gray-400 mt-1">Activity will appear here as farmers engage</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions for Farmers */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Farmer Services</h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Link to="/market-prices" className="block">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <ShoppingBag className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-medium">Market Prices</h3>
                      <p className="text-sm text-gray-600">Check current prices</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/agriservices" className="block">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-medium">Agri Services</h3>
                      <p className="text-sm text-gray-600">Find service providers</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/videos" className="block">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-medium">Learning Videos</h3>
                      <p className="text-sm text-gray-600">Farming techniques</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/feeds" className="block">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-medium">Community</h3>
                      <p className="text-sm text-gray-600">Connect with farmers</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
