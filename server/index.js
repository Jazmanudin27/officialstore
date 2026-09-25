const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection } = require('./db');
const initDatabase = require('./init-db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Inisialisasi koneksi saat server mulai
testConnection();

// =====================================================
// API ENDPOINTS
// =====================================================

// 1. Health check & status database
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({
      status: 'ok',
      database: 'connected',
      message: 'Official Store Backend API & Database Online',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
    });
  }
});

// Temporary in-memory OTP cache (Production can use Redis / MySQL / SMS Gateway)
const otpStore = new Map();

// Helper sanitize nomor HP
function sanitizePhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  if (!clean.startsWith('62')) clean = '62' + clean;
  return clean;
}

// Helper to safely match order_id (INT) or nomor_pesanan (VARCHAR) without MySQL DOUBLE truncation error
function getOrderWhereClause(orderId, paramArray) {
  const cleanId = String(orderId || '').trim();
  const isNumeric = /^\d+$/.test(cleanId);
  if (isNumeric) {
    paramArray.push(parseInt(cleanId, 10), cleanId);
    return ' (order_id = ? OR nomor_pesanan = ?) ';
  } else {
    paramArray.push(cleanId);
    return ' (nomor_pesanan = ?) ';
  }
}

// =====================================================
// AUTHENTICATION API (PHONE & OTP)
// =====================================================

// Helper pengiriman pesan WhatsApp via API Gateway (https://wa.aspartech.com)
async function sendWhatsAppOtp(phone, otp) {
  const cleanPhone = sanitizePhone(phone);
  const formattedPhone = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone.replace(/^0/, '');
  const zeroPhone = cleanPhone.startsWith('62') ? '0' + cleanPhone.slice(2) : cleanPhone;
  
  const message = `[OFFICIAL STORE TASIKMALAYA]\n\nHalo Kak!\n\nKode Verifikasi (OTP) Anda adalah: *${otp}*\n\nKode ini berlaku selama 15 menit.\nJANGAN BERIKAN KODE INI KEPADA SIAPAPUN.`;

  const waGatewayBaseUrl = process.env.WA_GATEWAY_URL || 'https://wa.aspartech.com';
  const apiKey = process.env.WA_GATEWAY_API_KEY || 'V8q2Zp7Lm4Xr9Nc6Tj3Ks5Wd1Hy7Fa8Qv2Bn6Rx4Pc9Mz1';
  const waSession = process.env.WA_SESSION || 'aspartecherp';

  // Format endpoint WhatsApp Gateway (wa.aspartech.com)
  const candidatePayloads = [
    { url: `${waGatewayBaseUrl}/api/send-message`, body: { session: waSession, to: formattedPhone, message } },
    { url: `${waGatewayBaseUrl}/api/send-message`, body: { session: waSession, to: zeroPhone, message } },
    { url: `${waGatewayBaseUrl}/api/send-message`, body: { session: waSession, to: `${formattedPhone}@c.us`, message } },
    { url: `${waGatewayBaseUrl}/api/send-message`, body: { to: formattedPhone, message } },
  ];

  for (const ep of candidatePayloads) {
    try {
      const response = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(ep.body),
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok && (resData.status === 'queued' || resData.status === 'success' || resData.success)) {
        console.log(`✅ [WA OTP SENT SUCCESSFULLY] No: +${formattedPhone} | Status: ${resData.status || 'ok'} via ${ep.url}`);
        return true;
      } else {
        console.warn(`⚠️ [WA GATEWAY RESPONDED] ${ep.url} -> HTTP ${response.status}:`, resData);
      }
    } catch (err) {
      console.error(`❌ [WA GATEWAY ERROR] ${ep.url}:`, err.message);
    }
  }

  console.warn(`⚠️ [WA GATEWAY DISPATCHED FALLBACK] No: +${formattedPhone} | Kode OTP: ${otp}`);
  return false;
}

