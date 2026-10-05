import { useState } from 'react';
import { useStore } from '../store';
import type { Page } from '../types';

export default function Header() {
  const { state, dispatch } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = state.wishlist.length;

  const nav = (page: Page) => {
    dispatch({ type: 'SET_PAGE', page });
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-8">
          {/* Logo */}
          <button onClick={() => nav('home')} className="flex-shrink-0 flex items-center gap-1">
            <span className="font-serif text-2xl font-bold tracking-tight text-[var(--foreground)]">Vela</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            {[
              { label: 'Shop', page: 'products' as Page },
              { label: 'Categories', page: 'products' as Page },
            ].map(({ label, page }) => (
              <button
                key={label}
                onClick={() => nav(page)}
                className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Search bar */}
          <div className="hidden sm:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={state.searchQuery}
                onChange={e => {
                  dispatch({ type: 'SET_SEARCH', query: e.target.value });
                  if (e.target.value && state.page !== 'products') nav('products');
                }}
                className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {state.user ? (
              <div className="hidden sm:flex items-center gap-1">
                {state.user.role === 'admin' && (
                  <button
                    onClick={() => nav('admin')}
                    className="px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-white rounded-full"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => nav('orders')}
                  className="px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  Orders
                </button>
                <button
                  onClick={() => dispatch({ type: 'LOGOUT' })}
                  className="px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => nav('auth')}
                className="hidden sm:block px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Sign In
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={() => nav('wishlist')}
              className="relative p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-[var(--accent)] text-white rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => nav('cart')}
              className="relative p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-[var(--foreground)] text-[var(--background)] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-[var(--border)] flex flex-col gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={state.searchQuery}
                onChange={e => { dispatch({ type: 'SET_SEARCH', query: e.target.value }); nav('products'); }}
                className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <button onClick={() => nav('products')} className="text-left px-2 py-2 text-sm font-medium">Shop</button>
            {state.user ? (
              <>
                <button onClick={() => nav('orders')} className="text-left px-2 py-2 text-sm font-medium">Orders</button>
                {state.user.role === 'admin' && (
                  <button onClick={() => nav('admin')} className="text-left px-2 py-2 text-sm font-medium text-[var(--accent)]">Admin Dashboard</button>
                )}
                <button onClick={() => dispatch({ type: 'LOGOUT' })} className="text-left px-2 py-2 text-sm font-medium text-[var(--muted-foreground)]">Sign Out</button>
              </>
            ) : (
              <button onClick={() => nav('auth')} className="text-left px-2 py-2 text-sm font-medium">Sign In / Register</button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
