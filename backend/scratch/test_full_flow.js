const http = require('http');

async function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  try {
    console.log('--- Registering ---');
    const regRes = await makeRequest('/api/auth/register', { name: 'Test User', email: 'repro@example.com', password: 'password' });
    console.log('STATUS:', regRes.status, 'BODY:', regRes.body);

    console.log('\n--- Logging In ---');
    const loginRes = await makeRequest('/api/auth/login', { email: 'repro@example.com', password: 'password' });
    console.log('STATUS:', loginRes.status, 'BODY:', loginRes.body);
  } catch (err) {
    console.error('DIAGNOSTIC FAILED:', err);
  }
}

run();
