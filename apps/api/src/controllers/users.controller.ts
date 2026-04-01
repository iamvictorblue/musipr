import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { deriveTrackTag, formatDurationLabel, formatPlayLabel, slugify } from '../utils/catalog.js';

function serializeLibraryTrack(track: {
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
}) {
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

function serializeLibraryPlaylist(playlist: {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  moodTags: string[];
  isEditorial: boolean;
  ownerArtist: { artistName: string } | null;
  _count?: { tracks: number };
}) {
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

export async function getMyLibrary(req: AuthRequest, res: Response) {
  const userId = req.auth!.userId;

  const [likedRows, savedTrackRows, savedPlaylistRows] = await Promise.all([
    prisma.like.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        track: {
          include: {
            artistProfile: true,
            genre: true,
            _count: { select: { comments: true } }
          }
        }
      }
    }),
    prisma.savedTrack.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        track: {
          include: {
            artistProfile: true,
            genre: true,
            _count: { select: { comments: true } }
          }
        }
      }
    }),
    prisma.savedPlaylist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        playlist: {
          include: {
            ownerArtist: true,
            _count: { select: { tracks: true } }
          }
        }
      }
    })
  ]);

  const trackMap = new Map<
    string,
    ReturnType<typeof serializeLibraryTrack> & { likedAt: string | null; savedAt: string | null }
  >();

  for (const row of likedRows) {
    trackMap.set(row.trackId, {
      ...serializeLibraryTrack(row.track),
      likedAt: row.createdAt.toISOString(),
      savedAt: null
    });
  }

  for (const row of savedTrackRows) {
    const existing = trackMap.get(row.trackId);
    if (existing) {
      existing.savedAt = row.createdAt.toISOString();
      continue;
    }

    trackMap.set(row.trackId, {
      ...serializeLibraryTrack(row.track),
      likedAt: null,
      savedAt: row.createdAt.toISOString()
    });
  }

  const likedTracks = Array.from(trackMap.values()).sort((a, b) => {
    const aTime = new Date(a.savedAt ?? a.likedAt ?? 0).getTime();
    const bTime = new Date(b.savedAt ?? b.likedAt ?? 0).getTime();
    return bTime - aTime;
  });

  const savedPlaylists = savedPlaylistRows.map((row) => ({
    ...serializeLibraryPlaylist(row.playlist),
    savedAt: row.createdAt.toISOString()
  }));

  res.json({
    likedTracks,
    savedPlaylists,
    counts: {
      likedTracks: likedRows.length,
      savedTracks: savedTrackRows.length,
      savedPlaylists: savedPlaylistRows.length
    }
  });
}
