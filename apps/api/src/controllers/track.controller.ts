import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { createTrack } from '../services/track.service.js';

const visibilityEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLIC', 'PRIVATE']);

const createTrackSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  artworkUrl: z.string().url().optional(),
  originalPath: z.string().min(3),
  streamPath: z.string().optional(),
  visibility: visibilityEnum,
  releaseDate: z.string().datetime().optional(),
  ownershipConfirmed: z.boolean()
});

export async function createTrackHandler(req: AuthRequest, res: Response) {
  const payload = createTrackSchema.parse(req.body);
  const track = await createTrack(req.auth!.userId, payload);
  res.status(201).json(track);
}

export async function listTracks(req: AuthRequest, res: Response) {
  const q = z.object({ q: z.string().optional(), page: z.coerce.number().default(1), limit: z.coerce.number().default(20) }).parse(req.query);
  const rows = await prisma.track.findMany({
    where: { visibility: 'PUBLIC', isDisabled: false, title: q.q ? { contains: q.q, mode: 'insensitive' } : undefined },
    include: { artistProfile: true },
    skip: (q.page - 1) * q.limit,
    take: q.limit
  });
  res.json(rows);
}

export async function reportInfringement(req: AuthRequest, res: Response) {
  const payload = z.object({ trackId: z.string(), reporterEmail: z.string().email(), description: z.string().min(10), reportType: z.enum(['COPYRIGHT', 'TRADEMARK', 'HARASSMENT', 'OTHER']).default('COPYRIGHT') }).parse(req.body);
  const report = await prisma.infringementReport.create({ data: payload });
  res.status(201).json(report);
}

export async function likeTrackHandler(req: AuthRequest, res: Response) {
  const trackId = z.string().parse(req.params.id);
  const userId = req.auth!.userId;

  const existing = await prisma.like.findUnique({
    where: {
      trackId_userId: { trackId, userId }
    }
  });

  if (!existing) {
    await prisma.like.create({ data: { trackId, userId } });
    await prisma.track.update({
      where: { id: trackId },
      data: { likeCount: { increment: 1 } }
    });
  }

  res.json({ ok: true, liked: true });
}

export async function unlikeTrackHandler(req: AuthRequest, res: Response) {
  const trackId = z.string().parse(req.params.id);
  const userId = req.auth!.userId;

  const existing = await prisma.like.findUnique({
    where: {
      trackId_userId: { trackId, userId }
    }
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.track.update({
      where: { id: trackId },
      data: { likeCount: { decrement: 1 } }
    });
  }

  res.json({ ok: true, liked: false });
}

export async function saveTrackHandler(req: AuthRequest, res: Response) {
  const trackId = z.string().parse(req.params.id);
  const userId = req.auth!.userId;

  await prisma.savedTrack.upsert({
    where: {
      userId_trackId: { userId, trackId }
    },
    update: {},
    create: { userId, trackId }
  });

  res.json({ ok: true, saved: true });
}

export async function unsaveTrackHandler(req: AuthRequest, res: Response) {
  const trackId = z.string().parse(req.params.id);
  const userId = req.auth!.userId;

  const existing = await prisma.savedTrack.findUnique({
    where: {
      userId_trackId: { userId, trackId }
    }
  });

  if (existing) {
    await prisma.savedTrack.delete({ where: { id: existing.id } });
  }

  res.json({ ok: true, saved: false });
}
