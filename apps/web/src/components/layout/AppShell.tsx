import { FormEvent, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { GlobalPlayer } from '../player/GlobalPlayer';

const links = [
  ['/', 'Inicio'],
  ['/discover', 'Descubrir'],
  ['/playlists', 'Playlists'],
  ['/releases', 'Estrenos'],
  ['/shows', 'Shows'],
  ['/merch', 'Merch'],
  ['/artist/dashboard', 'Artista'],
  ['/admin', 'Admin']
];

function roleLabel(role?: string | null) {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'VERIFIED_ARTIST':
      return 'Verified artist';
    case 'ARTIST':
      return 'Artist';
    default:
      return 'Listener';
  }
}

export function AppShell() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const nextQuery = location.pathname === '/discover' ? new URLSearchParams(location.search).get('q') ?? '' : '';
    setSearchQuery(nextQuery);
  }, [location.pathname, location.search]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    }

    void navigate({
      pathname: '/discover',
      search: params.toString() ? `?${params.toString()}` : ''
    });
  }

  return (
    <div className="min-h-screen pb-40">
      <div className="page-glow" aria-hidden="true" />
      <header className="site-header sticky top-0 z-40">
        <div className="utility-strip">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-4 py-2">
            <div className="utility-links">
              <span className="utility-kicker">For artists</span>
              <Link to="/artist/onboarding">Get verified</Link>
              <Link to="/artist/upload">Upload music</Link>
              <Link to="/merch">Sell merch</Link>
            </div>
            <div className="utility-links">
              <span>Puerto Rico scene coverage</span>
              <span>Shows, merch, playlists, editorials</span>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1240px] px-4 py-4">
          <div className="panel shell-panel shell-masthead px-5 py-5">
            <div className="masthead-grid">
              <Link to="/" className="shell-brand">
                <p className="eyebrow">Puerto Rico sound network</p>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <span className="masthead-wordmark text-white">MusiPR</span>
                  <span className="brand-note">editorial listening and artist support</span>
                </div>
              </Link>
              <form className="search-shell search-shell-inline" onSubmit={handleSearchSubmit}>
                <span className="text-xs uppercase tracking-[0.22em] text-[#9db0ba]">Search</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="artists, tracks, merch, scenes"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <button type="submit" className="button-ghost search-submit">
                  Search
                </button>
              </form>
              <div className="account-rail">
                {user ? (
                  <div className="account-copy">
                    <p className="text-sm font-medium text-white">{user.email}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#9db0ba]">{roleLabel(user.role)}</p>
                  </div>
                ) : (
                  <div className="account-copy">
                    <p className="text-sm font-medium text-white">Ready to log in?</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#9db0ba]">Demo accounts are seeded</p>
                  </div>
                )}
                {user ? (
                  <button type="button" onClick={() => void logout()} className="button-secondary">
                    Log out
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/artist/onboarding" className="button-secondary">
                      For artists
                    </Link>
                    <Link to="/login" className="button-primary">
                      Log in
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="subnav-row">
              <nav className="section-tabs">
                {links.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => clsx('nav-pill whitespace-nowrap', isActive && 'nav-pill-active')}
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="nav-kicker">
                A catalog shaped like a scene report: music, merch, live dates, and artist worlds in one place.
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] px-4 py-8">
        <Outlet />
      </main>
      <GlobalPlayer />
    </div>
  );
}
