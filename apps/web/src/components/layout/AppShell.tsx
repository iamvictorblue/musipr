import { NavLink, Outlet } from 'react-router-dom';
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

export function AppShell() {
  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <div className="text-xl font-semibold">MúsiPR</div>
          <nav className="flex flex-wrap gap-4 text-sm text-zinc-300">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <GlobalPlayer />
    </div>
  );
}
