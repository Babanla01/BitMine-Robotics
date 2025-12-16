// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const API = {
  // Auth endpoints
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  me: `${API_BASE_URL}/auth/me`,
  logout: `${API_BASE_URL}/auth/logout`,

  // Products endpoints
  products: `${API_BASE_URL}/products`,
  product: (id: number) => `${API_BASE_URL}/products/${id}`,
  categories: `${API_BASE_URL}/products/categories/all`,

  // Cart endpoints
  cart: `${API_BASE_URL}/cart`,
  cartAdd: `${API_BASE_URL}/cart/add`,
  cartRemove: `${API_BASE_URL}/cart/remove`,
  cartClear: `${API_BASE_URL}/cart/clear`,

  // Orders endpoints
  orders: `${API_BASE_URL}/orders`,
  createOrder: `${API_BASE_URL}/orders/create`,
  userOrders: (userId: number) => `${API_BASE_URL}/orders/user/${userId}`,

  // Contact endpoint
  contact: `${API_BASE_URL}/contact`,

  // Newsletter endpoint
  newsletter: `${API_BASE_URL}/newsletter`,

  // Admin endpoints
  adminStats: `${API_BASE_URL}/admin/stats`,
  adminUsers: `${API_BASE_URL}/admin/users`,
  adminProducts: `${API_BASE_URL}/admin/products`,
  adminOrders: `${API_BASE_URL}/admin/orders`,
};

// Helper function to make API calls
export async function apiCall(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }

  return data;
}

export default API;
