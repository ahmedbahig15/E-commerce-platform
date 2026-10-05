import { useStore } from '../store';

export default function Wishlist() {
  const { state, dispatch, addToCart, toggleWishlist } = useStore();

  if (state.wishlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🤍</div>
        <h2 className="font-serif text-2xl font-bold mb-3">Your wishlist is empty</h2>
        <p className="text-[var(--muted-foreground)] mb-6">Save items you love for later.</p>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'products' })} className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-semibold">Discover Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Wishlist</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{state.wishlist.length} saved items</p>
        </div>
        <button onClick={() => state.wishlist.forEach(item => addToCart(item.product))} className="px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-semibold hover:opacity-90">
          Add All to Cart
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {state.wishlist.map(item => {
          const product = item.product;
          const isInCart = state.cart.some(c => c.product.id === product.id);
          const discountPct = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
          return (
            <div key={product.id} className="group border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-all">
              <div className="relative aspect-square bg-[var(--secondary)] cursor-pointer overflow-hidden" onClick={() => dispatch({ type: 'SET_PAGE', page: 'product-detail', productId: product.id })}>
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {discountPct > 0 && <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold bg-[var(--accent)] text-white rounded-full">-{discountPct}%</span>}
                <button onClick={e => { e.stopPropagation(); toggleWishlist(product); }} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
                  <svg className="w-4 h-4 fill-red-500 stroke-red-500" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
              </div>
              <div className="p-3">
                <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'product-detail', productId: product.id })} className="text-sm font-medium line-clamp-2 text-left hover:text-[var(--accent)] transition-colors w-full mb-2">{product.name}</button>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-sm font-bold">${product.price.toFixed(2)}</span>
                    {product.originalPrice && <span className="font-mono text-xs text-[var(--muted-foreground)] line-through ml-1">${product.originalPrice.toFixed(2)}</span>}
                  </div>
                </div>
                <button onClick={() => addToCart(product)} disabled={product.stock === 0} className={`mt-2 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${product.stock === 0 ? 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed' : isInCart ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'}`}>
                  {product.stock === 0 ? 'Out of Stock' : isInCart ? '✓ In Cart' : 'Add to Cart'}
                </button>
                <p className="text-xs text-[var(--muted-foreground)] text-center mt-1 font-mono">
                  Added {new Date(item.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
