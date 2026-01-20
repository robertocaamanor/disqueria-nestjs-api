const https = require('http');

const data = JSON.stringify({
    name: 'Test Artist',
    country: 'Test Country'
});

const options = {
    hostname: '127.0.0.1',
    port: 3005,
    path: '/catalog/artists',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
