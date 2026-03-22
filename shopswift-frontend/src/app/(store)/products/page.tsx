import { Product, Category, PagedResult } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;
type SearchParams = Record<string, string | undefined>;

async function getProducts(params: SearchParams): Promise<PagedResult<Product>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  if (params.minPrice) qs.set('minPrice', params.minPrice);
  if (params.maxPrice) qs.set('maxPrice', params.maxPrice);
  if (params.sort) qs.set('sort', params.sort);
  qs.set('page', params.page ?? '1');
  qs.set('pageSize', '12');

  const res = await fetch(`${API}/products?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API}/categories`, { next: { revalidate: 3600 } });
  return res.ok ? res.json() : [];
}

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<SearchParams> 
}) {
  // Next.js 15 requires awaiting searchParams
  const resolvedParams = await searchParams;

  const [data, categories] = await Promise.all([
    getProducts(resolvedParams),
    getCategories()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full md:w-64 shrink-0">
          <ProductFilters categories={categories} />
        </aside>

        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {data.totalCount} product{data.totalCount !== 1 ? 's' : ''} found
              {resolvedParams.search && ` for "${resolvedParams.search}"`}
            </p>
          </div>

          {data.items.length === 0 ? (
            <div className="py-20 text-center border rounded-xl bg-slate-50">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-slate-500">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                <Link 
                  key={p} 
                  href={{ query: { ...resolvedParams, page: p } }}
                  className={`h-10 w-10 flex items-center justify-center rounded-md border font-medium transition ${
                    Number(resolvedParams.page ?? '1') === p 
                    ? 'bg-primary text-white border-primary' 
                    : 'hover:bg-slate-50'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}