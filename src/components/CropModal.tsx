import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crop, CropInput, CROP_CATEGORIES, getFormattedIconUrl } from "@/lib/cropService";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (crop: CropInput, iconFile?: File) => Promise<void>;
  crop?: Crop;
  title: string;
}

export const CropModal = ({ isOpen, onClose, onSave, crop, title }: CropModalProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (crop) {
      setName(crop.name);
      setCategory(crop.category);
      setIconPreview(crop.icon_url ? getFormattedIconUrl(crop.icon_url) : null);
    } else {
      setName("");
      setCategory("");
      setIconPreview(null);
      setIconFile(null);
    }
  }, [crop, isOpen]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
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

    if (!category) {
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
        category: category as any, // Type assertion for the enum
        icon_url: crop?.icon_url || null,
      };
      
      await onSave(cropData, iconFile || undefined);
      
      toast({
        title: "Success",
        description: `Crop ${crop ? "updated" : "created"} successfully`,
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error saving crop:", error);
      
      // Provide more specific error messages
      let errorMessage = `Failed to ${crop ? "update" : "create"} crop`;
      
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
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CROP_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <div className="col-span-3">
                <Input
                  id="icon"
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="mb-2"
                />
                <div className="text-xs text-amber-600 flex items-center mt-1 mb-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Note: Icon upload may not work if storage permissions aren't configured.
                </div>
                {iconPreview && (
                  <div className="mt-2">
                    <img
                      src={iconPreview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-md"
                      onError={(e) => {
                        console.log(`Icon preview failed to load: ${iconPreview}`);
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