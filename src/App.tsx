import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
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
import { Agriservices } from "./pages/Agriservices";
import FeedReports from "./pages/FeedReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/feeds" element={<Feeds />} />
              <Route path="/feed_reports" element={<FeedReports />} />
              <Route path="/farmers" element={<Farmers />} />
              <Route path="/government-schemes" element={<GovernmentSchemes />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/crop-care" element={<CropCare />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/events" element={<Events />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/groups" element={<CommunityChannels />} />
              <Route path="/agriservices" element={<Agriservices />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
