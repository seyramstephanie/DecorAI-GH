import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInLeft, FadeInRight, FadeOut, runOnJS, useAnimatedStyle, useSharedValue,
  withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { Palette, useColors } from '../../lib/theme';
import { Glass } from './Glass';

// Floating "Decorate with AI" bubble — draggable, docks to the left/right screen
// edge, and every few seconds "thinks" (pulse + dots) then briefly shows its label.
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SIZE = 58;
const MARGIN = 10;
const LEFT_X = MARGIN;
const RIGHT_X = SCREEN_W - SIZE - MARGIN;
const TOP_MIN = 90;                    // stay below the header
const BOTTOM_MAX = SCREEN_H - 190;     // stay above the bottom nav

type Phase = 'idle' | 'thinking' | 'label';

export function AiBubble({ onPress }: { onPress: () => void }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const tx = useSharedValue(RIGHT_X);
  const ty = useSharedValue(SCREEN_H * 0.52);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);
  const [dockedRight, setDockedRight] = useState(true);
  const [phase, setPhase] = useState<Phase>('idle');

  // Idle loop: wait → think for a moment → whisper "Decorate with AI" → rest.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const cycle = () => timers.push(setTimeout(() => {
      setPhase('thinking');
      timers.push(setTimeout(() => {
        setPhase('label');
        timers.push(setTimeout(() => { setPhase('idle'); cycle(); }, 2800));
      }, 1700));
    }, 6500));
    cycle();
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === 'thinking') {
      scale.value = withRepeat(withSequence(
        withTiming(1.12, { duration: 280 }), withTiming(1, { duration: 280 }),
      ), 3);
    }
  }, [phase, scale]);

  const pan = Gesture.Pan()
    .onStart(() => { startX.value = tx.value; startY.value = ty.value; })
    .onUpdate((e) => {
      tx.value = startX.value + e.translationX;
      ty.value = Math.min(Math.max(startY.value + e.translationY, TOP_MIN), BOTTOM_MAX);
    })
    .onEnd(() => {
      const toRight = tx.value + SIZE / 2 > SCREEN_W / 2; // snap to the nearest side only
      tx.value = withSpring(toRight ? RIGHT_X : LEFT_X, { damping: 15 });
      runOnJS(setDockedRight)(toRight);
    });
  const tap = Gesture.Tap().onEnd(() => { runOnJS(onPress)(); });
  const gesture = Gesture.Race(pan, tap);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));
  const bubbleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.wrap, wrapStyle]}>
        {phase === 'label' && (
          <Animated.View
            entering={(dockedRight ? FadeInRight : FadeInLeft).duration(260)}
            exiting={FadeOut.duration(180)}
            style={[styles.labelPillWrap, dockedRight ? { right: SIZE + 10 } : { left: SIZE + 10 }]}
          >
            <Glass isInteractive glassEffectStyle="clear" style={styles.labelPill}>
              <Text style={styles.labelText} numberOfLines={1}>Decorate with AI ✨</Text>
            </Glass>
          </Animated.View>
        )}
        <Animated.View style={[styles.bubble, bubbleStyle]}>
          <LinearGradient
            colors={[C.primaryLight, C.primary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {phase === 'thinking'
              ? <ThinkingDots />
              : <Ionicons name="sparkles" size={24} color={C.onPrimary} />}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function ThinkingDots() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <Animated.View style={styles.dotsRow}>
      {[0, 1, 2].map((i) => <Dot key={i} delay={i * 160} />)}
    </Animated.View>
  );
}

function Dot({ delay }: { delay: number }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const opacity = useSharedValue(0.35);
  useEffect(() => {
    const t = setTimeout(() => {
      opacity.value = withRepeat(withSequence(
        withTiming(1, { duration: 260 }), withTiming(0.35, { duration: 260 }),
      ), -1);
    }, delay);
    return () => clearTimeout(t);
  }, [delay, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, zIndex: 40 },
  bubble: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  gradient: {
    flex: 1, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center',
  },
  labelPillWrap: {
    position: 'absolute', top: SIZE / 2 - 19, width: 172, height: 38,
  },
  labelPill: {
    flex: 1, borderRadius: 19, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  labelText: { fontSize: 13, fontWeight: '700', color: C.primary },
  dotsRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.onPrimary },
});
