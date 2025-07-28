import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Search, Filter, Eye, Calendar, User, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { getAuditLogs, getAuditLogStats, AuditLog, AuditLogStats } from "@/lib/auditService";

const AuditLogs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState({
    action: 'all',
    model_name: '',
    user_email: '',
    has_changes: 'all',
    date_from: '',
    date_to: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    count: 0,
  });

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsData, statsData] = await Promise.all([
        getAuditLogs({
          page: pagination.page,
          page_size: pagination.page_size,
          action: filters.action === 'all' ? undefined : filters.action,
          model_name: filters.model_name,
          user_email: filters.user_email,
          date_from: filters.date_from,
          date_to: filters.date_to,
          has_changes: filters.has_changes === 'all' ? undefined : filters.has_changes === 'true' ? true : filters.has_changes === 'false' ? false : undefined,
        }),
        getAuditLogStats(),
      ]);

      setLogs(logsData.results);
      setPagination(prev => ({ ...prev, count: logsData.count }));
      setStats(statsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800',
      'VIEW': 'bg-gray-100 text-gray-800',
      'LOGIN': 'bg-purple-100 text-purple-800',
      'LOGOUT': 'bg-orange-100 text-orange-800',
      'ERROR': 'bg-red-100 text-red-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderJsonData = (data: any) => {
    if (!data) return <span className="text-gray-500">No data</span>;
    return (
      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Audit Logs</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Track all user actions and system changes
              </p>
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_logs.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.logs_today}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Week</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.logs_this_week}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.logs_this_month}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Action</label>
                    <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All actions</SelectItem>
                        <SelectItem value="CREATE">Create</SelectItem>
                        <SelectItem value="UPDATE">Update</SelectItem>
                        <SelectItem value="DELETE">Delete</SelectItem>
                        <SelectItem value="VIEW">View</SelectItem>
                        <SelectItem value="LOGIN">Login</SelectItem>
                        <SelectItem value="LOGOUT">Logout</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Model</label>
                    <Input
                      placeholder="Filter by model"
                      value={filters.model_name}
                      onChange={(e) => handleFilterChange('model_name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">User Email</label>
                    <Input
                      placeholder="Filter by user"
                      value={filters.user_email}
                      onChange={(e) => handleFilterChange('user_email', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Has Changes</label>
                    <Select value={filters.has_changes} onValueChange={(value) => handleFilterChange('has_changes', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All logs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All logs</SelectItem>
                        <SelectItem value="true">With changes</SelectItem>
                        <SelectItem value="false">Without changes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date From</label>
                    <Input
                      type="datetime-local"
                      value={filters.date_from}
                      onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date To</label>
                    <Input
                      type="datetime-local"
                      value={filters.date_to}
                      onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs ({pagination.count.toLocaleString()})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Object ID</TableHead>
                        <TableHead>Changes</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {log.user_email || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getActionColor(log.action)}>
                              {log.action_display}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.model_name}</TableCell>
                          <TableCell className="text-sm font-mono">{log.object_id}</TableCell>
                          <TableCell>
                            {log.has_changes ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                ✓ Changes
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                No changes
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{log.ip_address || '-'}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedLog(log)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Audit Log Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="font-medium">Action:</label>
                                      <p>{log.action_display}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium">User:</label>
                                      <p>{log.user_email || 'Unknown'}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium">Model:</label>
                                      <p>{log.model_name}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium">Object ID:</label>
                                      <p className="font-mono">{log.object_id}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium">Timestamp:</label>
                                      <p>{formatTimestamp(log.timestamp)}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium">IP Address:</label>
                                      <p>{log.ip_address || 'Unknown'}</p>
                                    </div>
                                  </div>

                                  {log.description && (
                                    <div>
                                      <label className="font-medium">Description:</label>
                                      <p>{log.description}</p>
                                    </div>
                                  )}

                                  {log.changed_fields && log.changed_fields.length > 0 && (
                                    <div>
                                      <label className="font-medium">Changed Fields:</label>
                                      <p>{log.changed_fields.join(', ')}</p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="font-medium">Old Values:</label>
                                      {renderJsonData(log.old_values)}
                                    </div>
                                    <div>
                                      <label className="font-medium">New Values:</label>
                                      {renderJsonData(log.new_values)}
                                    </div>
                                  </div>

                                  {log.request_path && (
                                    <div>
                                      <label className="font-medium">Request Path:</label>
                                      <p className="font-mono text-sm">{log.request_path}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.count > pagination.page_size && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.page_size) + 1} to{' '}
                      {Math.min(pagination.page * pagination.page_size, pagination.count)} of{' '}
                      {pagination.count} results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page * pagination.page_size >= pagination.count}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuditLogs; 