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
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-400">Hecho para ti</p>
      <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Buenas noches</h1>
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

const likedSongsSeed = [
  { title: 'Brisa en Loiza', artist: 'Luna Costa', album: 'Costa adentro', length: '3:29', accent: 'from-violet-500 to-sky-300' },
  { title: 'Alt Caribe', artist: 'Mar Azul Colectivo', album: 'Mar abierto', length: '2:56', accent: 'from-cyan-400 to-blue-600' },
  { title: 'Luces del expreso', artist: 'Calle Solar', album: 'Km 22', length: '3:21', accent: 'from-orange-400 to-amber-300' },
  { title: 'Sesion de humo', artist: 'Isla Norte', album: 'Sesion 04', length: '4:05', accent: 'from-fuchsia-500 to-violet-500' },
  { title: 'Radar boricua', artist: 'Editorial MusiPR', album: 'Curated picks', length: '2:48', accent: 'from-teal-300 to-cyan-500' },
  { title: 'Postales del Oeste', artist: 'Mar Azul Colectivo', album: 'Horizonte azul', length: '3:44', accent: 'from-yellow-300 to-orange-500' },
  { title: 'Cenizas del mar', artist: 'Luna Costa', album: 'Costa adentro', length: '4:11', accent: 'from-sky-400 to-indigo-500' },
  { title: 'Noches en Santurce', artist: 'Velvet Avenida', album: 'Luz de esquina', length: '3:08', accent: 'from-purple-500 to-pink-500' },
  { title: 'Cables y estrellas', artist: 'Club Terminal', album: 'Terminal oeste', length: '3:52', accent: 'from-zinc-500 to-zinc-700' },
  { title: 'Marea alta', artist: 'Costa Central', album: 'Bitacora', length: '5:02', accent: 'from-cyan-300 to-teal-500' },
  { title: 'Kilometro cero', artist: 'Calle Solar', album: 'Km 22', length: '2:39', accent: 'from-blue-500 to-indigo-600' },
  { title: 'VHS tropical', artist: 'Isla Norte', album: 'Archivo 94', length: '3:33', accent: 'from-amber-400 to-rose-500' }
];

const addedLabels = ['Today', 'Yesterday', '2 days ago', '5 days ago', '1 week ago', '2 weeks ago', '1 month ago'];

const likedSongs = Array.from({ length: 180 }, (_, index) => {
  const seed = likedSongsSeed[index % likedSongsSeed.length];
  const edition = Math.floor(index / likedSongsSeed.length);

  return {
    ...seed,
    id: `${seed.title}-${index + 1}`,
    title: edition === 0 ? seed.title : `${seed.title} ${edition + 1}`,
    added: addedLabels[index % addedLabels.length]
  };
});

export const LikedSongsPage = () => (
  <section className="space-y-6 pb-4">
    <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,34,66,0.92),rgba(15,15,15,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
      <div className="bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.26),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] px-6 py-7 md:px-8 md:py-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-700 text-slate-950 shadow-[0_16px_40px_rgba(59,130,246,0.24)]">
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
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Playlist</p>
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">Liked Songs</h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-300 md:text-base">
                A long-form library view for every track you have kept close. Dense, scrollable, and built to feel like
                a serious collection instead of a small utility panel.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-zinc-300">
              {likedSongs.length} songs
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100">
              Endless library view
            </span>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-3">
          <button className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-300 text-slate-950 shadow-[0_16px_30px_rgba(34,211,238,0.28)] transition hover:scale-[1.02] hover:bg-cyan-200">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor">
              <path d="M8 6.5v11l9-5.5-9-5.5Z" />
            </svg>
          </button>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-cyan-200 transition hover:bg-white/5">
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
      </div>
    </div>

    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#121212]">
      <div className="grid grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1.5fr)_minmax(0,1fr)_88px] items-center gap-4 border-b border-white/10 px-5 py-4 text-[11px] uppercase tracking-[0.26em] text-zinc-500 max-lg:hidden">
        <span>#</span>
        <span>Title</span>
        <span>Album</span>
        <span>Date added</span>
        <span className="text-right">Time</span>
      </div>

      <div className="max-h-[calc(100vh-310px)] overflow-y-auto">
        <div className="sticky top-0 z-10 grid grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1.5fr)_minmax(0,1fr)_88px] items-center gap-4 border-b border-white/10 bg-[#121212]/95 px-5 py-3 text-[11px] uppercase tracking-[0.26em] text-zinc-500 backdrop-blur lg:hidden">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span>Date</span>
          <span className="text-right">Time</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {likedSongs.map((track, index) => (
            <div
              key={track.id}
              className="grid grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1.5fr)_minmax(0,1fr)_88px] items-center gap-4 px-5 py-3 text-sm transition hover:bg-white/[0.035]"
            >
              <div className="flex items-center gap-3 text-zinc-500">
                <span className="w-5 text-right text-xs">{index + 1}</span>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <div className={`h-11 w-11 shrink-0 rounded-[10px] bg-gradient-to-br ${track.accent}`} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{track.title}</p>
                  <p className="truncate text-sm text-zinc-400">{track.artist}</p>
                </div>
              </div>

              <div className="min-w-0 max-lg:hidden">
                <p className="truncate text-zinc-300">{track.album}</p>
              </div>

              <div className="min-w-0 text-zinc-500">
                <p className="truncate">{track.added}</p>
              </div>

              <div className="text-right text-zinc-400">{track.length}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </section>
);

export const FavoritesPage = LikedSongsPage;

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
