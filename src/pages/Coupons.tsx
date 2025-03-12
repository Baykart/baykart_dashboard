import { useState, useEffect } from 'react';
import { Coupon, getAllCoupons } from '../lib/couponService';
import CouponCard from '../components/CouponCard';
import CouponForm from '../components/CouponForm';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Plus, Search } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    filterCoupons();
  }, [coupons, searchQuery, statusFilter, activeTab]);

  const fetchCoupons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (err) {
      setError('Failed to fetch coupons');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCoupons = () => {
    let filtered = [...coupons];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        coupon => 
          coupon.code.toLowerCase().includes(query) || 
          (coupon.description && coupon.description.toLowerCase().includes(query))
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      const now = new Date();
      
      if (statusFilter === 'active') {
        filtered = filtered.filter(
          coupon => 
            coupon.is_active && 
            new Date(coupon.start_date) <= now && 
            new Date(coupon.end_date) >= now
        );
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(
          coupon => !coupon.is_active
        );
      } else if (statusFilter === 'expired') {
        filtered = filtered.filter(
          coupon => new Date(coupon.end_date) < now
        );
      } else if (statusFilter === 'upcoming') {
        filtered = filtered.filter(
          coupon => new Date(coupon.start_date) > now
        );
      }
    }
    
    // Filter by tab
    if (activeTab === 'amount') {
      filtered = filtered.filter(coupon => coupon.discount_amount !== null);
    } else if (activeTab === 'percentage') {
      filtered = filtered.filter(coupon => coupon.discount_percentage !== null);
    }
    
    setFilteredCoupons(filtered);
  };

  const handleAddCoupon = () => {
    setSelectedCoupon(undefined);
    setIsDialogOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon.id !== id));
  };

  const handleStatusChange = (id: string, isActive: boolean) => {
    setCoupons(prevCoupons => 
      prevCoupons.map(coupon => 
        coupon.id === id ? { ...coupon, is_active: isActive } : coupon
      )
    );
  };

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    fetchCoupons();
  };

  const handleFormCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto py-6 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Coupons</h1>
              <Button onClick={handleAddCoupon}>
                <Plus className="mr-2 h-4 w-4" />
                Add Coupon
              </Button>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search coupons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Coupons</TabsTrigger>
                <TabsTrigger value="amount">Fixed Amount</TabsTrigger>
                <TabsTrigger value="percentage">Percentage</TabsTrigger>
              </TabsList>
            </Tabs>

            <Separator className="mb-6" />

            {isLoading ? (
              <div className="text-center py-10">Loading coupons...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : filteredCoupons.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || activeTab !== 'all'
                  ? 'No coupons match your filters'
                  : 'No coupons found. Create your first coupon!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onEdit={handleEditCoupon}
                    onDelete={handleDeleteCoupon}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                  </DialogTitle>
                </DialogHeader>
                <CouponForm
                  coupon={selectedCoupon}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Coupons; 