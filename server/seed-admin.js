const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedAdminUser() {
  console.log('\n======================================================');
  console.log('🔄 Memulai Seeding Akun Admin ke Database MySQL...');
  console.log('======================================================\n');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'officialstore',
      password: process.env.DB_PASSWORD || 'Jazman@271998',
      database: process.env.DB_NAME || 'officialstore',
      port: parseInt(process.env.DB_PORT || '3306', 10),
    });

    console.log('🔌 Terhubung ke database MySQL "officialstore".');

    const adminAccounts = [
      {
        nama_lengkap: 'Administrator Official Store',
        nomor_telepon: '6281234567890',
        alt_phone: '081234567890',
        email: 'admin@aspartech.com',
        password_hash: 'admin123',
        role: 'admin',
        poin_member: 999999
      },
      {
        nama_lengkap: 'Admin Utama Store',
        nomor_telepon: '62895238888200',
        alt_phone: '0895238888200',
        email: 'admin@officialstore.com',
        password_hash: 'admin123',
        role: 'admin',
        poin_member: 999999
      }
    ];

    for (const admin of adminAccounts) {
      // 1. Cek apakah user admin sudah ada berdasarkan nomor HP / email
      const [rows] = await connection.query(
        'SELECT user_id, role, password_hash FROM users WHERE nomor_telepon = ? OR nomor_telepon = ? OR email = ?',
        [admin.nomor_telepon, admin.alt_phone, admin.email]
      );

      let adminId;
      if (rows && rows.length > 0) {
        adminId = rows[0].user_id;
        // Update data agar dipastikan berpangkat 'admin' & password sesuai
        await connection.query(
          'UPDATE users SET nama_lengkap = ?, nomor_telepon = ?, email = ?, password_hash = ?, role = "admin", status_aktif = TRUE WHERE user_id = ?',
          [admin.nama_lengkap, admin.nomor_telepon, admin.email, admin.password_hash, adminId]
        );
        console.log(`✅ [UPDATE] Akun Admin (ID: ${adminId}) -> HP: ${admin.nomor_telepon} | Email: ${admin.email}`);
      } else {
        // Insert user Admin baru
        const [result] = await connection.query(
          'INSERT INTO users (nama_lengkap, nomor_telepon, email, password_hash, role, poin_member, status_aktif) VALUES (?, ?, ?, ?, "admin", ?, TRUE)',
          [admin.nama_lengkap, admin.nomor_telepon, admin.email, admin.password_hash, admin.poin_member]
        );
        adminId = result.insertId;
        console.log(`🎉 [INSERT] Akun Admin Baru (ID: ${adminId}) -> HP: ${admin.nomor_telepon} | Email: ${admin.email}`);
      }

      // 2. Pastikan alamat admin tersedia di user_addresses
      const [addrRows] = await connection.query(
        'SELECT address_id FROM user_addresses WHERE user_id = ?',
        [adminId]
      );
      if (addrRows.length === 0) {
        await connection.query(
          'INSERT INTO user_addresses (user_id, label_alamat, nama_penerima, nomor_telepon, alamat_lengkap, is_utama) VALUES (?, "Kantor Pusat", ?, ?, "Jl. Perintis Kemerdekaan No. 158, Karsamenak, Kawalu, Tasikmalaya", TRUE)',
          [adminId, admin.nama_lengkap, admin.nomor_telepon]
        );
        console.log(`   📍 Alamat Kantor Pusat dibuat untuk Admin ID: ${adminId}`);
      }
    }

    console.log('\n======================================================');
    console.log('✨ Seeding Admin User Berhasil Selesai!');
    console.log('======================================================');
    console.log('🔑 KREDENSIAL LOGIN ADMIN:');
    console.log('1. Nomor HP : 081234567890 / 6281234567890');
    console.log('   Email    : admin@aspartech.com');
    console.log('   Password : admin123');
    console.log('------------------------------------------------------');
    console.log('2. Nomor HP : 0895238888200 / 62895238888200');
    console.log('   Email    : admin@officialstore.com');
    console.log('   Password : admin123');
    console.log('======================================================\n');
    return true;
  } catch (error) {
    console.error('\n❌ Terjadi kesalahan saat seeding user Admin:');
    console.error(`   Message: ${error.message}`);
    if (error.code) console.error(`   Code   : ${error.code}`);
    console.error('\n💡 Petunjuk Troubleshooting:');
    console.error('   1. Pastikan service MySQL (XAMPP / Laragon / MySQL Service) sudah berjalan.');
    console.error('   2. Pastikan database dan user MySQL sesuai dengan file .env');
    console.error('   3. Jalankan `npm run init-db` untuk membuat skema tabel terlebih dahulu.\n');
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

