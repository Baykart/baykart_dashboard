import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/types/marketplace";
import { getUserAddresses } from "@/services/addressService";
import { OrderInput, Address } from "@/types/marketplace";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, CreditCard, Package, Check, Plus } from "lucide-react";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onCompleteCheckout: (orderData: OrderInput) => Promise<void>;
  onAddNewAddress: () => void;
}

const checkoutSchema = z.object({
  shipping_method: z.enum(["standard", "express"]),
  payment_method: z.enum(["card", "cod"]),
  address_id: z.string().optional(),
  shipping_name: z.string().min(1, "Name is required").optional(),
  shipping_phone: z.string().min(10, "Valid phone number is required").optional(),
  shipping_address_line1: z.string().min(1, "Address is required").optional(),
  shipping_address_line2: z.string().optional(),
  shipping_city: z.string().min(1, "City is required").optional(),
  shipping_state: z.string().min(1, "State is required").optional(),
  shipping_pincode: z.string().min(6, "Valid pincode is required").optional(),
  notes: z.string().optional(),
})
.refine(data => {
  // If address_id is not provided, all shipping fields are required
  if (!data.address_id) {
    return !!data.shipping_name && 
           !!data.shipping_phone && 
           !!data.shipping_address_line1 && 
           !!data.shipping_city && 
           !!data.shipping_state && 
           !!data.shipping_pincode;
  }
  return true;
}, {
  message: "Please select an address or fill in all shipping details",
  path: ["address_id"]
});

