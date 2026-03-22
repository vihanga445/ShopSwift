import {Navbar} from '@/components/Navbar';
import {Footer} from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';


export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer /> 
    </div>
  );
}