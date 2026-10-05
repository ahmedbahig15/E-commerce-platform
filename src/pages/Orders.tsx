import { useEffect } from 'react';
import { useStore } from '../store';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, string> = {
  pending: '⏳', processing: '⚙️', shipped: '🚚', delivered: '✅', cancelled: '❌',
};

export default function Orders() {
  const { state, dispatch, loadOrders, cancelOrder, addToCart } = useStore();

  useEffect(() => { loadOrders(); }, [state.user?.id]);

  if (!state.user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="font-serif text-2xl font-bold mb-3">Sign in to view your orders</h2>
        <p className="text-[var(--muted-foreground)] mb-6 text-sm">Track your orders, manage returns, and more.</p>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'auth' })} className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  if (state.orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📦</div>
        <h2 className="font-serif text-2xl font-bold mb-3">No orders yet</h2>
        <p className="text-[var(--muted-foreground)] mb-6 text-sm">When you place an order, it'll appear here.</p>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'products' })} className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-semibold text-sm">Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">Your Orders</h1>
      <div className="space-y-4">
        {state.orders.map(order => (
          <div key={order.id} className="border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[var(--secondary)]">
              <div className="flex flex-wrap gap-4 text-sm">
                <div><p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Order ID</p><p className="font-mono font-bold">{order.id}</p></div>
                <div><p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Date</p><p className="font-medium">{new Date(order.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p></div>
                <div><p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Total</p><p className="font-mono font-bold">${order.total.toFixed(2)}</p></div>
                {order.couponCode && <div><p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Coupon</p><p className="font-mono text-sm text-green-600">{order.couponCode}</p></div>}
              </div>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[order.status]}`}>
                {statusIcons[order.status]} {order.status.charAt(0).toUpperCase()+order.status.slice(1)}
              </span>
            </div>
            <div className="p-4">
              <div className="space-y-3 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button onClick={() => dispatch({type:'SET_PAGE',page:'product-detail',productId:item.product.id})} className="w-14 h-14 bg-[var(--secondary)] rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button onClick={() => dispatch({type:'SET_PAGE',page:'product-detail',productId:item.product.id})} className="text-sm font-medium hover:text-[var(--accent)] transition-colors text-left line-clamp-1">{item.product.name}</button>
                      <p className="text-xs text-[var(--muted-foreground)]">Qty: {item.quantity} · ${item.product.price.toFixed(2)} each</p>
                    </div>
                    <span className="font-mono text-sm font-bold">${(item.product.price*item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                <div className="text-xs text-[var(--muted-foreground)]">
                  <span>Shipping to: </span><span className="font-medium text-[var(--foreground)]">{order.address.city}, {order.address.state}</span>
                  {order.trackingNumber && <><span className="mx-2">·</span><span>Tracking: </span><span className="font-mono font-medium text-[var(--foreground)]">{order.trackingNumber}</span></>}
                </div>
                <div className="flex gap-2">
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button onClick={() => cancelOrder(order.id)} className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Cancel Order</button>
                  )}
                  {order.status === 'delivered' && order.items[0] && (
                    <button onClick={() => addToCart(order.items[0].product)} className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] transition-colors">Buy Again</button>
                  )}
                </div>
              </div>
            </div>
            {(order.status === 'processing' || order.status === 'shipped') && (
              <div className="px-4 pb-4">
                <div className="flex items-center">
                  {[
                    { label: 'Ordered', done: true },
                    { label: 'Processing', done: ['shipped','delivered'].includes(order.status) },
                    { label: 'Shipped', done: ['shipped','delivered'].includes(order.status) },
                    { label: 'Delivered', done: (order.status as string) === 'delivered' },
                  ].map((s, i, arr) => (
                    <div key={s.label} className="flex items-center flex-1">
                      <div className={`flex flex-col items-center ${i===0?'':'flex-1'}`}>
                        {i > 0 && <div className={`h-0.5 w-full mb-2 ${s.done?'bg-green-400':'bg-[var(--border)]'}`} />}
                        <div className={`w-2 h-2 rounded-full ${s.done?'bg-green-400':'bg-[var(--border)]'}`} />
                        <p className="text-[0.6rem] text-[var(--muted-foreground)] mt-1 text-center">{s.label}</p>
                      </div>
                      {i < arr.length-1 && <div className={`flex-1 h-0.5 -mt-4 ${arr[i+1].done?'bg-green-400':'bg-[var(--border)]'}`} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
