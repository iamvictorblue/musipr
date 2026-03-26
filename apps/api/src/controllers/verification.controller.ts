import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const submitSchema = z.object({
  legalName: z.string().min(2),
  artistName: z.string().min(2),
  phone: z.string().optional(),
  town: z.string().min(2),
  bio: z.string().min(10),
  socialLinks: z.record(z.string()).optional(),
  governmentIdImageUrl: z.string().url(),
  selfieImageUrl: z.string().url(),
  rightsConfirmed: z.boolean(),
  termsAccepted: z.boolean()
});

export async function submitVerification(req: AuthRequest, res: Response) {
  const body = submitSchema.parse(req.body);
  const userId = req.auth!.userId;

  const artist = await prisma.artistProfile.upsert({
    where: { userId },
    update: { artistName: body.artistName, legalName: body.legalName, town: body.town, bio: body.bio, socialLinks: body.socialLinks },
    create: { userId, artistName: body.artistName, legalName: body.legalName, town: body.town, bio: body.bio, socialLinks: body.socialLinks }
  });

  const request = await prisma.verificationRequest.create({
    data: {
      artistProfileId: artist.id,
      phone: body.phone,
      governmentIdImageUrl: body.governmentIdImageUrl,
      selfieImageUrl: body.selfieImageUrl,
      rightsConfirmed: body.rightsConfirmed,
      termsAccepted: body.termsAccepted
    }
  });

  res.status(201).json(request);
}

export async function listPending(_req: AuthRequest, res: Response) {
  const rows = await prisma.verificationRequest.findMany({ where: { status: 'PENDING' }, include: { artistProfile: true } });
  res.json(rows);
}

export async function reviewVerification(req: AuthRequest, res: Response) {
  const body = z.object({ status: z.enum(['APPROVED', 'REJECTED']), adminNotes: z.string().optional() }).parse(req.body);
  const id = z.string().parse(req.params.id);

  const vr = await prisma.verificationRequest.update({ data: { status: body.status, adminNotes: body.adminNotes, reviewedBy: req.auth!.userId, reviewedAt: new Date() }, where: { id }, include: { artistProfile: true } });

  if (body.status === 'APPROVED') {
    await prisma.user.update({ where: { id: vr.artistProfile.userId }, data: { role: 'VERIFIED_ARTIST' } });
  }

  res.json(vr);
}
