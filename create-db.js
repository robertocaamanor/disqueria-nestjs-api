require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'template1', // Connect to template1 since postgres db might not exist
});

async function createDatabase() {
    try {
        await client.connect();
        console.log('Connected to postgres...');

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_DATABASE}'`);
        if (res.rowCount === 0) {
            console.log(`Database '${process.env.DB_DATABASE}' does not exist. Creating...`);
            await client.query(`CREATE DATABASE "${process.env.DB_DATABASE}"`);
            console.log(`Database '${process.env.DB_DATABASE}' created successfully.`);
        } else {
            console.log(`Database '${process.env.DB_DATABASE}' already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
