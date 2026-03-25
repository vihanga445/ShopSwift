'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700', 
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700', 
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/dashboard')
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!stats) return <div className="p-8 text-center">Failed to load dashboard.</div>;

  const cards = [
    { label: 'Revenue', value: `$${(stats.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Orders', value: stats.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-600' },
    { label: 'Customers', value: stats.totalCustomers || 0, icon: Users, color: 'text-yellow-600' },
    { label: 'Products', value: stats.totalProducts || 0, icon: Package, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gray-50 ${c.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className="text-2xl font-bold">{c.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']} 
                />
                <Line type="monotone" dataKey="revenue" stroke="#EAB308" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="categoryName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']} 
                />
                <Bar dataKey="revenue" fill="#EAB308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-3 text-left font-medium">Order</th>
                <th className="pb-3 text-left font-medium">Customer</th>
                <th className="pb-3 text-left font-medium">Amount</th>
                <th className="pb-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.recentOrders?.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">#{o.id}</td>
                  <td className="py-3 text-gray-600">{o.customerName}</td>
                  <td className="py-3 font-semibold">${(o.totalAmount || 0).toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] ?? 'bg-gray-100'}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}