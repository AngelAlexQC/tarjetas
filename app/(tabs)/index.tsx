import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getTenantTheme } from "@/constants/tenant-themes";
import { useTenantTheme } from "@/contexts/tenant-theme-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

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
  const { setTenant } = useTenantTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.content}>
        {/* Header mejorado */}
        <Animated.View 
          entering={FadeInUp.duration(600).springify()}
          style={styles.header}
        >
          <View style={styles.headerIcon}>
            <ThemedText style={styles.headerEmoji}>🏛️</ThemedText>
          </View>
          <ThemedText type="title" style={styles.title}>
            Selecciona tu Institución
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Elige tu entidad financiera para continuar
          </ThemedText>
        </Animated.View>

        {/* Barra de búsqueda */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(100).springify()}
          style={styles.searchContainer}
        >
          <View style={styles.searchIconContainer}>
            <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          </View>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: theme.isDark ? "#ECEDEE" : "#11181C",
                backgroundColor: theme.isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.04)",
              },
            ]}
            placeholder="Buscar institución o país..."
            placeholderTextColor={theme.isDark ? "#888" : "#999"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <ThemedText style={styles.clearButtonText}>✕</ThemedText>
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
                  <View style={styles.countryBadge}>
                    <ThemedText style={styles.countryBadgeText}>
                      {groupedTenants[country].length}
                    </ThemedText>
                  </View>
                </View>

                {/* Instituciones del país */}
                {groupedTenants[country].map((tenant) => (
                  <Pressable
                    key={tenant.slug}
                    style={({ pressed }) => [
                      styles.tenantCard,
                      {
                        opacity: pressed ? 0.9 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                    onPress={() => handleTenantSelect(tenant)}
                  >
                    {/* Fondo con gradiente colorido basado en el color de la institución */}
                    <LinearGradient
                      colors={[
                        `${tenant.mainColor}15`,
                        `${tenant.mainColor}25`,
                        `${tenant.mainColor}35`,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    
                    {/* Capa de blur glassmorphism */}
                    <BlurView
                      intensity={20}
                      tint={theme.isDark ? "dark" : "light"}
                      style={styles.blurContainer}
                    >
                      <View style={styles.cardContent}>
                        {/* Orbe de color animado en el fondo */}
                        <View style={[
                          styles.colorOrb,
                          { backgroundColor: tenant.mainColor }
                        ]} />
                        
                        <View style={styles.logoContainer}>
                          <Image
                            source={{ uri: tenant.logoUrl }}
                            style={styles.logo}
                            contentFit="contain"
                          />
                        </View>
                        
                        <View style={styles.tenantInfo}>
                          <ThemedText type="defaultSemiBold" style={styles.tenantName}>
                            {tenant.name}
                          </ThemedText>
                          <View style={styles.metadataRow}>
                            <ThemedText style={styles.countryFlag}>
                              {tenant.countryFlag}
                            </ThemedText>
                            <View style={styles.separator} />
                            <ThemedText style={styles.currency}>
                              {tenant.currencyCode}
                            </ThemedText>
                          </View>
                        </View>
                        
                        {/* Indicador de color con blur */}
                        <View style={styles.colorIndicatorContainer}>
                          <View
                            style={[
                              styles.colorIndicator,
                              { backgroundColor: tenant.mainColor }
                            ]}
                          />
                        </View>
                      </View>
                    </BlurView>
                    
                    {/* Borde con gradiente sutil */}
                    <View
                      style={[
                        styles.cardBorder,
                        {
                          borderColor: theme.isDark
                            ? `${tenant.mainColor}60`
                            : `${tenant.mainColor}40`,
                        },
                      ]}
                    />
                  </Pressable>
                ))}
              </Animated.View>
            ))
          ) : (
            <Animated.View
              entering={FadeInDown.duration(600).delay(300).springify()}
              style={styles.emptyState}
            >
              <ThemedText style={styles.emptyStateIcon}>🔍</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.emptyStateTitle}>
                No se encontraron instituciones
              </ThemedText>
              <ThemedText style={styles.emptyStateText}>
                Intenta con otro término de búsqueda
              </ThemedText>
            </Animated.View>
          )}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  headerEmoji: {
    fontSize: 32,
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
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    borderRadius: 10,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  clearButtonText: {
    fontSize: 14,
    opacity: 0.6,
  },
  tenantsContainer: {
    gap: 20,
  },
  countryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 12,
    gap: 10,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    fontSize: 18,
    flex: 1,
  },
  countryBadge: {
    backgroundColor: "rgba(0, 122, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countryBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.7,
  },
  tenantCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: {
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    position: "relative",
  },
  colorOrb: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -30,
    top: -20,
    opacity: 0.15,
  },
  logoContainer: {
    width: 65,
    height: 65,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 17,
    marginBottom: 8,
    lineHeight: 22,
    fontWeight: "600",
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  separator: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    opacity: 0.6,
  },
  currency: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  colorIndicatorContainer: {
    marginLeft: 12,
  },
  colorIndicator: {
    width: 6,
    height: 50,
    borderRadius: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1.5,
    pointerEvents: "none",
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
