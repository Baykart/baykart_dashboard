import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Plus, Search, Filter, Eye, Edit, Trash2, Package, DollarSign, Users, TrendingUp, Camera, X } from "lucide-react";
import * as marketplaceService from "@/lib/marketplaceService";

const Marketplace = () => {
  // State management
  const [products, setProducts] = useState<marketplaceService.MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<marketplaceService.MarketplaceCategory[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<marketplaceService.MarketplaceProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<marketplaceService.MarketplaceProduct | null>(null);

  // Image states
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>([]);
  
  // Edit image states
  const [editMainImage, setEditMainImage] = useState<File | null>(null);
  const [editMainImageUrl, setEditMainImageUrl] = useState<string>('');
  const [editAdditionalImages, setEditAdditionalImages] = useState<File[]>([]);
  const [editAdditionalImageUrls, setEditAdditionalImageUrls] = useState<string[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    location: "",
    quantity_available: 1,
    unit: "piece",
    condition: "good",
    contact_phone: "",
    contact_email: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    location: "",
    quantity_available: 1,
    unit: "piece",
    condition: "good",
    contact_phone: "",
    contact_email: "",
  });

  // Image handling functions
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImageUrl(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdditionalImages(prev => [...prev, ...files]);
    const newUrls = files.map(file => URL.createObjectURL(file));
    setAdditionalImageUrls(prev => [...prev, ...newUrls]);
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditMainImage(file);
      setEditMainImageUrl(URL.createObjectURL(file));
    }
  };

  const handleEditAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditAdditionalImages(prev => [...prev, ...files]);
    const newUrls = files.map(file => URL.createObjectURL(file));
    setEditAdditionalImageUrls(prev => [...prev, ...newUrls]);
  };

  const removeEditAdditionalImage = (index: number) => {
    setEditAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setEditAdditionalImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const resetImageStates = () => {
    setMainImage(null);
    setMainImageUrl('');
    setAdditionalImages([]);
    setAdditionalImageUrls([]);
    setEditMainImage(null);
    setEditMainImageUrl('');
    setEditAdditionalImages([]);
    setEditAdditionalImageUrls([]);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, statsRes] = await Promise.all([
        marketplaceService.getMarketplaceProducts(),
        marketplaceService.getMarketplaceCategories(),
        marketplaceService.getMarketplaceStats(),
      ]);
      setProducts(productsRes.results || []);
      setCategories(categoriesRes.results || []);
      setStats(statsRes);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load marketplace data");
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.seller_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_name === selectedCategory;
    const matchesLocation = selectedLocation === "all" || product.location === selectedLocation;
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity_available: parseInt(formData.quantity_available.toString()),
        main_image: mainImageUrl,
        additional_images: additionalImageUrls,
      };
      await marketplaceService.addMarketplaceProduct(productData);
      toast.success("Product added successfully");
      setIsDialogOpen(false);
      setFormData({
        name: "", description: "", price: "", category: "", location: "",
        quantity_available: 1, unit: "piece", condition: "good",
        contact_phone: "", contact_email: "",
      });
      resetImageStates();
      fetchData();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  // Handle edit
  const handleEdit = (product: marketplaceService.MarketplaceProduct) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category_name,
      location: product.location,
      quantity_available: product.quantity_available,
      unit: product.unit,
      condition: product.condition,
      contact_phone: product.contact_phone || "",
      contact_email: product.contact_email || "",
    });
    setEditMainImageUrl(product.main_image || '');
    setEditAdditionalImageUrls(product.additional_images || []);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      const productData = {
        ...editFormData,
        price: parseFloat(editFormData.price),
        quantity_available: parseInt(editFormData.quantity_available.toString()),
        main_image: editMainImageUrl,
        additional_images: editAdditionalImageUrls,
      };
      await marketplaceService.updateMarketplaceProduct(editingProduct.id, productData);
      toast.success("Product updated successfully");
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetImageStates();
      fetchData();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  // Handle view
  const handleView = (product: marketplaceService.MarketplaceProduct) => {
    setViewingProduct(product);
    setIsViewDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    try {
      await marketplaceService.deleteMarketplaceProduct(productId);
      toast.success("Product deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setSelectedStatus("all");
    setSelectedPriceRange("all");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading marketplace...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-600">Browse and manage products listed by farmers</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold">{stats?.total_products || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active Listings</p>
                    <p className="text-2xl font-bold">{stats?.active_products || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Verified Products</p>
                    <p className="text-2xl font-bold">{stats?.verified_products || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Featured</p>
                    <p className="text-2xl font-bold">{stats?.featured_products || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.isArray(categories) && categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Banjul">Banjul</SelectItem>
                      <SelectItem value="Kanifing">Kanifing</SelectItem>
                      <SelectItem value="Brikama">Brikama</SelectItem>
                      <SelectItem value="Mansa Konko">Mansa Konko</SelectItem>
                      <SelectItem value="Kerewan">Kerewan</SelectItem>
                      <SelectItem value="Kuntaur">Kuntaur</SelectItem>
                      <SelectItem value="Janjanbureh">Janjanbureh</SelectItem>
                      <SelectItem value="Basse">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Products ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={product.main_image || ""} alt={product.name} />
                              <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                {product.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-green-600">
                            D{product.price}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.quantity_available} {product.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{product.location}</div>
                          {product.district && (
                            <div className="text-xs text-gray-500">{product.district}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{product.seller_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {product.status === "active" ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            ) : product.status === "sold" ? (
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                Sold
                              </Badge>
                            ) : (
                              <Badge variant="outline">{product.status}</Badge>
                            )}
                            {product.is_verified && (
                              <Badge variant="default" className="bg-purple-100 text-purple-800">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(product)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
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
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {product.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(product.id)}>
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

          {/* Add Product Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to the marketplace. Fill in all required fields and upload images.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Main Image Upload */}
                <div>
                  <Label>Main Product Image *</Label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24 border-4 border-gray-200">
                          <AvatarImage src={mainImageUrl} alt="Main product image" />
                          <AvatarFallback className="text-2xl">
                            {formData.name.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <label htmlFor="main_image" className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 cursor-pointer hover:bg-green-700 transition-colors">
                          <Camera className="w-4 h-4" />
                        </label>
                        <input 
                          id="main_image" 
                          name="main_image"
                          type="file" 
                          accept="image/*" 
                          onChange={handleMainImageChange} 
                          className="hidden" 
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tap to add main product image</p>
                        {mainImageUrl && (
                          <p className="text-xs text-green-600">Image selected ✓</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Images Upload */}
                <div>
                  <Label>Additional Images (Optional)</Label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-4">
                      <label htmlFor="additional_images" className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm">Add more images</span>
                      </label>
                      <input 
                        id="additional_images" 
                        name="additional_images"
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleAdditionalImagesChange} 
                        className="hidden" 
                      />
                    </div>
                    {additionalImageUrls.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {additionalImageUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={url} alt={`Additional image ${index + 1}`} />
                              <AvatarFallback>{index + 1}</AvatarFallback>
                            </Avatar>
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                     
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (D) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Enter price in Dalasi"
                     
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                   
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(categories) && categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Banjul">Banjul</SelectItem>
                        <SelectItem value="Kanifing">Kanifing</SelectItem>
                        <SelectItem value="Brikama">Brikama</SelectItem>
                        <SelectItem value="Mansa Konko">Mansa Konko</SelectItem>
                        <SelectItem value="Kerewan">Kerewan</SelectItem>
                        <SelectItem value="Kuntaur">Kuntaur</SelectItem>
                        <SelectItem value="Janjanbureh">Janjanbureh</SelectItem>
                        <SelectItem value="Basse">Basse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity Available *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity_available}
                      onChange={(e) => setFormData({ ...formData, quantity_available: parseInt(e.target.value) || 1 })}
                      placeholder="Enter quantity"
                     
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="bag">Bag</SelectItem>
                        <SelectItem value="bundle">Bundle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like_new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="Enter contact phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="Enter contact email"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Product Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Main Image Upload */}
                <div>
                  <Label>Main Product Image *</Label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24 border-4 border-gray-200">
                          <AvatarImage src={editMainImageUrl} alt="Main product image" />
                          <AvatarFallback className="text-2xl">
                            {editFormData.name.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <label htmlFor="edit_main_image" className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 cursor-pointer hover:bg-green-700 transition-colors">
                          <Camera className="w-4 h-4" />
                        </label>
                        <input 
                          id="edit_main_image" name="edit_main_image" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleEditMainImageChange} 
                          className="hidden" 
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tap to change main product image</p>
                        {editMainImageUrl && (
                          <p className="text-xs text-green-600">Image selected ✓</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Images Upload */}
                <div>
                  <Label>Additional Images (Optional)</Label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-4">
                      <label htmlFor="edit_additional_images" className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm">Add more images</span>
                      </label>
                      <input 
                        id="edit_additional_images" name="edit_additional_images" 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleEditAdditionalImagesChange} 
                        className="hidden" 
                      />
                    </div>
                    {editAdditionalImageUrls.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {editAdditionalImageUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={url} alt={`Additional image ${index + 1}`} />
                              <AvatarFallback>{index + 1}</AvatarFallback>
                            </Avatar>
                            <button
                              type="button"
                              onClick={() => removeEditAdditionalImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_name">Product Name *</Label>
                    <Input
                      id="edit_name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                     
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_price">Price (D) *</Label>
                    <Input
                      id="edit_price"
                      type="number"
                      step="0.01"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                     
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit_description">Description *</Label>
                  <Input
                    id="edit_description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                   
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_category">Category *</Label>
                    <Select value={editFormData.category} onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(categories) && categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit_location">Location *</Label>
                    <Select value={editFormData.location} onValueChange={(value) => setEditFormData({ ...editFormData, location: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Banjul">Banjul</SelectItem>
                        <SelectItem value="Kanifing">Kanifing</SelectItem>
                        <SelectItem value="Brikama">Brikama</SelectItem>
                        <SelectItem value="Mansa Konko">Mansa Konko</SelectItem>
                        <SelectItem value="Kerewan">Kerewan</SelectItem>
                        <SelectItem value="Kuntaur">Kuntaur</SelectItem>
                        <SelectItem value="Janjanbureh">Janjanbureh</SelectItem>
                        <SelectItem value="Basse">Basse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit_quantity">Quantity Available *</Label>
                    <Input
                      id="edit_quantity"
                      type="number"
                      value={editFormData.quantity_available}
                      onChange={(e) => setEditFormData({ ...editFormData, quantity_available: parseInt(e.target.value) || 1 })}
                     
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_unit">Unit</Label>
                    <Select value={editFormData.unit} onValueChange={(value) => setEditFormData({ ...editFormData, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="bag">Bag</SelectItem>
                        <SelectItem value="bundle">Bundle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit_condition">Condition</Label>
                    <Select value={editFormData.condition} onValueChange={(value) => setEditFormData({ ...editFormData, condition: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like_new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_contact_phone">Contact Phone</Label>
                    <Input
                      id="edit_contact_phone"
                      value={editFormData.contact_phone}
                      onChange={(e) => setEditFormData({ ...editFormData, contact_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_contact_email">Contact Email</Label>
                    <Input
                      id="edit_contact_email"
                      type="email"
                      value={editFormData.contact_email}
                      onChange={(e) => setEditFormData({ ...editFormData, contact_email: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* View Product Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Product Details</DialogTitle>
              </DialogHeader>
              {viewingProduct && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={viewingProduct.main_image || ""} alt={viewingProduct.name} />
                      <AvatarFallback className="text-2xl">{viewingProduct.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{viewingProduct.name}</h3>
                      <p className="text-gray-600">{viewingProduct.seller_name}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{viewingProduct.category_name}</Badge>
                        {viewingProduct.is_verified && (
                          <Badge variant="default" className="bg-purple-100 text-purple-800">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Price</Label>
                      <p className="text-green-600 font-semibold text-lg">D{viewingProduct.price}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Quantity</Label>
                      <p className="text-gray-600">{viewingProduct.quantity_available} {viewingProduct.unit}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Condition</Label>
                      <p className="text-gray-600 capitalize">{viewingProduct.condition}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Location</Label>
                      <p className="text-gray-600">{viewingProduct.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-medium">Description</Label>
                    <p className="text-gray-600">{viewingProduct.description}</p>
                  </div>
                  
                  {(viewingProduct.contact_phone || viewingProduct.contact_email) && (
                    <div>
                      <Label className="font-medium">Contact Information</Label>
                      <div className="space-y-1">
                        {viewingProduct.contact_phone && (
                          <p className="text-gray-600">Phone: {viewingProduct.contact_phone}</p>
                        )}
                        {viewingProduct.contact_email && (
                          <p className="text-gray-600">Email: {viewingProduct.contact_email}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Views</Label>
                      <p className="text-gray-600">{viewingProduct.views_count}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Favorites</Label>
                      <p className="text-gray-600">{viewingProduct.favorites_count}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Created</Label>
                      <p className="text-gray-600">{new Date(viewingProduct.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Last Updated</Label>
                      <p className="text-gray-600">{new Date(viewingProduct.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Marketplace; 