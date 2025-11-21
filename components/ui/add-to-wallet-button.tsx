import { ThemedText } from "@/components/themed-text";
import { useThemedColors } from "@/contexts/tenant-theme-context";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

interface AddToWalletButtonProps {
  onPress: () => void;
  style?: any;
}

const AppleWalletLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 5H5C3.34315 5 2 6.34315 2 8V16C2 17.6569 3.34315 19 5 19H19C20.6569 19 22 17.6569 22 16V8C22 6.34315 20.6569 5 19 5Z"
      fill="url(#apple_wallet_gradient)"
    />
    <Path
      d="M19 5H5C3.34315 5 2 6.34315 2 8V16C2 17.6569 3.34315 19 5 19H19C20.6569 19 22 17.6569 22 16V8C22 6.34315 20.6569 5 19 5Z"
      fill="url(#apple_wallet_sheen)"
      fillOpacity="0.2"
    />
    <Path
      d="M4 8C4 7.44772 4.44772 7 5 7H19C19.5523 7 20 7.44772 20 8V9H4V8Z"
      fill="#FFFFFF"
      fillOpacity="0.2"
    />
    <Rect x="2" y="8" width="20" height="11" rx="2" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
    {/* Cards sticking out */}
    <Path d="M6 5V4C6 3.44772 6.44772 3 7 3H17C17.5523 3 18 3.44772 18 4V5" stroke="#34C759" strokeWidth="2" />
    <Path d="M8 5V3C8 2.44772 8.44772 2 9 2H15C15.5523 2 16 2.44772 16 3V5" stroke="#FF9500" strokeWidth="2" />
    <Defs>
      <LinearGradient id="apple_wallet_gradient" x1="12" y1="5" x2="12" y2="19" gradientUnits="userSpaceOnUse">
        <Stop stopColor="#1C1C1E" />
        <Stop offset="1" stopColor="#2C2C2E" />
      </LinearGradient>
      <LinearGradient id="apple_wallet_sheen" x1="2" y1="5" x2="22" y2="19" gradientUnits="userSpaceOnUse">
        <Stop stopColor="white" stopOpacity="0.1"/>
        <Stop offset="1" stopColor="white" stopOpacity="0"/>
      </LinearGradient>
    </Defs>
  </Svg>
);

const GoogleWalletLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M21.5 10.5H20.25V9.75C20.25 9.33579 19.9142 9 19.5 9H4.5C4.08579 9 3.75 9.33579 3.75 9.75V10.5H2.5C1.67157 10.5 1 11.1716 1 12V18C1 18.8284 1.67157 19.5 2.5 19.5H21.5C22.3284 19.5 23 18.8284 23 18V12C23 11.1716 22.3284 10.5 21.5 10.5Z"
      fill="#4285F4"
    />
    <Path
      d="M20.25 9.75V7.5C20.25 5.84315 18.9069 4.5 17.25 4.5H6.75C5.09315 4.5 3.75 5.84315 3.75 7.5V9.75H20.25Z"
      fill="#34A853"
    />
    <Path
      d="M20.25 9.75H3.75V10.5H20.25V9.75Z"
      fill="#1967D2"
    />
    <Path
      d="M3.75 9.75H20.25V10.5H3.75V9.75Z"
      fill="#FBBC04"
    />
    <Path
      d="M1 12H23V13H1V12Z"
      fill="#1967D2"
      fillOpacity="0.2"
    />
    <Rect x="12.5" y="13.5" width="8" height="3" rx="1.5" fill="#FFFFFF" />
    <Path d="M20.25 9.75H3.75V7.5C3.75 6.2 4.5 5.1 5.6 4.7L17.25 4.5C18.9069 4.5 20.25 5.84315 20.25 7.5V9.75Z" fill="#EA4335" />
    <Path d="M3.75 9.75H20.25V7.5C20.25 5.84315 18.9069 4.5 17.25 4.5H6.75C5.09315 4.5 3.75 5.84315 3.75 7.5V9.75Z" fill="#34A853" />
    <Path d="M3.75 9.75H20.25V8.5H3.75V9.75Z" fill="#FBBC04" />
    <Path d="M3.75 9.75H20.25V10.5H3.75V9.75Z" fill="#1967D2" />
    <Path d="M21.5 10.5H2.5C1.67157 10.5 1 11.1716 1 12V18C1 18.8284 1.67157 19.5 2.5 19.5H21.5C22.3284 19.5 23 18.8284 23 18V12C23 11.1716 22.3284 10.5 21.5 10.5Z" fill="#4285F4" />
    <Rect x="12.5" y="13.5" width="8" height="3" rx="1.5" fill="#FFFFFF" />
  </Svg>
);

export function AddToWalletButton({ onPress, style }: AddToWalletButtonProps) {
  const isAndroid = Platform.OS === 'android';
  const themedColors = useThemedColors();
  
  if (isAndroid) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.googleContainer,
          { backgroundColor: themedColors.primary },
          { opacity: pressed ? 0.9 : 1 },
          style,
        ]}
      >
        <View style={styles.content}>
          <GoogleWalletLogo />
          <ThemedText style={[styles.googleText, { color: themedColors.textOnPrimary }]}>Agregar a la Billetera de Google</ThemedText>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.appleContainer,
        { backgroundColor: themedColors.primary },
        { opacity: pressed ? 0.9 : 1 },
        style,
      ]}
    >
      <View style={styles.content}>
        <AppleWalletLogo />
        <ThemedText style={[styles.appleText, { color: themedColors.textOnPrimary }]}>Agregar a Apple Wallet</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  appleContainer: {
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 48,
  },
  googleContainer: {
    backgroundColor: '#000000',
    borderRadius: 24, // Pill shape for Google
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 48,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  appleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  googleText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    fontFamily: 'System', // Uses system font which is Roboto on Android
  },
});
