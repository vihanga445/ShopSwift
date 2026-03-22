'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    value ? p.set(key, value) : p.delete(key);
    p.delete('page');
    router.push(`/products?${p}`);
  };

  return (
    <div className="space-y-6 p-4 border rounded-xl sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={() => router.push('/products')}>Clear all</Button>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Search</Label>
        <Input 
          placeholder="Search products..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={e => {
            const v = e.target.value;
            const timer = setTimeout(() => update('search', v), 400);
            return () => clearTimeout(timer);
          }} 
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Category</Label>
        <Select 
          defaultValue={searchParams.get('categoryId') ?? 'all'}
          onValueChange={v => update('categoryId', v === 'all' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Price Range</Label>
        <div className="flex gap-2">
          <Input placeholder="Min" type="number" onChange={e => update('minPrice', e.target.value)} />
          <Input placeholder="Max" type="number" onChange={e => update('maxPrice', e.target.value)} />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Sort by</Label>
        <Select 
          defaultValue={searchParams.get('sort') ?? 'newest'}
          onValueChange={v => update('sort', v === 'newest' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="name_asc">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}