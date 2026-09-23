import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 [React ErrorBoundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconBox}>
              <Ionicons name="warning-outline" size={64} color={COLORS.primaryRed} />
            </View>
            <Text style={styles.title}>Terjadi Kesalahan Sistem</Text>
            <Text style={styles.subtitle}>
              Aplikasi mengalami kendala saat memuat komponen. Silahkan muat ulang halaman.
            </Text>

            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Detail Kendala (Debug Info):</Text>
              <Text style={styles.errorText}>
                {this.state.error ? this.state.error.toString() : 'Unknown Rendering Error'}
              </Text>
              {this.state.errorInfo && (
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.button} onPress={this.handleReset} activeOpacity={0.8}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Muat Ulang Halaman</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  stackText: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'monospace',
    maxHeight: 120,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: COLORS.primaryRed,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
