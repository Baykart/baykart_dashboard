import { Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/lib/authService";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";

export function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

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
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 hidden sm:inline">Hey 👋 </span>
          <span className="text-sm font-medium">{user?.email || "Admin"}</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button 
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
