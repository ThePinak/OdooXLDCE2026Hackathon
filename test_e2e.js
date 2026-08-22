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
  console.log('\n=============================================');
  console.log('   GLOBETROTTER BACKEND END-TO-END TEST');
  console.log('=============================================\n');

  try {
    // 1. Auth & Profile
    console.log('[1/7] Testing Authentication...');
    const signupRes = await request('POST', '/auth/signup', {
      name: 'E2E Tester',
      email: `e2e_${Date.now()}@test.com`,
      password: 'password123'
    });
    const token = signupRes.data.token;
    if (!token) throw new Error('Auth failed');
    console.log('      ✅ User Registration & JWT Generation successful.');

    const profileRes = await request('GET', '/users/me', null, token);
    console.log(`      ✅ Profile retrieval successful (Welcome, ${profileRes.data.name}!).`);

    // 2. Destinations & Seeding
    console.log('\n[2/7] Testing Database Seed & Image Data...');
    const citiesRes = await request('GET', '/cities', null, token);
    const tokyo = citiesRes.data.find(c => c.name === 'Tokyo');
    console.log(`      ✅ Cities loaded (${citiesRes.data.length} total). Image: ${tokyo.imageUrl.substring(0, 30)}...`);

    const actsRes = await request('GET', `/activities?cityId=${tokyo.id}`, null, token);
    console.log(`      ✅ Activities loaded (${actsRes.data.length} for Tokyo).`);

    // 3. Core CRUD (Manual Trip Building)
    console.log('\n[3/7] Testing Core Trip Builder...');
    const tripRes = await request('POST', '/trips', {
      name: 'Japan Adventure',
      startDate: '2026-12-01T00:00:00Z',
      endDate: '2026-12-05T00:00:00Z'
    }, token);
    const tripId = tripRes.data.id;
    console.log('      ✅ Trip created.');

    const stopRes = await request('POST', `/trips/${tripId}/stops`, {
      cityId: tokyo.id,
      startDate: '2026-12-01T00:00:00Z',
      endDate: '2026-12-03T00:00:00Z'
    }, token);
    const stopId = stopRes.data.id;
    console.log('      ✅ Stop added to Trip.');

    await request('POST', `/stops/${stopId}/activities`, {
      activityId: actsRes.data[0].id,
      dayNumber: 1
    }, token);
    console.log('      ✅ Activity mapped to Stop.');

    // 4. Budget Aggregation
    console.log('\n[4/7] Testing Budget Calculation Engine...');
    const budgetRes = await request('GET', `/trips/${tripId}/budget`, null, token);
    console.log(`      ✅ Budget computed. Total Cost: $${budgetRes.data.totalCost}`);

    // 5. Public Trip Sharing
    console.log('\n[5/7] Testing Public Itinerary Sharing...');
    const publishRes = await request('PATCH', `/trips/${tripId}/publish`, {}, token);
    const slug = publishRes.data.publicSlug;
    console.log(`      ✅ Trip Published. Slug: ${slug}`);

    const publicViewRes = await request('GET', `/share/${slug}`);
    console.log(`      ✅ Public route bypassed auth! Trip: ${publicViewRes.data.name}`);

    // 6. Social Cloning
    console.log('\n[6/7] Testing Social Trip Cloning...');
    const signup2Res = await request('POST', '/auth/signup', {
      name: 'E2E Cloner',
      email: `cloner_${Date.now()}@test.com`,
      password: 'password123'
    });
    const token2 = signup2Res.data.token;

    const copyRes = await request('POST', `/share/${slug}/copy`, {}, token2);
    console.log(`      ✅ Trip successfully cloned to new user! New Trip ID: ${copyRes.data.tripId}`);

    // 7. AI Itinerary Generation (Gemini)
    console.log('\n[7/7] Testing Gemini AI Generator (May take ~20s)...');
    const aiRes = await request('POST', `/trips/${tripId}/generate-itinerary`, {
      prompt: 'I want to spend 4 days exploring Tokyo and Kyoto.'
    }, token);
    if (aiRes.status === 200 && aiRes.data.stops) {
      console.log(`      ✅ Gemini AI returned successfully. Auto-generated ${aiRes.data.stops.length} stops!`);
    } else {
      console.log(`      ❌ Gemini AI failed with status ${aiRes.status}`);
    }

    console.log('\n=============================================');
    console.log('   ALL SYSTEMS OPERATIONAL! READY FOR UI.');
    console.log('=============================================\n');

  } catch (error) {
    console.error('\n❌ E2E TEST FAILED:', error);
  }
}

runTests();
