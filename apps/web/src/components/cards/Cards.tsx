import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../../store/player';
import { slugify } from '../../utils/slug';

type AccentTone = 'ember' | 'tide' | 'gold';

const accentStyles: Record<AccentTone, string> = {
  ember: 'from-[#ff6b2c]/35 via-[#ff8f70]/12 to-transparent',
  tide: 'from-[#36d0ad]/30 via-[#2e7180]/10 to-transparent',
  gold: 'from-[#f7c66d]/35 via-[#f3a86b]/10 to-transparent'
};

function GradientWash({ accent }: { accent: AccentTone }) {
  return <div className={clsx('pointer-events-none absolute inset-0 bg-gradient-to-br', accentStyles[accent])} aria-hidden="true" />;
}

function ArtworkTile({
  accent,
  label,
  imageSrc,
  showLabel = true,
  mode = 'square'
}: {
  accent: AccentTone;
  label: string;
  imageSrc?: string;
  showLabel?: boolean;
  mode?: 'square' | 'poster' | 'disc';
}) {
  return (
    <div
      className={clsx(
        'artwork-shell',
        !imageSrc && `artwork-${accent}`,
        mode === 'poster' && 'artwork-poster',
        mode === 'disc' && 'artwork-disc-shell'
      )}
    >
      {imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt=""
            className={clsx('artwork-photo', mode === 'disc' && 'artwork-photo-disc', mode === 'poster' && 'artwork-photo-poster')}
          />
          <div className={clsx('artwork-photo-wash', mode === 'disc' && 'artwork-photo-disc')} aria-hidden="true" />
        </>
      ) : (
        <div className={clsx('artwork-grid', mode === 'disc' && 'artwork-disc')} aria-hidden="true" />
      )}
      {showLabel ? <span className="artwork-label">{label}</span> : null}
    </div>
  );
}

export function ArtistCard({
  name,
  town,
  genre = 'Featured artist',
  accent = 'tide',
  imageSrc
}: {
  name: string;
  town: string;
  genre?: string;
  accent?: AccentTone;
  imageSrc?: string;
}) {
  return (
    <Link to={`/artists/${slugify(name)}`} className="card block p-5 transition duration-300 hover:-translate-y-1">
      <GradientWash accent={accent} />
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Artist profile</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#f2ebe1]">
            {genre}
          </span>
        </div>
        <ArtworkTile accent={accent} label={name} imageSrc={imageSrc} mode="disc" showLabel={false} />
        <div>
          <p className="text-2xl font-semibold text-white">{name}</p>
          <p className="mt-2 text-sm text-[#9db0ba]">{town}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-[#cfd8dc]">
          <span>Local following building fast</span>
          <span className="text-[#f7c66d]">View profile</span>
        </div>
      </div>
    </Link>
  );
}

export function TrackCard({
  title,
  artist,
  tag = 'Featured track',
  plays = '6.2K plays',
  duration = '3:24',
  accent = 'ember',
  imageSrc
}: {
  title: string;
  artist: string;
  tag?: string;
  plays?: string;
  duration?: string;
  accent?: AccentTone;
  imageSrc?: string;
}) {
  const setTrack = usePlayerStore((state) => state.setTrack);

  return (
    <Link
      to={`/tracks/${slugify(title)}`}
      onClick={() => setTrack({ id: slugify(`${artist}-${title}`), title, artist })}
      className="card group h-full w-full p-5 text-left transition duration-300 hover:-translate-y-1"
    >
      <GradientWash accent={accent} />
      <div className="relative z-10 flex h-full flex-col gap-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[#9db0ba]">
          <span>{tag}</span>
          <span>{duration}</span>
        </div>
        <ArtworkTile accent={accent} label={title} imageSrc={imageSrc} showLabel={false} />
        <div className="space-y-2">
          <p className="text-2xl font-semibold text-white transition group-hover:text-[#fff6ec]">{title}</p>
          <p className="text-sm text-[#c3d0d6]">{artist}</p>
        </div>
        <div className="track-bars" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm text-[#9db0ba]">{plays}</span>
          <span className="button-ghost">Play</span>
        </div>
      </div>
    </Link>
  );
}

export function PlaylistCard({
  title,
  description,
  count = '18 tracks',
  accent = 'gold',
  imageSrc
}: {
  title: string;
  description: string;
  count?: string;
  accent?: AccentTone;
  imageSrc?: string;
}) {
  return (
    <Link to={`/playlists/${slugify(title)}`} className="card block p-5 transition duration-300 hover:-translate-y-1">
      <GradientWash accent={accent} />
      <div className="relative z-10 space-y-5">
        <div className="eyebrow">Editorial playlist</div>
        <div className="playlist-stack" aria-hidden="true">
          <div
            className={clsx('stack-card stack-back', !imageSrc && `artwork-${accent}`, imageSrc && 'stack-photo')}
            style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : undefined}
          />
          <div
            className={clsx('stack-card stack-mid', !imageSrc && `artwork-${accent}`, imageSrc && 'stack-photo')}
            style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : undefined}
          />
          <div
            className={clsx('stack-card stack-front', !imageSrc && `artwork-${accent}`, imageSrc && 'stack-photo')}
            style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : undefined}
          />
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{title}</p>
          <p className="mt-2 max-w-[24rem] text-sm leading-6 text-[#9db0ba]">{description}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-[#cfd8dc]">
          <span>{count}</span>
          <span className="text-[#f7c66d]">Open mix</span>
        </div>
      </div>
    </Link>
  );
}

export function EventCard({
  title,
  venue,
  date = 'Fri 8PM',
  accent = 'tide',
  imageSrc
}: {
  title: string;
  venue: string;
  date?: string;
  accent?: AccentTone;
  imageSrc?: string;
}) {
  return (
    <Link to="/shows" className="card block p-5 transition duration-300 hover:-translate-y-1">
      <GradientWash accent={accent} />
      <div className="relative z-10 grid gap-5 md:grid-cols-[140px_1fr] md:items-center">
        <ArtworkTile accent={accent} label={date} imageSrc={imageSrc} mode="poster" showLabel={false} />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Live circuit</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#cfd8dc]">{date}</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm text-[#9db0ba]">{venue}</p>
          </div>
          <p className="text-sm text-[#cfd8dc]">Built for fans who want discovery, tickets, and community in one flow.</p>
        </div>
      </div>
    </Link>
  );
}

export function MerchCard({
  title,
  price,
  edition = 'Limited run',
  accent = 'ember',
  imageSrc
}: {
  title: string;
  price: string;
  edition?: string;
  accent?: AccentTone;
  imageSrc?: string;
}) {
  return (
    <Link to="/merch" className="card block p-5 transition duration-300 hover:-translate-y-1">
      <GradientWash accent={accent} />
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Merch drop</span>
          <span className="text-sm font-medium text-[#fff6ec]">{price}</span>
        </div>
        <ArtworkTile accent={accent} label={price} imageSrc={imageSrc} mode="poster" showLabel={false} />
        <div>
          <p className="text-xl font-semibold text-white">{title}</p>
          <p className="mt-2 text-sm text-[#9db0ba]">{edition}</p>
        </div>
        <div className="button-ghost inline-flex">View item</div>
      </div>
    </Link>
  );
}
