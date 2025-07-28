import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Calendar, TrendingUp, Clock, Globe, Heart, Share2 } from "lucide-react";

const Community = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Hub</h1>
              <p className="text-xl text-gray-600">Coming Soon</p>
              <Badge variant="secondary" className="mt-4">
                <Clock className="w-4 h-4 mr-2" />
                In Development
              </Badge>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Discussion Forums</h3>
                <p className="text-gray-600 text-sm">
                  Connect with fellow farmers and share knowledge, tips, and experiences
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Events & Meetups</h3>
                <p className="text-gray-600 text-sm">
                  Organize and join agricultural events, workshops, and community meetups
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Local Groups</h3>
                <p className="text-gray-600 text-sm">
                  Join local farming communities and regional agricultural groups
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Knowledge Sharing</h3>
                <p className="text-gray-600 text-sm">
                  Share farming techniques, crop insights, and best practices
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Mentorship</h3>
                <p className="text-gray-600 text-sm">
                  Connect experienced farmers with newcomers for guidance and support
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Resource Sharing</h3>
                <p className="text-gray-600 text-sm">
                  Share tools, equipment, and resources within the community
                </p>
              </Card>
            </div>

            {/* Coming Soon Details */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-purple-600" />
                  What's Coming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Core Features</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Discussion forums and chat rooms</li>
                        <li>• Event creation and management</li>
                        <li>• Local community groups</li>
                        <li>• Knowledge base and articles</li>
                        <li>• User profiles and connections</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Advanced Features</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Video conferencing for meetings</li>
                        <li>• Resource marketplace</li>
                        <li>• Mentorship matching system</li>
                        <li>• Mobile app integration</li>
                        <li>• Analytics and insights</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-2">Community Benefits</h4>
                    <p className="text-sm text-gray-600">
                      The Community Hub will bring together farmers, vendors, and agricultural experts 
                      to create a vibrant ecosystem of knowledge sharing, collaboration, and mutual support. 
                      Connect with like-minded individuals, learn from experienced farmers, and contribute to 
                      the growth of the agricultural community in The Gambia.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="text-center mt-8">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Users className="w-5 h-5 mr-2" />
                Join the Waitlist
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Be among the first to experience the Community Hub
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community; 