'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Cart
            {(cart?.totalItems ?? 0) > 0 && (
              <span className="text-sm font-normal text-slate-500">({cart?.totalItems} items)</span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <ShoppingBag className="h-20 w-20 opacity-10" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <Button variant="outline" onClick={closeCart} asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="relative w-20 h-20 shrink-0 bg-slate-50 rounded-lg overflow-hidden border">
                    <Image src={item.productImageUrl || 'https://via.placeholder.com/100'} alt={item.productName} fill unoptimized className="object-contain p-2" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold line-clamp-1">{item.productName}</p>
                      <p className="text-sm text-slate-500">${item.priceAtAdding.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-md">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateItem(item.id, item.quantity - 1).catch(e => toast.error(e.message))}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateItem(item.id, item.quantity + 1).catch(e => toast.error(e.message))} disabled={item.quantity >= item.productStock}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeItem(item.id).catch(() => toast.error('Remove failed'))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-primary">${item.subtotal.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between items-center font-bold text-xl">
              <span>Total</span>
              <span className="text-primary">${cart.totalAmount.toFixed(2)}</span>
            </div>
            <Button className="w-full h-12 text-lg font-bold" size="lg" onClick={closeCart} asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}