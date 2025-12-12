import { CountryHeader, EmptyState, SearchBar, TenantCard } from "@/components/tenant/tenant-selector-components";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTenantTheme } from "@/contexts/tenant-theme-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useTenants } from "@/hooks/use-tenants";
import type { Tenant } from "@/repositories/schemas/tenant.schema";
import { Ionicons } from '@expo/vector-icons';
import { useScrollToTop } from '@react-navigation/native';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TenantSelectorScreen() {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { setTenant } = useTenantTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const scrollRef = useRef(null);
  const { isLoading, error, searchTenants } = useTenants();

  useScrollToTop(scrollRef);
  
  const authenticatedUser = { name: "Sofía", avatar: "https://randomuser.me/api/portraits/women/44.jpg" };

  const handleTenantSelect = async (tenant: Tenant) => {
    await setTenant(tenant);
    router.push("/(tabs)/cards");
  };

  const groupedTenants = useMemo(() => {
    const filtered = searchTenants(searchQuery);
    return filtered.reduce((acc, tenant) => {
      if (!acc[tenant.country]) acc[tenant.country] = [];
      acc[tenant.country].push(tenant);
      return acc;
    }, {} as Record<string, Tenant[]>);
  }, [searchQuery, searchTenants]);

  const countries = useMemo(() => {
    const priority = ["Ecuador", "Colombia", "México"];
    return Object.keys(groupedTenants).sort((a, b) => {
      const indexA = priority.indexOf(a);
      const indexB = priority.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedTenants]);

  const isIOS = Platform.OS === 'ios';

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.tenant.mainColor} />
        <ThemedText style={{ marginTop: 16 }}>Cargando instituciones...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <Ionicons name="warning-outline" size={48} color={theme.colors.textSecondary} />
        <ThemedText style={{ marginTop: 16, textAlign: 'center' }}>{error}</ThemedText>
        <Pressable onPress={() => window.location.reload()} style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: theme.tenant.mainColor, borderRadius: 8 }}>
          <ThemedText style={{ color: theme.tenant.textOnPrimary }}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={{ paddingTop: isIOS ? 0 : insets.top }} />
      <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic">
        <View style={styles.contentWrapper}>
          <Animated.View entering={FadeInUp.duration(600).springify()} style={layout.isLandscape ? styles.headerCompact : styles.header}>
            <Pressable onPress={() => router.push('/profile')}>
              <View style={[styles.userAvatarContainer, { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: theme.isDark ? 0.3 : 0.1, shadowRadius: 12, elevation: 8, borderColor: theme.colors.borderSubtle, borderWidth: 1 }]}>
                <Image source={{ uri: authenticatedUser.avatar }} style={styles.userAvatar} contentFit="cover" />
              </View>
            </Pressable>
            <View style={layout.isLandscape ? { flex: 1 } : undefined}>
              <ThemedText type="title" style={[styles.title, layout.isLandscape && { textAlign: 'left', fontSize: 24 }]}>
                Hola, {authenticatedUser.name}
              </ThemedText>
              {layout.isPortrait && <ThemedText style={styles.subtitle}>Selecciona tu entidad financiera</ThemedText>}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(100).springify()}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} onClear={() => setSearchQuery("")} />
          </Animated.View>

          <View style={styles.tenantsContainer}>
            {countries.length > 0 ? (
              countries.map((country, countryIndex) => (
                <Animated.View key={country} entering={FadeInDown.duration(600).delay(200 + countryIndex * 50).springify()}>
                  <CountryHeader country={country} flag={groupedTenants[country][0].countryFlag} count={groupedTenants[country].length} />
                  <View style={layout.isLandscape ? styles.tenantsGrid : undefined}>
                    {groupedTenants[country].map((tenant) => (
                      <TenantCard
                        key={tenant.slug}
                        tenant={tenant}
                        imageError={!!imageErrors[tenant.slug]}
                        onPress={() => handleTenantSelect(tenant)}
                        onImageError={() => setImageErrors(prev => ({ ...prev, [tenant.slug]: true }))}
                        isLandscape={layout.isLandscape}
                      />
                    ))}
                  </View>
                </Animated.View>
              ))
            ) : (
              <EmptyState />
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  contentWrapper: { flex: 1, padding: 20, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  header: { marginBottom: 24, alignItems: "center", gap: 12 },
  headerCompact: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
  userAvatarContainer: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', marginBottom: 8, backgroundColor: '#FFFFFF' },
  userAvatar: { width: '100%', height: '100%' },
  title: { marginBottom: 8, textAlign: "center", fontSize: 28 },
  subtitle: { fontSize: 15, opacity: 0.65, textAlign: "center", paddingHorizontal: 20 },
  tenantsContainer: { gap: 24 },
  tenantsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginHorizontal: -6 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
});

