import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../constants/colors';

const eventTypes = [
  'Wedding', 'Funeral', 'Birthday', 'Church', 'Home',
];

const decorStyles = [
  'Modern', 'Luxury', 'Rustic', 'Traditional',
];

const ideaChips = [
  'Gold & White theme',
  'Royal Blue & Silver',
  'Rustic Wooden Feel',
  'Tropical Greenery',
];

export default function GenerateScreen() {
  const router = useRouter();
  const [uploaded, setUploaded] = useState(false);
  const [eventType, setEventType] = useState('Wedding');
  const [decorStyle, setDecorStyle] = useState('Modern');
  const [vision, setVision] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    setLoading(true);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 3;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setLoading(false);
        router.push('/result');
      }
    }, 180);
  };

  // Loading screen
  if (loading) return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIconArea}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
        <Text style={styles.loadingTitle}>Generating Your Design</Text>
        <Text style={styles.loadingSub}>
          Our AI is creating your personalised decoration preview…
        </Text>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>

        {/* Steps */}
        <View style={styles.loadingSteps}>
          {[
            '📸 Analysing your space photo…',
            '🎨 Applying style preferences…',
            '✨ Identifying decoration items…',
          ].map((s, i) => (
            <View key={i} style={styles.loadingStep}>
              <View style={[
                styles.stepDot,
                progress > i * 33 && styles.stepDotActive,
              ]} />
              <Text style={[
                styles.stepText,
                progress > i * 33 && styles.stepTextActive,
              ]}>
                {s}
              </Text>
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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
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
            style={[styles.uploadBox, uploaded && styles.uploadBoxDone]}
            onPress={() => setUploaded(!uploaded)}
          >
            {uploaded ? (
              <>
                <Text style={styles.uploadEmoji}>🏠</Text>
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
                style={[
                  styles.chip,
                  eventType === e && styles.chipActive,
                ]}
                onPress={() => setEventType(e)}
              >
                <Text style={[
                  styles.chipText,
                  eventType === e && styles.chipTextActive,
                ]}>
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
                style={[
                  styles.chip,
                  decorStyle === s && styles.chipActive,
                ]}
                onPress={() => setDecorStyle(s)}
              >
                <Text style={[
                  styles.chipText,
                  decorStyle === s && styles.chipTextActive,
                ]}>
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

          {/* Idea chips */}
          <Text style={styles.ideasLabel}>TRY THESE IDEAS:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
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

        {/* Generate button */}
        <View style={styles.generateArea}>
          <TouchableOpacity
            style={[
              styles.generateBtn,
              !uploaded && styles.generateBtnDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!uploaded}
          >
            <Text style={styles.generateBtnText}>Generate Design</Text>
          </TouchableOpacity>
          <Text style={styles.generateNote}>
            Costs ₵20 per generation.{' '}
            <Text style={styles.generateLink}>Buy Credits</Text>
          </Text>
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backArrow: {
    fontSize: 18,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  requiredBadge: {
    backgroundColor: Colors.green100,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    backgroundColor: Colors.white,
    gap: 8,
  },
  uploadBoxDone: {
    borderColor: Colors.primary,
    backgroundColor: Colors.green100,
    borderStyle: 'solid',
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  uploadIcon: {
    fontSize: 26,
  },
  uploadEmoji: {
    fontSize: 48,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  uploadDoneText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  uploadSub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  selectFileBtn: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  selectFileText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  visionInput: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 14,
    color: Colors.text,
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: 6,
  },
  optionalText: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  ideasLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  ideasRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ideaChip: {
    backgroundColor: Colors.accentLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ideaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  generateArea: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  generateBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateBtnDisabled: {
    opacity: 0.4,
  },
  generateBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  generateNote: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  generateLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  loadingIconArea: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  loadingSub: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressBg: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  loadingSteps: {
    width: '100%',
    gap: 14,
    marginTop: 8,
  },
  loadingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  stepTextActive: {
    color: Colors.text,
    fontWeight: '500',
  },
});