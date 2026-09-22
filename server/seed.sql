USE officialstore;

-- 0. Bersihkan Data Lama
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE carts;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE product_images;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE stores;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. SEED KATEGORI
INSERT INTO categories (category_id, nama_kategori, slug, urutan) VALUES
(1, 'AIDA', 'aida', 1),
(2, 'SAUS SWAN', 'saus-swan', 2),
(3, 'BUMBU TABUR', 'bumbu-tabur', 3),
(4, 'PREMIUM POUCH', 'premium-pouch', 4),
(5, 'SAMBAL CABE', 'sambal-cabe', 5),
(6, 'SAUS PREMIUM', 'saus-premium', 6),
(7, 'SAOSME', 'saosme', 7);

-- 2. SEED TOKO CABANG (PICKUP)
INSERT INTO stores (store_id, kode_toko, nama_toko, alamat_toko, jam_operasional, latitude, longitude) VALUES
(1, 'CAB-158', 'PERINTIS 158', 'Jl Perintis Kemerdekaan No 158 Rt 002 Rw 002 Kecamatan Kawalu Kelurahan Karsamenak', '07:00 - 22:00', -7.351200, 108.214500),
(2, 'CAB-AMN', 'PESANTREN AMANAH', 'Jl Sambong Jaya No 50 Rt 001 Rw 013 Kec. Mangkubumi Kel. Sambongjaya', '07:00 - 22:00', -7.348900, 108.209100),
(3, 'CAB-MGB', 'MANGKUBUMI 2', 'Jl. Mayor SL Tobing No. 42 RT 01 RW 04 Kel. Sambongjaya Kec. Mangkubumi', '07:00 - 22:00', -7.341200, 108.201300),
(4, 'CAB-CHD', 'CIHIDEUNG TASIK', 'Jl. Cihideung Balong No. 12 RT 03 RW 01 Kel. Nagarawangi Kec. Cihideung', '06:30 - 22:00', -7.332500, 108.221000);

