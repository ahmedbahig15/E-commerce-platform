import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { CartItem, WishlistItem, Order, Product, User, Page } from './types';
import type { Review } from './types';
import { api, setToken, getToken } from './lib/api';
import { products as fallbackProducts } from './data';

interface State {
  page: Page;
  selectedProductId: string | null;
  cart: CartItem[];
  wishlist: WishlistItem[];
  orders: Order[];
  user: User | null;
  reviews: Review[];
  searchQuery: string;
  selectedCategory: string;
  priceRange: [number, number];
  sortBy: string;
  adminProducts: Product[];
  loading: boolean;
  initialized: boolean;
}

type Action =
  | { type: 'SET_PAGE'; page: Page; productId?: string }
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_CART'; cart: CartItem[] }
  | { type: 'ADD_TO_CART'; product: Product; quantity?: number }
  | { type: 'REMOVE_FROM_CART'; productId: string }
  | { type: 'UPDATE_CART_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_WISHLIST'; wishlist: WishlistItem[] }
  | { type: 'TOGGLE_WISHLIST'; product: Product }
  | { type: 'SET_ORDERS'; orders: Order[] }
  | { type: 'PLACE_ORDER'; order: Order }
  | { type: 'CANCEL_ORDER'; orderId: string }
  | { type: 'SET_REVIEWS'; productId: string; reviews: Review[] }
  | { type: 'ADD_REVIEW'; review: Review }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_PRICE_RANGE'; range: [number, number] }
  | { type: 'SET_SORT'; sortBy: string }
  | { type: 'SET_PRODUCTS'; products: Product[] }
  | { type: 'UPDATE_PRODUCT_STOCK'; productId: string; stock: number }
  | { type: 'UPDATE_PRODUCT'; product: Product }
  | { type: 'DELETE_PRODUCT'; productId: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_INITIALIZED' };

const initialState: State = {
  page: 'home',
  selectedProductId: null,
  cart: [],
  wishlist: [],
  orders: [],
  user: null,
  reviews: [],
  searchQuery: '',
  selectedCategory: '',
  priceRange: [0, 2000],
  sortBy: 'featured',
  adminProducts: fallbackProducts,
  loading: false,
  initialized: false,
};

function dbProductToProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: p.category,
    images: p.images ?? [],
    rating: Number(p.rating),
    reviewCount: p.review_count,
    stock: p.stock,
    sku: p.sku,
    tags: p.tags ?? [],
    featured: p.featured,
    isNew: p.is_new,
  };
}

function dbReviewToReview(r: any): Review {
  return {
    id: r.id,
    productId: r.product_id,
    userId: r.user_id,
    userName: r.user_name,
    rating: r.rating,
    comment: r.comment,
    date: r.created_at?.split('T')[0] ?? '',
    helpful: r.helpful ?? 0,
  };
}

function dbCartItemToCartItem(i: any): CartItem {
  return { product: dbProductToProduct(i.products), quantity: i.quantity };
}

