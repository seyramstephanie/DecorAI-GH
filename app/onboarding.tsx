import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Visualise Your Dream Space',
    body: 'AI-powered decoration previews for your home or event.',
    tag: 'TRANSFORM',
    bgColor: '#1B4332',
    emoji: '🛋️',
  },
  {
    id: 2,
    title: 'Source Items Instantly',
    body: 'Find and buy decoration items from local shops in Ghana.',
    tag: 'INSTANT BUY',
    bgColor: '#2D6A4F',
    emoji: '🛍️',
  },
  {
    id: 3,
    title: 'Find Decorators Near You',
    body: 'Connect with top-rated local decorators for your special events.',
    tag: 'TOP RATED EXPERTS',
    bgColor: '#1B4332',
    emoji: '🎨',
  },
  {
    id: 4,
    title: 'Ready to Transform Your Space?',
    body: 'Join DecorAI GH today and bring your vision to life with the best local expertise.',
    tag: null,
    bgColor: '#F8F9FA',
    emoji: '✨',
    isLast: true,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const slide = slides[current];

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  // Last slide — special layout
  if (slide.isLast) return (
    <View style={styles.container}>
      {/* Image area */}
      <View style={[styles.imageArea, { backgroundColor: '#E8F5E9' }]}>
        <View style={styles.mockImageLast}>
          <Text style={styles.mockEmoji}>🏠</Text>
          <View style={styles.tagBadge}>
            <View style={[styles.tagDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.tagText}>Your vision, realized.</Text>
          </View>
          <Text style={styles.mockSubTag}>Join thousands of happy users</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.titleLarge}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === current ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}>
          <Text style={styles.btnPrimaryText}>Get Started →</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.alreadyText}>
            Already have an account?{' '}
            <Text style={styles.alreadyLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top nav */}
      <View style={styles.topNav}>
        {current > 0 ? (
          <TouchableOpacity
            onPress={() => setCurrent(current - 1)}
            style={styles.backCircle}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Image area */}
      <View style={[styles.imageArea, { backgroundColor: slide.bgColor + '22' }]}>
        <View style={[styles.mockImage, { backgroundColor: slide.bgColor }]}>
          <Text style={styles.slideEmoji}>{slide.emoji}</Text>
          {slide.tag && (
            <View style={styles.floatingTag}>
              <Text style={styles.floatingTagText}>{slide.tag}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.titleLarge}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === current ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.btnDark} onPress={handleNext}>
          <Text style={styles.btnDarkText}>
            {current < slides.length - 1 ? 'Next ›' : 'Get Started →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backCircle: {
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
  skipText: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  imageArea: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    height: height * 0.42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  mockImageLast: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 24,
    gap: 12,
  },
  mockEmoji: {
    fontSize: 80,
  },
  slideEmoji: {
    fontSize: 90,
  },
  floatingTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  floatingTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  mockSubTag: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    alignItems: 'center',
  },
  titleLarge: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  body: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.accent,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.border,
  },
  btnDark: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  btnDarkText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  btnPrimary: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  btnPrimaryText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  alreadyText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  alreadyLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});