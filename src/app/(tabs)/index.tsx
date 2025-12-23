import { useAuth } from "@/contexts/auth-context";
import { useTenantTheme } from "@/contexts/tenant-theme-context";
import { authStorage } from "@/core/storage/auth-storage";
import { useAppTheme, useResponsiveLayout } from "@/hooks";
import { useTenants } from "@/hooks/use-tenants";
import type { Tenant } from "@/repositories/schemas/tenant.schema";
import { ThemedText } from "@/ui/primitives/themed-text";
import { ThemedView } from "@/ui/primitives/themed-view";
import { Ionicons } from '@expo/vector-icons';
import { useScrollToTop } from '@react-navigation/native';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function LoadingState({ mainColor }: { mainColor: string }) {
  return (
    <ThemedView style={[styles.container, styles.centerContent]}>
      <ActivityIndicator size="large" color={mainColor} />
      <ThemedText style={{ marginTop: 16 }}>Cargando instituciones...</ThemedText>
    </ThemedView>
  );
}

function ErrorState({ error, theme }: { error: string; theme: ReturnType<typeof useAppTheme> }) {
  return (
    <ThemedView style={[styles.container, styles.centerContent]}>
      <Ionicons name="warning-outline" size={48} color={theme.colors.textSecondary} />
      <ThemedText style={{ marginTop: 16, textAlign: 'center' }}>
        {error}
      </ThemedText>
      <Pressable
        onPress={() => window.location.reload()}
        style={{
          marginTop: 24,
          paddingHorizontal: 24,
          paddingVertical: 12,
          backgroundColor: theme.tenant.mainColor,
          borderRadius: 8,
        }}
      >
        <ThemedText style={{ color: theme.tenant.textOnPrimary }}>
          Reintentar
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function sortCountriesByPriority(countries: string[]): string[] {
  const priority = ["Ecuador", "Colombia", "México"];
  return countries.sort((a, b) => {
    const indexA = priority.indexOf(a);
    const indexB = priority.indexOf(b);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return a.localeCompare(b);
  });
}

export default function TenantSelectorScreen() {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { setTenant } = useTenantTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const scrollRef = useRef(null);
  
  // Usar hook de tenants dinámico
  const { isLoading, error, searchTenants } = useTenants();

  useScrollToTop(scrollRef);
  
  // Estado para el nombre del usuario
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>("Usuario");

  useEffect(() => {
    const loadName = async () => {
      // 1. Intentar obtener nombre de instalación
      const installationName = await authStorage.getInstallationName();
      if (installationName) {
        setUserName(installationName);
        return;
      }
      
      // 2. Si no hay nombre de instalación, usar nombre del usuario autenticado
      if (user?.name) {
         setUserName(user.name);
         return;
      }

      // 3. Fallback a "Usuario" (ya seteado por defecto)
    };
    loadName();
  }, [user]);

  const handleTenantSelect = async (tenant: Tenant) => {
    await setTenant(tenant);
    
    // Navegar automáticamente a la pantalla de tarjetas
    router.push("/(tabs)/cards");
  };

  // Agrupar instituciones por país
  const groupedTenants = useMemo(() => {
    const filtered = searchTenants(searchQuery);

    const grouped = filtered.reduce((acc, tenant) => {
      if (!acc[tenant.country]) {
        acc[tenant.country] = [];
      }
      acc[tenant.country].push(tenant);
      return acc;
    }, {} as Record<string, Tenant[]>);

    return grouped;
  }, [searchQuery, searchTenants]);

  const countries = sortCountriesByPriority(Object.keys(groupedTenants));
  const isIOS = Platform.OS === 'ios';

  // Mostrar loading
  if (isLoading) {
    return <LoadingState mainColor={theme.tenant.mainColor} />;
  }

  // Mostrar error
  if (error) {
    return <ErrorState error={error} theme={theme} />;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={{ paddingTop: isIOS ? 0 : insets.top }} />
      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.contentWrapper}>
        {/* Header mejorado - Adaptable */}
        <Animated.View 
          entering={FadeInUp.duration(600).springify()}
          style={layout.isLandscape ? styles.headerCompact : styles.header}
        >
          <Pressable onPress={() => router.push('/profile')}>
            <View style={[styles.userAvatarContainer, {
              shadowColor: theme.isDark ? '#000' : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme.isDark ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 8,
              borderColor: theme.colors.borderSubtle,
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.isDark ? '#2C2C2E' : '#F2F2F7',
            }]}>
              <Ionicons 
                name="person" 
                size={40} 
                color={theme.tenant.mainColor} 
              />
            </View>
          </Pressable>
          <View style={layout.isLandscape ? { flex: 1 } : undefined}>
            <ThemedText type="title" style={[styles.title, layout.isLandscape && { textAlign: 'left', fontSize: 24 }]}>
              Hola, {userName}
            </ThemedText>
            {layout.isPortrait && (
              <ThemedText style={styles.subtitle}>
                Selecciona tu entidad financiera
              </ThemedText>
            )}
          </View>
        </Animated.View>

        {/* Barra de búsqueda */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(100).springify()}
          style={[styles.searchContainer, {
            backgroundColor: theme.isDark ? '#2C2C2E' : '#F2F2F7', // iOS System Gray 6 equivalent
            borderRadius: isIOS ? 10 : 24, // iOS vs Android style
            borderWidth: isIOS ? 0 : 1,
            borderColor: theme.colors.borderSubtle,
          }]}
        >
          <View style={styles.searchIconContainer}>
            <Ionicons name="search" size={20} color={theme.isDark ? "#8E8E93" : "#8E8E93"} />
          </View>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: theme.colors.text,
                fontFamily: isIOS ? 'System' : 'Roboto',
              },
            ]}
            placeholder="Buscar institución o país..."
            placeholderTextColor={theme.isDark ? "#8E8E93" : "#8E8E93"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={[styles.clearButton, {
                backgroundColor: theme.isDark ? '#3A3A3C' : '#C7C7CC',
              }]}
            >
              <Ionicons name="close" size={14} color={theme.isDark ? "#FFF" : "#000"} />
            </Pressable>
          )}
        </Animated.View>

        {/* Lista de instituciones agrupadas por país */}
        <View style={styles.tenantsContainer}>
          {countries.length > 0 ? (
            countries.map((country, countryIndex) => (
              <Animated.View
                key={country}
                entering={FadeInDown.duration(600)
                  .delay(200 + countryIndex * 50)
                  .springify()}
              >
                {/* Header de país */}
                <View style={styles.countryHeader}>
                  <ThemedText style={styles.countryFlag}>
                    {groupedTenants[country][0].countryFlag}
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.countryName}>
                    {country}
                  </ThemedText>
                  <View style={[styles.countryBadge, {
                    backgroundColor: theme.isDark ? '#2C2C2E' : '#E5E5EA',
                    borderRadius: isIOS ? 6 : 12,
                  }]}>
                    <ThemedText style={[styles.countryBadgeText, { color: theme.colors.textSecondary }]}>
                      {groupedTenants[country].length}
                    </ThemedText>
                  </View>
                </View>

                {/* Instituciones del país */}
                <View style={layout.isLandscape ? styles.tenantsGrid : undefined}>
                {groupedTenants[country].map((tenant) => (
                  <Pressable
                    key={tenant.slug}
                    style={({ pressed }) => [
                      styles.tenantCard,
                      layout.isLandscape && styles.tenantCardLandscape,
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
                    onPress={() => handleTenantSelect(tenant)}
                  >
                    <View style={styles.cardContent}>
                      <View style={[styles.logoContainer, {
                        backgroundColor: theme.isDark ? '#2C2C2E' : '#F2F2F7',
                        borderRadius: isIOS ? 8 : 12,
                      }]}>
                        {imageErrors[tenant.slug] ? (
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
                            onError={() => setImageErrors(prev => ({ ...prev, [tenant.slug]: true }))}
                          />
                        )}
                      </View>
                      
                      <View style={styles.tenantInfo}>
                        <ThemedText type="defaultSemiBold" style={styles.tenantName}>
                          {tenant.name}
                        </ThemedText>
                        <View style={styles.metadataRow}>
                          <View style={[styles.currencyBadge, { 
                            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            borderRadius: 4,
                          }]}>
                            <ThemedText style={styles.currency}>
                              {tenant.currencySymbol}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      {/* Chevron icon instead of color bar for cleaner look */}
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={theme.colors.textSecondary} 
                        style={{ opacity: 0.3 }}
                      />
                    </View>
                  </Pressable>
                ))}
                </View>
              </Animated.View>
            ))
          ) : (
            <Animated.View
              entering={FadeInDown.duration(600).delay(300).springify()}
              style={styles.emptyState}
            >
              <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
              <ThemedText type="defaultSemiBold" style={styles.emptyStateTitle}>
                No se encontraron instituciones
              </ThemedText>
              <ThemedText style={styles.emptyStateText}>
                Intenta con otro término de búsqueda
              </ThemedText>
            </Animated.View>
          )}
        </View>
      </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  contentWrapper: {
    flex: 1,
    padding: 20,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
    gap: 12,
  },
  headerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  headerEmoji: {
    fontSize: 32,
  },
  userAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  userAvatar: {
    width: '100%',
    height: '100%',
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
    fontSize: 28,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.65,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 2,
    gap: 8,
  },
  searchIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "transparent",
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 12,
    opacity: 0.6,
  },
  tenantsContainer: {
    gap: 24,
  },
  countryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
    gap: 10,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.4,
  },
  countryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countryBadgeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  tenantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: -6,
  },
  tenantCard: {
    marginBottom: 12,
  },
  tenantCardLandscape: {
    flex: 1,
    minWidth: 280,
    maxWidth: '48%',
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  logoContainer: {
    width: 56,
    height: 56,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  logoFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  logoFallbackText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currency: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
