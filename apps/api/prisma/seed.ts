import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedArtist = {
  email: string;
  password: string;
  artistName: string;
  legalName: string;
  town: string;
  bio: string;
  genres: string[];
  followerCount: number;
  monthlyListeners: number;
  merchClicks: number;
  ticketClicks: number;
  socialLinks: Record<string, string>;
};

type SeedTrack = {
  artistName: string;
  title: string;
  description: string;
  genre: string;
  durationSec: number;
  playCount: number;
  likeCount: number;
};

type SeedPlaylist = {
  title: string;
  description: string;
  moodTags: string[];
  trackTitles: string[];
};

type SeedRelease = {
  artistName: string;
  trackTitle: string;
  offsetDays: number;
  notifyCount: number;
};

type SeedEvent = {
  artistName: string;
  title: string;
  venue: string;
  town: string;
  offsetDays: number;
  description: string;
  ticketLink: string;
};

type SeedMerch = {
  artistName: string;
  title: string;
  description: string;
  priceCents: number;
  category: 'SHIRT' | 'VINYL' | 'OTHER';
  purchaseLink: string;
};

type SeedComment = {
  trackTitle: string;
  userEmail: string;
  body: string;
};

const seedGenres = [
  'Indie Boricua',
  'Caribbean Soul',
  'Alt Urbano',
  'Electro Caribe',
  'Rock Isleno',
  'Trap Caribe'
];

const artistSeeds: SeedArtist[] = [
  {
    email: 'luna.costa@musipr.local',
    password: 'ArtistPass123!',
    artistName: 'Luna Costa',
    legalName: 'Luna Rivera Costa',
    town: 'Santurce',
    bio: 'Electro indie project from Puerto Rico blending humid synths, intimate vocals, and late-night atmosphere.',
    genres: ['Indie Boricua', 'Electro Caribe'],
    followerCount: 3200,
    monthlyListeners: 12400,
    merchClicks: 312,
    ticketClicks: 188,
    socialLinks: { instagram: '@lunacosta.pr', tiktok: '@lunacosta' }
  },
  {
    email: 'marazul@musipr.local',
    password: 'ArtistPass123!',
    artistName: 'Mar Azul Colectivo',
    legalName: 'Mar Azul Colectivo LLC',
    town: 'Mayaguez',
    bio: 'A Caribbean soul collective working at the edge of folk, rhythm, and warm electronic arrangements.',
    genres: ['Caribbean Soul', 'Indie Boricua'],
    followerCount: 2800,
    monthlyListeners: 9600,
    merchClicks: 184,
    ticketClicks: 122,
    socialLinks: { instagram: '@marazulcolectivo' }
  },
  {
    email: 'callesolar@musipr.local',
    password: 'ArtistPass123!',
    artistName: 'Calle Solar',
    legalName: 'Carlos Sol Rivera',
    town: 'Ponce',
    bio: 'Alt urbano with sharp drums, guitar edges, and a little asphalt in every hook.',
    genres: ['Alt Urbano', 'Trap Caribe'],
    followerCount: 2400,
    monthlyListeners: 8100,
    merchClicks: 126,
    ticketClicks: 140,
    socialLinks: { instagram: '@callesolar' }
  },
  {
    email: 'mardefondo@musipr.local',
    password: 'ArtistPass123!',
    artistName: 'Mar de Fondo',
    legalName: 'Maria del Mar Figueroa',
    town: 'Isabela',
    bio: 'Dreamy shoreline songwriting with surf haze, cassette textures, and patient melodies.',
    genres: ['Rock Isleno', 'Indie Boricua'],
    followerCount: 1700,
    monthlyListeners: 4300,
    merchClicks: 88,
    ticketClicks: 74,
    socialLinks: { instagram: '@mardefondo' }
  }
];

