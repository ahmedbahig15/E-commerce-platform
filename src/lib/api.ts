let authToken: string | null = localStorage.getItem('vela_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('vela_token', token);
  else localStorage.removeItem('vela_token');
}

export function getToken() { return authToken; }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

// Products
export const api = {
  products: {
    list: () => request<any[]>('/products'),
    get: (id: string) => request<any>(`/products/${id}`),
    create: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
    updateStock: (id: string, stock: number) => request<any>(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ stock }) }),
  },
  categories: {
    list: () => request<any[]>('/categories'),
  },
  auth: {
    register: (email: string, password: string, name: string) =>
      request<any>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
    login: (email: string, password: string) =>
      request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: () => request<any>('/auth/logout', { method: 'POST' }),
    me: () => request<any>('/auth/me'),
  },
  cart: {
    get: () => request<any[]>('/cart'),
    add: (product_id: string, quantity: number) =>
      request<any>('/cart', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
    remove: (product_id: string) => request<any>(`/cart/${product_id}`, { method: 'DELETE' }),
    clear: () => request<any>('/cart', { method: 'DELETE' }),
  },
  wishlist: {
    get: () => request<any[]>('/wishlist'),
    toggle: (product_id: string) =>
      request<any>('/wishlist', { method: 'POST', body: JSON.stringify({ product_id }) }),
  },
  orders: {
    list: () => request<any[]>('/orders'),
    create: (data: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id: string) => request<any>(`/orders/${id}/cancel`, { method: 'PATCH' }),
  },
  reviews: {
    list: (product_id: string) => request<any[]>(`/reviews/${product_id}`),
    create: (data: any) => request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  },
  coupons: {
    validate: (code: string) => request<any>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code }) }),
    list: () => request<any[]>('/coupons'),
  },
};
