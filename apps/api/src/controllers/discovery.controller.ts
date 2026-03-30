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

function formatArtist(artist: {
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
}) {
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

function formatTrack(track: {
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

function formatRelease(release: {
  id: string;
  releaseAt: Date;
  isPublished: boolean;
  notifyCount: number;
  artistProfile: { artistName: string };
  track: { title: string };
}) {
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

function formatPlaylist(playlist: {
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

function formatEvent(event: {
  id: string;
  title: string;
  venue: string;
  town: string;
  startsAt: Date;
  description: string | null;
  ticketLink: string | null;
  artistProfile: { artistName: string };
}) {
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

function formatMerch(item: {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  category: string;
  artistProfile: { artistName: string };
}) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    priceCents: item.priceCents,
    priceLabel: formatPriceLabel(item.priceCents),
    imageUrl: item.imageUrl,
    category: item.category,
    artistName: item.artistProfile.artistName,
    artistSlug: slugify(item.artistProfile.artistName)
  };
}

export async function discoveryHome(_req: Request, res: Response) {
  const [featuredArtists, trendingTracks, newReleases, playlists, shows, merch, genres] = await Promise.all([
    prisma.artistProfile.findMany({
      take: 6,
      orderBy: { followerCount: 'desc' },
      include: { genres: true, _count: { select: { tracks: true, merchItems: true, events: true } } }
    }),
    prisma.track.findMany({
      where: { visibility: 'PUBLIC', isDisabled: false },
      take: 10,
      orderBy: { playCount: 'desc' },
      include: { artistProfile: true, genre: true, _count: { select: { comments: true } } }
    }),
    prisma.release.findMany({ take: 8, orderBy: { releaseAt: 'asc' }, include: { track: true, artistProfile: true } }),
    prisma.playlist.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { ownerArtist: true, _count: { select: { tracks: true } } }
    }),
    prisma.event.findMany({ where: { startsAt: { gte: new Date() } }, take: 6, orderBy: { startsAt: 'asc' }, include: { artistProfile: true } }),
    prisma.merchItem.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { artistProfile: true } }),
    prisma.genre.findMany()
  ]);

  res.json({
    featuredArtists: featuredArtists.map((artist) => formatArtist(artist)),
    trendingTracks: trendingTracks.map((track) => formatTrack(track)),
    newReleases: newReleases.map((release) => formatRelease(release)),
    playlists: playlists.map((playlist) => formatPlaylist(playlist)),
    shows: shows.map((event) => formatEvent(event)),
    merch: merch.map((item) => formatMerch(item)),
    genres: genres.map((genre) => genre.name)
  });
}

export async function globalSearch(req: Request, res: Response) {
  const q = String(req.query.q ?? '');
  const [artists, tracks, playlists, shows, merch] = await Promise.all([
    prisma.artistProfile.findMany({
      where: { artistName: { contains: q, mode: 'insensitive' } },
      take: 10,
      include: { genres: true, _count: { select: { tracks: true, merchItems: true, events: true } } }
    }),
    prisma.track.findMany({
      where: { title: { contains: q, mode: 'insensitive' }, visibility: 'PUBLIC' },
      take: 10,
      include: { artistProfile: true, genre: true, _count: { select: { comments: true } } }
    }),
    prisma.playlist.findMany({
      where: { title: { contains: q, mode: 'insensitive' } },
      take: 10,
      include: { ownerArtist: true, _count: { select: { tracks: true } } }
    }),
    prisma.event.findMany({
      where: { title: { contains: q, mode: 'insensitive' } },
      take: 10,
      include: { artistProfile: true }
    }),
    prisma.merchItem.findMany({
      where: { title: { contains: q, mode: 'insensitive' } },
      take: 10,
      include: { artistProfile: true }
    })
  ]);
  res.json({
    artists: artists.map((artist) => formatArtist(artist)),
    tracks: tracks.map((track) => formatTrack(track)),
    playlists: playlists.map((playlist) => formatPlaylist(playlist)),
    shows: shows.map((event) => formatEvent(event)),
    merch: merch.map((item) => formatMerch(item))
  });
}
