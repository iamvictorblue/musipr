import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useEngagementStore } from '../../store/engagement';
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
  const isFollowing = useEngagementStore((state) => state.isFollowingArtist(name));
  const toggleArtistFollow = useEngagementStore((state) => state.toggleArtistFollow);

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
        <div className="flex items-center justify-between gap-3 text-sm text-[#cfd8dc]">
          <span>{isFollowing ? 'Following from your library' : 'Local following building fast'}</span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              toggleArtistFollow(name);
            }}
            className={clsx('rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition', isFollowing ? 'bg-cyan-400/14 text-cyan-200' : 'bg-white/6 text-zinc-300 hover:text-white')}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
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
      onClick={() =>
        setTrack({
          id: slugify(`${artist}-${title}`),
          title,
          artist,
          artworkUrl: imageSrc,
          sourceLabel: tag
        })
      }
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
  const reminded = useEngagementStore((state) => state.isShowReminded(title));
  const toggleShowReminder = useEngagementStore((state) => state.toggleShowReminder);

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#cfd8dc]">{reminded ? 'Reminder set and ready for the next live push.' : 'Built for fans who want discovery, tickets, and community in one flow.'}</p>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                toggleShowReminder(title);
              }}
              className={clsx('rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition', reminded ? 'bg-cyan-400/14 text-cyan-200' : 'bg-white/6 text-zinc-300 hover:text-white')}
            >
              {reminded ? 'Reminder on' : 'Remind me'}
            </button>
          </div>
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
  const saved = useEngagementStore((state) => state.isMerchSaved(title));
  const toggleMerchSave = useEngagementStore((state) => state.toggleMerchSave);

  return (
    <Link to="/merch" className="card block p-5 transition duration-300 hover:-translate-y-1">
      <GradientWash accent={accent} />
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Merch drop</span>
          <span className="text-sm font-medium text-[#fff6ec]">{saved ? 'Saved' : price}</span>
        </div>
        <ArtworkTile accent={accent} label={price} imageSrc={imageSrc} mode="poster" showLabel={false} />
        <div>
          <p className="text-xl font-semibold text-white">{title}</p>
          <p className="mt-2 text-sm text-[#9db0ba]">{edition}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-[#cfd8dc]">{saved ? 'Pinned for later checkout' : 'Available now'}</span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              toggleMerchSave(title);
            }}
            className={clsx('rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition', saved ? 'bg-cyan-400/14 text-cyan-200' : 'bg-white/6 text-zinc-300 hover:text-white')}
          >
            {saved ? 'Saved' : 'Save item'}
          </button>
        </div>
      </div>
    </Link>
  );
}
