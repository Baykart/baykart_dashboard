import { Video } from '../lib/videoService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Clock, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface VideoCardProps {
  video: Video;
  onEdit: (video: Video) => void;
  onDelete: (id: string) => void;
}

const VideoCard = ({ video, onEdit, onDelete }: VideoCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(video.id);
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown duration';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const isYoutubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };
  
  const getYoutubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };
  
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <div className="relative group cursor-pointer" onClick={() => setShowVideoDialog(true)}>
        <div className="aspect-video bg-muted overflow-hidden">
          {video.thumbnail_url ? (
            <img 
              src={video.thumbnail_url} 
              alt={video.title} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
            <Play className="h-6 w-6" />
          </Button>
        </div>
        {video.duration && (
          <Badge variant="secondary" className="absolute bottom-2 right-2">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(video.duration)}
          </Badge>
        )}
        {video.is_livestream && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            LIVE
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold line-clamp-2">{video.title}</CardTitle>
        <CardDescription className="flex items-center text-sm">
          {video.source}
          {video.category && (
            <>
              <span className="mx-1">•</span>
              <Badge variant="outline">{video.category}</Badge>
            </>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {video.description}
          </p>
        )}
        
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {video.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowVideoDialog(true)}
        >
          <Play className="h-4 w-4 mr-1" />
          Watch
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(video)}
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
                  This will permanently delete the video "{video.title}". This action cannot be undone.
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
      
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{video.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video mt-2">
            {isYoutubeUrl(video.video_url) ? (
              <iframe
                src={getYoutubeEmbedUrl(video.video_url)}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            ) : (
              <video
                src={video.video_url}
                controls
                className="w-full h-full"
                poster={video.thumbnail_url}
              ></video>
            )}
          </div>
          {video.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {video.description}
            </p>
          )}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <a 
                href={video.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                Open in new tab
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VideoCard; 