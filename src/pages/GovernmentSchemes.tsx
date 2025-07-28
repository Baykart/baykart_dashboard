import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileBarChart, Calendar, Users, TrendingUp, Shield, Award, Building2, Globe, Search } from "lucide-react";

const GovernmentSchemes = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileBarChart className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Government Schemes</h1>
              <p className="text-xl text-gray-600">Coming Soon</p>
              <p className="text-gray-500 max-w-2xl mx-auto">
                We're working on bringing you comprehensive government agricultural schemes and subsidies. 
                This module will help farmers discover and apply for various government programs.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Scheme Discovery</CardTitle>
                  <CardDescription>
                    Browse and search through government agricultural schemes and subsidies
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Application Tracking</CardTitle>
                  <CardDescription>
                    Track your scheme applications and get updates on approval status
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Eligibility Check</CardTitle>
                  <CardDescription>
                    Check your eligibility for various schemes based on your profile
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Benefit Calculator</CardTitle>
                  <CardDescription>
                    Calculate potential benefits and subsidies for different schemes
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Document Management</CardTitle>
                  <CardDescription>
                    Upload and manage required documents for scheme applications
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg">Success Stories</CardTitle>
                  <CardDescription>
                    Learn from farmers who have successfully benefited from schemes
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Categories Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Scheme Categories
                </CardTitle>
                <CardDescription>
                  We'll organize schemes into these categories for easy discovery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Badge variant="outline" className="justify-center">Subsidies</Badge>
                  <Badge variant="outline" className="justify-center">Loans</Badge>
                  <Badge variant="outline" className="justify-center">Insurance</Badge>
                  <Badge variant="outline" className="justify-center">Training</Badge>
                  <Badge variant="outline" className="justify-center">Equipment</Badge>
                  <Badge variant="outline" className="justify-center">Irrigation</Badge>
                  <Badge variant="outline" className="justify-center">Seeds</Badge>
                  <Badge variant="outline" className="justify-center">Fertilizer</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Notification Signup */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Globe className="w-5 h-5 mr-2" />
                  Get Notified
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Be the first to know when Government Schemes launches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Notify Me
                  </Button>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  We'll send you an email when this feature is ready
                </p>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            <Card>
              <CardHeader>
                <CardTitle>Development Progress</CardTitle>
                <CardDescription>
                  Current status of the Government Schemes module
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backend API Development</span>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Frontend Interface</span>
                    <Badge variant="secondary">Planned</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Scheme Database</span>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Integration Testing</span>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentSchemes; 