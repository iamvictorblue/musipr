import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function discoveryHome(_req: Request, res: Response) {
  const [featuredArtists, trendingTracks, newReleases, playlists, shows] = await Promise.all([
    prisma.artistProfile.findMany({ take: 6, orderBy: { followerCount: 'desc' } }),
    prisma.track.findMany({ where: { visibility: 'PUBLIC', isDisabled: false }, take: 10, orderBy: { playCount: 'desc' }, include: { artistProfile: true } }),
    prisma.release.findMany({ take: 8, orderBy: { releaseAt: 'desc' }, include: { track: true, artistProfile: true } }),
    prisma.playlist.findMany({ take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.event.findMany({ where: { startsAt: { gte: new Date() } }, take: 6, orderBy: { startsAt: 'asc' }, include: { artistProfile: true } })
  ]);

  res.json({ featuredArtists, trendingTracks, newReleases, playlists, shows, genres: await prisma.genre.findMany() });
}

export async function globalSearch(req: Request, res: Response) {
  const q = String(req.query.q ?? '');
  const [artists, tracks, playlists, shows] = await Promise.all([
    prisma.artistProfile.findMany({ where: { artistName: { contains: q, mode: 'insensitive' } }, take: 10 }),
    prisma.track.findMany({ where: { title: { contains: q, mode: 'insensitive' }, visibility: 'PUBLIC' }, take: 10 }),
    prisma.playlist.findMany({ where: { title: { contains: q, mode: 'insensitive' } }, take: 10 }),
    prisma.event.findMany({ where: { title: { contains: q, mode: 'insensitive' } }, take: 10 })
  ]);
  res.json({ artists, tracks, playlists, shows });
}
