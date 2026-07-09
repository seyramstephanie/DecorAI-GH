import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F8F9FA" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="create-account" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="home" />
        <Stack.Screen name="generate" />
        <Stack.Screen name="result" />
        <Stack.Screen name="shops" />
        <Stack.Screen name="decorators" />
        <Stack.Screen name="bookings" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="account-settings" />
        <Stack.Screen name="design-brief" />
        <Stack.Screen name="radius-alert" />
      </Stack>
    </>
  );
}
