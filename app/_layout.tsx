import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { hydrateStore, useStore } from '../lib/store';
import { useColors } from '../lib/theme';

export default function RootLayout() {
  const C = useColors();
  const { prefs } = useStore();
  useEffect(() => { void hydrateStore(); }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style={prefs.darkMode ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: C.bg },
            animation: 'slide_from_right',
          }}
        />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
