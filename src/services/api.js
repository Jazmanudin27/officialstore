import { PRODUCTS, GRID_CATEGORIES } from '../data/mockProducts';

// BASE_URL disesuaikan otomatis (jika di browser memakai relative URL, jika mobile menggunakan konfigurasi)
const BASE_URL = typeof window !== 'undefined' && window.location ? '' : 'http://localhost:5000';

export const apiService = {
  // 1. Ambil Semua Produk (dengan auto-fallback jika server database belum aktif)
  async getProducts(category = 'Semua', search = '') {
    try {
      let url = `${BASE_URL}/api/products?`;
      if (category && category !== 'Semua') url += `category=${encodeURIComponent(category)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      if (json.status === 'ok' && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    } catch (error) {
      // Fallback ke data lokal jika koneksi ke server gagal/offline
      console.warn('ℹ️ API Database offline, menggunakan data lokal resmi:', error.message);
    }

    // Filter lokal
    let results = PRODUCTS;
    if (category && category !== 'Semua') {
      results = results.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    return results;
  },

  // 2. Ambil Semua Kategori
  async getCategories() {
    try {
      const response = await fetch(`${BASE_URL}/api/categories`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      if (json.status === 'ok' && Array.isArray(json.data) && json.data.length > 0) {
        return [{ id: 'all', name: 'Semua' }, ...json.data];
      }
    } catch (error) {
      console.warn('ℹ️ Menggunakan kategori lokal:', error.message);
    }
    return GRID_CATEGORIES;
  },

  // 3. Simpan Transaksi Pesanan ke Database
  async createOrder(orderPayload) {
    try {
      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });
      const json = await response.json();
      return json;
    } catch (error) {
      console.warn('⚠️ Gagal menyimpan ke API database:', error.message);
      return {
        status: 'ok',
        fallback: true,
        data: {
          nomorPesanan: `INV-${Date.now().toString().slice(-8)}`,
          totalPembayaran: orderPayload.totalPembayaran,
        },
      };
    }
  },

  // 4. Kirim OTP ke Nomor HP
  async sendOtp(phone) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const json = await response.json();
      if (json.status === 'ok') return json;
      throw new Error(json.message || 'Gagal mengirim OTP');
    } catch (error) {
      console.warn('ℹ️ Auth API offline, menggunakan simulasi OTP:', error.message);
      return {
        status: 'ok',
        message: 'Kode OTP Demo: 123456 (Simulasi Offline)',
        data: { phone, otp: '123456' },
      };
    }
  },

  // 5. Verifikasi OTP (Login)
  async verifyOtp({ phone, otp }) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const json = await response.json();
      if (json.status === 'ok' && json.data && json.data.user) return json;
      throw new Error(json.message || 'Anda belum terdaftar, silahkan daftar terlebih dahulu.');
    } catch (error) {
      console.warn('ℹ️ Auth API response / status:', error.message);
      if (error.message && error.message.includes('terdaftar')) {
        throw error;
      }
      // Demo offline fallback (hanya untuk nomor terdaftar resmi 0895238888200)
      const cleanDigits = phone.replace(/[^0-9]/g, '');
      if (otp === '123456') {
        if (cleanDigits !== '62895238888200' && cleanDigits !== '0895238888200') {
          throw new Error('Anda belum terdaftar, silahkan daftar terlebih dahulu.');
        }
        return {
          status: 'ok',
          message: 'Login Berhasil (Demo Mode)',
          data: {
            user: {
              id: 1,
              namaLengkap: 'Ade Fitri Nuraeni',
              phone: '62895238888200',
              alamat: 'Jl. Pasir Bokor, Kp. Gunung Jambe, RT/RW 03/09, Cipawitra, Mangkubumi, Tasikmalaya',
              poin: 500,
              role: 'buyer',
            },
          },
        };
      }
      throw new Error('Kode OTP salah.');
    }
  },

  // 6. Registrasi Akun Baru
  async registerUser({ namaLengkap, phone, alamat, otp }) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaLengkap, phone, alamat, otp }),
      });
      const json = await response.json();
      if (json.status === 'ok') return json;
      throw new Error(json.message || 'Registrasi gagal');
    } catch (error) {
      console.warn('ℹ️ Auth API offline, registrasi lokal:', error.message);
      return {
        status: 'ok',
        message: 'Registrasi Berhasil (Offline Mode)',
        data: {
          user: {
            id: Date.now(),
            namaLengkap,
            phone,
            alamat,
            poin: 500,
            role: 'buyer',
          },
        },
      };
    }
  },
};

export default apiService;
