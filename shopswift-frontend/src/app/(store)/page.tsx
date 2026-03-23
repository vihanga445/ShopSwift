import Link from 'next/link';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/api/products/featured`, { 
      next: { revalidate: 60 },
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Home Products Fetch Failed:", error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/api/categories`, { 
      next: { revalidate: 3600 } 
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(), 
    getCategories()
  ]);
  
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-slate-50 py-20 text-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-slate-900">
          Shop Smart, Shop Swift
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-lg text-slate-600">
          Premium products. Free shipping on orders over $50.
        </p>
        <Button size="lg" asChild>
          <Link href="/products">
            Shop Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/products?categoryId=${cat.id}`} 
              className="group rounded-lg border p-6 transition hover:bg-white hover:shadow-md"
            >
              <h3 className="font-semibold group-hover:text-primary">{cat.name}</h3>
              <p className="text-sm text-slate-500">{cat.productCount} products</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
          <Button variant="link" asChild>
            <Link href="/products">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {featured.length === 0 ? (
          <p className="text-slate-500 text-center py-10">No featured products at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}