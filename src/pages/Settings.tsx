import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { signOut } from "@/lib/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { LogOut } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900">Profile</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        value={user?.email || ""}
                        disabled
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Your email is used for authentication
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900">Preferences</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Email Notifications
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Dark Mode
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900">Authentication</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <Button 
                      variant="destructive" 
                      className="w-full sm:w-auto flex items-center"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
