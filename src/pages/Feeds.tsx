import React, { useEffect, useState } from 'react';
import { FeedPost, FeedComment, FeedReportReason } from '@/types/feeds';
import { useUser } from '@/lib/hooks/use-user';
import { supabase } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  MapPin, 
  Image as ImageIcon,
  Video,
  Calendar,
  ThumbsUp,
  Flag,
  Send,
  Camera,
  Video as VideoIcon,
  MapPin as LocationIcon
} from 'lucide-react';

const FEED_API = `${import.meta.env.VITE_API_URL || 'https://web-production-f9f0.up.railway.app'}/api/v1/feeds/posts/`;
const PAGE_SIZE = 20;

export default function Feeds() {
  const { user } = useUser();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [commentText, setCommentText] = useState<{ [postId: number]: string }>({});
  const [reporting, setReporting] = useState<{ postId: number; reason: FeedReportReason; description: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState<{ [postId: number]: boolean }>({});

  useEffect(() => {
    if (accessToken) {
      fetchPosts(1, true);
    }
    // eslint-disable-next-line
  }, [accessToken]);

  useEffect(() => {
    // Get access token on mount and when user changes
    async function fetchToken() {
      const { data } = await supabase.auth.getSession();
      setAccessToken(data.session?.access_token || null);
    }
    fetchToken();
  }, [user]);

  async function fetchPosts(pageNum = 1, reset = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${FEED_API}?page=${pageNum}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.status === 401) {
        setError('You must be logged in to view the feed.');
        setPosts([]);
        return;
      }
      if (!res.ok) {
        setError('Failed to load feed.');
        setPosts([]);
        return;
      }
      const data = await res.json();
      const results = Array.isArray(data.results) ? data.results : [];
      if (reset) {
        setPosts(results);
      } else {
        setPosts((prev) => [...prev, ...results]);
      }
      setHasMore(!!data.next);
      setPage(pageNum);
    } catch (e) {
      setError('Error loading feed.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePost() {
    if (!newPostText && newPostImages.length === 0) return;
    const formData = new FormData();
    formData.append('text', newPostText);
    newPostImages.forEach((img) => formData.append('images', img));
    const res = await fetch(FEED_API, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });
    if (res.ok) {
      setNewPostText('');
      setNewPostImages([]);
      fetchPosts(1, true);
      toast({ title: 'Post created successfully! 🎉' });
    } else if (res.status === 401) {
      setError('You must be logged in to create a post.');
    } else {
      toast({ title: 'Failed to create post', variant: 'destructive' });
    }
  }

  async function handleLike(postId: number) {
    const res = await fetch(`${FEED_API}${postId}/like/`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (res.ok) fetchPosts(1, true);
    else if (res.status === 401) setError('You must be logged in to like posts.');
  }

  async function handleDelete(postId: number) {
    const res = await fetch(`${FEED_API}${postId}/`, {
      method: 'DELETE',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (res.ok) fetchPosts(1, true);
    else if (res.status === 401) setError('You must be logged in to delete posts.');
  }

  async function handleAddComment(postId: number) {
    const text = commentText[postId];
    if (!text) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://web-production-f9f0.up.railway.app'}/api/v1/feeds/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ post: postId, text }),
    });
    if (res.ok) {
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      setShowCommentInput((prev) => ({ ...prev, [postId]: false }));
      fetchPosts(1, true);
      toast({ title: 'Comment added! 💬' });
    } else if (res.status === 401) setError('You must be logged in to comment.');
  }

  async function handleReport(postId: number, reason: FeedReportReason, description: string) {
    const res = await fetch(`${FEED_API}${postId}/report/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ reason, description }),
    });
    if (res.ok) {
      setReporting(null);
      toast({ title: 'Post reported successfully' });
    } else if (res.status === 401) setError('You must be logged in to report posts.');
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getUserInitials = (userName: string) => {
    return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewPostImages(prev => [...prev, ...files]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Create Post Card */}
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {getUserInitials(user?.email || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="What's on your mind? Share your farming experience..."
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      className="min-h-[100px] border-0 resize-none focus:ring-0 text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>
                
                {/* Media Upload Preview */}
                {newPostImages.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {newPostImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded"
                          />
                          <button
                            onClick={() => setNewPostImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    <label className="flex items-center space-x-2 text-gray-600 hover:text-green-600 cursor-pointer">
                      <Camera className="h-5 w-5" />
                      <span className="text-sm">Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <label className="flex items-center space-x-2 text-gray-600 hover:text-green-600 cursor-pointer">
                      <VideoIcon className="h-5 w-5" />
                      <span className="text-sm">Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                      />
                    </label>
                    <div className="flex items-center space-x-2 text-gray-600 hover:text-green-600 cursor-pointer">
                      <LocationIcon className="h-5 w-5" />
                      <span className="text-sm">Location</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostText && newPostImages.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Feed Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {getUserInitials(post.user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{post.user}</h3>
                            {post.user === 'admin@admin.com' && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatTimeAgo(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-800 mb-4 leading-relaxed">{post.text}</p>
                    
                    {/* Media Display */}
                    {post.images && post.images.length > 0 && (
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.map((image, index) => (
                            <img
                              key={index}
                              src={image.image}
                              alt="Post media"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Interaction Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span>{post.likes_count} likes</span>
                        <span>{post.comments?.length || 0} comments</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 ${
                            post.is_liked ? 'text-red-500' : 'text-gray-600'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                          <span>Like</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCommentInput(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                          className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Comment</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReporting({ postId: post.id, reason: 'spam', description: '' })}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Comment Input */}
                    {showCommentInput[post.id] && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                              {getUserInitials(user?.email || 'User')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Input
                              placeholder="Write a comment..."
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                              className="border-gray-200 focus:border-green-500"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentText[post.id]}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Comments Display */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                {getUserInitials(comment.user)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm text-gray-900">{comment.user}</span>
                                  <span className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading posts...</p>
                </div>
              )}
              
              {!loading && posts.length === 0 && !error && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <MessageCircle className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500">Be the first to share your farming experience!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
