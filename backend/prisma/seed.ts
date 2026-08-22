import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const prisma = new PrismaClient();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

async function fetchUnsplashImage(query: string, fallback: string): Promise<string> {
  if (!UNSPLASH_ACCESS_KEY) return fallback;
  try {
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: { query, per_page: 1, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    });
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular;
    }
  } catch (error) {
    console.warn(`Failed to fetch image for ${query} from Unsplash, using fallback.`);
  }
  return fallback;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting seed...');

  const cities = [
    { name: 'Tokyo', country: 'Japan', costIndex: 4, fallbackImg: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
    { name: 'Kyoto', country: 'Japan', costIndex: 3, fallbackImg: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
    { name: 'Paris', country: 'France', costIndex: 5, fallbackImg: 'https://images.unsplash.com/photo-1502602898657-3e907a5ea58f?w=800' },
    { name: 'Rome', country: 'Italy', costIndex: 4, fallbackImg: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
    { name: 'Bangkok', country: 'Thailand', costIndex: 2, fallbackImg: 'https://images.unsplash.com/photo-1508009603885-247a592d8471?w=800' }
  ];

  for (const c of cities) {
    const img = await fetchUnsplashImage(`${c.name} ${c.country} city`, c.fallbackImg);
    await delay(100); // Respect rate limit a bit

    const city = await prisma.city.create({
      data: {
        name: c.name,
        country: c.country,
        costIndex: c.costIndex,
        imageUrl: img,
        lat: 0,
        lng: 0,
      }
    });

    const activities = [
      { name: `Visit Central Museum in ${c.name}`, category: 'culture', cost: 20, duration: 2, fallbackImg: 'https://images.unsplash.com/photo-1518998053401-878c735777df?w=800' },
      { name: `Local Street Food Tour`, category: 'food', cost: 40, duration: 3, fallbackImg: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800' },
      { name: `City Highlights Walk`, category: 'sightseeing', cost: 0, duration: 4, fallbackImg: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800' },
    ];

    for (const a of activities) {
      const aImg = await fetchUnsplashImage(`${a.name}`, a.fallbackImg);
      await delay(100);
      await prisma.activity.create({
        data: {
          cityId: city.id,
          name: a.name,
          category: a.category,
          cost: a.cost,
          duration: a.duration,
          imageUrl: aImg,
          description: `Enjoy a fantastic ${a.category} experience.`
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
