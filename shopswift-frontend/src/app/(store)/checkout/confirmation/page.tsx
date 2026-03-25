'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';

export default function ConfirmationPage() {
  const ref = useSearchParams().get('payment_intent');
  const { fetchCart } = useCartStore();
  
  useEffect(() => { 
    fetchCart(); 
  }, []);

  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md">
      <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-gray-600 mb-8">Your order has been confirmed.</p>
      {ref && <p className="text-xs text-gray-400 mb-8">Ref: {ref.slice(-8).toUpperCase()}</p>}
      <div className="flex flex-col gap-3">
        <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" asChild>
          <Link href="/orders">View My Orders</Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}