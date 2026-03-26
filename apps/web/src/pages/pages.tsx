import { ArtistCard, EventCard, MerchCard, PlaylistCard, TrackCard } from '../components/cards/Cards';

const seedArtists = [
  { name: 'Luna Costa', town: 'Santurce' },
  { name: 'Mar Azul Colectivo', town: 'Mayagüez' },
  { name: 'Calle Solar', town: 'Ponce' }
];

export const LandingPage = () => (
  <section className="space-y-6">
    <div className="card bg-gradient-to-r from-indigo-900/40 to-fuchsia-900/30">
      <h1 className="text-4xl font-bold">El hogar digital de la música puertorriqueña.</h1>
      <p className="mt-3 text-zinc-300">Descubre sonidos de la isla, apoya artistas verificados y vive la escena local.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">{seedArtists.map((a) => <ArtistCard key={a.name} {...a} />)}</div>
  </section>
);

export const DiscoverPage = () => (
  <section className="space-y-6">
    <h2 className="text-2xl font-semibold">Descubrimiento</h2>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <TrackCard title="Brisa en Loíza" artist="Luna Costa" />
      <TrackCard title="Noche en Río Piedras" artist="Calle Solar" />
      <PlaylistCard title="Indie Boricua" description="Selección editorial" />
      <EventCard title="En Vivo en Santurce" venue="La Respuesta" />
    </div>
  </section>
);

export const AuthPage = () => <section className="card"><h2 className="text-2xl font-semibold">Login / Signup</h2><p className="text-zinc-400">JWT + refresh token flow scaffolded.</p></section>;
export const ArtistOnboardingPage = () => <section className="card"><h2 className="text-2xl font-semibold">Onboarding Artista</h2><p className="text-zinc-400">Sube perfil, town, bio y enlaces sociales.</p></section>;
export const VerificationPage = () => <section className="card"><h2 className="text-2xl font-semibold">Verificación de artista</h2><p className="text-zinc-400">ID + selfie + confirmación de derechos.</p></section>;
export const ArtistDashboardPage = () => <section className="grid gap-4 md:grid-cols-4"><div className="card">Ingresos estimados</div><div className="card">Top tracks</div><div className="card">Merch clicks</div><div className="card">Ticket clicks</div></section>;
export const UploadTrackPage = () => <section className="card"><h2 className="text-2xl">Upload Track</h2><p className="text-zinc-400">Presigned URL + procesamiento FFmpeg job.</p></section>;
export const TrackDetailPage = () => <section className="space-y-4"><div className="card"><h2 className="text-2xl font-semibold">Brisa en Loíza</h2><p className="text-zinc-400">Waveform, comentarios, likes, report infringement.</p></div></section>;
export const ArtistProfilePage = () => <section className="space-y-4"><div className="card"><h2 className="text-2xl">Luna Costa ✓</h2><p className="text-zinc-400">Top tracks, próximos shows, merch, lanzamientos.</p></div></section>;
export const PlaylistsPage = () => <section className="grid gap-4 md:grid-cols-3">{['Indie Boricua','Trap y Calle','Alt Caribe','Rock Isleño','Nuevas Voces','En Vivo Esta Semana'].map((p) => <PlaylistCard key={p} title={p} description="Curated" />)}</section>;
export const PlaylistDetailPage = () => <section className="card"><h2 className="text-2xl">Playlist Detail</h2><p className="text-zinc-400">Track list + curator + mood tags.</p></section>;
export const ReleasesPage = () => <section className="card"><h2 className="text-2xl">Upcoming Releases</h2><p className="text-zinc-400">Countdown + notify me scaffold.</p></section>;
export const ShowsPage = () => <section className="grid gap-4 md:grid-cols-2"><EventCard title="Noches en La Respuesta" venue="Santurce" /><EventCard title="Atardecer en Ponce" venue="Ponce" /></section>;
export const MerchPage = () => <section className="grid gap-4 md:grid-cols-3"><MerchCard title="Camiseta Brisa Tour" price="$30" /><MerchCard title="Vinilo Alt Caribe" price="$40" /></section>;
export const AdminDashboardPage = () => <section className="card"><h2 className="text-2xl">Admin Dashboard</h2><p className="text-zinc-400">Verification queue, takedowns, feature controls.</p></section>;
export const ModerationPage = () => <section className="card"><h2 className="text-2xl">Moderation / Reports</h2><p className="text-zinc-400">Infringement queue + strike issuance.</p></section>;
export const SettingsPage = () => <section className="card"><h2 className="text-2xl">Settings & Account</h2><p className="text-zinc-400">Profile, security, notifications placeholders.</p></section>;
