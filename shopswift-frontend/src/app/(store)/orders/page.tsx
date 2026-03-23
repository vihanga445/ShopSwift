'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700', 
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700', 
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700', 
  Refunded: 'bg-gray-100 text-gray-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Order[]>('/api/orders')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
      {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl mb-2">No orders yet</p>
          <Link href="/products" className="text-yellow-600 hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold">Order #{o.id.toString().slice(-6)}</p>
                  <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>
                  {o.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {o.items.length} item{o.items.length !== 1 ? 's' : ''} • <span className="font-bold text-yellow-600">${o.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}