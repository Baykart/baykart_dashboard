import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar, Users, Grid, Download } from "lucide-react";
import { Link } from 'react-router-dom';

const statsData = [
  {
    title: "Total Crop Categories",
    value: "9",
    icon: Grid,
    description: "Active categories",
    change: "+2 from last month",
  },
  {
    title: "Total Crops",
    value: "124",
    icon: ChartBar,
    description: "Registered crops",
    change: "+15 from last month",
  },
  {
    title: "Total Farmers",
    value: "2,345",
    icon: Users,
    description: "Active farmers",
    change: "+201 from last month",
  },
  {
    title: "App Downloads",
    value: "12.5K",
    icon: Download,
    description: "Total downloads",
    change: "+1.2K from last month",
  },
];

const Index = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back! Here's an overview of your farm management system.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {statsData.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {stat.description}
                    </p>
                    <p className="text-xs text-primary mt-1">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "New farmer registration: John Smith",
                      "Crop category added: Vegetables",
                      "New crop added: Sweet Corn",
                      "Updated farmer profile: Maria Garcia",
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-gray-600 py-2 border-b last:border-0"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                        {activity}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">System Status</span>
                      <span className="text-sm font-medium text-green-600">
                        Operational
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Update</span>
                      <span className="text-sm text-gray-900">5 mins ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Server Load</span>
                      <span className="text-sm text-gray-900">42%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-sm text-gray-900">891</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Link to="/agriservices" className="block p-4 bg-white rounded shadow hover:bg-gray-50 mb-2">
              Agri Services
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
