import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2 } from "lucide-react";
import { AgriServiceCategory } from "@/types/feeds";
import { getAgriServiceCategories } from "@/lib/services/feeds";
import { useToast } from "@/hooks/use-toast";

interface AgriServiceCategoriesProps {
  onEdit: (category: AgriServiceCategory) => void;
  onDelete: (category: AgriServiceCategory) => void;
}

export function AgriServiceCategories({
  onEdit,
  onDelete,
}: AgriServiceCategoriesProps) {
  const [categories, setCategories] = useState<AgriServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getAgriServiceCategories();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Agri Service Categories</CardTitle>
        <Button
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => {
            // TODO: Implement category creation dialog
            toast({
              title: "Coming Soon",
              description: "Category creation will be implemented soon",
            });
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-500">{category.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary hover:text-primary-foreground hover:bg-primary"
                  onClick={() => onEdit(category)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  onClick={() => onDelete(category)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 