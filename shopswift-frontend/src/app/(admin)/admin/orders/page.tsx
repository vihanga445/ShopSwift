'use client';
import { useEffect, useState } from 'react';
import { Order, PagedResult } from '@/types';
import { api } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700', 
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700', 
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700', 
  Refunded: 'bg-gray-100 text-gray-700',
};

export default function AdminOrdersPage() {
  const [data, setData] = useState<PagedResult<Order> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try { setData(await api.get<PagedResult<Order>>('/api/orders/admin/all')); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/api/orders/admin/${id}/status`, { status });
      toast.success('Status updated'); 
      fetchOrders();
    } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
            <tr>
              {['Order', 'Customer', 'Items', 'Total', 'Date', 'Status'].map(h => (
                <th key={h} className="px-6 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10">Loading...</td></tr>
            ) : data?.items.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">#{o.id}</td>
                <td className="px-6 py-4"><div>{o.customerName}</div><div className="text-xs text-gray-400">{o.customerEmail}</div></td>
                <td className="px-6 py-4">{o.items.length}</td>
                <td className="px-6 py-4 font-bold">${o.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <Select defaultValue={o.status} onValueChange={v => updateStatus(o.id, v)}>
                    <SelectTrigger className={`h-8 w-32.5 text-xs font-semibold ${STATUS_COLORS[o.status]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}