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
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800',
      activities: [
        { name: 'Tsukiji Outer Market Tour', category: 'food', cost: 50, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1534604973900-c4335533cb3f?auto=format&fit=crop&w=800' },
        { name: 'Senso-ji Temple Visit', category: 'culture', cost: 0, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=800' },
        { name: 'Shibuya Crossing Walk', category: 'sightseeing', cost: 0, duration: 1, imageUrl: 'https://images.unsplash.com/photo-1542051812871-75f56cc9a3af?auto=format&fit=crop&w=800' }
      ]
    },
    { 
      name: 'Kyoto', country: 'Japan', costIndex: 3, 
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800',
      activities: [
        { name: 'Traditional Tea Ceremony', category: 'culture', cost: 45, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800' },
        { name: 'Fushimi Inari Shrine Hike', category: 'sightseeing', cost: 0, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1473725841666-4c74936d5324?auto=format&fit=crop&w=800' },
        { name: 'Nishiki Market Tasting', category: 'food', cost: 30, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1583339522858-294711bfcc48?auto=format&fit=crop&w=800' }
      ]
    },
    { 
      name: 'Paris', country: 'France', costIndex: 5, 
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e907a5ea58f?auto=format&fit=crop&w=800',
      activities: [
        { name: 'Louvre Museum Tour', category: 'culture', cost: 25, duration: 4, imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800' },
        { name: 'Eiffel Tower Summit', category: 'sightseeing', cost: 35, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800' },
        { name: 'Montmartre Café Hopping', category: 'food', cost: 40, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800' }
      ]
    },
    { 
      name: 'Rome', country: 'Italy', costIndex: 4, 
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800',
      activities: [
        { name: 'Colosseum Underground Tour', category: 'sightseeing', cost: 50, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800' },
        { name: 'Vatican Museums & Sistine Chapel', category: 'culture', cost: 40, duration: 4, imageUrl: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=800' },
        { name: 'Trastevere Food Tour', category: 'food', cost: 65, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800' }
      ]
    },
    { 
      name: 'Bangkok', country: 'Thailand', costIndex: 2, 
      imageUrl: 'https://images.unsplash.com/photo-1508009603885-247a592d8471?auto=format&fit=crop&w=800',
      activities: [
        { name: 'Grand Palace Visit', category: 'culture', cost: 15, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1584949514125-9de8385db4d1?auto=format&fit=crop&w=800' },
        { name: 'Chatuchak Weekend Market', category: 'sightseeing', cost: 10, duration: 4, imageUrl: 'https://images.unsplash.com/photo-1517551062672-0199d3eeb169?auto=format&fit=crop&w=800' },
        { name: 'Chinatown Night Food Tour', category: 'food', cost: 25, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800' }
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
