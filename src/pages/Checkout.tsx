import { useState } from 'react';
import { useStore, useCartTotal } from '../store';
import type { Address } from '../types';

type Step = 'address' | 'payment' | 'confirm';

export default function Checkout() {
  const { state, dispatch, placeOrder, clearCart, validateCoupon } = useStore();
  const [step, setStep] = useState<Step>('address');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  const [address, setAddress] = useState<Address>({
    name: state.user?.name ?? '',
    street: '', city: '', state: '', zip: '', country: 'US',
  });
  const [payment, setPayment] = useState({ method: 'card', cardNum: '', expiry: '', cvv: '', name: '' });

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

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const order = await placeOrder({
        items: state.cart,
        subtotal,
        discount: discountAmt,
        shipping,
        total,
        address,
        coupon_code: appliedCoupon?.code,
      });
      await clearCart();
      setOrderId(order.id);
      setOrderPlaced(true);
    } catch (e: any) {
      alert(`Order failed: ${e.message}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (state.cart.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-[var(--muted-foreground)] mb-4">Your cart is empty.</p>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'products' })} className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-medium">Shop Now</button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="font-serif text-3xl font-bold mb-2">Order Placed!</h2>
        <p className="text-[var(--muted-foreground)] mb-1">Thank you for your purchase.</p>
        <p className="font-mono text-sm text-[var(--accent)] font-bold mb-6">Order ID: {orderId}</p>
        <p className="text-sm text-[var(--muted-foreground)] mb-8">You'll receive a confirmation email shortly. We'll notify you when your order ships.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'orders' })} className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-medium">View Order</button>
          <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'products' })} className="px-6 py-2.5 border border-[var(--border)] rounded-full text-sm font-medium hover:bg-[var(--secondary)]">Continue Shopping</button>
        </div>
      </div>
    );
  }

  const steps: { id: Step; label: string }[] = [{ id: 'address', label: 'Shipping' }, { id: 'payment', label: 'Payment' }, { id: 'confirm', label: 'Confirm' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">Checkout</h1>
      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === s.id ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--muted-foreground)]'}`}>
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${step === s.id ? 'bg-white text-[var(--foreground)]' : 'bg-[var(--secondary)]'}`}>{i + 1}</span>
              {s.label}
            </div>
            {i < steps.length - 1 && <div className="w-8 h-px bg-[var(--border)] mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'address' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
              {[{key:'name',label:'Full Name',ph:'Alex Morgan'},{key:'street',label:'Street Address',ph:'123 Market Street'},{key:'city',label:'City',ph:'San Francisco'},{key:'state',label:'State',ph:'CA'},{key:'zip',label:'ZIP Code',ph:'94105'}].map(({key,label,ph}) => (
                <div key={key}>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">{label}</label>
                  <input type="text" value={address[key as keyof Address]} onChange={e => setAddress(a => ({...a,[key]:e.target.value}))} placeholder={ph} className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm" />
                </div>
              ))}
              <button onClick={() => setStep('payment')} disabled={!address.name||!address.street||!address.city||!address.state||!address.zip} className="w-full py-3.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity mt-2">Continue to Payment →</button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                {[{id:'card',label:'Credit Card',icon:'💳'},{id:'paypal',label:'PayPal',icon:'🅿️'},{id:'apple',label:'Apple Pay',icon:'🍎'}].map(m => (
                  <button key={m.id} onClick={() => setPayment(p=>({...p,method:m.id}))} className={`py-3 px-2 border-2 rounded-xl text-sm font-medium transition-colors flex flex-col items-center gap-1 ${payment.method===m.id?'border-[var(--foreground)] bg-[var(--secondary)]':'border-[var(--border)] hover:border-[var(--muted-foreground)]'}`}>
                    <span className="text-xl">{m.icon}</span><span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>
              {payment.method === 'card' && (
                <>
                  {[{key:'name',label:'Cardholder Name',ph:'Alex Morgan'},{key:'cardNum',label:'Card Number',ph:'4242 4242 4242 4242'}].map(({key,label,ph}) => (
                    <div key={key}>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">{label}</label>
                      <input type="text" placeholder={ph} value={payment[key as keyof typeof payment]} onChange={e=>setPayment(p=>({...p,[key]:e.target.value}))} className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm font-mono" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">Expiry</label><input type="text" placeholder="MM / YY" value={payment.expiry} onChange={e=>setPayment(p=>({...p,expiry:e.target.value}))} className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm font-mono" /></div>
                    <div><label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">CVV</label><input type="text" placeholder="•••" value={payment.cvv} onChange={e=>setPayment(p=>({...p,cvv:e.target.value}))} className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm font-mono" /></div>
                  </div>
                </>
              )}
              {payment.method !== 'card' && <div className="p-6 bg-[var(--secondary)] rounded-xl text-center text-sm text-[var(--muted-foreground)]">You'll be redirected to {payment.method === 'paypal' ? 'PayPal' : 'Apple Pay'} to complete your payment.</div>}
              <div className="flex gap-3">
                <button onClick={() => setStep('address')} className="px-6 py-3 border border-[var(--border)] rounded-xl font-medium text-sm hover:bg-[var(--secondary)]">← Back</button>
                <button onClick={() => setStep('confirm')} className="flex-1 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-semibold text-sm hover:opacity-90">Review Order →</button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-lg">Order Review</h2>
              <div className="border border-[var(--border)] rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Shipping to</h3>
                <p className="text-sm font-medium">{address.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{address.street}, {address.city}, {address.state} {address.zip}</p>
              </div>
              <div className="border border-[var(--border)] rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Payment</h3>
                <p className="text-sm font-medium">{payment.method==='card'?`Card ending in ${payment.cardNum.slice(-4)||'••••'}`:payment.method==='paypal'?'PayPal':'Apple Pay'}</p>
              </div>
              <div className="border border-[var(--border)] rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Items ({state.cart.reduce((s,i)=>s+i.quantity,0)})</h3>
                {state.cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg bg-[var(--secondary)]" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium line-clamp-1">{item.product.name}</p><p className="text-xs text-[var(--muted-foreground)]">Qty: {item.quantity}</p></div>
                    <span className="font-mono text-sm font-bold">${(item.product.price*item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {!appliedCoupon ? (
                <div>
                  <div className="flex gap-2">
                    <input type="text" value={couponCode} onChange={e=>{setCouponCode(e.target.value.toUpperCase());setCouponError('');}} placeholder="Coupon code" className="flex-1 px-3 py-2.5 text-sm border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)] font-mono" />
                    <button onClick={applyCouponCode} className="px-4 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-medium hover:opacity-90">Apply</button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-sm text-green-700 font-medium">✓ {appliedCoupon.code} applied</span>
                  <button onClick={()=>setAppliedCoupon(null)} className="text-xs text-green-600 hover:underline">Remove</button>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={()=>setStep('payment')} className="px-6 py-3 border border-[var(--border)] rounded-xl font-medium text-sm hover:bg-[var(--secondary)]">← Back</button>
                <button onClick={handlePlaceOrder} disabled={placingOrder} className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
                  {placingOrder ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="border border-[var(--border)] rounded-2xl p-5 sticky top-24">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {state.cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-[var(--muted-foreground)]">
                  <span className="line-clamp-1 flex-1">{item.product.name} ×{item.quantity}</span>
                  <span className="font-mono ml-2">${(item.product.price*item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2 text-sm">
              <div className="flex justify-between text-[var(--muted-foreground)]"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
              {discountAmt > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span className="font-mono">−${discountAmt.toFixed(2)}</span></div>}
              <div className="flex justify-between text-[var(--muted-foreground)]"><span>Shipping</span><span className="font-mono">{shipping===0?<span className="text-green-600">Free</span>:`$${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]"><span>Total</span><span className="font-mono">${total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
