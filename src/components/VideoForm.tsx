import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { videoService, type Video } from '@/lib/videoService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Film, Image, Link as LinkIcon, Clock, Tag as TagIcon, HelpCircle, Video as VideoIcon, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface VideoFormProps {
  video?: Video;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function VideoForm({ video, onSubmit, isLoading }: VideoFormProps) {
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    source: video?.source || '',
    video_url: video?.video_url || '',
    thumbnail_url: video?.thumbnail_url || '',
    duration: video?.duration || 0,
    is_livestream: video?.is_livestream || false,
    category: video?.category || '',
    tags: video?.tags?.join(', ') || '',
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(video?.thumbnail_url || null);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Add these state variables for upload progress simulation and drag-and-drop
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isVideoDragActive, setIsVideoDragActive] = useState(false);
  const [isThumbnailDragActive, setIsThumbnailDragActive] = useState(false);
  
  // Refs for the drop zones
  const videoDropzoneRef = useRef<HTMLDivElement>(null);
  const thumbnailDropzoneRef = useRef<HTMLDivElement>(null);

  // Common categories for videos
  const categoryOptions = [
    'Agriculture',
    'Farming Techniques',
    'Crop Management',
    'Livestock',
    'Equipment',
    'Market Updates',
    'Weather',
    'Tutorial',
    'News',
    'Interview',
    'Other'
  ];

  // Common sources for videos
  const sourceOptions = [
    'YouTube',
    'Vimeo',
    'Facebook',
    'Instagram',
    'TikTok',
    'Original Content',
    'Partner Content',
    'Other'
  ];

  useEffect(() => {
    // If video URL is from YouTube, try to extract duration and thumbnail
    if (formData.video_url && formData.video_url.includes('youtube.com') && !formData.thumbnail_url) {
      // This is just a placeholder - in a real app, you might use YouTube API
      // to fetch video details including duration and thumbnail
      const videoId = extractYoutubeVideoId(formData.video_url);
      if (videoId) {
        setThumbnailPreview(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
        setFormData(prev => ({ 
          ...prev, 
          thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
        }));
      }
    }
  }, [formData.video_url]);

  const extractYoutubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'title':
        return !value.trim() ? 'Title is required' : '';
      case 'source':
        return !value.trim() ? 'Source is required' : '';
      case 'video_url':
        if (!videoFile && !value.trim()) {
          return 'Either Video URL or Video File is required';
        }
        if (value && !isValidUrl(value)) {
          return 'Please enter a valid URL';
        }
        return '';
      case 'thumbnail_url':
        if (value && !isValidUrl(value)) {
          return 'Please enter a valid URL';
        }
        return '';
      case 'duration':
        if (value && (isNaN(Number(value)) || Number(value) < 0)) {
          return 'Duration must be a positive number';
        }
        return '';
      default:
        return '';
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
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

    // Special case: either video_url or videoFile must be provided
    if (!formData.video_url && !videoFile) {
      newErrors.video_url = 'Either Video URL or Video File is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const markFieldAsTouched = (name: string) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touchedFields[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    markFieldAsTouched(name);
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    markFieldAsTouched(name);
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_livestream: checked }));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, videoFile: 'Video size should be less than 100MB' }));
        return;
      }
      
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, videoFile: 'Please upload a valid video (MP4, WebM, Ogg)' }));
        return;
      }
      
      setVideoFile(file);
      setErrors(prev => ({ ...prev, videoFile: '', video_url: '' }));
      
      // Create preview URL
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      
      // Clear video_url field since we're using a file
      setFormData(prev => ({ ...prev, video_url: '' }));
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, thumbnailFile: 'Image size should be less than 5MB' }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, thumbnailFile: 'Please upload a valid image (JPEG, PNG, GIF, WEBP)' }));
        return;
      }
      
      setThumbnailFile(file);
      setErrors(prev => ({ ...prev, thumbnailFile: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear thumbnail_url field since we're using a file
      setFormData(prev => ({ ...prev, thumbnail_url: '' }));
    }
  };

  // Function to simulate upload progress
  const simulateUploadProgress = (setProgress: React.Dispatch<React.SetStateAction<number>>, setIsUploading: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };
  
  // Set up drag-and-drop event handlers for video
  useEffect(() => {
    const videoDropzone = videoDropzoneRef.current;
    if (!videoDropzone) return;
    
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsVideoDragActive(true);
    };
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsVideoDragActive(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget === videoDropzone) {
        setIsVideoDragActive(false);
      }
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsVideoDragActive(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        
        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, videoFile: 'Video size should be less than 100MB' }));
          return;
        }
        
        // Validate file type
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
          setErrors(prev => ({ ...prev, videoFile: 'Please upload a valid video (MP4, WebM, Ogg)' }));
          return;
        }
        
        handleVideoFileChange({ target: { files: [file] } } as any);
        simulateUploadProgress(setVideoUploadProgress, setIsVideoUploading);
      }
    };
    
    videoDropzone.addEventListener('dragenter', handleDragEnter);
    videoDropzone.addEventListener('dragover', handleDragOver);
    videoDropzone.addEventListener('dragleave', handleDragLeave);
    videoDropzone.addEventListener('drop', handleDrop);
    
    return () => {
      videoDropzone.removeEventListener('dragenter', handleDragEnter);
      videoDropzone.removeEventListener('dragover', handleDragOver);
      videoDropzone.removeEventListener('dragleave', handleDragLeave);
      videoDropzone.removeEventListener('drop', handleDrop);
    };
  }, []);
  
  // Set up drag-and-drop event handlers for thumbnail
  useEffect(() => {
    const thumbnailDropzone = thumbnailDropzoneRef.current;
    if (!thumbnailDropzone) return;
    
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsThumbnailDragActive(true);
    };
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsThumbnailDragActive(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget === thumbnailDropzone) {
        setIsThumbnailDragActive(false);
      }
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsThumbnailDragActive(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, thumbnailFile: 'Image size should be less than 5MB' }));
          return;
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          setErrors(prev => ({ ...prev, thumbnailFile: 'Please upload a valid image (JPEG, PNG, GIF, WEBP)' }));
          return;
        }
        
        handleThumbnailFileChange({ target: { files: [file] } } as any);
        simulateUploadProgress(setThumbnailUploadProgress, setIsThumbnailUploading);
      }
    };
    
    thumbnailDropzone.addEventListener('dragenter', handleDragEnter);
    thumbnailDropzone.addEventListener('dragover', handleDragOver);
    thumbnailDropzone.addEventListener('dragleave', handleDragLeave);
    thumbnailDropzone.addEventListener('drop', handleDrop);
    
    return () => {
      thumbnailDropzone.removeEventListener('dragenter', handleDragEnter);
      thumbnailDropzone.removeEventListener('dragover', handleDragOver);
      thumbnailDropzone.removeEventListener('dragleave', handleDragLeave);
      thumbnailDropzone.removeEventListener('drop', handleDrop);
    };
  }, []);

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
      const basicFields = ['title', 'description', 'source', 'category'];
      const mediaFields = ['video_url', 'videoFile', 'thumbnail_url', 'thumbnailFile'];
      const detailsFields = ['duration', 'tags'];
      
      const hasBasicErrors = basicFields.some(field => errors[field]);
      const hasMediaErrors = mediaFields.some(field => errors[field]);
      const hasDetailsErrors = detailsFields.some(field => errors[field]);
      
      if (hasBasicErrors) {
        setActiveTab('basic');
      } else if (hasMediaErrors) {
        setActiveTab('media');
      } else if (hasDetailsErrors) {
        setActiveTab('details');
      }
      
      return;
    }
    
    try {
      let video_url = formData.video_url;
      let thumbnail_url = formData.thumbnail_url;

      if (videoFile) {
        video_url = await videoService.uploadVideo(videoFile);
      }

      if (thumbnailFile) {
        thumbnail_url = await videoService.uploadThumbnail(thumbnailFile);
      }

      const data = {
        ...formData,
        video_url,
        thumbnail_url,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        duration: Number(formData.duration) || null,
      };

      await onSubmit(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit form',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <VideoIcon className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            Details
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-base">Title*</Label>
              {errors.title && touchedFields.title && (
                <span className="text-destructive text-xs">{errors.title}</span>
              )}
            </div>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter video title"
              className={cn("mt-1", errors.title && touchedFields.title && "border-destructive")}
            />
            <p className="text-muted-foreground text-xs mt-1">
              A clear, descriptive title helps viewers find your video
            </p>
          </div>

          <div>
            <Label htmlFor="description" className="text-base">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what the video is about..."
              className="mt-1"
              rows={4}
            />
            <p className="text-muted-foreground text-xs mt-1">
              Provide details about the video content to help with search and context
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="source" className="text-base">Source*</Label>
                {errors.source && touchedFields.source && (
                  <span className="text-destructive text-xs">{errors.source}</span>
                )}
              </div>
              <Select 
                value={formData.source} 
                onValueChange={(value) => handleSelectChange('source', value)}
              >
                <SelectTrigger className={cn("mt-1", errors.source && touchedFields.source && "border-destructive")}>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs mt-1">
                Where the video content originated from
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="category" className="text-base">Category</Label>
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
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="is_livestream"
              checked={formData.is_livestream}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="is_livestream" className="text-base">This is a livestream</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle this if the video is a livestream rather than a recorded video</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button type="button" onClick={() => setActiveTab('media')}>
              Next: Media Files
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="media" className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base">Video*</Label>
              {(errors.video_url || errors.videoFile) && (
                <span className="text-destructive text-xs">{errors.video_url || errors.videoFile}</span>
              )}
            </div>
            
            {videoPreview ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <video 
                      src={videoPreview} 
                      controls
                      className="w-full aspect-video" 
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview(null);
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Card 
                    className={cn(
                      "border-dashed cursor-pointer transition-colors",
                      isVideoDragActive ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <CardContent className="p-0">
                      <div 
                        ref={videoDropzoneRef}
                        className="p-6"
                        onClick={() => document.getElementById('video')?.click()}
                      >
                        <Input
                          id="video"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center text-center">
                          <Film className={cn(
                            "h-10 w-10 mb-2 transition-colors",
                            isVideoDragActive ? "text-primary" : "text-muted-foreground"
                          )} />
                          {isVideoDragActive ? (
                            <p className="text-sm font-medium">Drop the video here</p>
                          ) : (
                            <>
                              <p className="text-sm font-medium mb-1">Drag & drop video here</p>
                              <p className="text-xs text-muted-foreground mb-2">or click to browse</p>
                              <p className="text-xs text-muted-foreground">MP4, WebM, Ogg (max. 100MB)</p>
                            </>
                          )}
                          
                          {isVideoUploading && (
                            <div className="w-full mt-4">
                              <Progress value={videoUploadProgress} className="h-2" />
                              <p className="text-xs text-center mt-1">{videoUploadProgress}% uploaded</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="video_url" className="text-base">Or use a video URL</Label>
                        {errors.video_url && touchedFields.video_url && (
                          <span className="text-destructive text-xs">{errors.video_url}</span>
                        )}
                      </div>
                      <div className="relative mt-1">
                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="video_url"
                          name="video_url"
                          value={formData.video_url}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className={cn("pl-10", errors.video_url && touchedFields.video_url && "border-destructive")}
                        />
                      </div>
                      <div className="flex flex-col space-y-1 mt-2">
                        <p className="text-xs text-muted-foreground">Supported platforms:</p>
                        <div className="flex space-x-2">
                          <Badge variant="outline">YouTube</Badge>
                          <Badge variant="outline">Vimeo</Badge>
                          <Badge variant="outline">Direct URL</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        if (formData.video_url && isValidUrl(formData.video_url)) {
                          // For YouTube URLs, try to extract video ID and set thumbnail
                          if (formData.video_url.includes('youtube.com') || formData.video_url.includes('youtu.be')) {
                            const videoId = extractYoutubeVideoId(formData.video_url);
                            if (videoId) {
                              setThumbnailPreview(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
                              setFormData(prev => ({ 
                                ...prev, 
                                thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
                              }));
                            }
                          }
                          
                          // Clear any errors
                          setErrors(prev => ({ ...prev, video_url: '' }));
                          
                          // Move to the next section
                          setActiveTab('details');
                        } else {
                          setErrors(prev => ({ ...prev, video_url: 'Please enter a valid URL' }));
                          markFieldAsTouched('video_url');
                        }
                      }}
                    >
                      Use this URL
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base">Thumbnail</Label>
              {errors.thumbnailFile && (
                <span className="text-destructive text-xs">{errors.thumbnailFile}</span>
              )}
            </div>
            
            {thumbnailPreview ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-48 object-cover" 
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview(null);
                          setFormData(prev => ({ ...prev, thumbnail_url: '' }));
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Card 
                    className={cn(
                      "border-dashed cursor-pointer transition-colors",
                      isThumbnailDragActive ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <CardContent className="p-0">
                      <div 
                        ref={thumbnailDropzoneRef}
                        className="p-6"
                        onClick={() => document.getElementById('thumbnail')?.click()}
                      >
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center text-center">
                          <Image className={cn(
                            "h-10 w-10 mb-2 transition-colors",
                            isThumbnailDragActive ? "text-primary" : "text-muted-foreground"
                          )} />
                          {isThumbnailDragActive ? (
                            <p className="text-sm font-medium">Drop the image here</p>
                          ) : (
                            <>
                              <p className="text-sm font-medium mb-1">Drag & drop thumbnail here</p>
                              <p className="text-xs text-muted-foreground mb-2">or click to browse</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, GIF or WEBP (max. 5MB)</p>
                            </>
                          )}
                          
                          {isThumbnailUploading && (
                            <div className="w-full mt-4">
                              <Progress value={thumbnailUploadProgress} className="h-2" />
                              <p className="text-xs text-center mt-1">{thumbnailUploadProgress}% uploaded</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="thumbnail_url" className="text-base">Or use a thumbnail URL</Label>
                        {errors.thumbnail_url && touchedFields.thumbnail_url && (
                          <span className="text-destructive text-xs">{errors.thumbnail_url}</span>
                        )}
                      </div>
                      <div className="relative mt-1">
                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="thumbnail_url"
                          name="thumbnail_url"
                          value={formData.thumbnail_url}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="https://example.com/thumbnail.jpg"
                          className={cn("pl-10", errors.thumbnail_url && touchedFields.thumbnail_url && "border-destructive")}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        For best results, use an image with a 16:9 aspect ratio
                      </p>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        if (formData.thumbnail_url && isValidUrl(formData.thumbnail_url)) {
                          setThumbnailPreview(formData.thumbnail_url);
                          setErrors(prev => ({ ...prev, thumbnail_url: '' }));
                        } else {
                          setErrors(prev => ({ ...prev, thumbnail_url: 'Please enter a valid URL' }));
                          markFieldAsTouched('thumbnail_url');
                        }
                      }}
                    >
                      Preview this URL
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={() => setActiveTab('basic')}>
              Back: Basic Info
            </Button>
            <Button type="button" onClick={() => setActiveTab('details')}>
              Next: Additional Details
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="duration" className="text-base">Duration (seconds)</Label>
              {errors.duration && touchedFields.duration && (
                <span className="text-destructive text-xs">{errors.duration}</span>
              )}
            </div>
            <div className="relative mt-1">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="duration"
                name="duration"
                type="number"
                min="0"
                value={formData.duration || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="120"
                className={cn("pl-10", errors.duration && touchedFields.duration && "border-destructive")}
              />
            </div>
            {formData.duration > 0 && (
              <p className="text-muted-foreground text-xs mt-1">
                Video length: {formatDuration(Number(formData.duration))}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tags" className="text-base">Tags (comma-separated)</Label>
              {errors.tags && touchedFields.tags && (
                <span className="text-destructive text-xs">{errors.tags}</span>
              )}
            </div>
            <div className="relative mt-1">
              <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="farming, crops, tutorial"
                className={cn("pl-10", errors.tags && touchedFields.tags && "border-destructive")}
              />
            </div>
            <p className="text-muted-foreground text-xs mt-1">
              Add relevant tags to help users find your video (e.g., farming, crops, tutorial)
            </p>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('media')}>
              Back: Media Files
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
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : video ? 'Update Video' : 'Create Video'}
        </Button>
      </div>
    </form>
  );
} 