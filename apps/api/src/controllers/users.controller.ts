import { Response } from 'express';
import { z } from 'zod';
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

export async function getMyEngagement(req: AuthRequest, res: Response) {
  const userId = req.auth!.userId;

  const [followRows, reminderRows, savedMerchRows] = await Promise.all([
    prisma.follow.findMany({
      where: { fanUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        artist: {
          select: { id: true, artistName: true }
        }
      }
    }),
    prisma.eventReminder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: { id: true, title: true }
        }
      }
    }),
    prisma.savedMerchItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        merchItem: {
          select: { id: true, title: true }
        }
      }
    })
  ]);

  res.json({
    followedArtists: followRows.map((row) => ({
      id: row.artist.id,
      slug: slugify(row.artist.artistName),
      name: row.artist.artistName,
      followedAt: row.createdAt.toISOString()
    })),
    remindedEvents: reminderRows.map((row) => ({
      id: row.event.id,
      title: row.event.title,
      remindedAt: row.createdAt.toISOString()
    })),
    savedMerchItems: savedMerchRows.map((row) => ({
      id: row.merchItem.id,
      title: row.merchItem.title,
      savedAt: row.createdAt.toISOString()
    })),
    counts: {
      followedArtists: followRows.length,
      remindedEvents: reminderRows.length,
      savedMerchItems: savedMerchRows.length
    }
  });
}

export async function followArtistHandler(req: AuthRequest, res: Response) {
  const artistProfileId = z.string().parse(req.params.artistId);
  const userId = req.auth!.userId;

  const artist = await prisma.artistProfile.findUnique({
    where: { id: artistProfileId },
    select: { id: true }
  });

  if (!artist) {
    return res.status(404).json({ message: 'Artist not found.' });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      fanUserId_artistProfileId: { fanUserId: userId, artistProfileId }
    }
  });

  if (!existing) {
    await prisma.$transaction([
      prisma.follow.create({
        data: { fanUserId: userId, artistProfileId }
      }),
      prisma.artistProfile.update({
        where: { id: artistProfileId },
        data: { followerCount: { increment: 1 } }
      })
    ]);
  }

  return res.json({ ok: true, following: true });
}

export async function unfollowArtistHandler(req: AuthRequest, res: Response) {
  const artistProfileId = z.string().parse(req.params.artistId);
  const userId = req.auth!.userId;

  const existing = await prisma.follow.findUnique({
    where: {
      fanUserId_artistProfileId: { fanUserId: userId, artistProfileId }
    }
  });

  if (existing) {
    await prisma.$transaction([
      prisma.follow.delete({ where: { id: existing.id } }),
      prisma.artistProfile.update({
        where: { id: artistProfileId },
        data: { followerCount: { decrement: 1 } }
      })
    ]);
  }

  return res.json({ ok: true, following: false });
}

export async function remindEventHandler(req: AuthRequest, res: Response) {
  const eventId = z.string().parse(req.params.eventId);
  const userId = req.auth!.userId;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true }
  });

  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  await prisma.eventReminder.upsert({
    where: {
      userId_eventId: { userId, eventId }
    },
    update: {},
    create: { userId, eventId }
  });

  return res.json({ ok: true, reminded: true });
}

export async function unremindEventHandler(req: AuthRequest, res: Response) {
  const eventId = z.string().parse(req.params.eventId);
  const userId = req.auth!.userId;

  const existing = await prisma.eventReminder.findUnique({
    where: {
      userId_eventId: { userId, eventId }
    }
  });

  if (existing) {
    await prisma.eventReminder.delete({ where: { id: existing.id } });
  }

  return res.json({ ok: true, reminded: false });
}

export async function saveMerchHandler(req: AuthRequest, res: Response) {
  const merchItemId = z.string().parse(req.params.merchId);
  const userId = req.auth!.userId;

  const merchItem = await prisma.merchItem.findUnique({
    where: { id: merchItemId },
    select: { id: true }
  });

  if (!merchItem) {
    return res.status(404).json({ message: 'Merch item not found.' });
  }

  await prisma.savedMerchItem.upsert({
    where: {
      userId_merchItemId: { userId, merchItemId }
    },
    update: {},
    create: { userId, merchItemId }
  });

  return res.json({ ok: true, saved: true });
}

export async function unsaveMerchHandler(req: AuthRequest, res: Response) {
  const merchItemId = z.string().parse(req.params.merchId);
  const userId = req.auth!.userId;

  const existing = await prisma.savedMerchItem.findUnique({
    where: {
      userId_merchItemId: { userId, merchItemId }
    }
  });

  if (existing) {
    await prisma.savedMerchItem.delete({ where: { id: existing.id } });
  }

  return res.json({ ok: true, saved: false });
}
