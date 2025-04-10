import { useState } from "react";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Order, 
  OrderStatus, 
  PaymentStatus 
} from "@/types/marketplace";
import { Package, ShoppingBag, MapPin, Phone } from "lucide-react";

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetails = ({
  isOpen,
  onClose,
  order
}: OrderDetailsProps) => {
  if (!order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR', // Replace with your currency
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    const variants: { [key in OrderStatus]: "default" | "secondary" | "outline" | "destructive" | "success" } = {
      pending: "secondary",
      confirmed: "default",
      shipped: "default",
      delivered: "success",
      cancelled: "destructive"
    };
    
    const displayNames: { [key in OrderStatus]: string } = {
      pending: "Pending",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled"
    };
    
    return (
      <Badge variant={variants[status] || "default"}>
        {displayNames[status] || status}
      </Badge>
    );
  };
  
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants: { [key in PaymentStatus]: "default" | "secondary" | "outline" | "destructive" | "success" } = {
      pending: "secondary",
      paid: "success",
      failed: "destructive"
    };
    
    const displayNames: { [key in PaymentStatus]: string } = {
      pending: "Pending",
      paid: "Paid",
      failed: "Failed"
    };
    
    return (
      <Badge variant={variants[status] || "default"}>
        {displayNames[status] || status}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Order Details
            <Badge className="ml-3" variant="outline">
              {order.order_id || order.id.slice(0, 8)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Created on {formatDate(order.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium">Status</div>
            <div className="mt-1 flex items-center gap-3">
              {getOrderStatusBadge(order.status as OrderStatus)}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium">Payment</div>
            <div className="mt-1 flex items-center gap-3">
              {getPaymentStatusBadge(order.payment_status as PaymentStatus)}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-base font-medium flex items-center mb-2">
              <MapPin className="mr-2 h-4 w-4" />
              Shipping Information
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.shipping_name || order.buyer?.full_name || 'N/A'}</p>
              <p>{order.shipping_phone || order.buyer?.phone || 'N/A'}</p>
              <p>{order.shipping_address_line1 || 'N/A'}</p>
              {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
              <p>
                {[
                  order.shipping_city,
                  order.shipping_state,
                  order.shipping_pincode
                ].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium flex items-center mb-2">
              <Phone className="mr-2 h-4 w-4" />
              Customer Information
            </h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Name:</span> {order.buyer?.full_name || order.shipping_name || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {order.buyer?.phone || order.shipping_phone || 'N/A'}
              </p>
              {order.buyer?.email && (
                <p>
                  <span className="font-medium">Email:</span> {order.buyer.email}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium mb-2">Order Items</h3>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {item.product?.images && item.product.images[0] ? (
                            <div className="h-10 w-10 rounded-md overflow-hidden mr-3">
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product?.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded-md mr-3 flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium line-clamp-1">
                              {item.product?.name || 'Unknown Product'}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {item.product_id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                      <TableCell className="text-right">{formatPrice(item.total)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      No items found in this order
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatPrice(order.total_amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {order.notes && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Order Notes</h3>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 