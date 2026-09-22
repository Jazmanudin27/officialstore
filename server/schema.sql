-- =====================================================
-- DATABASE: officialstore
-- =====================================================
CREATE DATABASE IF NOT EXISTS officialstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE officialstore;

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nomor_telepon VARCHAR(20),
    role ENUM('admin', 'seller', 'buyer') DEFAULT 'buyer',
    status_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Alamat Pengguna
CREATE TABLE IF NOT EXISTS user_addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    label_alamat VARCHAR(50) DEFAULT 'Rumah',
    nama_penerima VARCHAR(100) NOT NULL,
    nomor_telepon VARCHAR(20) NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kota_kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    kode_pos VARCHAR(10),
    catatan_patokan VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_utama BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Tabel Toko Cabang (Untuk Mode Pickup)
CREATE TABLE IF NOT EXISTS stores (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    kode_toko VARCHAR(50) UNIQUE NOT NULL,
    nama_toko VARCHAR(150) NOT NULL,
    alamat_toko TEXT NOT NULL,
    nomor_telepon VARCHAR(20),
    jam_operasional VARCHAR(50) DEFAULT '07:00 - 22:00',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status_aktif BOOLEAN DEFAULT TRUE
);

-- 4. Tabel Kategori
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    ikon_kategori VARCHAR(255),
    urutan INT DEFAULT 0
);

-- 5. Tabel Produk Induk
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    nama_produk VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    deskripsi TEXT,
    gambar_utama VARCHAR(255),
    is_populer BOOLEAN DEFAULT FALSE,
    status_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- 6. Tabel Foto Produk Tambahan
CREATE TABLE IF NOT EXISTS product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    url_gambar VARCHAR(255) NOT NULL,
    urutan INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 7. Tabel Varian Produk (Menampung Kode Produk / SKU & Berat Ongkir)
CREATE TABLE IF NOT EXISTS product_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    nama_varian VARCHAR(150) NOT NULL,
    ukuran_atau_isi VARCHAR(50),
    satuan VARCHAR(50) DEFAULT 'Gram',
    berat_gram INT NOT NULL DEFAULT 100,
    harga_coret DECIMAL(12, 2) DEFAULT NULL,
    harga DECIMAL(12, 2) NOT NULL,
    stok INT DEFAULT 100,
    status_aktif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 8. Tabel Keranjang Belanja
CREATE TABLE IF NOT EXISTS carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    variant_id INT NOT NULL,
    jumlah_beli INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE
);

-- 9. Tabel Voucher & Promo
CREATE TABLE IF NOT EXISTS vouchers (
    voucher_id INT AUTO_INCREMENT PRIMARY KEY,
    kode_voucher VARCHAR(50) UNIQUE NOT NULL,
    judul VARCHAR(100) NOT NULL,
    tipe_diskon ENUM('persen', 'nominal') NOT NULL,
    nilai_diskon DECIMAL(12, 2) NOT NULL,
    minimal_belanja DECIMAL(12, 2) DEFAULT 0.00,
    maksimal_potongan DECIMAL(12, 2) DEFAULT NULL,
    kuota INT DEFAULT 100,
    tanggal_mulai DATETIME NOT NULL,
    tanggal_berakhir DATETIME NOT NULL,
    status_aktif BOOLEAN DEFAULT TRUE
);

-- 10. Tabel Pesanan (Orders)
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    nomor_pesanan VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    tipe_pesanan ENUM('delivery', 'pickup') DEFAULT 'delivery',
    address_id INT DEFAULT NULL,
    snapshot_alamat_kirim TEXT DEFAULT NULL,
    store_id INT DEFAULT NULL,
    total_harga_produk DECIMAL(12, 2) NOT NULL,
    ongkos_kirim DECIMAL(12, 2) DEFAULT 0.00,
    diskon_voucher DECIMAL(12, 2) DEFAULT 0.00,
    voucher_id INT DEFAULT NULL,
    biaya_layanan DECIMAL(12, 2) DEFAULT 1000.00,
    total_pembayaran DECIMAL(12, 2) NOT NULL,
    status_pesanan ENUM('pending', 'paid', 'processing', 'ready_for_pickup', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
    kurir_pengiriman VARCHAR(50) DEFAULT NULL,
    resi_pengiriman VARCHAR(100) DEFAULT NULL,
    catatan_pesanan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (address_id) REFERENCES user_addresses(address_id) ON DELETE SET NULL,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE SET NULL,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(voucher_id) ON DELETE SET NULL
);

-- 11. Tabel Detail Item Pesanan (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    variant_id INT,
    sku_saat_beli VARCHAR(50) NOT NULL,
    nama_produk_saat_beli VARCHAR(150) NOT NULL,
    nama_varian_saat_beli VARCHAR(150) NOT NULL,
    harga_satuan_saat_beli DECIMAL(12, 2) NOT NULL,
    jumlah INT NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE SET NULL
);

-- 12. Tabel Pembayaran (Payments)
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    metode_pembayaran VARCHAR(50) NOT NULL,
    nomor_va_atau_rekening VARCHAR(100),
    status_pembayaran ENUM('unpaid', 'success', 'failed', 'expired') DEFAULT 'unpaid',
    jumlah_bayar DECIMAL(12, 2) NOT NULL,
    waktu_kadaluarsa DATETIME,
    waktu_dibayar DATETIME,
    payload_gateway TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
