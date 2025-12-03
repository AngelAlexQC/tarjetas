import { CreditCard } from "@/components/cards/credit-card";
import { ThemedText } from "@/components/themed-text";
import { Card } from "@/repositories";
import { RefObject } from "react";
import { FlatList, StyleSheet, View, ViewToken } from "react-native";

interface CardCarouselProps {
  cards: Card[];
  activeCardIndex: number;
  cardWidth: number;
  cardHeight: number;
  cardSpacing: number;
  screenWidth: number;
  flatListRef: RefObject<FlatList | null>;
  onCardPress: (index: number) => void;
  onViewableItemsChanged: (info: { viewableItems: ViewToken[] }) => void;
  viewabilityConfig: { itemVisiblePercentThreshold: number };
}

export function CardCarousel({
  cards,
  activeCardIndex,
  cardWidth,
  cardHeight,
  cardSpacing,
  screenWidth,
  flatListRef,
  onCardPress,
  onViewableItemsChanged,
  viewabilityConfig,
}: CardCarouselProps) {
  const styles = createStyles(cardWidth, cardHeight, cardSpacing, screenWidth);

  const renderCard = ({ item, index }: { item: Card; index: number }) => {
    const isActive = index === activeCardIndex;

    return (
      <View style={[styles.cardContainer, { width: cardWidth }]}>
        <CreditCard
          card={item}
          width={cardWidth}
          height={cardHeight}
          style={{ opacity: isActive ? 1 : 0.6 }}
          onPress={() => onCardPress(index)}
          isActive={isActive}
        />
      </View>
    );
  };

  if (cards.length === 0) {
    return (
      <View style={[styles.carouselContainer, { height: cardHeight + 30 }]}>
        <ThemedText style={styles.emptyText}>
          No hay tarjetas disponibles
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.carouselContainer, { height: cardHeight + 30 }]}>
      <FlatList
        ref={flatListRef}
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + cardSpacing}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.carouselList}
        getItemLayout={(_, index) => ({
          length: cardWidth + cardSpacing,
          offset: (cardWidth + cardSpacing) * index,
          index,
        })}
      />
    </View>
  );
}

const createStyles = (
  cardWidth: number,
  cardHeight: number,
  cardSpacing: number,
  screenWidth: number
) =>
  StyleSheet.create({
    carouselContainer: {
      marginBottom: 12,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      overflow: "hidden",
    },
    carouselContent: {
      paddingVertical: 15,
      paddingHorizontal: (screenWidth - cardWidth - cardSpacing) / 2,
      alignItems: "center",
    },
    carouselList: {
      width: screenWidth,
    },
    cardContainer: {
      height: cardHeight,
      justifyContent: "center",
      marginHorizontal: 10,
    },
    emptyText: {
      textAlign: "center",
      padding: 20,
    },
  });
