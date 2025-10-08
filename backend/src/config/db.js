/**
 * @fileoverview Database configuration and connection pool management
 * @description MySQL database connection setup with connection pooling
 * @version 1.0.0
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * MySQL connection pool configuration
 * @type {mysql.Pool}
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'cari_takip_app',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Test database connection
 * @async
 * @function testConnection
 * @description Verify database connectivity on application startup
 * @throws {Error} Database connection error
 */
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Veritabanına başarıyla bağlanıldı');
        connection.release();
    } catch (error) {
        console.error('❌ Veritabanı bağlantı hatası:', error.message);
    }
};

/**
 * Initialize database connection test
 */
testConnection();

module.exports = pool;