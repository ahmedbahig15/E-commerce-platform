import { useStore } from '../store';

export default function Footer() {
  const { dispatch } = useStore();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--secondary)] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1 mb-3">
              <span className="font-serif text-2xl font-bold">Vela</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1" />
            </div>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Premium products, curated for modern living. Free shipping on orders over $75.
            </p>
          </div>

          {[
            { title: 'Shop', links: ['Electronics', 'Clothing', 'Home & Living', 'Sports', 'Beauty', 'Books'] },
            { title: 'Account', links: ['Sign In', 'Register', 'Orders', 'Wishlist', 'Track Package'] },
            { title: 'Support', links: ['Help Center', 'Returns', 'Shipping Info', 'Size Guide', 'Contact Us'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link}>
                    <button
                      onClick={() => dispatch({ type: 'SET_PAGE', page: link === 'Sign In' || link === 'Register' ? 'auth' : link === 'Orders' ? 'orders' : link === 'Wishlist' ? 'wishlist' : 'products' })}
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted-foreground)]">© 2025 Vela Commerce. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(item => (
              <button key={item} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{item}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
