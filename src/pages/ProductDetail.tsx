import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { categories } from '../data';
import type { Review } from '../types';

export default function ProductDetail() {
  const { state, dispatch, addToCart, toggleWishlist, loadReviews, addReview } = useStore();
  const product = state.adminProducts.find(p => p.id === state.selectedProductId);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [tab, setTab] = useState<'description' | 'reviews'>('description');

  useEffect(() => {
    if (product?.id) loadReviews(product.id);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-[var(--muted-foreground)]">Product not found.</p>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'products' })} className="mt-4 px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm">Back to Shop</button>
      </div>
    );
  }

  const productReviews = state.reviews.filter(r => r.productId === product.id);
  const isWishlisted = state.wishlist.some(i => i.product.id === product.id);
  const isInCart = state.cart.some(i => i.product.id === product.id);
  const discountPct = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const catName = categories.find(c => c.id === product.category)?.name ?? product.category;

  const handleAddReview = async () => {
    if (!reviewForm.comment.trim()) return;
    await addReview({ product_id: product.id, rating: reviewForm.rating, comment: reviewForm.comment });
    setReviewSubmitted(true);
    setReviewForm({ rating: 5, comment: '' });
  };

  const relatedProducts = state.adminProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-6">
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'home' })} className="hover:text-[var(--foreground)]">Home</button>
        <span>/</span>
        <button onClick={() => { dispatch({ type: 'SET_CATEGORY', category: product.category }); dispatch({ type: 'SET_PAGE', page: 'products' }); }} className="hover:text-[var(--foreground)]">{catName}</button>
        <span>/</span>
        <span className="text-[var(--foreground)] line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        <div className="space-y-3">
          <div className="aspect-square bg-[var(--secondary)] rounded-2xl overflow-hidden">
            <img src={product.images[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImg===i?'border-[var(--foreground)]':'border-[var(--border)] hover:border-[var(--muted-foreground)]'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--muted-foreground)]">{catName}</span>
            {product.isNew && <span className="px-2 py-0.5 text-xs font-bold bg-[var(--foreground)] text-[var(--background)] rounded-full">NEW</span>}
          </div>
          <h1 className="font-serif text-3xl font-bold mb-3 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">{[1,2,3,4,5].map(s => <svg key={s} className={`w-4 h-4 ${s<=Math.round(product.rating)?'fill-amber-400':'fill-[var(--muted)]'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
            <span className="text-sm font-medium">{product.rating}</span>
            <button onClick={() => setTab('reviews')} className="text-sm text-[var(--muted-foreground)] hover:underline">({product.reviewCount.toLocaleString()} reviews)</button>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-4xl font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && <><span className="font-mono text-lg text-[var(--muted-foreground)] line-through">${product.originalPrice.toFixed(2)}</span><span className="px-2 py-0.5 text-sm font-bold bg-[var(--accent)] text-white rounded-full">-{discountPct}%</span></>}
          </div>
          <div className="mb-6">
            {product.stock === 0 ? <span className="text-sm font-semibold text-red-500">Out of Stock</span>
            : product.stock <= 10 ? <span className="text-sm font-semibold text-orange-500">Only {product.stock} left in stock</span>
            : <span className="text-sm text-green-600 font-semibold">✓ In Stock</span>}
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 flex items-center justify-center hover:bg-[var(--secondary)] transition-colors">−</button>
              <span className="w-10 text-center font-mono font-medium text-sm">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty+1))} className="w-10 h-10 flex items-center justify-center hover:bg-[var(--secondary)] transition-colors">+</button>
            </div>
            <button onClick={() => addToCart(product, qty)} disabled={product.stock===0} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${product.stock===0?'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed':'bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90'}`}>
              {isInCart ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
            <button onClick={() => toggleWishlist(product)} className={`w-11 h-11 flex items-center justify-center border rounded-xl transition-colors ${isWishlisted?'border-red-300 bg-red-50':'border-[var(--border)] hover:border-[var(--foreground)]/30'}`}>
              <svg className={`w-5 h-5 ${isWishlisted?'fill-red-500 stroke-red-500':'fill-none stroke-[var(--foreground)]'}`} viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>
          <button onClick={() => { addToCart(product, qty); dispatch({ type: 'SET_PAGE', page: 'checkout' }); }} disabled={product.stock===0} className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Buy Now</button>
          <p className="mt-4 text-xs text-[var(--muted-foreground)] font-mono">SKU: {product.sku}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">{product.tags.map(tag => <span key={tag} className="px-2.5 py-1 text-xs bg-[var(--secondary)] rounded-full text-[var(--muted-foreground)]">#{tag}</span>)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-[var(--border)] mb-6">
          {(['description','reviews'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab===t?'border-[var(--foreground)] text-[var(--foreground)]':'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
              {t==='reviews'?`Reviews (${productReviews.length})`:t}
            </button>
          ))}
        </div>
        {tab === 'description' && <p className="text-[var(--muted-foreground)] leading-relaxed text-base">{product.description}</p>}
        {tab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center gap-8 p-6 bg-[var(--secondary)] rounded-xl">
              <div className="text-center">
                <div className="font-mono text-5xl font-bold">{product.rating}</div>
                <div className="flex justify-center mt-1">{[1,2,3,4,5].map(s=><svg key={s} className={`w-4 h-4 ${s<=Math.round(product.rating)?'fill-amber-400':'fill-[var(--muted)]'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{product.reviewCount.toLocaleString()} reviews</p>
              </div>
            </div>
            {productReviews.map(review => (
              <div key={review.id} className="border-b border-[var(--border)] pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div><span className="font-semibold text-sm">{review.userName}</span><div className="flex mt-0.5">{[1,2,3,4,5].map(s=><svg key={s} className={`w-3 h-3 ${s<=review.rating?'fill-amber-400':'fill-[var(--muted)]'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div></div>
                  <span className="text-xs text-[var(--muted-foreground)] font-mono">{review.date}</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{review.comment}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">👍 {review.helpful} found this helpful</p>
              </div>
            ))}
            {productReviews.length === 0 && <p className="text-[var(--muted-foreground)] text-sm">No reviews yet. Be the first!</p>}
            {!reviewSubmitted ? (
              <div className="bg-[var(--secondary)] rounded-xl p-6">
                <h4 className="font-semibold mb-4">Write a Review</h4>
                {!state.user && <p className="text-sm text-[var(--muted-foreground)] mb-3">Please <button onClick={() => dispatch({type:'SET_PAGE',page:'auth'})} className="text-[var(--accent)] hover:underline font-medium">sign in</button> to leave a review.</p>}
                <div className="mb-3"><label className="text-xs text-[var(--muted-foreground)] mb-1 block">Your Rating</label>
                  <div className="flex gap-1">{[1,2,3,4,5].map(s=><button key={s} onClick={()=>setReviewForm(f=>({...f,rating:s}))}><svg className={`w-6 h-6 transition-colors ${s<=reviewForm.rating?'fill-amber-400':'fill-[var(--muted)] hover:fill-amber-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></button>)}</div>
                </div>
                <textarea rows={3} placeholder="Share your experience..." value={reviewForm.comment} onChange={e=>setReviewForm(f=>({...f,comment:e.target.value}))} className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none" />
                <button onClick={handleAddReview} disabled={!state.user} className="mt-3 px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">Submit Review</button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 font-medium">✓ Thank you for your review!</div>
            )}
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-serif text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <div key={p.id} className="group cursor-pointer border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-all" onClick={() => dispatch({type:'SET_PAGE',page:'product-detail',productId:p.id})}>
                <div className="aspect-square bg-[var(--secondary)] overflow-hidden"><img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                <div className="p-3"><p className="text-xs font-medium line-clamp-1">{p.name}</p><p className="font-mono text-sm font-bold mt-1">${p.price.toFixed(2)}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
