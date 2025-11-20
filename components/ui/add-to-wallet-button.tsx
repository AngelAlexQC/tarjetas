import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

interface AddToWalletButtonProps {
  onPress: () => void;
  style?: any;
}

const WalletIcon = ({ color = "#FFFFFF" }: { color?: string }) => (
  <Svg width="28" height="24" viewBox="0 0 28 24" fill="none">
    {/* Card stack effect */}
    <Rect
      x="1"
      y="0"
      width="26"
      height="20"
      rx="3"
      fill={color}
      opacity="0.3"
    />
    <Rect
      x="2"
      y="2"
      width="26"
      height="20"
      rx="3"
      fill={color}
      opacity="0.5"
    />
    {/* Main card */}
    <Rect
      x="0"
      y="4"
      width="26"
      height="20"
      rx="3"
      fill={color}
    />
    {/* Card notch (wallet opening) */}
    <Rect
      x="18"
      y="11"
      width="4"
      height="6"
      rx="1"
      fill="#000000"
      opacity="0.3"
    />
  </Svg>
);

export function AddToWalletButton({ onPress, style }: AddToWalletButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={["#000000", "#1a1a1a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <WalletIcon color="#FFFFFF" />
            <View style={styles.textContainer}>
              <ThemedText style={styles.addText}>Agregar a</ThemedText>
              <ThemedText style={styles.walletText}>Apple Wallet</ThemedText>
            </View>
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  textContainer: {
    alignItems: "flex-start",
  },
  addText: {
    fontSize: 10,
    fontWeight: "400",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    lineHeight: 12,
  },
  walletText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    lineHeight: 20,
  },
});
