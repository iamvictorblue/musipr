import { Link, NavLink, Outlet } from 'react-router-dom';
import { GlobalPlayer } from '../player/GlobalPlayer';

const topLinks = [
  ['/', 'For you'],
  ['/discover', 'Following'],
  ['/playlists', 'Playlists']
];

const libraryItems = [
  'Tus likes',
  'Radar boricua',
  'Sets de estudio',
  'Noches en Santurce',
  'Alt Caribe',
  'Nuevas voces'
];

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.5c-4.7-3.1-7.8-6-7.8-10.1A4.3 4.3 0 0 1 8.5 6c1.5 0 2.8.7 3.5 1.9A4.14 4.14 0 0 1 15.5 6a4.3 4.3 0 0 1 4.3 4.4c0 4.1-3.1 7-7.8 10.1Z" />
    </svg>
  );
}

function FavoritesNavLink() {
  return (
    <NavLink
      to="/favorites"
      aria-label="Open favorites"
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'border-cyan-300/30 bg-cyan-400/12 text-cyan-200 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]'
            : 'border-white/10 bg-black/20 text-zinc-300 hover:bg-black/35 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <span className="inline-flex items-center gap-2">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
              isActive ? 'bg-cyan-300/15 text-cyan-200' : 'bg-white/5 text-zinc-300'
            }`}
          >
            <HeartIcon filled={isActive} />
          </span>
          <span className="whitespace-nowrap">Tus likes</span>
        </span>
      )}
    </NavLink>
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#070707] pb-28 text-zinc-100">
      <div className="mx-auto max-w-[1600px] px-3 py-3">
        <header className="mb-4 rounded-[28px] border border-white/10 bg-[#121212]/94 px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur md:px-7">
          <div className="flex items-center justify-between gap-4">
            <nav className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                {topLinks.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `whitespace-nowrap text-sm transition ${
                        isActive ? 'text-white' : 'text-zinc-300 hover:text-white'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
                <FavoritesNavLink />
              </div>
            </nav>

            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <Link
                to="/"
                aria-label="Home"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white transition hover:bg-white/5"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5.5 9.5V20h13V9.5" />
                </svg>
              </Link>

              <div className="flex w-[260px] items-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-400">
                What do you want to play?
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/profile"
                aria-label="Open profile"
                className="inline-flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-black/30 p-1.5 pr-4 text-sm font-medium text-white transition hover:bg-black/45"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-500 text-xs font-semibold text-black">
                  LC
                </span>
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 md:hidden">
            <div className="flex items-center gap-2">
              <Link
                to="/"
                aria-label="Home"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white transition hover:bg-white/5"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5.5 9.5V20h13V9.5" />
                </svg>
              </Link>
              <div className="flex items-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-400">
                What do you want to play?
              </div>
            </div>
            <nav className="flex gap-4 overflow-x-auto text-sm text-zinc-300">
              {topLinks.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `whitespace-nowrap transition ${
                      isActive ? 'text-white' : 'text-zinc-300 hover:text-white'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <FavoritesNavLink />
            </nav>
          </div>
        </header>

        <div className="grid min-h-screen gap-3 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="hidden lg:block">
            <section className="flex min-h-0 flex-1 flex-col rounded-[26px] border border-white/10 bg-[#121212] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold tracking-tight text-white">MusiPR</div>
                  <h2 className="mt-4 text-sm font-semibold text-white">Tu libreria</h2>
                </div>
                <div className="flex gap-2 text-zinc-400">
                  <span className="rounded-full bg-white/5 px-2 py-1 text-xs">+</span>
                  <span className="rounded-full bg-white/5 px-2 py-1 text-xs">-</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {['Playlists', 'Artistas', 'Albums'].map((item) => (
                  <span key={item} className="rounded-full bg-white/5 px-3 py-2 text-xs text-zinc-300">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 space-y-2 overflow-y-auto pr-1">
                {libraryItems.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-white/5">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${
                        [
                          'from-violet-500 to-sky-300',
                          'from-emerald-400 to-cyan-400',
                          'from-orange-400 to-rose-500',
                          'from-fuchsia-500 to-indigo-500',
                          'from-yellow-300 to-orange-500',
                          'from-teal-300 to-blue-500'
                        ][index]
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{item}</p>
                      <p className="truncate text-xs text-zinc-500">Playlist · seleccion editorial</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <div className="min-w-0">
            <section className="rounded-[30px] border border-white/10 bg-[#121212]">
              <main className="min-w-0 px-4 pb-8 pt-5 md:px-7">
                <Outlet />
              </main>
            </section>
          </div>

          <aside className="hidden xl:block">
            <section className="rounded-[26px] border border-white/10 bg-[#121212] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">En reproduccion</h2>
                <button className="text-zinc-500">x</button>
              </div>

              <div className="mt-4 rounded-[24px] bg-[#181818] p-3">
                <div className="aspect-[4/5] rounded-[20px] bg-gradient-to-br from-emerald-300/70 via-cyan-500/50 to-slate-800" />
                <p className="mt-4 text-2xl font-semibold text-white">Chaise Lounge</p>
                <p className="mt-1 text-sm text-zinc-400">Wet Leg</p>
              </div>

              <div className="mt-4 rounded-[24px] bg-[#181818] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Artista verificado</p>
                <div className="mt-3 aspect-[5/4] rounded-[20px] bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900" />
                <p className="mt-4 text-lg font-semibold text-white">Luna Costa</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Perfil destacado con lanzamientos recientes, shows y movimiento editorial.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <GlobalPlayer />
    </div>
  );
}