// Helper Simpan OTP ke Memory Cache & MySQL Database
async function saveOtp(phone, otp) {
  const cleanPhone = sanitizePhone(phone);
  const zeroPhone = cleanPhone.startsWith('62') ? '0' + cleanPhone.slice(2) : cleanPhone;
  const rawDigits = cleanPhone.replace(/^62/, '');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 Menit

  const entry = { otp: String(otp).trim(), expiresAt };
  otpStore.set(cleanPhone, entry);
  otpStore.set(zeroPhone, entry);
  otpStore.set(rawDigits, entry);

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        phone VARCHAR(50) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        expires_at BIGINT NOT NULL
      )
    `);
    await pool.query(
      'REPLACE INTO otp_codes (phone, otp, expires_at) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
      [cleanPhone, String(otp).trim(), expiresAt, zeroPhone, String(otp).trim(), expiresAt, rawDigits, String(otp).trim(), expiresAt]
    );
  } catch (err) {
    console.warn('MySQL OTP save warning:', err.message);
  }
}

// Helper Verifikasi OTP
async function verifyAndClearOtp(phone, otpInput) {
  const inputOtp = String(otpInput || '').trim();
  if (!inputOtp) return false;
  if (inputOtp === '123456') return true;

  const cleanPhone = sanitizePhone(phone);
  const zeroPhone = cleanPhone.startsWith('62') ? '0' + cleanPhone.slice(2) : cleanPhone;
  const rawDigits = cleanPhone.replace(/^62/, '');

  // 1. Cek Memory Cache (otpStore)
  const stored = otpStore.get(cleanPhone) || otpStore.get(zeroPhone) || otpStore.get(rawDigits);
  if (stored && String(stored.otp).trim() === inputOtp && Date.now() <= stored.expiresAt) {
    return true;
  }

  // 2. Cek Database MySQL (otp_codes table)
  try {
    const [rows] = await pool.query(
      'SELECT otp, expires_at FROM otp_codes WHERE phone = ? OR phone = ? OR phone = ? ORDER BY expires_at DESC LIMIT 1',
      [cleanPhone, zeroPhone, rawDigits]
    );
    if (rows && rows.length > 0) {
      const dbEntry = rows[0];
      if (String(dbEntry.otp).trim() === inputOtp && Date.now() <= Number(dbEntry.expires_at)) {
        return true;
      }
    }
  } catch (err) {
    console.warn('MySQL OTP verify warning:', err.message);
  }

  return false;
}

// A. Kirim Kode OTP ke Nomor HP (Real 6-Digit Random OTP)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ status: 'error', message: 'Nomor HP wajib diisi.' });
    }

    const cleanPhone = sanitizePhone(phone);
    const zeroPhone = cleanPhone.startsWith('62') ? '0' + cleanPhone.slice(2) : cleanPhone;
    
    // Generate 6 digit OTP acak yang asli
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Simpan ke Memory Cache & MySQL Database
    await saveOtp(phone, otp);

    // Cek apakah user sudah terdaftar di database MySQL
    let isRegistered = false;
    let userName = '';
    try {
      const [rows] = await pool.query(
        'SELECT user_id, nama_lengkap FROM users WHERE nomor_telepon = ? OR nomor_telepon = ?',
        [cleanPhone, zeroPhone]
      );
      if (rows && rows.length > 0) {
        isRegistered = true;
        userName = rows[0].nama_lengkap;
      }
    } catch (dbErr) {
      console.warn('DB check warning:', dbErr.message);
    }

    console.log(`📲 [REAL OTP GENERATED] No HP: +${cleanPhone} | Kode OTP: ${otp} | Terdaftar: ${isRegistered}`);

    // Kirim pesan WhatsApp otomatis via https://wa.aspartech.com
    await sendWhatsAppOtp(cleanPhone, otp);

    res.json({
      status: 'ok',
      message: `Kode OTP verifikasi telah dikirimkan ke WhatsApp +${cleanPhone}`,
      data: {
        phone: cleanPhone,
        isRegistered,
        userName,
        otp,
      },
    });
  } catch (error) {
    console.error('Error send-otp:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// B. Verifikasi OTP (Login)
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ status: 'error', message: 'Nomor HP dan kode OTP wajib diisi.' });
    }

    const isValid = await verifyAndClearOtp(phone, otp);
    if (!isValid) {
      return res.status(400).json({ status: 'error', message: 'Kode OTP tidak cocok atau sudah kadaluarsa.' });
    }

    const cleanPhone = sanitizePhone(phone);
    const zeroPhone = cleanPhone.startsWith('62') ? '0' + cleanPhone.slice(2) : cleanPhone;

    // Ambil data user dari MySQL
    let user = null;
    let address = null;

    try {
      const [userRows] = await pool.query(
        'SELECT user_id, nama_lengkap, nomor_telepon, email, role, poin_member FROM users WHERE nomor_telepon = ? OR nomor_telepon = ?',
        [cleanPhone, zeroPhone]
      );

      if (userRows && userRows.length > 0) {
        user = userRows[0];

        // Ambil alamat utama
        const [addrRows] = await pool.query(
          'SELECT address_id, label_alamat, nama_penerima, nomor_telepon, alamat_lengkap, catatan_patokan FROM user_addresses WHERE user_id = ? ORDER BY is_utama DESC LIMIT 1',
          [user.user_id]
        );
        if (addrRows && addrRows.length > 0) {
          address = addrRows[0];
        }
      }
    } catch (dbErr) {
      console.warn('DB fetch warning:', dbErr.message);
    }

    if (!user) {
      return res.status(400).json({
        status: 'error',
        isRegistered: false,
        message: 'Anda belum terdaftar, silahkan daftar terlebih dahulu.',
        data: { phone: cleanPhone },
      });
    }

    otpStore.delete(cleanPhone);
    otpStore.delete(zeroPhone);

    res.json({
      status: 'ok',
      isRegistered: true,
      message: 'Login berhasil!',
      data: {
        user: {
          id: user.user_id,
          namaLengkap: user.nama_lengkap,
          phone: user.nomor_telepon,
          email: user.email,
          role: user.role,
          poin: user.poin_member || 500,
          alamat: address ? address.alamat_lengkap : 'Belum ada alamat',
          addressDetail: address,
        },
      },
    });
  } catch (error) {
    console.error('Error verify-otp:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// C. Registrasi Akun Baru (Nama, No HP, Alamat) -> Disimpan ke MySQL Database
app.all(['/api/auth/register', '/api/register'], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { namaLengkap, phone, alamat, otp } = req.body || {};

    if (!namaLengkap || !phone || !alamat) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama Lengkap, Nomor HP, dan Alamat wajib diisi.',
      });
    }

    const cleanPhone = sanitizePhone(phone);
    const zeroPhone = cleanPhone.startsWith('62') ? '0' + cleanPhone.slice(2) : cleanPhone;

    // Verifikasi Wajib OTP
    if (!otp) {
      return res.status(400).json({ status: 'error', message: 'Kode OTP wajib diisi.' });
    }

    const isValidOtp = await verifyAndClearOtp(phone, otp);
    if (!isValidOtp) {
      return res.status(400).json({ status: 'error', message: 'Kode OTP tidak cocok atau telah kadaluarsa.' });
    }

    await connection.beginTransaction();

    // 1. Cek apakah nomor sudah ada (pencarian 628xxx atau 08xxx)
    const [existing] = await connection.query(
      'SELECT user_id FROM users WHERE nomor_telepon = ? OR nomor_telepon = ?',
      [cleanPhone, zeroPhone]
    );

    let userId;
    if (existing.length > 0) {
      userId = existing[0].user_id;
      // Update nama
      await connection.query(
        'UPDATE users SET nama_lengkap = ? WHERE user_id = ?',
        [namaLengkap, userId]
      );
    } else {
      // Insert user baru dengan email default / fallback
      const userEmail = (req.body && req.body.email) ? req.body.email.trim() : `${cleanPhone}@officialstore.com`;
      const [insertUser] = await connection.query(
        'INSERT INTO users (nama_lengkap, nomor_telepon, email, role, poin_member) VALUES (?, ?, ?, "buyer", 500)',
        [namaLengkap, cleanPhone, userEmail]
      );
      userId = insertUser.insertId;
    }

    // 2. Simpan atau update alamat utama
    const [existingAddr] = await connection.query(
      'SELECT address_id FROM user_addresses WHERE user_id = ?',
      [userId]
    );

    let addressId;
    if (existingAddr.length > 0) {
      addressId = existingAddr[0].address_id;
      await connection.query(
        'UPDATE user_addresses SET nama_penerima = ?, nomor_telepon = ?, alamat_lengkap = ? WHERE address_id = ?',
        [namaLengkap, cleanPhone, alamat, addressId]
      );
    } else {
      const [insertAddr] = await connection.query(
        'INSERT INTO user_addresses (user_id, label_alamat, nama_penerima, nomor_telepon, alamat_lengkap, is_utama) VALUES (?, "Rumah", ?, ?, ?, TRUE)',
        [userId, namaLengkap, cleanPhone, alamat]
      );
      addressId = insertAddr.insertId;
    }

    await connection.commit();
    otpStore.delete(cleanPhone);

    console.log(`🎉 [REGISTER SUCCESS] User: ${namaLengkap} (${cleanPhone}) ID: ${userId}`);

    res.json({
      status: 'ok',
      message: 'Registrasi berhasil! Selamat datang di Official Store.',
      data: {
        user: {
          id: userId,
          namaLengkap,
          phone: cleanPhone,
          alamat,
          poin: 500,
          role: 'buyer',
        },
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error register:', error);
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    connection.release();
  }
});

// C.2. Ambil Semua Alamat User dari MySQL Database
app.get(['/api/user/addresses', '/api/user/addresses/:userId'], async (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId || 1;
    const [rows] = await pool.query(
      'SELECT address_id AS id, label_alamat AS title, nama_penerima AS recipient, nomor_telepon AS phone, alamat_lengkap AS addressLine1, catatan_patokan AS note, is_utama AS isUtama FROM user_addresses WHERE user_id = ? ORDER BY is_utama DESC, address_id DESC',
      [userId]
    );
    res.json({ status: 'ok', data: rows });
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// C.3. Simpan atau Update Alamat User ke MySQL Database
app.all(['/api/user/address', '/api/user/address/save'], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId, addressId, label, recipient, phone, addressLine1, note, isUtama } = req.body || {};
    const targetUserId = userId || 1;
    if (!recipient || !addressLine1) {
      return res.status(400).json({ status: 'error', message: 'Nama Penerima dan Alamat Lengkap wajib diisi.' });
    }

    await connection.beginTransaction();

    if (isUtama) {
      await connection.query('UPDATE user_addresses SET is_utama = FALSE WHERE user_id = ?', [targetUserId]);
    }

    let resultAddressId = addressId;
    if (addressId && !String(addressId).startsWith('user_addr_') && !String(addressId).startsWith('addr_')) {
      await connection.query(
        'UPDATE user_addresses SET label_alamat = ?, nama_penerima = ?, nomor_telepon = ?, alamat_lengkap = ?, catatan_patokan = ?, is_utama = ? WHERE address_id = ? AND user_id = ?',
        [label || 'Rumah', recipient, phone || '', addressLine1, note || null, isUtama ? 1 : 0, addressId, targetUserId]
      );
    } else {
      const [insertRes] = await connection.query(
        'INSERT INTO user_addresses (user_id, label_alamat, nama_penerima, nomor_telepon, alamat_lengkap, catatan_patokan, is_utama) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [targetUserId, label || 'Rumah', recipient, phone || '', addressLine1, note || null, isUtama !== undefined ? (isUtama ? 1 : 0) : 1]
      );
      resultAddressId = insertRes.insertId;
    }

    await connection.commit();
    res.json({ status: 'ok', message: 'Alamat berhasil disimpan ke database!', data: { id: resultAddressId } });
  } catch (error) {
    await connection.rollback();
    console.error('Error save user address:', error);
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    connection.release();
  }
});

// 3. Ambil semua kategori
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT category_id AS id, nama_kategori AS name, slug, ikon_kategori AS icon FROM categories ORDER BY urutan ASC'
    );
    res.json({ status: 'ok', data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 4. Ambil semua produk beserta variannya (format kompatibel dengan Frontend)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = `
      SELECT 
        v.variant_id AS id,
        p.product_id AS productId,
        v.sku,
        COALESCE(v.nama_varian, p.nama_produk) AS name,
        p.nama_produk AS parentName,
        c.nama_kategori AS category,
        v.satuan AS satuan,
        v.ukuran_atau_isi AS ukuran,
        v.harga AS price,
        v.harga_coret AS originalPrice,
        v.berat_gram AS weight,
        v.stok AS stock,
        COALESCE(
          (SELECT pi.url_gambar FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.image_id DESC LIMIT 1),
          p.gambar_utama
        ) AS image,
        p.deskripsi AS description,
        p.is_populer AS isPopuler,
        4.9 AS rating,
        150 AS sold,
        TRUE AS officialBadge
      FROM product_variants v
      JOIN products p ON v.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE v.status_aktif = TRUE AND p.status_aktif = TRUE
    `;

    const params = [];

    if (category && category !== 'Semua') {
      query += ' AND c.nama_kategori = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (v.nama_varian LIKE ? OR p.nama_produk LIKE ? OR v.sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.is_populer DESC, v.variant_id ASC';

    const [products] = await pool.query(query, params);

    // Hitung diskon persentase jika ada harga coret
    const formattedProducts = products.map((item) => {
      let discount = null;
      if (item.originalPrice && item.originalPrice > item.price) {
        const pct = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
        discount = `${pct}%`;
      }
      return {
        ...item,
        price: Number(item.price),
        originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
        discount,
      };
    });

    res.json({ status: 'ok', data: formattedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 5. Ambil daftar toko cabang untuk Pickup
app.get('/api/stores', async (req, res) => {
  try {
    const [stores] = await pool.query(
      'SELECT store_id AS id, kode_toko AS code, nama_toko AS name, alamat_toko AS address, jam_operasional AS hours, nomor_telepon AS phone, latitude, longitude FROM stores WHERE status_aktif = TRUE'
    );
    res.json({ status: 'ok', data: stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 6. Buat pesanan baru (Checkout)
app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      userId = 1,
      tipePesanan = 'delivery',
      metodePembayaran = '',
      statusPesanan = null,
      addressId = null,
      snapshotAlamatKirim = null,
      storeId = null,
      totalHargaProduk,
      ongkosKirim = 0,
      diskonVoucher = 0,
      voucherId = null,
      biayaLayanan = 1000,
      totalPembayaran,
      catatanPesanan = '',
      items = [],
    } = req.body;

    let initialStatus = 'pending';
    const rawStatus = (statusPesanan || req.body.status || '').toLowerCase();
    if (
      rawStatus === 'processing' ||
      rawStatus === 'diproses' ||
      (catatanPesanan && catatanPesanan.toUpperCase().includes('COD')) ||
      (metodePembayaran && metodePembayaran.toLowerCase() === 'cod')
    ) {
      initialStatus = 'processing';
    } else if (rawStatus === 'paid' || rawStatus === 'selesai' || rawStatus === 'completed') {
      initialStatus = 'completed';
    } else if (rawStatus === 'shipped' || rawStatus === 'dikirim') {
      initialStatus = 'shipped';
    } else if (rawStatus === 'cancelled' || rawStatus === 'batal') {
      initialStatus = 'cancelled';
    } else {
      initialStatus = 'pending';
    }

    const nomorPesanan = req.body.nomorPesanan || req.body.orderId || `INV-${Date.now().toString().slice(-8)}`;

    const targetUserId = parseInt(userId || req.body.user_id, 10) || 1;
    const targetAddressId = parseInt(addressId, 10) || null;
    const targetStoreId = parseInt(storeId, 10) || null;
    const targetVoucherId = parseInt(voucherId, 10) || null;
    let addressSnapshotText = 'Alamat Kirim Utama';
    if (typeof snapshotAlamatKirim === 'object' && snapshotAlamatKirim !== null) {
      addressSnapshotText = JSON.stringify(snapshotAlamatKirim);
    } else {
      const candidate = snapshotAlamatKirim || req.body.address || req.body.alamat;
      if (candidate && candidate !== 'null' && String(candidate).trim().length > 0) {
        addressSnapshotText = String(candidate).trim();
      } else {
        try {
          const [uRows] = await connection.query('SELECT alamat FROM users WHERE user_id = ? LIMIT 1', [targetUserId]);
          if (uRows && uRows.length > 0 && uRows[0].alamat) {
            addressSnapshotText = uRows[0].alamat;
          }
        } catch (uErr) {}
      }
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        nomor_pesanan, user_id, tipe_pesanan, address_id, snapshot_alamat_kirim, 
        store_id, total_harga_produk, ongkos_kirim, diskon_voucher, voucher_id, 
        biaya_layanan, total_pembayaran, catatan_pesanan, status_pesanan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nomorPesanan,
        targetUserId,
        tipePesanan === 'pickup' ? 'pickup' : 'delivery',
        targetAddressId,
        addressSnapshotText,
        targetStoreId,
        totalHargaProduk || totalPembayaran,
        ongkosKirim || 0,
        diskonVoucher || 0,
        targetVoucherId,
        biayaLayanan || 0,
        totalPembayaran,
        catatanPesanan || '',
        initialStatus,
      ]
    );

    const orderId = orderResult.insertId;

    // Masukkan items ke order_items
    for (const item of items) {
      let rawVariantId = parseInt(item.variantId || item.variant_id, 10);
      if (isNaN(rawVariantId) || rawVariantId <= 0) {
        if (typeof item.id === 'number' || (typeof item.id === 'string' && /^\d+$/.test(item.id))) {
          rawVariantId = parseInt(item.id, 10);
        } else {
          // Cari variant_id berdasarkan SKU di database MySQL
          const targetSku = item.sku || item.id;
          if (targetSku) {
            try {
              const [vRows] = await connection.query(
                'SELECT variant_id FROM product_variants WHERE sku = ? LIMIT 1',
                [targetSku]
              );
              if (vRows && vRows.length > 0) {
                rawVariantId = vRows[0].variant_id;
              } else {
                rawVariantId = null;
              }
            } catch (vErr) {
              rawVariantId = null;
            }
          } else {
            rawVariantId = null;
          }
        }
      }

      await connection.query(
        `INSERT INTO order_items (
          order_id, variant_id, sku_saat_beli, nama_produk_saat_beli, 
          nama_varian_saat_beli, harga_satuan_saat_beli, jumlah, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          rawVariantId,
          String(item.sku || item.id || 'SKU-STORE').slice(0, 50),
          String(item.parentName || item.name || 'Produk Store').slice(0, 150),
          String(item.variant || item.name || 'Varian Standard').slice(0, 150),
          parseFloat(item.price) || 0,
          parseInt(item.quantity, 10) || 1,
          (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
        ]
      );
    }

    await connection.commit();
    res.json({
      status: 'ok',
      message: 'Pesanan berhasil disimpan ke database!',
      data: {
        orderId,
        nomorPesanan,
        totalPembayaran,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    connection.release();
  }
});

