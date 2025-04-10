import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Order, 
  OrderItem, 
  OrderStatus, 
  PaymentStatus 
} from "@/types/marketplace";
import { ExternalLink, Package, CreditCard } from "lucide-react";

interface OrderListProps {
  orders: Order[];
  isLoading?: boolean;
  onViewOrder?: (order: Order) => void;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => Promise<void>;
  onUpdatePaymentStatus?: (orderId: string, status: PaymentStatus) => Promise<void>;
}

export const OrderList = ({
  orders,
  isLoading = false,
  onViewOrder,
  onUpdateOrderStatus,
  onUpdatePaymentStatus
}: OrderListProps) => {
  const [statusUpdating, setStatusUpdating] = useState<{[key: string]: boolean}>({});

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell><div className="h-5 bg-gray-200 rounded w-2/3"></div></TableCell>
                <TableCell><div className="h-5 bg-gray-200 rounded w-3/4"></div></TableCell>
                <TableCell><div className="h-5 bg-gray-200 rounded w-1/2"></div></TableCell>
                <TableCell><div className="h-5 bg-gray-200 rounded w-3/4"></div></TableCell>
                <TableCell><div className="h-5 bg-gray-200 rounded w-3/4"></div></TableCell>
                <TableCell className="text-right"><div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-md border">
        <Package className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No orders found</h3>
        <p className="text-gray-500">There are no orders in the system yet.</p>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    if (!onUpdateOrderStatus) return;
    
    setStatusUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await onUpdateOrderStatus(orderId, status);
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setStatusUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handlePaymentStatusChange = async (orderId: string, status: PaymentStatus) => {
    if (!onUpdatePaymentStatus) return;
    
    setStatusUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await onUpdatePaymentStatus(orderId, status);
    } catch (error) {
      console.error("Error updating payment status:", error);
    } finally {
      setStatusUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.order_id || order.id.slice(0, 8)}
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(order.created_at)}
                </div>
              </TableCell>
              <TableCell>
                {order.buyer ? (
                  <>
                    <div>{order.buyer.full_name || 'Anonymous'}</div>
                    <div className="text-xs text-gray-500">
                      {order.shipping_phone || order.buyer.phone || '-'}
                    </div>
                  </>
                ) : (
                  <>
                    <div>{order.shipping_name || 'Anonymous'}</div>
                    <div className="text-xs text-gray-500">
                      {order.shipping_phone || '-'}
                    </div>
                  </>
                )}
              </TableCell>
              <TableCell>{formatPrice(order.total_amount)}</TableCell>
              <TableCell>
                {onUpdateOrderStatus ? (
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleOrderStatusChange(order.id, value as OrderStatus)}
                    disabled={statusUpdating[order.id]}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getOrderStatusBadge(order.status as OrderStatus)
                )}
              </TableCell>
              <TableCell>
                {onUpdatePaymentStatus ? (
                  <Select
                    value={order.payment_status}
                    onValueChange={(value) => handlePaymentStatusChange(order.id, value as PaymentStatus)}
                    disabled={statusUpdating[order.id]}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getPaymentStatusBadge(order.payment_status as PaymentStatus)
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewOrder?.(order)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 