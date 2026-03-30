import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import {
  deriveTrackTag,
  formatCompactCount,
  formatDurationLabel,
  formatEventDateLabel,
  formatPlayLabel,
  formatPriceLabel,
  formatReleaseNote,
  slugify
} from '../utils/catalog.js';

function serializeArtist(
  artist: {
    id: string;
    artistName: string;
    town: string | null;
    bio: string | null;
    followerCount: number;
    monthlyListeners: number;
    merchClicks: number;
    ticketClicks: number;
    genres?: Array<{ name: string }>;
    _count?: { tracks: number; merchItems: number; events: number };
  }
) {
  const genres = artist.genres?.map((genre) => genre.name) ?? [];

  return {
    id: artist.id,
    slug: slugify(artist.artistName),
    name: artist.artistName,
    town: artist.town,
    bio: artist.bio,
    genre: genres[0] ?? 'Featured artist',
    genres,
    followerCount: artist.followerCount,
    followerLabel: formatCompactCount(artist.followerCount),
    monthlyListeners: artist.monthlyListeners,
    monthlyListenersLabel: formatCompactCount(artist.monthlyListeners),
    merchClicks: artist.merchClicks,
    ticketClicks: artist.ticketClicks,
    trackCount: artist._count?.tracks ?? 0,
    merchCount: artist._count?.merchItems ?? 0,
    eventCount: artist._count?.events ?? 0
  };
}

function serializeTrack(
  track: {
    id: string;
    title: string;
    description: string | null;
    artworkUrl: string | null;
    durationSec: number;
    playCount: number;
    likeCount: number;
    createdAt: Date;
    artistProfile: { artistName: string; town: string | null };
    genre: { name: string } | null;
    _count?: { comments: number };
  }
) {
  return {
    id: track.id,
    slug: slugify(track.title),
    title: track.title,
    description: track.description,
    artworkUrl: track.artworkUrl,
    durationSec: track.durationSec,
    durationLabel: formatDurationLabel(track.durationSec),
    playCount: track.playCount,
    playsLabel: formatPlayLabel(track.playCount),
    likeCount: track.likeCount,
    commentCount: track._count?.comments ?? 0,
    genre: track.genre?.name ?? null,
    tag: deriveTrackTag(track.playCount, track.artistProfile.town),
    artistName: track.artistProfile.artistName,
    artistSlug: slugify(track.artistProfile.artistName),
    town: track.artistProfile.town,
    createdAt: track.createdAt
  };
}

function serializePlaylist(
  playlist: {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    moodTags: string[];
    isEditorial: boolean;
    ownerArtist: { artistName: string } | null;
    _count?: { tracks: number };
  }
) {
  return {
    id: playlist.id,
    slug: slugify(playlist.title),
    title: playlist.title,
    description: playlist.description,
    coverUrl: playlist.coverUrl,
    moodTags: playlist.moodTags,
    isEditorial: playlist.isEditorial,
    ownerArtistName: playlist.ownerArtist?.artistName ?? null,
    trackCount: playlist._count?.tracks ?? 0,
    countLabel: `${playlist._count?.tracks ?? 0} tracks`
  };
}

function serializeRelease(
  release: {
    id: string;
    releaseAt: Date;
    isPublished: boolean;
    notifyCount: number;
    artistProfile: { artistName: string };
    track: { title: string };
  }
) {
  return {
    id: release.id,
    slug: slugify(release.track.title),
    title: release.track.title,
    artistName: release.artistProfile.artistName,
    artistSlug: slugify(release.artistProfile.artistName),
    releaseAt: release.releaseAt,
    isPublished: release.isPublished,
    notifyCount: release.notifyCount,
    note: formatReleaseNote(release.releaseAt)
  };
}

function serializeEvent(
  event: {
    id: string;
    title: string;
    venue: string;
    town: string;
    startsAt: Date;
    description: string | null;
    ticketLink: string | null;
    artistProfile: { artistName: string };
  }
) {
  return {
    id: event.id,
    title: event.title,
    venue: event.venue,
    town: event.town,
    startsAt: event.startsAt,
    dateLabel: formatEventDateLabel(event.startsAt),
    description: event.description,
    ticketLink: event.ticketLink,
    artistName: event.artistProfile.artistName,
    artistSlug: slugify(event.artistProfile.artistName)
  };
}

function serializeMerch(
  merch: {
    id: string;
    title: string;
    description: string | null;
    priceCents: number;
    imageUrl: string | null;
    category: string;
    artistProfile: { artistName: string };
  }
) {
  return {
    id: merch.id,
    title: merch.title,
    description: merch.description,
    priceCents: merch.priceCents,
    priceLabel: formatPriceLabel(merch.priceCents),
    imageUrl: merch.imageUrl,
    category: merch.category,
    artistName: merch.artistProfile.artistName,
    artistSlug: slugify(merch.artistProfile.artistName)
  };
}

