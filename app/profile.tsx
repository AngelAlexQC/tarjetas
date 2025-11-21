import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedInput } from "@/components/ui/themed-input";
import { useAuth } from "@/contexts/auth-context";
import { useTenantTheme } from "@/contexts/tenant-theme-context";
import { useTour } from "@/contexts/tour-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabType = 'info' | 'version' | 'password';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const { logout } = useAuth();
  const { clearTenant } = useTenantTheme();
  const { resetTour } = useTour();

  // Mock user data
  const user = {
    name: "Sofía Durán",
    fullName: "Sofía Jaqueline Durán Arévalo",
    id: "0105168991",
    clientNumber: "34896777747433",
    email: "sofia1991@gmail.com",
    phone: "097 90 68 798",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  };

  const appVersion = {
    version: "1.0.0",
    build: "145",
    date: "21 de Noviembre, 2025"
  };

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión? Se borrarán los datos locales y la aplicación se reiniciará.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Cerrar sesión", 
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              await clearTenant();
              await resetTour();
              router.replace('/');
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              router.replace('/');
            }
          }
        }
      ]
    );
  };

  const handleTabPress = (tab: string) => {
    if (tab === 'faqs') {
      router.push('/faq');
    } else {
      setActiveTab(tab as TabType);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.sectionContainer}>
            <InfoCard 
              icon="person-outline" 
              label="Nombre completo" 
              value={user.fullName} 
            />
            <InfoCard 
              icon="card-outline" 
              label="Número de identificación" 
              value={user.id} 
            />
            <InfoCard 
              icon="wallet-outline" 
              label="Número de cliente" 
              value={user.clientNumber} 
            />
            <InfoCard 
              icon="mail-outline" 
              label="Correo electrónico" 
              value={user.email} 
            />
            <InfoCard 
              icon="call-outline" 
              label="Número de teléfono celular" 
              value={user.phone} 
            />
          </View>
        );
      case 'version':
        return (
          <View style={styles.sectionContainer}>
            <InfoCard 
              icon="information-circle-outline" 
              label="Versión de la App" 
              value={appVersion.version} 
            />
            <InfoCard 
              icon="build-outline" 
              label="Número de Build" 
              value={appVersion.build} 
            />
            <InfoCard 
              icon="calendar-outline" 
              label="Fecha de actualización" 
              value={appVersion.date} 
            />
          </View>
        );
      case 'password':
        return (
          <View style={styles.sectionContainer}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Actualizar Contraseña</ThemedText>
            
            <ThemedInput
              label="Contraseña actual"
              placeholder="Ingrese su contraseña actual"
              secureTextEntry
              icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />}
            />
            
            <ThemedInput
              label="Nueva contraseña"
              placeholder="Ingrese su nueva contraseña"
              secureTextEntry
              icon={<Ionicons name="key-outline" size={20} color={theme.colors.textSecondary} />}
            />
            
            <ThemedInput
              label="Confirmar nueva contraseña"
              placeholder="Confirme su nueva contraseña"
              secureTextEntry
              icon={<Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.textSecondary} />}
            />

            <ThemedButton 
              title="Actualizar Contraseña" 
              onPress={() => Alert.alert("Éxito", "Contraseña actualizada correctamente")}
              style={{ marginTop: 16 }}
            />
          </View>
        );
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          </View>
          <ThemedText type="title" style={styles.userName}>{user.name}</ThemedText>
          <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.colors.border }]}>
        <TabButton title="Información" isActive={activeTab === 'info'} onPress={() => handleTabPress('info')} />
        <TabButton title="Versión" isActive={activeTab === 'version'} onPress={() => handleTabPress('version')} />
        <TabButton title="Contraseña" isActive={activeTab === 'password'} onPress={() => handleTabPress('password')} />
        <TabButton title="FAQs" isActive={false} onPress={() => handleTabPress('faqs')} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </ThemedView>
  );
}

function InfoCard({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap, label: string, value: string }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}>
      <View style={[styles.iconBox, { backgroundColor: theme.colors.backgroundSecondary }]}>
        <Ionicons name={icon} size={22} color={theme.tenant.mainColor} />
      </View>
      <View style={styles.infoContent}>
        <ThemedText style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.infoValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

function TabButton({ title, isActive, onPress }: { title: string, isActive: boolean, onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabButton, isActive && styles.activeTabButton]}>
      <ThemedText style={[styles.tabText, isActive && styles.activeTabText]}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#00838F',
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#00838F',
  },
  tabText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#00838F',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  sectionContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  // Info Card Styles
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
  },
});

