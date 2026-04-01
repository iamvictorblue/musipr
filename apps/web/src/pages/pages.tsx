import { Link } from 'react-router-dom';
import { ArtistCard, EventCard, MerchCard, PlaylistCard, TrackCard } from '../components/cards/Cards';
export { ArtistPage as ArtistProfilePage } from './artist/ArtistPage';
export { ProfilePage } from './profile/ProfilePage';

const seedArtists = [
  { name: 'Luna Costa', town: 'Santurce' },
  { name: 'Mar Azul Colectivo', town: 'MayagÃ¼ez' },
  { name: 'Calle Solar', town: 'Ponce' }
];

export const LandingPage = () => (
  <section className="space-y-10">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-400">Hecho para ti</p>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Buenas noches</h1>
      </div>

      <Link
        to="/favorites"
        className="inline-flex items-center gap-3 self-start rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/15 hover:text-white"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20.5c-4.7-3.1-7.8-6-7.8-10.1A4.3 4.3 0 0 1 8.5 6c1.5 0 2.8.7 3.5 1.9A4.14 4.14 0 0 1 15.5 6a4.3 4.3 0 0 1 4.3 4.4c0 4.1-3.1 7-7.8 10.1Z" />
          </svg>
        </span>
        <span>
          <span className="block text-xs uppercase tracking-[0.22em] text-cyan-100/65">Shortcut</span>
          <span className="block text-base font-semibold text-white">Tus likes</span>
        </span>
      </Link>
    </div>

    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {[
        { title: 'Mix de madrugada', meta: 'Indie + electronica suave', accent: 'from-fuchsia-500 to-orange-400' },
        { title: 'Radar de Santurce', meta: 'Escena local en movimiento', accent: 'from-cyan-400 to-blue-500' },
        { title: 'Sesion Alt Caribe', meta: 'Seleccion curada', accent: 'from-emerald-400 to-teal-500' },
        { title: 'Nuevos estrenos', meta: 'Lo que acaba de caer', accent: 'from-violet-500 to-indigo-500' },
        { title: 'Shows de la semana', meta: 'En vivo por toda la isla', accent: 'from-amber-300 to-orange-500' },
        { title: 'Merch y vinilos', meta: 'Drops limitados', accent: 'from-zinc-500 to-zinc-800' }
      ].map((item) => (
        <div
          key={item.title}
          className="group flex items-center gap-4 overflow-hidden rounded-[20px] bg-[#1b1b1b] transition hover:bg-[#252525]"
        >
          <div className={`h-20 w-20 shrink-0 bg-gradient-to-br ${item.accent}`} />
          <div className="min-w-0 pr-4">
            <p className="truncate text-base font-semibold text-white">{item.title}</p>
            <p className="mt-1 truncate text-sm text-zinc-400">{item.meta}</p>
          </div>
        </div>
      ))}
    </section>

    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Quick picks</h2>
          <p className="mt-1 text-sm text-zinc-400">Tus accesos rapidos para volver a lo que ya te estaba gustando.</p>
        </div>
        <button className="text-sm font-medium text-zinc-400 hover:text-white">Ver todo</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TrackCard title="Brisa en Loiza" artist="Luna Costa" />
        <PlaylistCard title="Alt Caribe" description="Curado para descubrir ahora" />
        <TrackCard title="Luces del expreso" artist="Calle Solar" />
        <PlaylistCard title="Isla en loop" description="Favoritos para volver a poner" />
      </div>
    </section>

    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Artistas destacados</h2>
          <p className="mt-1 text-sm text-zinc-400">Voces y proyectos que estan empujando la escena local.</p>
        </div>
        <button className="text-sm font-medium text-zinc-400 hover:text-white">Ver todo</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {seedArtists.map((a) => (
          <ArtistCard key={a.name} {...a} />
        ))}
      </div>
    </section>

    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Nuevos drops</h2>
          <p className="mt-1 text-sm text-zinc-400">Estrenos, playlists y fechas para seguir explorando sin salir de portada.</p>
        </div>
        <button className="text-sm font-medium text-zinc-400 hover:text-white">Ver todo</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TrackCard title="Postales del Oeste" artist="Mar Azul Colectivo" />
        <TrackCard title="Cenizas del mar" artist="Luna Costa" />
        <PlaylistCard title="Descubrimiento boricua" description="Selecciones frescas para la semana" />
        <EventCard title="Sesion de estreno en vivo" venue="La Respuesta" />
      </div>
    </section>
  </section>
);

export const DiscoverPage = () => (
  <section className="space-y-6">
    <h2 className="text-2xl font-semibold">Descubrimiento</h2>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <TrackCard title="Brisa en Loiza" artist="Luna Costa" />
      <TrackCard title="Noche en Rio Piedras" artist="Calle Solar" />
      <PlaylistCard title="Indie Boricua" description="Seleccion editorial" />
      <EventCard title="En vivo en Santurce" venue="La Respuesta" />
    </div>
  </section>
);

const favoriteTracks = [
  { title: 'Brisa en Loiza', artist: 'Luna Costa', album: 'Costa adentro', added: '3 days ago', length: '3:29' },
  { title: 'Alt Caribe', artist: 'Mar Azul Colectivo', album: 'Mar abierto', added: '5 days ago', length: '2:56' },
  { title: 'Luces del expreso', artist: 'Calle Solar', album: 'Km 22', added: '1 week ago', length: '3:21' },
  { title: 'Sesion de humo', artist: 'Isla Norte', album: 'Sesion 04', added: '1 week ago', length: '4:05' },
  { title: 'Radar boricua', artist: 'Editorial MusiPR', album: 'Curated picks', added: '2 weeks ago', length: '2:48' }
];

