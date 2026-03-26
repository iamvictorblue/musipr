import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/errors.js';

export async function createTrack(userId: string, payload: {
  title: string;
  description?: string;
  artworkUrl?: string;
  originalPath: string;
  streamPath?: string;
  visibility: 'DRAFT' | 'SCHEDULED' | 'PUBLIC' | 'PRIVATE';
  releaseDate?: string;
  ownershipConfirmed: boolean;
}) {
  const artist = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!artist) throw new ApiError(400, 'Artist profile required');

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (payload.visibility === 'PUBLIC' && user.role !== 'VERIFIED_ARTIST') {
    throw new ApiError(403, 'Only verified artists can publish public tracks');
  }

  const track = await prisma.track.create({
    data: {
      artistProfileId: artist.id,
      title: payload.title,
      description: payload.description,
      artworkUrl: payload.artworkUrl,
      visibility: payload.visibility,
      releaseDate: payload.releaseDate ? new Date(payload.releaseDate) : null,
      ownershipConfirmed: payload.ownershipConfirmed,
      files: { create: { originalPath: payload.originalPath, streamPath: payload.streamPath } }
    }
  });

  await prisma.job.create({ data: { type: 'AUDIO_TRANSCODE', payload: { trackId: track.id } } });
  if (payload.visibility === 'SCHEDULED' && payload.releaseDate) {
    await prisma.job.create({
      data: { type: 'SCHEDULED_PUBLISH', payload: { trackId: track.id }, runAt: new Date(payload.releaseDate) }
    });
  }

  return track;
}
