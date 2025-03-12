import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { VideoForm } from '@/components/VideoForm';
import { videoService, Video } from '../lib/videoService';
import { Plus, Edit, Trash2, Play } from "lucide-react";
import VideoCard from '../components/VideoCard';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Search, Film, Video as VideoIcon } from 'lucide-react';

export function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, categoryFilter, sourceFilter, activeTab]);

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await videoService.getVideos();
      setVideos(data);
    } catch (err) {
      setError('Failed to fetch videos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = [...videos];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        video => 
          video.title.toLowerCase().includes(query) || 
          (video.description && video.description.toLowerCase().includes(query)) ||
          (video.tags && video.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Filter by category
    if (categoryFilter !== 'all' && categoryFilter) {
      filtered = filtered.filter(video => video.category === categoryFilter);
    }
    
    // Filter by source
    if (sourceFilter !== 'all' && sourceFilter) {
      filtered = filtered.filter(video => video.source === sourceFilter);
    }
    
    // Filter by tab
    if (activeTab === 'livestreams') {
      filtered = filtered.filter(video => video.is_livestream);
    }
    
    // Sort by created_at (newest first)
    filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
    
    setFilteredVideos(filtered);
  };

  const handleAddVideo = () => {
    setSelectedVideo(undefined);
    setIsDialogOpen(true);
  };

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await videoService.deleteVideo(id);
      setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (selectedVideo) {
        const updatedVideo = await videoService.updateVideo(selectedVideo.id, data);
        setVideos(prevVideos => 
          prevVideos.map(video => 
            video.id === updatedVideo.id ? updatedVideo : video
          )
        );
        toast({
          title: 'Success',
          description: 'Video updated successfully',
        });
      } else {
        const newVideo = await videoService.createVideo(data);
        setVideos(prevVideos => [newVideo, ...prevVideos]);
        toast({
          title: 'Success',
          description: 'Video created successfully',
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to save video',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique categories and sources for filters
  const categories = ['all', ...Array.from(new Set(videos.filter(video => video.category).map(video => video.category as string)))];
  const sources = ['all', ...Array.from(new Set(videos.filter(video => video.source).map(video => video.source)))];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto py-6 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Videos</h1>
              <Button onClick={handleAddVideo}>
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
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
                
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source === 'all' ? 'All Sources' : source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all" className="flex items-center">
                  <VideoIcon className="h-4 w-4 mr-2" />
                  All Videos
                </TabsTrigger>
                <TabsTrigger value="livestreams" className="flex items-center">
                  <Film className="h-4 w-4 mr-2" />
                  Livestreams
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Separator className="mb-6" />

            {isLoading ? (
              <div className="text-center py-10">Loading videos...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                {searchQuery || categoryFilter !== 'all' || sourceFilter !== 'all' || activeTab !== 'all'
                  ? 'No videos match your filters'
                  : 'No videos found. Create your first video!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onEdit={handleEditVideo}
                    onDelete={handleDeleteVideo}
                  />
                ))}
              </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedVideo ? 'Edit Video' : 'Add New Video'}
                  </DialogTitle>
                </DialogHeader>
                <VideoForm
                  video={selectedVideo}
                  onSubmit={handleFormSubmit}
                  isLoading={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
} 