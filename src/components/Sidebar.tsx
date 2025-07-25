import { Home, Grid, Leaf, Coffee, Users, Settings, Menu, FileText, UsersRound, Tag, Calendar, Film, FileBarChart, ShoppingBag, Sprout, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Crop Categories", href: "/categories", icon: Grid },
  { name: "Crops", href: "/crops", icon: Leaf },
  { name: "Feeds", href: "/feeds", icon: Coffee },
  { name: "Farmers", href: "/farmers", icon: Users },
  { name: "Government Schemes", href: "/government-schemes", icon: FileBarChart },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { name: "Market Prices", href: "/market-prices", icon: TrendingUp },
  { name: "Crop Care", href: "/crop-care", icon: Sprout },
  { name: "Coupons", href: "/coupons", icon: Tag },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Videos", href: "/videos", icon: Film },
  { name: "Articles", href: "/articles", icon: FileText },
  { name: "Community Channels", href: "/groups", icon: UsersRound },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Agri Services", href: "/agriservices", icon: UsersRound },
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
          isOpen ? "text-white" : "text-gray-700 bg-white shadow-md"
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
          "fixed md:static h-screen z-40 flex-none bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
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
              "text-xl font-semibold text-gray-700 transition-opacity duration-200",
              !isOpen && "md:opacity-0"
            )}>
              Baykart Dashboard
            </h2>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 hover-scale",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary-foreground" : "text-gray-400"
                    )}
                  />
                  <span className={cn(
                    "transition-opacity duration-200",
                    !isOpen && "md:opacity-0"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
            <NavLink
              to="/feeds"
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 hover-scale",
                location.pathname === "/feeds"
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Coffee className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className={cn(
                "transition-opacity duration-200",
                !isOpen && "md:opacity-0"
              )}>
                Feeds
              </span>
            </NavLink>
            <NavLink
              to="/feed_reports"
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 hover-scale",
                location.pathname === "/feed_reports"
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <FileBarChart className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className={cn(
                "transition-opacity duration-200",
                !isOpen && "md:opacity-0"
              )}>
                Feed Reports
              </span>
            </NavLink>
          </nav>
        </div>
      </div>
    </>
  );
}
