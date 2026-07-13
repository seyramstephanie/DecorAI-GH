import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';
import { Shadow, Type } from '../../constants/theme';
import { Palette, useColors } from '../../lib/theme';

// Labeled pill input per auth UI reference: bold label above a white fully-rounded
// input, with a success check circle on the right once the value is valid.
type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  valid?: boolean;              // shows the check circle
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
};

export function Field({ label, value, onChangeText, placeholder, valid, secure, keyboardType }: Props) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, Shadow.card]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={C.textLight}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={secure || keyboardType === 'email-address' ? 'none' : 'words'}
        />
        {valid && (
          <View style={styles.check}>
            <Ionicons name="checkmark" size={13} color={C.onPrimary} />
          </View>
        )}
      </View>
    </View>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: { marginTop: 16 },
  label: { ...Type.subtitle, fontSize: 15, color: C.text, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
    borderRadius: 28, borderWidth: 1, borderColor: C.border, paddingHorizontal: 18, height: 56,
  },
  input: { flex: 1, ...Type.body, fontSize: 15, color: C.text },
  check: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.success,
    alignItems: 'center', justifyContent: 'center',
  },
});
