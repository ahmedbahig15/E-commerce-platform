import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { api } from '../lib/api';
import type { Product } from '../types';

type AdminTab = 'overview' | 'products' | 'orders' | 'inventory' | 'coupons';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Admin() {
  const { state, dispatch, loadOrders, updateProductStock, updateProduct, deleteProduct } = useStore();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
    api.coupons.list().then(setCoupons).catch(() => {});
  }, []);

  if (!state.user || state.user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="font-serif text-2xl font-bold mb-3">Access Denied</h2>
        <p className="text-[var(--muted-foreground)] mb-6 text-sm">You need admin privileges to view this page.</p>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'auth' })} className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-semibold">Sign In as Admin</button>
      </div>
    );
  }

  const totalRevenue = state.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const pendingOrders = state.orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  const lowStockProducts = state.adminProducts.filter(p => p.stock <= 10);
  const filteredOrders = orderFilter === 'all' ? state.orders : state.orders.filter(o => o.status === orderFilter);

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'orders', label: 'Orders', icon: '🛍️' },
    { id: 'inventory', label: 'Inventory', icon: '🏭' },
    { id: 'coupons', label: 'Coupons', icon: '🏷️' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Logged in as {state.user.name}</p>
        </div>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'home' })} className="px-4 py-2 border border-[var(--border)] rounded-full text-sm font-medium hover:bg-[var(--secondary)]">← Back to Store</button>
      </div>

      <div className="flex gap-1 mb-8 border-b border-[var(--border)] overflow-x-auto pb-px">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${tab===t.id?'border-[var(--foreground)] text-[var(--foreground)]':'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`, icon: '💰', sub: 'All time' },
              { label: 'Total Orders', value: state.orders.length.toLocaleString(), icon: '🛍️', sub: 'All time' },
              { label: 'Pending Orders', value: pendingOrders.toLocaleString(), icon: '⏳', sub: 'Needs attention' },
              { label: 'Low Stock Items', value: lowStockProducts.length.toLocaleString(), icon: '⚠️', sub: `${lowStockProducts.length} items` },
            ].map(stat => (
              <div key={stat.label} className="border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{stat.label}</p><span className="text-xl">{stat.icon}</span></div>
                <p className="font-mono text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-4">Recent Orders</h2>
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-[var(--secondary)] text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Order</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Total</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {state.orders.slice(0,5).map(order => (
                    <tr key={order.id} className="hover:bg-[var(--secondary)]/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-xs">{order.id}</td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)] hidden sm:table-cell text-xs">{order.date}</td>
                      <td className="px-4 py-3 font-mono font-bold">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[order.status]}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-4">⚠️ Low Stock Alert</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 border border-orange-200 bg-orange-50 rounded-xl">
                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                      <p className={`text-xs font-mono font-bold ${p.stock===0?'text-red-600':'text-orange-600'}`}>{p.stock===0?'OUT OF STOCK':`${p.stock} remaining`}</p>
                    </div>
                    <button onClick={() => setTab('inventory')} className="text-xs text-orange-600 hover:underline">Restock</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-lg">Products ({state.adminProducts.length})</h2></div>
          {editingProduct ? (
            <div className="border border-[var(--border)] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-base">Edit Product</h3><button onClick={() => setEditingProduct(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button></div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[{key:'name',label:'Name'},{key:'sku',label:'SKU'}].map(({key,label}) => (
                  <div key={key}><label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">{label}</label><input type="text" value={editingProduct[key as keyof Product] as string} onChange={e => setEditingProduct(p => p?{...p,[key]:e.target.value}:p)} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring)]" /></div>
                ))}
                <div><label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">Price</label><input type="number" value={editingProduct.price} onChange={e => setEditingProduct(p => p?{...p,price:Number(e.target.value)}:p)} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[var(--ring)]" /></div>
                <div><label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">Stock</label><input type="number" value={editingProduct.stock} onChange={e => setEditingProduct(p => p?{...p,stock:Number(e.target.value)}:p)} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[var(--ring)]" /></div>
                <div className="sm:col-span-2"><label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">Description</label><textarea rows={3} value={editingProduct.description} onChange={e => setEditingProduct(p => p?{...p,description:e.target.value}:p)} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring)] resize-none" /></div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => { updateProduct(editingProduct); setEditingProduct(null); }} className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-medium hover:opacity-90">Save Changes</button>
                <button onClick={() => setEditingProduct(null)} className="px-6 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium hover:bg-[var(--secondary)]">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-[var(--secondary)]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {state.adminProducts.map(product => (
                    <tr key={product.id} className="hover:bg-[var(--secondary)]/50 transition-colors">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-lg bg-[var(--secondary)]" /><div><p className="font-medium line-clamp-1">{product.name}</p><p className="text-xs text-[var(--muted-foreground)] font-mono">{product.sku}</p></div></div></td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)] hidden md:table-cell capitalize">{product.category}</td>
                      <td className="px-4 py-3 font-mono font-bold">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3"><span className={`font-mono text-xs font-bold ${product.stock===0?'text-red-600':product.stock<=10?'text-orange-500':'text-green-600'}`}>{product.stock}</span></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => setEditingProduct(product)} className="px-2.5 py-1 text-xs font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]">Edit</button><button onClick={() => deleteProduct(product.id)} className="px-2.5 py-1 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50">Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-semibold text-lg">Orders ({filteredOrders.length})</h2>
            <div className="flex gap-2 flex-wrap">
              {['all','pending','processing','shipped','delivered','cancelled'].map(status => (
                <button key={status} onClick={() => setOrderFilter(status)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${orderFilter===status?'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]':'border-[var(--border)] hover:border-[var(--foreground)]/30'}`}>{status}</button>
              ))}
            </div>
          </div>
          <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-[var(--secondary)]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[var(--secondary)]/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-xs">{order.id}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)] hidden sm:table-cell text-xs">{order.date}</td>
                    <td className="px-4 py-3"><div className="flex -space-x-1">{order.items.slice(0,3).map((item,i) => <img key={i} src={item.product.images[0]} alt="" className="w-7 h-7 object-cover rounded-full border-2 border-white" />)}{order.items.length>3&&<div className="w-7 h-7 rounded-full bg-[var(--secondary)] border-2 border-white flex items-center justify-center text-[0.6rem] font-bold">+{order.items.length-3}</div>}</div></td>
                    <td className="px-4 py-3 font-mono font-bold">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[order.status]}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length===0&&<div className="text-center py-10 text-[var(--muted-foreground)] text-sm">No orders found</div>}
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <div>
          <h2 className="font-semibold text-lg mb-4">Inventory Management</h2>
          <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-[var(--secondary)]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] hidden md:table-cell">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Adjust</th>
              </tr></thead>
              <tbody className="divide-y divide-[var(--border)]">
                {state.adminProducts.map(product => (
                  <tr key={product.id} className={`hover:bg-[var(--secondary)]/50 transition-colors ${product.stock<=10?'bg-orange-50/30':''}`}>
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={product.images[0]} alt={product.name} className="w-9 h-9 object-cover rounded-lg" /><span className="font-medium line-clamp-1 text-sm">{product.name}</span></div></td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted-foreground)] hidden md:table-cell">{product.sku}</td>
                    <td className="px-4 py-3"><span className={`font-mono font-bold text-sm ${product.stock===0?'text-red-600':product.stock<=10?'text-orange-500':'text-green-600'}`}>{product.stock}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs font-bold rounded-full ${product.stock===0?'bg-red-100 text-red-700':product.stock<=10?'bg-orange-100 text-orange-700':'bg-green-100 text-green-700'}`}>{product.stock===0?'Out of Stock':product.stock<=10?'Low Stock':'In Stock'}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1">
                      <button onClick={() => updateProductStock(product.id, Math.max(0, product.stock-1))} className="w-7 h-7 flex items-center justify-center border border-[var(--border)] rounded-md hover:bg-[var(--secondary)] text-sm">−</button>
                      <span className="w-10 text-center font-mono text-sm">{product.stock}</span>
                      <button onClick={() => updateProductStock(product.id, product.stock+1)} className="w-7 h-7 flex items-center justify-center border border-[var(--border)] rounded-md hover:bg-[var(--secondary)] text-sm">+</button>
                      <button onClick={() => updateProductStock(product.id, 100)} className="ml-1 px-2.5 py-1 text-xs font-medium bg-[var(--foreground)] text-[var(--background)] rounded-md hover:opacity-90">Restock</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'coupons' && (
        <div>
          <h2 className="font-semibold text-lg mb-4">Coupon Codes</h2>
          {coupons.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-sm">Run the SQL migration to seed coupons.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {coupons.map(coupon => {
                const expired = new Date(coupon.expires_at) < new Date();
                return (
                  <div key={coupon.code} className={`border rounded-xl p-5 transition-shadow ${expired?'opacity-60':'hover:shadow-sm'} border-[var(--border)]`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-mono text-xl font-bold text-[var(--accent)]">{coupon.code}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${expired?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>{expired?'Expired':'Active'}</span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-3">{coupon.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[var(--secondary)] rounded-lg p-2"><p className="text-xs text-[var(--muted-foreground)]">Discount</p><p className="font-mono text-sm font-bold">{coupon.type==='percent'?`${coupon.discount}%`:`$${coupon.discount}`}</p></div>
                      <div className="bg-[var(--secondary)] rounded-lg p-2"><p className="text-xs text-[var(--muted-foreground)]">Min Order</p><p className="font-mono text-sm font-bold">${coupon.min_order}</p></div>
                      <div className="bg-[var(--secondary)] rounded-lg p-2"><p className="text-xs text-[var(--muted-foreground)]">Uses</p><p className="font-mono text-sm font-bold">{coupon.uses?.toLocaleString()??0}</p></div>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-3 font-mono">Expires: {coupon.expires_at?.split('T')[0]}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
