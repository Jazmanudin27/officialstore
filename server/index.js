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

// 2. Trigger auto setup database (buat tabel & isi data awal)
app.post('/api/init-db', async (req, res) => {
  const success = await initDatabase();
  if (success) {
    res.json({ status: 'ok', message: 'Database officialstore berhasil diinisialisasi & di-seed!' });
  } else {
    res.status(500).json({ status: 'error', message: 'Gagal inisialisasi database. Cek log server.' });
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
