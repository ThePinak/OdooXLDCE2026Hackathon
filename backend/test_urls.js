const https = require('https');

const urls = [
  'https://images.unsplash.com/photo-1502602898657-3e907a5ea58f?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1508009603885-247a592d8471?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1529253355930-ddbe423a53d1?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(url, res.statusCode);
  });
});
