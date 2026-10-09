import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'brand@demo.com', password: 'demo123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      setSuccess(true);
      const destination = form.email.toLowerCase() === 'reviewer@demo.com' ? '/verification/review' : '/dashboard';
      window.setTimeout(() => navigate(destination), 900);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container-shell flex min-h-[calc(100vh-170px)] items-center justify-center py-10 sm:py-16">
        <div className="login-success-screen">
          <div className="login-twin-wrap" aria-label="CreatorTwin logo animation">
            <div className="login-twin-core">
              <span className="login-twin-line login-line-one" />
              <span className="login-twin-line login-line-two" />
              <span className="login-twin-node" />
            </div>
          </div>
          <div className="login-success-text">Welcome back.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell flex min-h-[calc(100vh-170px)] items-center justify-center py-10 sm:py-16">
      <div className="mx-auto w-full max-w-lg surface-card p-8 sm:p-10">
        <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">Log in</h1>
        <p className="mt-2 text-sm text-slate-600">Access your creator, brand, or reviewer workspace.</p>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
        </form>

        <div className="mt-6 text-sm text-slate-600">
          Demo brand: brand@demo.com / demo123
        </div>
        <div className="mt-2 text-sm text-slate-600">
          Demo creator: creator@demo.com / demo123
        </div>
        <div className="mt-2 text-sm text-slate-600">
          Demo reviewer: reviewer@demo.com / demo123
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Need an account? <Link to="/register" className="font-medium text-brand-600">Create one</Link>
        </p>
      </div>
    </div>
  );
}
