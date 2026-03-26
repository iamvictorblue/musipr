import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export async function dashboard(_req: AuthRequest, res: Response) {
  const [verificationPending, openReports, totalArtists, totalTracks] = await Promise.all([
    prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
    prisma.infringementReport.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
    prisma.artistProfile.count(),
    prisma.track.count()
  ]);
  res.json({ verificationPending, openReports, totalArtists, totalTracks, estimatedRevenue: 0 });
}

export async function disableTrack(req: AuthRequest, res: Response) {
  const id = z.string().parse(req.params.id);
  const body = z.object({ reason: z.string().min(5) }).parse(req.body);
  const track = await prisma.track.update({ where: { id }, data: { isDisabled: true, disabledReason: body.reason, visibility: 'PRIVATE' } });
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, entity: 'Track', entityId: id, action: 'DISABLE', metadata: { reason: body.reason } } });
  res.json(track);
}

export async function issueStrike(req: AuthRequest, res: Response) {
  const body = z.object({ artistProfileId: z.string(), reason: z.string(), reportId: z.string().optional() }).parse(req.body);
  const strike = await prisma.artistStrike.create({ data: { ...body, issuedBy: req.auth!.userId } });
  await prisma.artistProfile.update({ where: { id: body.artistProfileId }, data: { strikeCount: { increment: 1 } } });
  res.status(201).json(strike);
}
