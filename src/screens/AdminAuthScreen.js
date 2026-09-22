import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { apiService } from '../services/api';

export default function AdminAuthScreen({ onLoginSuccess, isStandaloneDomain = false }) {
  const [adminId, setAdminId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminLogin = async () => {
    if (!adminId.trim()) {
      setErrorMessage('Nomor HP / Email / Username Admin wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const result = await apiService.adminLogin({
        phone: adminId,
        username: adminId,
        email: adminId,
        pin: pin || '123456',
      });

      if (result && result.status === 'ok' && result.data) {
        if (result.data.role === 'admin') {
          onLoginSuccess(result.data);
        } else {
          setErrorMessage('Akses Ditolak: Akun Anda tidak memiliki hak wewenang Admin (Role Buyer).');
        }
      } else {
        setErrorMessage(result?.message || 'Login Admin gagal.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Kredensial Admin tidak valid atau Akses Ditolak.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* Header Badge */}
            <View style={styles.headerIconContainer}>
              <Ionicons name="shield-checkmark" size={48} color={COLORS.primaryRed} />
            </View>

            <Text style={styles.title}>Portal Admin Store</Text>
            <Text style={styles.subtitle}>
              {isStandaloneDomain
                ? 'Sistem Manajemen Resmi Official Store'
                : 'Khusus untuk Pengelola & Administrator Toko'}
            </Text>

            {/* Error Alert Box */}
            {!!errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Input Form */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nomor HP / Email Admin</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 081234567890 atau admin@aspartech.com"
                  placeholderTextColor="#94A3B8"
                  value={adminId}
                  onChangeText={setAdminId}
                  autoCapitalize="none"
                  keyboardType="default"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PIN / Sandi Keamanan Admin</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan 6-digit PIN Admin (Default: 123456)"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Demo Helper Box */}
            <View style={styles.demoBox}>
              <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
              <Text style={styles.demoText}>
                <Text style={{ fontWeight: '700' }}>Credential Demo Admin:</Text>
                {'\n'}HP: <Text style={{ fontWeight: '700' }}>081234567890</Text> | PIN: <Text style={{ fontWeight: '700' }}>123456</Text>
              </Text>
            </View>

            {/* Login Action Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleAdminLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.loginBtnText}>Masuk Ke Dashboard Admin</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Dilindungi oleh sistem keamanan role-based authentication. Akses publik tidak diizinkan.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  demoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 24,
  },
  demoText: {
    fontSize: 12,
    color: '#1E40AF',
    marginLeft: 8,
    lineHeight: 18,
    flex: 1,
  },
  loginBtn: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.primaryRed,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});