export const FavoritesPage = () => (
  <section className="space-y-8">
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,45,76,0.92),rgba(17,17,17,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.32)] md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-700 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.2)]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20.5c-4.7-3.1-7.8-6-7.8-10.1A4.3 4.3 0 0 1 8.5 6c1.5 0 2.8.7 3.5 1.9A4.14 4.14 0 0 1 15.5 6a4.3 4.3 0 0 1 4.3 4.4c0 4.1-3.1 7-7.8 10.1Z" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Utility Collection</p>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Favoritos</h1>
            <p className="max-w-2xl text-sm text-zinc-300">
              Una vista limpia para tus likes, pensada como panel rapido desde el header sin cambiar el resto del app.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-zinc-300">
            {favoriteTracks.length} tracks
          </span>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100">
            Accent: blue
          </span>
        </div>
      </div>
    </div>

    <section className="overflow-hidden rounded-[26px] border border-white/10 bg-[#121212]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.22em] text-zinc-500">
        <span>Saved Tracks</span>
        <span>Local toggle only</span>
      </div>

      <div className="divide-y divide-white/6">
        {favoriteTracks.map((track, index) => (
          <div
            key={track.title}
            className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,0.9fr)_auto] items-center gap-4 px-5 py-4 transition hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-4">
              <span className="w-4 text-sm text-zinc-500">{index + 1}</span>
              <button
                aria-label={`Unlike ${track.title}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-400/10 text-cyan-200 transition hover:bg-cyan-400/15"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20.5c-4.7-3.1-7.8-6-7.8-10.1A4.3 4.3 0 0 1 8.5 6c1.5 0 2.8.7 3.5 1.9A4.14 4.14 0 0 1 15.5 6a4.3 4.3 0 0 1 4.3 4.4c0 4.1-3.1 7-7.8 10.1Z" />
                </svg>
              </button>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{track.title}</p>
              <p className="truncate text-sm text-zinc-400">{track.artist}</p>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-300">{track.album}</p>
              <p className="truncate text-sm text-zinc-500">{track.added}</p>
            </div>

            <div className="text-sm text-zinc-400">{track.length}</div>
          </div>
        ))}
      </div>
    </section>
  </section>
);

export const AuthPage = () => <section className="card"><h2 className="text-2xl font-semibold">Login / Signup</h2><p className="text-zinc-400">JWT + refresh token flow scaffolded.</p></section>;
export const ArtistOnboardingPage = () => <section className="card"><h2 className="text-2xl font-semibold">Onboarding Artista</h2><p className="text-zinc-400">Sube perfil, town, bio y enlaces sociales.</p></section>;
export const VerificationPage = () => <section className="card"><h2 className="text-2xl font-semibold">Verificacion de artista</h2><p className="text-zinc-400">ID + selfie + confirmacion de derechos.</p></section>;
export const ArtistDashboardPage = () => <section className="grid gap-4 md:grid-cols-4"><div className="card">Ingresos estimados</div><div className="card">Top tracks</div><div className="card">Merch clicks</div><div className="card">Ticket clicks</div></section>;
export const UploadTrackPage = () => <section className="card"><h2 className="text-2xl">Upload Track</h2><p className="text-zinc-400">Presigned URL + procesamiento FFmpeg job.</p></section>;
export const TrackDetailPage = () => <section className="space-y-4"><div className="card"><h2 className="text-2xl font-semibold">Brisa en Loiza</h2><p className="text-zinc-400">Waveform, comentarios, likes, report infringement.</p></div></section>;
export const PlaylistsPage = () => <section className="grid gap-4 md:grid-cols-3">{['Indie Boricua', 'Trap y Calle', 'Alt Caribe', 'Rock Isleno', 'Nuevas Voces', 'En Vivo Esta Semana'].map((p) => <PlaylistCard key={p} title={p} description="Curated" />)}</section>;
export const PlaylistDetailPage = () => <section className="card"><h2 className="text-2xl">Playlist Detail</h2><p className="text-zinc-400">Track list + curator + mood tags.</p></section>;
export const ReleasesPage = () => <section className="card"><h2 className="text-2xl">Upcoming Releases</h2><p className="text-zinc-400">Countdown + notify me scaffold.</p></section>;
export const ShowsPage = () => <section className="grid gap-4 md:grid-cols-2"><EventCard title="Noches en La Respuesta" venue="Santurce" /><EventCard title="Atardecer en Ponce" venue="Ponce" /></section>;
export const MerchPage = () => <section className="grid gap-4 md:grid-cols-3"><MerchCard title="Camiseta Brisa Tour" price="$30" /><MerchCard title="Vinilo Alt Caribe" price="$40" /></section>;
export const AdminDashboardPage = () => <section className="card"><h2 className="text-2xl">Admin Dashboard</h2><p className="text-zinc-400">Verification queue, takedowns, feature controls.</p></section>;
export const ModerationPage = () => <section className="card"><h2 className="text-2xl">Moderation / Reports</h2><p className="text-zinc-400">Infringement queue + strike issuance.</p></section>;
export const SettingsPage = () => <section className="card"><h2 className="text-2xl">Settings & Account</h2><p className="text-zinc-400">Profile, security, notifications placeholders.</p></section>;
