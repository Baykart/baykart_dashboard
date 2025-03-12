import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crop, CropInput, getFormattedImageUrl } from "@/lib/cropService";
import { Category, getCategories } from "@/lib/categoryService";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (crop: CropInput, imageFile?: File) => Promise<void>;
  crop?: Crop;
  title: string;
}

export const CropModal = ({ isOpen, onClose, onSave, crop, title }: CropModalProps) => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, [toast]);

  useEffect(() => {
    if (crop) {
      setName(crop.name);
      setCategoryId(crop.category_id);
      setImagePreview(crop.image_url ? getFormattedImageUrl(crop.image_url) : null);
    } else {
      setName("");
      setCategoryId("");
      setImagePreview(null);
      setImageFile(null);
    }
  }, [crop, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Crop name is required",
        variant: "destructive",
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: "Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const cropData: CropInput = {
        name,
        category_id: categoryId,
        image_url: crop?.image_url || null,
      };
      
      await onSave(cropData, imageFile || undefined);
      
      toast({
        title: "Success",
        description: `Crop ${crop ? "updated" : "created"} successfully`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving crop:", error);
      toast({
        title: "Error",
        description: `Failed to ${crop ? "update" : "create"} crop`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {crop ? "Edit the details of this crop." : "Add a new crop to your inventory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <div className="col-span-3">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                <div className="text-xs text-amber-600 flex items-center mt-1 mb-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Note: Image upload may not work if storage permissions aren't configured.
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-md"
                      onError={(e) => {
                        console.log(`Image preview failed to load: ${imagePreview}`);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 