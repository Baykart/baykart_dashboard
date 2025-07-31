import { useState, useEffect, ChangeEvent } from 'react';
import { Event } from '../types/supabase';
import { EventInput, createEvent, updateEvent } from '../lib/eventService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, HelpCircle, Image, Link as LinkIcon, MapPin, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';

interface EventFormProps {
  event?: Event;
  onSubmit: () => void;
  onCancel: () => void;
}

const EventForm = ({ event, onSubmit, onCancel }: EventFormProps) => {
  const [formData, setFormData] = useState<EventInput>({
    title: '',
    description: '',
    event_type: 'Workshop',
    category: '',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    location: '',
    city: '',
    registration_url: '',
    is_free: false,
    is_online: false,
    status: 'published',
  });

  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_type: event.event_type,
        category: event.category,
        event_date: event.event_date,
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        location: event.location,
        city: event.city,
        registration_url: event.registration_url || '',
        is_free: event.is_free,
        is_online: event.is_online,
        status: event.status || 'published',
      });
      
      setEventDate(new Date(event.event_date));
      
      if (event.image_url) {
        setImagePreview(event.image_url);
      }
    }
  }, [event]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'title':
        return !value.trim() ? 'Event title is required' : '';
      case 'event_date':
        return !value ? 'Event date is required' : '';
      case 'location':
        return !value.trim() ? 'Location is required' : '';
      case 'city':
        return !value.trim() ? 'City is required' : '';
      case 'registration_url':
        if (value && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value)) {
          return 'Please enter a valid URL';
        }
        return '';
      case 'start_time':
        if (value && formData.end_time && value >= formData.end_time) {
          return 'Start time must be before end time';
        }
        return '';
      case 'end_time':
        if (value && formData.start_time && value <= formData.start_time) {
          return 'End time must be after start time';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate required fields
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const markFieldAsTouched = (name: string) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touchedFields[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // If switching to online, pre-fill location with "Online"
    if (name === 'is_online' && checked) {
      setFormData(prev => ({ ...prev, location: 'Online' }));
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    markFieldAsTouched(name);
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setEventDate(date);
      const dateString = date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, event_date: dateString }));
      markFieldAsTouched('event_date');
      setErrors(prev => ({ ...prev, event_date: validateField('event_date', dateString) }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Please upload a valid image (JPEG, PNG, GIF, WEBP)' }));
        return;
      }
      
      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    markFieldAsTouched(name);
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouchedFields(allFields);
    
    if (!validateForm()) {
      // Find the first tab with errors
      const basicFields = ['title', 'description', 'event_type', 'category'];
      const detailsFields = ['event_date', 'start_time', 'end_time', 'location', 'city'];
      const additionalFields = ['registration_url', 'image'];
      
      const hasBasicErrors = basicFields.some(field => errors[field]);
      const hasDetailsErrors = detailsFields.some(field => errors[field]);
      const hasAdditionalErrors = additionalFields.some(field => errors[field]);
      
      if (hasBasicErrors) {
        setActiveTab('basic');
      } else if (hasDetailsErrors) {
        setActiveTab('details');
      } else if (hasAdditionalErrors) {
        setActiveTab('additional');
      }
      
      return;
    }
    
    setLoading(true);

    try {
      if (event) {
        await updateEvent(event.id, formData, imageFile || undefined);
      } else {
        console.log('Submitting event:', formData); // Debug log
        await createEvent(formData, imageFile || undefined);
      }

      onSubmit();
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err instanceof Error ? err.message : 'An error occurred' }));
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = ['Fair', 'Expo', 'Workshop', 'Training', 'Other'];
  const categories = ['Agriculture', 'Technology', 'Education', 'Business', 'Community', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Date & Location</TabsTrigger>
          <TabsTrigger value="additional">Additional Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-base">Event Title*</Label>
              {errors.title && touchedFields.title && (
                <span className="text-destructive text-xs">{errors.title}</span>
              )}
            </div>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Annual Farmers' Expo 2023"
              className={cn("mt-1", errors.title && touchedFields.title && "border-destructive")}
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-base">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the event details, agenda, and what attendees can expect..."
              className="mt-1"
              rows={4}
            />
            <p className="text-muted-foreground text-xs mt-1">
              A good description helps attendees understand what to expect from your event.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="event_type" className="text-base">Event Type*</Label>
                {errors.event_type && touchedFields.event_type && (
                  <span className="text-destructive text-xs">{errors.event_type}</span>
                )}
              </div>
              <Select 
                value={formData.event_type} 
                onValueChange={(value) => handleSelectChange('event_type', value)}
              >
                <SelectTrigger className={cn("mt-1", errors.event_type && touchedFields.event_type && "border-destructive")}>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="category" className="text-base">Category*</Label>
                {errors.category && touchedFields.category && (
                  <span className="text-destructive text-xs">{errors.category}</span>
                )}
              </div>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger className={cn("mt-1", errors.category && touchedFields.category && "border-destructive")}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_free"
                checked={formData.is_free}
                onCheckedChange={(checked) => handleSwitchChange('is_free', checked)}
              />
              <Label htmlFor="is_free" className="text-base">This is a free event</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle this if attendees don't need to pay to attend</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_online"
                checked={formData.is_online}
                onCheckedChange={(checked) => handleSwitchChange('is_online', checked)}
              />
              <Label htmlFor="is_online" className="text-base">This is an online event</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle this if the event will be held virtually</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button type="button" onClick={() => setActiveTab('details')}>
              Next: Date & Location
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="event_date" className="text-base">Event Date*</Label>
              {errors.event_date && touchedFields.event_date && (
                <span className="text-destructive text-xs">{errors.event_date}</span>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="event_date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !eventDate && "text-muted-foreground",
                    errors.event_date && touchedFields.event_date && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={handleDateChange}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
            <p className="text-muted-foreground text-xs mt-1">
              Select the date when the event will take place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="start_time" className="text-base">Start Time</Label>
                {errors.start_time && touchedFields.start_time && (
                  <span className="text-destructive text-xs">{errors.start_time}</span>
                )}
              </div>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={cn("pl-10", errors.start_time && touchedFields.start_time && "border-destructive")}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="end_time" className="text-base">End Time</Label>
                {errors.end_time && touchedFields.end_time && (
                  <span className="text-destructive text-xs">{errors.end_time}</span>
                )}
              </div>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="end_time"
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={cn("pl-10", errors.end_time && touchedFields.end_time && "border-destructive")}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="location" className="text-base">Location*</Label>
                {errors.location && touchedFields.location && (
                  <span className="text-destructive text-xs">{errors.location}</span>
                )}
              </div>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder={formData.is_online ? "Online" : "Venue name or address"}
                  className={cn("pl-10", errors.location && touchedFields.location && "border-destructive")}
                />
              </div>
              <p className="text-muted-foreground text-xs mt-1">
                {formData.is_online 
                  ? "For online events, you can specify the platform (e.g., Zoom, Teams)" 
                  : "Enter the venue name or full address"}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="city" className="text-base">City*</Label>
                {errors.city && touchedFields.city && (
                  <span className="text-destructive text-xs">{errors.city}</span>
                )}
              </div>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={formData.is_online ? "Online" : "City name"}
                className={cn("mt-1", errors.city && touchedFields.city && "border-destructive")}
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('basic')}>
              Back: Basic Info
            </Button>
            <Button type="button" onClick={() => setActiveTab('additional')}>
              Next: Additional Info
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="additional" className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="registration_url" className="text-base">Registration URL</Label>
              {errors.registration_url && touchedFields.registration_url && (
                <span className="text-destructive text-xs">{errors.registration_url}</span>
              )}
            </div>
            <div className="relative mt-1">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="registration_url"
                name="registration_url"
                type="url"
                value={formData.registration_url}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="https://example.com/register"
                className={cn("pl-10", errors.registration_url && touchedFields.registration_url && "border-destructive")}
              />
            </div>
            <p className="text-muted-foreground text-xs mt-1">
              Add a link where attendees can register or get tickets for your event
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="image" className="text-base">Event Image</Label>
              {errors.image && (
                <span className="text-destructive text-xs">{errors.image}</span>
              )}
            </div>
            <Card className="mt-1 border-dashed">
              <CardContent className="p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Event preview" 
                      className="h-40 w-full object-cover rounded-md" 
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Image className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF or WEBP (max. 5MB)</p>
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => document.getElementById('image')?.click()}
                    >
                      Select Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <p className="text-muted-foreground text-xs mt-1">
              An eye-catching image will help promote your event
            </p>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
              Back: Date & Location
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {errors.form && (
        <Alert variant="destructive">
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm; 