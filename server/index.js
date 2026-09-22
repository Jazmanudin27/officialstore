const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection } = require('./db');
const initDatabase = require('./init-db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// =====================================================
// AUTHENTICATION API (PHONE & OTP)
// =====================================================

// A. Kirim Kode OTP ke Nomor HP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ status: 'error', message: 'Nomor HP wajib diisi.' });
    }

    const cleanPhone = sanitizePhone(phone);
    // Generate 6 digit OTP (Demo default: 123456)
    const otp = '123456';
    otpStore.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 menit
    });

    // Cek apakah user sudah terdaftar di database MySQL
    let isRegistered = false;
    let userName = '';
    try {
      const [rows] = await pool.query(
        'SELECT user_id, nama_lengkap FROM users WHERE nomor_telepon = ? OR nomor_telepon = ?',
        [cleanPhone, phone]
      );
      if (rows && rows.length > 0) {
        isRegistered = true;
        userName = rows[0].nama_lengkap;
      }
    } catch (dbErr) {
      console.warn('DB check warning:', dbErr.message);
    }

    console.log(`📲 [OTP SENT] No HP: ${cleanPhone} | Kode OTP: ${otp} | Terdaftar: ${isRegistered}`);

    res.json({
      status: 'ok',
      message: `Kode OTP berhasil dikirim ke +${cleanPhone}`,
      data: {
        phone: cleanPhone,
        isRegistered,
        userName,
        otp, // Disediakan langsung untuk kemudahan pengujian
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

    const cleanPhone = sanitizePhone(phone);
    const stored = otpStore.get(cleanPhone);

    // Verifikasi kode OTP (menerima OTP tersimpan atau 123456)
    const isValid = otp === '123456' || (stored && stored.otp === otp && Date.now() <= stored.expiresAt);
    if (!isValid) {
      return res.status(400).json({ status: 'error', message: 'Kode OTP salah atau sudah kadaluarsa.' });
    }

    // Ambil data user dari MySQL
    let user = null;
    let address = null;

    try {
      const [userRows] = await pool.query(
        'SELECT user_id, nama_lengkap, nomor_telepon, email, role, poin_member FROM users WHERE nomor_telepon = ? OR nomor_telepon = ?',
        [cleanPhone, phone]
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

// C. Registrasi Akun Baru (Nama, No HP, Alamat)
app.post('/api/auth/register', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { namaLengkap, phone, alamat, otp } = req.body;

    if (!namaLengkap || !phone || !alamat) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama Lengkap, Nomor HP, dan Alamat wajib diisi.',
      });
    }

    const cleanPhone = sanitizePhone(phone);

    // Cek OTP jika dikirimkan
    if (otp && otp !== '123456') {
      const stored = otpStore.get(cleanPhone);
      if (!stored || stored.otp !== otp) {
        return res.status(400).json({ status: 'error', message: 'Kode OTP tidak valid.' });
      }
    }

    await connection.beginTransaction();

    // 1. Cek apakah nomor sudah ada
    const [existing] = await connection.query(
      'SELECT user_id FROM users WHERE nomor_telepon = ?',
      [cleanPhone]
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
      // Insert user baru
      const [insertUser] = await connection.query(
        'INSERT INTO users (nama_lengkap, nomor_telepon, role, poin_member) VALUES (?, ?, "buyer", 500)',
        [namaLengkap, cleanPhone]
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
        p.gambar_utama AS image,
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

    const nomorPesanan = `INV-${Date.now().toString().slice(-8)}`;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        nomor_pesanan, user_id, tipe_pesanan, address_id, snapshot_alamat_kirim, 
        store_id, total_harga_produk, ongkos_kirim, diskon_voucher, voucher_id, 
        biaya_layanan, total_pembayaran, catatan_pesanan, status_pesanan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        nomorPesanan,
        userId,
        tipePesanan,
        addressId,
        snapshotAlamatKirim,
        storeId,
        totalHargaProduk,
        ongkosKirim,
        diskonVoucher,
        voucherId,
        biayaLayanan,
        totalPembayaran,
        catatanPesanan,
      ]
    );

    const orderId = orderResult.insertId;

    // Masukkan items ke order_items
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (
          order_id, variant_id, sku_saat_beli, nama_produk_saat_beli, 
          nama_varian_saat_beli, harga_satuan_saat_beli, jumlah, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.variantId || item.id,
          item.sku || 'SKU',
          item.parentName || item.name,
          item.name,
          item.price,
          item.quantity,
          item.price * item.quantity,
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
// ADMIN API ENDPOINTS (PRODUCTS, VOUCHERS, ORDERS, STATS)
// =====================================================

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

// 8. Admin: Create New Product & Variant
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

    if (!name || !price) {
      return res.status(400).json({ status: 'error', message: 'Nama produk dan harga wajib diisi.' });
    }

    await connection.beginTransaction();

    // Find category ID or fallback to first category
    const [catRows] = await connection.query('SELECT category_id FROM categories WHERE nama_kategori = ?', [category]);
    const categoryId = catRows.length > 0 ? catRows[0].category_id : 1;

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    // Insert Product Induk
    const [productResult] = await connection.query(
      'INSERT INTO products (category_id, nama_produk, slug, deskripsi, gambar_utama, is_populer, status_aktif) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [categoryId, name, slug, description, image, isPopuler ? 1 : 0]
    );

    const productId = productResult.insertId;
    const finalSku = sku || `SKU-${Date.now().toString().slice(-6)}`;

    // Insert Product Variant
    const [variantResult] = await connection.query(
      'INSERT INTO product_variants (product_id, sku, nama_varian, ukuran_atau_isi, satuan, berat_gram, harga_coret, harga, stok, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)',
      [productId, finalSku, name, '1 PCS', satuan, weight, originalPrice || null, price, stock]
    );

    await connection.commit();

    res.json({
      status: 'ok',
      message: 'Produk baru berhasil ditambahkan!',
      data: {
        id: variantResult.insertId,
        productId,
        name,
        category,
        sku: finalSku,
        price,
        originalPrice,
        stock,
        image,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating product:', error);
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    connection.release();
  }
});

// 9. Admin: Update Product & Variant
app.put('/api/admin/products/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const variantId = req.params.id;
    const { name, category, price, originalPrice, stock, image, description } = req.body;

    await connection.beginTransaction();

    // Get product_id from variant
    const [varRows] = await connection.query('SELECT product_id FROM product_variants WHERE variant_id = ?', [variantId]);
    if (varRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan.' });
    }
    const productId = varRows[0].product_id;

    // Update variant
    if (name || price !== undefined || stock !== undefined) {
      await connection.query(
        'UPDATE product_variants SET nama_varian = COALESCE(?, nama_varian), harga = COALESCE(?, harga), harga_coret = ?, stok = COALESCE(?, stok) WHERE variant_id = ?',
        [name || null, price || null, originalPrice || null, stock !== undefined ? stock : null, variantId]
      );
    }

    // Update parent product
    if (name || image || description) {
      await connection.query(
        'UPDATE products SET nama_produk = COALESCE(?, nama_produk), gambar_utama = COALESCE(?, gambar_utama), deskripsi = COALESCE(?, deskripsi) WHERE product_id = ?',
        [name || null, image || null, description || null, productId]
      );
    }

    await connection.commit();
    res.json({ status: 'ok', message: 'Produk berhasil diperbarui!' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating product:', error);
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    connection.release();
  }
});

// 10. Admin: Delete / Nonaktifkan Produk
app.delete('/api/admin/products/:id', async (req, res) => {
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

// 13. Admin: Delete Voucher
app.delete('/api/admin/vouchers/:id', async (req, res) => {
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
        o.resi_pengiriman AS trackingNumber,
        DATE_FORMAT(o.created_at, "%d %b %Y %H:%i") AS date
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      ORDER BY o.order_id DESC`
    );

    res.json({ status: 'ok', data: orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 15. Admin: Update Order Status & Resi
app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, trackingNumber, courier } = req.body;

    await pool.query(
      'UPDATE orders SET status_pesanan = COALESCE(?, status_pesanan), resi_pengiriman = COALESCE(?, resi_pengiriman), kurir_pengiriman = COALESCE(?, kurir_pengiriman) WHERE order_id = ?',
      [status || null, trackingNumber || null, courier || null, orderId]
    );

    res.json({ status: 'ok', message: 'Status pesanan berhasil diperbarui!' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// =====================================================
// SERVE PRODUCTION BUILD (dist/)
// =====================================================
// Jika di server production, backend ini juga otomatis menyajikan file dist/ website!
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all SPA handler: Kompatibel dengan semua versi Express (Express 4 & Express 5)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    const indexPath = path.join(distPath, 'index.html');
    return res.sendFile(indexPath, (err) => {
      if (err) next();
    });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 Server Backend Official Store berjalan di http://localhost:${PORT}`);
  console.log(`📡 API Endpoints tersedia di http://localhost:${PORT}/api/products`);
});
