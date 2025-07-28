import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { signOut } from "@/lib/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useDarkMode } from "@/lib/DarkModeContext";
import { LogOut, Save } from "lucide-react";
import { useState, useEffect } from "react";

interface SettingsForm {
  emailNotifications: boolean;
}

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, setDarkMode } = useDarkMode();
  
  const [settings, setSettings] = useState<SettingsForm>({
    emailNotifications: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboard-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ emailNotifications: parsed.emailNotifications ?? true });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Check if settings have changed
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboard-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const currentSettings = { emailNotifications: settings.emailNotifications };
        setHasChanges(JSON.stringify(currentSettings) !== JSON.stringify({ emailNotifications: parsed.emailNotifications }));
      } catch (error) {
        setHasChanges(true);
      }
    } else {
      setHasChanges(true);
    }
  }, [settings]);

  const handleToggleChange = (key: keyof SettingsForm) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!isDarkMode);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage
      const savedSettings = localStorage.getItem('dashboard-settings');
      let allSettings = { emailNotifications: true, darkMode: false };
      
      if (savedSettings) {
        try {
          allSettings = JSON.parse(savedSettings);
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }
      
      allSettings.emailNotifications = settings.emailNotifications;
      allSettings.darkMode = isDarkMode;
      
      localStorage.setItem('dashboard-settings', JSON.stringify(allSettings));
      
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Account</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={user?.email || ""}
                        disabled
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Your email is used for authentication
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Preferences</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Notifications
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Receive email updates about system activities
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.emailNotifications}
                          onChange={() => handleToggleChange('emailNotifications')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Dark Mode
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Switch to dark theme for better viewing
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={isDarkMode}
                          onChange={handleDarkModeToggle}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Authentication</h2>
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
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {hasChanges && "You have unsaved changes"}
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={!hasChanges || isLoading}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
