'use client';
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function AddToCartButton({ productId, disabled, quantity = 1, className }: {
  productId: number; disabled?: boolean; quantity?: number; className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handle = async () => {
    if (!user) { router.push('/login'); return; }
    setLoading(true);
    try { 
      await addItem(productId, quantity); 
      toast.success('Added to cart!'); 
    } catch (e: any) { 
      toast.error(e.message || 'Failed to add'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Button 
      size="sm" 
      className={className} 
      disabled={disabled || loading} 
      onClick={(e) => { e.preventDefault(); handle(); }}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {loading ? '...' : 'Add'}
    </Button>
  );
}