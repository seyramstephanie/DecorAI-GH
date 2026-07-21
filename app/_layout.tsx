import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomNav } from '../components/ui/BottomNav';
import { hydrateSession } from '../lib/session';
import { hydrateStore, useStore } from '../lib/store';
import { useColors } from '../lib/theme';

export default function RootLayout() {
  const C = useColors();
  const { prefs } = useStore();
  useEffect(() => {
    // Restore login + toggles before screens decide where to send the user
    void Promise.all([hydrateSession(), hydrateStore()]);
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style={prefs.darkMode ? 'light' : 'dark'} />
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.bg },
              animation: 'slide_from_right',
            }}
          />
          {/* Outside Stack so tab pages can slide without moving the nav bar */}
          <BottomNav />
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
