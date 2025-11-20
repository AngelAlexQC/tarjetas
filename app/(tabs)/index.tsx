import { Image } from "expo-image";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

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
  {
    slug: "bpichincha",
    name: "Banco Pichincha",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/Banco_Pichincha_nuevo.png",
    mainColor: "#ffdf00",
    currencyCode: "USD",
    country: "Ecuador",
    countryFlag: "🇪🇨",
  },
  {
    slug: "coopchone",
    name: "Cooperativa de Ahorro y Crédito Chone",
    logoUrl:
      "https://coopchone.fin.ec/wp-content/uploads/2025/01/LogoHorizontal.png",
    mainColor: "#006837",
    currencyCode: "USD",
    country: "Ecuador",
    countryFlag: "🇪🇨",
  },
  {
    slug: "dinersclub-ec",
    name: "Diners Club",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a6/Diners_Club_Logo3.svg",
    mainColor: "#0079be",
    currencyCode: "USD",
    country: "Ecuador",
    countryFlag: "🇪🇨",
  },
  {
    slug: "bancolombia",
    name: "Bancolombia",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/dc/Bancolombia_S.A._logo.svg",
    mainColor: "#FFEB00",
    currencyCode: "COP",
    country: "Colombia",
    countryFlag: "🇨🇴",
  },
  {
    slug: "davivienda-co",
    name: "Davivienda",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Davivienda_Logo.png",
    mainColor: "#D22C21",
    currencyCode: "COP",
    country: "Colombia",
    countryFlag: "🇨🇴",
  },
  {
    slug: "bbva-mx",
    name: "BBVA Mexico",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/98/BBVA_logo_2025.svg",
    mainColor: "#0f1f7a",
    currencyCode: "MXN",
    country: "México",
    countryFlag: "🇲🇽",
  },
];

export default function TenantSelectorScreen() {
  const colorScheme = useColorScheme();

  const handleTenantSelect = (tenant: Tenant) => {
    console.log("Institución seleccionada:", tenant.name);
    // Aquí puedes navegar a otra pantalla o guardar la selección
    // Por ejemplo: router.push(`/auth?tenant=${tenant.slug}`);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Selecciona tu Institución
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Elige tu entidad financiera para continuar
          </ThemedText>
        </ThemedView>

        <View style={styles.tenantsContainer}>
          {tenants.map((tenant) => (
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
                tint={colorScheme === "dark" ? "dark" : "light"}
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
                    borderColor: colorScheme === "dark"
                      ? `${tenant.mainColor}60`
                      : `${tenant.mainColor}40`,
                  },
                ]}
              />
            </Pressable>
          ))}
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
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  tenantsContainer: {
    gap: 16,
  },
  tenantCard: {
    borderRadius: 20,
    overflow: "hidden",
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
  countryFlag: {
    fontSize: 18,
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
});