export async function getTrackBySlug(req: Request, res: Response) {
  const slug = String(req.params.slug ?? '');
  const tracks = await prisma.track.findMany({
    where: { visibility: 'PUBLIC', isDisabled: false },
    include: {
      artistProfile: true,
      genre: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 6
      },
      playlistTracks: {
        include: {
          playlist: {
            include: {
              ownerArtist: true,
              _count: { select: { tracks: true } }
            }
          }
        }
      },
      _count: { select: { comments: true } }
    }
  });

  const track = tracks.find((item) => slugify(item.title) === slug) ?? tracks[0];
  if (!track) return res.status(404).json({ message: 'Track not found.' });

  const relatedTracks = tracks
    .filter((item) => item.id !== track.id && (item.artistProfileId === track.artistProfileId || item.genreId === track.genreId))
    .slice(0, 3)
    .map((item) => serializeTrack(item));

  res.json({
    track: {
      ...serializeTrack(track),
      comments: track.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        author: comment.user.email.split('@')[0]
      }))
    },
    relatedTracks,
    featuringPlaylists: track.playlistTracks.map((playlistTrack) => serializePlaylist(playlistTrack.playlist))
  });
}

export async function getArtistBySlug(req: Request, res: Response) {
  const slug = String(req.params.slug ?? '');
  const artists = await prisma.artistProfile.findMany({
    include: {
      genres: true,
      tracks: {
        where: { visibility: 'PUBLIC', isDisabled: false },
        include: {
          artistProfile: true,
          genre: true,
          _count: { select: { comments: true } }
        },
        orderBy: { playCount: 'desc' }
      },
      releases: {
        include: {
          artistProfile: true,
          track: true
        },
        orderBy: { releaseAt: 'asc' }
      },
      events: {
        include: { artistProfile: true },
        orderBy: { startsAt: 'asc' }
      },
      merchItems: {
        include: { artistProfile: true },
        orderBy: { createdAt: 'desc' }
      },
      _count: { select: { tracks: true, merchItems: true, events: true } }
    }
  });

  const artist = artists.find((item) => slugify(item.artistName) === slug) ?? artists[0];
  if (!artist) return res.status(404).json({ message: 'Artist not found.' });

  res.json({
    artist: serializeArtist(artist),
    tracks: artist.tracks.map((track) => serializeTrack(track)),
    releases: artist.releases.map((release) => serializeRelease(release)),
    shows: artist.events.map((event) => serializeEvent(event)),
    merch: artist.merchItems.map((item) => serializeMerch(item))
  });
}

export async function listPlaylists(_req: Request, res: Response) {
  const playlists = await prisma.playlist.findMany({
    include: {
      ownerArtist: true,
      _count: { select: { tracks: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(playlists.map((playlist) => serializePlaylist(playlist)));
}

export async function getPlaylistBySlug(req: Request, res: Response) {
  const slug = String(req.params.slug ?? '');
  const playlists = await prisma.playlist.findMany({
    include: {
      ownerArtist: true,
      tracks: {
        include: {
          track: {
            include: {
              artistProfile: true,
              genre: true,
              _count: { select: { comments: true } }
            }
          }
        },
        orderBy: { position: 'asc' }
      },
      _count: { select: { tracks: true } }
    }
  });

  const playlist = playlists.find((item) => slugify(item.title) === slug) ?? playlists[0];
  if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });

  const featuredArtists = playlist.tracks.reduce<Array<{ id: string; name: string }>>((artists, playlistTrack) => {
    const artist = playlistTrack.track.artistProfile;
    if (artists.some((item) => item.id === artist.id)) return artists;
    artists.push({ id: artist.id, name: artist.artistName });
    return artists;
  }, []);

  const artistRows = await prisma.artistProfile.findMany({
    where: { id: { in: featuredArtists.map((artist) => artist.id) } },
    include: {
      genres: true,
      _count: { select: { tracks: true, merchItems: true, events: true } }
    }
  });

  res.json({
    playlist: serializePlaylist(playlist),
    tracks: playlist.tracks.map((playlistTrack) => serializeTrack(playlistTrack.track)),
    featuredArtists: artistRows.map((artist) => serializeArtist(artist))
  });
}

export async function listReleases(_req: Request, res: Response) {
  const releases = await prisma.release.findMany({
    include: {
      artistProfile: true,
      track: true
    },
    orderBy: { releaseAt: 'asc' }
  });

  res.json(releases.map((release) => serializeRelease(release)));
}

export async function listEvents(_req: Request, res: Response) {
  const events = await prisma.event.findMany({
    where: { startsAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) } },
    include: { artistProfile: true },
    orderBy: { startsAt: 'asc' }
  });

  res.json(events.map((event) => serializeEvent(event)));
}

export async function listMerch(_req: Request, res: Response) {
  const merch = await prisma.merchItem.findMany({
    include: { artistProfile: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json(merch.map((item) => serializeMerch(item)));
}
