import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Touch-driven 3D tilt — lightweight app equivalent of a Three.js hover card.
 */
export function TiltCard({ children, style }: Props) {
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const scale = useSharedValue(1);

  const pan = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.03, { damping: 14 });
    })
    .onUpdate((e) => {
      // Map drag to subtle perspective rotation
      ry.value = Math.max(-12, Math.min(12, e.translationX / 18));
      rx.value = Math.max(-10, Math.min(10, -e.translationY / 22));
    })
    .onFinalize(() => {
      rx.value = withSpring(0);
      ry.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const anim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${rx.value}deg` },
      { rotateY: `${ry.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, style, anim]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, overflow: 'hidden' },
});
