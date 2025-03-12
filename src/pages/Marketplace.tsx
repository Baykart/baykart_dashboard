import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ExternalLink, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productService, Product } from "@/lib/productService";
import { orderService, Order, OrderItem } from "@/lib/orderService";
import { marketPriceService, MarketPrice } from "@/lib/marketPriceService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().default("D"),
  stock_quantity: z.coerce.number().min(0, "Stock quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  description: z.string().optional(),
  sowing_season: z.string().optional(),
  sowing_method: z.string().optional(),
  spacing: z.string().optional(),
  maturity_days: z.coerce.number().optional(),
  is_bestseller: z.boolean().default(false),
});

const marketPriceSchema = z.object({
  crop: z.string().min(1, "Crop name is required"),
  market: z.string().min(1, "Market name is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().default("D"),
  unit: z.string().min(1, "Unit is required"),
  date: z.string().min(1, "Date is required"),
  price_trend: z.enum(["up", "down", "stable"]).optional(),
});

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingMarketPrice, setIsAddingMarketPrice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewingOrderDetails, setIsViewingOrderDetails] = useState(false);
  const { toast } = useToast();

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      currency: "D",
      is_bestseller: false,
    },
  });

  const marketPriceForm = useForm<z.infer<typeof marketPriceSchema>>({
    resolver: zodResolver(marketPriceSchema),
    defaultValues: {
      currency: "D",
      date: new Date().toISOString().split('T')[0],
      price_trend: "stable",
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, productsData, marketPricesData] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts(),
        marketPriceService.getLatestPrices()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setMarketPrices(marketPricesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load marketplace data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['delivery_status']) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: Order['payment_status']) => {
    try {
      await orderService.updatePaymentStatus(orderId, status);
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    // Format the number with commas for thousands separators
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    // Append the "D" currency symbol
    return `D ${formattedNumber}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Order['delivery_status']) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: Order['payment_status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAddProduct = async (values: z.infer<typeof productSchema>) => {
    try {
      await productService.createProduct(values);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      setIsAddingProduct(false);
      productForm.reset();
      loadData();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
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
  };

  const handleAddMarketPrice = async (values: z.infer<typeof marketPriceSchema>) => {
    try {
      await marketPriceService.createMarketPrice(values);
      toast({
        title: "Success",
        description: "Market price added successfully",
      });
      setIsAddingMarketPrice(false);
      marketPriceForm.reset({
        currency: "D",
        date: new Date().toISOString().split('T')[0],
        price_trend: "stable",
      });
      loadData();
    } catch (error) {
      console.error("Error adding market price:", error);
      toast({
        title: "Error",
        description: "Failed to add market price",
        variant: "destructive",
      });
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsViewingOrderDetails(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Marketplace</h1>
              {activeTab === "products" && (
                <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <Form {...productForm}>
                      <form onSubmit={productForm.handleSubmit(handleAddProduct)}>
                        <DialogHeader>
                          <DialogTitle>Add New Product</DialogTitle>
                          <DialogDescription>
                            Fill in the product details below.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={productForm.control}
                              name="subcategory"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subcategory</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={productForm.control}
                              name="stock_quantity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stock Quantity</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field}
                                      onChange={e => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={productForm.control}
                            name="unit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="sowing_season"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sowing Season</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={productForm.control}
                              name="sowing_method"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sowing Method</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="spacing"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Spacing</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={productForm.control}
                              name="maturity_days"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Maturity Days</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field}
                                      onChange={e => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Add Product</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
              {activeTab === "market-prices" && (
                <Dialog open={isAddingMarketPrice} onOpenChange={setIsAddingMarketPrice}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Market Price
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <Form {...marketPriceForm}>
                      <form onSubmit={marketPriceForm.handleSubmit(handleAddMarketPrice)}>
                        <DialogHeader>
                          <DialogTitle>Add New Market Price</DialogTitle>
                          <DialogDescription>
                            Enter the market price details below.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <FormField
                            control={marketPriceForm.control}
                            name="crop"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Crop</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={marketPriceForm.control}
                            name="market"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Market</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={marketPriceForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={marketPriceForm.control}
                              name="unit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Unit</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={marketPriceForm.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={marketPriceForm.control}
                              name="price_trend"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price Trend</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select trend" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="up">Up</SelectItem>
                                      <SelectItem value="down">Down</SelectItem>
                                      <SelectItem value="stable">Stable</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Add Market Price</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="mb-6">
              <SearchBar 
                value={search} 
                onChange={setSearch}
              />
            </div>

            <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="orders" className="flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="market-prices" className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Market Prices
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Order Status</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_id || order.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.users?.full_name}</p>
                              <p className="text-sm text-gray-500">{order.users?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{order.order_items?.length || 0} items</p>
                              <div className="text-sm text-gray-500">
                                {order.order_items?.map((item, index) => (
                                  <div key={item.id}>
                                    {item.products?.name} × {item.quantity} {item.products?.unit}
                                  </div>
                                )).slice(0, 2)}
                                {(order.order_items?.length || 0) > 2 && (
                                  <div>+ {(order.order_items?.length || 0) - 2} more</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                          <TableCell>
                            <Select
                              value={order.delivery_status}
                              onValueChange={(value) => 
                                handleUpdateOrderStatus(order.id, value as Order['delivery_status'])
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.payment_status}
                              onValueChange={(value) => 
                                handleUpdatePaymentStatus(order.id, value as Order['payment_status'])
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewOrderDetails(order)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="products">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id}>
                      {product.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="mb-2">{product.category}</Badge>
                            {product.subcategory && (
                              <Badge variant="outline" className="ml-2 mb-2">
                                {product.subcategory}
                              </Badge>
                            )}
                            <CardTitle className="text-xl">{product.name}</CardTitle>
                          </div>
                          {product.is_bestseller && (
                            <Badge variant="secondary">Bestseller</Badge>
                          )}
                        </div>
                        <CardDescription>
                          Stock: {product.stock_quantity} {product.unit}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(product.price)}
                        </p>
                        {product.description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        {(product.sowing_season || product.maturity_days) && (
                          <div className="mt-4 space-y-1 text-sm text-gray-500">
                            {product.sowing_season && (
                              <p>Sowing Season: {product.sowing_season}</p>
                            )}
                            {product.maturity_days && (
                              <p>Maturity: {product.maturity_days} days</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="market-prices">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Crop</TableHead>
                        <TableHead>Market</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marketPrices.map((price) => (
                        <TableRow key={price.id}>
                          <TableCell className="font-medium">{price.crop}</TableCell>
                          <TableCell>{price.market}</TableCell>
                          <TableCell>{formatCurrency(price.price)}</TableCell>
                          <TableCell>{price.unit}</TableCell>
                          <TableCell>{formatDate(price.date)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                price.price_trend === 'up'
                                  ? 'secondary'
                                  : price.price_trend === 'down'
                                  ? 'destructive'
                                  : 'outline'
                              }
                            >
                              {price.price_trend || 'stable'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isViewingOrderDetails} onOpenChange={setIsViewingOrderDetails}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Order #{selectedOrder?.order_id || selectedOrder?.id}</DialogTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.print()}
                className="print:hidden"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
            <DialogDescription>
              Placed on {selectedOrder?.created_at && formatDate(selectedOrder.created_at)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 pt-2">
              {/* Status Indicators */}
              <div className="flex flex-wrap gap-3 print:hidden">
                <Badge 
                  variant={
                    selectedOrder.delivery_status === 'delivered' 
                      ? 'default' 
                      : selectedOrder.delivery_status === 'cancelled' 
                        ? 'destructive' 
                        : selectedOrder.delivery_status === 'shipped'
                          ? 'secondary'
                          : 'outline'
                  }
                  className="text-sm py-1 px-3"
                >
                  {selectedOrder.delivery_status.charAt(0).toUpperCase() + selectedOrder.delivery_status.slice(1)}
                </Badge>
                <Badge 
                  variant={
                    selectedOrder.payment_status === 'paid' 
                      ? 'default' 
                      : selectedOrder.payment_status === 'failed' 
                        ? 'destructive' 
                        : 'outline'
                  }
                  className="text-sm py-1 px-3"
                >
                  Payment: {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                </Badge>
              </div>
              
              {/* Two-column layout for customer and shipping info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Customer</h3>
                  <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                    <p className="text-base font-semibold">{selectedOrder.users?.full_name}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.users?.email}</p>
                    {selectedOrder.users?.phone && (
                      <p className="text-sm text-gray-500">{selectedOrder.users?.phone}</p>
                    )}
                  </div>
                </div>
                
                {/* Shipping Address */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                    {typeof selectedOrder.shipping_address === 'object' ? (
                      <>
                        <p className="text-base">{selectedOrder.shipping_address.street}</p>
                        <p className="text-sm">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
                        <p className="text-sm">{selectedOrder.shipping_address.country}</p>
                      </>
                    ) : (
                      <p className="text-base">{String(selectedOrder.shipping_address)}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Order Items</h3>
                <div className="border rounded-md overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold text-right">Quantity</TableHead>
                        <TableHead className="font-semibold text-right">Unit Price</TableHead>
                        <TableHead className="font-semibold text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items?.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div>
                              <p>{item.products?.name}</p>
                              {item.products?.category && (
                                <p className="text-xs text-gray-500">{item.products?.category}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity} {item.products?.unit}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.subtotal || (item.unit_price * item.quantity))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="border rounded-md p-4 bg-gray-50 shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(selectedOrder.total_amount - (selectedOrder.shipping_amount || 0) - (selectedOrder.tax_amount || 0))}</span>
                  </div>
                  {selectedOrder.tax_amount && selectedOrder.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                    </div>
                  )}
                  {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">-{formatCurrency(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{formatCurrency(selectedOrder.shipping_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-3 mt-2 border-t">
                    <span>Total</span>
                    <span className="text-lg">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
              
              {/* Two-column layout for payment and delivery info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Payment Details</h3>
                  <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                    <div className="flex items-center mb-2">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        selectedOrder.payment_status === 'paid' 
                          ? 'bg-green-500' 
                          : selectedOrder.payment_status === 'failed' 
                            ? 'bg-red-500' 
                            : 'bg-yellow-500'
                      }`}></div>
                      <p className="text-sm font-medium">
                        Status: {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                      </p>
                    </div>
                    <p className="text-sm"><span className="font-medium">Method:</span> {selectedOrder.payment_method || 'Not specified'}</p>
                    {selectedOrder.payment_id && (
                      <p className="text-sm"><span className="font-medium">Transaction ID:</span> {selectedOrder.payment_id}</p>
                    )}
                  </div>
                </div>
                
                {/* Delivery Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Delivery Details</h3>
                  <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                    <div className="flex items-center mb-2">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        selectedOrder.delivery_status === 'delivered' 
                          ? 'bg-green-500' 
                          : selectedOrder.delivery_status === 'cancelled' 
                            ? 'bg-red-500' 
                            : selectedOrder.delivery_status === 'shipped'
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                      }`}></div>
                      <p className="text-sm font-medium">
                        Status: {selectedOrder.delivery_status.charAt(0).toUpperCase() + selectedOrder.delivery_status.slice(1)}
                      </p>
                    </div>
                    {selectedOrder.tracking_number && (
                      <p className="text-sm"><span className="font-medium">Tracking:</span> {selectedOrder.tracking_number}</p>
                    )}
                    {selectedOrder.expected_delivery_date && (
                      <p className="text-sm"><span className="font-medium">Expected Delivery:</span> {formatDate(selectedOrder.expected_delivery_date)}</p>
                    )}
                    {selectedOrder.actual_delivery_date && (
                      <p className="text-sm"><span className="font-medium">Delivered On:</span> {formatDate(selectedOrder.actual_delivery_date)}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Notes or Additional Information */}
              {selectedOrder.notes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                    <p className="text-sm italic">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="sticky bottom-0 bg-white z-10 pt-4 border-t mt-6 print:hidden">
            <div className="flex gap-3">
              {selectedOrder && selectedOrder.delivery_status !== 'delivered' && selectedOrder.delivery_status !== 'cancelled' && (
                <Button 
                  variant="default" 
                  onClick={() => {
                    handleUpdateOrderStatus(selectedOrder.id, 'delivered');
                    setIsViewingOrderDetails(false);
                  }}
                >
                  Mark as Delivered
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsViewingOrderDetails(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace; 