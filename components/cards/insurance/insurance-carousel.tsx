import { ThemedText } from '@/components/themed-text';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { InsuranceCard } from './insurance-card';
import {
  generateInsurances,
  Insurance,
  InsuranceGenerator,
} from './insurance-generator';

interface InsuranceCarouselProps {
  onInsurancePress?: (insurance: Insurance) => void;
}

export function InsuranceCarousel({ onInsurancePress }: InsuranceCarouselProps) {
  // Generador de seguros
  const generator = useMemo(() => new InsuranceGenerator(20), []);
  
  // Estado inicial con primer batch
  const [insurances, setInsurances] = useState<Insurance[]>(() => 
    generateInsurances(20, 0)
  );
  
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Cargar más items al llegar al final
  const loadMore = useCallback(() => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Simular pequeño delay para efecto visual
    setTimeout(() => {
      const newBatch = generator.generateNext();
      setInsurances(prev => [...prev, ...newBatch]);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, generator]);

  // Renderizar cada card
  const renderItem: ListRenderItem<Insurance> = useCallback(
    ({ item, index }) => (
      <InsuranceCard
        insurance={item}
        index={index}
        onPress={() => onInsurancePress?.(item)}
      />
    ),
    [onInsurancePress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: Insurance) => item.id, []);

  // Separador entre items
  const ItemSeparator = useCallback(
    () => <View style={{ height: 0 }} />,
    []
  );

  const styles = StyleSheet.create({
    container: {
      marginTop: 24,
      marginBottom: 16,
    },
    header: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3,
      flex: 1,
    },
    secureBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: 'rgba(52, 199, 89, 0.1)',
    },
    secureBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#34C759',
    },
    subtitle: {
      fontSize: 13,
      opacity: 0.5,
      lineHeight: 18,
    },
    listContent: {
      paddingBottom: 20,
    },
    loadingFooter: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 12,
      opacity: 0.4,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header minimalista */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>Seguros</ThemedText>
          <View style={styles.secureBadge}>
            <ThemedText style={styles.secureBadgeText}>Disponibles</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.subtitle}>
          Protección diseñada para ti
        </ThemedText>
      </View>

      {/* Lista de seguros */}
      <FlatList
        data={insurances}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingFooter}>
              <ThemedText style={styles.loadingText}>Cargando más seguros...</ThemedText>
            </View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        scrollEnabled={false} // El scroll lo maneja el ScrollView padre
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={5}
      />
    </View>
  );
}
