import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Radii, Type } from '../../constants/theme';
import { Palette, useColors } from '../../lib/theme';
import { Glass, GlassCard } from './Glass';

export type PickedPhoto = { uri: string; b64: string };

type Props = {
  onPicked: (photo: PickedPhoto) => void;
};

/** Apple bottom drawer — glass actions for camera / gallery. */
export const PhotoSheet = forwardRef<BottomSheet, Props>(function PhotoSheet({ onPicked }, ref) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const snaps = useMemo(() => ['32%'], []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />,
    [],
  );

  const pick = async (camera: boolean) => {
    const perm = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const opts: ImagePicker.ImagePickerOptions = {
      quality: 0.85,
      base64: true,
      allowsEditing: true,
      aspect: [3, 4],
      presentationStyle: (ImagePicker as any).UIImagePickerPresentationStyle?.FULL_SCREEN,
    };

    const res = camera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync({ ...opts, mediaTypes: ['images'] });

    const asset = res.assets?.[0];
    if (asset?.base64) onPicked({ uri: asset.uri, b64: asset.base64 });
    const sheet = ref && typeof ref === 'object' ? (ref as React.RefObject<BottomSheet | null>).current : null;
    sheet?.close();
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snaps}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: 'transparent' }}
      handleIndicatorStyle={{ backgroundColor: C.border, width: 40 }}
    >
      <BottomSheetView style={styles.outer}>
        <GlassCard intensity="strong" style={styles.sheet}>
          <Text style={styles.title}>Add a room photo</Text>
          <Text style={styles.sub}>Fullscreen camera or photo library</Text>
          <View style={styles.row}>
            <Pressable style={{ flex: 1 }} onPress={() => pick(true)}>
              <Glass isInteractive glassEffectStyle="clear" style={styles.action}>
                <View style={styles.icon}><Ionicons name="camera" size={22} color={C.primary} /></View>
                <Text style={styles.label}>Camera</Text>
                <Text style={styles.hint}>Fullscreen</Text>
              </Glass>
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => pick(false)}>
              <Glass isInteractive glassEffectStyle="clear" style={styles.action}>
                <View style={styles.icon}><Ionicons name="images" size={22} color={C.primary} /></View>
                <Text style={styles.label}>Gallery</Text>
                <Text style={styles.hint}>Photo library</Text>
              </Glass>
            </Pressable>
          </View>
        </GlassCard>
      </BottomSheetView>
    </BottomSheet>
  );
});

const makeStyles = (C: Palette) => StyleSheet.create({
  outer: { paddingHorizontal: 12, paddingBottom: 12 },
  sheet: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, borderRadius: Radii.xl },
  title: { ...Type.subtitle, color: C.text },
  sub: { ...Type.caption, color: C.textMuted, marginTop: 4, marginBottom: 18 },
  row: { flexDirection: 'row', gap: 12 },
  action: {
    borderRadius: Radii.md, padding: 16, alignItems: 'center', gap: 6, overflow: 'hidden',
  },
  icon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  label: { ...Type.subtitle, color: C.text, fontSize: 14 },
  hint: { ...Type.caption, color: C.textLight, fontSize: 11 },
});
