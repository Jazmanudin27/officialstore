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
};

export default apiService;
