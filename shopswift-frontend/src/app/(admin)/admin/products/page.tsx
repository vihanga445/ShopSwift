'use client';
import { useEffect, useState } from 'react';
import { Product, PagedResult } from '@/types';
import { api, apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [data, setData] = useState<PagedResult<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try { setData(await api.get<PagedResult<Product>>('/api/products?pageSize=20')); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Product deleted'); 
      fetchProducts();
    } catch(e: any) { toast.error(e.message); }
  };

  const handleImageUpload = async (productId: number, file: File) => {
    const form = new FormData(); 
    form.append('file', file);
    try {
      await apiRequest(`/api/products/${productId}/image`, { method: 'POST', body: form });
      toast.success('Image updated'); 
      fetchProducts();
    } catch (e: any) { toast.error(e.message || 'Upload failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
            <tr>
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10">Loading...</td></tr>
            ) : data?.items.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded shrink-0">
                      {p.imageUrl && <img src={p.imageUrl} className="h-full w-full object-cover" alt="" />}
                    </div>
                    <div><p className="font-medium text-gray-900">{p.name}</p><p className="text-xs text-gray-400">ID: {p.id}</p></div>
                  </div>
                </td>
                <td className="px-6 py-4">{p.categoryName}</td>
                <td className="px-6 py-4 font-medium">${p.price.toFixed(2)}</td>
                <td className="px-6 py-4">{p.stock}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-6 py-4 flex gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditProduct(p)}><Pencil className="h-4 w-4" /></Button>
                  <div className="relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(p.id, f); }} />
                    <Button size="icon" variant="outline" className="h-8 w-8"><ImageIcon className="h-4 w-4" /></Button>
                  </div>
                  <Button size="icon" variant="outline" className="h-8 w-8 text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProductFormModal open={showCreate || !!editProduct} product={editProduct} onClose={() => { setShowCreate(false); setEditProduct(null); }} onSuccess={() => { setShowCreate(false); setEditProduct(null); fetchProducts(); }} />
    </div>
  );
}

function ProductFormModal({ open, product, onClose, onSuccess }: { open: boolean; product: Product | null; onClose: () => void; onSuccess: () => void; }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '1', isFeatured: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ 
      name: product?.name ?? '', 
      description: product?.description ?? '', 
      price: product?.price?.toString() ?? '', 
      stock: product?.stock?.toString() ?? '', 
      categoryId: product?.categoryId?.toString() ?? '1', 
      isFeatured: product?.isFeatured ?? false 
    });
  }, [product]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), categoryId: parseInt(form.categoryId) };
      product ? await api.patch(`/api/products/${product.id}`, payload) : await api.post('/api/products', payload);
      toast.success(product ? 'Updated' : 'Created'); 
      onSuccess();
    } catch (e: any) { toast.error(e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><Label>Description</Label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full min-h-20 p-2 border rounded-md text-sm resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Price ($)</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
            <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
          </div>
          <div><Label>Category ID</Label><Input type="number" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} />
            <Label>Featured on homepage</Label>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}