function dbOrderToOrder(o: any): Order {
  return {
    id: o.id,
    userId: o.user_id,
    items: (o.order_items ?? []).map((oi: any) => ({
      product: dbProductToProduct(oi.products),
      quantity: oi.quantity,
    })),
    subtotal: Number(o.subtotal),
    discount: Number(o.discount),
    shipping: Number(o.shipping),
    total: Number(o.total),
    status: o.status,
    date: o.created_at?.split('T')[0] ?? o.date ?? '',
    address: typeof o.address === 'string' ? JSON.parse(o.address) : o.address,
    couponCode: o.coupon_code,
    trackingNumber: o.tracking_number,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.page, selectedProductId: action.productId ?? state.selectedProductId };
    case 'LOGIN':
      return { ...state, user: action.user };
    case 'LOGOUT':
      return { ...state, user: null, page: 'home', cart: [], wishlist: [], orders: [] };
    case 'SET_CART':
      return { ...state, cart: action.cart };
    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => i.product.id === action.product.id);
      if (existing) {
        return { ...state, cart: state.cart.map(i => i.product.id === action.product.id ? { ...i, quantity: i.quantity + (action.quantity ?? 1) } : i) };
      }
      return { ...state, cart: [...state.cart, { product: action.product, quantity: action.quantity ?? 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => i.product.id !== action.productId) };
    case 'UPDATE_CART_QTY':
      if (action.quantity <= 0) return { ...state, cart: state.cart.filter(i => i.product.id !== action.productId) };
      return { ...state, cart: state.cart.map(i => i.product.id === action.productId ? { ...i, quantity: action.quantity } : i) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.wishlist };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.find(i => i.product.id === action.product.id);
      if (exists) return { ...state, wishlist: state.wishlist.filter(i => i.product.id !== action.product.id) };
      return { ...state, wishlist: [...state.wishlist, { product: action.product, addedAt: new Date().toISOString() }] };
    }
    case 'SET_ORDERS':
      return { ...state, orders: action.orders };
    case 'PLACE_ORDER':
      return { ...state, orders: [action.order, ...state.orders] };
    case 'CANCEL_ORDER':
      return { ...state, orders: state.orders.map(o => o.id === action.orderId ? { ...o, status: 'cancelled' } : o) };
    case 'SET_REVIEWS':
      return { ...state, reviews: action.reviews };
    case 'ADD_REVIEW':
      return { ...state, reviews: [action.review, ...state.reviews] };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.category };
    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.range };
    case 'SET_SORT':
      return { ...state, sortBy: action.sortBy };
    case 'SET_PRODUCTS':
      return { ...state, adminProducts: action.products };
    case 'UPDATE_PRODUCT_STOCK':
      return { ...state, adminProducts: state.adminProducts.map(p => p.id === action.productId ? { ...p, stock: action.stock } : p) };
    case 'UPDATE_PRODUCT':
      return { ...state, adminProducts: state.adminProducts.map(p => p.id === action.product.id ? action.product : p) };
    case 'DELETE_PRODUCT':
      return { ...state, adminProducts: state.adminProducts.filter(p => p.id !== action.productId) };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_INITIALIZED':
      return { ...state, initialized: true };
    default:
      return state;
  }
}

interface StoreContext {
  state: State;
  dispatch: React.Dispatch<Action>;
  // Async actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQty: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  loadOrders: () => Promise<void>;
  placeOrder: (data: any) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  loadReviews: (productId: string) => Promise<void>;
  addReview: (data: any) => Promise<void>;
  updateProductStock: (productId: string, stock: number) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  validateCoupon: (code: string) => Promise<any>;
}