const trackSeeds: SeedTrack[] = [
  {
    artistName: 'Luna Costa',
    title: 'Brisa en Loiza',
    description: 'A humid indie single built for replay and release-week discovery.',
    genre: 'Indie Boricua',
    durationSec: 198,
    playCount: 8421,
    likeCount: 612
  },
  {
    artistName: 'Calle Solar',
    title: 'Noche en Rio Piedras',
    description: 'Alt urbano pressure with sharp hooks and a late-night city pull.',
    genre: 'Alt Urbano',
    durationSec: 178,
    playCount: 5124,
    likeCount: 401
  },
  {
    artistName: 'Mar Azul Colectivo',
    title: 'Marea Lenta',
    description: 'A warm Caribbean soul build that keeps opening up on repeat.',
    genre: 'Caribbean Soul',
    durationSec: 246,
    playCount: 12004,
    likeCount: 729
  },
  {
    artistName: 'Mar de Fondo',
    title: 'Postal de Isabela',
    description: 'Slow-moving shoreline pop with a faded-camera softness.',
    genre: 'Rock Isleno',
    durationSec: 221,
    playCount: 1943,
    likeCount: 166
  }
];

const playlistSeeds: SeedPlaylist[] = [
  {
    title: 'Indie Boricua',
    description: 'Textured guitars, humid synths, and coastal melancholy.',
    moodTags: ['humid guitars', 'late-night synths', 'coastal melancholy'],
    trackTitles: ['Brisa en Loiza', 'Marea Lenta', 'Postal de Isabela']
  },
  {
    title: 'Trap y Calle',
    description: 'Hard drums, sharp hooks, and late-night momentum.',
    moodTags: ['hard drums', 'midnight hooks', 'club pressure'],
    trackTitles: ['Noche en Rio Piedras', 'Brisa en Loiza', 'Postal de Isabela']
  },
  {
    title: 'Alt Caribe',
    description: 'Forward-thinking releases shaped by island rhythm.',
    moodTags: ['island rhythms', 'warm electronics', 'editorial pick'],
    trackTitles: ['Marea Lenta', 'Brisa en Loiza', 'Noche en Rio Piedras']
  }
];

const releaseSeeds: SeedRelease[] = [
  { artistName: 'Luna Costa', trackTitle: 'Brisa en Loiza', offsetDays: 3, notifyCount: 184 },
  { artistName: 'Calle Solar', trackTitle: 'Noche en Rio Piedras', offsetDays: 8, notifyCount: 120 },
  { artistName: 'Mar Azul Colectivo', trackTitle: 'Marea Lenta', offsetDays: 12, notifyCount: 146 }
];

const eventSeeds: SeedEvent[] = [
  {
    artistName: 'Luna Costa',
    title: 'Noches en La Respuesta',
    venue: 'La Respuesta',
    town: 'Santurce',
    offsetDays: 7,
    description: 'Release-week set with visuals, merch, and the new single live.',
    ticketLink: 'https://tickets.example.com/luna-respuesta'
  },
  {
    artistName: 'Calle Solar',
    title: 'Atardecer en Ponce',
    venue: 'Parque de Bombas',
    town: 'Ponce',
    offsetDays: 10,
    description: 'An alt urbano sunset set with local support acts.',
    ticketLink: 'https://tickets.example.com/calle-solar-ponce'
  },
  {
    artistName: 'Mar Azul Colectivo',
    title: 'Muelle Sessions',
    venue: 'Muelle 13',
    town: 'Mayaguez',
    offsetDays: 14,
    description: 'Caribbean soul, guest musicians, and a long-form set by the water.',
    ticketLink: 'https://tickets.example.com/muelle-sessions'
  }
];

