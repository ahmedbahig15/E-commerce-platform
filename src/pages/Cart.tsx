import { useState } from 'react';
import { useStore, useCartTotal } from '../store';

export default function Cart() {
  const { state, dispatch, removeFromCart, updateCartQty, clearCart, validateCoupon } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = useCartTotal(state.cart);
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const discountAmt = appliedCoupon
    ? appliedCoupon.type === 'percent' ? subtotal * (appliedCoupon.discount / 100) : appliedCoupon.discount
    : 0;
  const total = Math.max(0, subtotal - discountAmt + shipping);

  const applyCouponCode = async () => {
    setCouponError('');
    try {
      const coupon = await validateCoupon(couponCode);
      if (subtotal < coupon.minOrder) { setCouponError(`Minimum order of $${coupon.minOrder} required`); return; }
      setAppliedCoupon(coupon);
      setCouponCode('');
    } catch (e: any) {
      setCouponError(e.message ?? 'Invalid coupon code');
    }
  };

  if (state.cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="font-serif text-2xl font-bold mb-3">Your cart is empty</h2>
        <p className="text-[var(--muted-foreground)] mb-6">Add some products to get started.</p>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'products' })} className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-semibold">
          Continue Shopping
        </button>
        <div className="mt-10 text-left">
          <h3 className="text-sm font-semibold mb-3">Available Coupons</h3>
          <div className="space-y-2">
            {[{code:'WELCOME20',desc:'20% off your first order'},{code:'SUMMER15',desc:'15% off summer collection'},{code:'SAVE50',desc:'$50 off orders over $200'},{code:'FLASH10',desc:'10% off flash sale'}].map(c => (
              <div key={c.code} className="flex items-center gap-3 p-3 border border-dashed border-[var(--border)] rounded-xl">
                <span className="font-mono text-sm font-bold text-[var(--accent)]">{c.code}</span>
                <span className="text-sm text-[var(--muted-foreground)]">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">Shopping Cart ({state.cart.reduce((s, i) => s + i.quantity, 0)} items)</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {state.cart.map(item => (
            <div key={item.product.id} className="flex gap-4 p-4 border border-[var(--border)] rounded-xl">
              <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'product-detail', productId: item.product.id })} className="flex-shrink-0 w-24 h-24 bg-[var(--secondary)] rounded-lg overflow-hidden">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </button>
              <div className="flex-1 min-w-0">
                <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'product-detail', productId: item.product.id })} className="font-medium text-sm hover:text-[var(--accent)] transition-colors line-clamp-2 text-left">{item.product.name}</button>
                <p className="text-xs text-[var(--muted-foreground)] font-mono mt-0.5">{item.product.sku}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
                    <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--secondary)] text-sm">−</button>
                    <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--secondary)] text-sm">+</button>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold">${(item.product.price * item.quantity).toFixed(2)}</div>
                    {item.quantity > 1 && <div className="text-xs text-[var(--muted-foreground)]">${item.product.price.toFixed(2)} each</div>}
                  </div>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.product.id)} className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'products' })} className="px-6 py-2.5 border border-[var(--border)] rounded-full text-sm font-medium hover:bg-[var(--secondary)] transition-colors">← Continue Shopping</button>
            <button onClick={clearCart} className="px-6 py-2.5 border border-[var(--border)] rounded-full text-sm font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors">Clear Cart</button>
          </div>
        </div>

        <div>
          <div className="border border-[var(--border)] rounded-2xl p-6 sticky top-24">
            <h2 className="font-serif text-xl font-bold mb-6">Order Summary</h2>
            <div className="mb-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-2">Coupon Code</label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div><span className="text-sm font-mono font-bold text-green-700">{appliedCoupon.code}</span><p className="text-xs text-green-600">{appliedCoupon.description}</p></div>
                  <button onClick={() => setAppliedCoupon(null)} className="text-green-600 hover:text-green-800 text-sm">✕</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }} placeholder="WELCOME20" className="flex-1 px-3 py-2 text-sm border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)] font-mono" />
                    <button onClick={applyCouponCode} className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-medium hover:opacity-90">Apply</button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  <div className="mt-2 space-y-1">
                    {['WELCOME20','SUMMER15','SAVE50','FLASH10'].map(c => (
                      <button key={c} onClick={() => { setCouponCode(c); setCouponError(''); }} className="text-xs text-[var(--accent)] hover:underline block">Use {c}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="space-y-3 text-sm border-t border-[var(--border)] pt-4">
              <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
              {discountAmt > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({appliedCoupon.code})</span><span className="font-mono">−${discountAmt.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Shipping</span><span className="font-mono">{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
              {subtotal < 75 && <p className="text-xs text-[var(--muted-foreground)]">Add ${(75 - subtotal).toFixed(2)} more for free shipping</p>}
              <div className="flex justify-between pt-3 border-t border-[var(--border)] font-bold text-base"><span>Total</span><span className="font-mono">${total.toFixed(2)}</span></div>
            </div>
            <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'checkout' })} className="w-full mt-6 py-3.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-semibold hover:opacity-90 transition-opacity">Proceed to Checkout →</button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Secure SSL encrypted checkout
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              {['VISA','MC','AMEX','PayPal'].map(p => <span key={p} className="px-2 py-1 border border-[var(--border)] rounded text-[0.6rem] font-mono font-bold text-[var(--muted-foreground)]">{p}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
