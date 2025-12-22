import { useAppTheme } from '@/ui/theming';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Check, ShieldCheck, Sparkles, Zap } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

const SLIDES = [
  {
    id: '1',
    title: 'Una Nueva Experiencia',
    description: 'Gestiona tus finanzas de manera inteligente y segura con nuestra plataforma de última generación.',
    icon: Sparkles,
  },
  {
    id: '2',
    title: 'Control Total',
    description: 'Monitorea tus tarjetas, movimientos y límites en tiempo real desde cualquier lugar.',
    icon: ShieldCheck,
  },
  {
    id: '3',
    title: 'Comienza Ahora',
    description: 'Configura tu cuenta en segundos y descubre todo lo que tenemos para ti.',
    icon: Zap,
  },
];

const PaginatorDot = ({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) => {
  const theme = useAppTheme();
  
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    
    const width = interpolate(
      scrollX.value,
      inputRange,
      [10, 20, 10],
      Extrapolation.CLAMP
    );
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );
    
    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: theme.tenant.mainColor },
        animatedStyle,
      ]}
    />
  );
};

const Paginator = ({ data, scrollX }: { data: typeof SLIDES; scrollX: SharedValue<number> }) => {
  return (
    <View style={styles.paginatorContainer}>
      {data.map((_, i) => (
        <PaginatorDot key={i.toString()} index={i} scrollX={scrollX} />
      ))}
    </View>
  );
};

const OnboardingItem = ({ item, index, scrollX }: { item: typeof SLIDES[0]; index: number; scrollX: SharedValue<number> }) => {
  const theme = useAppTheme();
  const Icon = item.icon;

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [100, 0, 100],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <View style={[styles.itemContainer, { width: SCREEN_WIDTH }]}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <LinearGradient
          colors={[theme.tenant.mainColor, theme.tenant.secondaryColor || '#4c669f']}
          style={styles.iconBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon size={64} color="#FFF" />
        </LinearGradient>
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    </View>
  );
};

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      // Usar setTimeout para web para asegurar que scrollToIndex funcione
      if (Platform.OS === 'web') {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: currentIndex + 1,
            animated: true,
          });
        }, 10);
      } else {
        flatListRef.current?.scrollToIndex({
          index: currentIndex + 1,
          animated: true,
        });
      }
    } else {
      onFinish();
    }
  };

  // getItemLayout es necesario para que scrollToIndex funcione en web
  const getItemLayout = (_: unknown, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ flex: 3, width: SCREEN_WIDTH }}>
        <Animated.FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={({ item, index }) => <OnboardingItem item={item} index={index} scrollX={scrollX} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={handleScroll}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          scrollEventThrottle={32}
          getItemLayout={getItemLayout}
        />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Paginator data={SLIDES} scrollX={scrollX} />
        
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.tenant.mainColor },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Comencemos' : 'Siguiente'}
          </Text>
          {currentIndex === SLIDES.length - 1 ? (
            <Check size={20} color="#FFF" style={{ marginLeft: 8 }} />
          ) : (
            <ArrowRight size={20} color="#FFF" style={{ marginLeft: 8 }} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  footer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  paginatorContainer: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
