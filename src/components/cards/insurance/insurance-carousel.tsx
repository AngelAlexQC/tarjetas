import { ThemedText } from '@/ui/primitives/themed-text';
import { useResponsiveLayout } from '@/ui/theming/use-responsive-layout';
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
  const layout = useResponsiveLayout();
  
  // Generador de seguros
  const generator = useMemo(() => new InsuranceGenerator(20), []);
  
  // Estado inicial con primer batch
  const [insurances, setInsurances] = useState<Insurance[]>(() => 
    generateInsurances(15, 0)
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

  // Ancho de la tarjeta para horizontal
  const CARD_WIDTH = Math.min(layout.screenWidth * 0.85, 320);

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
      paddingLeft: 16,
      paddingRight: 8,
    },
    loadingFooter: {
      width: 100,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
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

      {/* Carrusel horizontal de seguros */}
      <FlatList
        horizontal
        data={insurances}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingFooter}>
              <ThemedText style={styles.loadingText}>...</ThemedText>
            </View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 8}
        decelerationRate="fast"
        pagingEnabled={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        initialNumToRender={3}
        windowSize={5}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH + 8,
          offset: (CARD_WIDTH + 8) * index,
          index,
        })}
      />
    </View>
  );
}
