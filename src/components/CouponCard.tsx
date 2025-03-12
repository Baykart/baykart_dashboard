import { format } from 'date-fns';
import { Coupon, toggleCouponStatus, deleteCoupon } from '../lib/couponService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, isActive: boolean) => void;
}

const CouponCard = ({ coupon, onEdit, onDelete, onStatusChange }: CouponCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const isExpired = new Date(coupon.end_date) < new Date();
  const isNotStarted = new Date(coupon.start_date) > new Date();
  const isActive = coupon.is_active && !isExpired && !isNotStarted;
  
  const handleStatusToggle = async (checked: boolean) => {
    setIsToggling(true);
    try {
      await toggleCouponStatus(coupon.id, checked);
      onStatusChange(coupon.id, checked);
    } catch (error) {
      console.error('Error toggling coupon status:', error);
    } finally {
      setIsToggling(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCoupon(coupon.id);
      onDelete(coupon.id);
    } catch (error) {
      console.error('Error deleting coupon:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const getStatusBadge = () => {
    if (isExpired) return <Badge variant="destructive">Expired</Badge>;
    if (isNotStarted) return <Badge variant="secondary">Upcoming</Badge>;
    if (isActive) return <Badge variant="success">Active</Badge>;
    return <Badge variant="outline">Inactive</Badge>;
  };
  
  const getDiscountText = () => {
    if (coupon.discount_amount) {
      return `${coupon.currency} ${coupon.discount_amount} off`;
    }
    if (coupon.discount_percentage) {
      return `${coupon.discount_percentage}% off`;
    }
    return 'No discount specified';
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{coupon.code}</CardTitle>
            <CardDescription className="mt-1">
              {coupon.description || 'No description'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount:</span>
            <span className="font-medium">{getDiscountText()}</span>
          </div>
          
          {coupon.minimum_purchase && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min. Purchase:</span>
              <span className="font-medium">{coupon.currency} {coupon.minimum_purchase}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valid Period:</span>
            <span className="font-medium">
              {format(new Date(coupon.start_date), 'MMM d, yyyy')} - {format(new Date(coupon.end_date), 'MMM d, yyyy')}
            </span>
          </div>
          
          {coupon.usage_limit && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usage:</span>
              <span className="font-medium">{coupon.usage_count} / {coupon.usage_limit}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id={`active-${coupon.id}`}
            checked={coupon.is_active}
            onCheckedChange={handleStatusToggle}
            disabled={isToggling || isExpired}
          />
          <Label htmlFor={`active-${coupon.id}`} className="text-sm">
            {isToggling ? 'Updating...' : 'Active'}
          </Label>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(coupon)}
          >
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the coupon "{coupon.code}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CouponCard; 