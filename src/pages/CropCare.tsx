import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Loader2, Search, Grid3X3, List, Star, Package, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  cropcareService,
  CropCareProduct,
  CropCareCategory
} from "@/lib/cropcareService";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';

const CropCare = () => {
  const [products, setProducts] = useState<CropCareProduct[]>([]);
  const [categories, setCategories] = useState<CropCareCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CropCareProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: '',
    stock_quantity: 0,
    category: '',
    brand: '',
    vendor_phone: '',
    vendor_email: '',
    vendor_address: '',
    usage_instructions: '',
    safety_warnings: '',
    image_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await cropcareService.getCategories();
      setCategories(response.results);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await cropcareService.getProducts();
      setProducts(response.results);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For now, we'll create products without category and vendor for testing
      // These will be added when the sample data script runs
      const productData = {
        ...formData,
        stock_quantity: parseInt(formData.stock_quantity.toString()),
        category: null, // Will be set when categories are available
        brand: formData.brand, // Keep as string for business name
        vendor: null, // Will be set when vendors are available
      };

      if (editingProduct) {
        await cropcareService.updateProduct(editingProduct.id, productData);
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        await cropcareService.createProduct(productData);
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        unit: '',
        stock_quantity: 0,
        category: '',
        brand: '',
        vendor_phone: '',
        vendor_email: '',
        vendor_address: '',
        usage_instructions: '',
        safety_warnings: '',
        image_url: ''
      });
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (product: CropCareProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      stock_quantity: product.stock_quantity,
      category: product.category_name,
      brand: product.brand,
      vendor_phone: product.vendor_phone || '',
      vendor_email: product.vendor_email || '',
      vendor_address: product.vendor_address || '',
      usage_instructions: product.usage_instructions || '',
      safety_warnings: product.safety_warnings || '',
      image_url: product.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await cropcareService.deleteProduct(id);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_name === selectedCategory;
    const matchesVendor = selectedVendor === 'all' || product.vendor_name === selectedVendor;
    return matchesSearch && matchesCategory && matchesVendor;
  });

  const uniqueCategories = [...new Set(products.map(p => p.category_name).filter(Boolean))];
  const uniqueVendors = [...new Set(products.map(p => p.vendor_name).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchProducts}>Try Again</Button>
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
        <div className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Crop Care Products</h1>
                <p className="text-gray-600 mt-2">Manage agricultural products and supplies</p>
              </div>
              <Button onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  unit: '',
                  stock_quantity: 0,
                  category: '',
                  brand: '',
                  vendor_phone: '',
                  vendor_email: '',
                  vendor_address: '',
                  usage_instructions: '',
                  safety_warnings: '',
                  image_url: ''
                });
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Vendors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vendors</SelectItem>
                        {uniqueVendors.map(vendor => (
                          <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4 mr-2" />
                      List
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No products found</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
              </CardHeader>
              <CardContent>
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                          )}
                          <p className="text-gray-600 text-sm mb-3">
                            {product.description}
                          </p>
                          <div className="space-y-2">
                                                         <div className="flex justify-between items-center">
                               <span className="text-sm text-gray-500">Price:</span>
                               <span className="font-semibold text-green-600">D{product.price}</span>
                             </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Unit:</span>
                              <span className="text-sm">{product.unit}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Stock:</span>
                              <span className="text-sm">{product.stock_quantity}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Category:</span>
                              <Badge variant="secondary">{product.category_name || 'No Category'}</Badge>
                            </div>
                                                               <div className="flex justify-between items-center">
                                     <span className="text-sm text-gray-500">Vendor:</span>
                                     <span className="text-sm">{product.vendor_name || 'No Vendor'}</span>
                                   </div>
                                   {product.vendor_phone && (
                                     <div className="flex justify-between items-center">
                                       <span className="text-sm text-gray-500">Phone:</span>
                                       <span className="text-sm">{product.vendor_phone}</span>
                                     </div>
                                   )}
                                   {product.vendor_address && (
                                     <div className="flex justify-between items-center">
                                       <span className="text-sm text-gray-500">Location:</span>
                                       <span className="text-sm">{product.vendor_address}</span>
                                     </div>
                                   )}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Rating:</span>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm ml-1">{product.average_rating}</span>
                                <span className="text-xs text-gray-500 ml-1">({product.rating_count})</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold">{product.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {product.description}
                                </p>
                                                                                                        <div className="flex items-center space-x-4 mt-2">
                                         <span className="text-sm text-gray-500">D{product.price} per {product.unit}</span>
                                         <span className="text-sm text-gray-500">Stock: {product.stock_quantity}</span>
                                         <Badge variant="secondary">{product.category_name || 'No Category'}</Badge>
                                         <span className="text-sm text-gray-500">{product.vendor_name || 'No Vendor'}</span>
                                         {product.vendor_phone && (
                                           <span className="text-sm text-gray-500">📞 {product.vendor_phone}</span>
                                         )}
                                         {product.vendor_address && (
                                           <span className="text-sm text-gray-500">📍 {product.vendor_address}</span>
                                         )}
                                       </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
              </CardContent>
            </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dialog for Add/Edit Product */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="e.g., kg, liter, piece"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock_quantity">Stock Quantity</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                        placeholder="0"
                        required
                      />
                    </div>
                                         <div>
                       <Label htmlFor="category">Category</Label>
                       <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                         <SelectTrigger>
                           <SelectValue placeholder="Select category" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="Seeds">Seeds</SelectItem>
                           <SelectItem value="Agro Chemicals">Agro Chemicals</SelectItem>
                           <SelectItem value="Crop Protection">Crop Protection</SelectItem>
                           <SelectItem value="Equipment">Equipment</SelectItem>
                           <SelectItem value="Other Products">Other Products</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                                               <div>
                             <Label htmlFor="brand">Business Name</Label>
                             <Input
                               id="brand"
                               value={formData.brand}
                               onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                               placeholder="Enter your business name"
                               required
                             />
                           </div>
                           <div>
                             <Label htmlFor="vendor_phone">Contact Phone</Label>
                             <Input
                               id="vendor_phone"
                               value={formData.vendor_phone}
                               onChange={(e) => setFormData({ ...formData, vendor_phone: e.target.value })}
                               placeholder="Enter contact phone number"
                               required
                             />
                           </div>
                           <div>
                             <Label htmlFor="vendor_email">Contact Email</Label>
                             <Input
                               id="vendor_email"
                               type="email"
                               value={formData.vendor_email}
                               onChange={(e) => setFormData({ ...formData, vendor_email: e.target.value })}
                               placeholder="Enter contact email"
                               required
                             />
                           </div>
                           <div>
                             <Label htmlFor="vendor_address">Location/Address</Label>
                             <Input
                               id="vendor_address"
                               value={formData.vendor_address}
                               onChange={(e) => setFormData({ ...formData, vendor_address: e.target.value })}
                               placeholder="Enter your location or address"
                               required
                             />
                           </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter product description"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="usage_instructions">Usage Instructions</Label>
                    <Textarea
                      id="usage_instructions"
                      value={formData.usage_instructions}
                      onChange={(e) => setFormData({ ...formData, usage_instructions: e.target.value })}
                      placeholder="Enter usage instructions"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="safety_warnings">Safety Warnings</Label>
                    <Textarea
                      id="safety_warnings"
                      value={formData.safety_warnings}
                      onChange={(e) => setFormData({ ...formData, safety_warnings: e.target.value })}
                      placeholder="Enter safety warnings"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">Image URL (optional)</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      type="url"
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">
                      {editingProduct ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropCare; 