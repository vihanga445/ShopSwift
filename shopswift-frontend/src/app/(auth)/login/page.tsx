'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try { 
      await login(email, password); 
      toast.success('Welcome back!'); 
      router.push(redirect); 
    } catch (err: any) { 
      toast.error(err.message || 'Login failed'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="font-bold text-2xl text-yellow-600 mb-2 block">ShopSwift</Link>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Welcome back!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handle} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="text-center text-sm text-gray-600 mt-4">
              No account? <Link href="/register" className="text-yellow-600 hover:underline">Create one</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}