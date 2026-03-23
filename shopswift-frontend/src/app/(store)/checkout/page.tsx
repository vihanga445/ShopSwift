'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/confirmation` },
    });
    if (error) { 
      toast.error(error.message ?? 'Payment failed'); 
      setProcessing(false); 
    }
  };

  return (
    <form onSubmit={handle} className="space-y-6">
      <PaymentElement />
      <div className="pt-4 border-t">
        <div className="flex justify-between items-center mb-4 text-lg font-bold">
          <span>Total</span>
          <span>${amount.toFixed(2)}</span>
        </div>
        <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" size="lg" disabled={processing}>
          {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Button>
        <p className="text-xs text-center text-gray-400 mt-4">Test card: 4242 4242 4242 4242</p>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const { cart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState(0);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({ address:'', city:'', country:'US', postalCode:'' });

  useEffect(() => {
    if (!user) router.push('/login?redirect=/checkout');
    if (cart && cart.items.length === 0) router.push('/products');
  }, [user, cart]);

  const handleShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post<{ clientSecret: string; amount: number }>(
        '/api/orders/create-payment-intent',
        { shippingAddress: shipping.address, shippingCity: shipping.city, shippingCountry: shipping.country, shippingPostalCode: shipping.postalCode }
      );
      setClientSecret(data.clientSecret); 
      setAmount(data.amount); 
      setStep('payment');
    } catch (err: any) { 
      toast.error(err.message || 'Failed to initialize payment'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!cart) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {step === 'shipping' ? (
            <div className="border p-6 rounded-xl bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
              <form onSubmit={handleShipping} className="space-y-4">
                <div><Label>Street Address</Label><Input value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>City</Label><Input value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} required /></div>
                  <div><Label>Postal Code</Label><Input value={shipping.postalCode} onChange={e => setShipping({...shipping, postalCode: e.target.value})} required /></div>
                </div>
                <div><Label>Country</Label><Input value={shipping.country} onChange={e => setShipping({...shipping, country: e.target.value})} required /></div>
                <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white mt-6" disabled={loading}>
                  {loading ? 'Loading...' : 'Continue to Payment'}
                </Button>
              </form>
            </div>
          ) : clientSecret ? (
            <div className="border p-6 rounded-xl bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Payment</h2>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm amount={amount} />
              </Elements>
            </div>
          ) : null}
        </div>
        <div className="bg-gray-50 p-6 rounded-xl h-fit border">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.items.map(i => (
              <div key={i.id} className="flex justify-between text-sm">
                <span>{i.productName} x {i.quantity}</span>
                <span className="font-medium">${i.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg text-yellow-600">
            <span>Total</span>
            <span>${cart.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}