const merchSeeds: SeedMerch[] = [
  {
    artistName: 'Luna Costa',
    title: 'Brisa Tour Tee',
    description: 'Soft cotton tee from the Costa Norte release week run.',
    priceCents: 3000,
    category: 'SHIRT',
    purchaseLink: 'https://shop.example.com/brisa-tour-tee'
  },
  {
    artistName: 'Mar Azul Colectivo',
    title: 'Alt Caribe Vinyl',
    description: 'A smoky amber pressing for collectors in the scene.',
    priceCents: 4000,
    category: 'VINYL',
    purchaseLink: 'https://shop.example.com/alt-caribe-vinyl'
  },
  {
    artistName: 'Luna Costa',
    title: 'Santurce Poster Pack',
    description: 'Signed poster pack from the latest campaign cycle.',
    priceCents: 1800,
    category: 'OTHER',
    purchaseLink: 'https://shop.example.com/santurce-poster-pack'
  }
];

const commentSeeds: SeedComment[] = [
  { trackTitle: 'Brisa en Loiza', userEmail: 'admin@musipr.local', body: 'This one feels built for repeat plays after midnight.' },
  { trackTitle: 'Brisa en Loiza', userEmail: 'marazul@musipr.local', body: 'Love the atmosphere on this release and the way the chorus opens up.' },
  { trackTitle: 'Marea Lenta', userEmail: 'luna.costa@musipr.local', body: 'Beautiful arrangement and so much room in the mix.' },
  { trackTitle: 'Noche en Rio Piedras', userEmail: 'admin@musipr.local', body: 'The rhythm section hits immediately. Strong live-set energy here.' }
];

const librarySeeds = {
  likedTrackTitles: ['Marea Lenta', 'Brisa en Loiza', 'Noche en Rio Piedras'],
  savedTrackTitles: ['Brisa en Loiza', 'Postal de Isabela'],
  savedPlaylistTitles: ['Indie Boricua', 'Alt Caribe']
};

async function upsertUser(email: string, password: string, role: UserRole) {
  return prisma.user.upsert({
    where: { email },
    update: {
      role,
      termsAcceptedAt: new Date()
    },
    create: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      termsAcceptedAt: new Date()
    }
  });
}

async function upsertTrack(
  track: SeedTrack,
  artistId: string,
  genreId: string
) {
  const existing = await prisma.track.findFirst({
    where: {
      artistProfileId: artistId,
      title: track.title
    }
  });

  if (existing) {
    return prisma.track.update({
      where: { id: existing.id },
      data: {
        description: track.description,
        genreId,
        durationSec: track.durationSec,
        playCount: track.playCount,
        likeCount: track.likeCount,
        visibility: 'PUBLIC',
        ownershipConfirmed: true
      }
    });
  }

  return prisma.track.create({
    data: {
      artistProfileId: artistId,
      title: track.title,
      description: track.description,
      genreId,
      durationSec: track.durationSec,
      playCount: track.playCount,
      likeCount: track.likeCount,
      visibility: 'PUBLIC',
      ownershipConfirmed: true,
      files: {
        create: {
          originalPath: `artists/${artistId}/${track.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-original.mp3`,
          streamPath: `artists/${artistId}/${track.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-stream.mp3`
        }
      }
    }
  });
}

