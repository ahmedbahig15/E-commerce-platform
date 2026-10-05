import { useState } from 'react';
import { useStore } from '../store';

export default function Auth() {
  const { login, register, dispatch } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { label: 'Customer', email: 'demo@vela.com', password: 'demo1234', note: 'create this user in Supabase dashboard first' },
    { label: 'Admin', email: 'admin@vela.com', password: 'admin1234', note: '' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        await register(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }
      dispatch({ type: 'SET_PAGE', page: 'home' });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      dispatch({ type: 'SET_PAGE', page: 'home' });
    } catch (err: any) {
      setError(`Demo login failed: ${err.message}. Make sure the demo user exists.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-2">
            <span className="font-serif text-3xl font-bold">Vela</span>
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1" />
          </div>
          <h1 className="font-serif text-2xl font-bold">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {mode === 'login' ? 'Sign in to your account to continue' : 'Join thousands of happy shoppers'}
          </p>
        </div>

        {/* Demo quick login */}
        <div className="mb-6">
          <p className="text-xs text-center text-[var(--muted-foreground)] mb-3">Demo accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map(({ label, email, password }) => (
              <button
                key={label}
                onClick={() => handleDemoLogin(email, password)}
                disabled={loading}
                className={`py-2 px-4 text-xs font-semibold border-2 rounded-xl transition-colors hover:border-[var(--foreground)] disabled:opacity-50 ${label === 'Admin' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)]'}`}
              >
                {label === 'Admin' ? '🔑 ' : '👤 '}Login as {label}
              </button>
            ))}
          </div>
          <p className="text-[0.65rem] text-center text-[var(--muted-foreground)] mt-2">
            Create these users in your Supabase Auth dashboard first.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted-foreground)]">or continue with email</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">Full Name</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alex Morgan" className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm" />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">Email Address</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="alex@example.com" className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">Password</label>
            <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm" />
          </div>
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">Confirm Password</label>
              <input type="password" required value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm" />
            </div>
          )}
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setForm({ name: '', email: '', password: '', confirmPassword: '' }); }} className="font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
