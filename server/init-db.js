const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  console.log('🔄 Memulai inisialisasi database officialstore...');

  let connection;
  try {
    // 1. Konek ke server MySQL tanpa memilih database dulu (untuk membuat database jika belum ada)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'officialstore',
      password: process.env.DB_PASSWORD || 'Jazman@271998',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      multipleStatements: true,
    });

    console.log('🔌 Terhubung ke server MySQL.');

    // 2. Eksekusi file schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    console.log('✅ Skema tabel berhasil dibuat/diverifikasi.');

    // 3. Cek apakah tabel products sudah memiliki 16 produk lengkap
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM officialstore.products');
    if (rows[0].count < 16) {
      console.log(`🌱 Memperbarui data 16 produk resmi & 32 varian satuan (PCS/DUS)...`);
      const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
      await connection.query(seedSql);
      console.log('✅ 16 Produk Induk & 32 Varian Satuan (PCS / DUS) berhasil dimasukkan ke database!');
    } else {
      console.log(`ℹ️ Data 16 produk sudah lengkap (${rows[0].count} produk).`);
    }

    console.log('🎉 Inisialisasi database officialstore selesai dengan sukses!');
    return true;
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat inisialisasi database:', error.message);
    return false;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  initDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = initDatabase;
