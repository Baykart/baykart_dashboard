import { useState } from "react";
import { 
  Card,
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/marketplace";
import { ExternalLink, Edit, Trash2 } from "lucide-react";

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
  isSeller?: boolean;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export const ProductList = ({
  products,
  isLoading = false,
  isSeller = false,
  onEditProduct,
  onDeleteProduct,
  onViewProduct
}: ProductListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
            </CardHeader>
            <CardFooter>
              <div className="h-10 bg-gray-200 rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-gray-500">There are no products available at the moment.</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR', // Replace with your currency
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden flex flex-col">
          <div 
            className="aspect-square bg-gray-100 cursor-pointer overflow-hidden"
            onClick={() => onViewProduct?.(product)}
          >
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
          
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold line-clamp-1">{product.name}</CardTitle>
              {product.status !== 'available' && (
                <Badge variant={product.status === 'sold_out' ? 'destructive' : 'secondary'}>
                  {product.status === 'sold_out' ? 'Sold Out' : 'Archived'}
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2 h-10">
              {product.description || 'No description available'}
            </CardDescription>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-bold text-lg">{formatPrice(product.price)}</span>
              <span className="text-sm text-gray-500">
                {product.stock_quantity > 0 
                  ? `${product.stock_quantity} in stock` 
                  : 'Out of stock'}
              </span>
            </div>
            {product.category && (
              <Badge variant="outline" className="mt-2">
                {product.category}
              </Badge>
            )}
          </CardHeader>
          
          <CardFooter className="p-4 pt-2 mt-auto">
            {isSeller ? (
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEditProduct?.(product)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  onClick={() => onDeleteProduct?.(product)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            ) : (
              <div className="w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => onViewProduct?.(product)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}; 