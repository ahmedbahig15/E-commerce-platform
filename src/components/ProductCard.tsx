import { useStore } from '../store';
import type { Product } from '../types';

interface Props {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact }: Props) {
  const { state, dispatch, addToCart, toggleWishlist } = useStore();
  const isWishlisted = state.wishlist.some(i => i.product.id === product.id);
  const isInCart = state.cart.some(i => i.product.id === product.id);
  const discountPct = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="group relative bg-[var(--background)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-lg hover:border-[var(--foreground)]/20 transition-all duration-200">
      <div className="relative overflow-hidden bg-[var(--secondary)] cursor-pointer" style={{ aspectRatio: '1 / 1' }} onClick={() => dispatch({ type: 'SET_PAGE', page: 'product-detail', productId: product.id })}>
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPct > 0 && <span className="px-2 py-0.5 text-xs font-bold bg-[var(--accent)] text-white rounded-full">-{discountPct}%</span>}
          {product.isNew && <span className="px-2 py-0.5 text-xs font-bold bg-[var(--foreground)] text-[var(--background)] rounded-full">NEW</span>}
          {product.stock <= 10 && product.stock > 0 && <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">Only {product.stock} left</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); toggleWishlist(product); }} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
          <svg className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-[var(--foreground)]'}`} viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">{product.category}</p>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'product-detail', productId: product.id })} className="text-sm font-medium text-left hover:text-[var(--accent)] transition-colors line-clamp-2 w-full mb-2">{product.name}</button>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">{[1,2,3,4,5].map(s => <svg key={s} className={`w-3 h-3 ${s<=Math.round(product.rating)?'fill-amber-400':'fill-[var(--muted)]'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
          {!compact && <span className="text-xs text-[var(--muted-foreground)]">({product.reviewCount.toLocaleString()})</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-sm font-bold text-[var(--foreground)]">${product.price.toFixed(2)}</span>
            {product.originalPrice && <span className="font-mono text-xs text-[var(--muted-foreground)] line-through ml-1.5">${product.originalPrice.toFixed(2)}</span>}
          </div>
          <button onClick={() => addToCart(product)} disabled={product.stock === 0} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${product.stock===0?'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed':isInCart?'bg-[var(--foreground)] text-[var(--background)]':'bg-[var(--secondary)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'}`}>
            {product.stock === 0 ? 'Sold Out' : isInCart ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
