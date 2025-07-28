import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Plus, Search, Filter, Eye, Edit, Trash2, TrendingUp, TrendingDown, Minus, DollarSign, MapPin, Calendar, BarChart3 } from "lucide-react";
import * as marketPricesService from "@/lib/marketPricesService";

const MarketPrices = () => {
  // State management
  const [marketPrices, setMarketPrices] = useState<marketPricesService.MarketPrice[]>([]);
  const [stats, setStats] = useState<marketPricesService.MarketPriceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedTrend, setSelectedTrend] = useState("all");
  const [selectedMarketType, setSelectedMarketType] = useState("all");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<marketPricesService.MarketPrice | null>(null);
  const [viewingPrice, setViewingPrice] = useState<marketPricesService.MarketPriceDetail | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    crop_name: "",
    location: "",
    district: "",
    village: "",
    price: "",
    currency: "D",
    price_unit: "kg",
    previous_price: "",
    market_type: "retail",
    season: "off_peak",
    source: "",
    notes: "",
  });

  const [editFormData, setEditFormData] = useState({
    crop_name: "",
    location: "",
    district: "",
    village: "",
    price: "",
    currency: "D",
    price_unit: "kg",
    previous_price: "",
    market_type: "retail",
    season: "off_peak",
    source: "",
    notes: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pricesRes, statsRes] = await Promise.all([
        marketPricesService.getMarketPrices(),
        marketPricesService.getMarketPriceStats(),
      ]);
      setMarketPrices(pricesRes.results || []);
      setStats(statsRes);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load market prices data");
    } finally {
      setLoading(false);
    }
  };

  // Filter market prices
  const filteredPrices = marketPrices.filter((price) => {
    const matchesSearch = price.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         price.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (price.district && price.district.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCrop = selectedCrop === "all" || price.crop_name === selectedCrop;
    const matchesLocation = selectedLocation === "all" || price.location === selectedLocation;
    const matchesTrend = selectedTrend === "all" || price.trend === selectedTrend;
    const matchesMarketType = selectedMarketType === "all" || price.market_type === selectedMarketType;
    
    return matchesSearch && matchesCrop && matchesLocation && matchesTrend && matchesMarketType;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const priceData = {
        ...formData,
        price: parseFloat(formData.price),
        previous_price: formData.previous_price ? parseFloat(formData.previous_price) : undefined,
      };
      await marketPricesService.addMarketPrice(priceData);
      toast.success("Market price added successfully");
      setIsDialogOpen(false);
      setFormData({
        crop_name: "", location: "", district: "", village: "",
        price: "", currency: "D", price_unit: "kg", previous_price: "",
        market_type: "retail", season: "off_peak", source: "", notes: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error adding market price:", error);
      toast.error("Failed to add market price");
    }
  };

  // Handle edit
  const handleEdit = (price: marketPricesService.MarketPrice) => {
    setEditingPrice(price);
    setEditFormData({
      crop_name: price.crop_name,
      location: price.location,
      district: price.district || "",
      village: price.village || "",
      price: price.price.toString(),
      currency: price.currency,
      price_unit: price.price_unit,
      previous_price: price.previous_price?.toString() || "",
      market_type: price.market_type,
      season: price.season,
      source: price.source || "",
      notes: price.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrice) return;
    
    try {
      const priceData = {
        ...editFormData,
        price: parseFloat(editFormData.price),
        previous_price: editFormData.previous_price ? parseFloat(editFormData.previous_price) : undefined,
      };
      await marketPricesService.updateMarketPrice(editingPrice.id, priceData);
      toast.success("Market price updated successfully");
      setIsEditDialogOpen(false);
      setEditingPrice(null);
      fetchData();
    } catch (error) {
      console.error("Error updating market price:", error);
      toast.error("Failed to update market price");
    }
  };

  // Handle view
  const handleView = async (price: marketPricesService.MarketPrice) => {
    try {
      const detail = await marketPricesService.getMarketPrice(price.id);
      setViewingPrice(detail);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Error fetching price details:", error);
      toast.error("Failed to load price details");
    }
  };

  // Handle delete
  const handleDelete = async (priceId: string) => {
    try {
      await marketPricesService.deleteMarketPrice(priceId);
      toast.success("Market price deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting market price:", error);
      toast.error("Failed to delete market price");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCrop("all");
    setSelectedLocation("all");
    setSelectedTrend("all");
    setSelectedMarketType("all");
  };

  // Get unique values for filters
  const crops = [...new Set(marketPrices.map(price => price.crop_name))];
  const locations = [...new Set(marketPrices.map(price => price.location))];

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading market prices...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Market Prices</h1>
                <p className="text-gray-600">Track and manage crop prices across different markets</p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Price
              </Button>
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Prices</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_prices}</div>
                    <p className="text-xs text-muted-foreground">Market price records</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Crops</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_crops}</div>
                    <p className="text-xs text-muted-foreground">Different crop types</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_locations}</div>
                    <p className="text-xs text-muted-foreground">Market locations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.recent_prices}</div>
                    <p className="text-xs text-muted-foreground">Last 7 days</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search crops, locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crop">Crop</Label>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                      <SelectTrigger>
                        <SelectValue placeholder="All crops" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All crops</SelectItem>
                        {crops.map((crop) => (
                          <SelectItem key={crop} value={crop}>
                            {crop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All locations</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trend">Trend</Label>
                    <Select value={selectedTrend} onValueChange={setSelectedTrend}>
                      <SelectTrigger>
                        <SelectValue placeholder="All trends" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All trends</SelectItem>
                        <SelectItem value="up">Up</SelectItem>
                        <SelectItem value="down">Down</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="market_type">Market Type</Label>
                    <Select value={selectedMarketType} onValueChange={setSelectedMarketType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="farm_gate">Farm Gate</SelectItem>
                        <SelectItem value="export">Export</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Market Prices Table */}
            <Card>
              <CardHeader>
                <CardTitle>Market Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Crop</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Market Type</TableHead>
                        <TableHead>Season</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrices.map((price) => (
                        <TableRow key={price.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{price.crop_icon}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{price.crop_name}</div>
                                {price.district && (
                                  <div className="text-sm text-gray-500">{price.district}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{price.location}</div>
                            {price.village && (
                              <div className="text-xs text-gray-500">{price.village}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-green-600">
                              {price.formatted_price}
                            </div>
                            {price.previous_price && (
                              <div className="text-xs text-gray-500">
                                Prev: {price.currency}{price.previous_price}/{price.price_unit}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTrendIcon(price.trend)}
                              <span className={`text-sm ${getTrendColor(price.trend)}`}>
                                {price.formatted_percentage_change}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{price.market_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{price.season}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(price.date).toLocaleDateString()}</div>
                            {price.is_verified && (
                              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                Verified
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(price)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(price)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Market Price</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this market price? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(price.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Market Price Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Market Price</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="crop_name">Crop Name *</Label>
                    <Input
                      id="crop_name"
                      value={formData.crop_name}
                      onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                      placeholder="e.g., Rice, Maize, Groundnut"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Brikama, Basse, Banjul"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="District name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="village">Village</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      placeholder="Village name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price (D) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_unit">Unit</Label>
                    <Select value={formData.price_unit} onValueChange={(value) => setFormData({ ...formData, price_unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="bag">bag</SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                        <SelectItem value="liter">liter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="previous_price">Previous Price</Label>
                    <Input
                      id="previous_price"
                      type="number"
                      step="0.01"
                      value={formData.previous_price}
                      onChange={(e) => setFormData({ ...formData, previous_price: e.target.value })}
                      placeholder="Previous price"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="market_type">Market Type</Label>
                    <Select value={formData.market_type} onValueChange={(value) => setFormData({ ...formData, market_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="farm_gate">Farm Gate</SelectItem>
                        <SelectItem value="export">Export</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="season">Season</Label>
                    <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peak">Peak Season</SelectItem>
                        <SelectItem value="off_peak">Off Season</SelectItem>
                        <SelectItem value="harvest">Harvest Season</SelectItem>
                        <SelectItem value="planting">Planting Season</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="Source of price information"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Price</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Market Price Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Market Price</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_crop_name">Crop Name *</Label>
                    <Input
                      id="edit_crop_name"
                      value={editFormData.crop_name}
                      onChange={(e) => setEditFormData({ ...editFormData, crop_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_location">Location *</Label>
                    <Input
                      id="edit_location"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_district">District</Label>
                    <Input
                      id="edit_district"
                      value={editFormData.district}
                      onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_village">Village</Label>
                    <Input
                      id="edit_village"
                      value={editFormData.village}
                      onChange={(e) => setEditFormData({ ...editFormData, village: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit_price">Price (D) *</Label>
                    <Input
                      id="edit_price"
                      type="number"
                      step="0.01"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_price_unit">Unit</Label>
                    <Select value={editFormData.price_unit} onValueChange={(value) => setEditFormData({ ...editFormData, price_unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="bag">bag</SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                        <SelectItem value="liter">liter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit_previous_price">Previous Price</Label>
                    <Input
                      id="edit_previous_price"
                      type="number"
                      step="0.01"
                      value={editFormData.previous_price}
                      onChange={(e) => setEditFormData({ ...editFormData, previous_price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_market_type">Market Type</Label>
                    <Select value={editFormData.market_type} onValueChange={(value) => setEditFormData({ ...editFormData, market_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="farm_gate">Farm Gate</SelectItem>
                        <SelectItem value="export">Export</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit_season">Season</Label>
                    <Select value={editFormData.season} onValueChange={(value) => setEditFormData({ ...editFormData, season: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peak">Peak Season</SelectItem>
                        <SelectItem value="off_peak">Off Season</SelectItem>
                        <SelectItem value="harvest">Harvest Season</SelectItem>
                        <SelectItem value="planting">Planting Season</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit_source">Source</Label>
                  <Input
                    id="edit_source"
                    value={editFormData.source}
                    onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_notes">Notes</Label>
                  <Input
                    id="edit_notes"
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Price</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* View Market Price Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Market Price Details</DialogTitle>
              </DialogHeader>
              {viewingPrice && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="text-2xl">{viewingPrice.crop_icon}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{viewingPrice.crop_name}</h3>
                      <p className="text-gray-600">{viewingPrice.location}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Current Price</Label>
                      <p className="text-2xl font-bold text-green-600">{viewingPrice.formatted_price}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Price Change</Label>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(viewingPrice.trend)}
                        <span className={`text-lg font-semibold ${getTrendColor(viewingPrice.trend)}`}>
                          {viewingPrice.formatted_percentage_change}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Market Type</Label>
                      <Badge variant="outline">{viewingPrice.market_type}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Season</Label>
                      <Badge variant="outline">{viewingPrice.season}</Badge>
                    </div>
                  </div>
                  
                  {viewingPrice.district && (
                    <div>
                      <Label className="text-sm font-medium">District</Label>
                      <p className="text-gray-700">{viewingPrice.district}</p>
                    </div>
                  )}
                  
                  {viewingPrice.village && (
                    <div>
                      <Label className="text-sm font-medium">Village</Label>
                      <p className="text-gray-700">{viewingPrice.village}</p>
                    </div>
                  )}
                  
                  {viewingPrice.source && (
                    <div>
                      <Label className="text-sm font-medium">Source</Label>
                      <p className="text-gray-700">{viewingPrice.source}</p>
                    </div>
                  )}
                  
                  {viewingPrice.notes && (
                    <div>
                      <Label className="text-sm font-medium">Notes</Label>
                      <p className="text-gray-700">{viewingPrice.notes}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Date</Label>
                      <p className="text-gray-700">{new Date(viewingPrice.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="flex items-center space-x-2">
                        {viewingPrice.is_verified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default MarketPrices; 