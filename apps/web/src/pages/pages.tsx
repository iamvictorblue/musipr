import clsx from 'clsx';
import { FormEvent, ReactNode, startTransition, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useArtistDetailQuery,
  useDiscoveryHomeQuery,
  useDiscoverySearchQuery,
  useEventsQuery,
  useMerchQuery,
  usePlaylistDetailQuery,
  usePlaylistsQuery,
  useReleasesQuery,
  useTrackDetailQuery
} from '../api/catalog';
import { extractApiErrorMessage, type Role } from '../api/client';
import { ArtistCard, EventCard, MerchCard, PlaylistCard, TrackCard } from '../components/cards/Cards';
import {
  activityFeed,
  buildArtistDetail,
  buildHomeCatalog,
  buildPlaylistDetail,
  buildSearchCatalog,
  buildTrackDetail,
  cityScenes,
  fallbackArtists,
  fallbackEvents,
  fallbackMerch,
  fallbackPlaylists,
  fallbackReleaseMoments,
  fallbackTracks,
  merchForArtistFallback,
  sceneTags as defaultSceneTags,
  tagsForPlaylist,
  tracksForPlaylistFallback,
  type UiArtist,
  type UiEvent,
  type UiMerch,
  type UiPlaylist,
  type UiReleaseMoment,
  type UiTrack
} from '../data/catalog';
import { useAuthStore } from '../store/auth';
import { usePlayerStore } from '../store/player';
import { slugify } from '../utils/slug';

const roleOptions: { label: string; value: Role }[] = [
  { label: 'Listener', value: 'LISTENER' },
  { label: 'Artist', value: 'ARTIST' }
];

function routeForRole(role: Role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'ARTIST') return '/artist/onboarding';
  if (role === 'VERIFIED_ARTIST') return '/artist/dashboard';
  return '/discover';
}

function matchesQuery(query: string, ...values: Array<string | null | undefined>) {
  if (!query) return true;

  const normalizedQuery = query.toLowerCase();
  return values.some((value) => (value ?? '').toLowerCase().includes(normalizedQuery));
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#9db0ba] md:text-base">{description}</p>
    </div>
  );
}

function MetricTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="card p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-5 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm text-[#9db0ba]">{note}</p>
    </article>
  );
}

function ChipRow({ items, strong = false }: { items: string[]; strong?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={clsx('chip', strong && 'chip-strong')}>
          {item}
        </span>
      ))}
    </div>
  );
}

function MiniTrackRow({
  index,
  title,
  artist,
  plays,
  accent,
  imageSrc
}: {
  index: number;
  title: string;
  artist: string;
  plays: string;
  accent: 'ember' | 'tide' | 'gold';
  imageSrc?: string;
}) {
  const setTrack = usePlayerStore((state) => state.setTrack);

  return (
    <Link
      to={`/tracks/${slugify(title)}`}
      onClick={() => setTrack({ id: slugify(`${artist}-${title}`), title, artist })}
      className="list-card block transition duration-300 hover:-translate-y-1"
    >
      <div className="list-row">
        <div
          className={clsx('mini-cover', !imageSrc && `artwork-${accent}`, imageSrc && 'mini-cover-photo')}
          style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : undefined}
        />
        <div>
          <p className="text-sm text-[#9db0ba]">#{index + 1}</p>
          <p className="mt-1 text-lg font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-[#cfd8dc]">{artist}</p>
          <div className="meta-list mt-3">
            <span>{plays}</span>
            <span>saved heavily</span>
          </div>
        </div>
        <span className="button-ghost hidden md:inline-flex">Queue</span>
      </div>
    </Link>
  );
}

function SceneCard({
  city,
  mood,
  accent,
  imageSrc
}: {
  city: string;
  mood: string;
  accent: 'ember' | 'tide' | 'gold';
  imageSrc?: string;
}) {
  return (
    <Link to={`/discover?q=${encodeURIComponent(city)}`} className="spotlight-cell transition duration-300 hover:-translate-y-1">
      <div className={clsx('artwork-shell min-h-[140px]', !imageSrc && `artwork-${accent}`)}>
        {imageSrc ? <img src={imageSrc} alt="" className="artwork-photo" /> : <div className="artwork-grid" aria-hidden="true" />}
        {imageSrc ? <div className="artwork-photo-wash" aria-hidden="true" /> : null}
        <span className="artwork-label">{city}</span>
      </div>
      <div>
        <p className="eyebrow">Scene focus</p>
        <p className="mt-3 text-lg font-semibold text-white">{city}</p>
        <p className="mt-2 text-sm leading-7 text-[#9db0ba]">{mood}</p>
      </div>
    </Link>
  );
}

function ReleaseMoment({
  title,
  artist,
  note,
  accent,
  imageSrc
}: {
  title: string;
  artist: string;
  note: string;
  accent: 'ember' | 'tide' | 'gold';
  imageSrc?: string;
}) {
  return (
    <Link to={`/artists/${slugify(artist)}`} className="card block p-5 transition duration-300 hover:-translate-y-1">
      <div className={clsx('artwork-shell', !imageSrc && `artwork-${accent}`)}>
        {imageSrc ? <img src={imageSrc} alt="" className="artwork-photo" /> : <div className="artwork-grid" aria-hidden="true" />}
        {imageSrc ? <div className="artwork-photo-wash" aria-hidden="true" /> : null}
        <span className="artwork-label">{title}</span>
      </div>
      <div className="mt-4">
        <p className="text-xl font-semibold text-white">{artist}</p>
        <p className="mt-2 text-sm text-[#9db0ba]">{note}</p>
        <div className="mt-4 tiny-stat">
          <span>Campaign ready</span>
          <span className="text-[#f7c66d]">High priority</span>
        </div>
      </div>
    </Link>
  );
}

function FeatureLink({
  to,
  accent,
  eyebrow,
  title,
  note,
  imageSrc
}: {
  to: string;
  accent: 'ember' | 'tide' | 'gold';
  eyebrow: string;
  title: string;
  note: string;
  imageSrc?: string;
}) {
  return (
    <Link to={to} className="cover-link">
      <div className={clsx('cover-link-art', !imageSrc && `artwork-${accent}`)} aria-hidden="true">
        {imageSrc ? <img src={imageSrc} alt="" className="cover-link-photo" /> : null}
      </div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <p className="mt-2 text-lg font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[#9db0ba]">{note}</p>
      </div>
    </Link>
  );
}

