import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';
import { apiService } from '../services/api';
import OrderDetailModal from './OrderDetailModal';

export default function AdminDashboardScreen({
  visible = true,
  onClose,
  onRefreshProducts,
  onUpdateStoreSettings,
  adminUser,
  onLogout,
  showGoToStore = true,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'products' | 'vouchers' | 'orders'
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
  const [products, setProducts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals for Create/Edit
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields for Product
  const [formProdName, setFormProdName] = useState('');
  const [formProdCategory, setFormProdCategory] = useState('AIDA');
  const [formProdSku, setFormProdSku] = useState('');
  const [formProdPrice, setFormProdPrice] = useState('');
  const [formProdOriginalPrice, setFormProdOriginalPrice] = useState('');
  const [formProdStock, setFormProdStock] = useState('100');
  const [formProdImage, setFormProdImage] = useState('');
  const [formProdDesc, setFormProdDesc] = useState('');

  // Voucher Form Modal
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [formVoucherCode, setFormVoucherCode] = useState('');
  const [formVoucherTitle, setFormVoucherTitle] = useState('');
  const [formVoucherDiscount, setFormVoucherDiscount] = useState('');
  const [formVoucherMinSpend, setFormVoucherMinSpend] = useState('0');
  const [formVoucherQuota, setFormVoucherQuota] = useState('100');

  // Store Settings state
  const [storeSettings, setStoreSettings] = useState(null);
  const [formSettingName, setFormSettingName] = useState('');
  const [formSettingSlogan, setFormSettingSlogan] = useState('');
  const [formSettingLogo, setFormSettingLogo] = useState('');
  const [formSettingAddress, setFormSettingAddress] = useState('');
  const [formSettingWhatsapp, setFormSettingWhatsapp] = useState('');
  const [formSettingHours, setFormSettingHours] = useState('');
  const [formSettingLat, setFormSettingLat] = useState('');
  const [formSettingLng, setFormSettingLng] = useState('');

  // Branch Stores state
  const [storesList, setStoresList] = useState([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formBranchCode, setFormBranchCode] = useState('');
  const [formBranchName, setFormBranchName] = useState('');
  const [formBranchAddress, setFormBranchAddress] = useState('');
  const [formBranchPhone, setFormBranchPhone] = useState('');
  const [formBranchHours, setFormBranchHours] = useState('');
  const [formBranchLat, setFormBranchLat] = useState('');
  const [formBranchLng, setFormBranchLng] = useState('');

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, prodsData, vKimData, ordsData, settingsData, storesData] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getProducts('Semua', ''),
        apiService.getAdminVouchers(),
        apiService.getAdminOrders(),
        apiService.getStoreSettings(),
        apiService.getAdminStores(),
      ]);

      if (statsData) setStats(statsData);
      if (prodsData) setProducts(prodsData);
      if (vKimData) setVouchers(vKimData);
      if (ordsData) setOrders(ordsData);
      if (settingsData) {
        setStoreSettings(settingsData);
        setFormSettingName(settingsData.nama_toko || '');
        setFormSettingSlogan(settingsData.slogan || '');
        setFormSettingLogo(settingsData.logo_url || '');
        setFormSettingAddress(settingsData.alamat_utama || '');
        setFormSettingWhatsapp(settingsData.nomor_whatsapp || '');
        setFormSettingHours(settingsData.jam_operasional || '');
        setFormSettingLat(String(settingsData.latitude || ''));
        setFormSettingLng(String(settingsData.longitude || ''));
      }
      if (storesData) setStoresList(storesData);
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  // Save Store Settings Handler
  const handleSaveStoreSettings = async () => {
    if (!formSettingName || !formSettingAddress) {
      Alert.alert('Perhatian', 'Nama Toko dan Alamat Utama wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nama_toko: formSettingName,
        slogan: formSettingSlogan,
        logo_url: formSettingLogo,
        alamat_utama: formSettingAddress,
        nomor_whatsapp: formSettingWhatsapp,
        jam_operasional: formSettingHours,
        latitude: parseFloat(formSettingLat) || -7.3512,
        longitude: parseFloat(formSettingLng) || 108.2145,
      };

      const res = await apiService.updateStoreSettings(payload);
      if (res && res.status === 'ok') {
        const savedData = res.data || payload;
        setStoreSettings(savedData);
        setFormSettingName(savedData.nama_toko || formSettingName);
        setFormSettingSlogan(savedData.slogan || formSettingSlogan);
        setFormSettingLogo(savedData.logo_url || formSettingLogo);
        setFormSettingAddress(savedData.alamat_utama || formSettingAddress);
        setFormSettingWhatsapp(savedData.nomor_whatsapp || formSettingWhatsapp);
        setFormSettingHours(savedData.jam_operasional || formSettingHours);
        setFormSettingLat(String(savedData.latitude || formSettingLat));
        setFormSettingLng(String(savedData.longitude || formSettingLng));

        if (onUpdateStoreSettings) {
          onUpdateStoreSettings(savedData);
        }

        Alert.alert('Sukses', `Pengaturan toko "${savedData.nama_toko}" berhasil diperbarui!`);
      } else {
        throw new Error(res?.message || 'Gagal menyimpan pengaturan toko');
      }
    } catch (e) {
      Alert.alert('Gagal', e.message || 'Gagal menyimpan pengaturan toko');
    } finally {
      setLoading(false);
    }
  };

  // Branch Store Handlers
  const openBranchForm = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormBranchCode(branch.code || '');
      setFormBranchName(branch.name || '');
      setFormBranchAddress(branch.address || '');
      setFormBranchPhone(branch.phone || '');
      setFormBranchHours(branch.hours || '07:00 - 22:00');
      setFormBranchLat(String(branch.lat || -7.3512));
      setFormBranchLng(String(branch.lng || 108.2145));
    } else {
      setEditingBranch(null);
      setFormBranchCode(`CAB-${Date.now().toString().slice(-4)}`);
      setFormBranchName('');
      setFormBranchAddress('');
      setFormBranchPhone('');
      setFormBranchHours('07:00 - 22:00');
      setFormBranchLat('-7.3512');
      setFormBranchLng('108.2145');
    }
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async () => {
    if (!formBranchName || !formBranchAddress) {
      Alert.alert('Perhatian', 'Nama Cabang dan Alamat wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        code: formBranchCode,
        name: formBranchName,
        address: formBranchAddress,
        phone: formBranchPhone,
        hours: formBranchHours,
        lat: parseFloat(formBranchLat) || -7.3512,
        lng: parseFloat(formBranchLng) || 108.2145,
      };
      if (editingBranch) {
        await apiService.updateAdminStore(editingBranch.id, payload);
      } else {
        await apiService.createAdminStore(payload);
      }
      setIsBranchModalOpen(false);
      loadData();
      Alert.alert('Sukses', editingBranch ? 'Data cabang diperbarui!' : 'Cabang toko baru ditambahkan!');
    } catch (e) {
      Alert.alert('Gagal', e.message || 'Gagal menyimpan data cabang');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = (branch) => {
    Alert.alert('Hapus Cabang', `Nonaktifkan cabang "${branch.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await apiService.deleteAdminStore(branch.id);
            loadData();
          } catch (e) {
            console.warn(e);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // Open Form Product Modal (Create / Edit)
  const openProductForm = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormProdName(prod.name || '');
      setFormProdCategory(prod.category || 'AIDA');
      setFormProdSku(prod.sku || '');
      setFormProdPrice(String(prod.price || ''));
      setFormProdOriginalPrice(prod.originalPrice ? String(prod.originalPrice) : '');
      setFormProdStock(String(prod.stock || 100));
      setFormProdImage(prod.image || '');
      setFormProdDesc(prod.description || '');
    } else {
      setEditingProduct(null);
      setFormProdName('');
      setFormProdCategory('AIDA');
      setFormProdSku(`SKU-${Date.now().toString().slice(-5)}`);
      setFormProdPrice('');
      setFormProdOriginalPrice('');
      setFormProdStock('100');
      setFormProdImage('https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80');
      setFormProdDesc('Produk Resmi Official Store - Terjamin 100% Asli');
    }
    setIsProductModalOpen(true);
  };

  // Helper to compress uploaded image files to fast, lightweight Data URLs (~100KB)
  const compressImageFile = (file, maxDim = 1000, quality = 0.8, onComplete) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        onComplete(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Pick & Upload Product Photo from Laptop / Mobile Device
  const handlePickProductImage = () => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            Alert.alert('Ukuran File Terlalu Besar', 'Maksimal ukuran foto adalah 10 MB.');
            return;
          }
          compressImageFile(file, 1000, 0.82, (compressedDataUrl) => {
            setFormProdImage(compressedDataUrl);
          });
        }
      };
      input.click();
    } else {
      Alert.alert('Upload Foto', 'Silahkan gunakan web browser di laptop/HP untuk memilih file foto langsung dari galeri.');
    }
  };

  // Pick & Upload Store Logo from Laptop / Mobile Device
  const handlePickLogoImage = () => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            Alert.alert('Ukuran File Terlalu Besar', 'Maksimal ukuran foto logo adalah 10 MB.');
            return;
          }
          compressImageFile(file, 800, 0.85, (compressedDataUrl) => {
            setFormSettingLogo(compressedDataUrl);
          });
        }
      };
      input.click();
    } else {
      Alert.alert('Upload Logo', 'Silahkan gunakan web browser di laptop/HP untuk memilih file logo dari galeri.');
    }
  };

  // Save Product (Insert or Update)
  const handleSaveProduct = async () => {
    if (!formProdName || !formProdPrice) {
      Alert.alert('Perhatian', 'Nama Produk dan Harga wajib diisi.');
      return;
    }

    const payload = {
      name: formProdName,
      category: formProdCategory,
      sku: formProdSku,
      price: Number(formProdPrice),
      originalPrice: formProdOriginalPrice ? Number(formProdOriginalPrice) : null,
      stock: Number(formProdStock || 100),
      image: formProdImage || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80',
      description: formProdDesc,
    };

    setLoading(true);
    try {
      if (editingProduct) {
        const res = await apiService.updateProduct(editingProduct.id, payload);
        if (res && res.status === 'error') {
          throw new Error(res.message || 'Gagal menyimpan ke database server MySQL');
        }
        Alert.alert('Sukses', `Produk "${formProdName}" berhasil diperbarui di database!`);
      } else {
        const res = await apiService.createProduct(payload);
        if (res && res.status === 'error') {
          throw new Error(res.message || 'Gagal menambahkan ke database server MySQL');
        }
        Alert.alert('Sukses', `Produk baru "${formProdName}" berhasil disimpan ke database!`);
      }
      setIsProductModalOpen(false);
      await loadData();
      if (onRefreshProducts) onRefreshProducts();
    } catch (err) {
      Alert.alert('Gagal Simpan', err.message || 'Gagal menyimpan produk ke database MySQL.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = (prod) => {
    const msg = `Hapus / non-aktifkan produk "${prod.name}"?`;
    const doDelete = async () => {
      setLoading(true);
      try {
        await apiService.deleteProduct(prod.id);
        loadData();
        if (onRefreshProducts) onRefreshProducts();
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm(msg)) doDelete();
    } else {
      Alert.alert('Konfirmasi Hapus', msg, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // Create Voucher
  const handleSaveVoucher = async () => {
    if (!formVoucherCode || !formVoucherTitle || !formVoucherDiscount) {
      Alert.alert('Perhatian', 'Kode Voucher, Judul, dan Nilai Diskon wajib diisi.');
      return;
    }

    const payload = {
      code: formVoucherCode.toUpperCase(),
      title: formVoucherTitle,
      discountAmount: Number(formVoucherDiscount),
      minSpend: Number(formVoucherMinSpend || 0),
      quota: Number(formVoucherQuota || 100),
      expiryDate: '2026-12-31',
    };

    setLoading(true);
    try {
      await apiService.createVoucher(payload);
      Alert.alert('Sukses', `Voucher "${formVoucherCode.toUpperCase()}" berhasil dibuat!`);
      setIsVoucherModalOpen(false);
      setFormVoucherCode('');
      setFormVoucherTitle('');
      setFormVoucherDiscount('');
      loadData();
    } catch (e) {
      Alert.alert('Gagal', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Voucher
  const handleDeleteVoucher = (vId) => {
    const msg = 'Apakah Anda yakin ingin menghapus kode voucher ini?';
    const doDelete = async () => {
      await apiService.deleteVoucher(vId);
      loadData();
    };

    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm(msg)) doDelete();
    } else {
      Alert.alert('Hapus Voucher', msg, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // Update Order Status (Cross-platform Web & Mobile + Instant Local UI State Update)
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const labels = {
      diproses: 'Terima Pesanan (Diproses)',
      dikemas: 'Kemas Pesanan (Dikemas)',
      dikirim: 'Kirim Pesanan (Dikirim)',
      selesai: 'Selesai Pesanan (Selesai)',
    };
    const targetLabel = labels[newStatus] || newStatus;

    const executeUpdate = async () => {
      let trackingNumber = undefined;
      if (newStatus === 'shipped' || newStatus === 'dikirim') {
        trackingNumber = `REG-${Date.now().toString().slice(-8)}`;
      }

      // 1. Instant local state update for immediate UI response
      setOrders((prevOrders) =>
        (Array.isArray(prevOrders) ? prevOrders : []).map((o) => {
          if (
            String(o.id) === String(orderId) ||
            String(o.dbId) === String(orderId) ||
            String(o.orderNumber) === String(orderId) ||
            String(o.nomorPesanan) === String(orderId)
          ) {
            return {
              ...o,
              status: newStatus,
              trackingNumber: trackingNumber || o.trackingNumber,
              statusLabel:
                newStatus === 'diproses'
                  ? 'DIPROSES'
                  : newStatus === 'dikemas'
                  ? 'DIKEMAS'
                  : newStatus === 'dikirim'
                  ? 'DIKIRIM'
                  : newStatus === 'selesai'
                  ? 'SELESAI'
                  : o.statusLabel,
            };
          }
          return o;
        })
      );

      // 2. Persist to API & Storage
      try {
        await apiService.updateOrderStatus(orderId, { status: newStatus, trackingNumber });
        await loadData();
      } catch (err) {
        console.warn('⚠️ Gagal update status di backend:', err.message);
      }
    };

    const confirmMsg = `Ubah status pesanan #${orderId} menjadi "${targetLabel}"?`;

    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm(confirmMsg)) {
        executeUpdate();
      }
    } else {
      Alert.alert('Ubah Status Pesanan', confirmMsg, [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Ubah',
          onPress: executeUpdate,
        },
      ]);
    }
  };

  if (!visible) return null;

  const filteredProducts = (Array.isArray(products) ? products : []).filter((p) =>
    (p?.name || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
    (p?.sku && String(p.sku).toLowerCase().includes((productSearch || '').toLowerCase()))
  );

  const isCodOrder = (ord) => {
    const pm = String(
      ord?.paymentMethod || ord?.metodePembayaran || ord?.payment_method || ord?.catatanPesanan || ''
    ).toLowerCase();
    return pm.includes('cod') || pm.includes('tempat') || ord?.isCod === true;
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((o) => {
    const st = String(o?.status || '').toLowerCase().trim();
    const isCod = isCodOrder(o);

    if (orderStatusFilter === 'all') return true;

    // 1. Menunggu Pembayaran (Pesanan Non-COD yang belum dibayar)
    if (orderStatusFilter === 'unpaid' || orderStatusFilter === 'menunggu_pembayaran') {
      return !isCod && (st === 'menunggu' || st === 'pending' || st === 'unpaid' || st === 'belum_bayar');
    }

    // 2. Belum Diproses (Pesanan COD baru ATAU Pesanan Non-COD yang sudah dibayar tetapi belum diterima admin)
    if (orderStatusFilter === 'pending' || orderStatusFilter === 'unprocessed' || orderStatusFilter === 'belum_diproses') {
      if (isCod) {
        return st === 'menunggu' || st === 'pending' || st === 'unprocessed' || st === 'belum_diproses';
      } else {
        return st === 'paid' || st === 'sudah_bayar' || st === 'terbayar' || st === 'unprocessed' || st === 'belum_diproses';
      }
    }

    // 3. Diproses (Pesanan yang sudah diklik Terima Pesanan oleh Admin)
    if (orderStatusFilter === 'processing' || orderStatusFilter === 'diproses') {
      return st === 'processing' || st === 'diproses';
    }

    // 4. Dikemas (Pesanan yang sedang dikemas)
    if (orderStatusFilter === 'packing' || orderStatusFilter === 'dikemas') {
      return st === 'packing' || st === 'dikemas';
    }

    // 5. Dikirim (Pesanan dalam pengiriman kurir)
    if (orderStatusFilter === 'shipped' || orderStatusFilter === 'dikirim') {
      return st === 'shipped' || st === 'dikirim';
    }

    // 6. Selesai (Pesanan selesai)
    if (orderStatusFilter === 'completed' || orderStatusFilter === 'selesai') {
      return st === 'completed' || st === 'selesai';
    }

    // 7. Dibatalkan (Pesanan dibatalkan)
    if (orderStatusFilter === 'cancelled' || orderStatusFilter === 'dibatalkan') {
      return st === 'cancelled' || st === 'dibatalkan';
    }

    return st === orderStatusFilter;
  });

  const filteredBranches = (Array.isArray(storesList) ? storesList : []).filter((st) =>
    (st?.name || '').toLowerCase().includes((branchSearch || '').toLowerCase()) ||
    (st?.code || '').toLowerCase().includes((branchSearch || '').toLowerCase()) ||
    (st?.address || '').toLowerCase().includes((branchSearch || '').toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Admin Bar */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>⚙️ Admin Dashboard</Text>
              <Text style={styles.headerSub}>Pengelola Data Toko Official Store</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {showGoToStore && onClose && (
              <TouchableOpacity style={styles.closeShopBtn} onPress={onClose} activeOpacity={0.8}>
                <Ionicons name="storefront" size={16} color="#B91C1C" />
                <Text style={styles.closeShopText}>Toko Online</Text>
              </TouchableOpacity>
            )}

            {onLogout && (
              <TouchableOpacity
                style={[styles.closeShopBtn, { backgroundColor: '#FEE2E2', marginLeft: 8 }]}
                onPress={onLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={16} color="#DC2626" />
                <Text style={[styles.closeShopText, { color: '#DC2626' }]}>Keluar Admin</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Navigation Tabs Bar */}
        <View style={styles.tabsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'stats' && styles.tabBtnActive]}
              onPress={() => setActiveTab('stats')}
              activeOpacity={0.8}
            >
              <Ionicons name="pie-chart-outline" size={18} color={activeTab === 'stats' ? '#D91E28' : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>Ringkasan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'products' && styles.tabBtnActive]}
              onPress={() => setActiveTab('products')}
              activeOpacity={0.8}
            >
              <Ionicons name="cube-outline" size={18} color={activeTab === 'products' ? '#D91E28' : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
                Kelola Produk ({products.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'vouchers' && styles.tabBtnActive]}
              onPress={() => setActiveTab('vouchers')}
              activeOpacity={0.8}
            >
              <Ionicons name="pricetag-outline" size={18} color={activeTab === 'vouchers' ? '#D91E28' : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'vouchers' && styles.tabTextActive]}>
                Voucher & Promo ({vouchers.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
              onPress={() => setActiveTab('orders')}
              activeOpacity={0.8}
            >
              <Ionicons name="receipt-outline" size={18} color={activeTab === 'orders' ? '#D91E28' : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
                Pesanan Masuk ({orders.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'stores' && styles.tabBtnActive]}
              onPress={() => setActiveTab('stores')}
              activeOpacity={0.8}
            >
              <Ionicons name="business-outline" size={18} color={activeTab === 'stores' ? '#D91E28' : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'stores' && styles.tabTextActive]}>
                Cabang Toko ({storesList.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'settings' && styles.tabBtnActive]}
              onPress={() => setActiveTab('settings')}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={18} color={activeTab === 'settings' ? '#D91E28' : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
                Pengaturan Toko
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content Container */}
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {loading && <ActivityIndicator size="large" color="#D91E28" style={{ marginVertical: 20 }} />}

          {/* TAB 1: OVERVIEW STATS */}
          {activeTab === 'stats' && (
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>📊 Ringkasan Kinerja Toko</Text>

              {/* Stats Grid Cards */}
              <View style={[styles.statsGrid, isDesktop && styles.statsGridDesktop]}>
                <View style={[styles.statCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                  <Ionicons name="wallet-outline" size={28} color="#2563EB" />
                  <Text style={styles.statLabel}>Total Omset Penjualan</Text>
                  <Text style={[styles.statValue, { color: '#1E40AF' }]}>{formatRupiah(stats.totalSales)}</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                  <Ionicons name="bag-handle-outline" size={28} color="#D91E28" />
                  <Text style={styles.statLabel}>Total Pesanan Masuk</Text>
                  <Text style={[styles.statValue, { color: '#991B1B' }]}>{stats.totalOrders} Transaksi</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                  <Ionicons name="cube-outline" size={28} color="#16A34A" />
                  <Text style={styles.statLabel}>Total Produk Aktif</Text>
                  <Text style={[styles.statValue, { color: '#166534' }]}>{stats.totalProducts} Produk</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                  <Ionicons name="people-outline" size={28} color="#D97706" />
                  <Text style={styles.statLabel}>Total Terdaftar</Text>
                  <Text style={[styles.statValue, { color: '#92400E' }]}>{stats.totalUsers} Pengguna</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🚀 Akses Cepat Pengelolaan</Text>
              <View style={styles.quickActionRow}>
                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={() => openProductForm()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.quickActionBtnText}>+ Tambah Produk Baru</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickActionBtn, { backgroundColor: '#0284C7' }]}
                  onPress={() => setIsVoucherModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pricetag-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.quickActionBtnText}>+ Buat Kode Voucher</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB 2: KELOLA PRODUK */}
          {activeTab === 'products' && (
            <View style={styles.sectionWrap}>
              <View style={styles.topActionHeader}>
                <View style={styles.searchBarBox}>
                  <Ionicons name="search" size={18} color="#64748B" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Cari nama produk / SKU..."
                    placeholderTextColor="#94A3B8"
                    value={productSearch}
                    onChangeText={setProductSearch}
                  />
                </View>

                <TouchableOpacity style={styles.addBtnHeader} onPress={() => openProductForm()} activeOpacity={0.85}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addBtnHeaderText}>Tambah Produk</Text>
                </TouchableOpacity>
              </View>

              {/* Products Table List */}
              {filteredProducts.map((item) => (
                <View key={item.id} style={styles.tableRowCard}>
                  <Image source={{ uri: item.image }} style={styles.productThumb} />
                  <View style={styles.productMetaBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.productMetaTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.badgeCategory}>
                        <Text style={styles.badgeCategoryText}>{item.category || 'AIDA'}</Text>
                      </View>
                    </View>
                    <Text style={styles.productMetaSku}>SKU: {item.sku || 'SKU-001'} | Stok: {item.stock || 100}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productMetaPrice}>{formatRupiah(item.price)}</Text>
                      {item.originalPrice && (
                        <Text style={styles.productMetaOriginalPrice}>{formatRupiah(item.originalPrice)}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.actionBtnGroup}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openProductForm(item)} activeOpacity={0.7}>
                      <Ionicons name="pencil" size={16} color="#0284C7" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteProduct(item)} activeOpacity={0.7}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 3: KELOLA PROMO & VOUCHER */}
          {activeTab === 'vouchers' && (
            <View style={styles.sectionWrap}>
              <View style={styles.topActionHeader}>
                <Text style={styles.sectionTitle}>🏷️ Daftar Voucher & Kode Promo</Text>
                <TouchableOpacity
                  style={styles.addBtnHeader}
                  onPress={() => setIsVoucherModalOpen(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addBtnHeaderText}>Buat Voucher</Text>
                </TouchableOpacity>
              </View>

              {vouchers.map((v) => (
                <View key={v.id} style={styles.voucherCardRow}>
                  <View style={styles.voucherIconCircle}>
                    <Ionicons name="pricetag" size={22} color="#D91E28" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.voucherCodeText}>{v.code}</Text>
                    <Text style={styles.voucherTitleText}>{v.title}</Text>
                    <Text style={styles.voucherSubText}>
                      Potongan: {formatRupiah(v.discountAmount)} | Min. Belanja: {formatRupiah(v.minSpend || 0)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteVoucher(v.id)} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* TAB 4: KELOLA PESANAN MASUK */}
          {activeTab === 'orders' && (
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>📋 Kelola Pesanan Masuk</Text>

              {/* Status Filter Horizontal */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orderFilterScroll}>
                {['all', 'unpaid', 'pending', 'processing', 'packing', 'shipped', 'completed', 'cancelled'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.filterPill, orderStatusFilter === st && styles.filterPillActive]}
                    onPress={() => setOrderStatusFilter(st)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterPillText, orderStatusFilter === st && styles.filterPillTextActive]}>
                      {st === 'all'
                        ? 'Semua'
                        : st === 'unpaid'
                        ? 'Menunggu Pembayaran'
                        : st === 'pending'
                        ? 'Belum Diproses'
                        : st === 'processing'
                        ? 'Diproses'
                        : st === 'packing'
                        ? 'Dikemas'
                        : st === 'shipped'
                        ? 'Dikirim'
                        : st === 'completed'
                        ? 'Selesai'
                        : 'Dibatalkan'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredOrders.length === 0 ? (
                <View style={{ backgroundColor: '#FFFFFF', padding: 36, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="receipt-outline" size={32} color="#D91E28" />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 }}>
                    Belum Ada Pesanan Masuk
                  </Text>
                  <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', maxWidth: 360 }}>
                    Semua transaksi pesanan yang dibuat oleh pelanggan di database akan otomatis muncul di sini.
                  </Text>
                </View>
              ) : (
                filteredOrders.map((ord) => (
                  <TouchableOpacity
                    key={ord.id}
                    style={styles.orderCard}
                    onPress={() => setSelectedOrderForDetail(ord)}
                    activeOpacity={0.92}
                  >
                    <View style={styles.orderHeaderRow}>
                      <View>
                        <Text style={styles.orderNumberText}>{ord.orderNumber || ord.id}</Text>
                        <Text style={styles.orderDateText}>{ord.date}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          ord.status === 'completed' || ord.status === 'selesai'
                            ? { backgroundColor: '#DCFCE7' }
                            : ord.status === 'shipped' || ord.status === 'dikirim'
                            ? { backgroundColor: '#E0F2FE' }
                            : ord.status === 'packing' || ord.status === 'dikemas'
                            ? { backgroundColor: '#F3E8FF' }
                            : ord.status === 'processing' || ord.status === 'diproses'
                            ? { backgroundColor: '#DBEAFE' }
                            : (!isCodOrder(ord) && (ord.status === 'pending' || ord.status === 'menunggu' || ord.status === 'unpaid' || ord.status === 'belum_bayar'))
                            ? { backgroundColor: '#FEF3C7' }
                            : { backgroundColor: '#FEE2E2' },
                        ]}
                      >
                        <Text style={[
                          styles.statusBadgeText,
                          (ord.status === 'completed' || ord.status === 'selesai') && { color: '#16A34A' },
                          (ord.status === 'shipped' || ord.status === 'dikirim') && { color: '#0284C7' },
                          (ord.status === 'packing' || ord.status === 'dikemas') && { color: '#7C3AED' },
                          (ord.status === 'processing' || ord.status === 'diproses') && { color: '#2563EB' },
                          (!isCodOrder(ord) && (ord.status === 'pending' || ord.status === 'menunggu' || ord.status === 'unpaid' || ord.status === 'belum_bayar')) && { color: '#D97706' },
                          ((isCodOrder(ord) && (ord.status === 'pending' || ord.status === 'menunggu')) || ord.status === 'paid' || ord.status === 'sudah_bayar') && { color: '#DC2626' },
                        ]}>
                          {!isCodOrder(ord) && (ord.status === 'pending' || ord.status === 'menunggu' || ord.status === 'unpaid' || ord.status === 'belum_bayar')
                            ? 'MENUNGGU PEMBAYARAN'
                            : (isCodOrder(ord) && (ord.status === 'pending' || ord.status === 'menunggu')) || ord.status === 'paid' || ord.status === 'sudah_bayar'
                            ? 'BELUM DIPROSES'
                            : ord.status === 'processing' || ord.status === 'diproses'
                            ? 'DIPROSES'
                            : ord.status === 'packing' || ord.status === 'dikemas'
                            ? 'DIKEMAS'
                            : ord.status === 'shipped' || ord.status === 'dikirim'
                            ? 'DIKIRIM'
                            : ord.status === 'completed' || ord.status === 'selesai'
                            ? 'SELESAI'
                            : (ord.statusLabel || ord.status || 'DIPROSES').toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderDivider} />

                    <View style={styles.orderCustomerInfo}>
                      <Text style={styles.customerName}>👤 {ord.customerName || ord.recipient} ({ord.customerPhone || ord.phone})</Text>
                      <Text style={styles.customerAddr} numberOfLines={2}>📍 {ord.address || 'Alamat Utama Terdaftar'}</Text>
                      
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <Text style={styles.orderPriceTotal}>Total Pembayaran: <Text style={{ color: '#D91E28', fontWeight: '800' }}>{formatRupiah(ord.totalAmount)}</Text></Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }}>
                          <Ionicons name="eye-outline" size={14} color="#0284C7" />
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#0284C7' }}>Detail Pesanan</Text>
                        </View>
                      </View>
                    </View>

                    {/* Order Status Controller Action (4 Tombol Berurutan) */}
                    <View style={styles.orderActionRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 2 }}>
                        <Ionicons name="options-outline" size={13} color="#64748B" />
                        <Text style={styles.updateLabel}>Ubah Status:</Text>
                      </View>

                      {/* 1. Terima Pesanan (diproses) */}
                      {(() => {
                        const isCurrent = (ord.status === 'pending' || ord.status === 'menunggu' || ord.status === 'unprocessed');
                        const isDone = (ord.status === 'processing' || ord.status === 'diproses' || ord.status === 'packing' || ord.status === 'dikemas' || ord.status === 'shipped' || ord.status === 'dikirim' || ord.status === 'completed' || ord.status === 'selesai');
                        
                        return (
                          <TouchableOpacity
                            style={[
                              styles.statusActionBtn,
                              isCurrent
                                ? { backgroundColor: '#2563EB', borderColor: '#1D4ED8', shadowColor: '#2563EB', shadowOpacity: 0.35, elevation: 4 }
                                : isDone
                                ? { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }
                                : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleUpdateOrderStatus(ord.dbId || ord.id, 'diproses');
                            }}
                            activeOpacity={0.75}
                          >
                            <Ionicons
                              name={isDone ? "checkmark-circle" : "clipboard"}
                              size={14}
                              color={isCurrent ? "#FFFFFF" : isDone ? "#2563EB" : "#64748B"}
                            />
                            <Text
                              style={[
                                styles.statusActionText,
                                { color: isCurrent ? '#FFFFFF' : isDone ? '#2563EB' : '#64748B' },
                              ]}
                            >
                              {isDone ? 'Sudah Diterima' : 'Terima Pesanan'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })()}

                      {/* 2. Kemas Pesanan (dikemas) */}
                      {(() => {
                        const isCurrent = (ord.status === 'processing' || ord.status === 'diproses');
                        const isDone = (ord.status === 'packing' || ord.status === 'dikemas' || ord.status === 'shipped' || ord.status === 'dikirim' || ord.status === 'completed' || ord.status === 'selesai');
                        
                        return (
                          <TouchableOpacity
                            style={[
                              styles.statusActionBtn,
                              isCurrent
                                ? { backgroundColor: '#7C3AED', borderColor: '#6D28D9', shadowColor: '#7C3AED', shadowOpacity: 0.35, elevation: 4 }
                                : isDone
                                ? { backgroundColor: '#F3E8FF', borderColor: '#DDD6FE' }
                                : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleUpdateOrderStatus(ord.dbId || ord.id, 'dikemas');
                            }}
                            activeOpacity={0.75}
                          >
                            <Ionicons
                              name={isDone ? "checkmark-circle" : "cube"}
                              size={14}
                              color={isCurrent ? "#FFFFFF" : isDone ? "#7C3AED" : "#64748B"}
                            />
                            <Text
                              style={[
                                styles.statusActionText,
                                { color: isCurrent ? '#FFFFFF' : isDone ? '#7C3AED' : '#64748B' },
                              ]}
                            >
                              {isDone ? 'Sudah Dikemas' : 'Kemas Pesanan'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })()}

                      {/* 3. Kirim Pesanan (dikirim) */}
                      {(() => {
                        const isCurrent = (ord.status === 'packing' || ord.status === 'dikemas');
                        const isDone = (ord.status === 'shipped' || ord.status === 'dikirim' || ord.status === 'completed' || ord.status === 'selesai');
                        
                        return (
                          <TouchableOpacity
                            style={[
                              styles.statusActionBtn,
                              isCurrent
                                ? { backgroundColor: '#0284C7', borderColor: '#0369A1', shadowColor: '#0284C7', shadowOpacity: 0.35, elevation: 4 }
                                : isDone
                                ? { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }
                                : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleUpdateOrderStatus(ord.dbId || ord.id, 'dikirim');
                            }}
                            activeOpacity={0.75}
                          >
                            <Ionicons
                              name={isDone ? "checkmark-circle" : "paper-plane"}
                              size={14}
                              color={isCurrent ? "#FFFFFF" : isDone ? "#0284C7" : "#64748B"}
                            />
                            <Text
                              style={[
                                styles.statusActionText,
                                { color: isCurrent ? '#FFFFFF' : isDone ? '#0284C7' : '#64748B' },
                              ]}
                            >
                              {isDone ? 'Sudah Dikirim' : 'Kirim Pesanan'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })()}

                      {/* 4. Selesai Pesanan (selesai) */}
                      {(() => {
                        const isCurrent = (ord.status === 'shipped' || ord.status === 'dikirim');
                        const isDone = (ord.status === 'completed' || ord.status === 'selesai');
                        
                        return (
                          <TouchableOpacity
                            style={[
                              styles.statusActionBtn,
                              isCurrent || isDone
                                ? { backgroundColor: '#10B981', borderColor: '#059669', shadowColor: '#10B981', shadowOpacity: 0.35, elevation: 4 }
                                : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleUpdateOrderStatus(ord.dbId || ord.id, 'selesai');
                            }}
                            activeOpacity={0.75}
                          >
                            <Ionicons
                              name="checkmark-done-circle"
                              size={14}
                              color={isCurrent || isDone ? "#FFFFFF" : "#64748B"}
                            />
                            <Text
                              style={[
                                styles.statusActionText,
                                { color: isCurrent || isDone ? '#FFFFFF' : '#64748B' },
                              ]}
                            >
                              {isDone ? 'Selesai ✓' : 'Selesai Pesanan'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })()}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* TAB 5: KELOLA CABANG TOKO (STORES) */}
          {activeTab === 'stores' && (
            <View style={styles.sectionWrap}>
              <View style={styles.topActionHeader}>
                <View style={styles.searchBarBox}>
                  <Ionicons name="search" size={18} color="#64748B" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Cari nama cabang / kode..."
                    placeholderTextColor="#94A3B8"
                    value={branchSearch}
                    onChangeText={setBranchSearch}
                  />
                </View>

                <TouchableOpacity style={styles.addBtnHeader} onPress={() => openBranchForm(null)} activeOpacity={0.85}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addBtnHeaderText}>Tambah Cabang</Text>
                </TouchableOpacity>
              </View>

              {/* Branch Stores Table List (Identik 100% dengan Tampilan Produk) */}
              {filteredBranches.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="business-outline" size={48} color="#94A3B8" />
                  <Text style={styles.emptyTitle}>Belum Ada Cabang Toko</Text>
                  <Text style={styles.emptySub}>Klik tombol "+ Tambah Cabang" untuk membuat cabang toko baru</Text>
                </View>
              ) : (
                filteredBranches.map((st) => (
                  <View key={st.id} style={styles.tableRowCard}>
                    <View style={[styles.productThumb, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="business" size={26} color="#2563EB" />
                    </View>

                    <View style={styles.productMetaBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.productMetaTitle} numberOfLines={1}>
                          {st.name}
                        </Text>
                        <View style={styles.badgeCategory}>
                          <Text style={styles.badgeCategoryText}>{st.code}</Text>
                        </View>
                        <View style={[styles.badgeCategory, { backgroundColor: st.active ? '#DCFCE7' : '#FEE2E2' }]}>
                          <Text style={[styles.badgeCategoryText, { color: st.active ? '#15803D' : '#B91C1C' }]}>
                            {st.active ? '● AKTIF' : 'NON-AKTIF'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.productMetaSku} numberOfLines={2}>📍 {st.address}</Text>
                      <View style={styles.priceRow}>
                        <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>
                          📞 {st.phone || '0895238888200'} | 🕒 {st.hours}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionBtnGroup}>
                      <TouchableOpacity style={styles.editBtn} onPress={() => openBranchForm(st)} activeOpacity={0.7}>
                        <Ionicons name="pencil" size={16} color="#0284C7" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteBranch(st)} activeOpacity={0.7}>
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 6: PENGATURAN TOKO UTAMA (SETTINGS) */}
          {activeTab === 'settings' && (
            <View style={styles.sectionWrap}>
              <View style={styles.topActionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>⚙️ Pengaturan Identitas Official Store</Text>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>Ubah nama toko, slogan, URL logo, lokasi utama, dan nomor kontak CS</Text>
                </View>
              </View>

              {/* Store Live Preview Header Card */}
              <View style={{ backgroundColor: '#0F172A', borderRadius: 16, padding: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#FFFFFF', overflow: 'hidden', borderWidth: 2, borderColor: COLORS.primaryRed, justifyContent: 'center', alignItems: 'center' }}>
                  {formSettingLogo ? (
                    <Image source={{ uri: formSettingLogo }} style={{ width: 64, height: 64 }} resizeMode="cover" />
                  ) : (
                    <Ionicons name="storefront" size={32} color={COLORS.primaryRed} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF' }}>
                      {formSettingName || 'Official Store Tasikmalaya'}
                    </Text>
                    <View style={{ backgroundColor: '#16A34A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>VERIFIED STORE</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                    {formSettingSlogan || 'Pusat Bumbu, Saus & Cabai Asli Tasikmalaya'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    📍 {formSettingAddress || 'Alamat Utama Terdaftar'}
                  </Text>
                </View>
              </View>

              {/* Setting Form Card */}
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, gap: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: -4 }}>
                  🏢 Identitas & Profil Toko
                </Text>

                <View>
                  <Text style={styles.formLabel}>Nama Store Official *</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12 }}>
                    <Ionicons name="storefront-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                    <TextInput
                      style={{ flex: 1, height: 44, fontSize: 14, color: '#0F172A' }}
                      placeholder="Contoh: Official Store Tasikmalaya"
                      value={formSettingName}
                      onChangeText={setFormSettingName}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Slogan / Tagline Toko</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12 }}>
                    <Ionicons name="ribbon-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                    <TextInput
                      style={{ flex: 1, height: 44, fontSize: 14, color: '#0F172A' }}
                      placeholder="Contoh: Pusat Bumbu, Saus & Cabai Asli Tasikmalaya"
                      value={formSettingSlogan}
                      onChangeText={setFormSettingSlogan}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Logo Toko</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Image
                      source={{
                        uri: formSettingLogo && formSettingLogo.trim().length > 5
                          ? formSettingLogo
                          : 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80',
                      }}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: '#F1F5F9',
                        borderWidth: 1.5,
                        borderColor: '#CBD5E1',
                      }}
                      resizeMode="cover"
                    />

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#005691',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                      onPress={handlePickLogoImage}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                        Pilih Logo dari Laptop / HP
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 4 }}>
                    Atau Tempel Link URL Logo (Opsional):
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12 }}>
                    <Ionicons name="image-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                    <TextInput
                      style={{ flex: 1, height: 44, fontSize: 14, color: '#0F172A' }}
                      placeholder="https://..."
                      value={formSettingLogo.startsWith('data:') ? '[Logo Diupload dari Laptop/HP]' : formSettingLogo}
                      onChangeText={setFormSettingLogo}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={{ height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 }} />
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: -4 }}>
                  📍 Alamat Pusat & Peta Lokasi
                </Text>

                <View>
                  <Text style={styles.formLabel}>Alamat Utama Pusat / Toko *</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, paddingTop: 8 }}>
                    <Ionicons name="location-outline" size={18} color="#64748B" style={{ marginRight: 8, marginTop: 4 }} />
                    <TextInput
                      style={{ flex: 1, height: 60, fontSize: 14, color: '#0F172A' }}
                      placeholder="Alamat lengkap toko pusat..."
                      multiline
                      value={formSettingAddress}
                      onChangeText={setFormSettingAddress}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Latitude Maps</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="-7.351200"
                      value={formSettingLat}
                      onChangeText={setFormSettingLat}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Longitude Maps</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="108.214500"
                      value={formSettingLng}
                      onChangeText={setFormSettingLng}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 8, padding: 10, alignItems: 'center' }}
                  onPress={() => {
                    setFormSettingLat('-7.351200');
                    setFormSettingLng('108.214500');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB' }}>
                    🌐 Set Koordinat Default Tasikmalaya (-7.3512, 108.2145)
                  </Text>
                </TouchableOpacity>

                <View style={{ height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 }} />
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: -4 }}>
                  📞 Kontak CS & Jam Kerja
                </Text>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Nomor WhatsApp CS</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12 }}>
                      <Ionicons name="logo-whatsapp" size={18} color="#16A34A" style={{ marginRight: 8 }} />
                      <TextInput
                        style={{ flex: 1, height: 44, fontSize: 14, color: '#0F172A' }}
                        placeholder="62895238888200"
                        value={formSettingWhatsapp}
                        onChangeText={setFormSettingWhatsapp}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Jam Operasional Toko</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12 }}>
                      <Ionicons name="time-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                      <TextInput
                        style={{ flex: 1, height: 44, fontSize: 14, color: '#0F172A' }}
                        placeholder="07:00 - 22:00 WIB"
                        value={formSettingHours}
                        onChangeText={setFormSettingHours}
                      />
                    </View>
                  </View>
                </View>

                {/* Submit Button Ultra Premium */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#D91E28',
                    height: 52,
                    borderRadius: 14,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#D91E28',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.35,
                    shadowRadius: 10,
                    elevation: 6,
                    borderWidth: 1,
                    borderColor: '#EF4444',
                    marginTop: 12,
                  }}
                  onPress={handleSaveStoreSettings}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="save" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.3 }}>
                        Simpan & Terapkan Perubahan Toko
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* MODAL FORM TAMBAH / EDIT CABANG TOKO */}
        <Modal visible={isBranchModalOpen} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingBranch ? 'Edit Data Cabang Toko' : '+ Tambah Cabang Toko Baru'}
                </Text>
                <TouchableOpacity onPress={() => setIsBranchModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Kode Cabang Toko *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="CAB-158"
                      value={formBranchCode}
                      onChangeText={setFormBranchCode}
                    />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.formLabel}>Nama Cabang *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Contoh: PERINTIS 158"
                      value={formBranchName}
                      onChangeText={setFormBranchName}
                    />
                  </View>
                </View>

                <Text style={styles.formLabel}>Alamat Lengkap Cabang Toko *</Text>
                <TextInput
                  style={[styles.formInput, { height: 65 }]}
                  placeholder="Jl. Perintis Kemerdekaan No 158..."
                  multiline
                  value={formBranchAddress}
                  onChangeText={setFormBranchAddress}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>No. Telepon / WhatsApp</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0895238888200"
                      value={formBranchPhone}
                      onChangeText={setFormBranchPhone}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Jam Operasional</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="07:00 - 22:00"
                      value={formBranchHours}
                      onChangeText={setFormBranchHours}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Latitude Maps</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="-7.3512"
                      value={formBranchLat}
                      onChangeText={setFormBranchLat}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Longitude Maps</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="108.2145"
                      value={formBranchLng}
                      onChangeText={setFormBranchLng}
                    />
                  </View>
                </View>

                {/* Action Buttons Row */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: 48,
                      backgroundColor: '#F1F5F9',
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#CBD5E1',
                    }}
                    onPress={() => setIsBranchModalOpen(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: '#475569', fontWeight: '700', fontSize: 14 }}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 2,
                      height: 48,
                      backgroundColor: '#2563EB',
                      borderRadius: 12,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#2563EB',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                    onPress={handleSaveBranch}
                    activeOpacity={0.85}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
                          Simpan Cabang Toko
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* MODAL FORM TAMBAH / EDIT PRODUK */}
        <Modal visible={isProductModalOpen} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="cube-outline" size={20} color="#D91E28" />
                  </View>
                  <Text style={styles.modalTitle}>
                    {editingProduct ? 'Edit Data Produk' : '+ Tambah Produk Baru'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsProductModalOpen(false)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
                {/* Image Upload & Preview Section */}
                <View style={{ backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#CBD5E1', gap: 12 }}>
                  <Text style={styles.formLabel}>Foto Produk</Text>
                  
                  <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                    <View style={{ width: 84, height: 84, borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' }}>
                      {formProdImage ? (
                        <Image
                          source={{ uri: formProdImage }}
                          style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                        />
                      ) : (
                        <Ionicons name="image-outline" size={36} color="#94A3B8" />
                      )}
                    </View>

                    <View style={{ flex: 1, gap: 8 }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#005691',
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          shadowColor: '#005691',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                        onPress={handlePickProductImage}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                          Pilih Foto dari Laptop / HP
                        </Text>
                      </TouchableOpacity>

                      <Text style={{ fontSize: 11, color: '#64748B', lineHeight: 15 }}>
                        Format: JPG, PNG, WEBP (Maksimal 5 MB). Gambar akan langsung ditampilkan di aplikasi toko.
                      </Text>
                    </View>
                  </View>

                  {/* Manual URL Fallback Input */}
                  <View style={{ marginTop: 4, gap: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569' }}>Atau Tempel Link URL Foto (Opsional):</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: '#FFFFFF', fontSize: 13, height: 40 }]}
                      placeholder="https://..."
                      value={formProdImage.startsWith('data:') ? '[Foto Diupload dari Laptop]' : formProdImage}
                      onChangeText={setFormProdImage}
                    />
                  </View>
                </View>

                {/* Nama Produk & Kategori */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.formLabel}>Nama Produk *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Contoh: Aida Bumbu Tabur Cabe 25g"
                      value={formProdName}
                      onChangeText={setFormProdName}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Kategori</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="AIDA / SAUS SWAN"
                      value={formProdCategory}
                      onChangeText={setFormProdCategory}
                    />
                  </View>
                </View>

                {/* SKU & Stok */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Kode SKU</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="SKU-1002"
                      value={formProdSku}
                      onChangeText={setFormProdSku}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Jumlah Stok</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="100"
                      keyboardType="numeric"
                      value={formProdStock}
                      onChangeText={setFormProdStock}
                    />
                  </View>
                </View>

                {/* Harga & Harga Coret */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Harga Jual (Rp) *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="15000"
                      keyboardType="numeric"
                      value={formProdPrice}
                      onChangeText={setFormProdPrice}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Harga Coret (Rp)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="18000"
                      keyboardType="numeric"
                      value={formProdOriginalPrice}
                      onChangeText={setFormProdOriginalPrice}
                    />
                  </View>
                </View>

                {/* Deskripsi */}
                <View>
                  <Text style={styles.formLabel}>Deskripsi Produk</Text>
                  <TextInput
                    style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                    multiline
                    numberOfLines={3}
                    placeholder="Penjelasan singkat deskripsi produk..."
                    value={formProdDesc}
                    onChangeText={setFormProdDesc}
                  />
                </View>

                {/* Action Buttons Row */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: 48,
                      backgroundColor: '#F1F5F9',
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#CBD5E1',
                    }}
                    onPress={() => setIsProductModalOpen(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: '#475569', fontWeight: '700', fontSize: 14 }}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 2,
                      height: 48,
                      backgroundColor: '#D91E28',
                      borderRadius: 12,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#D91E28',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                    onPress={handleSaveProduct}
                    activeOpacity={0.85}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
                          {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* MODAL FORM TAMBAH VOUCHER */}
        <Modal visible={isVoucherModalOpen} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>+ Buat Kode Voucher Promo</Text>
                <TouchableOpacity onPress={() => setIsVoucherModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
                <Text style={styles.formLabel}>Kode Voucher (Huruf Kapital) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="PROMOAIDA50"
                  autoCapitalize="characters"
                  value={formVoucherCode}
                  onChangeText={setFormVoucherCode}
                />

                <Text style={styles.formLabel}>Judul Promo *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Potongan Spesial Rp 15.000"
                  value={formVoucherTitle}
                  onChangeText={setFormVoucherTitle}
                />

                <Text style={styles.formLabel}>Nilai Diskon (Rp) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="15000"
                  keyboardType="numeric"
                  value={formVoucherDiscount}
                  onChangeText={setFormVoucherDiscount}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Min. Belanja (Rp)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="50000"
                      keyboardType="numeric"
                      value={formVoucherMinSpend}
                      onChangeText={setFormVoucherMinSpend}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Kuota Penggunaan</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="100"
                      keyboardType="numeric"
                      value={formVoucherQuota}
                      onChangeText={setFormVoucherQuota}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.saveSubmitBtn} onPress={handleSaveVoucher} activeOpacity={0.85}>
                  <Text style={styles.saveSubmitText}>Simpan Kode Voucher</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Detail Pesanan Modal untuk Admin */}
        <OrderDetailModal
          visible={!!selectedOrderForDetail}
          onClose={() => setSelectedOrderForDetail(null)}
          order={selectedOrderForDetail}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#D91E28',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    padding: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  headerSub: {
    color: '#FEE2E2',
    fontSize: 11,
  },
  closeShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  closeShopText: {
    color: '#B91C1C',
    fontWeight: '800',
    fontSize: 12,
  },
  tabsRow: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  tabBtnActive: {
    borderBottomColor: '#D91E28',
    backgroundColor: '#FEF2F2',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#D91E28',
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  sectionWrap: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsGridDesktop: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D91E28',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  quickActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  topActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  searchBarBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },
  addBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D91E28',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    gap: 4,
  },
  addBtnHeaderText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  tableRowCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  productThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  productMetaBox: {
    flex: 1,
  },
  productMetaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  badgeCategory: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D91E28',
  },
  productMetaSku: {
    fontSize: 11,
    color: '#64748B',
    marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productMetaPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D91E28',
  },
  productMetaOriginalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  actionBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    padding: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  voucherCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  voucherIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherCodeText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#D91E28',
  },
  voucherTitleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  voucherSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  orderFilterScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#D91E28',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  orderDateText: {
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
  },
  orderDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  orderCustomerInfo: {
    gap: 4,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  customerAddr: {
    fontSize: 12,
    color: '#475569',
  },
  orderPriceTotal: {
    fontSize: 13,
    marginTop: 4,
  },
  orderActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  updateLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  statusActionText: {
    fontWeight: '800',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: 780,
    maxWidth: '94%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textDark,
  },
  saveSubmitBtn: {
    backgroundColor: '#D91E28',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveSubmitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
