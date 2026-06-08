import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../constants/colors';

const roles = [
  {
    key: 'client',
    title: 'Client',
    subtitle: 'I want to decorate my space',
    emoji: '🛋️',
    bg: '#FFF9E6',
  },
  {
    key: 'decorator',
    title: 'Decorator',
    subtitle: 'I offer decoration services',
    emoji: '🎨',
    bg: '#F0FDF4',
  },
  {
    key: 'shop',
    title: 'Shop Owner',
    subtitle: 'I sell decoration items',
    emoji: '🏪',
    bg: '#F0FDF4',
  },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('client');

  const handleContinue = () => {
    router.push('/create-account');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Join DecorAI GH</Text>
        <Text style={styles.subtitle}>Select your role to get started</Text>

        {/* Role cards */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.key;
            return (
              <TouchableOpacity
                key={role.key}
                style={[
                  styles.roleCard,
                  isSelected && styles.roleCardActive,
                ]}
                onPress={() => setSelectedRole(role.key)}
              >
                {/* Icon */}
                <View style={[styles.roleIcon, { backgroundColor: role.bg }]}>
                  <Text style={styles.roleEmoji}>{role.emoji}</Text>
                </View>

                {/* Text */}
                <View style={styles.roleText}>
                  <Text style={[
                    styles.roleTitle,
                    isSelected && styles.roleTitleActive,
                  ]}>
                    {role.title}
                  </Text>
                  <Text style={styles.roleSub}>{role.subtitle}</Text>
                </View>

                {/* Radio */}
                <View style={[
                  styles.radio,
                  isSelected && styles.radioActive,
                ]}>
                  {isSelected && (
                    <Text style={styles.radioCheck}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>

        {/* Support link */}
        <TouchableOpacity style={styles.supportRow}>
          <Text style={styles.supportText}>
            Need help?{' '}
            <Text style={styles.supportLink}>Contact Support</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backArrow: {
    fontSize: 18,
    color: Colors.text,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    marginBottom: 32,
  },
  rolesContainer: {
    gap: 14,
    marginBottom: 32,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  roleCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.white,
    shadowColor: Colors.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleEmoji: {
    fontSize: 26,
  },
  roleText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  roleTitleActive: {
    color: Colors.primary,
  },
  roleSub: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  radioCheck: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  supportRow: {
    alignItems: 'center',
  },
  supportText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  supportLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});