import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const genres = ['Reggaetón Alternativo', 'Indie Boricua', 'Bomba Fusión', 'Trap Caribe', 'Rock Isleño'];
  for (const name of genres) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
  }

  const admin = await prisma.user.upsert({
    where: { email: 'admin@musipr.local' },
    update: {},
    create: {
      email: 'admin@musipr.local',
      passwordHash: await bcrypt.hash('AdminPass123!', 10),
      role: 'ADMIN',
      termsAcceptedAt: new Date()
    }
  });

  const artistUser = await prisma.user.upsert({
    where: { email: 'luna.costa@musipr.local' },
    update: {},
    create: {
      email: 'luna.costa@musipr.local',
      passwordHash: await bcrypt.hash('ArtistPass123!', 10),
      role: 'VERIFIED_ARTIST',
      termsAcceptedAt: new Date()
    }
  });

  const artist = await prisma.artistProfile.upsert({
    where: { userId: artistUser.id },
    update: {},
    create: {
      userId: artistUser.id,
      artistName: 'Luna Costa',
      legalName: 'Luna Rivera Costa',
      town: 'Santurce',
      bio: 'Proyecto ficticio de indie electrónico desde Puerto Rico.',
      followerCount: 3200,
      monthlyListeners: 12400,
      socialLinks: { instagram: '@lunacosta.pr', tiktok: '@lunacosta' }
    }
  });

  const genre = await prisma.genre.findFirstOrThrow({ where: { name: 'Indie Boricua' } });
  await prisma.track.create({
    data: {
      artistProfileId: artist.id,
      title: 'Brisa en Loíza',
      description: 'Single demo para descubrimiento.',
      visibility: 'PUBLIC',
      ownershipConfirmed: true,
      durationSec: 198,
      playCount: 8421,
      likeCount: 612,
      genreId: genre.id,
      files: {
        create: { originalPath: 'artists/luna/track-original.mp3', streamPath: 'artists/luna/track-stream.mp3' }
      }
    }
  });

  await prisma.playlist.createMany({
    data: [
      { title: 'Indie Boricua', description: 'Selección editorial local.', isEditorial: true, moodTags: ['indie', 'night'] },
      { title: 'Trap y Calle', description: 'Ritmo urbano curado.', isEditorial: true, moodTags: ['trap', 'calle'] },
      { title: 'Alt Caribe', description: 'Texturas experimentales del Caribe.', isEditorial: true, moodTags: ['alt', 'caribe'] },
      { title: 'Rock Isleño', description: 'Guitarras desde la isla.', isEditorial: true, moodTags: ['rock'] },
      { title: 'Nuevas Voces', description: 'Nuevos talentos verificados.', isEditorial: true, moodTags: ['new'] },
      { title: 'En Vivo Esta Semana', description: 'Agenda sonora local.', isEditorial: true, moodTags: ['live'] }
    ],
    skipDuplicates: true
  });

  await prisma.event.create({
    data: {
      artistProfileId: artist.id,
      title: 'Noches en La Respuesta',
      venue: 'La Respuesta',
      town: 'Santurce',
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      description: 'Show íntimo de lanzamiento.',
      ticketLink: 'https://tickets.example.com/luna-respuesta'
    }
  });

  await prisma.merchItem.create({
    data: {
      artistProfileId: artist.id,
      title: 'Camiseta Brisa Tour',
      description: 'Camiseta edición limitada.',
      priceCents: 3000,
      category: 'SHIRT',
      purchaseLink: 'https://shop.example.com/brisa-shirt'
    }
  });

  console.log({ seeded: true, admin: admin.email, artist: artist.artistName });
}

main().finally(() => prisma.$disconnect());
