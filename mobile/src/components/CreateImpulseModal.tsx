import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (productName: string, price: number, durationSeconds: number) => Promise<void>;
}

const PRESET_DURATIONS = [
  { label: '1 min (Prueba)', seconds: 60 },
  { label: '5 min', seconds: 300 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
];

export const CreateImpulseModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de foco para bordes activos
  const [productFocused, setProductFocused] = useState(false);
  const [priceFocused, setPriceFocused] = useState(false);

  const resetForm = () => {
    setProductName('');
    setPrice('');
    setSelectedDuration(60);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    const numPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (!productName.trim()) {
      setErrorMessage('Ingresa el nombre del producto.');
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Ingresa un precio válido mayor a 0.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await onSubmit(productName.trim(), numPrice, selectedDuration);
      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar el impulso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalContent}>
            {/* Handle bar */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={styles.title}>Frenar impulso</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Feather name="x" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {errorMessage && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Scrollable form so keyboard never covers fields */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollForm}
            >
              <Text style={styles.inputLabel}>¿Qué quieres comprar?</Text>
              <View style={[styles.inputWrapper, productFocused && styles.inputWrapperFocused]}>
                <Feather name="tag" size={16} color={productFocused ? '#10b981' : '#64748b'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Audífonos Bluetooth, Tenis..."
                  placeholderTextColor="#475569"
                  value={productName}
                  onChangeText={setProductName}
                  onFocus={() => setProductFocused(true)}
                  onBlur={() => setProductFocused(false)}
                  returnKeyType="next"
                />
              </View>

              <Text style={styles.inputLabel}>¿Cuánto cuesta? MXN</Text>
              <View style={[styles.inputWrapper, priceFocused && styles.inputWrapperFocused]}>
                <Text style={[styles.currencyPrefix, priceFocused && styles.currencyPrefixFocused]}>$</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  onFocus={() => setPriceFocused(true)}
                  onBlur={() => setPriceFocused(false)}
                />
              </View>

              <Text style={styles.inputLabel}>Tiempo de espera</Text>
              <View style={styles.durationsGrid}>
                {PRESET_DURATIONS.map((preset) => {
                  const isSelected = selectedDuration === preset.seconds;
                  return (
                    <TouchableOpacity
                      key={preset.seconds}
                      style={[styles.durationChip, isSelected && styles.durationChipSelected]}
                      onPress={() => setSelectedDuration(preset.seconds)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.durationChipText,
                          isSelected && styles.durationChipTextSelected,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreate}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.submitContent}>
                    <Feather name="shield" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitBtnText}>Iniciar Enfriamiento</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#0c0f17',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1e2638',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#1e2638',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#151b28',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  scrollForm: {
    paddingBottom: 16,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131825',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2638',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputWrapperFocused: {
    borderColor: '#10b981',
    backgroundColor: '#151b28',
  },
  inputIcon: {
    marginRight: 8,
  },
  currencyPrefix: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  currencyPrefixFocused: {
    color: '#10b981',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  durationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  durationChip: {
    backgroundColor: '#131825',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  durationChipSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10b981',
  },
  durationChipText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  durationChipTextSelected: {
    color: '#10b981',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
