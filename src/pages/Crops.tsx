import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { farmingService, FarmingCrop, FarmingCropCategory } from '@/lib/farmingService';
import { LoadingSpinner } from '@/components/ui/loading';
import { Plus, Edit, Trash2, Search, Filter, Grid3X3, List, Star, Package, Calendar } from 'lucide-react';

const Crops = () => {
  const [crops, setCrops] = useState<FarmingCrop[]>([]);
  const [categories, setCategories] = useState<FarmingCropCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<FarmingCrop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    icon_url: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cropsResponse, categoriesResponse] = await Promise.all([
        farmingService.getCrops(),
        farmingService.getCropCategories()
      ]);
      setCrops(cropsResponse.results);
      setCategories(categoriesResponse.results);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cropData = {
        ...formData,
      };

      if (editingCrop) {
        await farmingService.updateCrop(editingCrop.id, cropData);
        toast({
          title: 'Success',
          description: 'Crop updated successfully',
        });
      } else {
        await farmingService.createCrop(cropData);
        toast({
          title: 'Success',
          description: 'Crop created successfully',
        });
      }
      setIsDialogOpen(false);
      setEditingCrop(null);
      setFormData({
        name: '',
        category: '',
        icon_url: '',
      });
      fetchData();
    } catch (err) {
      console.error('Error saving crop:', err);
      toast({
        title: 'Error',
        description: 'Failed to save crop',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (crop: FarmingCrop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      category: crop.category,
      icon_url: crop.icon_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;
    
    try {
      await farmingService.deleteCrop(id);
      toast({
        title: 'Success',
        description: 'Crop deleted successfully',
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting crop:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete crop',
        variant: 'destructive',
      });
    }
  };

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <LoadingSpinner size="lg" className="mx-auto mb-4" />
                  <p className="text-gray-600">Loading crops...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchData}>Retry</Button>
              </div>
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Crops</h1>
                <p className="text-gray-600 mt-2">Manage crops and seeds in the marketplace</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingCrop(null);
                    setFormData({
                      name: '',
                      category: '',
                      icon_url: '',
                    });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Crop
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCrop ? 'Edit Crop' : 'Add New Crop'}
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
                          placeholder="Enter crop name"
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
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="icon_url">Icon URL (optional)</Label>
                      <Input
                        id="icon_url"
                        value={formData.icon_url}
                        onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                        placeholder="e.g., https://example.com/icon.png"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingCrop ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search crops..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="grains">Grains</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="legumes">Legumes</SelectItem>
                      <SelectItem value="tubers">Tubers</SelectItem>
                      <SelectItem value="cash_crops">Cash Crops</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products */}
            {filteredCrops.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Package className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No crops found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedCategory ? 'Try adjusting your filters.' : 'Get started by adding your first crop.'}
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredCrops.map((crop) => (
                  <Card key={crop.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{crop.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{crop.category_display}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(crop)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(crop.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {crop.icon_url && (
                        <div className="mb-3">
                          <img
                            src={crop.icon_url}
                            alt={crop.name}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-green-600">{crop.category_display}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Created: {new Date(crop.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Crops;
