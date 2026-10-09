import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'brand' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shell py-16">
      <div className="mx-auto max-w-lg surface-card p-8">
        <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Join as a brand or creator.</p>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" name="name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a password" required />
          </div>
          <div>
            <label className="label" htmlFor="role">Role</label>
            <select id="role" name="role" className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="brand">Brand / Agency</option>
              <option value="creator">Creator</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-medium text-brand-600">Log in</Link>
        </p>
      </div>
    </div>
  );
}
