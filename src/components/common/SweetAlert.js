import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let globalAlertHandler = null;

/**
 * Global trigger for SweetAlert
 * @param {Object} options 
 * @param {'success'|'warning'|'error'|'info'|'confirm'} [options.type='info']
 * @param {string} options.title
 * @param {string} [options.text]
 * @param {string} [options.confirmText='OK']
 * @param {string} [options.cancelText='Batal']
 * @param {boolean} [options.showCancelButton=false]
 * @param {Function} [options.onConfirm]
 * @param {Function} [options.onCancel]
 */
export const sweetAlert = (options) => {
  if (globalAlertHandler) {
    globalAlertHandler(options);
  } else {
    // Fallback if component not mounted
    if (options.showCancelButton) {
      if (typeof window !== 'undefined' && window.confirm) {
        const ok = window.confirm(`${options.title || ''}\n\n${options.text || ''}`);
        if (ok && options.onConfirm) options.onConfirm();
        if (!ok && options.onCancel) options.onCancel();
      }
    } else {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`${options.title || ''}\n\n${options.text || ''}`);
        if (options.onConfirm) options.onConfirm();
      }
    }
  }
};

export default function SweetAlertContainer() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({});
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    globalAlertHandler = (options) => {
      setConfig({
        type: options.type || 'info',
        title: options.title || '',
        text: options.text || '',
        confirmText: options.confirmText || (options.showCancelButton ? 'Ya, Lanjutkan' : 'OK'),
        cancelText: options.cancelText || 'Batal',
        showCancelButton: !!options.showCancelButton,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      });
      setVisible(true);

      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return () => {
      globalAlertHandler = null;
    };
  }, []);

  const handleClose = (isConfirmed = false) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (isConfirmed) {
        if (typeof config.onConfirm === 'function') config.onConfirm();
      } else {
        if (typeof config.onCancel === 'function') config.onCancel();
      }
    });
  };

  if (!visible) return null;

  const getTypeStyle = () => {
    switch (config.type) {
      case 'success':
        return {
          bg: '#DCFCE7',
          border: '#86EFAC',
          iconColor: '#16A34A',
          iconName: 'checkmark-circle',
          btnBg: '#16A34A',
        };
      case 'warning':
      case 'confirm':
        return {
          bg: '#FEF3C7',
          border: '#FDE68A',
          iconColor: '#D97706',
          iconName: 'alert-circle',
          btnBg: '#D91E28',
        };
      case 'error':
      case 'danger':
        return {
          bg: '#FEE2E2',
          border: '#FCA5A5',
          iconColor: '#DC2626',
          iconName: 'close-circle',
          btnBg: '#DC2626',
        };
      case 'info':
      default:
        return {
          bg: '#E0F2FE',
          border: '#93C5FD',
          iconColor: '#0284C7',
          iconName: 'information-circle',
          btnBg: '#0284C7',
        };
    }
  };

  const styleInfo = getTypeStyle();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => handleClose(false)}
    >
      <TouchableWithoutFeedback onPress={() => handleClose(false)}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalCard,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              {/* Icon Header Circle */}
              <View style={[styles.iconCircleOuter, { backgroundColor: styleInfo.bg, borderColor: styleInfo.border }]}>
                <Ionicons name={styleInfo.iconName} size={48} color={styleInfo.iconColor} />
              </View>

              {/* Title & Text */}
              <Text style={styles.titleText}>{config.title}</Text>
              {!!config.text && <Text style={styles.bodyText}>{config.text}</Text>}

              {/* Buttons Row */}
              <View style={styles.buttonRow}>
                {config.showCancelButton && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleClose(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelBtnText}>{config.cancelText}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: styleInfo.btnBg },
                    config.showCancelButton ? { flex: 1 } : { width: '100%' },
                  ]}
                  onPress={() => handleClose(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.confirmBtnText}>{config.confirmText}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(4px)' } : {}),
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  iconCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
