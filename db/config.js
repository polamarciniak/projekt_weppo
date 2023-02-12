require('dotenv').config();

const pg = require('pg');
const isProduction = process.env.NODE_ENV === 'production';

const connectionObject = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    ssl: isProduction
}

const pool = new pg.Pool(
    isProduction ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    } : connectionObject
)

module.exports = {pool}