-- 3. SEED 16 PRODUK INDUK
INSERT INTO products (product_id, category_id, nama_produk, slug, deskripsi, gambar_utama, is_populer) VALUES
(1, 1, 'AIDA BESAR 500 GR', 'aida-besar-500-gr', 'Bubuk cabe kering giling asli Tasikmalaya kemasan besar 500 gram. Pedas alami mantap tanpa bahan pengawet.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80', TRUE),
(2, 1, 'AIDA SEDANG 250 GR', 'aida-sedang-250-gr', 'Bubuk cabe kering giling asli Tasikmalaya kemasan sedang 250 gram. Praktis untuk kebutuhan dapur dan jualan.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80', TRUE),
(3, 1, 'AIDA RENTENG 25 GR', 'aida-renteng-25-gr', 'Bubuk cabe kering giling kemasan sachet renteng praktis @25 gram.', 'https://images.unsplash.com/photo-1588165171080-c89acfa5a259?w=500&auto=format&fit=crop&q=80', TRUE),
(4, 3, 'CABE BUMTABUR 500 GR', 'cabe-bumtabur-500-gr', 'Perpaduan bubuk cabe pedas khas dengan bumbu tabur gurih kemasan 500 gram.', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&auto=format&fit=crop&q=80', FALSE),
(5, 2, 'SAUS BAWANG BALL', 'saus-bawang-ball', 'Saus aroma bawang lezat kemasan ball untuk bakso, mie ayam, dan aneka jajanan.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80', TRUE),
(6, 2, 'SAUS BP 500 GR', 'saus-bp-500-gr', 'Saus pedas manis Swan BP kemasan 500 gram rasa khas nusantara.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80', FALSE),
(7, 2, 'SAUS EXTRA PEDAS', 'saus-extra-pedas', 'Saus cabe segar pilihan dengan level pedas ekstra menggigit.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80', FALSE),
(8, 3, 'BUMBU TABUR 20', 'bumbu-tabur-20', 'Bumbu tabur aneka rasa kemasan 20 gram cocok untuk kentang goreng dan makaroni.', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&auto=format&fit=crop&q=80', FALSE),
(9, 3, 'BUMBU TABUR 500', 'bumbu-tabur-500', 'Bumbu tabur aneka rasa kemasan besar 500 gram gurih dan kaya rempah.', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&auto=format&fit=crop&q=80', FALSE),
(10, 4, 'PREMIUM POUCH 1000 GR', 'premium-pouch-1000-gr', 'Kemasan pouch premium kedap udara 1000 gram menjaga kesegaran lebih tahan lama.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80', FALSE),
(11, 4, 'PREMIUM POUCH 500 GR', 'premium-pouch-500-gr', 'Kemasan pouch premium 500 gram higienis dan praktis disimpan.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80', FALSE),
(12, 5, 'SAMBAL CABE 200', 'sambal-cabe-200', 'Sambal cabe segar ulek 200 gram dengan resep tradisional nikmat.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', FALSE),
(13, 6, 'SAUS PREMIUM', 'saus-premium', 'Saus kental kualitas premium botol untuk resto dan masakan istimewa.', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=80', FALSE),
(14, 6, 'SAUS PREMIUM 500', 'saus-premium-500', 'Saus kental kualitas premium kemasan 500 gram cita rasa istimewa.', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=80', FALSE),
(15, 6, 'SAUS STICK PREMIUM', 'saus-stick-premium', 'Saus stick kemasan sachet panjang higienis untuk bekal dan take-away.', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=80', FALSE),
(16, 7, 'SAOSME 500 GR', 'saosme-500-gr', 'Saus serbaguna ekonomis Saosme 500 gram cocok untuk usaha kuliner dan keluarga.', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80', FALSE);

-- 4. SEED VARIAN PRODUK (VARIAN SATUAN: PCS/ECERAN DAN DUS/GROSIR)
INSERT INTO product_variants (product_id, sku, nama_varian, ukuran_atau_isi, satuan, berat_gram, harga_coret, harga, stok) VALUES
-- 1. AIDA BESAR 500 GR
(1, 'AB-PCS', 'AIDA BESAR 500 GR [PCS]', '500 GR', 'PCS', 500, 26000.00, 23500.00, 250),
(1, 'AB-DUS', 'AIDA BESAR 500 GR [DUS / 20 PCS]', '20 PCS', 'DUS', 10000, 500000.00, 450000.00, 40),

-- 2. AIDA SEDANG 250 GR
(2, 'AS-PCS', 'AIDA SEDANG 250 GR [PCS]', '250 GR', 'PCS', 250, 14000.00, 12500.00, 300),
(2, 'AS-DUS', 'AIDA SEDANG 250 GR [DUS / 40 PCS]', '40 PCS', 'DUS', 10000, 530000.00, 480000.00, 50),

-- 3. AIDA RENTENG 25 GR
(3, 'AR-RTG', 'AIDA RENTENG 25 GR [RENTENG / 10 PCS]', '10 PCS', 'RENTENG', 300, 16500.00, 14500.00, 350),
(3, 'AR-DUS', 'AIDA RENTENG 25 GR [DUS / 20 RENTENG]', '20 RENTENG', 'DUS', 6000, 310000.00, 275000.00, 60),

-- 4. CABE BUMTABUR 500 GR
(4, 'CBR-PCS', 'CABE BUMTABUR 500 GR [PCS]', '500 GR', 'PCS', 500, 28000.00, 25000.00, 150),
(4, 'CBR-DUS', 'CABE BUMTABUR 500 GR [DUS / 20 PCS]', '20 PCS', 'DUS', 10000, 540000.00, 480000.00, 35),

-- 5. SAUS BAWANG BALL
(5, 'BB-BALL', 'SAUS BAWANG BALL [BALL]', '1 BALL', 'BALL', 1000, 38000.00, 34000.00, 120),
(5, 'BB-DUS', 'SAUS BAWANG BALL [DUS / 10 BALL]', '10 BALL', 'DUS', 10000, 360000.00, 325000.00, 40),

-- 6. SAUS BP 500 GR
(6, 'BP500-PCS', 'SAUS BP 500 GR [PCS]', '500 GR', 'PCS', 500, 18000.00, 16000.00, 200),
(6, 'BP500-DUS', 'SAUS BP 500 GR [DUS / 24 PCS]', '24 PCS', 'DUS', 12000, 410000.00, 365000.00, 45),

-- 7. SAUS EXTRA PEDAS
(7, 'DEP-PCS', 'SAUS EXTRA PEDAS [PCS]', '500 GR', 'PCS', 500, 20000.00, 17500.00, 180),
(7, 'DEP-DUS', 'SAUS EXTRA PEDAS [DUS / 24 PCS]', '24 PCS', 'DUS', 12000, 450000.00, 400000.00, 45),

-- 8. BUMBU TABUR 20
(8, 'BR20-PCS', 'BUMBU TABUR 20 [PCS]', '20 GR', 'PCS', 20, 4500.00, 3500.00, 400),
(8, 'BR20-DUS', 'BUMBU TABUR 20 [DUS / 50 PCS]', '50 PCS', 'DUS', 1000, 200000.00, 160000.00, 80),

-- 9. BUMBU TABUR 500
(9, 'BR500-PCS', 'BUMBU TABUR 500 [PCS]', '500 GR', 'PCS', 500, 31000.00, 27500.00, 160),
(9, 'BR500-DUS', 'BUMBU TABUR 500 [DUS / 20 PCS]', '20 PCS', 'DUS', 10000, 590000.00, 520000.00, 30),

-- 10. PREMIUM POUCH 1000 GR
(10, 'P1000-PCS', 'PREMIUM POUCH 1000 GR [PCS]', '1000 GR', 'PCS', 1000, 49000.00, 44000.00, 120),
(10, 'P1000-DUS', 'PREMIUM POUCH 1000 GR [DUS / 12 PCS]', '12 PCS', 'DUS', 12000, 560000.00, 505000.00, 25),

-- 11. PREMIUM POUCH 500 GR
(11, 'PP500-PCS', 'PREMIUM POUCH 500 GR [PCS]', '500 GR', 'PCS', 500, 28000.00, 24500.00, 150),
(11, 'PP500-DUS', 'PREMIUM POUCH 500 GR [DUS / 24 PCS]', '24 PCS', 'DUS', 12000, 640000.00, 560000.00, 35),

-- 12. SAMBAL CABE 200
(12, 'SC-PCS', 'SAMBAL CABE 200 [PCS]', '200 GR', 'PCS', 200, 15000.00, 12500.00, 200),
(12, 'SC-DUS', 'SAMBAL CABE 200 [DUS / 24 PCS]', '24 PCS', 'DUS', 4800, 335000.00, 285000.00, 40),

-- 13. SAUS PREMIUM
(13, 'SP-PCS', 'SAUS PREMIUM [BOTOL / PCS]', '600 GR', 'PCS', 600, 24000.00, 21000.00, 140),
(13, 'SP-DUS', 'SAUS PREMIUM [DUS / 12 BOTOL]', '12 BOTOL', 'DUS', 7200, 275000.00, 240000.00, 30),

-- 14. SAUS PREMIUM 500
(14, 'SP500-PCS', 'SAUS PREMIUM 500 [PCS]', '500 GR', 'PCS', 500, 22000.00, 19500.00, 180),
(14, 'SP500-DUS', 'SAUS PREMIUM 500 [DUS / 24 PCS]', '24 PCS', 'DUS', 12000, 505000.00, 445000.00, 35),

-- 15. SAUS STICK PREMIUM
(15, 'SP8-PCS', 'SAUS STICK PREMIUM [PACK]', '400 GR', 'PACK', 400, 19000.00, 16500.00, 200),
(15, 'SP8-DUS', 'SAUS STICK PREMIUM [DUS / 20 PACK]', '20 PACK', 'DUS', 8000, 360000.00, 310000.00, 45),

-- 16. SAOSME 500 GR
(16, 'SS500-PCS', 'SAOSME 500 GR [PCS]', '500 GR', 'PCS', 500, 17000.00, 15000.00, 200),
(16, 'SS500-DUS', 'SAOSME 500 GR [DUS / 24 PCS]', '24 PCS', 'DUS', 12000, 385000.00, 340000.00, 40);
