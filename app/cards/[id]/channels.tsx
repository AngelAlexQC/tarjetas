import { CreditCard } from '@/components/cards/credit-card';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PoweredBy } from '@/components/ui/powered-by';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCards } from '@/hooks/use-cards';
import type { Card } from '@/repositories';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChannelsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCardById } = useCards();
  const [card, setCard] = useState<Card | undefined>();
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (id) {
      getCardById(id).then((fetchedCard) => {
        setCard(fetchedCard);
        setIsLoadingCard(false);
      });
    }
  }, [id, getCardById]);

  const [channels, setChannels] = useState({
    online: true,
    international: false,
    atm: true,
    contactless: true,
  });

  const toggleSwitch = (key: keyof typeof channels) => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoadingCard) {
    return <LoadingScreen message="Cargando configuración..." />;
  }

  return (
    <ThemedView style={styles.container}>
      <CardOperationHeader
        title="Configuración de Canales"
        card={card}
        onBack={() => router.back()}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          {card && <CreditCard card={card} width={300} />}
        </View>

        <ThemedView style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          
          <View style={[styles.row, { borderBottomColor: theme.colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.textContainer}>
              <ThemedText type="defaultSemiBold">Compras en Línea</ThemedText>
              <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                Habilita compras por internet y aplicaciones
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: theme.tenant.mainColor }}
              thumbColor={'#f4f3f4'}
              onValueChange={() => toggleSwitch('online')}
              value={channels.online}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: theme.colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.textContainer}>
              <ThemedText type="defaultSemiBold">Compras Internacionales</ThemedText>
              <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                Uso fuera del país
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: theme.tenant.mainColor }}
              thumbColor={'#f4f3f4'}
              onValueChange={() => toggleSwitch('international')}
              value={channels.international}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: theme.colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.textContainer}>
              <ThemedText type="defaultSemiBold">Retiros en Cajero</ThemedText>
              <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                Disponibilidad de efectivo en ATMs
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: theme.tenant.mainColor }}
              thumbColor={'#f4f3f4'}
              onValueChange={() => toggleSwitch('atm')}
              value={channels.atm}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <ThemedText type="defaultSemiBold">Pagos Contactless</ThemedText>
              <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                Pagos sin contacto (NFC)
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: theme.tenant.mainColor }}
              thumbColor={'#f4f3f4'}
              onValueChange={() => toggleSwitch('contactless')}
              value={channels.contactless}
            />
          </View>

        </ThemedView>
        
        <ThemedText style={styles.infoText}>
          Los cambios se aplican inmediatamente. Puedes modificar estas configuraciones en cualquier momento.
        </ThemedText>
        <PoweredBy style={{ marginTop: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  infoText: {
    marginTop: 16,
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});
