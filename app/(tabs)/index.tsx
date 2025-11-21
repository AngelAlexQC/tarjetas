import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getTenantTheme } from "@/constants/tenant-themes";
import { useTenantTheme } from "@/contexts/tenant-theme-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { Ionicons } from '@expo/vector-icons';
import { useScrollToTop } from '@react-navigation/native';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Tenant {
  slug: string;
  name: string;
  logoUrl: string;
  mainColor: string;
  currencyCode: string;
  country: string;
  countryFlag: string;
}

const tenants: Tenant[] = [
  // Bancos Ecuador
  {
    slug: "bpichincha",
    name: "Banco Pichincha",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/Banco_Pichincha_nuevo.png",
    mainColor: "#ffdf00",
    currencyCode: "US$",
    country: "Ecuador",
    countryFlag: "🇪🇨",
  },
  {
    slug: "coopchone",
    name: "Cooperativa de Ahorro y Crédito Chone",
    logoUrl:
      "https://coopchone.fin.ec/wp-content/uploads/2025/01/LogoHorizontal.png",
    mainColor: "#006837",
    currencyCode: "US$",
    country: "Ecuador",
    countryFlag: "🇪🇨",
  },
  {
    slug: "dinersclub-ec",
    name: "Diners Club",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a6/Diners_Club_Logo3.svg",
    mainColor: "#0079be",
    currencyCode: "US$",
    country: "Ecuador",
    countryFlag: "🇪🇨",
  },
  
  // Bancos Colombia
  {
    slug: "bancolombia",
    name: "Bancolombia",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/dc/Bancolombia_S.A._logo.svg",
    mainColor: "#FFEB00",
    currencyCode: "COP$",
    country: "Colombia",
    countryFlag: "🇨🇴",
  },
  {
    slug: "davivienda-co",
    name: "Davivienda",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Davivienda_Logo.png",
    mainColor: "#D22C21",
    currencyCode: "COP$",
    country: "Colombia",
    countryFlag: "🇨🇴",
  },
  
  // Bancos México
  {
    slug: "bbva-mx",
    name: "BBVA México",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/98/BBVA_logo_2025.svg",
    mainColor: "#004481",
    currencyCode: "MX$",
    country: "México",
    countryFlag: "🇲🇽",
  },
  
  // Bancos Internacionales
  {
    slug: "jpmorgan",
    name: "JPMorgan Chase",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Chase_logo.svg/200px-Chase_logo.svg.png",
    mainColor: "#117ACA",
    currencyCode: "US$",
    country: "United States",
    countryFlag: "🇺🇸",
  },
  {
    slug: "hsbc",
    name: "HSBC",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/HSBC_logo_%282018%29.svg/200px-HSBC_logo_%282018%29.svg.png",
    mainColor: "#DB0011",
    currencyCode: "£",
    country: "United Kingdom",
    countryFlag: "🇬🇧",
  },
  {
    slug: "santander",
    name: "Banco Santander",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/200px-Banco_Santander_Logotipo.svg.png",
    mainColor: "#EC0000",
    currencyCode: "€",
    country: "España",
    countryFlag: "🇪🇸",
  },
  {
    slug: "deutsche-bank",
    name: "Deutsche Bank",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Deutsche_Bank_logo_without_wordmark.svg/200px-Deutsche_Bank_logo_without_wordmark.svg.png",
    mainColor: "#0018A8",
    currencyCode: "€",
    country: "Deutschland",
    countryFlag: "🇩🇪",
  },
  {
    slug: "bnp-paribas",
    name: "BNP Paribas",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/BNP_Paribas.svg/200px-BNP_Paribas.svg.png",
    mainColor: "#008755",
    currencyCode: "€",
    country: "France",
    countryFlag: "🇫🇷",
  },
  {
    slug: "icbc",
    name: "ICBC China",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/ICBC_Logo.svg/200px-ICBC_Logo.svg.png",
    mainColor: "#C8102E",
    currencyCode: "¥",
    country: "China",
    countryFlag: "🇨🇳",
  },
  {
    slug: "commonwealth",
    name: "Commonwealth Bank",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Commonwealth_Bank_logo.svg/200px-Commonwealth_Bank_logo.svg.png",
    mainColor: "#FFCC00",
    currencyCode: "A$",
    country: "Australia",
    countryFlag: "🇦🇺",
  },
  {
    slug: "itau",
    name: "Itaú Unibanco",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ita%C3%BA_Unibanco_logo.svg/200px-Ita%C3%BA_Unibanco_logo.svg.png",
    mainColor: "#EC7000",
    currencyCode: "R$",
    country: "Brasil",
    countryFlag: "🇧🇷",
  },
];

export default function TenantSelectorScreen() {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { setTenant } = useTenantTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const scrollRef = useRef(null);

  useScrollToTop(scrollRef);
  
  // Usuario autenticado - esto debería venir de tu sistema de autenticación
  const authenticatedUser = {
    name: "Sofía",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  };

  const handleTenantSelect = async (tenant: Tenant) => {
    const tenantTheme = getTenantTheme(tenant.slug);
    await setTenant(tenantTheme);
    
    // Navegar automáticamente a la pantalla de tarjetas
    router.push("/(tabs)/cards");
  };

  // Agrupar instituciones por país
  const groupedTenants = useMemo(() => {
    const filtered = tenants.filter((tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = filtered.reduce((acc, tenant) => {
      if (!acc[tenant.country]) {
        acc[tenant.country] = [];
      }
      acc[tenant.country].push(tenant);
      return acc;
    }, {} as Record<string, Tenant[]>);

    return grouped;
  }, [searchQuery]);

  const countries = Object.keys(groupedTenants).sort();
  const isIOS = Platform.OS === 'ios';

  return (
    <ThemedView style={styles.container}>
      <View style={{ paddingTop: insets.top }} />
      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
        {/* Header mejorado - Adaptable */}
        <Animated.View 
          entering={FadeInUp.duration(600).springify()}
          style={layout.isLandscape ? styles.headerCompact : styles.header}
        >
          <View style={[styles.userAvatarContainer, {
            shadowColor: theme.isDark ? '#000' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme.isDark ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 8,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
          }]}>
            <Image
              source={{ uri: authenticatedUser.avatar }}
              style={styles.userAvatar}
              contentFit="cover"
            />
          </View>
          <View style={layout.isLandscape ? { flex: 1 } : undefined}>
            <ThemedText type="title" style={[styles.title, layout.isLandscape && { textAlign: 'left', fontSize: 24 }]}>
              Hola, {authenticatedUser.name}
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
                          <View style={[styles.logoFallback, { backgroundColor: `${tenant.mainColor}20` }]}>
                            <Text style={[styles.logoFallbackText, { color: tenant.mainColor }]}>
                              {tenant.name.substring(0, 2).toUpperCase()}
                            </Text>
                          </View>
                        ) : (
                          <Image
                            source={{ uri: tenant.logoUrl }}
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
                              {tenant.currencyCode}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      {/* Chevron icon instead of color bar for cleaner look */}
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={theme.colors.icon} 
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
});
