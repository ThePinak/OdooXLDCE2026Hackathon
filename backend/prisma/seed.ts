import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Wipe old data
  await prisma.stopActivity.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.city.deleteMany();

  const destinations = [
    { 
      name: 'Tokyo', country: 'Japan', costIndex: 4, 
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg',
      activities: [
        { name: 'Tsukiji Outer Market Tour', category: 'food', cost: 50, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1534604973900-c4335533cb3f?auto=format&fit=crop&w=800' },
        { name: 'Senso-ji Temple Visit', category: 'culture', cost: 0, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=800' },
        { name: 'Shibuya Crossing Walk', category: 'sightseeing', cost: 0, duration: 1, imageUrl: 'https://images.unsplash.com/photo-1542051812871-75f56cc9a3af?auto=format&fit=crop&w=800' }
      ]
    },
    { 
      name: 'Kyoto', country: 'Japan', costIndex: 3, 
      imageUrl: 'https://images.pexels.com/photos/402028/pexels-photo-402028.jpeg?auto=compress&cs=tinysrgb&w=800',
      activities: [
        { name: 'Traditional Tea Ceremony', category: 'culture', cost: 45, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800' },
        { name: 'Fushimi Inari Shrine Hike', category: 'sightseeing', cost: 0, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1473725841666-4c74936d5324?auto=format&fit=crop&w=800' },
        { name: 'Nishiki Market Tasting', category: 'food', cost: 30, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1583339522858-294711bfcc48?auto=format&fit=crop&w=800' }
      ]
    },
    { 
      name: 'Paris', country: 'France', costIndex: 5, 
      imageUrl: 'https://images.pexels.com/photos/1461974/pexels-photo-1461974.jpeg?auto=compress&cs=tinysrgb&w=800',
      activities: [
        { name: 'Louvre Museum Tour', category: 'culture', cost: 25, duration: 4, imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800' },
        { name: 'Eiffel Tower Summit', category: 'sightseeing', cost: 35, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800' },
        { name: 'Montmartre Café Hopping', category: 'food', cost: 40, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800' }
      ]
    },
    { 
      name: 'Rome', country: 'Italy', costIndex: 4, 
      imageUrl: 'https://images.pexels.com/photos/1701595/pexels-photo-1701595.jpeg?auto=compress&cs=tinysrgb&w=800',
      activities: [
        { name: 'Colosseum Underground Tour', category: 'sightseeing', cost: 50, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800' },
        { name: 'Vatican Museums & Sistine Chapel', category: 'culture', cost: 40, duration: 4, imageUrl: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=800' },
        { name: 'Trastevere Food Tour', category: 'food', cost: 65, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800' }
      ]
    },
    { 
      name: 'Bangkok', country: 'Thailand', costIndex: 2, 
      imageUrl: 'https://images.pexels.com/photos/1682748/pexels-photo-1682748.jpeg?auto=compress&cs=tinysrgb&w=800',
      activities: [
        { name: 'Grand Palace Visit', category: 'culture', cost: 15, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1584949514125-9de8385db4d1?auto=format&fit=crop&w=800' },
        { name: 'Chatuchak Weekend Market', category: 'sightseeing', cost: 10, duration: 4, imageUrl: 'https://images.unsplash.com/photo-1517551062672-0199d3eeb169?auto=format&fit=crop&w=800' },
        { name: 'Chinatown Night Food Tour', category: 'food', cost: 25, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800' }
      ]
    },
    { 
      name: 'New Delhi', country: 'India', costIndex: 2, 
      imageUrl: 'https://images.pexels.com/photos/3579435/pexels-photo-3579435.jpeg?auto=compress&cs=tinysrgb&w=800',
      activities: [
        { name: 'Red Fort Exploration', category: 'culture', cost: 8, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1585084335487-f659d931f77d?auto=format&fit=crop&w=800' },
        { name: 'Chandni Chowk Street Food', category: 'food', cost: 15, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1589301772023-e18e80554c93?auto=format&fit=crop&w=800' },
        { name: 'India Gate Sunset Walk', category: 'sightseeing', cost: 0, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1585123334903-84f9b5c30fb3?auto=format&fit=crop&w=800' }
      ]
    },
    { 
      name: 'Mumbai', country: 'India', costIndex: 3, 
      imageUrl: 'https://images.pexels.com/photos/3290068/pexels-photo-3290068.jpeg?auto=compress&cs=tinysrgb&w=800',
      activities: [
        { name: 'Gateway of India Visit', category: 'sightseeing', cost: 0, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c682be?auto=format&fit=crop&w=800' },
        { name: 'Marine Drive Evening Stroll', category: 'sightseeing', cost: 0, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800' },
        { name: 'Colaba Causeway Shopping & Food', category: 'food', cost: 20, duration: 4, imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800' }
      ]
    }
  ];

  for (const d of destinations) {
    const city = await prisma.city.create({
      data: {
        name: d.name,
        country: d.country,
        costIndex: d.costIndex,
        imageUrl: d.imageUrl,
        lat: 0,
        lng: 0,
      }
    });

    for (const a of d.activities) {
      await prisma.activity.create({
        data: {
          cityId: city.id,
          name: a.name,
          category: a.category,
          cost: a.cost,
          duration: a.duration,
          imageUrl: a.imageUrl,
          description: `Experience the best of ${city.name} with this fantastic ${a.category} activity.`
        }
      });
    }
  }

  // Create a System User for Featured Templates
  const systemUser = await prisma.user.upsert({
    where: { email: 'editorial@globetrotter.app' },
    update: {},
    create: {
      name: 'GlobeTrotter Editorial',
      email: 'editorial@globetrotter.app',
      passwordHash: 'dummy_hash',
    }
  });

  // Wipe old templates
  await prisma.trip.deleteMany({ where: { userId: systemUser.id } });

  const allCities = await prisma.city.findMany();
  const tokyo = allCities.find((c: any) => c.name === 'Tokyo');
  const kyoto = allCities.find((c: any) => c.name === 'Kyoto');
  const paris = allCities.find((c: any) => c.name === 'Paris');
  const rome = allCities.find((c: any) => c.name === 'Rome');
  
  if (tokyo && kyoto) {
    await prisma.trip.create({
      data: {
        userId: systemUser.id,
        name: 'The Golden Route: Japan',
        description: 'Experience the perfect blend of modern Tokyo and traditional Kyoto in this classic Japanese itinerary.',
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        isPublic: true,
        publicSlug: 'golden-route-japan',
        coverImageUrl: tokyo.imageUrl,
        stops: {
          create: [
            { cityId: tokyo.id, orderIndex: 1, startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 3)) },
            { cityId: kyoto.id, orderIndex: 2, startDate: new Date(new Date().setDate(new Date().getDate() + 4)), endDate: new Date(new Date().setDate(new Date().getDate() + 7)) }
          ]
        }
      }
    });
  }

  if (paris && rome) {
    await prisma.trip.create({
      data: {
        userId: systemUser.id,
        name: 'Romantic European Getaway',
        description: 'A breathtaking journey through the most romantic capitals of Europe: Paris and Rome.',
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        isPublic: true,
        publicSlug: 'romantic-europe',
        coverImageUrl: paris.imageUrl,
        stops: {
          create: [
            { cityId: paris.id, orderIndex: 1, startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 5)) },
            { cityId: rome.id, orderIndex: 2, startDate: new Date(new Date().setDate(new Date().getDate() + 5)), endDate: new Date(new Date().setDate(new Date().getDate() + 10)) }
          ]
        }
      }
    });
  }

  const bangkok = allCities.find((c: any) => c.name === 'Bangkok');
  if (bangkok) {
    await prisma.trip.create({
      data: {
        userId: systemUser.id,
        name: 'Southeast Asia Backpacking',
        description: 'Dive into the vibrant street food culture and majestic temples of Bangkok.',
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        isPublic: true,
        publicSlug: 'sea-backpacking',
        coverImageUrl: bangkok.imageUrl,
        stops: {
          create: [
            { cityId: bangkok.id, orderIndex: 1, startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 5)) },
          ]
        }
      }
    });
  }

  const mumbai = allCities.find((c: any) => c.name === 'Mumbai');
  const delhi = allCities.find((c: any) => c.name === 'New Delhi');
  if (mumbai && delhi) {
    await prisma.trip.create({
      data: {
        userId: systemUser.id,
        name: 'Incredible India Explorer',
        description: 'Explore the bustling streets of Mumbai and the historic marvels of New Delhi.',
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 8)),
        isPublic: true,
        publicSlug: 'incredible-india',
        coverImageUrl: mumbai.imageUrl,
        stops: {
          create: [
            { cityId: mumbai.id, orderIndex: 1, startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 4)) },
            { cityId: delhi.id, orderIndex: 2, startDate: new Date(new Date().setDate(new Date().getDate() + 4)), endDate: new Date(new Date().setDate(new Date().getDate() + 8)) }
          ]
        }
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
