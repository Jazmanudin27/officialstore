USE officialstore;

-- Hapus data dummy lama jika ada
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

-- 3. SEED PRODUK INDUK
INSERT INTO products (product_id, category_id, nama_produk, slug, deskripsi, gambar_utama, is_populer) VALUES
(1, 1, 'AIDA Cabe Bubuk Giling Kering', 'aida-cabe-bubuk', 'Bubuk cabe kering pedas alami khas Tasikmalaya cocok untuk seblak, bakso, cilok, dan aneka camilan gurih.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80', TRUE),
(2, 2, 'Saus Swan Serbaguna', 'saus-swan-serbaguna', 'Saus lezat aroma bawang dan extra pedas mantap untuk gorengan, mie bakso, dan masakan keluarga.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80', TRUE),
(3, 3, 'Bumbu Tabur Aneka Rasa', 'bumbu-tabur-aneka-rasa', 'Bumbu tabur gurih dengan bumbu rempah pilihan untuk makaroni, kentang goreng, dan kerupuk.', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&auto=format&fit=crop&q=80', FALSE),
(4, 1, 'Cabe Bumtabur AIDA Spesial', 'cabe-bumtabur-aida', 'Kombinasi bubuk cabe pedas berpadu bumbu gurih istimewa.', 'https://images.unsplash.com/photo-1588165171080-c89acfa5a259?w=500&auto=format&fit=crop&q=80', FALSE),
(5, 4, 'Premium Pouch Kemasan Ekstra', 'premium-pouch-ekstra', 'Kemasan pouch higienis menjaga rasa dan kualitas tetap terjaga prima.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80', FALSE),
(6, 5, 'Sambal Cabe Asli', 'sambal-cabe-asli', 'Sambal cabe ulek segar pilihan terbaik dengan pedas menggigit.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', FALSE),
(7, 6, 'Saus Premium Gurih Pedas', 'saus-premium-gurih', 'Saus kental bermutu tinggi dengan cita rasa khas restoran.', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=80', FALSE),
(8, 7, 'Saosme Kemasan Hemat', 'saosme-hemat', 'Saus serbaguna ekonomis rasa istimewa untuk olahan kuliner nusantara.', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80', FALSE);

-- 4. SEED VARIAN PRODUK (SEMUA 16 ITEM DARI TABEL GAMBAR USER)
INSERT INTO product_variants (product_id, sku, nama_varian, ukuran_atau_isi, satuan, berat_gram, harga_coret, harga, stok) VALUES
-- 1. AB: AIDA BESAR 500 GR
(1, 'AB', 'AIDA BESAR 500 GR', '500', 'Gram', 500, 26000.00, 23500.00, 150),

-- 2. AR: AIDA RENTENG 25 GR
(1, 'AR', 'AIDA RENTENG 25 GR', '25', 'Renteng (10 pcs)', 300, 16500.00, 14500.00, 200),

-- 3. AS: AIDA SEDANG 250 GR
(1, 'AS', 'AIDA SEDANG 250 GR', '250', 'Gram', 250, 14000.00, 12500.00, 180),

-- 4. BB: SAUS BAWANG BALL
(2, 'BB', 'SAUS BAWANG BALL', 'Ball', 'Ball', 1000, 38000.00, 34000.00, 80),

-- 5. BP500: SAUS BP 500 GR
(2, 'BP500', 'SAUS BP 500 GR', '500', 'Gram', 500, 18000.00, 16000.00, 120),

-- 6. BR20: BUMBU TABUR
(3, 'BR20', 'BUMBU TABUR', '20', 'Gram', 20, 4500.00, 3500.00, 350),

-- 7. BR500: BUMBU TABUR 500
(3, 'BR500', 'BUMBU TABUR 500', '500', 'Gram', 500, 31000.00, 27500.00, 90),

-- 8. CBR: CABE BUMTABUR 500 GR
(4, 'CBR', 'CABE BUMTABUR 500 GR', '500', 'Gram', 500, 28000.00, 25000.00, 95),

-- 9. DEP: SAUS EXTRA PEDAS
(2, 'DEP', 'SAUS EXTRA PEDAS', '500', 'Gram', 500, 20000.00, 17500.00, 110),

-- 10. P1000: PREMIUM POUCH 1000 GR
(5, 'P1000', 'PREMIUM POUCH 1000 GR', '1000', 'Gram', 1000, 49000.00, 44000.00, 60),

-- 11. PP500: PREMIUM POUCH 500 GR
(5, 'PP500', 'PREMIUM POUCH 500 GR', '500', 'Gram', 500, 28000.00, 24500.00, 90),

-- 12. SC: SAMBAL CABE 200
(6, 'SC', 'SAMBAL CABE 200', '200', 'Gram', 200, 15000.00, 12500.00, 130),

-- 13. SP: SAUS PREMIUM
(7, 'SP', 'SAUS PREMIUM', 'Standar', 'Botol', 600, 24000.00, 21000.00, 85),

-- 14. SP500: SAUS PREMIUM 500
(7, 'SP500', 'SAUS PREMIUM 500', '500', 'Gram', 500, 22000.00, 19500.00, 100),

-- 15. SP8: SAUS STICK PREMIUM
(7, 'SP8', 'SAUS STICK PREMIUM', 'Stick', 'Pack', 400, 19000.00, 16500.00, 140),

-- 16. SS500: SAOSME 500 GR
(8, 'SS500', 'SAOSME 500 GR', '500', 'Gram', 500, 17000.00, 15000.00, 105);
