import { useState, useEffect } from 'react';
import { Coupon, CouponFormData, createCoupon, updateCoupon } from '../lib/couponService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface CouponFormProps {
  coupon?: Coupon;
  onSubmit: () => void;
  onCancel: () => void;
}

const CouponForm = ({ coupon, onSubmit, onCancel }: CouponFormProps) => {
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>(
    coupon?.discount_amount ? 'amount' : 'percentage'
  );
  
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    description: '',
    discount_amount: undefined,
    discount_percentage: undefined,
    minimum_purchase: undefined,
    currency: 'D',
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    is_active: true,
    usage_limit: undefined,
  });

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 1)));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discount_amount: coupon.discount_amount || undefined,
        discount_percentage: coupon.discount_percentage || undefined,
        minimum_purchase: coupon.minimum_purchase || undefined,
        currency: coupon.currency,
        start_date: coupon.start_date,
        end_date: coupon.end_date,
        is_active: coupon.is_active,
        usage_limit: coupon.usage_limit || undefined,
      });
      
      setStartDate(new Date(coupon.start_date));
      setEndDate(new Date(coupon.end_date));
      setDiscountType(coupon.discount_amount ? 'amount' : 'percentage');
    }
  }, [coupon]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      setFormData((prev) => ({ ...prev, start_date: date.toISOString() }));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      setFormData((prev) => ({ ...prev, end_date: date.toISOString() }));
    }
  };

  const handleDiscountTypeChange = (value: string) => {
    const type = value as 'amount' | 'percentage';
    setDiscountType(type);
    
    if (type === 'amount') {
      setFormData((prev) => ({ 
        ...prev, 
        discount_amount: prev.discount_percentage || 0,
        discount_percentage: undefined 
      }));
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        discount_percentage: prev.discount_amount || 0,
        discount_amount: undefined 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.code) {
        throw new Error('Coupon code is required');
      }

      if (discountType === 'amount' && (formData.discount_amount === undefined || formData.discount_amount <= 0)) {
        throw new Error('Discount amount must be greater than 0');
      }

      if (discountType === 'percentage' && (formData.discount_percentage === undefined || formData.discount_percentage <= 0 || formData.discount_percentage > 100)) {
        throw new Error('Discount percentage must be between 1 and 100');
      }

      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        throw new Error('End date must be after start date');
      }

      if (coupon) {
        await updateCoupon(coupon.id, formData);
      } else {
        await createCoupon(formData);
      }

      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="code">Coupon Code*</Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="SUMMER2023"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Summer sale discount"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Discount Type*</Label>
          <RadioGroup 
            value={discountType} 
            onValueChange={handleDiscountTypeChange}
            className="flex space-x-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="amount" id="amount" />
              <Label htmlFor="amount">Fixed Amount</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage">Percentage</Label>
            </div>
          </RadioGroup>
        </div>

        {discountType === 'amount' ? (
          <div>
            <Label htmlFor="discount_amount">Discount Amount*</Label>
            <div className="flex items-center mt-1">
              <span className="mr-2">{formData.currency}</span>
              <Input
                id="discount_amount"
                name="discount_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_amount || ''}
                onChange={handleNumberInputChange}
                placeholder="10.00"
                required
              />
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="discount_percentage">Discount Percentage*</Label>
            <div className="flex items-center mt-1">
              <Input
                id="discount_percentage"
                name="discount_percentage"
                type="number"
                min="1"
                max="100"
                value={formData.discount_percentage || ''}
                onChange={handleNumberInputChange}
                placeholder="15"
                required
              />
              <span className="ml-2">%</span>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="minimum_purchase">Minimum Purchase Amount</Label>
          <div className="flex items-center mt-1">
            <span className="mr-2">{formData.currency}</span>
            <Input
              id="minimum_purchase"
              name="minimum_purchase"
              type="number"
              min="0"
              step="0.01"
              value={formData.minimum_purchase || ''}
              onChange={handleNumberInputChange}
              placeholder="50.00"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="usage_limit">Usage Limit</Label>
          <Input
            id="usage_limit"
            name="usage_limit"
            type="number"
            min="1"
            value={formData.usage_limit || ''}
            onChange={handleNumberInputChange}
            placeholder="100"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>End Date*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                  disabled={(date) => date < startDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </div>
    </form>
  );
};

export default CouponForm; 