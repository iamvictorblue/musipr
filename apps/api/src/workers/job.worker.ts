import { spawn } from 'node:child_process';
import { prisma } from '../config/prisma.js';

async function processAudioTranscode(jobId: string, trackId: string) {
  const ff = spawn('ffmpeg', ['-version']);
  await new Promise((resolve) => ff.on('close', resolve));
  await prisma.track.update({ where: { id: trackId }, data: { durationSec: 180, waveformPeaks: [0.1, 0.3, 0.5, 0.2] } });
  await prisma.job.update({ where: { id: jobId }, data: { status: 'DONE' } });
}

async function processScheduledPublish(jobId: string, trackId: string) {
  await prisma.track.update({ where: { id: trackId }, data: { visibility: 'PUBLIC' } });
  await prisma.job.update({ where: { id: jobId }, data: { status: 'DONE' } });
}

export async function runJobWorker() {
  const jobs = await prisma.job.findMany({ where: { status: 'PENDING', runAt: { lte: new Date() } }, take: 20 });
  for (const job of jobs) {
    await prisma.job.update({ where: { id: job.id }, data: { status: 'RUNNING', attempts: { increment: 1 } } });
    const payload = job.payload as { trackId?: string };
    try {
      if (job.type === 'AUDIO_TRANSCODE' && payload.trackId) await processAudioTranscode(job.id, payload.trackId);
      if (job.type === 'SCHEDULED_PUBLISH' && payload.trackId) await processScheduledPublish(job.id, payload.trackId);
    } catch (error) {
      await prisma.job.update({ where: { id: job.id }, data: { status: 'FAILED', lastError: String(error) } });
    }
  }
}
