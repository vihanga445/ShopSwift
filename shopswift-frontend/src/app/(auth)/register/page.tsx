'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' });
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try { 
      await register(form); 
      toast.success('Account created!'); 
      router.push('/'); 
    } catch (err: any) { 
      toast.error(err.message || 'Registration failed'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="font-bold text-2xl text-yellow-600 mb-2 block">ShopSwift</Link>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Start shopping today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handle} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First name</Label><Input value={form.firstName} onChange={update('firstName')} required /></div>
              <div><Label>Last name</Label><Input value={form.lastName} onChange={update('lastName')} required /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={update('email')} required /></div>
            <div><Label>Password</Label><Input type="password" value={form.password} onChange={update('password')} minLength={8} required /></div>
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create account'}
            </Button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Have an account? <Link href="/login" className="text-yellow-600 hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}