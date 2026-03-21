'use client';
import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { cart, fetchCart, openCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold text-primary">ShopSwift</Link>
        
        <div className="hidden space-x-6 md:flex">
          <Link href="/products" className="text-sm font-medium hover:text-primary">Products</Link>
          <Link href="/products?categoryId=1" className="text-sm font-medium hover:text-primary">Electronics</Link>
          <Link href="/products?categoryId=2" className="text-sm font-medium hover:text-primary">Clothing</Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
            <ShoppingCart className="h-5 w-5" />
            {(cart?.totalItems ?? 0) > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {cart?.totalItems}
              </span>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-semibold">{user.firstName} {user.lastName}</div>
                <DropdownMenuItem onClick={() => router.push('/orders')}>My Orders</DropdownMenuItem>
                {user.role === 'Admin' && (
                  <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>Admin Panel</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => logout().then(() => { toast.success('Logged out'); router.push('/'); })}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push('/login')}>Sign In</Button>
          )}
        </div>
      </div>
    </nav>
  );
}