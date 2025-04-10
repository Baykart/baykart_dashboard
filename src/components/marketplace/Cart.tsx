import { useState, useEffect } from "react";
import { 
  Sheet,
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/marketplace";
import { Minus, Plus, Trash2, ShoppingCart, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  onCheckout: () => void;
}

export const Cart = ({
  isOpen,
  onClose,
  cartItems,
  updateItemQuantity,
  removeItem,
  clearCart,
  onCheckout
}: CartProps) => {
  const [subtotal, setSubtotal] = useState(0);
  
  useEffect(() => {
    // Calculate subtotal whenever cart items change
    const newSubtotal = cartItems.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );
    setSubtotal(newSubtotal);
  }, [cartItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR', // Replace with your currency
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = cartItems.find(item => item.product.id === productId)?.product;
    
    if (!product) return;
    
    // Make sure the new quantity is within stock limits
    const limitedQuantity = Math.min(
      Math.max(1, newQuantity), // Minimum 1
      product.stock_quantity // Maximum is available stock
    );
    
    updateItemQuantity(productId, limitedQuantity);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Your Cart
          </SheetTitle>
          <SheetDescription>
            {cartItems.length === 0
              ? "Your cart is empty"
              : `You have ${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-10">
            <Package className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg font-semibold mb-2">Your cart is empty</p>
            <p className="text-sm text-gray-500 mb-6">Add some products to your cart to get started.</p>
            <SheetClose asChild>
              <Button>Continue Shopping</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 my-6 -mx-6 px-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-start">
                    <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="font-medium line-clamp-1">{item.product.name}</div>
                      <div className="text-sm text-gray-500 my-1">
                        {formatPrice(item.product.price)} per unit
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) {
                                handleQuantityChange(item.product.id, val);
                              }
                            }}
                            className="w-12 h-8 text-center border-0 focus-visible:ring-0 p-0"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock_quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="font-medium">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="mt-auto">
              <Separator className="-mx-6" />
              <div className="py-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between py-2">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
                </div>
              </div>
              
              <SheetFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
                <Button 
                  className="w-full" 
                  onClick={onCheckout}
                >
                  Checkout
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}; 