export const Checkout = ({
  isOpen,
  onClose,
  cartItems,
  onCompleteCheckout,
  onAddNewAddress
}: CheckoutProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addressTab, setAddressTab] = useState<"existing" | "new">("existing");
  
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );
  
  const shippingCost = 0; // Free shipping for now, could be calculated based on items/location
  const totalAmount = subtotal + shippingCost;

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_method: "standard",
      payment_method: "cod",
      address_id: "",
      shipping_name: "",
      shipping_phone: "",
      shipping_address_line1: "",
      shipping_address_line2: "",
      shipping_city: "",
      shipping_state: "",
      shipping_pincode: "",
      notes: ""
    }
  });

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const userAddresses = await getUserAddresses('current');
        setAddresses(userAddresses);
        
        // If there's a default address, select it automatically
        const defaultAddress = userAddresses.find(addr => addr.is_default);
        if (defaultAddress) {
          form.setValue('address_id', defaultAddress.id);
        } else if (userAddresses.length > 0) {
          form.setValue('address_id', userAddresses[0].id);
        }
        
        // If no addresses are available, switch to the new address tab
        if (userAddresses.length === 0) {
          setAddressTab("new");
        }
      } catch (error) {
        console.error("Error loading addresses:", error);
      }
    };
    
    if (isOpen) {
      loadAddresses();
    }
  }, [isOpen, form]);

  const handleAddressSelect = (addressId: string) => {
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      form.setValue('shipping_name', selectedAddress.name);
      form.setValue('shipping_phone', selectedAddress.phone);
      form.setValue('shipping_address_line1', selectedAddress.address_line1);
      form.setValue('shipping_address_line2', selectedAddress.address_line2 || "");
      form.setValue('shipping_city', selectedAddress.city);
      form.setValue('shipping_state', selectedAddress.state);
      form.setValue('shipping_pincode', selectedAddress.pincode);
    }
  };

  const handleSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    setIsLoading(true);
    try {
      // Prepare order items data
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity
      }));
      
      // Prepare shipping address string for display
      let shippingAddress = '';
      if (values.address_id && addresses.length > 0) {
        const selectedAddress = addresses.find(addr => addr.id === values.address_id);
        if (selectedAddress) {
          shippingAddress = `${selectedAddress.address_line1}, ${selectedAddress.address_line2 ? selectedAddress.address_line2 + ', ' : ''}${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`;
        }
      } else {
        shippingAddress = `${values.shipping_address_line1}, ${values.shipping_address_line2 ? values.shipping_address_line2 + ', ' : ''}${values.shipping_city}, ${values.shipping_state} - ${values.shipping_pincode}`;
      }

      // Create order data
      const orderData: OrderInput = {
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        shipping_address_id: values.address_id,
        shipping_name: values.shipping_name,
        shipping_phone: values.shipping_phone,
        shipping_address_line1: values.shipping_address_line1,
        shipping_address_line2: values.shipping_address_line2,
        shipping_city: values.shipping_city,
        shipping_state: values.shipping_state,
        shipping_pincode: values.shipping_pincode,
        notes: values.notes,
        status: 'pending',
        payment_status: values.payment_method === 'cod' ? 'pending' : 'pending' // If payment gateway is implemented, this would be handled differently
      };

      await onCompleteCheckout(orderData);
      onClose();
    } catch (error) {
      console.error("Error completing checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR', // Replace with your currency
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Complete your purchase by providing the necessary information.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Order Summary */}
              <div>
                <h3 className="text-base font-semibold mb-2">Order Summary</h3>
                <div className="rounded-md border overflow-hidden">
                  <div className="bg-gray-50 p-3 text-sm font-medium flex justify-between">
                    <span>Item</span>
                    <span>Total</span>
                  </div>
                  <div className="p-3 space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden mr-3">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium line-clamp-1">{item.product.name}</div>
                            <div className="text-xs text-gray-500">
                              {formatPrice(item.product.price)} x {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-base font-semibold mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Shipping Address
                </h3>
                
                <Tabs value={addressTab} onValueChange={(value) => setAddressTab(value as "existing" | "new")}>
                  <TabsList className="mb-4">
                    <TabsTrigger 
                      value="existing" 
                      disabled={addresses.length === 0}
                    >
                      Use Saved Address
                    </TabsTrigger>
                    <TabsTrigger value="new">
                      Enter New Address
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="existing">
                    {addresses.length > 0 ? (
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="address_id"
                          render={({ field }) => (
                            <FormItem>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {addresses.map((address) => (
                                  <div 
                                    key={address.id}
                                    className={`border rounded-md p-3 cursor-pointer relative ${field.value === address.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                                    onClick={() => {
                                      field.onChange(address.id);
                                      handleAddressSelect(address.id);
                                    }}
                                  >
                                    {address.is_default && (
                                      <div className="absolute top-2 right-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        Default
                                      </div>
                                    )}
                                    <div className="font-medium mb-1">{address.name}</div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p>{address.address_line1}</p>
                                      {address.address_line2 && <p>{address.address_line2}</p>}
                                      <p>{address.city}, {address.state} - {address.pincode}</p>
                                      <p>Phone: {address.phone}</p>
                                    </div>
                                    {field.value === address.id && (
                                      <div className="absolute bottom-2 right-2 text-primary">
                                        <Check className="h-5 w-5" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                                <div 
                                  className="border border-dashed rounded-md p-3 flex flex-col items-center justify-center h-[150px] cursor-pointer"
                                  onClick={() => {
                                    setAddressTab("new");
                                  }}
                                >
                                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                                  <p className="text-sm font-medium">Add New Address</p>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 mb-3">No saved addresses found.</p>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            onAddNewAddress();
                            onClose();
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Address
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="new">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="shipping_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shipping_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="shipping_address_line1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 1</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="shipping_address_line2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 2 (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Apartment, suite, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="shipping_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shipping_state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shipping_pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter pincode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Shipping Method */}
              <div>
                <h3 className="text-base font-semibold mb-2 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Shipping Method
                </h3>
                <FormField
                  control={form.control}
                  name="shipping_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-3"
                        >
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="standard" id="standard" />
                            <div className="grid flex-1 gap-1">
                              <label
                                htmlFor="standard"
                                className="font-medium leading-none cursor-pointer"
                              >
                                Standard Shipping (Free)
                              </label>
                              <p className="text-sm text-gray-500">
                                Delivery in 5-7 business days
                              </p>
                            </div>
                            <span className="font-semibold">Free</span>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="express" id="express" disabled />
                            <div className="grid flex-1 gap-1">
                              <label
                                htmlFor="express"
                                className="font-medium leading-none cursor-pointer"
                              >
                                Express Shipping
                              </label>
                              <p className="text-sm text-gray-500">
                                Delivery in 2-3 business days (Coming soon)
                              </p>
                            </div>
                            <span className="font-semibold">{formatPrice(100)}</span>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-base font-semibold mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Method
                </h3>
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-3"
                        >
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="cod" id="cod" />
                            <div className="grid flex-1 gap-1">
                              <label
                                htmlFor="cod"
                                className="font-medium leading-none cursor-pointer"
                              >
                                Cash on Delivery
                              </label>
                              <p className="text-sm text-gray-500">
                                Pay when you receive your order
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="card" id="card" disabled />
                            <div className="grid flex-1 gap-1">
                              <label
                                htmlFor="card"
                                className="font-medium leading-none cursor-pointer"
                              >
                                Credit/Debit Card
                              </label>
                              <p className="text-sm text-gray-500">
                                Secure online payment (Coming soon)
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Order Notes */}
              <div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any special instructions or notes for your order"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(handleSubmit)} 
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : `Complete Order (${formatPrice(totalAmount)})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 