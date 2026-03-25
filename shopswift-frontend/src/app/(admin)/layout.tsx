'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Store } from 'lucide-react';

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. Get isInitialized from the store
  const { user, logout, isInitialized } = useAuthStore();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    // 2. ONLY run the redirect logic after the store has finished checking for a user
    if (isInitialized) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'Admin') {
        router.push('/');
      }
    }
  }, [user, isInitialized, router]);

  // 3. While the store is still initializing (checking the token), show a loading state
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // 4. Safety check to ensure we don't render the dashboard for non-admins
  if (!user || user.role !== 'Admin') return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold text-yellow-500">ShopSwift</Link>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${path === href ? 'bg-yellow-500 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800">
            <Store className="h-4 w-4" /> View Store
          </Link>
          <button onClick={() => logout().then(() => router.push('/'))} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-red-400">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}