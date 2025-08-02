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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Image as ImageIcon,
  Calendar,
  Flag,
  Send,
  Camera,
  Trash2,
  Edit,
  Copy,
  Mail,
  ExternalLink,
  Eye,
  EyeOff,
  Search
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<FeedPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (accessToken) {
      fetchPosts(1, true);
    }
    // eslint-disable-next-line
  }, [accessToken]);

  // Filter posts based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
      setIsSearching(false);
    } else {
      const filtered = posts.filter(post => 
        post.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
      setIsSearching(true);
    }
  }, [posts, searchQuery]);

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

  async function handleAdminHide(postId: number) {
    const res = await fetch(`${FEED_API}${postId}/hide/`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (res.ok) {
      fetchPosts(1, true);
      toast({ title: 'Post hidden successfully! 👁️' });
    } else if (res.status === 401) {
      setError('You must be logged in as admin to hide posts.');
    } else {
      toast({ title: 'Failed to hide post', variant: 'destructive' });
    }
  }

  async function handleAdminUnhide(postId: number) {
    const res = await fetch(`${FEED_API}${postId}/unhide/`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (res.ok) {
      fetchPosts(1, true);
      toast({ title: 'Post unhidden successfully! 👁️' });
    } else if (res.status === 401) {
      setError('You must be logged in as admin to unhide posts.');
    } else {
      toast({ title: 'Failed to unhide post', variant: 'destructive' });
    }
  }

  async function handleAdminDelete(postId: number) {
    const res = await fetch(`${FEED_API}${postId}/admin_delete/`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (res.ok) {
      fetchPosts(1, true);
      toast({ title: 'Post deleted by admin! 🗑️' });
    } else if (res.status === 401) {
      setError('You must be logged in as admin to delete posts.');
    } else {
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
  }

  async function handleAddComment(postId: number) {
    const text = commentText[postId];
    if (!text) return;
    
    console.log('Adding comment:', { post: postId, text });
    
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://web-production-f9f0.up.railway.app'}/api/v1/feeds/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ post: postId, text }),
    });
    
    console.log('Comment response status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('Comment added successfully:', data);
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      setShowCommentInput((prev) => ({ ...prev, [postId]: false }));
      fetchPosts(1, true);
      toast({ title: 'Comment added! 💬' });
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('Comment error:', errorData);
      if (res.status === 401) {
        setError('You must be logged in to comment.');
      } else {
        toast({ title: 'Failed to add comment', description: errorData.detail || 'Unknown error', variant: 'destructive' });
      }
    }
  }

  async function handleReport(postId: number, reason: FeedReportReason, description: string) {
    console.log('Reporting post:', { postId, reason, description });
    
    const res = await fetch(`${FEED_API}${postId}/report/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ reason, description }),
    });
    
    console.log('Report response status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('Report submitted successfully:', data);
      setReporting(null);
      toast({ title: 'Post reported successfully' });
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('Report error:', errorData);
      if (res.status === 401) {
        setError('You must be logged in to report posts.');
      } else {
        toast({ title: 'Failed to report post', description: errorData.detail || 'Unknown error', variant: 'destructive' });
      }
    }
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
    // Only accept image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setNewPostImages(prev => [...prev, ...imageFiles]);
  };

  const handleShare = async (post: any) => {
    const postUrl = `${window.location.origin}/feeds/post/${post.id}`;
    const shareText = `Check out this post on Baykart: ${post.text?.substring(0, 100)}${post.text?.length > 100 ? '...' : ''}`;
    
    try {
      // Try native sharing first (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: 'Baykart Post',
          text: shareText,
          url: postUrl,
        });
        toast({ title: 'Shared successfully! 📤' });
        return;
      }
    } catch (error) {
      console.log('Native sharing not available or cancelled');
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${postUrl}`);
      toast({ title: 'Link copied to clipboard! 📋' });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({ title: 'Failed to copy link', variant: 'destructive' });
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      action: (post: any) => {
        const postUrl = `${window.location.origin}/feeds/post/${post.id}`;
        navigator.clipboard.writeText(postUrl);
        toast({ title: 'Link copied to clipboard! 📋' });
      }
    },
    {
      name: 'Share on WhatsApp',
      icon: ExternalLink,
      action: (post: any) => {
        const text = encodeURIComponent(`Check out this post on Baykart: ${post.text?.substring(0, 100)}${post.text?.length > 100 ? '...' : ''}`);
        const url = encodeURIComponent(`${window.location.origin}/feeds/post/${post.id}`);
        window.open(`https://wa.me/?text=${text}%0A%0A${url}`, '_blank');
      }
    },
    {
      name: 'Share on Facebook',
      icon: ExternalLink,
      action: (post: any) => {
        const url = encodeURIComponent(`${window.location.origin}/feeds/post/${post.id}`);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
      }
    },
    {
      name: 'Share on Twitter',
      icon: ExternalLink,
      action: (post: any) => {
        const text = encodeURIComponent(`Check out this post on Baykart: ${post.text?.substring(0, 100)}${post.text?.length > 100 ? '...' : ''}`);
        const url = encodeURIComponent(`${window.location.origin}/feeds/post/${post.id}`);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
      }
    },
    {
      name: 'Share via Email',
      icon: Mail,
      action: (post: any) => {
        const subject = encodeURIComponent('Check out this Baykart post!');
        const body = encodeURIComponent(`I found this interesting post on Baykart:\n\n"${post.text}"\n\nView it here: ${window.location.origin}/feeds/post/${post.id}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
      }
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search posts by user or text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4"
                  />
                </div>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </Button>
                )}
              </div>
              {isSearching && (
                <div className="mt-2 text-sm text-gray-500">
                  Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </div>
              )}
            </div>

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
              {filteredPosts.map((post) => (
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
                            {post.is_hidden && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                Hidden
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user?.email === post.user && (
                              <DropdownMenuItem onClick={() => handleDelete(post.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Post
                              </DropdownMenuItem>
                            )}
                            {/* Admin options */}
                            {user?.email === 'admin@admin.com' && (
                              <>
                                {post.is_hidden ? (
                                  <DropdownMenuItem onClick={() => handleAdminUnhide(post.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Unhide Post
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleAdminHide(post.id)}>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Hide Post
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleAdminDelete(post.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete (Admin)
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => setReporting({ postId: post.id, reason: 'spam', description: '' })}>
                              <Flag className="h-4 w-4 mr-2" />
                              Report Post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                            >
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {shareOptions.map((option, index) => (
                              <DropdownMenuItem 
                                key={index}
                                onClick={() => option.action(post)}
                                className="cursor-pointer"
                              >
                                <option.icon className="h-4 w-4 mr-2" />
                                {option.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              
              {!loading && filteredPosts.length === 0 && !error && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <MessageCircle className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isSearching ? 'No posts found' : 'No posts yet'}
                  </h3>
                  <p className="text-gray-500">
                    {isSearching 
                      ? `No posts match your search for "${searchQuery}"`
                      : 'Be the first to share your farming experience!'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
