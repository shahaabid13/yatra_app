import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      {/* This is where you define the screen options for index.tsx */}
      <Stack.Screen
        name="index"
        options={{
          title: "Amarnath Yatra",  // ✅ Changes "index" to your desired title
          headerShown: true,       // ✅ Hides default header if you're using a custom one
        }}
      />
      <Stack.Screen name="register" />
    </Stack>
  );
}
