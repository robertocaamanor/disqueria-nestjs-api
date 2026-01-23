const http = require('http');

// Función para hacer peticiones HTTP
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3005,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
        }

        const req = http.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        data: body ? JSON.parse(body) : null
                    };
                    resolve(response);
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testCascadeDelete() {
    console.log('=== Test de Eliminación en Cascada ===\n');

    try {
        // 1. Crear un artista
        console.log('1. Creando artista de prueba...');
        const createArtistResponse = await makeRequest('POST', '/catalog/artists', {
            name: 'Test Cascade Artist',
            country: 'Test Country'
        });
        
        if (createArtistResponse.statusCode !== 201) {
            console.error('Error al crear artista:', createArtistResponse);
            return;
        }
        
        const artistId = createArtistResponse.data.id;
        console.log(`   ✓ Artista creado con ID: ${artistId}\n`);

        // 2. Crear varios álbumes para ese artista
        console.log('2. Creando álbumes para el artista...');
        const albumsToCreate = [
            { title: 'Album 1', year: 2020, genre: 'Rock', price: 19.99, stock: 10, artistId },
            { title: 'Album 2', year: 2021, genre: 'Pop', price: 24.99, stock: 15, artistId },
            { title: 'Album 3', year: 2022, genre: 'Jazz', price: 29.99, stock: 5, artistId }
        ];

        const albumIds = [];
        for (const albumData of albumsToCreate) {
            const createAlbumResponse = await makeRequest('POST', '/catalog/albums', albumData);
            if (createAlbumResponse.statusCode === 201) {
                albumIds.push(createAlbumResponse.data.id);
                console.log(`   ✓ Álbum "${albumData.title}" creado con ID: ${createAlbumResponse.data.id}`);
            }
        }
        console.log('');

        // 3. Verificar que los álbumes existen
        console.log('3. Verificando que los álbumes existen...');
        for (const albumId of albumIds) {
            const getAlbumResponse = await makeRequest('GET', `/catalog/albums`);
            const albums = getAlbumResponse.data;
            const album = albums.find(a => a.id === albumId);
            if (album) {
                console.log(`   ✓ Álbum ID ${albumId} encontrado: "${album.title}"`);
            } else {
                console.log(`   ✗ Álbum ID ${albumId} NO encontrado`);
            }
        }
        console.log('');

        // 4. Eliminar el artista
        console.log('4. Eliminando artista...');
        const deleteArtistResponse = await makeRequest('DELETE', `/catalog/artists/${artistId}`);
        if (deleteArtistResponse.statusCode === 200) {
            console.log(`   ✓ Artista eliminado exitosamente\n`);
        } else {
            console.error('   ✗ Error al eliminar artista:', deleteArtistResponse);
            return;
        }

        // 5. Verificar que los álbumes fueron eliminados en cascada
        console.log('5. Verificando que los álbumes fueron eliminados en cascada...');
        const getAllAlbumsResponse = await makeRequest('GET', '/catalog/albums');
        const remainingAlbums = getAllAlbumsResponse.data;
        
        let cascadeSuccess = true;
        for (const albumId of albumIds) {
            const albumExists = remainingAlbums.find(a => a.id === albumId);
            if (albumExists) {
                console.log(`   ✗ Álbum ID ${albumId} TODAVÍA EXISTE (cascade delete falló)`);
                cascadeSuccess = false;
            } else {
                console.log(`   ✓ Álbum ID ${albumId} eliminado correctamente`);
            }
        }
        
        console.log('');
        if (cascadeSuccess) {
            console.log('✅ TEST EXITOSO: La eliminación en cascada funciona correctamente');
        } else {
            console.log('❌ TEST FALLIDO: La eliminación en cascada NO funcionó');
        }

    } catch (error) {
        console.error('Error durante el test:', error);
    }
}

// Ejecutar el test
testCascadeDelete();
