import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center">
      <div className="card max-w-lg p-8 text-center">
        <div className="text-5xl">404</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
        <Link to="/" className="btn-primary mt-6">Return home</Link>
      </div>
    </div>
  );
}
