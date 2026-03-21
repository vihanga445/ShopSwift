export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Customer' | 'Admin';
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  categoryId: number;
  categoryName: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  productPrice: number;
  productStock: number;
  quantity: number;
  priceAtAdding: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  updatedAt: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  status: string;
  totalAmount: number;
  stripePaymentIntentId: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;
  createdAt: string;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueByDay: { date: string; revenue: number }[];
  revenueByCategory: { categoryName: string; revenue: number }[];
  recentOrders: {
    id: number;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
}