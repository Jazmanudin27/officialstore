import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { apiService } from '../services/api';

export default function AuthModal({ visible, onClose, onLoginSuccess }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState('input'); // 'input' | 'otp'

  // Form Fields
  const [phone, setPhone] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [alamat, setAlamat] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [sentOtp, setSentOtp] = useState('');

  // Loading & Timer
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // OTP inputs ref
  const otpRefs = useRef([]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const sanitizeInputPhone = (val) => {
    let cleaned = val.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('62')) cleaned = cleaned.slice(2);
    if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
    return cleaned;
  };

  // 1. Submit Kirim OTP (Login atau Daftar)
  const handleSendOtp = async () => {
    const rawPhone = sanitizeInputPhone(phone);
    if (!rawPhone || rawPhone.length < 8) {
      Alert.alert('Perhatian', 'Harap masukkan nomor HP yang valid (minimal 9 digit).');
      return;
    }

    if (authMode === 'register') {
      if (!namaLengkap.trim()) {
        Alert.alert('Perhatian', 'Harap isi Nama Lengkap Anda.');
        return;
      }
      if (!alamat.trim()) {
        Alert.alert('Perhatian', 'Harap isi Alamat Lengkap pengiriman Anda.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const fullPhone = '62' + rawPhone;
      // Panggil backend API send-otp
      const result = await apiService.sendOtp(fullPhone);

      // Jika user memilih tab 'login' tetapi nomor belum terdaftar di database
      if (authMode === 'login' && result && result.data && result.data.isRegistered === false) {
        Alert.alert(
          'Anda Belum Terdaftar',
          'Anda belum terdaftar di database, silahkan daftar terlebih dahulu.'
        );
        setAuthMode('register');
        setStep('input');
        return;
      }

      setStep('otp');
      setCountdown(30);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']); // Kosongkan agar pengguna memasukkan kode OTP
      if (result && result.data && result.data.otp) {
        setSentOtp(result.data.otp);
      }
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Gagal mengirim kode OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Verifikasi OTP
  const handleVerifyOtp = async () => {
    const fullOtp = otpCode.join('');
    if (fullOtp.length < 6) {
      Alert.alert('Perhatian', 'Harap masukkan 6 digit kode OTP.');
      return;
    }

    const fullPhone = '62' + sanitizeInputPhone(phone);
    setIsLoading(true);

    try {
      let result;
      if (authMode === 'register') {
        result = await apiService.registerUser({
          namaLengkap: namaLengkap.trim(),
          phone: fullPhone,
          alamat: alamat.trim(),
          otp: fullOtp,
        });
      } else {
        result = await apiService.verifyOtp({
          phone: fullPhone,
          otp: fullOtp,
        });
      }

      if (result && result.status === 'ok' && result.data && result.data.user) {
        Alert.alert('Sukses', result.message || 'Berhasil masuk ke Official Store!');
        if (onLoginSuccess) {
          onLoginSuccess(result.data.user);
        }
        handleClose();
      } else if (result && result.isRegistered === false) {
        Alert.alert(
          'Anda Belum Terdaftar',
          'Anda belum terdaftar, silahkan daftar terlebih dahulu.'
        );
        setAuthMode('register');
        setStep('input');
      } else {
        throw new Error(result.message || 'Verifikasi OTP gagal.');
      }
    } catch (err) {
      if (err.message && err.message.includes('terdaftar')) {
        Alert.alert(
          'Anda Belum Terdaftar',
          'Anda belum terdaftar, silahkan daftar terlebih dahulu.'
        );
        setAuthMode('register');
        setStep('input');
      } else {
        Alert.alert('Verifikasi Gagal', err.message || 'Kode OTP tidak cocok.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    const fullPhone = '62' + sanitizeInputPhone(phone);
    setIsLoading(true);
    try {
      await apiService.sendOtp(fullPhone);
      setCountdown(30);
      setCanResend(false);
      Alert.alert('Sukses', 'Kode OTP baru telah dikirimkan!');
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Gagal mengirim ulang OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otpCode];
    newOtp[index] = text.slice(-1);
    setOtpCode(newOtp);

    // Auto focus next input
    if (text && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleClose = () => {
    setStep('input');
    setPhone('');
    setNamaLengkap('');
    setAlamat('');
    setOtpCode(['', '', '', '', '', '']);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={isDesktop ? styles.desktopOverlay : styles.overlayContainer}>
      <SafeAreaView style={isDesktop ? styles.desktopModalCard : styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={step === 'otp' ? () => setStep('input') : handleClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={step === 'otp' ? 'arrow-back' : 'close'}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'otp'
              ? 'Verifikasi OTP'
              : authMode === 'login'
              ? 'Masuk Akun'
              : 'Daftar Akun Baru'}
          </Text>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'input' ? (
            /* ==================== FORM INPUT (LOGIN / REGISTER) ==================== */
            <>
              {/* Tab Switcher */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabBtn, authMode === 'login' && styles.tabBtnActive]}
                  onPress={() => setAuthMode('login')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}
                  >
                    Masuk (Login)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, authMode === 'register' && styles.tabBtnActive]}
                  onPress={() => setAuthMode('register')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.tabText, authMode === 'register' && styles.tabTextActive]}
                  >
                    Daftar (Registrasi)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Title & Subtitle */}
              <View style={styles.titleSection}>
                <Text style={styles.mainTitle}>
                  {authMode === 'login' ? 'Selamat Datang Kembali!' : 'Buat Akun Official Store'}
                </Text>
                <Text style={styles.subtitle}>
                  {authMode === 'login'
                    ? 'Masuk menggunakan nomor HP untuk mengakses keranjang, poin member, dan promo spesial.'
                    : 'Daftar dengan nomor HP dan lengkapi alamat Anda untuk pengiriman instan & pickup.'}
                </Text>
              </View>

              {/* Fields */}
              <View style={styles.formSection}>
                {authMode === 'register' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nama Lengkap *</Text>
                    <View style={styles.inputWrap}>
                      <Ionicons name="person-outline" size={20} color="#64748B" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Contoh: Jazmanudin"
                        placeholderTextColor="#94A3B8"
                        value={namaLengkap}
                        onChangeText={setNamaLengkap}
                      />
                    </View>
                  </View>
                )}

                {/* Phone Number Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nomor WhatsApp / HP *</Text>
                  <View style={styles.phoneInputWrap}>
                    <View style={styles.countryCodeBox}>
                      <Text style={styles.flagText}>🇮🇩</Text>
                      <Text style={styles.countryCodeText}>+62</Text>
                    </View>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="895-XXXX-XXXX"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={(t) => setPhone(sanitizeInputPhone(t))}
                    />
                  </View>
                  <Text style={styles.fieldHint}>
                    Kode OTP akan dikirimkan ke nomor ini.
                  </Text>
                </View>

                {authMode === 'register' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Alamat Lengkap Pengiriman *</Text>
                    <View style={[styles.inputWrap, styles.textAreaWrap]}>
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color="#64748B"
                        style={{ marginTop: 3 }}
                      />
                      <TextInput
                        style={[styles.textInput, styles.textAreaInput]}
                        placeholder="Jl. Pasir Bokor, RT 03/09, Cipawitra, Mangkubumi, Tasikmalaya (Patokan...)"
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={3}
                        value={alamat}
                        onChangeText={setAlamat}
                      />
                    </View>
                  </View>
                )}

                {/* Action Submit Button */}
                <TouchableOpacity
                  style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>
                        {authMode === 'login' ? 'Kirim Kode OTP' : 'Daftar & Kirim OTP'}
                      </Text>
                      <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                    </>
                  )}
                </TouchableOpacity>

                {/* Switch Auth Mode Prompt */}
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>
                    {authMode === 'login'
                      ? 'Belum punya akun Official Store?'
                      : 'Sudah punya akun?'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  >
                    <Text style={styles.switchLink}>
                      {authMode === 'login' ? 'Daftar Sekarang' : 'Masuk di Sini'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            /* ==================== OTP VERIFICATION STATE ==================== */
            <View style={styles.otpContainer}>
              <View style={styles.otpIconCircle}>
                <Ionicons name="shield-checkmark" size={48} color="#0284C7" />
              </View>

              <Text style={styles.otpTitle}>Verifikasi Kode OTP</Text>
              <Text style={styles.otpSubtitle}>
                Masukkan 6 digit kode verifikasi yang telah kami kirimkan ke nomor:
              </Text>
              <Text style={styles.otpTargetPhone}>+62 {sanitizeInputPhone(phone)}</Text>

              {/* WhatsApp OTP Banner Info */}
              <View style={styles.demoInfoBox}>
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                <Text style={styles.demoInfoText}>
                  Silahkan cek WhatsApp Anda untuk melihat 6 digit kode OTP verifikasi.
                </Text>
              </View>

              {/* 6-Digit OTP Boxes */}
              <View style={styles.otpBoxesRow}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TextInput
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    style={[
                      styles.otpBox,
                      otpCode[index] ? styles.otpBoxFilled : null,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={otpCode[index]}
                    onChangeText={(text) => handleOtpChange(text, index)}
                  />
                ))}
              </View>

              {/* Countdown / Resend Option */}
              <View style={styles.resendRow}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7}>
                    <Text style={styles.resendActiveText}>Kirim Ulang Kode OTP</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendWaitText}>
                    Kirim ulang dalam <Text style={{ fontWeight: '800' }}>00:{countdown < 10 ? `0${countdown}` : countdown}</Text>
                  </Text>
                )}
              </View>

              {/* Verify Button (Sleek Red Elevated Button with Shield Icon) */}
              <TouchableOpacity
                style={[styles.verifySubmitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.verifySubmitBtnText}>Verifikasi</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Change Phone Button */}
              <TouchableOpacity
                style={styles.changePhoneBtn}
                onPress={() => setStep('input')}
                activeOpacity={0.7}
              >
                <Text style={styles.changePhoneText}>Ganti Nomor HP</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 99999,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  desktopModalCard: {
    width: 480,
    maxHeight: '85%',
    backgroundColor: '#D91E28',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 99999,
    backgroundColor: '#D91E28',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#D91E28',
  },
  header: {
    height: 54,
    backgroundColor: '#D91E28',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  /* Tab Switcher */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#D91E28',
    fontWeight: '800',
  },
  /* Title */
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  /* Form */
  formSection: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  textAreaWrap: {
    height: 80,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    outlineStyle: 'none',
  },
  textAreaInput: {
    height: '100%',
    textAlignVertical: 'top',
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    height: 48,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    gap: 4,
  },
  flagText: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '600',
    outlineStyle: 'none',
  },
  fieldHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#D91E28',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: '#D91E28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  verifySubmitBtn: {
    backgroundColor: '#D91E28',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    borderRadius: 14,
    gap: 8,
    marginTop: 16,
    shadowColor: '#D91E28',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  verifySubmitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  switchText: {
    fontSize: 13,
    color: '#64748B',
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },
  /* OTP Screen */
  otpContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  otpIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  otpSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  otpTargetPhone: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0284C7',
    marginTop: 4,
    marginBottom: 16,
  },
  demoInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 20,
  },
  demoInfoText: {
    fontSize: 12,
    color: '#0369A1',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    width: '100%',
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: COLORS.white,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    outlineStyle: 'none',
  },
  otpBoxFilled: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  resendRow: {
    marginBottom: 20,
  },
  resendActiveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },
  resendWaitText: {
    fontSize: 13,
    color: '#64748B',
  },
  changePhoneBtn: {
    marginTop: 14,
    paddingVertical: 8,
  },
  changePhoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
