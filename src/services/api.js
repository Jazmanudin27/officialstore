import { PRODUCTS, GRID_CATEGORIES } from '../data/mockProducts';
import { storage } from '../utils/storage';

// BASE_URL disesuaikan otomatis untuk Web (Metro/Dev/Production) & Mobile
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, port, protocol } = window.location;
    // Jika di-access via Metro / Expo Web (port 8081, 19006, 3000, 8082, dst)
    if (port && port !== '5000' && port !== '80' && port !== '443') {
      return `${protocol}//${hostname}:5000`;
    }
    return '';
  }
  return 'http://localhost:5000';
};

const BASE_URL = getApiBaseUrl();

// Local cache states for offline/demo mode and instant UI reactivity
let _cachedStoreSettings = {
  nama_toko: 'Official Store Tasikmalaya',
  slogan: 'Pusat Bumbu, Saus & Cabai Asli Tasikmalaya',
  logo_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=80',
  alamat_utama: 'Jl. Perintis Kemerdekaan No. 158, Karsamenak, Kawalu, Tasikmalaya, Jawa Barat 46182',
  nomor_whatsapp: '62895238888200',
  jam_operasional: '07:00 - 22:00 WIB',
  latitude: -7.3512,
  longitude: 108.2145,
};

let _cachedProductsList = [...PRODUCTS];

let _cachedStores = [
  { id: 1, code: 'CAB-158', name: 'PERINTIS 158', address: 'Jl Perintis Kemerdekaan No 158 Rt 002 Rw 002 Kawalu', phone: '0895238888200', hours: '07:00 - 22:00', lat: -7.3512, lng: 108.2145, active: 1 },
  { id: 2, code: 'CAB-AMN', name: 'PESANTREN AMANAH', address: 'Jl Sambong Jaya No 50 Mangkubumi', phone: '081234567890', hours: '07:00 - 22:00', lat: -7.3489, lng: 108.2091, active: 1 },
  { id: 3, code: 'CAB-MGB', name: 'MANGKUBUMI 2', address: 'Jl. Mayor SL Tobing No. 42 Mangkubumi', phone: '085723456789', hours: '07:00 - 22:00', lat: -7.3412, lng: 108.2013, active: 1 },
  { id: 4, code: 'CAB-CHD', name: 'CIHIDEUNG TASIK', address: 'Jl. Cihideung Balong No. 12 Cihideung', phone: '082123456789', hours: '06:30 - 22:00', lat: -7.3325, lng: 108.2210, active: 1 },
];

let _cachedVouchersList = [
  { id: 1, code: 'OFFICIAL50', title: 'Potongan Rp 50.000', discountAmount: 50000, minSpend: 150000, quota: 50, expiryDate: '2026-12-31' },
  { id: 2, code: 'SUPERJAWARA', title: 'Diskon Spesial Rp 15.000', discountAmount: 15000, minSpend: 50000, quota: 100, expiryDate: '2026-10-15' },
];

// Restore initial state from local storage on refresh (F5)
try {
  const sSet = storage.getItem('offstore_settings');
  if (sSet) _cachedStoreSettings = JSON.parse(sSet);
  const sStores = storage.getItem('offstore_branches');
  if (sStores) _cachedStores = JSON.parse(sStores);
  const sProds = storage.getItem('offstore_products');
  if (sProds) _cachedProductsList = JSON.parse(sProds);
  const sVouchers = storage.getItem('offstore_vouchers');
  if (sVouchers) _cachedVouchersList = JSON.parse(sVouchers);
} catch (e) {
  console.warn('Cache restore warning:', e);
}

const syncStorageCache = () => {
  try {
    storage.setItem('offstore_settings', JSON.stringify(_cachedStoreSettings));
    storage.setItem('offstore_branches', JSON.stringify(_cachedStores));
    storage.setItem('offstore_products', JSON.stringify(_cachedProductsList));
    storage.setItem('offstore_vouchers', JSON.stringify(_cachedVouchersList));
  } catch (e) {
    console.warn('Cache sync warning:', e);
  }
};

// Helper untuk fetch JSON yang aman dari respon non-JSON / fallback HTML SPA
const safeFetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Respon server bukan JSON (HTML/Static fallback)');
  }
  return await response.json();
};

