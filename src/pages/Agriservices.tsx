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
import { Plus, Search, Filter, Eye, Edit, Trash2, MapPin, Phone, Calendar, CheckCircle, XCircle, Truck, Snowflake, Wrench, User, Shield, Droplets, Package, Settings } from "lucide-react";
import * as agriServicesService from "@/lib/agriServicesService";

const AgriServices = () => {
  // State management
  const [agriServices, setAgriServices] = useState<agriServicesService.AgriService[]>([]);
  const [stats, setStats] = useState<agriServicesService.AgriServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<agriServicesService.AgriService | null>(null);
  const [viewingService, setViewingService] = useState<agriServicesService.AgriService | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "", category: "transport", description: "", location: "", coverage_area: "",
    contact_info: "", pricing_notes: "", availability: "", image_url: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "", category: "transport", description: "", location: "", coverage_area: "",
    contact_info: "", pricing_notes: "", availability: "", image_url: "",
  });

  // Fetch data on component mount
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, statsRes] = await Promise.all([
        agriServicesService.getAgriServices(),
        agriServicesService.getAgriServiceStats(),
      ]);
      setAgriServices(servicesRes.results || []);
      setStats(statsRes);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load agri services data");
    } finally {
      setLoading(false);
    }
  };

  // Filter services
  const filteredServices = agriServices.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || service.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && service.is_active) ||
                         (selectedStatus === "verified" && service.is_verified);

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agriServicesService.addAgriService(formData);
      toast.success("Agri service added successfully");
      setIsDialogOpen(false);
      setFormData({
        name: "", category: "transport", description: "", location: "", coverage_area: "",
        contact_info: "", pricing_notes: "", availability: "", image_url: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Failed to add agri service");
    }
  };

  // Handle edit
  const handleEdit = (service: agriServicesService.AgriService) => {
    setEditingService(service);
    setEditFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      location: service.location,
      coverage_area: service.coverage_area,
      contact_info: service.contact_info,
      pricing_notes: service.pricing_notes,
      availability: service.availability,
      image_url: service.image_url || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle edit submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    
    try {
      await agriServicesService.updateAgriService(editingService.id, editFormData);
      toast.success("Agri service updated successfully");
      setIsEditDialogOpen(false);
      setEditingService(null);
      fetchData();
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Failed to update agri service");
    }
  };

  // Handle view
  const handleView = (service: agriServicesService.AgriService) => {
    setViewingService(service);
    setIsViewDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await agriServicesService.deleteAgriService(id);
      toast.success("Agri service deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete agri service");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setSelectedStatus("all");
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      transport: <Truck className="w-4 h-4" />,
      cold_storage: <Snowflake className="w-4 h-4" />,
      machinery: <Wrench className="w-4 h-4" />,
      agronomist: <User className="w-4 h-4" />,
      crop_insurance: <Shield className="w-4 h-4" />,
      borehole: <Droplets className="w-4 h-4" />,
      storage: <Package className="w-4 h-4" />,
      other: <Settings className="w-4 h-4" />,
    };
    return icons[category] || <Settings className="w-4 h-4" />;
  };

  // Get unique categories and locations for filters
  const categories = [...new Set(agriServices.map(service => service.category))];
  const locations = [...new Set(agriServices.map(service => service.location))];

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading agri services...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Agri Services</h1>
                <p className="text-gray-600">Manage agricultural services and value chain providers</p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_services}</div>
                    <p className="text-xs text-muted-foreground">Agricultural services</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.active_services}</div>
                    <p className="text-xs text-muted-foreground">Currently available</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Verified Services</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.verified_services}</div>
                    <p className="text-xs text-muted-foreground">Quality assured</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.category_stats.length}</div>
                    <p className="text-xs text-muted-foreground">Service types</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ').toUpperCase()}
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
                    <Label htmlFor="status">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
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

            {/* Agri Services Table */}
            <Card>
              <CardHeader>
                <CardTitle>Agri Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{getCategoryIcon(service.category)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{service.name}</div>
                                <div className="text-sm text-gray-500">{service.coverage_area}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{service.category_display}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{service.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{service.contact_info}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {service.is_active ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Inactive
                                </Badge>
                              )}
                              {service.is_verified && (
                                <Badge variant="outline" className="border-blue-200 text-blue-800">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline" size="sm" onClick={() => handleView(service)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline" size="sm" onClick={() => handleEdit(service)}>
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
                                    <AlertDialogTitle>Delete Agri Service</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this agri service? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(service.id)}>
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

          {/* Add Agri Service Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Agri Service</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="cold_storage">Cold Storage</SelectItem>
                        <SelectItem value="machinery">Machinery</SelectItem>
                        <SelectItem value="agronomist">Agronomist</SelectItem>
                        <SelectItem value="crop_insurance">Crop Insurance</SelectItem>
                        <SelectItem value="borehole">Borehole</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="coverage_area">Coverage Area</Label>
                    <Input
                      id="coverage_area"
                      value={formData.coverage_area}
                      onChange={(e) => setFormData({...formData, coverage_area: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_info">Contact Info</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing_notes">Pricing Notes</Label>
                    <Input
                      id="pricing_notes"
                      value={formData.pricing_notes}
                      onChange={(e) => setFormData({...formData, pricing_notes: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL (Optional)</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Service</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Agri Service Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Agri Service</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Service Name</Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={editFormData.category} onValueChange={(value) => setEditFormData({...editFormData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="cold_storage">Cold Storage</SelectItem>
                        <SelectItem value="machinery">Machinery</SelectItem>
                        <SelectItem value="agronomist">Agronomist</SelectItem>
                        <SelectItem value="crop_insurance">Crop Insurance</SelectItem>
                        <SelectItem value="borehole">Borehole</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <textarea
                    id="edit-description"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-coverage_area">Coverage Area</Label>
                    <Input
                      id="edit-coverage_area"
                      value={editFormData.coverage_area}
                      onChange={(e) => setEditFormData({...editFormData, coverage_area: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-contact_info">Contact Info</Label>
                    <Input
                      id="edit-contact_info"
                      value={editFormData.contact_info}
                      onChange={(e) => setEditFormData({...editFormData, contact_info: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-pricing_notes">Pricing Notes</Label>
                    <Input
                      id="edit-pricing_notes"
                      value={editFormData.pricing_notes}
                      onChange={(e) => setEditFormData({...editFormData, pricing_notes: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-availability">Availability</Label>
                  <Input
                    id="edit-availability"
                    value={editFormData.availability}
                    onChange={(e) => setEditFormData({...editFormData, availability: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-image_url">Image URL (Optional)</Label>
                  <Input
                    id="edit-image_url"
                    type="url"
                    value={editFormData.image_url}
                    onChange={(e) => setEditFormData({...editFormData, image_url: e.target.value})}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Service</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* View Agri Service Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agri Service Details</DialogTitle>
              </DialogHeader>
              {viewingService && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>{getCategoryIcon(viewingService.category)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{viewingService.name}</h3>
                      <p className="text-sm text-gray-500">{viewingService.category_display}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Description</Label>
                    <p className="text-sm text-gray-600 mt-1">{viewingService.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Location</Label>
                      <p className="text-sm text-gray-600 mt-1">{viewingService.location}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Coverage Area</Label>
                      <p className="text-sm text-gray-600 mt-1">{viewingService.coverage_area}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Contact Info</Label>
                      <p className="text-sm text-gray-600 mt-1">{viewingService.contact_info}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Availability</Label>
                      <p className="text-sm text-gray-600 mt-1">{viewingService.availability}</p>
                    </div>
                  </div>
                  {viewingService.pricing_notes && (
                    <div>
                      <Label className="font-medium">Pricing Notes</Label>
                      <p className="text-sm text-gray-600 mt-1">{viewingService.pricing_notes}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    {viewingService.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    {viewingService.is_verified && (
                      <Badge variant="outline" className="border-blue-200 text-blue-800">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Submitted by: {viewingService.submitted_by_name} on {new Date(viewingService.date_submitted).toLocaleDateString()}
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

export default AgriServices; 