import { Home, Grid, Leaf, Coffee, Users, Settings, Menu, FileText, UsersRound, Tag, Calendar, Film, FileBarChart, ShoppingBag, Sprout, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// Organized navigation with logical grouping
const navigation = [
  // Main Dashboard
  { name: "Home", href: "/", icon: Home },
  
  // Content Management
  { name: "Feeds", href: "/feeds", icon: Coffee },
  { name: "Feed Reports", href: "/feed-reports", icon: FileBarChart },
  { name: "Articles", href: "/articles", icon: FileText },
  { name: "Videos", href: "/videos", icon: Film },
  { name: "Events", href: "/events", icon: Calendar },
  
  // Agricultural Management
  { name: "Crop Categories", href: "/crop-categories", icon: Grid },
  { name: "Crops", href: "/crops", icon: Leaf },
  { name: "Crop Care", href: "/crop-care", icon: Sprout },
  { name: "Farmers", href: "/farmers", icon: Users },
  
  // Business & Commerce
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { name: "Market Prices", href: "/market-prices", icon: TrendingUp },
  { name: "Coupons", href: "/coupons", icon: Tag },
  
  // Services & Support
  { name: "Government Schemes", href: "/government-schemes", icon: FileBarChart },
  { name: "Agri Services", href: "/agriservices", icon: UsersRound },
  { name: "Community", href: "/community", icon: UsersRound },
  
  // System
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "Audit Logs", href: "/audit-logs", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-4 left-4 z-50 p-2 rounded-md md:hidden",
          isOpen ? "text-white" : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 shadow-md"
        )}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-30 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={cn(
          "fixed md:static h-screen z-40 flex-none bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-0 md:w-20",
          "overflow-hidden"
        )}
      >
        <div className={cn(
          "w-64 flex-shrink-0",
          !isOpen && "md:w-20"
        )}>
          <div className="p-4">
            <h2 className={cn(
              "text-xl font-semibold text-gray-700 dark:text-white transition-opacity duration-200",
              !isOpen && "md:opacity-0"
            )}>
              Baykart Dashboard
            </h2>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              
              // Add section dividers for better organization
              const showDivider = 
                (item.name === "Feeds" && index > 0) ||
                (item.name === "Crop Categories" && index > 0) ||
                (item.name === "Marketplace" && index > 0) ||
                (item.name === "Government Schemes" && index > 0) ||
                (item.name === "Settings" && index > 0);
              
              return (
                <div key={item.name}>
                  {showDivider && (
                    <div className="my-2 border-t border-gray-200 dark:border-gray-600"></div>
                  )}
                <Link
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 hover-scale",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary-foreground" : "text-gray-400 dark:text-gray-500"
                    )}
                  />
                  <span className={cn(
                    "transition-opacity duration-200",
                    !isOpen && "md:opacity-0"
                  )}>
                    {item.name}
                  </span>
                </Link>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
