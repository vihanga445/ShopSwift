export function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xl font-bold text-primary">ShopSwift</p>
        <p className="mt-2 text-sm text-slate-500">Built with Node.js + Express + Prisma + Next.js 14</p>
        <p className="mt-8 text-xs text-slate-400">&copy; 2024 ShopSwift. All rights reserved.</p>
      </div>
    </footer>
  );
}