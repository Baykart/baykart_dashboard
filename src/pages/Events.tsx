import { useState, useEffect } from 'react';
import { Event } from '../types/supabase';
import { getEvents, getEventsByType, getEventsByCategory, getEventsByLocation } from '../lib/eventService';
import EventCard from '../components/EventCard';
import EventForm from '../components/EventForm';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Plus, Search, Calendar, Filter } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, typeFilter, categoryFilter, locationFilter, activeTab]);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        event => 
          event.title.toLowerCase().includes(query) || 
          (event.description && event.description.toLowerCase().includes(query)) ||
          event.location.toLowerCase().includes(query) ||
          event.city.toLowerCase().includes(query)
      );
    }
    
    // Filter by event type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.event_type === typeFilter);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }
    
    // Filter by location (city)
    if (locationFilter !== 'all') {
      filtered = filtered.filter(event => event.city === locationFilter);
    }
    
    // Filter by tab
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.event_date) >= today);
    } else if (activeTab === 'past') {
      filtered = filtered.filter(event => new Date(event.event_date) < today);
    } else if (activeTab === 'free') {
      filtered = filtered.filter(event => event.is_free);
    } else if (activeTab === 'online') {
      filtered = filtered.filter(event => event.is_online);
    }
    
    // Sort by date (upcoming first, then past)
    filtered.sort((a, b) => {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);
      
      // If both dates are in the future or both are in the past
      if ((dateA >= today && dateB >= today) || (dateA < today && dateB < today)) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // If one is in the future and one is in the past, prioritize future events
      return dateA >= today ? -1 : 1;
    });
    
    setFilteredEvents(filtered);
  };

  const handleAddEvent = () => {
    setSelectedEvent(undefined);
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    fetchEvents();
  };

  const handleFormCancel = () => {
    setIsDialogOpen(false);
  };

  // Get unique categories and cities for filters
  const categories = ['all', ...Array.from(new Set(events.map(event => event.category)))];
  const cities = ['all', ...Array.from(new Set(events.map(event => event.city)))];
  const eventTypes = ['all', 'Fair', 'Expo', 'Workshop', 'Training', 'Other'];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto py-6 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Events</h1>
              <Button onClick={handleAddEvent}>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city === 'all' ? 'All Locations' : city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                <TabsTrigger value="free">Free</TabsTrigger>
                <TabsTrigger value="online">Online</TabsTrigger>
              </TabsList>
            </Tabs>

            <Separator className="mb-6" />

            {isLoading ? (
              <div className="text-center py-10">Loading events...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || locationFilter !== 'all' || activeTab !== 'all'
                  ? 'No events match your filters'
                  : 'No events found. Create your first event!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedEvent ? 'Edit Event' : 'Create New Event'}
                  </DialogTitle>
                </DialogHeader>
                <EventForm
                  event={selectedEvent}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Events; 