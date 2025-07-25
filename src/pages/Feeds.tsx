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

const FEED_API = '/api/v1/feeds/posts/';
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
      // For debugging:
      // console.error('Feed fetch error:', e, 'accessToken:', accessToken);
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
      toast({ title: 'Post created' });
    } else if (res.status === 401) {
      setError('You must be logged in to create a post.');
    } else {
      toast({ title: 'Failed to create post' });
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
    const res = await fetch('/api/v1/feeds/comments/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ post: postId, text }),
    });
    if (res.ok) {
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      fetchPosts(1, true);
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
      toast({ title: 'Reported' });
    } else if (res.status === 401) setError('You must be logged in to report posts.');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto py-6 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Feeds</h1>
            </div>
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
            )}
            <div className="mb-6 p-4 bg-white rounded shadow">
              <Textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="What's on your mind?"
              />
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setNewPostImages(Array.from(e.target.files || []))}
              />
              <Button onClick={handleCreatePost} className="mt-2">Post</Button>
            </div>
            {Array.isArray(posts) && posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="mb-6 p-4 bg-white rounded shadow">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{post.user}</span>
                    {user?.id === post.user && (
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
                    )}
                  </div>
                  <p className="mt-2 mb-2">{post.text}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.images.map((img) => (
                      <img key={img.id} src={img.image} alt="feed" className="w-32 h-32 object-cover rounded" loading="lazy" />
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <Button size="sm" onClick={() => handleLike(post.id)}>
                      {post.is_liked ? 'Unlike' : 'Like'} ({post.likes_count})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setReporting({ postId: post.id, reason: 'spam', description: '' })}>
                      Report
                    </Button>
                  </div>
                  <div className="ml-4">
                    {post.comments.map((comment) => (
                      <CommentThread key={comment.id} comment={comment} postId={post.id} />
                    ))}
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Add a comment..."
                      />
                      <Button size="sm" onClick={() => handleAddComment(post.id)}>Comment</Button>
                    </div>
                  </div>
                </div>
              ))
            ) : !loading && !error ? (
              <div className="text-center text-gray-500">No posts found.</div>
            ) : null}
            {hasMore && !loading && !error && (
              <Button onClick={() => fetchPosts(page + 1)} className="w-full">Load More</Button>
            )}
            {loading && <div className="text-center text-gray-400">Loading...</div>}
            {/* Report Modal */}
            {reporting && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow w-96">
                  <h2 className="font-bold mb-2">Report Post</h2>
                  <select
                    className="w-full mb-2"
                    value={reporting.reason}
                    onChange={(e) => setReporting((prev) => prev && { ...prev, reason: e.target.value as FeedReportReason })}
                  >
                    <option value="spam">Spam</option>
                    <option value="abuse">Abusive Content</option>
                    <option value="misinfo">Misinformation</option>
                    <option value="other">Other</option>
                  </select>
                  <Textarea
                    value={reporting.description}
                    onChange={(e) => setReporting((prev) => prev && { ...prev, description: e.target.value })}
                    placeholder="Describe the issue (optional)"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => handleReport(reporting.postId, reporting.reason, reporting.description)}>Submit</Button>
                    <Button variant="outline" onClick={() => setReporting(null)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function CommentThread({ comment, postId }: { comment: FeedComment; postId: number }) {
  // Recursive threaded comment rendering
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{comment.user}</span>
        <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
      </div>
      <div className="ml-4">
        <p>{comment.text}</p>
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4 border-l pl-2">
            {comment.replies.map((reply) => (
              <CommentThread key={reply.id} comment={reply} postId={postId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
