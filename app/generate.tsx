import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../constants/colors';
import { generateDecoration } from '../constants/gemini';
import * as ImagePicker from 'expo-image-picker';

const eventTypes = ['Wedding', 'Funeral', 'Birthday', 'Church', 'Home'];
const decorStyles = ['Modern', 'Luxury', 'Rustic', 'Traditional'];
const ideaChips = [
  'Gold & White theme',
  'Royal Blue & Silver',
  'Rustic Wooden Feel',
  'Tropical Greenery',
];

export default function GenerateScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [eventType, setEventType] = useState('Wedding');
  const [decorStyle, setDecorStyle] = useState('Modern');
  const [vision, setVision] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadSheet, setShowUploadSheet] = useState(false);

  const handleCamera = async () => {
    setShowUploadSheet(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    }
  };

  const handleGallery = async () => {
    setShowUploadSheet(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
const handleGenerate = async () => {
  setLoading(true);
  setError('');
  try {
    const result = await generateDecoration(
      eventType,
      decorStyle,
      vision,
      photoUri,
    );
    router.push({
      pathname: '/result',
      params: { aiResult: result, eventType, decorStyle },
    });
  } catch (e: any) {
    setError(e.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (loading) return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIconArea}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
        <Text style={styles.loadingTitle}>Generating Your Design</Text>
        <Text style={styles.loadingSub}>
          Gemini AI is creating your personalised decoration advice…
        </Text>
        <View style={styles.loadingSteps}>
          {[
            '📸 Analysing your space photo…',
            '🎨 Applying style preferences…',
            '✨ Identifying decoration items…',
          ].map((s, i) => (
            <View key={i} style={styles.loadingStep}>
              <View style={styles.stepDotActive} />
              <Text style={styles.stepTextActive}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Design</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 1. Upload */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>1. UPLOAD YOUR SPACE</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.uploadBox, imageUri != null && styles.uploadBoxDone]}
            onPress={() => setShowUploadSheet(true)}
          >
            {imageUri ? (
              <>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <Text style={styles.uploadDoneText}>Photo uploaded!</Text>
                <Text style={styles.uploadSub}>Tap to change</Text>
              </>
            ) : (
              <>
                <View style={styles.uploadIconCircle}>
                  <Text style={styles.uploadIcon}>📷</Text>
                </View>
                <Text style={styles.uploadTitle}>Take or upload a photo</Text>
                <Text style={styles.uploadSub}>
                  Clear photos of your empty or current room work best
                </Text>
                <View style={styles.selectFileBtn}>
                  <Text style={styles.selectFileText}>Select File</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Event Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. EVENT TYPE</Text>
          <View style={styles.chipsRow}>
            {eventTypes.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.chip, eventType === e && styles.chipActive]}
                onPress={() => setEventType(e)}
              >
                <Text style={[styles.chipText, eventType === e && styles.chipTextActive]}>
                  {e}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. Decor Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. DECOR STYLE</Text>
          <View style={styles.chipsRow}>
            {decorStyles.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, decorStyle === s && styles.chipActive]}
                onPress={() => setDecorStyle(s)}
              >
                <Text style={[styles.chipText, decorStyle === s && styles.chipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. Vision */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. DESCRIBE YOUR VISION</Text>
          <TextInput
            style={styles.visionInput}
            placeholder="Describe your vision (e.g. I want a grand floral entrance with warm lighting...)"
            placeholderTextColor={Colors.textLight}
            value={vision}
            onChangeText={setVision}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.optionalText}>OPTIONAL</Text>
          <Text style={styles.ideasLabel}>TRY THESE IDEAS:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.ideasRow}>
              {ideaChips.map((idea) => (
                <TouchableOpacity
                  key={idea}
                  style={styles.ideaChip}
                  onPress={() => setVision(idea)}
                >
                  <Text style={styles.ideaChipText}>{idea}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Generate button */}
        <View style={styles.generateArea}>
          <TouchableOpacity
            style={[styles.generateBtn, imageUri == null && styles.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={imageUri == null}
          >
            <Text style={styles.generateBtnText}>✨ Generate Design</Text>
          </TouchableOpacity>
          <Text style={styles.generateNote}>Powered by Google Gemini AI</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Upload Bottom Sheet */}
      <Modal
        visible={showUploadSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadSheet(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowUploadSheet(false)}>
          <Pressable style={styles.bottomSheet}>
            <View style={styles.handleBar} />
            <Text style={styles.sheetTitle}>Upload Your Space</Text>
            <Text style={styles.sheetSub}>
              Choose how you want to add your space photo
            </Text>

            <TouchableOpacity style={styles.sheetOption} onPress={handleCamera}>
              <View style={[styles.sheetOptionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Text style={styles.sheetOptionEmoji}>📷</Text>
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={styles.sheetOptionLabel}>Take a Photo</Text>
                <Text style={styles.sheetOptionSub}>
                  Use your camera to photograph your space
                </Text>
              </View>
              <Text style={styles.sheetOptionArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.sheetDivider} />

            <TouchableOpacity style={styles.sheetOption} onPress={handleGallery}>
              <View style={[styles.sheetOptionIcon, { backgroundColor: '#FFF9E6' }]}>
                <Text style={styles.sheetOptionEmoji}>🖼️</Text>
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={styles.sheetOptionLabel}>Choose from Gallery</Text>
                <Text style={styles.sheetOptionSub}>
                  Select an existing photo from your phone
                </Text>
              </View>
              <Text style={styles.sheetOptionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              onPress={() => setShowUploadSheet(false)}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  backArrow: { fontSize: 18, color: Colors.text },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 0.8, marginBottom: 12,
  },
  requiredBadge: {
    backgroundColor: Colors.green100, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  requiredText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  uploadBox: {
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: 16, padding: 28, alignItems: 'center',
    backgroundColor: Colors.white, gap: 8,
  },
  uploadBoxDone: {
    borderColor: Colors.primary, backgroundColor: Colors.green100,
    borderStyle: 'solid',
  },
  previewImage: { width: 140, height: 140, borderRadius: 12, marginBottom: 4 },
  uploadIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.green100,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  uploadIcon: { fontSize: 26 },
  uploadTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  uploadDoneText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  uploadSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  selectFileBtn: {
    marginTop: 8, borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8,
  },
  selectFileText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 14, fontWeight: '500', color: Colors.text },
  chipTextActive: { color: Colors.white, fontWeight: '700' },
  visionInput: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 14, padding: 16, fontSize: 14, color: Colors.text,
    minHeight: 110, textAlignVertical: 'top', marginBottom: 6,
  },
  optionalText: {
    fontSize: 11, color: Colors.textLight, fontWeight: '600',
    textAlign: 'right', marginBottom: 16, letterSpacing: 0.5,
  },
  ideasLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 0.5, marginBottom: 10,
  },
  ideasRow: { flexDirection: 'row', gap: 10 },
  ideaChip: {
    backgroundColor: Colors.accentLight, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  ideaChipText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  errorBox: {
    marginHorizontal: 20, backgroundColor: '#FEE2E2',
    borderRadius: 12, padding: 14, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: Colors.red, fontWeight: '500' },
  generateArea: { paddingHorizontal: 20, alignItems: 'center' },
  generateBtn: {
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18,
    width: '100%', alignItems: 'center', marginBottom: 12,
    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  generateBtnDisabled: { opacity: 0.4 },
  generateBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  generateNote: { fontSize: 13, color: Colors.textMuted },
  loadingContainer: {
    flex: 1, backgroundColor: Colors.bg, alignItems: 'center',
    justifyContent: 'center', padding: 32, gap: 16,
  },
  loadingIconArea: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.green100, alignItems: 'center', justifyContent: 'center',
  },
  loadingTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  loadingSub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  loadingSteps: { width: '100%', gap: 14, marginTop: 8 },
  loadingStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDotActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  stepTextActive: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12,
  },
  handleBar: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  sheetSub: { fontSize: 14, color: Colors.textMuted, marginBottom: 24, lineHeight: 20 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  sheetOptionIcon: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sheetOptionEmoji: { fontSize: 24 },
  sheetOptionText: { flex: 1 },
  sheetOptionLabel: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  sheetOptionSub: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  sheetOptionArrow: { fontSize: 22, color: Colors.textLight },
  sheetDivider: { height: 1, backgroundColor: Colors.border },
  sheetCancelBtn: {
    marginTop: 16, backgroundColor: Colors.bg, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  sheetCancelText: { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
});