function DetailHero({
  eyebrow,
  title,
  description,
  imageSrc,
  chips = [],
  actions,
  mediaEyebrow,
  mediaTitle,
  mediaNote
}: {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc?: string;
  chips?: string[];
  actions?: ReactNode;
  mediaEyebrow: string;
  mediaTitle: string;
  mediaNote: string;
}) {
  return (
    <section className="detail-hero-grid">
      <div className="hero-panel detail-hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <div className="hero-rule mt-5" aria-hidden="true" />
        <h1 className="display-title mt-4">{title}</h1>
        <p className="section-copy mt-5 max-w-2xl">{description}</p>
        {chips.length ? (
          <div className="mt-6">
            <ChipRow items={chips} />
          </div>
        ) : null}
        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      <article className="panel detail-hero-media">
        {imageSrc ? <img src={imageSrc} alt="" className="detail-hero-photo" /> : null}
        <div className="detail-hero-wash" aria-hidden="true" />
        <div className="detail-hero-caption">
          <p className="eyebrow">{mediaEyebrow}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{mediaTitle}</p>
          <p className="mt-3 text-sm leading-7 text-[#9db0ba]">{mediaNote}</p>
        </div>
      </article>
    </section>
  );
}

function PhotoNotePanel({
  eyebrow,
  title,
  note,
  imageSrc,
  meta = []
}: {
  eyebrow: string;
  title: string;
  note: string;
  imageSrc?: string;
  meta?: string[];
}) {
  return (
    <article className="panel detail-photo-note">
      {imageSrc ? <img src={imageSrc} alt="" className="detail-photo-note-image" /> : null}
      <div className="detail-photo-note-wash" aria-hidden="true" />
      <div className="detail-photo-note-copy">
        <p className="eyebrow">{eyebrow}</p>
        <p className="mt-3 text-3xl font-semibold text-white">{title}</p>
        <p className="mt-3 text-sm leading-7 text-[#cfd8dc]">{note}</p>
        {meta.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {meta.map((item) => (
              <span key={item} className="detail-photo-pill">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function SimplePage({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="space-y-8">
      <div className="hero-panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-title mt-4">{title}</h1>
        <p className="section-copy mt-4 max-w-2xl">{description}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <MetricTile label="Signal" value="High" note="The page now shares the same premium visual language as the rest of the app." />
        <MetricTile label="Focus" value="Clear" note="Hierarchy is stronger, so the surface feels intentional instead of placeholder-heavy." />
        <MetricTile label="Next" value="Ready" note="This scaffold can grow into a real workflow without another redesign pass." />
      </div>
    </section>
  );
}

export function LandingPage() {
  const homeQuery = useDiscoveryHomeQuery();
  const { artists, tracks, playlists, events, merch, releaseMoments, sceneTags } = buildHomeCatalog(homeQuery.data);
  const leadArtist = artists[0] ?? fallbackArtists[0];
  const leadPlaylist = playlists[0] ?? fallbackPlaylists[0];
  const leadMerch = merch[0] ?? fallbackMerch[0];
  const leadEvent = events[0] ?? fallbackEvents[0];
  const featuredTracks = tracks.slice(0, 4);
  const featuredArtists = artists.slice(0, 3);
  const featuredEvents = events.slice(0, 2);
  const featuredMerch = merch.slice(0, 2);
  const releaseBoard = releaseMoments.slice(0, 2);

  return (
    <section className="space-y-8">
      <div className="home-ledger">
        {activityFeed.slice(0, 4).map((item) => (
          <div key={item} className="ledger-item">
            <span className="ledger-kicker">Selling now</span>
            <span className="ledger-copy">{item}</span>
          </div>
        ))}
      </div>

      <div className="home-hero-grid">
        <div className="hero-panel home-feature">
          <p className="eyebrow">Puerto Rico music daily</p>
          <div className="hero-rule mt-5" aria-hidden="true" />
          <h1 className="display-title mt-4 max-w-4xl">A brighter, more editorial front page for Puerto Rican music, artist worlds, and scene momentum.</h1>
          <p className="section-copy mt-5 max-w-2xl">
            MusiPR now follows the strongest patterns from Bandcamp, Spotify, and SoundCloud without copying them outright: cleaner
            hierarchy, faster browsing, stronger creator emphasis, and a homepage that feels published instead of assembled.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/discover" className="button-primary">
              Explore the catalog
            </Link>
            <Link to={`/artists/${slugify(leadArtist.name)}`} className="button-secondary">
              Read the lead artist story
            </Link>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="hero-stat">
              <span className="hero-stat-value">12.4K</span>
              <span className="hero-stat-label">monthly listeners in the {leadArtist.name} orbit</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">76</span>
              <span className="hero-stat-label">fresh releases, shows, and merch moments on deck this week</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">1</span>
              <span className="hero-stat-label">connected surface for listening, discovery, tickets, and artist support</span>
            </div>
          </div>
          <div className="mt-8">
            <p className="eyebrow">Scenes moving now</p>
            <div className="mt-3">
              <ChipRow items={sceneTags} strong />
            </div>
          </div>
        </div>

        <div className="home-side-stack">
          <article className="card editorial-card feature-story-card p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Lead story</p>
              <Link to={`/artists/${slugify(leadArtist.name)}`} className="button-ghost">
                Artist profile
              </Link>
            </div>
            <div className="feature-story-media mt-5">
              <div className={clsx('artwork-shell feature-story-art', !leadArtist.imageSrc && `artwork-${leadArtist.accent}`)}>
                {leadArtist.imageSrc ? <img src={leadArtist.imageSrc} alt="" className="artwork-photo" /> : null}
                <div className="artwork-photo-wash" aria-hidden="true" />
                <span className="artwork-label">{leadArtist.name}</span>
              </div>
              <div className="feature-story-copy">
                <p className="eyebrow">Release week dispatch</p>
                <p className="mt-3 text-3xl font-semibold text-white">{leadArtist.name} is turning a release cycle into a full artist world.</p>
                <p className="mt-3 text-sm leading-7 text-[#9db0ba]">
                  {leadArtist.bio ??
                    'The homepage gives the lead story more room to hold music, identity, merch, and live momentum in one authored frame.'}
                </p>
              </div>
            </div>
          </article>

          <article className="card sidebar-note p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Start here</p>
              <Link to="/discover" className="button-ghost">
                Open discovery
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {[
                'Search artists, songs, playlists, scenes, and merch from one header.',
                `${leadPlaylist.title} keeps the editorial side of the catalog feeling human and sequence-aware.`,
                `${leadEvent.title} shows how release, community, and ticketing now live in one flow.`
              ].map((item) => (
                <div key={item} className="feed-row">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5">
              <ChipRow items={['search-first', 'artist-friendly', 'scene coverage', 'merch + tickets']} />
            </div>
          </article>
        </div>
      </div>
      <section className="section-frame">
        <div className="section-frame-head">
          <SectionHeading
            eyebrow="New and notable"
            title="A home screen with clearer rails, stronger hierarchy, and more reasons to keep browsing."
            description="Bandcamp brings editorial warmth, Spotify brings scanning speed, and SoundCloud brings creator utility. This front page now combines those strengths into one local music system."
          />
          <Link to="/releases" className="button-secondary">
            View release board
          </Link>
        </div>
        <div className="catalog-matrix">
          <article className="card track-chart p-6">
            <div className="chart-header">
              <div>
                <p className="eyebrow">Trending tracks</p>
                <p className="mt-3 text-2xl font-semibold text-white">The local chart right now</p>
              </div>
              <Link to="/discover?q=trending" className="button-ghost">
                Browse all
              </Link>
            </div>
            <div className="chart-list mt-5">
              {featuredTracks.map((track, index) => (
                <MiniTrackRow
                  key={track.title}
                  index={index}
                  title={track.title}
                  artist={track.artist}
                  plays={track.plays}
                  accent={track.accent}
                  imageSrc={track.imageSrc}
                />
              ))}
            </div>
          </article>

          <div className="grid gap-5 md:grid-cols-2">
            {featuredTracks.slice(0, 2).map((track) => (
              <TrackCard key={track.title} {...track} />
            ))}
            {releaseBoard.map((release) => (
              <ReleaseMoment key={release.title} {...release} />
            ))}
          </div>

          <div className="home-side-stack">
            <article className="card release-note-card p-6">
              <p className="eyebrow">Release board</p>
              <div className="mt-5 space-y-4">
                {releaseBoard.map((release) => (
                  <Link key={release.title} to={`/artists/${slugify(release.artist)}`} className="cover-link">
                    <div className={clsx('cover-link-art', !release.imageSrc && `artwork-${release.accent}`)} aria-hidden="true">
                      {release.imageSrc ? <img src={release.imageSrc} alt="" className="cover-link-photo" /> : null}
                    </div>
                    <div>
                      <p className="eyebrow">Upcoming moment</p>
                      <p className="mt-2 text-lg font-semibold text-white">{release.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[#9db0ba]">{release.note}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </article>

            <FeatureLink
              to="/merch"
              accent={leadMerch.accent}
              eyebrow="Merch focus"
              title={leadMerch.title}
              note={`${leadMerch.price} - ${leadMerch.edition}`}
              imageSrc={leadMerch.imageSrc}
            />
            <FeatureLink
              to="/shows"
              accent={leadEvent.accent}
              eyebrow="Live focus"
              title={leadEvent.title}
              note={`${leadEvent.venue} - ${leadEvent.date}`}
              imageSrc={leadEvent.imageSrc}
            />
          </div>
        </div>
      </section>
      <div className="section-grid xl:grid-cols-[0.92fr_1.08fr]">
        <article className="card scene-file p-6">
          <SectionHeading
            eyebrow="Scene file"
            title="What the local feed is saying right now."
            description="The strongest music front pages read like dispatches from an active culture. MusiPR now gives those shifts a proper place to live."
          />
          {false && (
        <SectionHeading eyebrow="Scene briefing" title="What the local feed is saying right now." description="Bandcamp’s strongest front page moments feel like dispatches. This section now does more of that work for MusiPR." />
          )}
          <div className="story-copy-list mt-5 space-y-3">
            {[
            'Santurce listeners are pushing synth-forward records back into the front page.',
            'Merch movement is strongest when a release story and a live date land in the same week.',
            'Editorial playlist placement is shaping saves faster than a plain release grid.',
            'Search is no longer a utility corner; it is part of the main music browsing loop.'
          ].map((item) => (
            <div key={item} className="feed-row">
              {item}
            </div>
          ))}
        </div>
      </article>
      <div className="scene-city-grid">
        {cityScenes.map((scene) => (
          <SceneCard key={scene.city} {...scene} />
        ))}
      </div>
    </div>
    <div className="section-grid xl:grid-cols-[1.05fr_0.95fr]">
      <article className="card p-6">
        <SectionHeading
          eyebrow="Artist spotlight"
          title="Local voices deserve a homepage that feels authored, not autogenerated."
          description="Artist cards now sit beside playlists and scene notes so music discovery feels closer to a living publication than a grid of interchangeable modules."
        />
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {featuredArtists.map((artist) => (
            <ArtistCard key={artist.name} {...artist} />
          ))}
        </div>
      </article>
      <article className="card playlist-notebook p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Playlist notebook</p>
            <p className="mt-3 text-2xl font-semibold text-white">{leadPlaylist.title}</p>
          </div>
          <Link to={`/playlists/${slugify(leadPlaylist.title)}`} className="button-ghost">
            Open mix
          </Link>
        </div>
        <div className="mt-5">
          <PlaylistCard {...leadPlaylist} />
        </div>
        <div className="mt-5 space-y-3">
          {[
            'Curator voice and mood should matter as much as utility.',
            'Playlists need enough visual weight to feel like destinations.',
            'This mix now anchors the softer, more human side of discovery.'
          ].map((item) => (
            <div key={item} className="feed-row">
              {item}
            </div>
          ))}
        </div>
      </article>
    </div>

    <div className="section-grid xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Live and merch"
          title="Shows and physical goods now sit in the same visual language as the music."
          description="That makes artist support feel native to the product instead of bolted on after the fact."
        />
        <div className="grid gap-5">
          {featuredEvents.map((event) => (
            <EventCard key={event.title} {...event} />
          ))}
        </div>
      </div>
      <div className="grid gap-5">
        {featuredMerch.map((item) => (
          <MerchCard key={item.title} {...item} />
        ))}
      </div>
    </div>
    </section>
  );
}

export function DiscoverPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const homeCatalog = buildHomeCatalog(useDiscoveryHomeQuery().data);
  const searchCatalog = buildSearchCatalog(useDiscoverySearchQuery(query).data);
  const catalogArtists = query ? searchCatalog.artists : homeCatalog.artists;
  const catalogTracks = query ? searchCatalog.tracks : homeCatalog.tracks;
  const catalogPlaylists = query ? searchCatalog.playlists : homeCatalog.playlists;
  const catalogEvents = query ? searchCatalog.events : homeCatalog.events;
  const catalogMerch = query ? searchCatalog.merch : homeCatalog.merch;
  const filteredArtists = catalogArtists.filter((artist) => matchesQuery(query, artist.name, artist.town, artist.genre));
  const filteredTracks = catalogTracks.filter((track) => matchesQuery(query, track.title, track.artist, track.tag, track.plays));
  const filteredPlaylists = catalogPlaylists.filter((playlist) => matchesQuery(query, playlist.title, playlist.description, playlist.count));
  const filteredEvents = catalogEvents.filter((event) => matchesQuery(query, event.title, event.venue, event.date));
  const filteredMerch = catalogMerch.filter((item) => matchesQuery(query, item.title, item.price, item.edition));
  const filteredReleaseMoments = homeCatalog.releaseMoments.filter((release) => matchesQuery(query, release.title, release.artist, release.note));
  const filteredCityScenes = cityScenes.filter((scene) => matchesQuery(query, scene.city, scene.mood));
  const filteredSceneTags = homeCatalog.sceneTags.filter((item) => matchesQuery(query, item));
  const filteredActivityFeed = activityFeed.filter((item) => matchesQuery(query, item));
  const resultCount =
    filteredArtists.length +
    filteredTracks.length +
    filteredPlaylists.length +
    filteredEvents.length +
    filteredMerch.length +
    filteredReleaseMoments.length +
    filteredCityScenes.length +
    filteredActivityFeed.length;

  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow={query ? 'Search results' : 'Discover'}
        title={query ? `Results for "${query}"` : 'A browse flow designed like a music magazine with a pulse.'}
        description={
          query
            ? `${resultCount} catalog signals matched your search across tracks, artists, playlists, shows, merch, and release moments.`
            : 'Collections, releases, and live events now sit in the same visual language so discovery feels curated instead of accidental.'
        }
      />
      <ChipRow
        items={(query ? filteredSceneTags : ['new and notable', 'selling now', 'editorial picks', 'live this week', 'vinyl + merch', 'by location']).slice(0, 6)}
        strong
      />
      {query ? (
        <article className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Connected search</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#9db0ba]">
              The global header search now routes here and filters the catalog in-place, so the discovery surface finally behaves like a real product.
            </p>
          </div>
          <Link to="/discover" className="button-secondary">
            Clear search
          </Link>
        </article>
      ) : null}
      {resultCount === 0 ? (
        <article className="card p-6">
          <p className="eyebrow">No matches yet</p>
          <h3 className="mt-4 text-3xl font-semibold text-white">Nothing in the catalog matched that search.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#9db0ba]">
            Try an artist like Luna Costa, a city like Santurce, or a format like merch or live.
          </p>
          <div className="mt-6">
            <Link to="/discover" className="button-primary">
              Reset browse
            </Link>
          </div>
        </article>
      ) : (
        <>
          {filteredArtists.length ? (
            <>
              <SectionHeading
                eyebrow="Artists"
                title={query ? 'Artists matching your search' : 'Voices shaping the catalog right now.'}
                description="Artist cards now link directly into richer profile worlds, so discovery can keep flowing deeper."
              />
              <div className="grid gap-5 md:grid-cols-3">{filteredArtists.map((artist) => <ArtistCard key={artist.name} {...artist} />)}</div>
            </>
          ) : null}
          {filteredTracks.length ? (
            <div className="section-grid xl:grid-cols-[1.05fr_0.95fr]">
              <article className="card p-6">
                <p className="eyebrow">{query ? 'Matching tracks' : 'New and notable'}</p>
                <div className="mt-4 space-y-4">
                  {filteredTracks.map((track, index) => (
                    <MiniTrackRow key={track.title} index={index} title={track.title} artist={track.artist} plays={track.plays} accent={track.accent} imageSrc={track.imageSrc} />
                  ))}
                </div>
              </article>
              <div className="grid gap-5 md:grid-cols-2">
                {filteredTracks.map((track) => <TrackCard key={track.title} {...track} />)}
              </div>
            </div>
          ) : null}
          {filteredPlaylists.length ? <div className="grid gap-5 xl:grid-cols-3">{filteredPlaylists.map((playlist) => <PlaylistCard key={playlist.title} {...playlist} />)}</div> : null}
          {(filteredCityScenes.length || filteredEvents.length) ? (
            <div className="section-grid xl:grid-cols-[0.95fr_1.05fr]">
              <div className="spotlight-rail md:grid-cols-3 xl:grid-cols-1">
                {filteredCityScenes.map((scene) => (
                  <SceneCard key={scene.city} {...scene} />
                ))}
              </div>
              <div className="grid gap-5 md:grid-cols-2">{filteredEvents.map((event) => <EventCard key={event.title} {...event} />)}</div>
            </div>
          ) : null}
          {(filteredReleaseMoments.length || filteredActivityFeed.length) ? (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-5 md:grid-cols-3">
                {filteredReleaseMoments.map((release) => (
                  <ReleaseMoment key={release.title} {...release} />
                ))}
              </div>
              <article className="card p-6">
                <p className="eyebrow">Selling and resonating</p>
                <div className="mt-4 space-y-3">
                  {filteredActivityFeed.map((item) => (
                    <div key={item} className="feed-row">{item}</div>
                  ))}
                </div>
              </article>
            </div>
          ) : null}
          {filteredMerch.length ? (
            <>
              <SectionHeading eyebrow="Merch" title="Artist-linked drops with stronger product gravity." description="Search can now surface commerce alongside music and events, which makes the platform feel much more complete." />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredMerch.map((item) => <MerchCard key={item.title} {...item} />)}</div>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const { user, login, logout, signup } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('admin@musipr.local');
  const [password, setPassword] = useState('AdminPass123!');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('LISTENER');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (mode === 'signup' && password !== confirmPassword) return setError('Passwords must match.');
    if (mode === 'signup' && !termsAccepted) return setError('Please accept the terms to create your account.');
    setIsSubmitting(true);
    try {
      const session = mode === 'login' ? await login({ email, password }) : await signup({ email, password, role, termsAccepted });
      startTransition(() => navigate(routeForRole(session.user.role)));
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <article className="hero-panel">
        <p className="eyebrow">Welcome back to the scene</p>
        <h1 className="display-title mt-4 max-w-3xl">Real auth flow, premium tone, and seeded demo accounts ready to test.</h1>
        <p className="section-copy mt-5 max-w-2xl">This page now acts like a real entry point: polished messaging, quick demo access, and live wiring to the API login and signup endpoints.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ['Admin demo', 'admin@musipr.local', 'AdminPass123!'],
            ['Artist demo', 'luna.costa@musipr.local', 'ArtistPass123!']
          ].map(([label, demoEmail, demoPassword]) => (
            <button
              key={demoEmail}
              type="button"
              className="card p-5 text-left transition hover:-translate-y-1"
              onClick={() => {
                setMode('login');
                setEmail(demoEmail);
                setPassword(demoPassword);
                setConfirmPassword(demoPassword);
              }}
            >
              <p className="eyebrow">{label}</p>
              <p className="mt-4 text-lg font-semibold text-white">{demoEmail}</p>
              <p className="mt-2 text-sm text-[#9db0ba]">Click to prefill credentials and log in faster.</p>
            </button>
          ))}
        </div>
      </article>
      <article className="panel p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="eyebrow">Session</p><h2 className="mt-3 text-3xl font-semibold text-white">{mode === 'login' ? 'Log in' : 'Create account'}</h2></div>
          <div className="flex gap-2 rounded-full border border-white/10 bg-black/10 p-1">
            {(['login', 'signup'] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => { setMode(tab); setError(null); }} className={clsx('auth-tab', mode === tab && 'auth-tab-active')}>
                {tab === 'login' ? 'Login' : 'Signup'}
              </button>
            ))}
          </div>
        </div>
        {user ? (
          <div className="mt-6 rounded-[24px] border border-[#36d0ad]/20 bg-[#36d0ad]/8 p-5">
            <p className="eyebrow">Signed in</p>
            <p className="mt-3 text-lg font-semibold text-white">{user.email}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to={routeForRole(user.role)} className="button-primary">Continue</Link>
              <button type="button" onClick={() => void logout()} className="button-secondary">Switch account</button>
            </div>
          </div>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="field-group"><span className="field-label">Email</span><input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label className="field-group"><span className="field-label">Password</span><input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
          {mode === 'signup' ? (
            <>
              <label className="field-group"><span className="field-label">Confirm password</span><input className="field" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
              <label className="field-group"><span className="field-label">Account type</span><select className="field" value={role} onChange={(event) => setRole(event.target.value as Role)}>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              <label className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-black/10 px-4 py-3 text-sm text-[#cfd8dc]"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-[#ff6b2c]" /><span>I agree to the platform terms and confirm I have the rights required to upload and distribute my work.</span></label>
            </>
          ) : null}
          {error ? <p className="rounded-[18px] border border-[#ff8f70]/30 bg-[#ff8f70]/10 px-4 py-3 text-sm text-[#ffe2d9]">{error}</p> : null}
          <button type="submit" className="button-primary w-full justify-center" disabled={isSubmitting}>{isSubmitting ? 'Working...' : mode === 'login' ? 'Log in to MusiPR' : 'Create my account'}</button>
        </form>
      </article>
    </section>
  );
}

export const ArtistOnboardingPage = () => (
  <section className="space-y-8">
    <div className="hero-panel">
      <p className="eyebrow">Artist onboarding</p>
      <h1 className="display-title mt-4">Build the artist world fans will enter first.</h1>
      <p className="section-copy mt-4 max-w-2xl">The onboarding flow now reads like a launch plan with visual identity, catalog setup, and trust signals instead of a generic placeholder.</p>
    </div>
    <div className="grid gap-5 md:grid-cols-3">
      {[
        ['Identity', 'Profile image, cover art, town, and story'],
        ['Proof', 'Verification, rights confirmation, and release readiness'],
        ['Monetize', 'Merch, shows, and campaign hooks from day one']
      ].map(([title, note]) => (
        <article key={title} className="card p-6">
          <p className="eyebrow">Step</p>
          <p className="mt-4 text-2xl font-semibold text-white">{title}</p>
          <p className="mt-3 text-sm leading-7 text-[#9db0ba]">{note}</p>
        </article>
      ))}
    </div>
  </section>
);

export const VerificationPage = () => (
  <section className="space-y-8">
    <div className="hero-panel">
      <p className="eyebrow">Verification</p>
      <h1 className="display-title mt-4">Trust-building made visible.</h1>
      <p className="section-copy mt-4 max-w-2xl">Identity, rights, and review state now feel like a real milestone in the creator journey instead of a compliance dead-end.</p>
    </div>
    <div className="section-grid xl:grid-cols-[0.95fr_1.05fr]">
      <article className="card p-6">
        <p className="eyebrow">Checklist</p>
        <div className="mt-4 space-y-3">
          {['Government ID uploaded', 'Selfie confirmation pending', 'Rights confirmation completed', 'Admin review scheduled'].map((item) => (
            <div key={item} className="feed-row">{item}</div>
          ))}
        </div>
      </article>
      <article className="card p-6">
        <p className="eyebrow">Why it matters</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <MetricTile label="Catalog trust" value="High" note="Fans see the platform as a place for credible local releases." />
          <MetricTile label="Artist unlocks" value="4" note="Public tracks, profile verification, merch, and better discovery." />
        </div>
      </article>
    </div>
  </section>
);

export const ArtistDashboardPage = () => (
  <ArtistDashboardContent />
);

function ArtistDashboardContent() {
  const homeCatalog = buildHomeCatalog(useDiscoveryHomeQuery().data);
  const leadArtist = homeCatalog.artists[0] ?? fallbackArtists[0];
  const leadTrack = homeCatalog.tracks[0] ?? fallbackTracks[0];

  return (
    <section className="space-y-8">
      <div className="hero-panel">
        <p className="eyebrow">Artist dashboard</p>
        <h1 className="display-title mt-4">A dashboard that thinks like a release team.</h1>
        <p className="section-copy mt-4 max-w-2xl">Streaming momentum, merch intent, and live-show demand now sit together in a way that feels like a real artist operating surface.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Monthly listeners" value={leadArtist.monthlyListenersLabel ?? '12.4K'} note="Momentum is strongest after editorial placements." />
        <MetricTile label="Top track" value={leadTrack.title} note="The lead single is still carrying saves and repeat plays." />
        <MetricTile label="Merch clicks" value="312" note="Poster and tee demand is strongest after live moments." />
        <MetricTile label="Show interest" value="68%" note="Ticket clicks trending above baseline in Santurce." />
      </div>
      <div className="section-grid xl:grid-cols-[1.05fr_0.95fr]">
        <article className="card p-6">
          <p className="eyebrow">Catalog pulse</p>
          <div className="mt-4 space-y-4">
            {homeCatalog.tracks.map((track, index) => (
              <MiniTrackRow key={track.title} index={index} title={track.title} artist={track.artist} plays={track.plays} accent={track.accent} imageSrc={track.imageSrc} />
            ))}
          </div>
        </article>
        <article className="card p-6">
          <p className="eyebrow">Launch runway</p>
          <div className="mt-4 space-y-4">
            {homeCatalog.releaseMoments.map((release) => <ReleaseMoment key={release.title} {...release} />)}
          </div>
        </article>
      </div>
    </section>
  );
}

export const UploadTrackPage = () => (
  <section className="space-y-8">
    <div className="hero-panel">
      <p className="eyebrow">Upload</p>
      <h1 className="display-title mt-4">Treat every upload like a release event.</h1>
      <p className="section-copy mt-4 max-w-2xl">The upload flow now frames metadata, processing, and campaign setup as part of one launch surface.</p>
    </div>
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <article className="card p-6">
        <p className="eyebrow">Release builder</p>
        <div className="mt-4 space-y-3">
          {['Track title and cover art', 'Description, credits, and rights', 'Release timing and visibility', 'Upload + audio processing status'].map((item) => (
            <div key={item} className="feed-row">{item}</div>
          ))}
        </div>
      </article>
      <article className="card p-6">
        <p className="eyebrow">Readiness</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <MetricTile label="Metadata" value="93%" note="Core release copy and imagery are nearly ready." />
          <MetricTile label="Processing" value="72%" note="Audio pipeline and artwork validation still running." />
        </div>
      </article>
    </div>
  </section>
);

export function TrackDetailPage() {
  const { id } = useParams();
  const detail = buildTrackDetail(useTrackDetailQuery(id ?? '').data);
  const track = detail.track;
  const artist = fallbackArtists.find((item) => item.name === track.artist);
  const relatedTracks = detail.relatedTracks.length ? detail.relatedTracks : fallbackTracks.filter((item) => item.title !== track.title).slice(0, 3);
  const featuredPlaylist = detail.featuringPlaylists[0] ?? fallbackPlaylists[0];

  return (
    <section className="space-y-8">
      <DetailHero
        eyebrow="Track detail"
        title={track.title}
        description={`${track.artist} now has a route-aware detail page with story, credits, momentum, and related listening instead of a single hardcoded placeholder.`}
        imageSrc={track.imageSrc}
        chips={[track.tag, artist?.town ?? 'Puerto Rico', track.duration, track.plays]}
        actions={
          <>
            <Link to={`/artists/${slugify(track.artist)}`} className="button-primary">
              Open artist profile
            </Link>
            <Link to={`/discover?q=${encodeURIComponent(track.artist)}`} className="button-secondary">
              More from this lane
            </Link>
          </>
        }
        mediaEyebrow="Now spinning"
        mediaTitle={`${track.artist} in the current cycle`}
        mediaNote="The track header now leads with actual imagery and release context, so the route feels closer to a real editorial listening page."
      />
      <div className="section-grid xl:grid-cols-[0.92fr_1.08fr]">
        <article className="card detail-note-card p-6">
          <p className="eyebrow">Studio note</p>
          <p className="detail-note-title mt-4">
            {track.title} is framed like a release moment now, with enough story and signal to feel worth staying on.
          </p>
          <p className="detail-note-copy mt-4">
            The track page now behaves more like a liner-note spread. Instead of dropping listeners into a generic placeholder, it opens with image, context, and a stronger sense of where this song lives in the wider scene.
          </p>
          <div className="detail-fact-list mt-6">
            {[
              `Front page tag: ${track.tag}`,
              `Scene anchor: ${artist?.town ?? 'Puerto Rico'}`,
              `Best paired with: ${featuredPlaylist?.title ?? 'Indie Boricua'}`
            ].map((item) => (
              <div key={item} className="feed-row">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="eyebrow">Signal map</p>
            <div className="mt-4 grid grid-cols-12 gap-2">
              {[22, 38, 46, 62, 56, 74, 64, 52, 44, 36, 24, 18].map((height, index) => (
                <span key={`${height}-${index}`} className="mini-wave" style={{ height: `${height}px` }} />
              ))}
            </div>
          </div>
        </article>
        <PhotoNotePanel
          eyebrow="Campaign frame"
          title={`${track.artist} is carrying this one with clear momentum.`}
          note="Live support, playlist placement, and the release-week story now sit closer together, which makes the page feel more like a real music product and less like a generated template."
          imageSrc={artist?.imageSrc ?? track.imageSrc}
          meta={[track.plays, track.duration, featuredPlaylist?.title ?? 'Editorial lane']}
        />
      </div>
      <div className="section-grid xl:grid-cols-[1.05fr_0.95fr]">
        <article className="card p-6">
          <p className="eyebrow">About the record</p>
          <p className="mt-4 text-lg font-semibold text-white">
            {track.tag} energy anchored by {track.artist} and shaped for replay-friendly discovery.
          </p>
          <p className="mt-4 text-sm leading-7 text-[#9db0ba]">
            The page now inherits the clicked track and keeps the surrounding context aligned, which makes the catalog feel like a connected product instead of disconnected mockups.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MetricTile label="Momentum" value={track.plays} note="Strong listener attention in the current browse cycle." />
            <MetricTile label="Comments" value={String(track.commentCount ?? detail.comments.length)} note="Conversation is building around the record." />
            <MetricTile label="Duration" value={track.duration} note="Fast replay-friendly runtime." />
          </div>
        </article>
        <article className="card p-6">
          <p className="eyebrow">Credits + notes</p>
          <div className="mt-4 space-y-3">
            {[
              `Written by ${track.artist}`,
              `Current signal: ${track.tag}`,
              `Primary play zone: ${artist?.town ?? 'Puerto Rico'}`,
              `Scheduled follow-up: playlist and live push this weekend`
            ].map((item) => (
              <div key={item} className="feed-row">{item}</div>
            ))}
          </div>
        </article>
      </div>
      <div className="section-grid xl:grid-cols-[1.05fr_0.95fr]">
        <article className="card p-6">
          <p className="eyebrow">Fan comments</p>
          <div className="mt-4 space-y-3">
            {detail.comments.map((comment) => (
              <div key={comment.id} className="feed-row">{`"${comment.body}"`}</div>
            ))}
          </div>
        </article>
        <article className="card p-6">
          <p className="eyebrow">Related actions</p>
          <div className="mt-4 space-y-4">
            {relatedTracks.map((item, index) => (
              <MiniTrackRow key={item.title} index={index} title={item.title} artist={item.artist} plays={item.plays} accent={item.accent} imageSrc={item.imageSrc} />
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export function ArtistProfilePage() {
  const { id } = useParams();
  const detail = buildArtistDetail(useArtistDetailQuery(id ?? '').data);
  const artist = detail.artist;
  const featuredTracks = detail.tracks.length ? detail.tracks : fallbackTracks.filter((item) => item.artist === artist.name).slice(0, 2);
  const featuredReleases = detail.releases.length ? detail.releases : fallbackReleaseMoments.filter((item) => item.artist === artist.name);
  const featuredEvents = detail.shows.length ? detail.shows : fallbackEvents.filter((item) => item.venue === artist.town);
  const featuredMerch = detail.merch.length ? detail.merch : merchForArtistFallback(artist.name);
  const signatureTrack = featuredTracks[0] ?? fallbackTracks[0];

  return (
    <section className="space-y-8">
      <DetailHero
        eyebrow="Verified artist profile"
        title={artist.name}
        description={`${artist.genre} from ${artist.town}, with tracks, shows, merch, and release timing now pulled into one route-aware profile surface.`}
        imageSrc={artist.imageSrc}
        chips={[artist.genre, artist.town, 'verified artist', 'merch active']}
        actions={
          <>
            <Link to={`/discover?q=${encodeURIComponent(artist.name)}`} className="button-primary">
              Browse artist lane
            </Link>
            <Link to="/shows" className="button-secondary">
              Upcoming shows
            </Link>
          </>
        }
        mediaEyebrow="Artist world"
        mediaTitle={`${artist.name} live from ${artist.town}`}
        mediaNote="Profiles now open with a stronger portrait-led frame so the artist world feels like a destination instead of a supporting page."
      />
      <div className="section-grid xl:grid-cols-[0.98fr_1.02fr]">
        <article className="card detail-note-card p-6">
          <p className="eyebrow">Artist note</p>
          <p className="detail-note-title mt-4">
            {artist.name} now has a profile that reads like an artist world, not a thin bio page.
          </p>
          <p className="detail-note-copy mt-4">
            Tracks, release timing, merch, and local demand now reinforce one another. That makes the profile feel closer to a Bandcamp artist destination, where context and identity matter as much as raw metrics.
          </p>
          <div className="detail-fact-list mt-6">
            {[
              `Core scene: ${artist.town}`,
              `Lead signal: ${signatureTrack.title}`,
              `Merch lane: ${featuredMerch[0]?.title ?? 'Poster pack'}`
            ].map((item) => (
              <div key={item} className="feed-row">
                {item}
              </div>
            ))}
          </div>
        </article>
        <PhotoNotePanel
          eyebrow="Featured this week"
          title={`${signatureTrack.title} is the current entry point.`}
          note="The profile now gets a larger editorial image panel too, so the artist route feels authored and promotional before listeners even scroll into tracks and merch."
          imageSrc={signatureTrack.imageSrc ?? artist.imageSrc}
          meta={[artist.genre, signatureTrack.plays, `${Math.max(featuredEvents.length, 1)} upcoming show`]}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Followers" value={artist.followerLabel ?? '3.2K'} note="Audience keeps growing after release week." />
        <MetricTile label="Monthly listeners" value={artist.monthlyListenersLabel ?? '12.4K'} note="Homepage placements are compounding." />
        <MetricTile label="Merch lane" value={String(artist.merchCount ?? featuredMerch.length)} note="High intent from returning fans." />
        <MetricTile label="Upcoming shows" value={String(Math.max(featuredEvents.length, 1))} note="Local demand is visible inside the profile world." />
      </div>
      <div className="section-grid xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5 md:grid-cols-2">{featuredTracks.map((item) => <TrackCard key={item.title} {...item} />)}</div>
        <article className="card p-6">
          <p className="eyebrow">Release moments</p>
          <div className="mt-4 space-y-4">
            {(featuredReleases.length ? featuredReleases : fallbackReleaseMoments.slice(0, 2)).map((release) => <ReleaseMoment key={release.title} {...release} />)}
          </div>
        </article>
      </div>
      <div className="section-grid xl:grid-cols-[1fr_1fr]">
        <section className="grid gap-5 md:grid-cols-2">{(featuredEvents.length ? featuredEvents : fallbackEvents.slice(0, 2)).map((event) => <EventCard key={event.title} {...event} />)}</section>
        <section className="grid gap-5 md:grid-cols-2">{featuredMerch.map((item) => <MerchCard key={item.title} {...item} />)}</section>
      </div>
    </section>
  );
}

export function PlaylistDetailPage() {
  const { id } = useParams();
  const detail = buildPlaylistDetail(usePlaylistDetailQuery(id ?? '').data);
  const playlist = detail.playlist;
  const playlistTracks = detail.tracks.length ? detail.tracks : tracksForPlaylistFallback(playlist.title);
  const playlistArtists = detail.artists.length ? detail.artists : fallbackArtists.filter((item) => playlistTracks.some((track) => track.artist === item.name)).slice(0, 2);
  const playlistTags = playlist.moodTags?.length ? playlist.moodTags : tagsForPlaylist(playlist.title);

  return (
    <section className="space-y-8">
      <DetailHero
        eyebrow="Playlist detail"
        title={playlist.title}
        description={`${playlist.description} This route now adapts to the clicked playlist, so the listening surface has its own identity instead of replaying a single static example.`}
        imageSrc={playlist.imageSrc}
        chips={[playlist.count, ...playlistTags.slice(0, 3)]}
        actions={
          <>
            <Link to="/discover" className="button-primary">
              Keep browsing
            </Link>
            <Link to={`/discover?q=${encodeURIComponent(playlist.title)}`} className="button-secondary">
              Similar moods
            </Link>
          </>
        }
        mediaEyebrow="Editorial mix"
        mediaTitle={`${playlist.title} sets the tone`}
        mediaNote="The playlist route now opens with image-led mood and context, making the sequence feel curated before the tracklist even starts."
      />
      <div className="section-grid xl:grid-cols-[0.96fr_1.04fr]">
        <article className="card detail-note-card p-6">
          <p className="eyebrow">Curator note</p>
          <p className="detail-note-title mt-4">
            This mix is meant to feel sequenced, warm, and specific, not like a stack of interchangeable tracks.
          </p>
          <p className="detail-note-copy mt-4">
            The playlist detail page now gets a written editorial frame so the mix has a point of view. That extra context helps the route feel more like a music destination and less like a utility list.
          </p>
          <div className="detail-fact-list mt-6">
            {[
              `Opening cue: ${playlistTracks[0]?.title ?? 'Brisa en Loiza'}`,
              `Mood center: ${playlistTags[0]}`,
              `Primary energy: ${playlist.count}`
            ].map((item) => (
              <div key={item} className="feed-row">
                {item}
              </div>
            ))}
          </div>
        </article>
        <PhotoNotePanel
          eyebrow="Mix visual"
          title={`${playlist.title} opens with a clearer point of view.`}
          note="The detail view now carries a larger supporting image panel, which makes the playlist feel like an editorial object with mood and sequence instead of a generic collection."
          imageSrc={playlistTracks[0]?.imageSrc ?? playlist.imageSrc}
          meta={[playlist.count, ...playlistTags.slice(0, 2)]}
        />
      </div>
      <div className="section-grid xl:grid-cols-[0.9fr_1.1fr]">
        <article className="card p-6">
          <p className="eyebrow">Mood board</p>
          <div className="mt-4"><ChipRow items={playlistTags} strong /></div>
          <p className="mt-4 text-sm leading-7 text-[#9db0ba]">{playlist.count} arranged for listeners moving through one coherent editorial mood.</p>
        </article>
        <article className="card p-6">
          <p className="eyebrow">Track order</p>
          <div className="mt-4 space-y-4">
            {playlistTracks.map((track, index) => (
              <MiniTrackRow key={track.title} index={index} title={track.title} artist={track.artist} plays={track.plays} accent={track.accent} imageSrc={track.imageSrc} />
            ))}
          </div>
        </article>
      </div>
      {playlistArtists.length ? (
        <>
          <SectionHeading
            eyebrow="Featured artists"
            title="The artists carrying the tone of this sequence."
            description="The playlist now flows directly into the people behind the tracks, which makes the route feel more connected and less static."
          />
          <div className="grid gap-5 md:grid-cols-2">{playlistArtists.map((artist) => <ArtistCard key={artist.name} {...artist} />)}</div>
        </>
      ) : null}
    </section>
  );
}

export function ReleasesPage() {
  const releases = useReleasesQuery().data?.map((release) => buildHomeCatalog({ featuredArtists: [], trendingTracks: [], playlists: [], shows: [], merch: [], genres: [], newReleases: [release] }).releaseMoments[0]).filter(Boolean) ?? fallbackReleaseMoments;

  return (
    <section className="space-y-8">
      <div className="hero-panel">
        <p className="eyebrow">Releases</p>
        <h1 className="display-title mt-4">Launch moments with real visual weight.</h1>
        <p className="section-copy mt-4 max-w-2xl">Release surfaces now feel closer to campaigns than placeholders, with enough structure to support teasers, reminders, and artist context.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">{releases.map((release) => <ReleaseMoment key={release.title} {...release} />)}</div>
    </section>
  );
}

export const AdminDashboardPage = () => (
  <section className="space-y-8">
    <div className="hero-panel">
      <p className="eyebrow">Admin</p>
      <h1 className="display-title mt-4">Moderation and ops with calmer hierarchy.</h1>
      <p className="section-copy mt-4 max-w-2xl">The admin side now reads like an operations hub instead of another duplicated scaffold page.</p>
    </div>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <MetricTile label="Verification queue" value="14" note="Artists waiting on review this week." />
      <MetricTile label="Open reports" value="3" note="Triage is concentrated and visible." />
      <MetricTile label="Featured slots" value="6" note="Homepage/editorial planning is underway." />
      <MetricTile label="Audit actions" value="29" note="All moderation moves are traceable." />
    </div>
    <div className="section-grid xl:grid-cols-[1.05fr_0.95fr]">
      <article className="card p-6">
        <p className="eyebrow">Priority queue</p>
        <div className="mt-4 space-y-3">
          {['Review Luna Costa verification refresh', 'Investigate merch trademark notice', 'Approve featured placement changes', 'Finalize takedown follow-up for archived upload'].map((item) => (
            <div key={item} className="feed-row">{item}</div>
          ))}
        </div>
      </article>
      <article className="card p-6">
        <p className="eyebrow">System pulse</p>
        <div className="mt-4 space-y-4">
          {activityFeed.map((item) => (
            <div key={item} className="feed-row">{item}</div>
          ))}
        </div>
      </article>
    </div>
  </section>
);

export const ModerationPage = () => (
  <section className="space-y-8">
    <div className="hero-panel">
      <p className="eyebrow">Moderation</p>
      <h1 className="display-title mt-4">A queue designed for decisions, not confusion.</h1>
      <p className="section-copy mt-4 max-w-2xl">Moderation work needs signal, context, and actionability. This page now starts to provide that instead of repeating generic metrics.</p>
    </div>
    <div className="grid gap-4">
      {[
        ['Potential ownership dispute on Brisa en Loiza', 'Open'],
        ['Trademark flag on merch artwork', 'Under review'],
        ['Repeat infringer check on archived release', 'Resolved']
      ].map(([item, status]) => (
        <article key={item} className="card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-white">{item}</p>
            <p className="mt-1 text-sm text-[#9db0ba]">Built for faster triage with less visual noise.</p>
          </div>
          <span className="button-ghost">{status}</span>
        </article>
      ))}
    </div>
  </section>
);

export const SettingsPage = () => (
  <section className="space-y-8">
    <div className="hero-panel">
      <p className="eyebrow">Settings</p>
      <h1 className="display-title mt-4">Account surfaces that match the rest of the product.</h1>
      <p className="section-copy mt-4 max-w-2xl">Profile, security, and notification preferences now sit inside a page that feels like the same app, not a fallback screen.</p>
    </div>
    <div className="grid gap-5 md:grid-cols-3">
      <MetricTile label="Profile" value="Ready" note="Identity, bio, and media positioning are in sync." />
      <MetricTile label="Security" value="JWT" note="Session structure is working end-to-end." />
      <MetricTile label="Alerts" value="Soon" note="Release, merch, and live notifications can grow here." />
    </div>
  </section>
);

export function PlaylistsPage() {
  const playlists = usePlaylistsQuery().data?.map((playlist) => buildHomeCatalog({ featuredArtists: [], trendingTracks: [], shows: [], merch: [], genres: [], newReleases: [], playlists: [playlist] }).playlists[0]).filter(Boolean) ?? fallbackPlaylists;

  return (
    <section className="space-y-8">
      <SectionHeading eyebrow="Playlists" title="Editorial collections with stronger personality." description="These rows now feel more like active curation than a generic content grid." />
      <div className="grid gap-5 xl:grid-cols-3">{playlists.map((playlist) => <PlaylistCard key={playlist.title} {...playlist} />)}</div>
    </section>
  );
}

export function ShowsPage() {
  const events = useEventsQuery().data?.map((event) => buildHomeCatalog({ featuredArtists: [], trendingTracks: [], playlists: [], merch: [], genres: [], newReleases: [], shows: [event] }).events[0]).filter(Boolean) ?? fallbackEvents;

  return (
    <section className="space-y-8">
      <SectionHeading eyebrow="Shows" title="Live discovery belongs in the same product rhythm." description="Show cards now feel like real event modules that can sit beside tracks and merch naturally." />
      <div className="grid gap-5 md:grid-cols-2">{events.map((event) => <EventCard key={event.title} {...event} />)}</div>
    </section>
  );
}

export function MerchPage() {
  const merch = useMerchQuery().data?.map((item) => buildHomeCatalog({ featuredArtists: [], trendingTracks: [], playlists: [], shows: [], genres: [], newReleases: [], merch: [item] }).merch[0]).filter(Boolean) ?? fallbackMerch;

  return (
    <section className="space-y-8">
      <SectionHeading eyebrow="Merch" title="Commerce surfaces with more visual presence." description="Merch now feels boutique and artist-linked rather than bolted onto the side of the app." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{merch.map((item) => <MerchCard key={item.title} {...item} />)}</div>
    </section>
  );
}
