import { useState, useEffect } from 'react';
import { AgriService } from '@/types/feeds';
import { getAgriServices, createAgriService, updateAgriService, deleteAgriService, toggleAgriServiceActive, toggleAgriServiceVerified, uploadAgriServiceImage } from '@/lib/services/agriService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogHeader, DialogContent, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Pagination, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { format } from 'date-fns';
// TODO: import image upload util from contentService
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const CATEGORY_OPTIONS = [
  { value: 'transport', label: 'Transport' },
  { value: 'cold_storage', label: 'Cold Storage' },
  { value: 'machinery', label: 'Machinery' },
  { value: 'agronomist', label: 'Agronomist' },
  { value: 'crop_insurance', label: 'Crop Insurance' },
  { value: 'borehole', label: 'Borehole' },
  { value: 'storage', label: 'Storage' },
  { value: 'other', label: 'Other' },
];

function AgriServiceForm({ initial, onSubmit, onCancel, isLoading }: any) {
  const [form, setForm] = useState<Partial<AgriService>>(initial || {});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Basic validation
  const validate = () => {
    const errs: any = {};
    if (!form.name) errs.name = 'Required';
    if (!form.category) errs.category = 'Required';
    if (!form.description) errs.description = 'Required';
    if (!form.location) errs.location = 'Required';
    if (!form.coverage_area) errs.coverage_area = 'Required';
    if (!form.contact_info || !/\d{7,}/.test(form.contact_info)) errs.contact_info = 'Enter valid phone/WhatsApp';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setUploading(true);
    let image_url = form.image_url;
    if (imageFile) {
      try {
        image_url = await uploadAgriServiceImage(imageFile);
      } catch (err) {
        alert('Image upload failed');
        setUploading(false);
        return;
      }
    }
    setUploading(false);
    onSubmit({ ...form, image_url });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input name="name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Service Name" required />
        {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
      </div>
      <div>
        <select name="category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} required className="w-full border rounded p-2">
          <option value="">Select Category</option>
          {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {errors.category && <div className="text-red-500 text-xs">{errors.category}</div>}
      </div>
      <div>
        <Textarea name="description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short Description" required />
        {errors.description && <div className="text-red-500 text-xs">{errors.description}</div>}
      </div>
      <div>
        <Input name="location" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" required />
        {errors.location && <div className="text-red-500 text-xs">{errors.location}</div>}
      </div>
      <div>
        <Input name="coverage_area" value={form.coverage_area || ''} onChange={e => setForm({ ...form, coverage_area: e.target.value })} placeholder="Coverage Area" required />
        {errors.coverage_area && <div className="text-red-500 text-xs">{errors.coverage_area}</div>}
      </div>
      <div>
        <Input name="contact_info" value={form.contact_info || ''} onChange={e => setForm({ ...form, contact_info: e.target.value })} placeholder="Contact Info (WhatsApp/Phone)" required />
        {errors.contact_info && <div className="text-red-500 text-xs">{errors.contact_info}</div>}
      </div>
      <Input name="pricing_notes" value={form.pricing_notes || ''} onChange={e => setForm({ ...form, pricing_notes: e.target.value })} placeholder="Pricing Notes (optional)" />
      <Input name="availability" value={form.availability || ''} onChange={e => setForm({ ...form, availability: e.target.value })} placeholder="Availability (e.g., weekdays)" />
      <Input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]); }} />
      {form.image_url && <img src={form.image_url} alt="Preview" className="w-24 h-24 object-cover rounded" />}
      <DialogFooter>
        <Button type="submit" disabled={isLoading || uploading}>{uploading ? 'Uploading...' : 'Save'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </DialogFooter>
    </form>
  );
}

