const http = require('http');

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  try {
    console.log('--- Setup: Login to get token ---');
    const signupRes = await request('POST', '/auth/signup', {
      name: 'AI Tester',
      email: `ai_tester_${Date.now()}@test.com`,
      password: 'password123'
    });
    const token = signupRes.data.token;
    if (!token) throw new Error('Failed to get token');

    console.log('\n--- Setup: Create Trip for AI Generation ---');
    // Let's create a 3-day trip
    const tripRes = await request('POST', '/trips', {
      name: 'AI Adventure',
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-10-04T00:00:00Z' 
    }, token);
    const tripId = tripRes.data.id;
    console.log(`Created Trip: ${tripId}`);

    console.log('\n--- 1. Testing AI Itinerary Generation (This may take 3-10 seconds) ---');
    const startTime = Date.now();
    const generateRes = await request('POST', `/trips/${tripId}/generate-itinerary`, {
      prompt: 'I want a romantic trip to Paris and Rome with lots of sightseeing and food!'
    }, token);
    const endTime = Date.now();
    
    console.log(`Response Status: ${generateRes.status}`);
    console.log(`Time taken: ${(endTime - startTime) / 1000} seconds`);
    
    if (generateRes.status === 200 && generateRes.data.stops) {
      console.log(`\nSuccess! AI generated ${generateRes.data.stops.length} stops.`);
      
      generateRes.data.stops.forEach((stop, idx) => {
        console.log(`\nStop ${idx + 1}: ${stop.city.name} (Day ${idx + 1} to Day ${idx + stop.activities.length > 0 ? stop.activities[stop.activities.length - 1].dayNumber : '?'})`);
        console.log(`  Dates: ${new Date(stop.startDate).toDateString()} - ${new Date(stop.endDate).toDateString()}`);
        console.log(`  Activities (${stop.activities.length}):`);
        
        stop.activities.forEach(sa => {
          console.log(`    - [Day ${sa.dayNumber} ${sa.timeSlot}] ${sa.activity.name} (${sa.activity.category})`);
        });
      });
    } else {
      console.error('\nFailed! AI Response:', generateRes.data);
    }

    console.log('\nPhase 4 AI Test complete!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();
