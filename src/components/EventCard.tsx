import { format } from 'date-fns';
import { Event } from '../types/supabase';
import { deleteEvent } from '../lib/eventService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, MapPin, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

const EventCard = ({ event, onEdit, onDelete }: EventCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isUpcoming = new Date(event.event_date) >= new Date();
  const isPast = new Date(event.event_date) < new Date();
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      onDelete(event.id);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const getEventTypeBadge = () => {
    switch (event.event_type) {
      case 'Fair':
        return <Badge variant="secondary">Fair</Badge>;
      case 'Expo':
        return <Badge variant="secondary">Expo</Badge>;
      case 'Workshop':
        return <Badge variant="secondary">Workshop</Badge>;
      case 'Training':
        return <Badge variant="secondary">Training</Badge>;
      default:
        return <Badge variant="secondary">Other</Badge>;
    }
  };
  
  const getStatusBadge = () => {
    if (isPast) return <Badge variant="outline">Past</Badge>;
    if (isUpcoming) return <Badge variant="success">Upcoming</Badge>;
    return null;
  };
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              {getEventTypeBadge()}
              {getStatusBadge()}
              {event.is_free && <Badge variant="outline">Free</Badge>}
              {event.is_online && <Badge variant="outline">Online</Badge>}
            </div>
            <CardTitle className="text-lg font-bold line-clamp-2">{event.title}</CardTitle>
            <CardDescription className="mt-1 text-sm">
              {event.category}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {event.image_url && (
        <div className="px-6">
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-40 object-cover rounded-md"
          />
        </div>
      )}
      
      <CardContent className="pb-2 flex-grow">
        {event.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {event.description}
          </p>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start">
            <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
            <span>{format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          {(event.start_time || event.end_time) && (
            <div className="flex items-start">
              <Clock className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <span>
                {event.start_time && formatTime(event.start_time)}
                {event.start_time && event.end_time && ' - '}
                {event.end_time && formatTime(event.end_time)}
              </span>
            </div>
          )}
          
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
            <span>
              {event.location}
              {event.city && `, ${event.city}`}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        {event.registration_url ? (
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <a 
              href={event.registration_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              Register
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        ) : (
          <div></div>
        )}
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(event)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the event "{event.title}". This action cannot be undone.
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

// Helper function to format time
const formatTime = (timeString: string) => {
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, 'h:mm a');
  } catch (error) {
    return timeString;
  }
};

export default EventCard; 