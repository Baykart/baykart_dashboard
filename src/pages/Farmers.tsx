import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/SearchBar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User, Calendar, MapPin, Phone, Mail, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { farmersService, Farmer } from '@/lib/farmersService';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Farmers() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingFarmer, setViewingFarmer] = useState<Farmer | null>(null);

  // Form data for new farmer
  const [formData, setFormData] = useState({
    first_name: '',
    age: 0,
    phone_number: '',
    email: '',
    password: '',
    region: ''
  });

  // Edit form data
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    region: '',
    district: '',
    village: '',
    address: '',
    years_of_farming: 0,
    education_level: '',
    farm_size: null as string | null,
    primary_crops: [] as string[],
    bio: '',
    is_verified: false,
    is_active: true
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await farmersService.getFarmers();
      setFarmers(response.results);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast.error('Failed to fetch farmers');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setProfilePictureUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const farmerData = {
        first_name: formData.first_name,
        last_name: '', // Set empty for simplified form
        phone_number: formData.phone_number,
        region: formData.region,
        district: formData.region, // Use region as district for simplicity
        village: formData.region, // Use region as village for simplicity
        address: `${formData.region}, The Gambia`,
        years_of_farming: 0, // Default value
        education_level: 'none', // Default value
        farm_size: null, // Default value
        primary_crops: [], // Default value
        profile_picture: profilePictureUrl, // Add profile picture URL
        user_data: {
          email: formData.email,
          password: formData.password
        }
      };
      await farmersService.createFarmer(farmerData);
      toast.success('Farmer created successfully');
      setIsDialogOpen(false);
      setFormData({
        first_name: '',
        age: 0,
        phone_number: '',
        email: '',
        password: '',
        region: ''
      });
      setProfilePicture(null);
      setProfilePictureUrl('');
      fetchFarmers();
    } catch (error) {
      console.error('Error creating farmer:', error);
      toast.error('Failed to create farmer');
    }
  };

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setEditFormData({
      first_name: farmer.first_name,
      last_name: farmer.last_name,
      phone_number: farmer.phone_number,
      region: farmer.region,
      district: farmer.district,
      village: farmer.village,
      address: farmer.address,
      years_of_farming: farmer.years_of_farming,
      education_level: farmer.education_level,
      farm_size: farmer.farm_size,
      primary_crops: farmer.primary_crops || [],
      bio: farmer.bio || '',
      is_verified: farmer.is_verified,
      is_active: farmer.is_active
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarmer) return;

    try {
      await farmersService.updateFarmer(editingFarmer.id, editFormData);
      toast.success('Farmer updated successfully');
      setIsEditDialogOpen(false);
      setEditingFarmer(null);
      fetchFarmers();
      } catch (error) {
      console.error('Error updating farmer:', error);
      toast.error('Failed to update farmer');
    }
  };

  const handleDelete = async (farmerId: string) => {
    try {
      await farmersService.deleteFarmer(farmerId);
      toast.success('Farmer deleted successfully');
      fetchFarmers();
    } catch (error) {
      console.error('Error deleting farmer:', error);
      toast.error('Failed to delete farmer');
    }
  };

  const handleView = (farmer: Farmer) => {
    setViewingFarmer(farmer);
    setIsViewDialogOpen(true);
  };

  // Filter farmers based on search and filters
  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.phone_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = selectedLocation === 'all' || farmer.region === selectedLocation;
    
    const matchesDateRange = selectedDateRange === 'all' || (() => {
      const farmerDate = new Date(farmer.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - farmerDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (selectedDateRange) {
        case 'today': return daysDiff === 0;
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'year': return daysDiff <= 365;
        default: return true;
      }
    })();

    const matchesAgeRange = selectedAgeRange === 'all' || (() => {
      const age = farmer.age || 0;
      switch (selectedAgeRange) {
        case '18-25': return age >= 18 && age <= 25;
        case '26-35': return age >= 26 && age <= 35;
        case '36-50': return age >= 36 && age <= 50;
        case '50+': return age > 50;
        default: return true;
      }
    })();

    const matchesStatus = selectedStatus === 'all' || (() => {
      switch (selectedStatus) {
        case 'verified': return farmer.is_verified;
        case 'unverified': return !farmer.is_verified;
        case 'active': return farmer.is_active;
        case 'inactive': return !farmer.is_active;
        default: return true;
      }
    })();

    return matchesSearch && matchesLocation && matchesDateRange && matchesAgeRange && matchesStatus;
  });

  const clearFilters = () => {
    setSelectedLocation('all');
    setSelectedDateRange('all');
    setSelectedAgeRange('all');
    setSelectedStatus('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
                <h1 className="text-3xl font-bold text-gray-900">Users (Farmers)</h1>
                <p className="text-gray-600 mt-2">Manage user accounts - all users are farmers by default</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Profile Setup</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24 border-4 border-gray-200">
                          <AvatarImage src={profilePictureUrl} alt="Profile" />
                          <AvatarFallback className="text-2xl">{formData.first_name.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <label htmlFor="profile_picture" className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 cursor-pointer hover:bg-green-700 transition-colors">
                          <Camera className="w-4 h-4" />
                        </label>
                        <input id="profile_picture" type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                      </div>
                      <p className="text-sm text-gray-600">Tap to add profile picture</p>
                    </div>

                    <div>
                      <Label htmlFor="first_name">Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                        placeholder="Enter your age"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone_number">Phone Number *</Label>
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="region">Location *</Label>
                      <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your location" />
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

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Done</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{farmers.length}</p>
                    </div>
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verified Users</p>
                      <p className="text-2xl font-bold text-green-600">
                        {farmers.filter(f => f.is_verified).length}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">✓</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New This Month</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {farmers.filter(f => {
                          const farmerDate = new Date(f.created_at);
                          const now = new Date();
                          const daysDiff = Math.floor((now.getTime() - farmerDate.getTime()) / (1000 * 60 * 60 * 24));
                          return daysDiff <= 30;
                        }).length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-green-600">
                        {farmers.filter(f => f.is_active).length}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">●</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Location" />
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

                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Joined Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedAgeRange} onValueChange={setSelectedAgeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Age Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="36-50">36-50</SelectItem>
                    <SelectItem value="50+">50+</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Farmers Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users ({filteredFarmers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                  {filteredFarmers.map((farmer) => (
                        <TableRow key={farmer.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={farmer.profile_picture || ''} alt={farmer.full_name} />
                                <AvatarFallback>{farmer.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{farmer.full_name}</div>
                                <div className="text-sm text-gray-500">{farmer.user_email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                {farmer.phone_number || 'N/A'}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="w-4 h-4 mr-2" />
                                {farmer.user_email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                {farmer.region}
                              </div>
                              <div className="text-sm text-gray-500">
                                {farmer.district}, {farmer.village}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                {farmer.is_verified ? (
                                  <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                                ) : (
                                  <Badge variant="outline">Unverified</Badge>
                                )}
                                {farmer.is_active ? (
                                  <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>
                                ) : (
                                  <Badge variant="outline">Inactive</Badge>
                                )}
                              </div>
                              {farmer.age && (
                                <div className="text-sm text-gray-500">Age: {farmer.age}</div>
                              )}
                          </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                          {new Date(farmer.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                                onClick={() => handleView(farmer)}
                          >
                                <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                                onClick={() => handleEdit(farmer)}
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
                                    <AlertDialogTitle>Delete Farmer</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {farmer.full_name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(farmer.id)}>
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

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Farmer Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_first_name">First Name</Label>
                      <Input
                        id="edit_first_name"
                        value={editFormData.first_name}
                        onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_last_name">Last Name</Label>
                      <Input
                        id="edit_last_name"
                        value={editFormData.last_name}
                        onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                        required
                      />
              </div>
            </div>

                  <div>
                    <Label htmlFor="edit_phone_number">Phone Number</Label>
                    <Input
                      id="edit_phone_number"
                      value={editFormData.phone_number}
                      onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                      required
                    />
          </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit_region">Region</Label>
                <Input
                        id="edit_region"
                        value={editFormData.region}
                        onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
                  required
                />
              </div>
                    <div>
                      <Label htmlFor="edit_district">District</Label>
                <Input
                        id="edit_district"
                        value={editFormData.district}
                        onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                  required
                />
              </div>
                    <div>
                      <Label htmlFor="edit_village">Village</Label>
                  <Input
                        id="edit_village"
                        value={editFormData.village}
                        onChange={(e) => setEditFormData({ ...editFormData, village: e.target.value })}
                        required
                  />
                </div>
                  </div>

                  <div>
                    <Label htmlFor="edit_address">Address</Label>
                  <Input
                      id="edit_address"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      required
                  />
                </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_years_of_farming">Years of Farming</Label>
                  <Input
                        id="edit_years_of_farming"
                    type="number"
                        value={editFormData.years_of_farming}
                        onChange={(e) => setEditFormData({ ...editFormData, years_of_farming: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_education_level">Education Level</Label>
                      <Select value={editFormData.education_level} onValueChange={(value) => setEditFormData({ ...editFormData, education_level: value })}>
                    <SelectTrigger>
                          <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                          <SelectItem value="none">No Formal Education</SelectItem>
                          <SelectItem value="primary">Primary School</SelectItem>
                          <SelectItem value="secondary">Secondary School</SelectItem>
                          <SelectItem value="tertiary">Tertiary Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  </div>

                  <div>
                    <Label htmlFor="edit_farm_size">Farm Size (hectares)</Label>
                    <Input
                      id="edit_farm_size"
                      type="number"
                      step="0.01"
                      value={editFormData.farm_size || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, farm_size: e.target.value || null })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit_bio">Bio</Label>
                <Input
                      id="edit_bio"
                      value={editFormData.bio}
                      onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit_is_verified"
                        checked={editFormData.is_verified}
                        onChange={(e) => setEditFormData({ ...editFormData, is_verified: e.target.checked })}
                      />
                      <Label htmlFor="edit_is_verified">Verified</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit_is_active"
                        checked={editFormData.is_active}
                        onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                      />
                      <Label htmlFor="edit_is_active">Active</Label>
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

            {/* View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Farmer Profile Details</DialogTitle>
                </DialogHeader>
                {viewingFarmer && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={viewingFarmer.profile_picture || ''} alt={viewingFarmer.full_name} />
                        <AvatarFallback className="text-2xl">{viewingFarmer.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{viewingFarmer.full_name}</h3>
                        <p className="text-gray-600">{viewingFarmer.user_email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {viewingFarmer.is_verified ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Unverified</Badge>
                          )}
                          {viewingFarmer.is_active ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium">Phone Number</Label>
                        <p className="text-gray-600">{viewingFarmer.phone_number || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Age</Label>
                        <p className="text-gray-600">{viewingFarmer.age || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Region</Label>
                        <p className="text-gray-600">{viewingFarmer.region}</p>
                      </div>
                      <div>
                        <Label className="font-medium">District</Label>
                        <p className="text-gray-600">{viewingFarmer.district}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Village</Label>
                        <p className="text-gray-600">{viewingFarmer.village}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Years of Farming</Label>
                        <p className="text-gray-600">{viewingFarmer.years_of_farming} years</p>
                      </div>
                      <div>
                        <Label className="font-medium">Education Level</Label>
                        <p className="text-gray-600">{viewingFarmer.education_level}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Farm Size</Label>
                        <p className="text-gray-600">{viewingFarmer.farm_size ? `${viewingFarmer.farm_size} hectares` : 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="font-medium">Address</Label>
                      <p className="text-gray-600">{viewingFarmer.address}</p>
                    </div>

                    {viewingFarmer.bio && (
                      <div>
                        <Label className="font-medium">Bio</Label>
                        <p className="text-gray-600">{viewingFarmer.bio}</p>
                      </div>
                    )}

                    {viewingFarmer.primary_crops && viewingFarmer.primary_crops.length > 0 && (
                      <div>
                        <Label className="font-medium">Primary Crops</Label>
                        <div className="flex flex-wrap gap-2">
                          {viewingFarmer.primary_crops.map((crop, index) => (
                            <Badge key={index} variant="outline">{crop}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium">Joined</Label>
                        <p className="text-gray-600">{new Date(viewingFarmer.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Last Updated</Label>
                        <p className="text-gray-600">{new Date(viewingFarmer.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
