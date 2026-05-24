import api from "./axios";
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Product,
  Category,
  Cart,
  Order,
  DeliveryCost,
  PaginatedResponse,
  ProductFilters,
} from "@/types";

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    const response = await api.post<AuthResponse>("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>("/auth/me", data);
    return response.data;
  },
};

export const productsAPI = {
  getProducts: async (
    filters?: ProductFilters,
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>("/products/", {
      params: filters,
    });
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/slug/${slug}`);
    return response.data;
  },

  getFeaturedProducts: async (limit = 8): Promise<Product[]> => {
    const response = await api.get<Product[]>("/products/featured", {
      params: { limit },
    });
    return response.data;
  },
};

export const categoriesAPI = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories/");
    return response.data;
  },

  getCategoryWithProducts: async (
    id: number,
  ): Promise<Category & { products: Product[] }> => {
    const response = await api.get<Category & { products: Product[] }>(
      `/categories/${id}`,
    );
    return response.data;
  },
};

export const cartAPI = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get<Cart>("/cart/");
    return response.data;
  },

  addToCart: async (productId: number, quantity = 1): Promise<Cart> => {
    const response = await api.post<Cart>("/cart/items", {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<Cart> => {
    const response = await api.put<Cart>(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId: number): Promise<Cart> => {
    const response = await api.delete<Cart>(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async (): Promise<void> => {
    await api.delete("/cart/");
  },

  getCartCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>("/cart/count");
    return response.data;
  },
};

export const ordersAPI = {
  getDeliveryCost: async (
    delivery_zone: string,
    cart_value: number,
  ): Promise<DeliveryCost> => {
    const response = await api.post<DeliveryCost>("/orders/delivery-cost", {
      delivery_zone,
      cart_value,
    });
    return response.data;
  },

  createOrder: async (orderData: {
    shipping_address: string;
    shipping_city: string;
    shipping_phone: string;
    delivery_zone: string;
    notes?: string;
  }): Promise<Order> => {
    const response = await api.post<Order>("/orders/", orderData);
    return response.data;
  },

  getMyOrders: async (
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<PaginatedResponse<Order>>("/orders/", {
      params: { page, limit },
    });
    return response.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  trackOrder: async (orderNumber: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/track/${orderNumber}`);
    return response.data;
  },
};
