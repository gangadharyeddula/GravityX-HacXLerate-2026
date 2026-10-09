import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import CreatorTwinLogo from './CreatorTwinLogo';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Discover', to: '/creators' },
  { label: 'For Creators', to: '/profile' },
  { label: 'For Brands', to: '/dashboard' },
  { label: 'Login', to: '/login' },
  { label: 'Sign Up', to: '/register' },
];

const roleLinks = {
  brand: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Create Brief', to: '/briefs/create' },
    { label: 'My Briefs', to: '/briefs' },
    { label: 'Engagements', to: '/engagements' },
    { label: 'Profile', to: '/profile' },
  ],
  creator: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Profile', to: '/profile' },
    { label: 'Portfolio', to: '/portfolio' },
    { label: 'Matching Briefs', to: '/briefs' },
    { label: 'Engagements', to: '/engagements' },
  ],
  reviewer: [
    { label: 'Verification queue', to: '/verification/review' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const links = user ? roleLinks[user.role] || roleLinks.brand : navLinks;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'border-b border-[var(--ct-border)] bg-[var(--ct-bg)]/90 backdrop-blur-sm' : 'border-b border-transparent bg-[var(--ct-bg)]'}`}>
      <div className="container-shell flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="group flex items-center gap-3 rounded-full transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-none" aria-label="Go to homepage">
          <div className="rounded-full p-1.5 transition-all duration-200 group-hover:bg-[rgba(45,212,191,0.08)] group-hover:shadow-[0_0_0_1px_rgba(45,212,191,0.12)]">
            <CreatorTwinLogo size="lg" showText={true} variant="light" />
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `rounded-[10px] px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-[var(--ct-panel)] text-[var(--ct-ink)] shadow-[0_6px_18px_rgba(0,0,0,0.05)]' : 'text-[var(--ct-slate)] hover:bg-[var(--ct-panel)]/80 hover:text-[var(--ct-ink)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {!user ? (
            <>
              <Link to="/login" className="btn-secondary hidden sm:inline-flex">Log in</Link>
              <Link to="/register" className="btn-primary hidden sm:inline-flex">Join now</Link>
            </>
          ) : (
            <>
              <span className="hidden text-sm font-medium text-[var(--ct-slate)] md:inline">{user.name}</span>
              <button onClick={handleLogout} className="btn-secondary hidden sm:inline-flex">Logout</button>
            </>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel)] text-[var(--ct-ink)] lg:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 rounded-full bg-[var(--ct-ink)]" />
              <span className="block h-0.5 w-4 rounded-full bg-[var(--ct-ink)]" />
              <span className="block h-0.5 w-4 rounded-full bg-[var(--ct-ink)]" />
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--ct-border)] bg-[var(--ct-bg)] lg:hidden">
          <div className="container-shell flex flex-col gap-2 py-3">
            {links.map((item) => (
              <NavLink
                key={`${item.label}-mobile`}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-[var(--ct-panel)] text-[var(--ct-ink)]' : 'text-[var(--ct-slate)] hover:bg-[var(--ct-panel)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {!user ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary">Log in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary">Join now</Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="btn-secondary mt-2">Logout</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
