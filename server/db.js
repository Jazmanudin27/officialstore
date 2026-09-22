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
