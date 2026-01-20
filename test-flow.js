const https = require('http');

// 1. Create User
const userData = JSON.stringify({
    email: `test${Date.now()}@example.com`,
    password: 'securePassword123',
    name: 'Test Testson'
});

const userOptions = {
    hostname: '127.0.0.1',
    port: 3005,
    path: '/users',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': userData.length
    }
};

function makeRequest(label, options, data) {
    return new Promise((resolve, reject) => {
        console.log(`\n--- ${label} ---`);
        const req = https.request(options, (res) => {
            console.log(`StatusCode: ${res.statusCode}`);
            let body = '';
            res.on('data', (d) => { body += d; });
            res.on('end', () => {
                console.log('Response:', body);
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', (error) => {
            console.error(error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

(async () => {
    try {
        const user = await makeRequest('Creating User', userOptions, userData);

        // 2. Create Album (we need one for the order)
        const albumData = JSON.stringify({
            title: 'Test Album ' + Date.now(),
            year: 2024,
            genre: 'Rock',
            price: 15000,
            artistId: 1 // Assuming Artist 1 exists from previous test
        });

        const albumOptions = {
            hostname: '127.0.0.1',
            port: 3005,
            path: '/catalog/albums',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': albumData.length }
        };

        const album = await makeRequest('Creating Album', albumOptions, albumData);

        // 3. Create Order
        if (user.id && album.id) {
            const orderData = JSON.stringify({
                userId: user.id,
                items: [
                    { albumId: album.id, quantity: 2, price: album.price }
                ]
            });
            const orderOptions = {
                hostname: '127.0.0.1',
                port: 3005,
                path: '/orders',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': orderData.length }
            };
            await makeRequest('Creating Order', orderOptions, orderData);
        } else {
            console.log("Skipping Order creation because user or album failed");
        }

    } catch (err) {
        console.error("Test failed", err);
    }
})();
