const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedAdminUser() {
  console.log('🔄 Memulai seeding akun Admin ke database MySQL...');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'officialstore',
      password: process.env.DB_PASSWORD || 'Jazman@271998',
      database: process.env.DB_NAME || 'officialstore',
      port: parseInt(process.env.DB_PORT || '3306', 10),
    });

    console.log('🔌 Terhubung ke database officialstore.');

    const adminPhone = '6281234567890';
    const zeroPhone = '081234567890';
    const adminEmail = 'admin@aspartech.com';
    const adminName = 'Administrator Official Store';
    const defaultPassword = 'admin123';

    // 1. Cek apakah user admin sudah ada berdasarkan nomor HP / email
    const [rows] = await connection.query(
      'SELECT user_id, role, password_hash FROM users WHERE nomor_telepon = ? OR nomor_telepon = ? OR email = ? OR user_id = 1',
      [adminPhone, zeroPhone, adminEmail]
    );

    let adminId;
    if (rows && rows.length > 0) {
      adminId = rows[0].user_id;
      // Update data agar dipastikan berpangkat 'admin' & password 'admin123'
      await connection.query(
        'UPDATE users SET nama_lengkap = ?, nomor_telepon = ?, email = ?, password_hash = ?, role = "admin", status_aktif = TRUE WHERE user_id = ?',
        [adminName, adminPhone, adminEmail, defaultPassword, adminId]
      );
      console.log(`✅ Akun Admin (ID: ${adminId}) diperbarui: ${adminName} (${adminPhone}) - Pass: ${defaultPassword}`);
    } else {
      // Insert user Admin baru
      const [result] = await connection.query(
        'INSERT INTO users (nama_lengkap, nomor_telepon, email, password_hash, role, poin_member, status_aktif) VALUES (?, ?, ?, ?, "admin", 999999, TRUE)',
        [adminName, adminPhone, adminEmail, defaultPassword]
      );
      adminId = result.insertId;
      console.log(`🎉 Akun Admin Baru Dibuat! (ID: ${adminId}) - HP: ${adminPhone} - Pass: ${defaultPassword}`);
    }

    // 2. Pastikan alamat admin tersedia di user_addresses
    const [addrRows] = await connection.query(
      'SELECT address_id FROM user_addresses WHERE user_id = ?',
      [adminId]
    );
    if (addrRows.length === 0) {
      await connection.query(
        'INSERT INTO user_addresses (user_id, label_alamat, nama_penerima, nomor_telepon, alamat_lengkap, is_utama) VALUES (?, "Kantor Pusat", ?, ?, "Jl. Perintis Kemerdekaan No. 158, Karsamenak, Kawalu, Tasikmalaya", TRUE)',
        [adminId, adminName, adminPhone]
      );
      console.log(`✅ Alamat Admin berhasil dibuat.`);
    }

    console.log('✨ Seeding Admin User selesai dengan sukses!');
    return true;
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat seeding user Admin:', error.message);
    return false;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  seedAdminUser().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = seedAdminUser;
