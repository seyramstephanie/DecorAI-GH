import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../constants/colors';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const [name, setName] = useState('Ama Serwaa');
  const [email, setEmail] = useState('ama.serwaa@gmail.com');
  const [phone, setPhone] = useState('+233 24 123 4567');
  const [location, setLocation] = useState('Accra, Ghana');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>
            {saved ? '✓ Saved!' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👩🏽</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          <View style={styles.card}>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={Colors.textLight}
              />
            </View>

          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={styles.settingsIconEmoji}>🔒</Text>
                </View>
                <View>
                  <Text style={styles.settingsLabel}>Change Password</Text>
                  <Text style={styles.settingsSub}>Last changed 30 days ago</Text>
                </View>
              </View>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Text style={styles.settingsIconEmoji}>📱</Text>
                </View>
                <View>
                  <Text style={styles.settingsLabel}>Two-Factor Authentication</Text>
                  <Text style={styles.settingsSub}>Add extra security to your account</Text>
                </View>
              </View>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: '#FFF9E6' }]}>
                  <Text style={styles.settingsIconEmoji}>🌍</Text>
                </View>
                <View>
                  <Text style={styles.settingsLabel}>Language</Text>
                  <Text style={styles.settingsSub}>English</Text>
                </View>
              </View>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: '#F3E8FF' }]}>
                  <Text style={styles.settingsIconEmoji}>💳</Text>
                </View>
                <View>
                  <Text style={styles.settingsLabel}>Subscription Plan</Text>
                  <Text style={styles.settingsSub}>Free Plan — 3 AI designs/month</Text>
                </View>
              </View>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>
              {saved ? '✓ Changes Saved!' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DANGER ZONE</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={styles.settingsIconEmoji}>⚠️</Text>
                </View>
                <View>
                  <Text style={[styles.settingsLabel, { color: Colors.red }]}>
                    Delete Account
                  </Text>
                  <Text style={styles.settingsSub}>
                    This action cannot be undone
                  </Text>
                </View>
              </View>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  container: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 24,
  },
  avatarOuter: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  changePhotoBtn: {
    backgroundColor: Colors.green100,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldGroup: {
    padding: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingsIconEmoji: {
    fontSize: 20,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingsSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  settingsArrow: {
    fontSize: 22,
    color: Colors.textLight,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});