# 🗄️ Panduan Lengkap Database MySQL Official Store

Database MySQL `officialstore` sudah terintegrasi ke dalam project Official Store ini dengan arsitektur **Node.js Express REST API**.

---

## 📌 1. Konfigurasi Database (.env)

Konfigurasi database disimpan di file [`.env`](file:///.env):

```env
PORT=5000
DB_HOST=localhost
DB_USER=officialstore
DB_PASSWORD=Jazman@271998
DB_NAME=officialstore
DB_PORT=3306
```

---

## 🚀 2. Cara Inisialisasi Database (Auto Setup)

Anda dapat membuat semua tabel dan memasukkan 16 data produk resmi dari gambar hanya dengan 1 perintah:

```bash
npm run init-db
```

Perintah ini akan otomatis:
1. Menghubungkan ke MySQL dengan user `officialstore`.
2. Mengeksekusi [`server/schema.sql`](file:///server/schema.sql) (12 tabel lengkap).
3. Memasukkan data awal (seed) dari [`server/seed.sql`](file:///server/seed.sql) mencakup kategori (*AIDA, SAUS SWAN, BUMBU TABUR, dll.*), varian produk (*AB, AR, AS, BB, BP500, dll.*), dan cabang toko pickup (*PERINTIS 158, PESANTREN AMANAH, dll.*).

---

## 📡 3. Cara Menjalankan Server Backend API

### A. Menjalankan secara langsung (Development):
```bash
npm run server
```
Server akan berjalan di `http://localhost:5000`.

### B. Menjalankan di Server VPS dengan PM2 (Production / 24 Jam Nonstop):
```bash
# Install PM2 jika belum ada
npm install -g pm2

# Jalankan server
pm2 start server/index.js --name officialstore-api

# Agar otomatis jalan saat server restart
pm2 save
pm2 startup
```

---

## 🔗 4. Daftar Endpoint API yang Tersedia

| Method | Endpoint | Deskripsi |
|:---|:---|:---|
| **GET** | `/api/health` | Cek status koneksi ke MySQL |
| **GET** | `/api/categories` | Mengambil seluruh kategori produk |
| **GET** | `/api/products` | Mengambil semua produk & varian lengkap (bisa filter `?category=AIDA` atau `?search=500`) |
| **GET** | `/api/stores` | Mengambil daftar toko cabang untuk mode Pickup |
| **POST** | `/api/orders` | Menyimpan transaksi pesanan baru ke tabel `orders` & `order_items` |
| **POST** | `/api/init-db` | Trigger inisialisasi database via HTTP request |

---

## 🛡️ 5. Fitur Auto-Fallback (Tahan Gangguan)
Aplikasi frontend (`src/services/api.js`) sudah dilengkapi **Auto-Fallback**:
- Jika backend/database online: data produk real-time diambil langsung dari MySQL.
- Jika database sedang maintenance/offline: aplikasi otomatis menampilkan produk resmi lokal dari [`src/data/mockProducts.js`](file:///src/data/mockProducts.js) tanpa pernah crash atau blank putih.