const Ctx = createContext<StoreContext | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Bootstrap on mount
  useEffect(() => {
    (async () => {
      // Load products from DB
      try {
        const prods = await api.products.list();
        dispatch({ type: 'SET_PRODUCTS', products: prods.map(dbProductToProduct) });
      } catch {
        // keep fallback products
      }

      // Restore session
      const token = getToken();
      if (token) {
        try {
          const user = await api.auth.me();
          dispatch({ type: 'LOGIN', user: { id: user.id, email: user.email, name: user.name ?? user.user_metadata?.name ?? 'User', role: user.role ?? 'customer' } });
          // Load cart & wishlist
          const [cartData, wishlistData] = await Promise.all([api.cart.get(), api.wishlist.get()]);
          dispatch({ type: 'SET_CART', cart: cartData.map(dbCartItemToCartItem) });
          dispatch({ type: 'SET_WISHLIST', wishlist: wishlistData.map((i: any) => ({ product: dbProductToProduct(i.products), addedAt: i.created_at })) });
        } catch {
          setToken(null);
        }
      }
      dispatch({ type: 'SET_INITIALIZED' });
    })();
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const { session, user } = await api.auth.login(email, password);
    setToken(session.access_token);
    dispatch({ type: 'LOGIN', user: { id: user.id, email: user.email, name: user.name ?? 'User', role: user.role ?? 'customer' } });
    const [cartData, wishlistData] = await Promise.all([api.cart.get(), api.wishlist.get()]);
    dispatch({ type: 'SET_CART', cart: cartData.map(dbCartItemToCartItem) });
    dispatch({ type: 'SET_WISHLIST', wishlist: wishlistData.map((i: any) => ({ product: dbProductToProduct(i.products), addedAt: i.created_at })) });
  };

  const register = async (email: string, password: string, name: string) => {
    await api.auth.register(email, password, name);
    await login(email, password);
  };

  const logout = async () => {
    try { await api.auth.logout(); } catch { /* ignore */ }
    setToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  // ── Cart ──────────────────────────────────────────────────────────────────

  const addToCart = async (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', product, quantity });
    if (state.user) {
      const existing = state.cart.find(i => i.product.id === product.id);
      const newQty = (existing?.quantity ?? 0) + quantity;
      await api.cart.add(product.id, newQty).catch(() => {});
    }
  };

  const removeFromCart = async (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', productId });
    if (state.user) await api.cart.remove(productId).catch(() => {});
  };

  const updateCartQty = async (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QTY', productId, quantity });
    if (state.user) {
      if (quantity <= 0) await api.cart.remove(productId).catch(() => {});
      else await api.cart.add(productId, quantity).catch(() => {});
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    if (state.user) await api.cart.clear().catch(() => {});
  };

  // ── Wishlist ──────────────────────────────────────────────────────────────

  const toggleWishlist = async (product: Product) => {
    dispatch({ type: 'TOGGLE_WISHLIST', product });
    if (state.user) await api.wishlist.toggle(product.id).catch(() => {});
  };

  // ── Orders ────────────────────────────────────────────────────────────────

  const loadOrders = async () => {
    if (!state.user) return;
    try {
      const data = await api.orders.list();
      dispatch({ type: 'SET_ORDERS', orders: data.map(dbOrderToOrder) });
    } catch { /* ignore */ }
  };

  const placeOrder = async (orderData: any): Promise<Order> => {
    if (state.user) {
      const data = await api.orders.create(orderData);
      const order = dbOrderToOrder({ ...data, order_items: orderData.items.map((i: CartItem) => ({ products: i.product, quantity: i.quantity })) });
      dispatch({ type: 'PLACE_ORDER', order });
      return order;
    }
    // Guest fallback
    const order: Order = {
      id: `ORD-${Date.now()}`,
      userId: 'guest',
      ...orderData,
      status: 'processing',
      date: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'PLACE_ORDER', order });
    return order;
  };

  const cancelOrder = async (orderId: string) => {
    dispatch({ type: 'CANCEL_ORDER', orderId });
    if (state.user) await api.orders.cancel(orderId).catch(() => {});
  };

  // ── Reviews ───────────────────────────────────────────────────────────────

  const loadReviews = async (productId: string) => {
    try {
      const data = await api.reviews.list(productId);
      dispatch({ type: 'SET_REVIEWS', productId, reviews: data.map(dbReviewToReview) });
    } catch { /* ignore */ }
  };

  const addReview = async (data: any) => {
    if (state.user) {
      const review = await api.reviews.create(data);
      dispatch({ type: 'ADD_REVIEW', review: dbReviewToReview(review) });
    }
  };

  // ── Admin ─────────────────────────────────────────────────────────────────

  const updateProductStock = async (productId: string, stock: number) => {
    dispatch({ type: 'UPDATE_PRODUCT_STOCK', productId, stock });
    await api.products.updateStock(productId, stock).catch(() => {});
  };

  const updateProduct = async (product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', product });
    await api.products.update(product.id, {
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.originalPrice,
      stock: product.stock,
    }).catch(() => {});
  };

  const deleteProduct = async (productId: string) => {
    dispatch({ type: 'DELETE_PRODUCT', productId });
    await api.products.delete(productId).catch(() => {});
  };

  const validateCoupon = async (code: string) => {
    const data = await api.coupons.validate(code);
    return {
      code: data.code,
      discount: Number(data.discount),
      type: data.type,
      minOrder: Number(data.min_order),
      expiresAt: data.expires_at,
      description: data.description,
    };
  };

  return (
    <Ctx.Provider value={{
      state, dispatch,
      login, register, logout,
      addToCart, removeFromCart, updateCartQty, clearCart,
      toggleWishlist,
      loadOrders, placeOrder, cancelOrder,
      loadReviews, addReview,
      updateProductStock, updateProduct, deleteProduct,
      validateCoupon,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useCartTotal(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}
