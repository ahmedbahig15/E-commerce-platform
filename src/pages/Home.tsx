import { useStore } from '../store';
import { products, categories } from '../data';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { dispatch } = useStore();
  const featured = products.filter(p => p.featured);
  const newArrivals = products.filter(p => p.isNew);

  const goProducts = (category?: string) => {
    if (category) dispatch({ type: 'SET_CATEGORY', category });
    dispatch({ type: 'SET_PAGE', page: 'products' });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--foreground)] text-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent)] mb-4">New Season Arrivals</p>
              <h1 className="font-serif text-5xl md:text-7xl font-bold leading-none mb-6">
                Shop the
                <br />
                <em className="not-italic text-[var(--accent)]">best,</em>
                <br />
                live better.
              </h1>
              <p className="text-base text-white/60 leading-relaxed mb-8 max-w-md">
                Curated products from the world's leading brands. Free shipping on orders over $75. Easy 30-day returns.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => goProducts()}
                  className="px-8 py-3.5 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent)]/90 transition-colors"
                >
                  Shop Now
                </button>
                <button
                  onClick={() => goProducts()}
                  className="px-8 py-3.5 border border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
                >
                  View Categories
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10 pt-10 border-t border-white/10">
                {[
                  { value: '50K+', label: 'Products' },
                  { value: '4.8★', label: 'Avg. Rating' },
                  { value: '2M+', label: 'Happy Customers' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="font-mono text-2xl font-bold">{s.value}</div>
                    <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image grid */}
            <div className="hidden md:grid grid-cols-2 gap-3 h-[500px]">
              <div className="grid gap-3">
                <div className="rounded-xl overflow-hidden bg-white/5">
                  <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=280&fit=crop&auto=format" alt="Headphones" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden bg-white/5">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=200&fit=crop&auto=format" alt="Sneakers" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="grid gap-3 mt-8">
                <div className="rounded-xl overflow-hidden bg-white/5">
                  <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=220&fit=crop&auto=format" alt="Laptop" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden bg-white/5">
                  <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=250&fit=crop&auto=format" alt="Clothing" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <div className="bg-[var(--accent)] text-white py-3 text-center">
        <p className="text-sm font-medium">
          🔥 Use code <span className="font-mono font-bold">WELCOME20</span> for 20% off your first order &nbsp;·&nbsp;
          Free shipping on orders $75+
        </p>
      </div>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-widest mb-1">Browse by</p>
            <h2 className="font-serif text-3xl font-bold">Categories</h2>
          </div>
          <button onClick={() => goProducts()} className="text-sm font-medium hover:text-[var(--accent)] transition-colors">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => goProducts(cat.id)}
              className="group relative rounded-xl overflow-hidden aspect-square bg-[var(--secondary)] hover:shadow-md transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                <p className="text-white font-semibold text-sm">{cat.name}</p>
                <p className="text-white/60 text-xs">{cat.productCount} items</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-widest mb-1">Hand-picked</p>
            <h2 className="font-serif text-3xl font-bold">Featured Products</h2>
          </div>
          <button onClick={() => goProducts()} className="text-sm font-medium hover:text-[var(--accent)] transition-colors">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="bg-[var(--secondary)] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-widest mb-1">Just in</p>
                <h2 className="font-serif text-3xl font-bold">New Arrivals</h2>
              </div>
              <button onClick={() => goProducts()} className="text-sm font-medium hover:text-[var(--accent)] transition-colors">
                View all →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $75' },
            { icon: '↩️', title: '30-Day Returns', desc: 'Hassle-free returns' },
            { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
            { icon: '🏷️', title: 'Best Prices', desc: 'Price match guarantee' },
          ].map(item => (
            <div key={item.title} className="text-center p-6 rounded-xl border border-[var(--border)] hover:border-[var(--foreground)]/20 transition-colors">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
