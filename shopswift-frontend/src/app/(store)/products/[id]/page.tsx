import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Metadata } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL;

async function getProduct(id: string): Promise<Product | null> {
  // Using 127.0.0.1 is safer than localhost if you still get "Fetch Failed"
  const res = await fetch(`${API}/products/${id}`, { next: { revalidate: 300 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product details');
  return res.json();
}

// 1. FIX: Unwrapping params in generateMetadata
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const p = await getProduct(resolvedParams.id);
  if (!p) return { title: 'Product Not Found' };
  return { title: p.name, description: p.description.slice(0, 160) };
}

// 2. FIX: Unwrapping params in the main Page component
export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50 border">
          <Image 
            src={product.imageUrl || 'https://via.placeholder.com/600'} 
            alt={product.name} 
            fill 
            unoptimized
            className="object-contain p-8" 
          />
        </div>
        <div className="flex flex-col space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">{product.categoryName}</Badge>
            <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>
            <p className="mt-4 text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Availability:</p>
            {product.stock === 0 ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge className="bg-orange-500 text-white">Only {product.stock} left</Badge>
            ) : (
              <Badge className="bg-green-500 text-white">In Stock</Badge>
            )}
          </div>

          <div className="prose prose-slate max-w-none">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="pt-6 border-t">
            <AddToCartButton 
              productId={product.id} 
              disabled={product.stock === 0} 
              className="w-full h-12 text-lg" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}