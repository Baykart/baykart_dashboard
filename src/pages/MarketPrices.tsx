import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Pagination, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  getMarketPrices,
  createMarketPrice,
  updateMarketPrice,
  deleteMarketPrice,
  getMarketPriceTrends,
  MarketPriceInput
} from "@/lib/marketService";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const isAdmin = (user) => user?.role === 'admin' || user?.email?.endsWith('@baykart.com'); // Placeholder

const MarketPrices = () => {
  const [user, setUser] = useState<any>(null);
  const [marketPrices, setMarketPrices] = useState([]);
  const [marketPriceFilters, setMarketPriceFilters] = useState({ crop: "__all__", market: "__all__", startDate: "", endDate: "", search: "" });
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [trendCrop, setTrendCrop] = useState("");
  const [trendMarket, setTrendMarket] = useState("");
  const [trendLoading, setTrendLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState("");

  // Analytics
  const [analytics, setAnalytics] = useState({ min: null, max: null, avg: null, latest: null, change: null });

  // Form
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MarketPriceInput>({ defaultValues: { currency: 'INR', unit: 'kg' } });

  // Remove this dummy user fetch:
  // useEffect(() => {
  //   const u = JSON.parse(localStorage.getItem('user') || '{}');
  //   setUser(u);
  // }, []);
  // Instead, use real user context or leave as null for now.

  // Fetch market prices
  useEffect(() => { fetchData(); }, [marketPriceFilters]);
  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getMarketPrices();
      setMarketPrices(data);
      computeAnalytics(data);
    } catch (e) {
      setError("Failed to load market prices");
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics calculation
  const computeAnalytics = (data) => {
    if (!data.length) return setAnalytics({ min: null, max: null, avg: null, latest: null, change: null });
    const filtered = data.filter(mp =>
      (!marketPriceFilters.crop || mp.crop === marketPriceFilters.crop) &&
      (!marketPriceFilters.market || mp.market === marketPriceFilters.market)
    );
    if (!filtered.length) return setAnalytics({ min: null, max: null, avg: null, latest: null, change: null });
    const prices = filtered.map(mp => mp.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const latest = filtered[0];
    const prev = filtered[1];
    const change = prev ? ((latest.price - prev.price) / prev.price) * 100 : null;
    setAnalytics({ min, max, avg, latest, change });
  };

  // Chart
  const fetchTrend = async () => {
    setTrendLoading(true);
    try {
      const data = await getMarketPriceTrends(trendCrop, 30);
      setTrendData(data);
    } finally {
      setTrendLoading(false);
    }
  };

  // CRUD
  const onAdd = () => { setEditing(null); reset({ currency: 'INR', unit: 'kg' }); setShowDialog(true); };
  const onEdit = (mp) => { setEditing(mp); reset(mp); setShowDialog(true); };
  const onDelete = async (id) => {
    if (!window.confirm('Delete this market price?')) return;
    setIsLoading(true);
    try {
      await deleteMarketPrice(id);
      fetchData();
    } finally { setIsLoading(false); }
  };
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (editing) {
        await updateMarketPrice(editing.id, data);
      } else {
        await createMarketPrice(data);
      }
      setShowDialog(false);
      fetchData();
    } finally { setIsLoading(false); }
  };

  // Filtering, pagination
  const filtered = marketPrices.filter(mp => {
    const search = marketPriceFilters.search.toLowerCase();
    return (
      (marketPriceFilters.crop === "__all__" || mp.crop === marketPriceFilters.crop) &&
      (marketPriceFilters.market === "__all__" || mp.market === marketPriceFilters.market) &&
      (!marketPriceFilters.startDate || mp.date >= marketPriceFilters.startDate) &&
      (!marketPriceFilters.endDate || mp.date <= marketPriceFilters.endDate) &&
      (!search || mp.crop.toLowerCase().includes(search) || mp.market.toLowerCase().includes(search))
    );
  });
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Unique crops/markets for filters
  const uniqueCrops = Array.from(new Set(marketPrices.map(mp => mp.crop))).filter(Boolean);
  const uniqueMarkets = Array.from(new Set(marketPrices.map(mp => mp.market))).filter(Boolean);

  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [showMin, setShowMin] = useState(true);
  const [showMax, setShowMax] = useState(true);
  const [showAvg, setShowAvg] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">Market Prices</h1>

            {/* Analytics summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded shadow p-4 text-center">
                <div className="text-xs text-muted-foreground">Latest Price</div>
                <div className="text-xl font-bold">{analytics.latest ? analytics.latest.price : '-'}</div>
                <div className="text-sm">{analytics.latest ? `${analytics.latest.crop} @ ${analytics.latest.market}` : ''}</div>
              </div>
              <div className="bg-white rounded shadow p-4 text-center">
                <div className="text-xs text-muted-foreground">Min</div>
                <div className="text-xl font-bold">{analytics.min ?? '-'}</div>
              </div>
              <div className="bg-white rounded shadow p-4 text-center">
                <div className="text-xs text-muted-foreground">Max</div>
                <div className="text-xl font-bold">{analytics.max ?? '-'}</div>
              </div>
              <div className="bg-white rounded shadow p-4 text-center">
                <div className="text-xs text-muted-foreground">Avg</div>
                <div className="text-xl font-bold">{analytics.avg ? analytics.avg.toFixed(2) : '-'}</div>
                {analytics.change !== null && (
                  <div className={`text-xs mt-1 ${analytics.change > 0 ? 'text-green-600' : analytics.change < 0 ? 'text-red-600' : ''}`}>{analytics.change > 0 ? '+' : ''}{analytics.change?.toFixed(2)}%</div>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-end mb-4">
              <Input placeholder="Search..." value={marketPriceFilters.search} onChange={e => setMarketPriceFilters(f => ({ ...f, search: e.target.value }))} className="w-48" />
              <Select value={marketPriceFilters.crop} onValueChange={v => setMarketPriceFilters(f => ({ ...f, crop: v }))}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Crop" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Crops</SelectItem>
                  {uniqueCrops.map(crop => <SelectItem key={crop} value={crop}>{crop}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={marketPriceFilters.market} onValueChange={v => setMarketPriceFilters(f => ({ ...f, market: v }))}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Market" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Markets</SelectItem>
                  {uniqueMarkets.map(market => <SelectItem key={market} value={market}>{market}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={marketPriceFilters.startDate} onChange={e => setMarketPriceFilters(f => ({ ...f, startDate: e.target.value }))} className="w-36" title="From date" />
              <Input type="date" value={marketPriceFilters.endDate} onChange={e => setMarketPriceFilters(f => ({ ...f, endDate: e.target.value }))} className="w-36" title="To date" />
              {isAdmin(user) && <button className="ml-2 px-4 py-2 bg-primary text-white rounded" onClick={onAdd}>Add Price</button>}
              <button className="ml-2 px-4 py-2 border rounded" onClick={() => setIsExporting(true)}>Export CSV</button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Source</TableHead>
                    {isAdmin(user) && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map(mp => (
                    <TableRow key={mp.id}>
                      <TableCell>{mp.crop}</TableCell>
                      <TableCell>{mp.market}</TableCell>
                      <TableCell>{mp.price}</TableCell>
                      <TableCell>{mp.currency}</TableCell>
                      <TableCell>{mp.unit}</TableCell>
                      <TableCell>{format(new Date(mp.date), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{mp.price_trend}</TableCell>
                      <TableCell>{mp.source}</TableCell>
                      {isAdmin(user) && <TableCell>
                        <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded mr-2" onClick={() => onEdit(mp)}>Edit</button>
                        <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded" onClick={() => onDelete(mp.id)}>Delete</button>
                      </TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div>
                <span className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
                </span>
              </div>
              <Pagination>
                <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                <span className="mx-2 text-sm">Page {page} of {totalPages}</span>
                <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
              </Pagination>
              <div>
                <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map(size => (
                      <SelectItem key={size} value={String(size)}>{size} / page</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chart & analytics */}
            <div className="mb-6 mt-10">
              <div className="flex gap-2 items-center mb-2">
                <Select value={trendCrop} onValueChange={setTrendCrop}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Select Crop" /></SelectTrigger>
                  <SelectContent>
                    {uniqueCrops.map(crop => <SelectItem key={crop} value={crop}>{crop}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={trendMarket} onValueChange={setTrendMarket}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Select Market" /></SelectTrigger>
                  <SelectContent>
                    {uniqueMarkets.map(market => <SelectItem key={market} value={market}>{market}</SelectItem>)}
                  </SelectContent>
                </Select>
                <button className="px-4 py-2 bg-primary text-white rounded" onClick={fetchTrend}>Show Trends</button>
              </div>
              {/* Chart options */}
              <div className="flex gap-4 items-center mb-2">
                <div className="flex gap-2 items-center">
                  <span className="text-xs">Chart:</span>
                  <button className={`px-2 py-1 rounded ${chartType === 'line' ? 'bg-primary text-white' : 'bg-gray-100'}`} onClick={() => setChartType('line')}>Line</button>
                  <button className={`px-2 py-1 rounded ${chartType === 'bar' ? 'bg-primary text-white' : 'bg-gray-100'}`} onClick={() => setChartType('bar')}>Bar</button>
                  <button className={`px-2 py-1 rounded ${chartType === 'area' ? 'bg-primary text-white' : 'bg-gray-100'}`} onClick={() => setChartType('area')}>Area</button>
                </div>
                <div className="flex gap-2 items-center">
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={showMin} onChange={e => setShowMin(e.target.checked)} />Min</label>
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={showMax} onChange={e => setShowMax(e.target.checked)} />Max</label>
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={showAvg} onChange={e => setShowAvg(e.target.checked)} />Avg</label>
                </div>
              </div>
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'line' && (
                    <LineChart data={trendData && trendData.length > 0 ? trendData[0].prices.map((p, i) => ({ ...p, market: trendData[0].market })) : []}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="price" stroke="#2563eb" name="Price" dot={false} />
                      {showAvg && analytics.avg && <ReferenceLine y={analytics.avg} label="Avg" stroke="#22c55e" strokeDasharray="3 3" />}
                      {showMin && analytics.min && <ReferenceLine y={analytics.min} label="Min" stroke="#f59e42" strokeDasharray="3 3" />}
                      {showMax && analytics.max && <ReferenceLine y={analytics.max} label="Max" stroke="#ef4444" strokeDasharray="3 3" />}
                    </LineChart>
                  )}
                  {chartType === 'bar' && (
                    <BarChart data={trendData && trendData.length > 0 ? trendData[0].prices.map((p, i) => ({ ...p, market: trendData[0].market })) : []}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="price" fill="#2563eb" name="Price" />
                      {showAvg && analytics.avg && <ReferenceLine y={analytics.avg} label="Avg" stroke="#22c55e" strokeDasharray="3 3" />}
                      {showMin && analytics.min && <ReferenceLine y={analytics.min} label="Min" stroke="#f59e42" strokeDasharray="3 3" />}
                      {showMax && analytics.max && <ReferenceLine y={analytics.max} label="Max" stroke="#ef4444" strokeDasharray="3 3" />}
                    </BarChart>
                  )}
                  {chartType === 'area' && (
                    <AreaChart data={trendData && trendData.length > 0 ? trendData[0].prices.map((p, i) => ({ ...p, market: trendData[0].market })) : []}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="price" stroke="#2563eb" fill="#93c5fd" name="Price" />
                      {showAvg && analytics.avg && <ReferenceLine y={analytics.avg} label="Avg" stroke="#22c55e" strokeDasharray="3 3" />}
                      {showMin && analytics.min && <ReferenceLine y={analytics.min} label="Min" stroke="#f59e42" strokeDasharray="3 3" />}
                      {showMax && analytics.max && <ReferenceLine y={analytics.max} label="Max" stroke="#ef4444" strokeDasharray="3 3" />}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Market Price" : "Add Market Price"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="crop" className="block text-sm font-medium text-gray-700">Crop</label>
                    <input type="text" id="crop" {...register("crop", { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    {errors.crop && <p className="mt-2 text-sm text-red-600">Crop is required.</p>}
                  </div>
                  <div>
                    <label htmlFor="market" className="block text-sm font-medium text-gray-700">Market</label>
                    <input type="text" id="market" {...register("market", { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    {errors.market && <p className="mt-2 text-sm text-red-600">Market is required.</p>}
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input type="number" id="price" {...register("price", { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    {errors.price && <p className="mt-2 text-sm text-red-600">Price is required.</p>}
                  </div>
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                    <input type="text" id="currency" {...register("currency", { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    {errors.currency && <p className="mt-2 text-sm text-red-600">Currency is required.</p>}
                  </div>
                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                    <input type="text" id="unit" {...register("unit", { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    {errors.unit && <p className="mt-2 text-sm text-red-600">Unit is required.</p>}
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="date" {...register("date", { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    {errors.date && <p className="mt-2 text-sm text-red-600">Date is required.</p>}
                  </div>
                  <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
                    <input type="text" id="source" {...register("source", { required: false })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                  </div>
                  <DialogFooter>
                    <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded">
                      {editing ? "Update" : "Add"} Price
                    </button>
                    <button type="button" className="ml-2 px-4 py-2 border rounded" onClick={() => setShowDialog(false)}>
                      Cancel
                    </button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Export CSV Dialog */}
            <Dialog open={isExporting} onOpenChange={setIsExporting}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Market Prices</DialogTitle>
                </DialogHeader>
                <Alert>
                  <AlertTitle>Export functionality not yet implemented</AlertTitle>
                  <AlertDescription>
                    This feature will allow you to export the current market price data to a CSV file.
                  </AlertDescription>
                </Alert>
                <DialogFooter>
                  <button onClick={() => setIsExporting(false)} className="px-4 py-2 border rounded">Close</button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarketPrices; 