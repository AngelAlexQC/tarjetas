import { ThemedText } from "@/components/themed-text";
import { useThemedColors } from "@/contexts/tenant-theme-context";
import { Info } from "lucide-react-native";
import { Platform, Pressable, StyleSheet, View } from "react-native";

interface FaqButtonProps {
  onPress: () => void;
  style?: any;
}

export function FaqButton({ onPress, style }: FaqButtonProps) {
  const isAndroid = Platform.OS === 'android';
  const themedColors = useThemedColors();
  
  const containerStyle = isAndroid ? styles.pillContainer : styles.rectContainer;
  const textStyle = isAndroid ? styles.googleText : styles.appleText;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        containerStyle,
        { 
            borderColor: themedColors.border,
            backgroundColor: 'transparent',
        },
        { opacity: pressed ? 0.6 : 1 },
        style,
      ]}
    >
      <View style={styles.content}>
        <Info size={24} color={themedColors.text} />
        <ThemedText 
          style={[textStyle, { color: themedColors.text, flexShrink: 1, textAlign: 'center' }]}
          adjustsFontSizeToFit
          numberOfLines={2}
        >
          Cómo funciona tu tarjeta, aquí te explicamos
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rectContainer: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 48,
  },
  pillContainer: {
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
    letterSpacing: -0.3,
  },
  googleText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: 'System',
  },
});
