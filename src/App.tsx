import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import { DarkModeProvider } from "@/lib/DarkModeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import CropCategories from "./pages/CropCategories";
import Crops from "./pages/Crops";
import Feeds from "./pages/Feeds";
import Farmers from "./pages/Farmers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Articles } from "./pages/Articles";
import { CommunityChannels } from "./pages/CommunityChannels";
import Coupons from "./pages/Coupons";
import Events from "./pages/Events";
import { Videos } from "./pages/Videos";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import Marketplace from "./pages/Marketplace";
import CropCare from "./pages/CropCare";
import AgriServices from "./pages/AgriServices";
import Community from "./pages/Community";
import FeedReports from "./pages/FeedReports";
import MarketPrices from "./pages/MarketPrices";
import AuditLogs from "./pages/AuditLogs";
import TestPage from "./pages/TestPage";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DarkModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/test" element={<TestPage />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/crop-categories" element={<CropCategories />} />
                <Route path="/crop_categories" element={<CropCategories />} />
                  <Route path="/crops" element={<Crops />} />
                <Route path="/crop" element={<Crops />} />
                  <Route path="/feeds" element={<Feeds />} />
                  <Route path="/farmers" element={<Farmers />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/community-channels" element={<CommunityChannels />} />
                  <Route path="/coupons" element={<Coupons />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/government-schemes" element={<GovernmentSchemes />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/crop-care" element={<CropCare />} />
                  <Route path="/agriservices" element={<AgriServices />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/feed-reports" element={<FeedReports />} />
                <Route path="/feed_reports" element={<FeedReports />} />
                  <Route path="/market-prices" element={<MarketPrices />} />
                <Route path="/market_prices" element={<MarketPrices />} />
                  <Route path="/audit-logs" element={<AuditLogs />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DarkModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
