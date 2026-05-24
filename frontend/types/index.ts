export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  role: "customer" | "admin";
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  full_name: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  stock_quantity: number;
  unit: string;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  weight_grams?: number;
  origin?: string;
  category_id: number;
  category_name?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  product_count: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  unit: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total_items: number;
  total_amount: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  payment_status: "pending" | "completed" | "failed" | "refunded";
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  delivery_zone: "colombo" | "suburbs" | "outstation";
  delivery_fee: number;
  subtotal: number;
  total: number;
  notes?: string;
  items: OrderItem[];
  created_at: string;
}

export interface DeliveryCost {
  delivery_zone: string;
  zone_name: string;
  delivery_fee: number;
  is_free_delivery: boolean;
  cart_value: number;
  total_with_delivery: number;
  free_delivery_threshold: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProductFilters {
  q?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  sort_by?: string;
  page?: number;
  limit?: number;
}
