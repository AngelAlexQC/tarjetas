import React, { useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming
} from 'react-native-reanimated';
import { 
  Home, 
  CreditCard,
  Settings,
  LucideIcon 
} from 'lucide-react-native';

interface TabIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

const AnimatedIcon = ({ 
  icon: Icon, 
  size = 24, 
  color = "#000000", 
  focused = false 
}: TabIconProps & { icon: LucideIcon }) => {
  const scale = useSharedValue(focused ? 1.2 : 1);
  const opacity = useSharedValue(focused ? 1 : 0.8);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1, {
      damping: 10,
      stiffness: 100,
    });
    opacity.value = withTiming(focused ? 1 : 0.8, {
      duration: 200,
    });
  }, [focused, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, { alignItems: 'center', justifyContent: 'center' }]}>
      <Icon 
        size={size} 
        color={color} 
        strokeWidth={focused ? 2.5 : 2}
      />
    </Animated.View>
  );
};

// Ícono de Home/Inicio
export const HomeIcon = (props: TabIconProps) => (
  <AnimatedIcon icon={Home} {...props} />
);

// Ícono de Tarjetas
export const CardsIcon = (props: TabIconProps) => (
  <AnimatedIcon icon={CreditCard} {...props} />
);

// Ícono de Configuración
export const SettingsIcon = (props: TabIconProps) => (
  <AnimatedIcon icon={Settings} {...props} />
);

