import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CropModal } from "@/components/CropModal";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { 
  Crop, 
  CropInput, 
  getCropsWithCategories, 
  createCrop, 
  updateCrop, 
  deleteCrop,
  getFormattedImageUrl
} from "@/lib/cropService";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CropWithCategory extends Crop {
  crop_categories: {
    name: string;
  };
}

const Crops = () => {
  const [crops, setCrops] = useState<CropWithCategory[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking auth status:", error);
          setAuthError("Failed to check authentication status");
          setIsAuthenticated(false);
          return;
        }
        
        setIsAuthenticated(!!data.session);
        if (!data.session) {
          setAuthError("You need to be signed in to create, edit, or delete crops");
        }
      } catch (err) {
        console.error("Error in auth check:", err);
        setAuthError("Failed to check authentication status");
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const fetchCrops = async () => {
    setIsLoading(true);
    try {
      const data = await getCropsWithCategories();
      setCrops(data);
    } catch (error) {
      console.error("Error fetching crops:", error);
      toast({
        title: "Error",
        description: "Failed to load crops",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const filteredCrops = crops.filter((crop) =>
    crop.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateCrop = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to create crops",
        variant: "destructive",
      });
      return;
    }
    setSelectedCrop(null);
    setIsModalOpen(true);
  };

  const handleEditCrop = (crop: Crop) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to edit crops",
        variant: "destructive",
      });
      return;
    }
    setSelectedCrop(crop);
    setIsModalOpen(true);
  };

  const handleDeleteCrop = (crop: Crop) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to delete crops",
        variant: "destructive",
      });
      return;
    }
    setSelectedCrop(crop);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCrop = async (cropData: CropInput, imageFile?: File) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to save crops",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      if (selectedCrop) {
        // Update existing crop
        await updateCrop(selectedCrop.id, cropData, imageFile);
        toast({
          title: "Success",
          description: "Crop updated successfully",
        });
      } else {
        // Create new crop
        await createCrop(cropData, imageFile);
        toast({
          title: "Success",
          description: "Crop created successfully",
        });
      }
      // Refresh the crops list
      await fetchCrops();
    } catch (error: any) {
      console.error("Error saving crop:", error);
      
      // Provide more specific error messages
      let errorMessage = `Failed to ${selectedCrop ? "update" : "create"} crop`;
      
      if (error.message?.includes("violates row-level security policy")) {
        errorMessage = "Permission denied. Make sure you're signed in with the correct account.";
      } else if (error.code === "42501") {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error.code === "23505") {
        errorMessage = "A crop with this name already exists.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCrop) return;
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to delete crops",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      await deleteCrop(selectedCrop.id);
      toast({
        title: "Success",
        description: "Crop deleted successfully",
      });
      // Refresh the crops list
      await fetchCrops();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting crop:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to delete crop";
      
      if (error.message?.includes("violates row-level security policy")) {
        errorMessage = "Permission denied. Make sure you're signed in with the correct account.";
      } else if (error.code === "42501") {
        errorMessage = "You don't have permission to perform this action.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {authError && (
              <Alert variant="warning" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Authentication Warning</AlertTitle>
                <AlertDescription>
                  {authError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Crops</h1>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={handleCreateCrop}
                disabled={isAuthenticated === false}
              >
                <Plus className="h-5 w-5 mr-2" />
                CREATE NEW CROP
              </Button>
            </div>
            <div className="mb-6">
              <SearchBar 
                value={search} 
                onChange={setSearch} 
              />
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredCrops.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">
                        No crops found
                      </td>
                    </tr>
                  ) : (
                    filteredCrops.map((crop) => (
                      <tr key={crop.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {crop.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={getFormattedImageUrl(crop.image_url) || "/placeholder.svg"}
                            alt={crop.name}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              console.log(`Image failed to load: ${crop.image_url}`);
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {crop.crop_categories?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primary hover:text-primary-foreground hover:bg-primary"
                              onClick={() => handleEditCrop(crop)}
                              disabled={isAuthenticated === false}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                              onClick={() => handleDeleteCrop(crop)}
                              disabled={isAuthenticated === false}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {filteredCrops.length > 0 ? `1-${filteredCrops.length} of ${filteredCrops.length}` : "0 items"}
                  </span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                      disabled
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                      disabled
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Crop Modal */}
      <CropModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCrop}
        crop={selectedCrop || undefined}
        title={selectedCrop ? "Edit Crop" : "Create New Crop"}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Crop"
        description={`Are you sure you want to delete ${selectedCrop?.name}? This action cannot be undone.`}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default Crops;