async function main() {
  for (const name of seedGenres) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
  }

  const admin = await upsertUser('admin@musipr.local', 'AdminPass123!', 'ADMIN');

  const artistProfiles = new Map<string, Awaited<ReturnType<typeof prisma.artistProfile.upsert>>>();
  const genreMap = new Map<string, string>();

  for (const artistSeed of artistSeeds) {
    const user = await upsertUser(artistSeed.email, artistSeed.password, 'VERIFIED_ARTIST');
    const genres = await prisma.genre.findMany({ where: { name: { in: artistSeed.genres } } });

    const artist = await prisma.artistProfile.upsert({
      where: { userId: user.id },
      update: {
        artistName: artistSeed.artistName,
        legalName: artistSeed.legalName,
        town: artistSeed.town,
        bio: artistSeed.bio,
        followerCount: artistSeed.followerCount,
        monthlyListeners: artistSeed.monthlyListeners,
        merchClicks: artistSeed.merchClicks,
        ticketClicks: artistSeed.ticketClicks,
        socialLinks: artistSeed.socialLinks,
        genres: { set: genres.map((genre) => ({ id: genre.id })) }
      },
      create: {
        userId: user.id,
        artistName: artistSeed.artistName,
        legalName: artistSeed.legalName,
        town: artistSeed.town,
        bio: artistSeed.bio,
        followerCount: artistSeed.followerCount,
        monthlyListeners: artistSeed.monthlyListeners,
        merchClicks: artistSeed.merchClicks,
        ticketClicks: artistSeed.ticketClicks,
        socialLinks: artistSeed.socialLinks,
        genres: { connect: genres.map((genre) => ({ id: genre.id })) }
      }
    });

    artistProfiles.set(artistSeed.artistName, artist);
  }

  const allGenres = await prisma.genre.findMany();
  for (const genre of allGenres) genreMap.set(genre.name, genre.id);

  const trackMap = new Map<string, Awaited<ReturnType<typeof prisma.track.create>>>();
  const playlistMap = new Map<string, Awaited<ReturnType<typeof prisma.playlist.create>>>();
  for (const trackSeed of trackSeeds) {
    const artist = artistProfiles.get(trackSeed.artistName);
    const genreId = genreMap.get(trackSeed.genre);
    if (!artist || !genreId) continue;

    const track = await upsertTrack(trackSeed, artist.id, genreId);
    trackMap.set(trackSeed.title, track);
  }

  for (const playlistSeed of playlistSeeds) {
    const playlist = await prisma.playlist.upsert({
      where: { id: (await prisma.playlist.findFirst({ where: { title: playlistSeed.title }, select: { id: true } }))?.id ?? 'missing-id' },
      update: {
        description: playlistSeed.description,
        moodTags: playlistSeed.moodTags,
        isEditorial: true
      },
      create: {
        title: playlistSeed.title,
        description: playlistSeed.description,
        moodTags: playlistSeed.moodTags,
        isEditorial: true
      }
    }).catch(async () => {
      const existing = await prisma.playlist.findFirst({ where: { title: playlistSeed.title } });
      if (existing) {
        return prisma.playlist.update({
          where: { id: existing.id },
          data: {
            description: playlistSeed.description,
            moodTags: playlistSeed.moodTags,
            isEditorial: true
          }
        });
      }

      return prisma.playlist.create({
        data: {
          title: playlistSeed.title,
          description: playlistSeed.description,
          moodTags: playlistSeed.moodTags,
          isEditorial: true
        }
      });
    });

    playlistMap.set(playlistSeed.title, playlist);

    for (const [index, trackTitle] of playlistSeed.trackTitles.entries()) {
      const track = trackMap.get(trackTitle);
      if (!track) continue;

      await prisma.playlistTrack.upsert({
        where: {
          playlistId_trackId: {
            playlistId: playlist.id,
            trackId: track.id
          }
        },
        update: { position: index + 1 },
        create: {
          playlistId: playlist.id,
          trackId: track.id,
          position: index + 1
        }
      });
    }
  }

  for (const releaseSeed of releaseSeeds) {
    const artist = artistProfiles.get(releaseSeed.artistName);
    const track = trackMap.get(releaseSeed.trackTitle);
    if (!artist || !track) continue;

    const releaseAt = new Date(Date.now() + releaseSeed.offsetDays * 24 * 60 * 60 * 1000);
    const existing = await prisma.release.findUnique({ where: { trackId: track.id } });

    if (existing) {
      await prisma.release.update({
        where: { id: existing.id },
        data: {
          artistProfileId: artist.id,
          releaseAt,
          notifyCount: releaseSeed.notifyCount,
          isPublished: false
        }
      });
    } else {
      await prisma.release.create({
        data: {
          artistProfileId: artist.id,
          trackId: track.id,
          releaseAt,
          notifyCount: releaseSeed.notifyCount,
          isPublished: false
        }
      });
    }
  }

  for (const eventSeed of eventSeeds) {
    const artist = artistProfiles.get(eventSeed.artistName);
    if (!artist) continue;

    const existing = await prisma.event.findFirst({
      where: {
        artistProfileId: artist.id,
        title: eventSeed.title
      }
    });

    const startsAt = new Date(Date.now() + eventSeed.offsetDays * 24 * 60 * 60 * 1000);
    if (existing) {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          venue: eventSeed.venue,
          town: eventSeed.town,
          startsAt,
          description: eventSeed.description,
          ticketLink: eventSeed.ticketLink
        }
      });
    } else {
      await prisma.event.create({
        data: {
          artistProfileId: artist.id,
          title: eventSeed.title,
          venue: eventSeed.venue,
          town: eventSeed.town,
          startsAt,
          description: eventSeed.description,
          ticketLink: eventSeed.ticketLink
        }
      });
    }
  }

  for (const merchSeed of merchSeeds) {
    const artist = artistProfiles.get(merchSeed.artistName);
    if (!artist) continue;

    const existing = await prisma.merchItem.findFirst({
      where: {
        artistProfileId: artist.id,
        title: merchSeed.title
      }
    });

    if (existing) {
      await prisma.merchItem.update({
        where: { id: existing.id },
        data: {
          description: merchSeed.description,
          priceCents: merchSeed.priceCents,
          category: merchSeed.category,
          purchaseLink: merchSeed.purchaseLink
        }
      });
    } else {
      await prisma.merchItem.create({
        data: {
          artistProfileId: artist.id,
          title: merchSeed.title,
          description: merchSeed.description,
          priceCents: merchSeed.priceCents,
          category: merchSeed.category,
          purchaseLink: merchSeed.purchaseLink
        }
      });
    }
  }

  for (const commentSeed of commentSeeds) {
    const track = trackMap.get(commentSeed.trackTitle);
    const user = await prisma.user.findUnique({ where: { email: commentSeed.userEmail } });
    if (!track || !user) continue;

    const existing = await prisma.comment.findFirst({
      where: {
        trackId: track.id,
        userId: user.id,
        body: commentSeed.body
      }
    });

    if (!existing) {
      await prisma.comment.create({
        data: {
          trackId: track.id,
          userId: user.id,
          body: commentSeed.body
        }
      });
    }
  }

  for (const trackTitle of librarySeeds.likedTrackTitles) {
    const track = trackMap.get(trackTitle);
    if (!track) continue;

    await prisma.like.upsert({
      where: {
        trackId_userId: {
          trackId: track.id,
          userId: admin.id
        }
      },
      update: {},
      create: {
        trackId: track.id,
        userId: admin.id
      }
    });
  }

  for (const trackTitle of librarySeeds.savedTrackTitles) {
    const track = trackMap.get(trackTitle);
    if (!track) continue;

    await prisma.savedTrack.upsert({
      where: {
        userId_trackId: {
          userId: admin.id,
          trackId: track.id
        }
      },
      update: {},
      create: {
        userId: admin.id,
        trackId: track.id
      }
    });
  }

  for (const playlistTitle of librarySeeds.savedPlaylistTitles) {
    const playlist = playlistMap.get(playlistTitle);
    if (!playlist) continue;

    await prisma.savedPlaylist.upsert({
      where: {
        userId_playlistId: {
          userId: admin.id,
          playlistId: playlist.id
        }
      },
      update: {},
      create: {
        userId: admin.id,
        playlistId: playlist.id
      }
    });
  }

  console.log({
    seeded: true,
    admin: admin.email,
    artists: Array.from(artistProfiles.keys()),
    tracks: Array.from(trackMap.keys())
  });
}

main().finally(() => prisma.$disconnect());