export function Agriservices() {
  const [services, setServices] = useState<AgriService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [coverage, setCoverage] = useState('');
  const [pricing, setPricing] = useState('');
  const [availability, setAvailability] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<AgriService | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadServices();
  }, [search, category, location, coverage, pricing, availability, dateFrom, dateTo, page, pageSize]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const params: any = {
        search,
        category,
        location,
        coverage_area: coverage,
        pricing_notes: pricing,
        availability,
        date_from: dateFrom,
        date_to: dateTo,
        page,
        page_size: pageSize,
      };
      const url = new URL('/api/agriservices/', window.location.origin);
      Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.append(k, v as string); });
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch agri services');
      const data = await res.json();
      setServices(data.results || data);
      setTotal(data.count || data.length || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: Partial<AgriService>) => {
    setFormLoading(true);
    try {
      if (editService) {
        await updateAgriService(editService.id, data);
        toast({ title: 'Service updated' });
      } else {
        await createAgriService(data);
        toast({ title: 'Service created' });
      }
      setShowModal(false);
      await loadServices();
    } catch (err: any) {
      let msg = 'Failed to save service';
      if (err instanceof SyntaxError) msg = 'API returned invalid JSON (likely an auth or server error)';
      toast({ title: msg, description: err?.message, variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    setDeletingId(id);
    try {
      await deleteAgriService(id);
      toast({ title: 'Service deleted' });
      await loadServices();
    } catch (err) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, is_active: boolean) => {
    try {
      await toggleAgriServiceActive(id, is_active);
      await loadServices();
    } catch {
      toast({ title: 'Failed to update active status', variant: 'destructive' });
    }
  };

  const handleToggleVerified = async (id: string, is_verified: boolean) => {
    try {
      await toggleAgriServiceVerified(id, is_verified);
      await loadServices();
    } catch {
      toast({ title: 'Failed to update verified status', variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            {/* Agri Services Card/Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Agri Services</CardTitle>
                <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => { setEditService(null); setShowModal(true); }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Service
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4 items-end">
                  <Input
                    placeholder="Search by name/desc/contact..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-56"
                  />
                  <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded p-2">
                    <option value="">All Categories</option>
                    {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    placeholder="Coverage Area"
                    value={coverage}
                    onChange={e => setCoverage(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    placeholder="Pricing Notes"
                    value={pricing}
                    onChange={e => setPricing(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    placeholder="Availability"
                    value={availability}
                    onChange={e => setAvailability(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-36"
                    title="From date"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-36"
                    title="To date"
                  />
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded p-2">
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Coverage</th>
                        <th>Contact</th>
                        <th>Active</th>
                        <th>Verified</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={10} className="text-center p-8">Loading...</td></tr>
                      ) : services.length === 0 ? (
                        <tr><td colSpan={10} className="text-center p-8">No services found</td></tr>
                      ) : services.map((s) => (
                        <tr key={s.id}>
                          <td>{s.image_url ? <img src={s.image_url} alt="" className="w-12 h-12 object-cover rounded" /> : '-'}</td>
                          <td>{s.name}</td>
                          <td>{s.category}</td>
                          <td>{s.location}</td>
                          <td>{s.coverage_area}</td>
                          <td>{s.contact_info}</td>
                          <td>
                            <Switch checked={s.is_active} onCheckedChange={v => handleToggleActive(s.id, v)} disabled={loading} />
                          </td>
                          <td>
                            <Switch checked={s.is_verified} onCheckedChange={v => handleToggleVerified(s.id, v)} disabled={loading} />
                          </td>
                          <td>{format(new Date(s.date_submitted), 'yyyy-MM-dd')}</td>
                          <td>
                            <Button size="sm" variant="outline" onClick={() => { setEditService(s); setShowModal(true); }} disabled={loading}><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(s.id)} disabled={deletingId === s.id || loading}><Trash2 className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div>Showing {services.length} of {total} services</div>
                  <Pagination>
                    <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                    <span className="mx-2">Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</span>
                    <PaginationNext onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))} disabled={page >= Math.ceil(total / pageSize)} />
                  </Pagination>
                </div>
              </CardContent>
              <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent aria-describedby="agriservice-dialog-desc">
                  <DialogTitle>{editService ? 'Edit Service' : 'Add Service'}</DialogTitle>
                  <DialogDescription>
                    Fill in the form to add or edit an agri service.
                  </DialogDescription>
                  <AgriServiceForm
                    initial={editService}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowModal(false)}
                    isLoading={formLoading}
                  />
                </DialogContent>
              </Dialog>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 