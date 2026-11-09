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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (productName: string, price: number, durationSeconds: number) => Promise<void>;
}

const PRESET_DURATIONS = [
  { label: '⚡ 1 min (Demo)', seconds: 60 },
  { label: '5 min', seconds: 300 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
];

export const CreateImpulseModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // Default a demo de 1 min
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContent}
          >
            <View style={styles.handle} />
            <Text style={styles.title}>🛡️ Frenar compra por impulso</Text>
            <Text style={styles.subtitle}>
              Establece un tiempo de enfriamiento antes de decidir si comprarlo.
            </Text>

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            <Text style={styles.inputLabel}>¿Qué artículo viste?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Audífonos Bluetooth, Tenis..."
              placeholderTextColor="#64748b"
              value={productName}
              onChangeText={setProductName}
            />

            <Text style={styles.inputLabel}>Precio aproximado (\$ MXN)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 1500"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.inputLabel}>Tiempo de enfriamiento</Text>
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
                <Text style={styles.submitBtnText}>Iniciar Enfriamiento</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelLink}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelLinkText}>Cancelar</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: '#334155',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 18,
  },
  errorText: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  durationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  durationChip: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  durationChipSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  durationChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  durationChipTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelLinkText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
