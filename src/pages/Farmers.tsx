import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { farmerService, Farmer } from "@/lib/farmerService";
import { supabase } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Farmers = () => {
  const [search, setSearch] = useState("");
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    age: "",
    location: "",
    farm_area: "",
    area_unit: "Acre",
    profile_image_url: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    try {
      setIsLoading(true);
      const data = await farmerService.getFarmers();
      setFarmers(data);
    } catch (error) {
      console.error("Error loading farmers:", error);
      toast({
        title: "Error",
        description: "Failed to load farmers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFarmers = farmers.filter((farmer) =>
    farmer.full_name.toLowerCase().includes(search.toLowerCase()) ||
    farmer.phone.includes(search)
  );

  const handleOpenDialog = (farmer?: Farmer) => {
    if (farmer) {
      setSelectedFarmer(farmer);
      setFormData({
        full_name: farmer.full_name,
        phone: farmer.phone,
        age: farmer.age?.toString() || "",
        location: farmer.location || "",
        farm_area: farmer.farm_area?.toString() || "",
        area_unit: farmer.area_unit || "Acre",
        profile_image_url: farmer.profile_image_url || "",
      });
    } else {
      setSelectedFarmer(null);
      setFormData({
        full_name: "",
        phone: "",
        age: "",
        location: "",
        farm_area: "",
        area_unit: "Acre",
        profile_image_url: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.full_name.trim() || !formData.phone.trim()) {
        toast({
          title: "Validation Error",
          description: "Name and phone number are required",
          variant: "destructive",
        });
        return;
      }

      const farmerData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        location: formData.location.trim() || undefined,
        farm_area: formData.farm_area ? parseFloat(formData.farm_area) : undefined,
        area_unit: formData.area_unit as "Acre" | "Hectare" || undefined,
        profile_image_url: formData.profile_image_url.trim() || undefined,
      };

      if (selectedFarmer) {
        await farmerService.updateFarmer(selectedFarmer.id, farmerData);
        toast({
          title: "Success",
          description: "Farmer updated successfully",
        });
      } else {
        await farmerService.createFarmer(farmerData);
        toast({
          title: "Success",
          description: "Farmer created successfully",
        });
      }
      setIsDialogOpen(false);
      loadFarmers();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: selectedFarmer ? "Failed to update farmer" : "Failed to create farmer",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (farmer: Farmer) => {
    if (confirm("Are you sure you want to delete this farmer?")) {
      try {
        await farmerService.deleteFarmer(farmer.id);
        toast({
          title: "Success",
          description: "Farmer deleted successfully",
        });
        loadFarmers();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete farmer",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, area_unit: value }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Farmers</h1>
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-5 w-5 mr-2" />
                ADD NEW FARMER
              </Button>
            </div>
            <div className="mb-6">
              <SearchBar value={search} onChange={setSearch} placeholder="Search by name or phone..." />
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center">Loading farmers...</div>
              ) : filteredFarmers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No farmers found</div>
              ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farmer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farm Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={farmer.profile_image_url || ""} alt={farmer.full_name} />
                              <AvatarFallback>{getInitials(farmer.full_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{farmer.full_name}</div>
                              {farmer.age && <div className="text-sm text-gray-500">{farmer.age} years</div>}
                            </div>
                          </div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {farmer.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {farmer.location || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {farmer.farm_area ? `${farmer.farm_area} ${farmer.area_unit}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(farmer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary hover:text-primary-foreground hover:bg-primary"
                            onClick={() => handleOpenDialog(farmer)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            onClick={() => handleDelete(farmer)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Showing {filteredFarmers.length} farmers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
          <DialogHeader>
              <DialogTitle>{selectedFarmer ? "Edit Farmer" : "Add New Farmer"}</DialogTitle>
            <DialogDescription>
                {selectedFarmer
                  ? "Update the farmer's information below."
                  : "Fill in the details to add a new farmer."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="full_name" className="text-right">
                    Full Name *
                  </Label>
                <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  required
                />
              </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone *
                  </Label>
                <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                  required
                />
              </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="age" className="text-right">
                    Age
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="farm_area" className="text-right">
                    Farm Area
                  </Label>
                  <Input
                    id="farm_area"
                    name="farm_area"
                    type="number"
                    step="0.01"
                    value={formData.farm_area}
                    onChange={handleInputChange}
                    className="col-span-2"
                  />
                  <Select
                    value={formData.area_unit}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Acre">Acre</SelectItem>
                      <SelectItem value="Hectare">Hectare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profile_image_url" className="text-right">
                    Profile Image URL
                  </Label>
                <Input
                    id="profile_image_url"
                    name="profile_image_url"
                    value={formData.profile_image_url}
                    onChange={handleInputChange}
                    className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              <Button type="submit">
                  {selectedFarmer ? "Update Farmer" : "Add Farmer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default Farmers;
