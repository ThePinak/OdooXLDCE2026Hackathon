const https = require('https');
const fs = require('fs');
const path = require('path');

const destDir = path.join(__dirname, '../frontend/public/destinations');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const images = {
  'tokyo.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg',
  'kyoto.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Kinkaku-ji_Kyoto_Japan.jpg',
  'paris.jpg': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques_0022.jpg',
  'rome.jpg': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg',
  'bangkok.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Wat_Arun_at_sunset%2C_Bangkok%2C_Thailand.jpg',
  'mumbai.jpg': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Gateway_of_India_in_Mumbai.jpg',
  'delhi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/d/d3/India_Gate_in_New_Delhi_03-2016.jpg',
};

const options = {
  headers: {
    'User-Agent': 'GlobeTrotterApp/1.0 (mailto:admin@globetrotter.app)'
  }
};

Object.entries(images).forEach(([filename, url]) => {
  const filePath = path.join(destDir, filename);
  https.get(url, options, (res) => {
    if (res.statusCode === 200) {
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${filename}`);
      });
    } else if (res.statusCode === 301 || res.statusCode === 302) {
      https.get(res.headers.location, options, (res2) => {
        const fileStream = fs.createWriteStream(filePath);
        res2.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded ${filename} (Redirect)`);
        });
      });
    } else {
      console.error(`Failed to download ${filename}, status: ${res.statusCode}`);
    }
  }).on('error', err => {
    console.error(`Error downloading ${filename}: ${err.message}`);
  });
});
