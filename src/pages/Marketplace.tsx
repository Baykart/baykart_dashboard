import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus, Package, User, MapPin, Settings, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { ProductList } from "@/components/marketplace/ProductList";
import { ProductForm } from "@/components/marketplace/ProductForm";
import { OrderList } from "@/components/marketplace/OrderList";
import { OrderDetails } from "@/components/marketplace/OrderDetails";
import { AddressForm } from "@/components/marketplace/AddressForm";

import { 
  getProducts, 
  getProductsByCategory, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  uploadProductImage 
} from "@/services/productService";

import { 
  getOrders, 
  getOrdersByBuyer, 
  getOrdersBySeller,
  getOrderById, 
  updateOrderStatus, 
  updatePaymentStatus, 
  cancelOrder 
} from "@/services/orderService";

import { addressService } from "@/services/addressService";

import { supabase } from "@/lib/supabase";
import {
  Product,
  OrderStatus,
  PaymentStatus,
  ProductInput,
  AddressInput,
  Order,
  Address
} from "@/types/marketplace";

const Marketplace = () => {
  // State for tabs and views
  const [activeTab, setActiveTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  // UI control states
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewingOrderDetails, setIsViewingOrderDetails] = useState(false);
  
  // Authentication state
  const [user, setUser] = useState<any>(null);
  
  const { toast } = useToast();

  // Load user data on mount
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUserData();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab, user, categoryFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      if (activeTab === "browse" || activeTab === "sell") {
        // Load products for the browse tab
        let productsData: Product[];
        
        if (categoryFilter) {
          productsData = await getProductsByCategory(categoryFilter);
        } else {
          productsData = await getProducts();
        }
        
        setProducts(productsData);
        
        // If the user is logged in and we're on the sell tab, load their products
        if (user && activeTab === "sell") {
          const myProductsData = await getProductsBySeller(user.id);
          setMyProducts(myProductsData);
        }
      }
      
      if (activeTab === "orders" && user) {
        // Load orders
        const ordersData = await getOrdersByBuyer(user.id);
        setMyOrders(ordersData);
        
        // If the user is a seller, also load orders for their products
        const sellerOrdersData = await getOrdersBySeller(user.id);
        setOrders(sellerOrdersData);
      }
      
      if (activeTab === "addresses" && user) {
        // Load addresses
        const addressesData = await addressService.getUserAddresses(user.id);
        setAddresses(addressesData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Product functions
  const handleAddProduct = async (productData: ProductInput, imageFiles: File[]) => {
    try {
      // First create the product
      const newProduct = await createProduct(productData);
      
      // Then upload images if any
      if (imageFiles.length > 0) {
        const imageUrls: string[] = [];
        
        for (const file of imageFiles) {
          const imageUrl = await uploadProductImage(file);
          imageUrls.push(imageUrl);
        }
        
        // Update the product with image URLs
        if (imageUrls.length > 0) {
          await updateProduct(newProduct.id, { images: imageUrls });
        }
      }
      
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      
      loadData();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (productId: string, productData: Partial<ProductInput>, imageFiles: File[]) => {
    try {
      // First update the product data
      await updateProduct(productId, productData);
      
      // Then upload new images if any
      if (imageFiles.length > 0) {
        const imageUrls: string[] = [];
        
        for (const file of imageFiles) {
          const imageUrl = await uploadProductImage(file);
          imageUrls.push(imageUrl);
        }
        
        // Update the product with image URLs
        if (imageUrls.length > 0) {
          const product = await getProductById(productId);
          const existingImages = product?.images || [];
          await updateProduct(productId, { images: [...existingImages, ...imageUrls] });
        }
      }
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      
      loadData();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        
        loadData();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  };

  // Order functions for viewing/monitoring only
  const handleViewOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // This will only update the displayed order status in the UI
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await getOrderById(orderId);
        setSelectedOrder(updatedOrder);
      }
      
      loadData();
    } catch (error) {
      console.error("Error viewing order status:", error);
      toast({
        title: "Error",
        description: "Failed to load order status",
        variant: "destructive",
      });
    }
  };

  const handleViewPaymentStatus = async (orderId: string, status: PaymentStatus) => {
    try {
      // This will only update the displayed payment status in the UI
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await getOrderById(orderId);
        setSelectedOrder(updatedOrder);
      }
      
      loadData();
    } catch (error) {
      console.error("Error viewing payment status:", error);
      toast({
        title: "Error",
        description: "Failed to load payment status",
        variant: "destructive",
      });
    }
  };

  // Address functions
  const handleAddAddress = async (addressData: AddressInput) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add an address",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Make sure the user_id is set
      const fullAddressData = {
        ...addressData,
        user_id: user.id
      };
      
      await addressService.createAddress(fullAddressData);
      
      toast({
        title: "Success",
        description: "Address added successfully",
      });
      
      loadData();
    } catch (error) {
      console.error("Error adding address:", error);
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await addressService.deleteAddress(addressId);
        
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });
        
        loadData();
      } catch (error) {
        console.error("Error deleting address:", error);
        toast({
          title: "Error",
          description: "Failed to delete address",
          variant: "destructive",
        });
      }
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredMyProducts = myProducts.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <div className="flex items-center space-x-2">
                {activeTab === "sell" && (
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => {
                      setSelectedProduct(null);
                      setIsAddingProduct(true);
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Product
                  </Button>
                )}
                {activeTab === "addresses" && (
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => setIsAddingAddress(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Address
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
                <TabsTrigger value="browse" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Products</span>
                </TabsTrigger>
                <TabsTrigger value="sell" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">My Products</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
              </TabsList>

              <div className="mb-6">
                <SearchBar 
                  value={search} 
                  onChange={setSearch} 
                  placeholder={activeTab === "browse" ? "Search products..." : activeTab === "sell" ? "Search my products..." : "Search orders..."}
                />
              </div>

              <TabsContent value="browse" className="mt-0">
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={categoryFilter === "" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCategoryFilter("")}
                    >
                      All
                    </Button>
                    <Button 
                      variant={categoryFilter === "vegetables" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCategoryFilter("vegetables")}
                    >
                      Vegetables
                    </Button>
                    <Button 
                      variant={categoryFilter === "fruits" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCategoryFilter("fruits")}
                    >
                      Fruits
                    </Button>
                    <Button 
                      variant={categoryFilter === "grains" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCategoryFilter("grains")}
                    >
                      Grains
                    </Button>
                    <Button 
                      variant={categoryFilter === "seeds" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCategoryFilter("seeds")}
                    >
                      Seeds
                    </Button>
                  </div>
                </div>
                <ProductList 
                  products={filteredProducts}
                  isLoading={isLoading}
                  onViewProduct={(product) => {
                    setSelectedProduct(product);
                  }}
                />
              </TabsContent>

              <TabsContent value="sell" className="mt-0">
                {!user ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-md border">
                    <User className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
                    <p className="text-gray-500 mb-6">Please sign in to manage your products.</p>
                    <Button>Sign In</Button>
                  </div>
                ) : (
                  <ProductList 
                    products={filteredMyProducts}
                    isLoading={isLoading}
                    isSeller={true}
                    onEditProduct={(product) => {
                      setSelectedProduct(product);
                      setIsAddingProduct(true);
                    }}
                    onDeleteProduct={(product) => handleDeleteProduct(product.id)}
                    onViewProduct={(product) => {
                      setSelectedProduct(product);
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="orders" className="mt-0">
                {!user ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-md border">
                    <User className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
                    <p className="text-gray-500 mb-6">Please sign in to view orders.</p>
                    <Button>Sign In</Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">My Orders</h2>
                      <OrderList 
                        orders={myOrders}
                        isLoading={isLoading}
                        onViewOrder={(order) => {
                          setSelectedOrder(order);
                          setIsViewingOrderDetails(true);
                        }}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Sales Orders</h2>
                      <OrderList 
                        orders={orders}
                        isLoading={isLoading}
                        onViewOrder={(order) => {
                          setSelectedOrder(order);
                          setIsViewingOrderDetails(true);
                        }}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Product Form Modal */}
      {isAddingProduct && (
        <ProductForm
          isOpen={isAddingProduct}
          onClose={() => setIsAddingProduct(false)}
          onSubmit={async (data, images) => {
            if (selectedProduct) {
              await handleEditProduct(selectedProduct.id, data, images);
            } else {
              await handleAddProduct(data, images);
            }
          }}
          product={selectedProduct || undefined}
          title={selectedProduct ? "Edit Product" : "Add Product"}
        />
      )}

      {/* Order Details Modal */}
      {isViewingOrderDetails && selectedOrder && (
        <OrderDetails
          isOpen={isViewingOrderDetails}
          onClose={() => setIsViewingOrderDetails(false)}
          order={selectedOrder}
        />
      )}

      {/* Address Form */}
      <AddressForm
        isOpen={isAddingAddress}
        onClose={() => setIsAddingAddress(false)}
        onSubmit={handleAddAddress}
        title="Add Address"
      />
    </div>
  );
};

export default Marketplace; 