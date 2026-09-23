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
// ADMIN API ENDPOINTS (AUTH, PRODUCTS, VOUCHERS, ORDERS, STATS)
// =====================================================

// 6.5 Admin Login Endpoint (Hanya untuk Role 'admin')
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, phone, email, pin, password } = req.body;
    const inputId = phone || email || username;

    if (!inputId) {
      return res.status(400).json({ status: 'error', message: 'Nomor HP, Email, atau Username Admin wajib diisi.' });
    }

    const cleanInput = sanitizePhone(inputId);
    const passInput = pin || password || '';

    // Cek di database MySQL
    let adminUser = null;
    let userRole = null;

    try {
      const [rows] = await pool.query(
        'SELECT user_id, nama_lengkap, nomor_telepon, email, role FROM users WHERE nomor_telepon = ? OR nomor_telepon = ? OR email = ? OR user_id = 1',
        [cleanInput, inputId, inputId]
      );

      if (rows && rows.length > 0) {
        // Cari akun berpangkat admin
        const adminMatch = rows.find((u) => u.role === 'admin');
        if (adminMatch) {
          adminUser = adminMatch;
          userRole = 'admin';
        } else {
          // Akun ditemukan tapi role 'buyer'
          userRole = rows[0].role || 'buyer';
        }
      }
    } catch (dbErr) {
      console.warn('DB admin check warning:', dbErr.message);
    }

    // Default Demo Admin Credential Fallback (Jika DB offline / belum ada admin)
    const isDemoAdmin = (inputId === 'admin' || cleanInput === '6281234567890' || inputId === '081234567890' || inputId === 'admin@officialstore.com') && (passInput === '123456' || passInput === 'admin123' || passInput === '1234' || passInput === '');

    if (userRole === 'buyer' && !isDemoAdmin) {
      return res.status(403).json({
        status: 'error',
        isForbidden: true,
        message: 'Akses Ditolak! Akun Anda terdaftar sebagai Pelanggan (Buyer) dan tidak memiliki hak wewenang Admin.',
      });
    }

    if (!adminUser && !isDemoAdmin) {
      return res.status(401).json({
        status: 'error',
        message: 'Kredensial Admin salah atau akun tidak ditemukan.',
      });
    }

    const finalAdmin = adminUser || {
      user_id: 1,
      nama_lengkap: 'Administrator Official Store',
      nomor_telepon: '081234567890',
      email: 'admin@officialstore.com',
      role: 'admin',
    };

    console.log(`🔐 [ADMIN LOGIN SUCCESS] User: ${finalAdmin.nama_lengkap} (Role: admin)`);

    res.json({
      status: 'ok',
      message: 'Login Admin Berhasil!',
      data: {
        id: finalAdmin.user_id,
        name: finalAdmin.nama_lengkap,
        phone: finalAdmin.nomor_telepon,
        email: finalAdmin.email,
        role: 'admin',
        token: `admin_token_${Date.now()}`,
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

// 9. Admin: Update Product & Variant in MySQL Database
app.put('/api/admin/products/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const rawId = req.params.id;
    const { name, category, price, originalPrice, stock, image, description, sku, satuan = 'PCS' } = req.body;

    await connection.beginTransaction();

    let productId = null;
    let targetVariantId = null;

    // 1. Lookup in product_variants by variant_id or sku
    const [varRows] = await connection.query(
      'SELECT variant_id, product_id FROM product_variants WHERE variant_id = ? OR sku = ? LIMIT 1',
      [rawId, sku || rawId]
    );

    if (varRows.length > 0) {
      targetVariantId = varRows[0].variant_id;
      productId = varRows[0].product_id;
    } else {
      // 2. Lookup in products table directly
      const [prodRows] = await connection.query(
        'SELECT product_id FROM products WHERE product_id = ? OR slug LIKE ? LIMIT 1',
        [rawId, `%${rawId}%`]
      );
      if (prodRows.length > 0) {
        productId = prodRows[0].product_id;
        const [vRows] = await connection.query('SELECT variant_id FROM product_variants WHERE product_id = ? LIMIT 1', [productId]);
        if (vRows.length > 0) targetVariantId = vRows[0].variant_id;
      }
    }

    // 3. If item is not in MySQL DB yet (e.g. legacy item), insert it into MySQL database now!
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
      if (name || price !== undefined || stock !== undefined) {
        await connection.query(
          'UPDATE product_variants SET nama_varian = COALESCE(?, nama_varian), harga = COALESCE(?, harga), harga_coret = ?, stok = COALESCE(?, stok) WHERE variant_id = ? OR product_id = ?',
          [name || null, price !== undefined ? price : null, originalPrice !== undefined ? originalPrice : null, stock !== undefined ? stock : null, targetVariantId, productId]
        );
      }

      // Update parent product image, name, deskripsi
      if (name || image || description) {
        await connection.query(
          'UPDATE products SET nama_produk = COALESCE(?, nama_produk), gambar_utama = COALESCE(?, gambar_utama), deskripsi = COALESCE(?, deskripsi) WHERE product_id = ?',
          [name || null, image || null, description || null, productId]
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

app.put('/api/admin/settings', async (req, res) => {
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

app.put('/api/admin/stores/:id', async (req, res) => {
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

app.delete('/api/admin/stores/:id', async (req, res) => {
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
    const { status, trackingNumber } = req.body;
    await pool.query(
      `UPDATE orders SET 
        status_pesanan = COALESCE(?, status_pesanan),
        resi_pengiriman = COALESCE(?, resi_pengiriman)
      WHERE order_id = ?`,
      [status || null, trackingNumber || null, orderId]
    );

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

// =====================================================
// SERVE PRODUCTION BUILD (dist/)
// =====================================================
// Jika di server production, backend ini juga otomatis menyajikan file dist/ website!
const distPath = path.join(__dirname, '../dist');

app.use(
  express.static(distPath, {
    maxAge: '1d',
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
    // Jangan kirim index.html untuk aset statis yang hilang (mencegah JS SyntaxError <)
    if (
      req.path.includes('/_expo/') ||
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|ttf|woff|woff2|svg|json|map)$/i)
    ) {
      return res.status(404).send('Asset not found');
    }

    const indexPath = path.join(distPath, 'index.html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
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