export const apiService = {
  // 1. Ambil Semua Produk (dengan auto-fallback jika server database belum aktif)
  async getProducts(category = 'Semua', search = '') {
    try {
      let url = `${BASE_URL}/api/products?t=${Date.now()}&`;
      if (category && category !== 'Semua') url += `category=${encodeURIComponent(category)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const json = await safeFetchJson(url);
      if (json.status === 'ok' && Array.isArray(json.data) && json.data.length > 0) {
        _cachedProductsList = json.data;
        syncStorageCache();
        return _cachedProductsList;
      }
    } catch (error) {
      console.warn('ℹ️ API Database offline, menggunakan data produk lokal:', error.message);
    }

    // Filter lokal
    let results = _cachedProductsList;
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
      const json = await safeFetchJson(`${BASE_URL}/api/categories`);
      if (json.status === 'ok' && Array.isArray(json.data) && json.data.length > 0) {
        return [{ id: 'all', name: 'Semua' }, ...json.data];
      }
    } catch (error) {
      console.warn('ℹ️ Menggunakan kategori lokal:', error.message);
    }
    return GRID_CATEGORIES;
  },

  // 2.5 Kelola Keranjang Belanja Berdasarkan User ID di Database
  async getUserCart(userId) {
    if (!userId) return [];
    try {
      const json = await safeFetchJson(`${BASE_URL}/api/cart?userId=${userId}&t=${Date.now()}`);
      if (json && json.status === 'ok' && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {
      console.warn('ℹ️ Gagal mengambil keranjang user dari database:', e.message);
    }
    try {
      const saved = storage.getItem(`official_store_cart_user_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  },

  async saveUserCart(userId, cartItems) {
    if (!userId) return;
    const items = Array.isArray(cartItems) ? cartItems : [];
    try {
      storage.setItem(`official_store_cart_user_${userId}`, JSON.stringify(items));
    } catch (e) {}

    try {
      await fetch(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cartItems: items }),
      });
    } catch (e) {
      console.warn('⚠️ Gagal menyimpan keranjang ke database server:', e.message);
    }
  },

  // 3. Simpan Transaksi Pesanan ke Database
  async createOrder(orderPayload) {
    let localOrders = [];
    try {
      const s = storage.getItem('official_store_orders');
      if (s) localOrders = JSON.parse(s);
    } catch (e) {}

    const newOrderObj = {
      id: orderPayload.nomorPesanan || `INV-${Date.now().toString().slice(-8)}`,
      nomorPesanan: orderPayload.nomorPesanan || `INV-${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      status: orderPayload.status || 'menunggu',
      statusLabel: orderPayload.status === 'diproses' ? 'Sedang Diproses' : 'Belum Bayar',
      statusBg: orderPayload.status === 'diproses' ? '#FEF3C7' : '#FEE2E2',
      statusColor: orderPayload.status === 'diproses' ? '#D97706' : '#DC2626',
      type: orderPayload.tipePesanan || 'delivery',
      typeLabel: orderPayload.tipePesanan === 'pickup' ? 'Ambil di Toko Cabang' : 'Pengiriman Reguler',
      courier: orderPayload.courier || 'J&T Express',
      shippingFee: orderPayload.ongkosKirim || 0,
      productTotal: orderPayload.totalHargaProduk || orderPayload.totalPembayaran,
      discount: orderPayload.diskonVoucher || 0,
      totalAmount: orderPayload.totalPembayaran,
      recipient: orderPayload.recipient || 'Jazmanudin',
      phone: orderPayload.phone || '089523888200',
      address: orderPayload.address || 'Jl. Pasir Bokor, Kp. Gunung Jambe, RT/RW 03/09, Cipawitra, Mangkubumi, Tasikmalaya',
      paymentMethod: orderPayload.paymentMethod || 'Midtrans / QRIS / Transfer Bank',
      items: orderPayload.items || [],
    };

    localOrders = [newOrderObj, ...localOrders];
    try {
      storage.setItem('official_store_orders', JSON.stringify(localOrders));
    } catch (e) {}

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
        data: newOrderObj,
      };
    }
  },

  // 3.8 Buat Snap Token Midtrans untuk Pembayaran Sandbox / Production
  async createMidtransSnapToken(payload) {
    try {
      const response = await fetch(`${BASE_URL}/api/payment/create-snap-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (response.ok && json.status === 'ok') {
        return json;
      }
      throw new Error(json.message || 'Gagal membuat Snap Token Midtrans.');
    } catch (err) {
      console.warn('ℹ️ Midtrans API direct fallback mode:', err.message);
      // Direct client-side request fallback to Midtrans Sandbox Snap API
      try {
        const serverKey = 'SB-Mid-server-oRFj2p6jrFzxUVGwO6Tj6w8B';
        const clientKey = 'SB-Mid-client-gtkZiSrCZjZHYwwZ';
        const authHeader = 'Basic ' + (typeof btoa !== 'undefined' ? btoa(serverKey + ':') : Buffer.from(serverKey + ':').toString('base64'));
        let formattedItems = (payload.items || []).map((it, idx) => ({
          id: String(it.id || idx + 1),
          price: parseInt(it.price, 10) || 1000,
          quantity: parseInt(it.quantity, 10) || 1,
          name: String(it.name || 'Produk Official Store').slice(0, 50),
        }));

        const itemsSum = formattedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
        const amount = Math.max(1000, parseInt(payload.grossAmount, 10) || 10000);
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

        const snapRes = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: payload.orderId || `INV-${Date.now()}`,
              gross_amount: amount,
            },
            customer_details: {
              first_name: payload.customerName || 'Pelanggan Official Store',
              phone: payload.customerPhone || '089523888200',
            },
            item_details: formattedItems.length > 0 ? formattedItems : undefined,
            enabled_payments: Array.isArray(payload.enabledPayments) && payload.enabledPayments.length > 0 ? payload.enabledPayments : undefined,
          }),
        });
        const snapJson = await snapRes.json();
        if (snapRes.ok && snapJson.token) {
          return {
            status: 'ok',
            token: snapJson.token,
            redirectUrl: snapJson.redirect_url,
            orderId: payload.orderId,
            clientKey,
          };
        }
      } catch (fallbackErr) {
        console.error('Midtrans client-side fallback error:', fallbackErr);
      }
      throw err;
    }
  },

  // 3.5 Ambil Riwayat Pesanan User Langsung dari Database MySQL
  async getUserOrders(userId) {
    let targetId = userId;
    if (!targetId) {
      try {
        const saved = storage.getItem('official_store_user_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          targetId = parsed?.id;
        }
      } catch (e) {}
    }
    targetId = targetId || 1;

    let localOrders = [];
    try {
      const s = storage.getItem('official_store_orders');
      if (s) {
        localOrders = JSON.parse(s).filter((o) => !o.userId || String(o.userId) === String(targetId));
      }
    } catch (e) {}

    try {
      const json = await safeFetchJson(`${BASE_URL}/api/user/orders?userId=${targetId}&t=${Date.now()}`);
      if (json.status === 'ok' && Array.isArray(json.data)) {
        const cleanedServerOrders = json.data.map((ord) => ({
          ...ord,
          items: (ord.items || []).map((it) => {
            let cleanImg = it.image;
            if (typeof cleanImg === 'string' && cleanImg.startsWith('data:image') && cleanImg.length > 500) {
              cleanImg = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80';
            }
            return {
              ...it,
              image: cleanImg || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80',
            };
          }),
        }));
        return cleanedServerOrders;
      }
    } catch (error) {
      console.warn('ℹ️ Gagal mengambil pesanan user dari database:', error.message);
    }
    return localOrders;
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
    } catch (err) {
      console.warn('ℹ️ Auth API offline, menggunakan simulasi OTP:', err.message);
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      return {
        status: 'ok',
        message: 'Kode OTP Demo: 123456 (Simulasi Offline)',
        data: {
          phone,
          otp: '123456',
          isRegistered: cleanPhone === '62895238888200' || cleanPhone === '0895238888200',
        },
      };
    }
  },

  // 5. Verifikasi OTP (Login User)
  async verifyOtp({ phone, otp }) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const json = await response.json();
      if (json.status === 'ok' && json.data && json.data.user) {
        return json;
      }
      throw new Error(json.message || 'Anda belum terdaftar, silahkan daftar terlebih dahulu.');
    } catch (err) {
      console.warn('ℹ️ Auth API verify error:', err.message);
      if (err.message && (err.message.includes('terdaftar') || err.message.includes('OTP') || err.message.includes('salah') || err.message.includes('kadaluarsa') || err.message.includes('tidak valid'))) {
        throw err;
      }

      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (otp === '123456') {
        if (cleanPhone !== '62895238888200' && cleanPhone !== '0895238888200') {
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

  // 6. Registrasi Akun Baru (Disimpan ke Database MySQL)
  async registerUser({ namaLengkap, phone, alamat, otp }) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaLengkap, phone, alamat, otp }),
      });
      const json = await response.json();
      if (response.ok && json.status === 'ok') {
        return json;
      }
      throw new Error(json.message || 'Registrasi gagal disimpan ke database');
    } catch (err) {
      console.error('❌ Auth API register error:', err.message);
      throw err;
    }
  },

  // Admin Login (Validasi Langsung dari Database MySQL Server)
  async adminLogin(credentials) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const json = await response.json();
      if (response.ok && json.status === 'ok') {
        return json;
      }
      throw new Error(json.message || 'Login admin gagal');
    } catch (error) {
      console.error('❌ Admin Login error:', error.message);
      throw error;
    }
  },

  // 7. Admin: Get Overview Stats
  async getAdminStats() {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/stats`);
      if (response.ok) {
        const json = await response.json();
        if (json.status === 'ok') return json.data;
      }
    } catch (e) {
      console.warn('ℹ️ Admin stats fallback:', e.message);
    }
    return {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: _cachedProductsList.length || 16,
      totalUsers: 0,
    };
  },

  // 8. Admin: Create Product
  async createProduct(productData) {
    const newProd = { id: `p_${Date.now()}`, ...productData };
    _cachedProductsList = [newProd, ..._cachedProductsList];
    syncStorageCache();
    try {
      const response = await fetch(`${BASE_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const json = await response.json();
      if (json.status === 'ok' && json.data) {
        if (json.data.id) newProd.id = json.data.id;
        syncStorageCache();
      }
      return json;
    } catch (e) {
      console.warn('ℹ️ Product creation offline fallback:', e.message);
      return {
        status: 'ok',
        message: 'Produk berhasil ditambahkan',
        data: newProd,
      };
    }
  },

  // 9. Admin: Update Product
  async updateProduct(id, productData) {
    _cachedProductsList = _cachedProductsList.map((p) =>
      String(p.id) === String(id) || String(p.productId) === String(id) || (p.sku && productData.sku && p.sku === productData.sku)
        ? { ...p, ...productData }
        : p
    );
    syncStorageCache();
    try {
      const response = await fetch(`${BASE_URL}/api/admin/products/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const json = await response.json();
      if (!response.ok || json.status !== 'ok') {
        throw new Error(json.message || 'Gagal menyimpan ke database server MySQL');
      }
      return json;
    } catch (e) {
      console.warn('ℹ️ Product update error:', e.message);
      throw e;
    }
  },

  // 10. Admin: Delete Product
  async deleteProduct(id) {
    _cachedProductsList = _cachedProductsList.filter((p) => String(p.id) !== String(id));
    syncStorageCache();
    try {
      const response = await fetch(`${BASE_URL}/api/admin/products/${id}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json();
      return json;
    } catch (e) {
      return { status: 'ok', message: 'Produk dihapus' };
    }
  },

  // 11. Admin: Get Vouchers
  async getAdminVouchers() {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/vouchers`);
      if (response.ok) {
        const json = await response.json();
        if (json.status === 'ok') {
          _cachedVouchersList = json.data;
          return _cachedVouchersList;
        }
      }
    } catch (e) {
      console.warn('ℹ️ Admin vouchers fallback:', e.message);
    }
    return _cachedVouchersList;
  },

  // 12. Admin: Create Voucher
  async createVoucher(voucherData) {
    const newVoucher = { id: Date.now(), ...voucherData };
    _cachedVouchersList = [newVoucher, ..._cachedVouchersList];
    try {
      const response = await fetch(`${BASE_URL}/api/admin/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData),
      });
      return await response.json();
    } catch (e) {
      return { status: 'ok', message: 'Voucher dibuat', data: newVoucher };
    }
  },

  // 13. Admin: Delete Voucher
  async deleteVoucher(id) {
    _cachedVouchersList = _cachedVouchersList.filter((v) => String(v.id) !== String(id));
    try {
      const response = await fetch(`${BASE_URL}/api/admin/vouchers/${id}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (e) {
      return { status: 'ok', message: 'Voucher dihapus' };
    }
  },

  async getAdminOrders() {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/orders`);
      if (response.ok) {
        const json = await response.json();
        if (json.status === 'ok' && Array.isArray(json.data)) return json.data;
      }
    } catch (e) {
      console.warn('ℹ️ Admin orders fallback:', e.message);
    }
    return [];
  },

  // 15. Admin: Update Order Status
  async updateOrderStatus(id, statusData) {
    try {
      let localOrders = [];
      try {
        const stored = storage.getItem('official_store_orders');
        if (stored) localOrders = JSON.parse(stored);
      } catch (e) {}

      const targetStatus = typeof statusData === 'object' ? statusData.status : statusData;
      const trackingNumber = typeof statusData === 'object' ? statusData.trackingNumber : null;

      localOrders = localOrders.map((o) => {
        if (String(o.id) === String(id) || String(o.nomorPesanan) === String(id) || String(o.orderId) === String(id)) {
          return {
            ...o,
            status: targetStatus,
            trackingNumber: trackingNumber || o.trackingNumber,
            statusLabel: targetStatus === 'diproses' ? 'Sedang Diproses' : targetStatus === 'dikemas' ? 'Sedang Dikemas' : targetStatus === 'dikirim' ? 'Dalam Pengiriman' : targetStatus === 'selesai' ? 'Pesanan Selesai' : o.statusLabel,
          };
        }
        return o;
      });

      try {
        storage.setItem('official_store_orders', JSON.stringify(localOrders));
      } catch (e) {}
    } catch (e) {}

    try {
      const response = await fetch(`${BASE_URL}/api/admin/orders/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typeof statusData === 'object' ? statusData : { status: statusData }),
      });
      return await response.json();
    } catch (e) {
      return { status: 'ok', message: 'Status pesanan diperbarui' };
    }
  },

  // 16. Admin & Public: Store Settings
  async getStoreSettings() {
    try {
      const json = await safeFetchJson(`${BASE_URL}/api/admin/settings`);
      if (json.status === 'ok' && json.data) {
        _cachedStoreSettings = { ..._cachedStoreSettings, ...json.data };
        syncStorageCache();
        return _cachedStoreSettings;
      }
    } catch (e) {
      console.warn('ℹ️ Store settings fallback:', e.message);
    }
    return _cachedStoreSettings;
  },

  async updateStoreSettings(settingsData) {
    _cachedStoreSettings = { ..._cachedStoreSettings, ...settingsData };
    syncStorageCache();
    try {
      const response = await fetch(`${BASE_URL}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });
      const json = await response.json();
      if (!response.ok || json.status !== 'ok') {
        throw new Error(json.message || 'Gagal menyimpan ke database server');
      }
      if (json.data) {
        _cachedStoreSettings = { ..._cachedStoreSettings, ...json.data };
        syncStorageCache();
      }
      return json;
    } catch (e) {
      console.warn('ℹ️ Store settings update fallback:', e.message);
      syncStorageCache();
      return { status: 'ok', message: 'Pengaturan toko berhasil diperbarui!', data: _cachedStoreSettings };
    }
  },

  // 17. Admin & Public: Branch Stores Management
  async getAdminStores() {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/stores`);
      if (response.ok) {
        const json = await response.json();
        if (json.status === 'ok' && Array.isArray(json.data)) {
          _cachedStores = json.data;
          syncStorageCache();
          return _cachedStores;
        }
      }
    } catch (e) {
      console.warn('ℹ️ Admin stores fallback:', e.message);
    }
    return _cachedStores;
  },

  async createAdminStore(storeData) {
    const newStore = { id: Date.now(), ...storeData, active: 1 };
    _cachedStores = [newStore, ..._cachedStores];
    syncStorageCache();
    try {
      const response = await fetch(`${BASE_URL}/api/admin/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
      });
      const json = await response.json();
      if (json.status === 'ok' && json.data) {
        _cachedStores = _cachedStores.map((s) => (s.id === newStore.id ? { ...s, ...json.data } : s));
        syncStorageCache();
      }
      return json;
    } catch (e) {
      syncStorageCache();
      return { status: 'ok', message: 'Cabang toko ditambahkan', data: newStore };
    }
  },

  async updateAdminStore(id, storeData) {
    _cachedStores = _cachedStores.map((st) =>
      String(st.id) === String(id) ? { ...st, ...storeData } : st
    );
    syncStorageCache();
    try {
      const response = await fetch(`${BASE_URL}/api/admin/stores/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
      });
      return await response.json();
    } catch (e) {
      syncStorageCache();
      return { status: 'ok', message: 'Cabang toko diperbarui' };
    }
  },

  async deleteAdminStore(id) {
    _cachedStores = _cachedStores.filter((st) => String(st.id) !== String(id));
    syncStorageCache();
    try {
      const response = await fetch(`${BASE_URL}/api/admin/stores/${id}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (e) {
      syncStorageCache();
      return { status: 'ok', message: 'Cabang toko dihapus' };
    }
  },
};

export default apiService;
