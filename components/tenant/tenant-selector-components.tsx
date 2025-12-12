import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Tenant } from "@/repositories/schemas/tenant.schema";
import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// SearchBar Component
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChangeText, onClear }: SearchBarProps) {
  const theme = useAppTheme();
  const isIOS = Platform.OS === 'ios';

  return (
    <View style={[styles.searchContainer, {
      backgroundColor: theme.isDark ? '#2C2C2E' : '#F2F2F7',
      borderRadius: isIOS ? 10 : 24,
      borderWidth: isIOS ? 0 : 1,
      borderColor: theme.colors.borderSubtle,
    }]}>
      <View style={styles.searchIconContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
      </View>
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text, fontFamily: isIOS ? 'System' : 'Roboto' }]}
        placeholder="Buscar institución o país..."
        placeholderTextColor="#8E8E93"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} style={[styles.clearButton, { backgroundColor: theme.isDark ? '#3A3A3C' : '#C7C7CC' }]}>
          <Ionicons name="close" size={14} color={theme.isDark ? "#FFF" : "#000"} />
        </Pressable>
      )}
    </View>
  );
}

// TenantCard Component
interface TenantCardProps {
  tenant: Tenant;
  imageError: boolean;
  onPress: () => void;
  onImageError: () => void;
  isLandscape?: boolean;
}

export function TenantCard({ tenant, imageError, onPress, onImageError, isLandscape }: TenantCardProps) {
  const theme = useAppTheme();
  const isIOS = Platform.OS === 'ios';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tenantCard,
        isLandscape && styles.tenantCardLandscape,
        {
          backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
          borderRadius: isIOS ? 12 : 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0.2 : 0.05,
          shadowRadius: 8,
          elevation: 2,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          borderWidth: 1,
          borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <View style={[styles.logoContainer, { backgroundColor: theme.isDark ? '#2C2C2E' : '#F2F2F7', borderRadius: isIOS ? 8 : 12 }]}>
          {imageError ? (
            <View style={[styles.logoFallback, { backgroundColor: `${tenant.branding.primaryColor}20` }]}>
              <Text style={[styles.logoFallbackText, { color: tenant.branding.primaryColor }]}>
                {tenant.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: tenant.branding.logoUrl }}
              style={styles.logo}
              contentFit="contain"
              onError={onImageError}
            />
          )}
        </View>
        
        <View style={styles.tenantInfo}>
          <ThemedText type="defaultSemiBold" style={styles.tenantName}>{tenant.name}</ThemedText>
          <View style={styles.metadataRow}>
            <View style={[styles.currencyBadge, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 4 }]}>
              <ThemedText style={styles.currency}>{tenant.currencySymbol}</ThemedText>
            </View>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={{ opacity: 0.3 }} />
      </View>
    </Pressable>
  );
}

// CountryHeader Component
interface CountryHeaderProps {
  country: string;
  flag: string;
  count: number;
}

export function CountryHeader({ country, flag, count }: CountryHeaderProps) {
  const theme = useAppTheme();
  const isIOS = Platform.OS === 'ios';

  return (
    <View style={styles.countryHeader}>
      <ThemedText style={styles.countryFlag}>{flag}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.countryName}>{country}</ThemedText>
      <View style={[styles.countryBadge, { backgroundColor: theme.isDark ? '#2C2C2E' : '#E5E5EA', borderRadius: isIOS ? 6 : 12 }]}>
        <ThemedText style={[styles.countryBadgeText, { color: theme.colors.textSecondary }]}>{count}</ThemedText>
      </View>
    </View>
  );
}

// EmptyState Component
export function EmptyState() {
  const theme = useAppTheme();

  return (
    <Animated.View entering={FadeInDown.duration(600).delay(300).springify()} style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
      <ThemedText type="defaultSemiBold" style={styles.emptyStateTitle}>No se encontraron instituciones</ThemedText>
      <ThemedText style={styles.emptyStateText}>Intenta con otro término de búsqueda</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 2,
    gap: 8,
  },
  searchIconContainer: { width: 24, height: 24, justifyContent: "center", alignItems: "center" },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 16, backgroundColor: "transparent" },
  clearButton: { width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  tenantCard: { marginBottom: 12 },
  tenantCardLandscape: { flex: 1, minWidth: 280, maxWidth: '48%' },
  cardContent: { flexDirection: "row", alignItems: "center", padding: 16, position: "relative", overflow: "hidden" },
  logoContainer: { width: 56, height: 56, marginRight: 16, justifyContent: "center", alignItems: "center", padding: 8 },
  logo: { width: "100%", height: "100%" },
  logoFallback: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", borderRadius: 8 },
  logoFallbackText: { fontSize: 18, fontWeight: "700", letterSpacing: 0.5 },
  tenantInfo: { flex: 1 },
  tenantName: { fontSize: 16, marginBottom: 4, lineHeight: 20, fontWeight: "600", letterSpacing: -0.3 },
  metadataRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  currencyBadge: { paddingHorizontal: 6, paddingVertical: 2 },
  currency: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3, opacity: 0.6 },
  countryHeader: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 4, marginBottom: 12, gap: 10 },
  countryFlag: { fontSize: 24 },
  countryName: { fontSize: 17, fontWeight: '600', flex: 1, letterSpacing: -0.4 },
  countryBadge: { paddingHorizontal: 8, paddingVertical: 2 },
  countryBadgeText: { fontSize: 13, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 40 },
  emptyStateTitle: { fontSize: 18, marginBottom: 8, textAlign: "center" },
  emptyStateText: { fontSize: 15, opacity: 0.6, textAlign: "center" },
});
