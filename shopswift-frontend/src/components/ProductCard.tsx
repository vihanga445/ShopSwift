import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { AddToCartButton } from './AddToCartButton';

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group overflow-hidden rounded-xl border bg-white transition-all hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="block aspect-square relative bg-slate-100">
        <Image 
          src={product.imageUrl || 'https://via.placeholder.com/400'} 
          alt={product.name} 
          fill 
          unoptimized
          className="object-cover transition-transform group-hover:scale-105" 
        />
      </Link>
      <div className="p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{product.categoryName}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="mt-1 font-semibold truncate hover:text-primary">{product.name}</h3>
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
          <AddToCartButton productId={product.id} className="h-8 px-3" />
        </div>
      </div>
    </div>
  );
}