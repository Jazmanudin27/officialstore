const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'officialstore',
  password: process.env.DB_PASSWORD || 'Jazman@271998',
  database: process.env.DB_NAME || 'officialstore',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test koneksi database
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Berhasil terhubung ke database MySQL (officialstore)');
    try {
      await connection.query('ALTER TABLE users MODIFY email VARCHAR(100) DEFAULT NULL');
      await connection.query('ALTER TABLE users MODIFY password_hash VARCHAR(255) DEFAULT NULL');
      await connection.query('ALTER TABLE orders ADD COLUMN metode_pembayaran VARCHAR(100) DEFAULT NULL');
    } catch (e) {
      // Ignore alter warning
    }
    connection.release();
    return true;
  } catch (error) {
    console.warn('⚠️ Gagal terhubung ke MySQL:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};
