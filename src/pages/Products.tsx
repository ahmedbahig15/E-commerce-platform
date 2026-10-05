import { useMemo } from 'react';
import { useStore } from '../store';
import { categories } from '../data';
import ProductCard from '../components/ProductCard';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function Products() {
  const { state, dispatch } = useStore();

  const filtered = useMemo(() => {
    let list = [...state.adminProducts];
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q)) ||
        p.category.includes(q)
      );
    }
    if (state.selectedCategory) {
      list = list.filter(p => p.category === state.selectedCategory);
    }
    list = list.filter(p => p.price >= state.priceRange[0] && p.price <= state.priceRange[1]);
    switch (state.sortBy) {
      case 'price-asc': return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      case 'rating': return list.sort((a, b) => b.rating - a.rating);
      case 'newest': return list.filter(p => p.isNew).concat(list.filter(p => !p.isNew));
      default: return list.filter(p => p.featured).concat(list.filter(p => !p.featured));
    }
  }, [state.adminProducts, state.searchQuery, state.selectedCategory, state.priceRange, state.sortBy]);

  const clearFilters = () => {
    dispatch({ type: 'SET_SEARCH', query: '' });
    dispatch({ type: 'SET_CATEGORY', category: '' });
    dispatch({ type: 'SET_PRICE_RANGE', range: [0, 2000] });
    dispatch({ type: 'SET_SORT', sortBy: 'featured' });
  };

  const hasFilters = state.searchQuery || state.selectedCategory || state.priceRange[0] > 0 || state.priceRange[1] < 2000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold mb-1">
          {state.selectedCategory
            ? categories.find(c => c.id === state.selectedCategory)?.name ?? 'Products'
            : state.searchQuery ? `Results for "${state.searchQuery}"` : 'All Products'}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">{filtered.length} products</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => dispatch({ type: 'SET_CATEGORY', category: '' })}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${!state.selectedCategory ? 'bg-[var(--foreground)] text-[var(--background)]' : 'hover:bg-[var(--secondary)]'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => dispatch({ type: 'SET_CATEGORY', category: cat.id })}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex justify-between items-center ${state.selectedCategory === cat.id ? 'bg-[var(--foreground)] text-[var(--background)]' : 'hover:bg-[var(--secondary)]'}`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[0.65rem] opacity-60">{cat.productCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Price Range</h3>
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={2000}
                step={10}
                value={state.priceRange[1]}
                onChange={e => dispatch({ type: 'SET_PRICE_RANGE', range: [state.priceRange[0], Number(e.target.value)] })}
                className="w-full accent-[var(--foreground)]"
              />
              <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
                <span>${state.priceRange[0]}</span>
                <span>${state.priceRange[1]}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[[0, 50], [50, 200], [200, 500], [500, 2000]].map(([min, max]) => (
                <button
                  key={`${min}-${max}`}
                  onClick={() => dispatch({ type: 'SET_PRICE_RANGE', range: [min, max] })}
                  className={`py-1.5 text-xs rounded-lg border transition-colors ${state.priceRange[0] === min && state.priceRange[1] === max ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]' : 'border-[var(--border)] hover:border-[var(--foreground)]/30'}`}
                >
                  ${min}–{max === 2000 ? '2K+' : `$${max}`}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="w-full py-2 text-sm text-[var(--accent)] hover:underline text-left"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort & mobile filter bar */}
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Mobile category pills */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => dispatch({ type: 'SET_CATEGORY', category: state.selectedCategory === cat.id ? '' : cat.id })}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full border transition-colors ${state.selectedCategory === cat.id ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]' : 'border-[var(--border)] hover:border-[var(--foreground)]/30'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <label className="text-xs text-[var(--muted-foreground)] hidden sm:block">Sort:</label>
              <select
                value={state.sortBy}
                onChange={e => dispatch({ type: 'SET_SORT', sortBy: e.target.value })}
                className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-semibold text-lg mb-2">No products found</h3>
              <p className="text-[var(--muted-foreground)] text-sm mb-4">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-medium">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