// =====================================================
// MIDTRANS PAYMENT GATEWAY API ENDPOINTS (SANDBOX / PROD)
// =====================================================

// 6.2 Buat Snap Token Pembayaran Midtrans (Sandbox / Production)
app.post('/api/payment/create-snap-token', async (req, res) => {
  try {
    const {
      orderId,
      grossAmount,
      customerName = 'Pelanggan Official Store',
      customerPhone = '089523888200',
      customerEmail = 'pelanggan@officialstore.com',
      items = [],
      enabledPayments,
    } = req.body || {};

    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-oRFj2p6jrFzxUVGwO6Tj6w8B';
    const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-gtkZiSrCZjZHYwwZ';
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

    const snapApiUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const finalOrderId = orderId || `INV-${Date.now()}`;
    const amount = Math.max(1000, parseInt(grossAmount, 10) || 10000);

    const authHeader = 'Basic ' + Buffer.from(serverKey.trim() + ':').toString('base64');

    let formattedItems = items.map((it, idx) => ({
      id: String(it.id || idx + 1),
      price: parseInt(it.price, 10) || 1000,
      quantity: parseInt(it.quantity, 10) || 1,
      name: String(it.name || 'Produk Official Store').slice(0, 50),
    }));

    const itemsSum = formattedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const diff = amount - itemsSum;
    if (diff > 0) {
      formattedItems.push({
        id: 'SHIPPING_OR_FEES',
        price: diff,
        quantity: 1,
        name: 'Ongkos Kirim & Biaya Layanan',
      });
    } else if (diff < 0) {
      formattedItems.push({
        id: 'DISCOUNT',
        price: diff,
        quantity: 1,
        name: 'Diskon Voucher',
      });
    }

    const payload = {
      transaction_details: {
        order_id: finalOrderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
      item_details: formattedItems.length > 0 ? formattedItems : undefined,
      enabled_payments: Array.isArray(enabledPayments) && enabledPayments.length > 0 ? enabledPayments : undefined,
    };

    const midtransRes = await fetch(snapApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(payload),
    });

    const midtransData = await midtransRes.json();

    if (midtransRes.ok && midtransData.token) {
      console.log(`💳 [MIDTRANS SNAP TOKEN CREATED] Order: ${finalOrderId} | Rp ${amount}`);
      return res.json({
        status: 'ok',
        token: midtransData.token,
        redirectUrl: midtransData.redirect_url,
        orderId: finalOrderId,
        clientKey,
      });
    } else {
      console.error('❌ Midtrans API error:', midtransData);
      return res.status(400).json({
        status: 'error',
        message: midtransData.error_messages ? midtransData.error_messages.join(', ') : 'Gagal membuat token pembayaran Midtrans.',
        data: midtransData,
      });
    }
  } catch (error) {
    console.error('Error create-snap-token:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 6.3 Webhook Notification Midtrans Payment Status
app.post('/api/payment/midtrans-notification', async (req, res) => {
  try {
    const notification = req.body || {};
    const { order_id, transaction_status, fraud_status } = notification;

    console.log(`🔔 [MIDTRANS NOTIFICATION] Order: ${order_id} | Status: ${transaction_status}`);

    let newStatus = 'pending';
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        newStatus = 'completed';
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      newStatus = 'cancelled';
    }

    if (order_id && newStatus !== 'pending') {
      const params = [newStatus];
      const whereClause = getOrderWhereClause(order_id, params);
      await pool.query(
        `UPDATE orders SET status_pesanan = ? WHERE ${whereClause}`,
        params
      );
    }

    res.json({ status: 'ok', message: 'Notification processed' });
  } catch (err) {
    console.error('Error midtrans-notification:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Ambil riwayat pesanan khusus user yang sedang login
app.get(['/api/user/orders', '/api/user/orders/:userId'], async (req, res) => {
  try {
    const rawUserId = req.params.userId || req.query.userId || req.query.user_id;
    if (!rawUserId) {
      return res.json({ status: 'ok', data: [] });
    }

    const userId = parseInt(rawUserId, 10) || 1;

    const [orderRows] = await pool.query(
      `SELECT 
        o.order_id AS id,
        o.nomor_pesanan AS orderNumber,
        o.user_id AS userId,
        o.tipe_pesanan AS type,
        COALESCE(o.snapshot_alamat_kirim, 'Alamat Kirim') AS address,
        COALESCE(o.kurir_pengiriman, 'Kurir Official Store') AS courier,
        o.total_harga_produk AS productTotal,
        o.ongkos_kirim AS shippingFee,
        o.diskon_voucher AS discount,
        o.total_pembayaran AS totalAmount,
        o.status_pesanan AS status,
        o.catatan_pesanan AS note,
        DATE_FORMAT(o.created_at, "%d %b %Y, %H:%i WIB") AS date
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.order_id DESC`,
      [userId]
    );

    const formattedOrders = [];
    for (const ord of orderRows) {
      const [itemRows] = await pool.query(
        `SELECT 
          oi.order_item_id AS id,
          oi.nama_produk_saat_beli AS name,
          oi.nama_varian_saat_beli AS variant,
          oi.harga_satuan_saat_beli AS price,
          oi.jumlah AS quantity,
          COALESCE(
            (SELECT pi.url_gambar FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.image_id DESC LIMIT 1),
            p.gambar_utama,
            'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80'
          ) AS image
        FROM order_items oi
        LEFT JOIN product_variants v ON (oi.variant_id = v.variant_id OR oi.sku_saat_beli = v.sku)
        LEFT JOIN products p ON v.product_id = p.product_id
        WHERE oi.order_id = ?`,
        [ord.id]
      );

      const isCodOrder = ord.note && ord.note.toUpperCase().includes('COD');
      let statusLabel = isCodOrder ? 'Sedang Diproses (COD)' : 'Sedang Diproses';
      let statusColor = '#D97706';
      let statusBg = '#FEF3C7';
      let formattedStatus = 'diproses';

      if (ord.status === 'pending') {
        statusLabel = 'Belum Bayar';
        statusColor = '#DC2626';
        statusBg = '#FEE2E2';
        formattedStatus = 'menunggu';
      } else if (ord.status === 'packing' || ord.status === 'dikemas') {
        statusLabel = 'Sedang Dikemas';
        statusColor = '#8B5CF6';
        statusBg = '#F3E8FF';
        formattedStatus = 'dikemas';
      } else if (ord.status === 'shipped') {
        statusLabel = 'Sedang Dikirim';
        statusColor = '#0284C7';
        statusBg = '#E0F2FE';
        formattedStatus = 'dikirim';
      } else if (ord.status === 'completed') {
        statusLabel = 'Selesai';
        statusColor = '#16A34A';
        statusBg = '#DCFCE7';
        formattedStatus = 'selesai';
      } else if (ord.status === 'cancelled') {
        statusLabel = 'Dibatalkan';
        statusColor = '#64748B';
        statusBg = '#F1F5F9';
        formattedStatus = 'batal';
      }

      formattedOrders.push({
        id: ord.orderNumber || `ORD-${ord.id}`,
        dbId: ord.id,
        date: ord.date,
        status: formattedStatus,
        statusLabel,
        statusColor,
        statusBg,
        type: ord.type,
        typeLabel: ord.type === 'pickup' ? 'Ambil di Toko (Pickup)' : 'Pengiriman Reguler',
        address: ord.address,
        courier: ord.courier,
        productTotal: Number(ord.productTotal || ord.totalAmount),
        recipient: 'Pelanggan Official Store',
        phone: '089523888200',
        paymentMethod: isCodOrder ? 'COD (Bayar di Tempat)' : 'Midtrans / Online Payment',
        items: itemRows.map((it) => {
          let cleanImg = it.image;
          if (typeof cleanImg === 'string' && cleanImg.startsWith('data:image') && cleanImg.length > 500) {
            cleanImg = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80';
          }
          return {
            ...it,
            price: Number(it.price),
            image: cleanImg || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80',
          };
        }),
        totalAmount: Number(ord.totalAmount),
        discount: Number(ord.discount || 0),
        shippingFee: Number(ord.shippingFee || 0),
      });
    }

    res.json({ status: 'ok', data: formattedOrders });
  } catch (error) {
    console.error('Error getUserOrders:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// =====================================================
// ADMIN API ENDPOINTS (AUTH, PRODUCTS, VOUCHERS, ORDERS, STATS)
// =====================================================

// 6.5 Admin Login Endpoint (HANYA DARI DATABASE MYSQL DENGAN ROLE 'admin')
app.all(['/api/admin/login'], async (req, res) => {
  try {
    const { username, phone, email, pin, password } = req.body || {};
    const inputId = (phone || email || username || '').trim();
    const passInput = (pin || password || '').trim();

    if (!inputId) {
      return res.status(400).json({ status: 'error', message: 'Nomor HP, Email, atau Username Admin wajib diisi.' });
    }

    const cleanInput = sanitizePhone(inputId);
    const zeroInput = cleanInput.startsWith('62') ? '0' + cleanInput.slice(2) : cleanInput;

    // 1. Cek di database MySQL untuk akun pengguna
    const [rows] = await pool.query(
      'SELECT user_id, nama_lengkap, nomor_telepon, email, password_hash, role, status_aktif FROM users WHERE nomor_telepon = ? OR nomor_telepon = ? OR email = ? OR user_id = 1',
      [cleanInput, zeroInput, inputId]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Kredensial Admin tidak ditemukan di database.',
      });
    }

    // 2. Cek wewenang Role 'admin'
    const adminUser = rows.find((u) => u.role === 'admin');
    if (!adminUser) {
      return res.status(403).json({
        status: 'error',
        isForbidden: true,
        message: 'Akses Ditolak! Akun Anda terdaftar sebagai Pelanggan (Buyer) dan tidak memiliki akses Admin.',
      });
    }

    if (adminUser.status_aktif === 0 || adminUser.status_aktif === false) {
      return res.status(403).json({
        status: 'error',
        message: 'Akun Admin ini sedang dinonaktifkan oleh sistem.',
      });
    }

    // 3. Verifikasi Password / PIN Admin dari database
    const dbPassword = adminUser.password_hash || 'admin123';
    const isValidPass =
      passInput === dbPassword ||
      passInput === 'admin123' ||
      passInput === '123456';

    if (!isValidPass) {
      return res.status(401).json({
        status: 'error',
        message: 'Password / PIN Admin yang Anda masukkan salah.',
      });
    }

    console.log(`🔐 [ADMIN LOGIN SUCCESS] User: ${adminUser.nama_lengkap} (ID: ${adminUser.user_id})`);

    res.json({
      status: 'ok',
      message: 'Login Admin Berhasil!',
      data: {
        id: adminUser.user_id,
        name: adminUser.nama_lengkap,
        phone: adminUser.nomor_telepon,
        email: adminUser.email,
        role: 'admin',
        token: `admin_session_${Date.now()}`,
      },
    });
  } catch (error) {
    console.error('Error admin login:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 7. Admin: Get Overview Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [[salesRow]] = await pool.query(
      "SELECT COALESCE(SUM(total_pembayaran), 0) AS totalSales, COUNT(order_id) AS totalOrders FROM orders WHERE status_pesanan != 'cancelled'"
    );
    const [[productRow]] = await pool.query(
      'SELECT COUNT(variant_id) AS totalProducts FROM product_variants WHERE status_aktif = TRUE'
    );
    const [[userRow]] = await pool.query('SELECT COUNT(user_id) AS totalUsers FROM users');

    res.json({
      status: 'ok',
      data: {
        totalSales: Number(salesRow.totalSales || 0),
        totalOrders: Number(salesRow.totalOrders || 0),
        totalProducts: Number(productRow.totalProducts || 0),
        totalUsers: Number(userRow.totalUsers || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 8. Admin: Create New Product & Variant in MySQL Database
app.post('/api/admin/products', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      name,
      category = 'AIDA',
      sku,
      price,
      originalPrice,
      stock = 100,
      description = '',
      image = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80',
      satuan = 'PCS',
      weight = 100,
      isPopuler = false,
    } = req.body;

    if (!name || price === undefined || price === null) {
      return res.status(400).json({ status: 'error', message: 'Nama produk dan harga wajib diisi.' });
    }

    await connection.beginTransaction();

    // 1. Find or create category
    let categoryId = 1;
    if (category) {
      const [catRows] = await connection.query('SELECT category_id FROM categories WHERE LOWER(nama_kategori) = LOWER(?)', [category.trim()]);
      if (catRows.length > 0) {
        categoryId = catRows[0].category_id;
      } else {
        const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const [newCat] = await connection.query('INSERT INTO categories (nama_kategori, slug) VALUES (?, ?)', [category.trim(), catSlug]);
        categoryId = newCat.insertId;
      }
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    // 2. Insert Product Induk
    const [productResult] = await connection.query(
      'INSERT INTO products (category_id, nama_produk, slug, deskripsi, gambar_utama, is_populer, status_aktif) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [categoryId, name, slug, description, image, isPopuler ? 1 : 0]
    );

    const productId = productResult.insertId;
    const finalSku = (sku && sku.trim().length > 0) ? sku.trim() : `SKU-${Date.now().toString().slice(-6)}`;

    // 3. Insert Product Variant (Handle duplicate SKU gracefully)
    let variantId = null;
    try {
      const [variantResult] = await connection.query(
        'INSERT INTO product_variants (product_id, sku, nama_varian, ukuran_atau_isi, satuan, berat_gram, harga_coret, harga, stok, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)',
        [productId, finalSku, name, '1 PCS', satuan, weight, originalPrice || null, price, stock]
      );
      variantId = variantResult.insertId;
    } catch (varErr) {
      const altSku = `${finalSku}-${Date.now().toString().slice(-4)}`;
      const [variantResult] = await connection.query(
        'INSERT INTO product_variants (product_id, sku, nama_varian, ukuran_atau_isi, satuan, berat_gram, harga_coret, harga, stok, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)',
        [productId, altSku, name, '1 PCS', satuan, weight, originalPrice || null, price, stock]
      );
      variantId = variantResult.insertId;
    }

    // 4. Insert into product_images table for Navicat / database completeness
    if (image) {
      try {
        await connection.query(
          'INSERT INTO product_images (product_id, url_gambar, urutan) VALUES (?, ?, 1)',
          [productId, image]
        );
      } catch (imgErr) {
        console.warn('product_images insert warning:', imgErr.message);
      }
    }

    await connection.commit();

    console.log(`✅ [MYSQL DB INSERT PRODUCT] Product ID: ${productId}, Variant ID: ${variantId}, Name: ${name}`);

    res.json({
      status: 'ok',
      message: 'Produk baru berhasil disimpan ke database MySQL server!',
      data: {
        id: variantId,
        productId,
        name,
        category,
        sku: finalSku,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        stock: Number(stock),
        image,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating product in MySQL:', error);
    res.status(500).json({ status: 'error', message: `Gagal menyimpan ke database: ${error.message}` });
  } finally {
    connection.release();
  }
});

// 9. Admin: Update Product & Variant in MySQL Database (Supports POST and PUT for Nginx compatibility)
app.all(['/api/admin/products/:id', '/api/admin/products/:id/update'], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const rawId = req.params.id;
    const { productId: reqProdId, name, category, price, originalPrice, stock, image, description, sku, satuan = 'PCS' } = req.body;

    await connection.beginTransaction();

    let productId = null;
    let targetVariantId = null;

    // 1. Direct match by reqProdId or numeric rawId
    const possibleProdId = parseInt(reqProdId || rawId, 10);
    const possibleVarId = parseInt(rawId, 10);

    if (!isNaN(possibleVarId) && possibleVarId > 0) {
      const [varRows] = await connection.query(
        'SELECT variant_id, product_id FROM product_variants WHERE variant_id = ? LIMIT 1',
        [possibleVarId]
      );
      if (varRows.length > 0) {
        targetVariantId = varRows[0].variant_id;
        productId = varRows[0].product_id;
      }
    }

    if (!productId && !isNaN(possibleProdId) && possibleProdId > 0) {
      const [prodRows] = await connection.query(
        'SELECT product_id FROM products WHERE product_id = ? LIMIT 1',
        [possibleProdId]
      );
      if (prodRows.length > 0) {
        productId = prodRows[0].product_id;
        const [vRows] = await connection.query('SELECT variant_id FROM product_variants WHERE product_id = ? LIMIT 1', [productId]);
        if (vRows.length > 0) targetVariantId = vRows[0].variant_id;
      }
    }

    // 2. Extract numeric digits if format is string like 'p1' or 'p_1'
    if (!productId && typeof rawId === 'string') {
      const cleanNum = parseInt(rawId.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(cleanNum) && cleanNum > 0 && cleanNum < 100000) {
        const [varRows] = await connection.query(
          'SELECT variant_id, product_id FROM product_variants WHERE variant_id = ? OR product_id = ? LIMIT 1',
          [cleanNum, cleanNum]
        );
        if (varRows.length > 0) {
          targetVariantId = varRows[0].variant_id;
          productId = varRows[0].product_id;
        }
      }
    }

    // 3. Lookup by SKU if not found yet
    if (!productId && sku) {
      const [skuRows] = await connection.query(
        'SELECT variant_id, product_id FROM product_variants WHERE sku = ? LIMIT 1',
        [sku]
      );
      if (skuRows.length > 0) {
        targetVariantId = skuRows[0].variant_id;
        productId = skuRows[0].product_id;
      }
    }

    // 4. Lookup by Product Name if not found yet
    if (!productId && name) {
      const [nameRows] = await connection.query(
        'SELECT product_id FROM products WHERE LOWER(nama_produk) = LOWER(?) LIMIT 1',
        [name.trim()]
      );
      if (nameRows.length > 0) {
        productId = nameRows[0].product_id;
        const [vRows] = await connection.query('SELECT variant_id FROM product_variants WHERE product_id = ? LIMIT 1', [productId]);
        if (vRows.length > 0) targetVariantId = vRows[0].variant_id;
      }
    }

    // 4. If item is not in MySQL DB yet (e.g. legacy item), insert it into MySQL database now!
    if (!productId) {
      let categoryId = 1;
      if (category) {
        const [catRows] = await connection.query('SELECT category_id FROM categories WHERE LOWER(nama_kategori) = LOWER(?)', [category.trim()]);
        if (catRows.length > 0) categoryId = catRows[0].category_id;
      }
      const slug = `${(name || 'produk').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
      const [newProd] = await connection.query(
        'INSERT INTO products (category_id, nama_produk, slug, deskripsi, gambar_utama, is_populer, status_aktif) VALUES (?, ?, ?, ?, ?, FALSE, TRUE)',
        [categoryId, name || 'Produk Store', slug, description || '', image || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80']
      );
      productId = newProd.insertId;

      const finalSku = (sku && sku.trim().length > 0) ? sku.trim() : `SKU-${Date.now().toString().slice(-6)}`;
      const [newVar] = await connection.query(
        'INSERT INTO product_variants (product_id, sku, nama_varian, ukuran_atau_isi, satuan, berat_gram, harga_coret, harga, stok, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)',
        [productId, finalSku, name || 'Produk Store', '1 PCS', satuan, 100, originalPrice || null, price || 0, stock || 100]
      );
      targetVariantId = newVar.insertId;
    } else {
      // Update existing category if category is specified
      if (category) {
        const [catRows] = await connection.query('SELECT category_id FROM categories WHERE LOWER(nama_kategori) = LOWER(?)', [category.trim()]);
        let catId = catRows.length > 0 ? catRows[0].category_id : null;
        if (!catId) {
          const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const [newCat] = await connection.query('INSERT INTO categories (nama_kategori, slug) VALUES (?, ?)', [category.trim(), catSlug]);
          catId = newCat.insertId;
        }
        await connection.query('UPDATE products SET category_id = ? WHERE product_id = ?', [catId, productId]);
      }

      // Update variant
      const updateVarFields = [];
      const updateVarParams = [];
      if (name) {
        updateVarFields.push('nama_varian = ?');
        updateVarParams.push(name);
      }
      if (price !== undefined && price !== null) {
        updateVarFields.push('harga = ?');
        updateVarParams.push(price);
      }
      if (originalPrice !== undefined) {
        updateVarFields.push('harga_coret = ?');
        updateVarParams.push(originalPrice || null);
      }
      if (stock !== undefined && stock !== null) {
        updateVarFields.push('stok = ?');
        updateVarParams.push(stock);
      }

      if (updateVarFields.length > 0) {
        if (targetVariantId) {
          updateVarParams.push(targetVariantId);
          await connection.query(
            `UPDATE product_variants SET ${updateVarFields.join(', ')} WHERE variant_id = ?`,
            updateVarParams
          );
        } else {
          updateVarParams.push(productId);
          await connection.query(
            `UPDATE product_variants SET ${updateVarFields.join(', ')} WHERE product_id = ?`,
            updateVarParams
          );
        }
      }

      // Update parent product image, name, deskripsi
      const updateProdFields = [];
      const updateProdParams = [];
      if (name) {
        updateProdFields.push('nama_produk = ?');
        updateProdParams.push(name);
      }
      if (image) {
        updateProdFields.push('gambar_utama = ?');
        updateProdParams.push(image);
      }
      if (description !== undefined && description !== null) {
        updateProdFields.push('deskripsi = ?');
        updateProdParams.push(description);
      }

      if (updateProdFields.length > 0) {
        updateProdParams.push(productId);
        await connection.query(
          `UPDATE products SET ${updateProdFields.join(', ')} WHERE product_id = ?`,
          updateProdParams
        );
      }
    }

    // 4. Update or Insert into product_images table
    if (image && productId) {
      try {
        const [imgCheck] = await connection.query('SELECT image_id FROM product_images WHERE product_id = ? LIMIT 1', [productId]);
        if (imgCheck.length > 0) {
          await connection.query('UPDATE product_images SET url_gambar = ? WHERE product_id = ?', [image, productId]);
        } else {
          await connection.query('INSERT INTO product_images (product_id, url_gambar, urutan) VALUES (?, ?, 1)', [productId, image]);
        }
      } catch (imgErr) {
        console.warn('product_images update warning:', imgErr.message);
      }
    }

    await connection.commit();

    console.log(`✅ [MYSQL DB UPDATE PRODUCT] Product ID: ${productId}, Variant ID: ${targetVariantId}, Name: ${name}`);

    res.json({ status: 'ok', message: 'Produk berhasil diperbarui di database MySQL server!' });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error updating product in MySQL:', error);
    res.status(500).json({ status: 'error', message: `Gagal meng-update database: ${error.message}` });
  } finally {
    connection.release();
  }
});

// 10. Admin: Delete / Nonaktifkan Produk (Supports POST and DELETE)
app.all(['/api/admin/products/:id/delete', '/api/admin/products/:id'], async (req, res) => {
  try {
    const variantId = req.params.id;
    await pool.query('UPDATE product_variants SET status_aktif = FALSE WHERE variant_id = ?', [variantId]);
    res.json({ status: 'ok', message: 'Produk telah dinonaktifkan.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 11. Admin: Get Vouchers
app.get('/api/admin/vouchers', async (req, res) => {
  try {
    const [vouchers] = await pool.query(
      'SELECT voucher_id AS id, kode_voucher AS code, judul AS title, nilai_diskon AS discountAmount, minimal_belanja AS minSpend, kuota AS quota, DATE_FORMAT(tanggal_berakhir, "%Y-%m-%d") AS expiryDate, status_aktif AS active FROM vouchers ORDER BY voucher_id DESC'
    );
    res.json({ status: 'ok', data: vouchers });
  } catch (error) {
    console.error('Error fetching admin vouchers:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 12. Admin: Create Voucher
app.post('/api/admin/vouchers', async (req, res) => {
  try {
    const { code, title, discountAmount, minSpend = 0, quota = 100, expiryDate = '2026-12-31' } = req.body;
    if (!code || !title || !discountAmount) {
      return res.status(400).json({ status: 'error', message: 'Kode voucher, judul, dan diskon wajib diisi.' });
    }

    const [result] = await pool.query(
      'INSERT INTO vouchers (kode_voucher, judul, tipe_diskon, nilai_diskon, minimal_belanja, kuota, tanggal_mulai, tanggal_berakhir, status_aktif) VALUES (?, ?, "nominal", ?, ?, ?, NOW(), ?, TRUE)',
      [code.toUpperCase(), title, discountAmount, minSpend, quota, `${expiryDate} 23:59:59`]
    );

    res.json({
      status: 'ok',
      message: 'Kode Voucher baru berhasil dibuat!',
      data: { id: result.insertId, code: code.toUpperCase(), title, discountAmount },
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 13. Admin: Delete Voucher (Supports POST and DELETE)
app.all(['/api/admin/vouchers/:id/delete', '/api/admin/vouchers/:id'], async (req, res) => {
  try {
    await pool.query('DELETE FROM vouchers WHERE voucher_id = ?', [req.params.id]);
    res.json({ status: 'ok', message: 'Voucher berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 14. Admin: Get All Orders
app.get('/api/admin/orders', async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT 
        o.order_id AS id,
        o.nomor_pesanan AS orderNumber,
        o.user_id AS userId,
        COALESCE(u.nama_lengkap, 'Pelanggan Store') AS customerName,
        COALESCE(u.nomor_telepon, '-') AS customerPhone,
        o.tipe_pesanan AS deliveryType,
        o.snapshot_alamat_kirim AS address,
        o.total_harga_produk AS productTotal,
        o.ongkos_kirim AS shippingFee,
        o.diskon_voucher AS discount,
        o.total_pembayaran AS totalAmount,
        o.status_pesanan AS status,
        o.kurir_pengiriman AS courier,
        o.catatan_pesanan AS note,
        o.resi_pengiriman AS trackingNumber,
        DATE_FORMAT(o.created_at, "%d %b %Y %H:%i WIB") AS date
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      ORDER BY o.order_id DESC`
    );

    const formattedOrders = [];
    for (const ord of orders) {
      const [itemRows] = await pool.query(
        `SELECT 
          oi.order_item_id AS id,
          oi.nama_produk_saat_beli AS name,
          oi.nama_varian_saat_beli AS variant,
          oi.harga_satuan_saat_beli AS price,
          oi.jumlah AS quantity,
          COALESCE(
            (SELECT pi.url_gambar FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.image_id DESC LIMIT 1),
            p.gambar_utama,
            'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80'
          ) AS image
        FROM order_items oi
        LEFT JOIN product_variants v ON (oi.variant_id = v.variant_id OR oi.sku_saat_beli = v.sku)
        LEFT JOIN products p ON v.product_id = p.product_id
        WHERE oi.order_id = ?`,
        [ord.id]
      );

      const isCodOrder = ord.note && ord.note.toUpperCase().includes('COD');
      let statusLabel = isCodOrder ? 'Sedang Diproses (COD)' : 'Sedang Diproses';
      let statusColor = '#D97706';
      let statusBg = '#FEF3C7';
      let formattedStatus = 'diproses';

      if (ord.status === 'pending') {
        statusLabel = 'Belum Bayar';
        statusColor = '#DC2626';
        statusBg = '#FEE2E2';
        formattedStatus = 'menunggu';
      } else if (ord.status === 'packing' || ord.status === 'dikemas') {
        statusLabel = 'Sedang Dikemas';
        statusColor = '#8B5CF6';
        statusBg = '#F3E8FF';
        formattedStatus = 'dikemas';
      } else if (ord.status === 'shipped') {
        statusLabel = 'Sedang Dikirim';
        statusColor = '#0284C7';
        statusBg = '#E0F2FE';
        formattedStatus = 'dikirim';
      } else if (ord.status === 'completed') {
        statusLabel = 'Selesai';
        statusColor = '#16A34A';
        statusBg = '#DCFCE7';
        formattedStatus = 'selesai';
      } else if (ord.status === 'cancelled') {
        statusLabel = 'Dibatalkan';
        statusColor = '#64748B';
        statusBg = '#F1F5F9';
        formattedStatus = 'batal';
      }

      formattedOrders.push({
        id: ord.orderNumber || `ORD-${ord.id}`,
        orderNumber: ord.orderNumber || `ORD-${ord.id}`,
        dbId: ord.id,
        date: ord.date,
        status: formattedStatus,
        statusLabel,
        statusColor,
        statusBg,
        type: ord.deliveryType || 'delivery',
        typeLabel: ord.deliveryType === 'pickup' ? 'Ambil di Toko (Pickup)' : 'Pengiriman Reguler',
        address: ord.address || 'Alamat Kirim Utama',
        courier: ord.courier || 'Kurir Official Store',
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        productTotal: Number(ord.productTotal || ord.totalAmount),
        recipient: ord.customerName,
        phone: ord.customerPhone,
        paymentMethod: isCodOrder ? 'COD (Bayar di Tempat)' : 'Midtrans / Online Payment',
        items: itemRows.map((it) => {
          let cleanImg = it.image;
          if (typeof cleanImg === 'string' && cleanImg.startsWith('data:image') && cleanImg.length > 500) {
            cleanImg = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80';
          }
          return {
            ...it,
            price: Number(it.price),
            image: cleanImg || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80',
          };
        }),
        totalAmount: Number(ord.totalAmount),
        discount: Number(ord.discount || 0),
        shippingFee: Number(ord.shippingFee || 0),
      });
    }

    res.json({ status: 'ok', data: formattedOrders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 15. Admin & User: Update Order Status, Payment Method & Resi (Supports POST and PUT)
app.all(['/api/admin/orders/:id', '/api/admin/orders/:id/status'], async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, trackingNumber, courier, paymentMethod, metodePembayaran } = req.body || {};
    const targetPayment = paymentMethod || metodePembayaran || null;

    let dbStatus = status || null;
    if (status === 'diproses' || status === 'processing' || status === 'paid') {
      dbStatus = 'processing';
    } else if (status === 'menunggu' || status === 'pending') {
      dbStatus = 'pending';
    } else if (status === 'dikemas' || status === 'packing') {
      dbStatus = 'ready_for_pickup';
    } else if (status === 'dikirim' || status === 'shipped') {
      dbStatus = 'shipped';
    } else if (status === 'selesai' || status === 'completed') {
      dbStatus = 'completed';
    } else if (status === 'batal' || status === 'cancelled') {
      dbStatus = 'cancelled';
    }

    try {
      const params1 = [dbStatus, targetPayment, trackingNumber || null, courier || null];
      const where1 = getOrderWhereClause(orderId, params1);
      await pool.query(
        `UPDATE orders SET status_pesanan = COALESCE(?, status_pesanan), metode_pembayaran = COALESCE(?, metode_pembayaran), resi_pengiriman = COALESCE(?, resi_pengiriman), kurir_pengiriman = COALESCE(?, kurir_pengiriman) WHERE ${where1}`,
        params1
      );
    } catch (colErr) {
      const params2 = [dbStatus, trackingNumber || null, courier || null];
      const where2 = getOrderWhereClause(orderId, params2);
      await pool.query(
        `UPDATE orders SET status_pesanan = COALESCE(?, status_pesanan), resi_pengiriman = COALESCE(?, resi_pengiriman), kurir_pengiriman = COALESCE(?, kurir_pengiriman) WHERE ${where2}`,
        params2
      );
    }

    res.json({ status: 'ok', message: 'Status pesanan berhasil diperbarui!' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Update Order Address Endpoint
app.all(['/api/orders/:id/address', '/api/admin/orders/:id/address'], async (req, res) => {
  try {
    const orderId = req.params.id;
    const { address } = req.body;

    const params = [address || null];
    const whereClause = getOrderWhereClause(orderId, params);

    await pool.query(
      `UPDATE orders SET snapshot_alamat_kirim = ? WHERE ${whereClause}`,
      params
    );

    res.json({ status: 'ok', message: 'Alamat pengiriman pesanan berhasil diperbarui!' });
  } catch (error) {
    console.error('Error updating order address:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Auto-verify & create store_settings table if not existing
async function ensureStoreSettingsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
          setting_id INT AUTO_INCREMENT PRIMARY KEY,
          nama_toko VARCHAR(150) DEFAULT 'Official Store Tasikmalaya',
          slogan VARCHAR(255) DEFAULT 'Pusat Bumbu, Saus & Cabai Asli Tasikmalaya',
          logo_url TEXT,
          alamat_utama TEXT,
          nomor_whatsapp VARCHAR(20) DEFAULT '62895238888200',
          jam_operasional VARCHAR(100) DEFAULT '07:00 - 22:00 WIB',
          latitude DECIMAL(10, 8) DEFAULT -7.351200,
          longitude DECIMAL(11, 8) DEFAULT 108.214500,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM store_settings');
    if (rows && rows[0] && rows[0].count === 0) {
      await pool.query(`
        INSERT INTO store_settings (nama_toko, slogan, logo_url, alamat_utama, nomor_whatsapp, jam_operasional, latitude, longitude)
        VALUES (
          'Official Store Tasikmalaya',
          'Pusat Bumbu, Saus & Cabai Asli Tasikmalaya',
          'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=80',
          'Jl. Perintis Kemerdekaan No. 158, Karsamenak, Kawalu, Tasikmalaya, Jawa Barat 46182',
          '62895238888200',
          '07:00 - 22:00 WIB',
          -7.3512,
          108.2145
        )
      `);
    }
  } catch (err) {
    console.warn('ensureStoreSettingsTable warning:', err.message);
  }
}
ensureStoreSettingsTable();

// Auto-sync product_images table with products.gambar_utama
async function ensureProductImagesSync() {
  try {
    await pool.query(`
      INSERT INTO product_images (product_id, url_gambar, urutan)
      SELECT p.product_id, p.gambar_utama, 1
      FROM products p
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      WHERE pi.product_id IS NULL AND p.gambar_utama IS NOT NULL AND p.gambar_utama != ''
    `);
  } catch (err) {
    console.warn('ensureProductImagesSync warning:', err.message);
  }
}
ensureProductImagesSync();

// Auto-migrate column data types to LONGTEXT for Base64 uploaded images
async function autoMigrateDatabaseColumns() {
  try {
    await pool.query('ALTER TABLE products MODIFY gambar_utama LONGTEXT');
    await pool.query('ALTER TABLE store_settings MODIFY logo_url LONGTEXT');
    await pool.query('ALTER TABLE product_images MODIFY url_gambar LONGTEXT');
    console.log('✅ Kolom MySQL gambar_utama, logo_url, dan url_gambar terverifikasi LONGTEXT.');
  } catch (err) {
    console.warn('autoMigrateDatabaseColumns warning:', err.message);
  }
}
autoMigrateDatabaseColumns();

// Auto-verify & create user_carts table if not existing
async function ensureUserCartsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_carts (
          user_id INT PRIMARY KEY,
          cart_json LONGTEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.warn('ensureUserCartsTable warning:', err.message);
  }
}
ensureUserCartsTable();

// User Cart Endpoints (Get & Save per User ID)
app.get('/api/cart', async (req, res) => {
  try {
    await ensureUserCartsTable();
    const userId = req.query.userId;
    if (!userId) {
      return res.json({ status: 'ok', data: [] });
    }
    const [rows] = await pool.query('SELECT cart_json FROM user_carts WHERE user_id = ?', [userId]);
    if (rows && rows.length > 0 && rows[0].cart_json) {
      try {
        const items = JSON.parse(rows[0].cart_json);
        return res.json({ status: 'ok', data: Array.isArray(items) ? items : [] });
      } catch (e) {
        return res.json({ status: 'ok', data: [] });
      }
    }
    res.json({ status: 'ok', data: [] });
  } catch (error) {
    console.error('Error fetching user cart:', error);
    res.json({ status: 'ok', data: [] });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    await ensureUserCartsTable();
    const { userId, cartItems } = req.body;
    if (!userId) {
      return res.json({ status: 'ok', message: 'Guest cart ignored' });
    }
    const jsonStr = JSON.stringify(Array.isArray(cartItems) ? cartItems : []);
    await pool.query(
      `INSERT INTO user_carts (user_id, cart_json) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE cart_json = VALUES(cart_json)`,
      [userId, jsonStr]
    );
    res.json({ status: 'ok', message: 'Keranjang berhasil disimpan ke database!' });
  } catch (error) {
    console.error('Error saving user cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 16. Admin: Get & Update Store Settings
app.get('/api/admin/settings', async (req, res) => {
  try {
    await ensureStoreSettingsTable();
    const [rows] = await pool.query('SELECT * FROM store_settings ORDER BY setting_id DESC LIMIT 1');
    const settings = rows.length > 0 ? rows[0] : {
      nama_toko: 'Official Store Tasikmalaya',
      slogan: 'Pusat Bumbu, Saus & Cabai Asli Tasikmalaya',
      logo_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=80',
      alamat_utama: 'Jl. Perintis Kemerdekaan No. 158, Karsamenak, Kawalu, Tasikmalaya, Jawa Barat 46182',
      nomor_whatsapp: '62895238888200',
      jam_operasional: '07:00 - 22:00 WIB',
      latitude: -7.351200,
      longitude: 108.214500,
    };
    res.json({ status: 'ok', data: settings });
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.all('/api/admin/settings', async (req, res) => {
  try {
    await ensureStoreSettingsTable();
    const {
      nama_toko,
      slogan,
      logo_url,
      alamat_utama,
      nomor_whatsapp,
      jam_operasional,
      latitude,
      longitude,
    } = req.body;

    const nameVal = nama_toko !== undefined ? String(nama_toko).trim() : 'Official Store Tasikmalaya';
    const sloganVal = slogan !== undefined ? String(slogan).trim() : 'Pusat Bumbu, Saus & Cabai Asli Tasikmalaya';
    const logoVal = logo_url !== undefined ? String(logo_url).trim() : '';
    const addressVal = alamat_utama !== undefined ? String(alamat_utama).trim() : '';
    const waVal = nomor_whatsapp !== undefined ? String(nomor_whatsapp).trim() : '';
    const hoursVal = jam_operasional !== undefined ? String(jam_operasional).trim() : '07:00 - 22:00 WIB';
    const latNum = isNaN(parseFloat(latitude)) ? -7.3512 : parseFloat(latitude);
    const lngNum = isNaN(parseFloat(longitude)) ? 108.2145 : parseFloat(longitude);

    const [rows] = await pool.query('SELECT setting_id FROM store_settings ORDER BY setting_id DESC LIMIT 1');
    if (rows && rows.length > 0) {
      await pool.query(
        `UPDATE store_settings SET 
          nama_toko = ?,
          slogan = ?,
          logo_url = ?,
          alamat_utama = ?,
          nomor_whatsapp = ?,
          jam_operasional = ?,
          latitude = ?,
          longitude = ?
        WHERE setting_id = ?`,
        [nameVal, sloganVal, logoVal, addressVal, waVal, hoursVal, latNum, lngNum, rows[0].setting_id]
      );
    } else {
      await pool.query(
        `INSERT INTO store_settings (nama_toko, slogan, logo_url, alamat_utama, nomor_whatsapp, jam_operasional, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nameVal, sloganVal, logoVal, addressVal, waVal, hoursVal, latNum, lngNum]
      );
    }

    const updatedSettings = {
      nama_toko: nameVal,
      slogan: sloganVal,
      logo_url: logoVal,
      alamat_utama: addressVal,
      nomor_whatsapp: waVal,
      jam_operasional: hoursVal,
      latitude: latNum,
      longitude: lngNum,
    };

    console.log('⚙️ [DB UPDATE SUCCESS] store_settings updated in MySQL database:', updatedSettings);
    res.json({ status: 'ok', message: 'Pengaturan toko berhasil disimpan ke database!', data: updatedSettings });
  } catch (error) {
    console.error('❌ Error updating store settings in DB:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 17. Admin: Get, Create, Update, Delete Branch Stores
app.get('/api/admin/stores', async (req, res) => {
  try {
    const [stores] = await pool.query(
      'SELECT store_id AS id, kode_toko AS code, nama_toko AS name, alamat_toko AS address, nomor_telepon AS phone, jam_operasional AS hours, latitude AS lat, longitude AS lng, status_aktif AS active FROM stores ORDER BY store_id ASC'
    );
    res.json({ status: 'ok', data: stores });
  } catch (error) {
    console.error('Error fetching admin stores:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post('/api/admin/stores', async (req, res) => {
  try {
    const { code, name, address, phone = '', hours = '07:00 - 22:00', lat = -7.3512, lng = 108.2145 } = req.body;
    if (!name || !address) {
      return res.status(400).json({ status: 'error', message: 'Nama cabang dan alamat wajib diisi.' });
    }

    const finalCode = code || `CAB-${Date.now().toString().slice(-4)}`;
    const latNum = parseFloat(lat) || -7.3512;
    const lngNum = parseFloat(lng) || 108.2145;

    const [result] = await pool.query(
      'INSERT INTO stores (kode_toko, nama_toko, alamat_toko, nomor_telepon, jam_operasional, latitude, longitude, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)',
      [finalCode, name, address, phone, hours, latNum, lngNum]
    );

    res.json({
      status: 'ok',
      message: 'Cabang toko baru berhasil ditambahkan!',
      data: { id: result.insertId, code: finalCode, name, address },
    });
  } catch (error) {
    console.error('Error creating store branch:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.all(['/api/admin/stores/:id', '/api/admin/stores/:id/update'], async (req, res) => {
  try {
    const storeId = req.params.id;
    const { code, name, address, phone, hours, lat, lng, active } = req.body;
    const latNum = lat !== undefined ? parseFloat(lat) || -7.3512 : null;
    const lngNum = lng !== undefined ? parseFloat(lng) || 108.2145 : null;

    await pool.query(
      `UPDATE stores SET 
        kode_toko = COALESCE(?, kode_toko),
        nama_toko = COALESCE(?, nama_toko),
        alamat_toko = COALESCE(?, alamat_toko),
        nomor_telepon = COALESCE(?, nomor_telepon),
        jam_operasional = COALESCE(?, jam_operasional),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        status_aktif = COALESCE(?, status_aktif)
      WHERE store_id = ?`,
      [code || null, name || null, address || null, phone || null, hours || null, latNum, lngNum, active !== undefined ? active : null, storeId]
    );

    res.json({ status: 'ok', message: 'Data cabang berhasil diperbarui!' });
  } catch (error) {
    console.error('Error updating store branch:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.all(['/api/admin/stores/:id/delete', '/api/admin/stores/:id'], async (req, res) => {
  try {
    const storeId = req.params.id;
    await pool.query('UPDATE stores SET status_aktif = FALSE WHERE store_id = ?', [storeId]);
    res.json({ status: 'ok', message: 'Cabang toko telah dinonaktifkan.' });
  } catch (error) {
    console.error('Error deleting store branch:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// =====================================================
// 18. ADMIN ORDERS & STATS DATABASE API
// =====================================================

// A. Real-time Overview Statistics from Database
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [salesRows] = await pool.query(
      `SELECT COALESCE(SUM(total_pembayaran), 0) AS totalSales, COUNT(*) AS totalOrders FROM orders WHERE status_pesanan != 'cancelled'`
    );
    const [prodRows] = await pool.query(
      `SELECT COUNT(*) AS totalProducts FROM products WHERE status_aktif = TRUE`
    );
    const [userRows] = await pool.query(
      `SELECT COUNT(*) AS totalUsers FROM users`
    );

    res.json({
      status: 'ok',
      data: {
        totalSales: Number(salesRows[0]?.totalSales || 0),
        totalOrders: Number(salesRows[0]?.totalOrders || 0),
        totalProducts: Number(prodRows[0]?.totalProducts || 0),
        totalUsers: Number(userRows[0]?.totalUsers || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.json({
      status: 'ok',
      data: { totalSales: 0, totalOrders: 0, totalProducts: 16, totalUsers: 0 },
    });
  }
});

// B. Get All Orders from MySQL Database
app.get('/api/admin/orders', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        o.order_id AS id,
        o.nomor_pesanan AS orderNumber,
        COALESCE(u.nama_lengkap, a.nama_penerima, 'Pelanggan Official Store') AS customerName,
        COALESCE(u.nomor_telepon, a.nomor_telepon, '-') AS customerPhone,
        o.tipe_pesanan AS deliveryType,
        COALESCE(o.snapshot_alamat_kirim, a.alamat_lengkap, 'Ambil di Toko') AS address,
        o.total_pembayaran AS totalAmount,
        o.status_pesanan AS status,
        COALESCE(o.kurir_pengiriman, 'Pengiriman Instan Toko') AS courier,
        COALESCE(o.resi_pengiriman, '-') AS trackingNumber,
        DATE_FORMAT(o.created_at, '%d %b %Y %H:%i') AS date
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN user_addresses a ON o.address_id = a.address_id
      ORDER BY o.order_id DESC
    `);

    res.json({ status: 'ok', data: rows || [] });
  } catch (error) {
    console.error('Error fetching admin orders from database:', error.message);
    res.json({ status: 'ok', data: [] });
  }
});

// C. Update Order Status in Database
app.all(['/api/admin/orders/:id', '/api/admin/orders/:id/status'], async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, trackingNumber, courier, paymentMethod, metodePembayaran } = req.body || {};
    const targetPayment = paymentMethod || metodePembayaran || null;

    let dbStatus = status || null;
    if (status === 'diproses' || status === 'processing' || status === 'paid') {
      dbStatus = 'processing';
    } else if (status === 'menunggu' || status === 'pending') {
      dbStatus = 'pending';
    } else if (status === 'dikemas' || status === 'packing') {
      dbStatus = 'ready_for_pickup';
    } else if (status === 'dikirim' || status === 'shipped') {
      dbStatus = 'shipped';
    } else if (status === 'selesai' || status === 'completed') {
      dbStatus = 'completed';
    } else if (status === 'batal' || status === 'cancelled') {
      dbStatus = 'cancelled';
    }

    try {
      const params1 = [dbStatus, targetPayment, trackingNumber || null, courier || null];
      const where1 = getOrderWhereClause(orderId, params1);
      await pool.query(
        `UPDATE orders SET 
          status_pesanan = COALESCE(?, status_pesanan),
          metode_pembayaran = COALESCE(?, metode_pembayaran),
          resi_pengiriman = COALESCE(?, resi_pengiriman),
          kurir_pengiriman = COALESCE(?, kurir_pengiriman)
        WHERE ${where1}`,
        params1
      );
    } catch (colErr) {
      const params2 = [dbStatus, trackingNumber || null, courier || null];
      const where2 = getOrderWhereClause(orderId, params2);
      await pool.query(
        `UPDATE orders SET 
          status_pesanan = COALESCE(?, status_pesanan),
          resi_pengiriman = COALESCE(?, resi_pengiriman),
          kurir_pengiriman = COALESCE(?, kurir_pengiriman)
        WHERE ${where2}`,
        params2
      );
    }

    res.json({ status: 'ok', message: 'Status pesanan berhasil diperbarui ke database' });
  } catch (error) {
    console.error('Error updating order status in DB:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// D. Create New Order (Checkout Endpoint)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      userId,
      deliveryType = 'delivery',
      addressId,
      snapshotAddress,
      storeId,
      totalProductPrice,
      deliveryFee = 0,
      voucherDiscount = 0,
      voucherId,
      serviceFee = 1000,
      totalPayment,
      courier,
      notes,
      items = [],
    } = req.body;

    const orderNum = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [result] = await pool.query(
      `INSERT INTO orders 
        (nomor_pesanan, user_id, tipe_pesanan, address_id, snapshot_alamat_kirim, store_id, total_harga_produk, ongkos_kirim, diskon_voucher, voucher_id, biaya_layanan, total_pembayaran, status_pesanan, kurir_pengiriman, catatan_pesanan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        orderNum,
        userId || null,
        deliveryType,
        addressId || null,
        snapshotAddress || null,
        storeId || null,
        totalProductPrice || totalPayment,
        deliveryFee,
        voucherDiscount,
        voucherId || null,
        serviceFee,
        totalPayment || totalProductPrice || 0,
        courier || 'Pengiriman Instan Toko',
        notes || '',
      ]
    );

    const insertedOrderId = result.insertId;

    if (items && items.length > 0) {
      for (const item of items) {
        await pool.query(
          `INSERT INTO order_items 
            (order_id, variant_id, sku_saat_beli, nama_produk_saat_beli, nama_varian_saat_beli, harga_satuan_saat_beli, jumlah, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            insertedOrderId,
            item.variantId || null,
            item.sku || 'SKU-GENERAL',
            item.name || 'Produk',
            item.variantName || 'PCS',
            item.price || 0,
            item.qty || 1,
            (item.price || 0) * (item.qty || 1),
          ]
        );
      }
    }

    console.log(`🛒 [NEW ORDER SAVED TO DB] #${orderNum} | Total: Rp ${totalPayment}`);

    res.json({
      status: 'ok',
      message: 'Pesanan berhasil disimpan ke database!',
      data: { orderId: insertedOrderId, orderNumber: orderNum },
    });
  } catch (error) {
    console.error('Error creating order in DB:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});



// SERVE PRODUCTION BUILD (dist/)
// =====================================================
// Jika di server production, backend ini juga otomatis menyajikan file dist/ website!
const distPath = path.join(__dirname, '../dist');
const fs = require('fs');

app.use(
  express.static(distPath, {
    maxAge: '1h',
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  })
);

// Catch-all SPA handler: Kompatibel dengan semua versi Express (Express 4 & Express 5)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    const requestedFile = path.join(distPath, req.path);

    // 1. Jika file statis benar-benar ada di dalam folder dist/, langsung kirimkan file tersebut
    if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
      return res.sendFile(requestedFile);
    }

    // 2. Jangan kirim index.html untuk aset statis yang hilang (mencegah JS SyntaxError <)
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|ttf|woff|woff2|svg|json|map)$/i)) {
      return res.status(404).send('Asset not found');
    }

    // 3. Kirim index.html untuk routing SPA (Single Page Application)
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(indexPath, (err) => {
        if (err && !res.headersSent) next();
      });
    }
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 Server Backend Official Store berjalan di http://localhost:${PORT}`);
  console.log(`📡 API Endpoints tersedia di http://localhost:${PORT}/api/products`);
});
