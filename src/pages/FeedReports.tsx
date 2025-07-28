import React, { useEffect, useState } from 'react';
import { FeedReport, FeedPost, FeedReportReason } from '@/types/feeds';
import { useUser } from '@/lib/hooks/use-user';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronRight, Eye, CheckCircle, Trash2, UserX, Filter, Search } from 'lucide-react';

const REPORTS_API = '/api/v1/feeds/reports/';
const POSTS_API = '/api/v1/feeds/posts/';
const ME_API = '/api/v1/auth/me/';

interface ReportFilters {
  status: string;
  reason: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export default function FeedReports() {
  const { user } = useUser();
  const [reports, setReports] = useState<FeedReport[]>([]);
  const [posts, setPosts] = useState<{ [id: number]: FeedPost }>({});
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [expandedReports, setExpandedReports] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<ReportFilters>({
    status: 'all',
    reason: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [showDemo, setShowDemo] = useState(false);

  // Demo data for testing the UI
  const demoReports: FeedReport[] = [
    {
      id: 1,
      user: 'farmer123@gambia.com',
      post: 1,
      reason: 'misinfo',
      description: 'This post contains false information about pesticide use that could harm crops',
      is_resolved: false,
      reviewed: false,
      created_at: '2025-01-27T14:30:25Z'
    },
    {
      id: 2,
      user: 'agri_expert@mail.com',
      post: 2,
      reason: 'spam',
      description: 'User is posting same content repeatedly',
      is_resolved: true,
      reviewed: true,
      reviewed_at: '2025-01-27T16:00:00Z',
      created_at: '2025-01-27T15:45:12Z'
    },
    {
      id: 3,
      user: 'admin@admin.com',
      post: 3,
      reason: 'abuse',
      description: 'Misleading information about farming practices',
      is_resolved: false,
      reviewed: false,
      created_at: '2025-01-27T16:20:33Z'
    }
  ];

  const demoPosts: { [id: number]: FeedPost } = {
    1: {
      id: 1,
      user: 'admin@admin.com',
      text: 'i want to start my own banna farm',
      images: [{ id: 1, image: 'https://via.placeholder.com/150x150?text=Banana+Farm', uploaded_at: '2025-01-27T10:00:00Z' }],
      comments: [],
      likes_count: 0,
      is_liked: false,
      created_at: '2025-01-27T10:00:00Z',
      updated_at: '2025-01-27T10:00:00Z',
      is_deleted: false
    },
    2: {
      id: 2,
      user: 'spam_user@example.com',
      text: 'Buy my amazing farming products! Click here!',
      images: [],
      comments: [],
      likes_count: 0,
      is_liked: false,
      created_at: '2025-01-27T11:00:00Z',
      updated_at: '2025-01-27T11:00:00Z',
      is_deleted: false
    },
    3: {
      id: 3,
      user: 'new_farmer@mail.com',
      text: 'Best way to grow tomatoes without any pesticides',
      images: [{ id: 2, image: 'https://via.placeholder.com/150x150?text=Tomatoes', uploaded_at: '2025-01-27T12:00:00Z' }],
      comments: [],
      likes_count: 0,
      is_liked: false,
      created_at: '2025-01-27T12:00:00Z',
      updated_at: '2025-01-27T12:00:00Z',
      is_deleted: false
    }
  };

  useEffect(() => {
    async function fetchMeAndReports() {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        setAccessToken(token || null);
        if (!token) {
          setCheckingAuth(false);
          return;
        }
        
        const meRes = await fetch(ME_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (meRes.ok) {
          const me = await meRes.json();
          console.log('Django /api/v1/auth/me/ result:', me);
          const adminStatus = !!me.is_staff || !!me.is_superuser;
          setIsAdmin(adminStatus);
          console.log('isAdmin:', adminStatus);
          if (adminStatus) {
            fetchReports(token);
          }
        } else {
          console.error('Failed to fetch user profile:', meRes.status, meRes.statusText);
        }
      } catch (e) {
        console.error('Error checking admin status:', e);
      } finally {
        setCheckingAuth(false);
      }
    }
    fetchMeAndReports();
  }, [user]);

  async function fetchReports(token: string) {
    setLoading(true);
    try {
      const res = await fetch(REPORTS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error('Failed to fetch reports:', res.status, res.statusText);
        toast({ title: 'Error loading reports', variant: 'destructive' });
        return;
      }
      const data = await res.json();
      setReports(data.results || data);
      // Fetch posts for each report
      for (const report of data.results || data) {
        if (!posts[report.post]) fetchPost(report.post, token);
      }
    } catch (e) {
      console.error('Error fetching reports:', e);
      toast({ title: 'Error loading reports', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchPost(postId: number, token: string) {
    try {
    const res = await fetch(`${POSTS_API}${postId}/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const post = await res.json();
      setPosts((prev) => ({ ...prev, [postId]: post }));
      } else {
        console.error('Failed to fetch post:', res.status, res.statusText);
      }
    } catch (e) {
      console.error('Error fetching post:', e);
    }
  }

  async function handleResolve(reportId: number) {
    if (!accessToken) return;
    try {
    const res = await fetch(`${REPORTS_API}${reportId}/resolve/`, {
      method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      toast({ title: 'Report resolved' });
        fetchReports(accessToken);
      } else {
        toast({ title: 'Failed to resolve report', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error resolving report', variant: 'destructive' });
    }
  }

  async function handleDeletePost(reportId: number) {
    if (!accessToken) return;
    try {
    const res = await fetch(`${REPORTS_API}${reportId}/delete_post/`, {
      method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      toast({ title: 'Post deleted' });
        fetchReports(accessToken);
      } else {
        toast({ title: 'Failed to delete post', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error deleting post', variant: 'destructive' });
    }
  }

  async function handleBanUser(reportId: number) {
    if (!accessToken) return;
    try {
    const res = await fetch(`${REPORTS_API}${reportId}/ban_user/`, {
      method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      toast({ title: 'User banned' });
        fetchReports(accessToken);
      } else {
        toast({ title: 'Failed to ban user', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error banning user', variant: 'destructive' });
    }
  }

  const toggleExpanded = (reportId: number) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  // Use demo data if no real reports exist
  const reportsToShow = reports.length > 0 ? reports : (showDemo ? demoReports : []);
  const postsToShow = reports.length > 0 ? posts : (showDemo ? demoPosts : {});

  const filteredReports = reportsToShow.filter(report => {
    const matchesStatus = filters.status === 'all' || report.is_resolved === (filters.status === 'resolved');
    const matchesReason = filters.reason === 'all' || report.reason === filters.reason;
    const matchesSearch = !filters.search || 
      report.user.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDateFrom = !filters.dateFrom || new Date(report.created_at) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(report.created_at) <= new Date(filters.dateTo);
    
    return matchesStatus && matchesReason && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const getStatusBadge = (isResolved: boolean) => (
    <Badge variant={isResolved ? "default" : "secondary"}>
      {isResolved ? "Resolved" : "Pending"}
    </Badge>
  );

  const getReasonBadge = (reason: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'spam': 'secondary',
      'abuse': 'destructive',
      'misinfo': 'outline',
      'other': 'default'
    };
    return <Badge variant={variants[reason] || 'default'}>{reason.replace('_', ' ')}</Badge>;
  };

  if (checkingAuth) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">Feed Reports</h1>
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">Feed Reports</h1>
        <p>Access denied. You need admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Feed Reports</h1>
              <div className="text-sm text-gray-500">
                {filteredReports.length} of {reports.length} reports
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Search</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search reports..."
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                        className="pl-8"
                      />
                    </div>
          </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select value={filters.status} onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
          </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Reason</label>
                    <Select value={filters.reason} onValueChange={(value) => setFilters(f => ({ ...f, reason: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reasons</SelectItem>
                        <SelectItem value="spam">Spam</SelectItem>
                        <SelectItem value="abuse">Abuse</SelectItem>
                        <SelectItem value="misinfo">Misinformation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
          </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">From Date</label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                    />
          </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">To Date</label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading && <p className="text-center py-4">Loading reports...</p>}
            
            {filteredReports.length === 0 && !loading && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No reports found matching your filters.</p>
                  {reports.length === 0 && (
                    <Button onClick={() => setShowDemo(!showDemo)} variant="outline">
                      {showDemo ? 'Hide Demo' : 'Show Demo Interface'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reports Table */}
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <Collapsible open={expandedReports.has(report.id)}>
                    <CollapsibleTrigger asChild>
                      <div className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="w-8">
                                {expandedReports.has(report.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                {new Date(report.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{report.user}</TableCell>
                              <TableCell>{getReasonBadge(report.reason)}</TableCell>
                              <TableCell>{getStatusBadge(report.is_resolved)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpanded(report.id);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  {!report.is_resolved && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleResolve(report.id);
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Resolve
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="p-6 border-t bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Report Details */}
                          <div>
                            <h3 className="font-semibold mb-3">Report Details</h3>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">Reported by:</span> {report.user}</div>
                              <div><span className="font-medium">Time:</span> {new Date(report.created_at).toLocaleString()}</div>
                              <div><span className="font-medium">Reason:</span> {report.reason}</div>
                              <div><span className="font-medium">Description:</span> {report.description || 'N/A'}</div>
                              <div><span className="font-medium">Status:</span> {getStatusBadge(report.is_resolved)}</div>
                            </div>
                          </div>

                          {/* Reported Post */}
                          <div>
                            <h3 className="font-semibold mb-3">Reported Post</h3>
                            {postsToShow[report.post] ? (
                              <Card>
                                <CardContent className="p-4">
                                  <div className="font-semibold mb-2">{postsToShow[report.post].user}</div>
                                  <div className="text-sm mb-3">{postsToShow[report.post].text}</div>
                                  {postsToShow[report.post].images && postsToShow[report.post].images.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {postsToShow[report.post].images.map((img) => (
                                        <img 
                                          key={img.id} 
                                          src={img.image} 
                                          alt="feed" 
                                          className="w-20 h-20 object-cover rounded" 
                                          loading="lazy" 
                                        />
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ) : (
                              <p className="text-gray-500">Loading post...</p>
              )}
            </div>
          </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          {!report.is_resolved && (
                            <Button onClick={() => handleResolve(report.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve Report
                            </Button>
                          )}
                          <Button variant="destructive" onClick={() => handleDeletePost(report.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Post
                          </Button>
                          <Button variant="outline" onClick={() => handleBanUser(report.id)}>
                            <UserX className="h-4 w-4 mr-2" />
                            Ban User
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </div>
        </main>
        </div>
    </div>
  );
}; 