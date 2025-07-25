import React, { useEffect, useState } from 'react';
import { FeedReport, FeedPost, FeedReportReason } from '@/types/feeds';
import { useUser } from '@/lib/hooks/use-user';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const REPORTS_API = '/api/feeds/reports/';
const POSTS_API = '/api/feeds/posts/';

export default function FeedReports() {
  const { user } = useUser();
  const [reports, setReports] = useState<FeedReport[]>([]);
  const [posts, setPosts] = useState<{ [id: number]: FeedPost }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchReports();
    // eslint-disable-next-line
  }, [user]);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch(REPORTS_API, {
        headers: { Authorization: `Bearer ${user?.access_token}` },
      });
      const data = await res.json();
      setReports(data.results || data);
      // Fetch posts for each report
      for (const report of data.results || data) {
        if (!posts[report.post]) fetchPost(report.post);
      }
    } catch (e) {
      toast({ title: 'Error loading reports' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchPost(postId: number) {
    const res = await fetch(`${POSTS_API}${postId}/`, {
      headers: { Authorization: `Bearer ${user?.access_token}` },
    });
    if (res.ok) {
      const post = await res.json();
      setPosts((prev) => ({ ...prev, [postId]: post }));
    }
  }

  async function handleResolve(reportId: number) {
    const res = await fetch(`${REPORTS_API}${reportId}/resolve/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user?.access_token}` },
    });
    if (res.ok) {
      toast({ title: 'Report resolved' });
      fetchReports();
    }
  }

  async function handleDeletePost(reportId: number) {
    const res = await fetch(`${REPORTS_API}${reportId}/delete_post/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user?.access_token}` },
    });
    if (res.ok) {
      toast({ title: 'Post deleted' });
      fetchReports();
    }
  }

  async function handleBanUser(reportId: number) {
    const res = await fetch(`${REPORTS_API}${reportId}/ban_user/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user?.access_token}` },
    });
    if (res.ok) {
      toast({ title: 'User banned' });
      fetchReports();
    }
  }

  if (user?.role !== 'admin') {
    return <div className="container mx-auto py-6"><h1 className="text-2xl font-bold">Feed Reports</h1><p>Access denied.</p></div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Feed Reports</h1>
      {loading && <p>Loading...</p>}
      {reports.length === 0 && !loading && <p>No reports found.</p>}
      {reports.map((report) => (
        <div key={report.id} className="mb-6 p-4 bg-white rounded shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Reported by: {report.user}</span>
            <span className="text-xs text-gray-500">{new Date(report.created_at).toLocaleString()}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Reason:</span> {report.reason}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Description:</span> {report.description || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Status:</span> {report.is_resolved ? 'Resolved' : 'Pending'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Reported Post:</span>
            <div className="p-2 bg-gray-50 rounded mt-1">
              {posts[report.post] ? (
                <>
                  <div className="font-semibold">{posts[report.post].user}</div>
                  <div>{posts[report.post].text}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {posts[report.post].images.map((img) => (
                      <img key={img.id} src={img.image} alt="feed" className="w-24 h-24 object-cover rounded" loading="lazy" />
                    ))}
                  </div>
                </>
              ) : (
                <span>Loading post...</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            {!report.is_resolved && <Button onClick={() => handleResolve(report.id)}>Resolve</Button>}
            <Button variant="destructive" onClick={() => handleDeletePost(report.id)}>Delete Post</Button>
            <Button variant="outline" onClick={() => handleBanUser(report.id)}>Ban User</Button>
          </div>
        </div>
      ))}
    </div>
  );
} 