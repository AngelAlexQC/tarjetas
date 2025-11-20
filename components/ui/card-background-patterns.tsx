import type { CardBrand } from '@/constants/card-types';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

interface CardPatternProps {
  brand: CardBrand;
  width: number;
  height: number;
}

// Patrón para Visa: Ondas suaves y minimalistas con sombras sutiles
const VisaPattern = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width} height={height} style={{ position: 'absolute' }}>
    <Defs>
      <RadialGradient id="visaGlow" cx="70%" cy="30%" r="60%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.04)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </RadialGradient>
      <LinearGradient id="visaLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0)" />
        <Stop offset="50%" stopColor="rgba(0,0,0,0.06)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </LinearGradient>
      <Pattern id="visaPattern" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
        <Path d="M0,70 Q35,55 70,70 T140,70" stroke="url(#visaLine)" strokeWidth="1.5" fill="none" />
        <Path d="M0,90 Q35,75 70,90 T140,90" stroke="rgba(0,0,0,0.04)" strokeWidth="1" fill="none" />
        <Path d="M0,50 Q35,35 70,50 T140,50" stroke="rgba(0,0,0,0.03)" strokeWidth="0.8" fill="none" />
        <Circle cx="100" cy="40" r="50" fill="url(#visaGlow)" />
        <Circle cx="30" cy="100" r="30" fill="url(#visaGlow)" opacity="0.5" />
      </Pattern>
    </Defs>
    <Rect width={width} height={height} fill="url(#visaPattern)" />
  </Svg>
);

// Patrón para Mastercard: Círculos entrelazados sutiles con profundidad
const MastercardPattern = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width} height={height} style={{ position: 'absolute' }}>
    <Defs>
      <RadialGradient id="mcGlow1" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.05)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </RadialGradient>
      <RadialGradient id="mcGlow2" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.04)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </RadialGradient>
      <Pattern id="mastercardPattern" x="0" y="0" width="130" height="130" patternUnits="userSpaceOnUse">
        <Circle cx="45" cy="45" r="40" fill="url(#mcGlow1)" />
        <Circle cx="85" cy="45" r="40" fill="url(#mcGlow2)" />
        <Circle cx="65" cy="75" r="35" fill="rgba(0,0,0,0.03)" />
        <Circle cx="30" cy="90" r="20" fill="url(#mcGlow2)" opacity="0.5" />
        <Circle cx="100" cy="90" r="18" fill="rgba(0,0,0,0.035)" opacity="0.5" />
      </Pattern>
    </Defs>
    <Rect width={width} height={height} fill="url(#mastercardPattern)" />
  </Svg>
);

// Patrón para American Express: Líneas diagonales minimalistas premium
const AmexPattern = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width} height={height} style={{ position: 'absolute' }}>
    <Defs>
      <LinearGradient id="amexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.06)" />
        <Stop offset="50%" stopColor="rgba(0,0,0,0.025)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
      </LinearGradient>
      <Pattern id="amexPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <Line x1="0" y1="20" x2="100" y2="20" stroke="url(#amexGradient)" strokeWidth="1.5" />
        <Line x1="0" y1="35" x2="100" y2="35" stroke="rgba(0,0,0,0.04)" strokeWidth="0.8" />
        <Line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,0,0,0.03)" strokeWidth="0.8" />
        <Line x1="0" y1="65" x2="100" y2="65" stroke="url(#amexGradient)" strokeWidth="1" />
        <Line x1="0" y1="80" x2="100" y2="80" stroke="rgba(0,0,0,0.025)" strokeWidth="0.6" />
        <Rect x="35" y="0" width="12" height="100" fill="rgba(0,0,0,0.03)" />
      </Pattern>
    </Defs>
    <Rect width={width} height={height} fill="url(#amexPattern)" />
  </Svg>
);

// Patrón para Discover: Estrellas sutiles con profundidad
const DiscoverPattern = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width} height={height} style={{ position: 'absolute' }}>
    <Defs>
      <RadialGradient id="discoverStar" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.07)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </RadialGradient>
      <Pattern id="discoverPattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
        <Circle cx="25" cy="25" r="3" fill="url(#discoverStar)" />
        <Circle cx="70" cy="40" r="2.5" fill="rgba(0,0,0,0.06)" />
        <Circle cx="50" cy="70" r="3" fill="url(#discoverStar)" opacity="0.6" />
        <Circle cx="90" cy="85" r="2" fill="rgba(0,0,0,0.05)" />
        <Circle cx="35" cy="95" r="2" fill="rgba(0,0,0,0.055)" />
        <Circle cx="95" cy="20" r="1.5" fill="rgba(0,0,0,0.05)" />
        <Circle cx="15" cy="60" r="1.5" fill="rgba(0,0,0,0.045)" />
        <Path d="M25,25 L23,20 L25,15 L27,20 Z" fill="rgba(0,0,0,0.04)" />
        <Path d="M70,40 L68,36 L70,32 L72,36 Z" fill="rgba(0,0,0,0.035)" />
      </Pattern>
    </Defs>
    <Rect width={width} height={height} fill="url(#discoverPattern)" />
  </Svg>
);

// Patrón para Diners Club: Glass morphism con mosaico cristalino
const DinersPattern = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width} height={height} style={{ position: 'absolute' }}>
    <Defs>
      <LinearGradient id="dinersGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.06)" />
        <Stop offset="50%" stopColor="rgba(0,0,0,0.02)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
      </LinearGradient>
      <Pattern id="dinersPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <Rect x="0" y="0" width="100" height="100" fill="rgba(0,0,0,0.01)" />
        <Rect x="15" y="15" width="70" height="70" fill="none" stroke="url(#dinersGradient)" strokeWidth="1.5" />
        <Rect x="25" y="25" width="50" height="50" fill="rgba(0,0,0,0.03)" />
        <Rect x="35" y="35" width="30" height="30" fill="rgba(0,0,0,0.04)" />
        <Rect x="45" y="45" width="10" height="10" fill="rgba(0,0,0,0.06)" />
        <Path d="M50,15 L50,35" stroke="rgba(0,0,0,0.035)" strokeWidth="1" />
        <Path d="M50,65 L50,85" stroke="rgba(0,0,0,0.035)" strokeWidth="1" />
        <Path d="M15,50 L35,50" stroke="rgba(0,0,0,0.035)" strokeWidth="1" />
        <Path d="M65,50 L85,50" stroke="rgba(0,0,0,0.035)" strokeWidth="1" />
        <Circle cx="25" cy="25" r="3" fill="rgba(0,0,0,0.05)" />
        <Circle cx="75" cy="25" r="3" fill="rgba(0,0,0,0.05)" />
        <Circle cx="25" cy="75" r="3" fill="rgba(0,0,0,0.05)" />
        <Circle cx="75" cy="75" r="3" fill="rgba(0,0,0,0.05)" />
      </Pattern>
    </Defs>
    <Rect width={width} height={height} fill="url(#dinersPattern)" />
  </Svg>
);

// Patrón para JCB: Hexágonos futuristas con glow effect
const JcbPattern = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width} height={height} style={{ position: 'absolute' }}>
    <Defs>
      <RadialGradient id="jcbGlow" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.07)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0.01)" />
      </RadialGradient>
      <LinearGradient id="jcbLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.025)" />
        <Stop offset="50%" stopColor="rgba(0,0,0,0.06)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0.025)" />
      </LinearGradient>
      <Pattern id="jcbPattern" x="0" y="0" width="110" height="110" patternUnits="userSpaceOnUse">
        <Rect x="0" y="0" width="110" height="110" fill="rgba(0,0,0,0.008)" />
        <Path d="M55,8 L82,26 L82,62 L55,80 L28,62 L28,26 Z" fill="none" stroke="url(#jcbLine)" strokeWidth="2" />
        <Path d="M55,18 L73,32 L73,58 L55,72 L37,58 L37,32 Z" fill="url(#jcbGlow)" />
        <Path d="M55,28 L64,36 L64,54 L55,62 L46,54 L46,36 Z" fill="rgba(0,0,0,0.04)" />
        <Circle cx="55" cy="45" r="7" fill="rgba(0,0,0,0.06)" />
        <Path d="M55,26 L55,36" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        <Path d="M55,54 L55,64" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        <Path d="M46,45 L64,45" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        <Circle cx="28" cy="26" r="2" fill="rgba(0,0,0,0.04)" />
        <Circle cx="82" cy="26" r="2" fill="rgba(0,0,0,0.04)" />
        <Circle cx="28" cy="62" r="2" fill="rgba(0,0,0,0.04)" />
        <Circle cx="82" cy="62" r="2" fill="rgba(0,0,0,0.04)" />
      </Pattern>
    </Defs>
    <Rect width={width} height={height} fill="url(#jcbPattern)" />
  </Svg>
);

// Patrón para Maestro: Ondas acústicas con efecto sonar
const MaestroPattern = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width} height={height} style={{ position: 'absolute' }}>
    <Defs>
      <RadialGradient id="maestroCenter" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.07)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </RadialGradient>
      <RadialGradient id="maestroRing" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0)" />
        <Stop offset="80%" stopColor="rgba(0,0,0,0.05)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </RadialGradient>
      <Pattern id="maestroPattern" x="0" y="0" width="130" height="130" patternUnits="userSpaceOnUse">
        <Rect x="0" y="0" width="130" height="130" fill="rgba(0,0,0,0.005)" />
        <Circle cx="65" cy="65" r="18" fill="url(#maestroCenter)" />
        <Circle cx="65" cy="65" r="30" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="2" />
        <Circle cx="65" cy="65" r="45" fill="url(#maestroRing)" />
        <Circle cx="65" cy="65" r="48" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="1.5" />
        <Circle cx="65" cy="65" r="62" fill="none" stroke="rgba(0,0,0,0.025)" strokeWidth="1" />
        <Path d="M65,5 L65,28" stroke="rgba(0,0,0,0.04)" strokeWidth="2" />
        <Path d="M65,102 L65,125" stroke="rgba(0,0,0,0.04)" strokeWidth="2" />
        <Path d="M5,65 L28,65" stroke="rgba(0,0,0,0.04)" strokeWidth="2" />
        <Path d="M102,65 L125,65" stroke="rgba(0,0,0,0.04)" strokeWidth="2" />
        <Path d="M20,20 L35,35" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
        <Path d="M110,20 L95,35" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
        <Path d="M20,110 L35,95" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
        <Path d="M110,110 L95,95" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
      </Pattern>
    </Defs>
    <Rect width={width} height={height} fill="url(#maestroPattern)" />
  </Svg>
);

// Patrón para UnionPay: Circuito digital con nodos brillantes
const UnionpayPattern = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width} height={height} style={{ position: 'absolute' }}>
    <Defs>
      <RadialGradient id="unionNode" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.09)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0.025)" />
      </RadialGradient>
      <LinearGradient id="unionLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.03)" />
        <Stop offset="50%" stopColor="rgba(0,0,0,0.05)" />
        <Stop offset="100%" stopColor="rgba(0,0,0,0.03)" />
      </LinearGradient>
      <Pattern id="unionpayPattern" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
        <Rect x="0" y="0" width="90" height="90" fill="rgba(0,0,0,0.01)" />
        <Line x1="0" y1="0" x2="90" y2="0" stroke="url(#unionLine)" strokeWidth="1" />
        <Line x1="0" y1="45" x2="90" y2="45" stroke="rgba(0,0,0,0.04)" strokeWidth="0.8" />
        <Line x1="0" y1="90" x2="90" y2="90" stroke="url(#unionLine)" strokeWidth="1" />
        <Line x1="0" y1="0" x2="0" y2="90" stroke="url(#unionLine)" strokeWidth="1" />
        <Line x1="45" y1="0" x2="45" y2="90" stroke="rgba(0,0,0,0.04)" strokeWidth="0.8" />
        <Line x1="90" y1="0" x2="90" y2="90" stroke="url(#unionLine)" strokeWidth="1" />
        <Rect x="18" y="18" width="24" height="24" fill="rgba(0,0,0,0.035)" />
        <Rect x="48" y="48" width="24" height="24" fill="rgba(0,0,0,0.025)" />
        <Circle cx="45" cy="0" r="4" fill="url(#unionNode)" />
        <Circle cx="0" cy="45" r="4" fill="url(#unionNode)" />
        <Circle cx="90" cy="45" r="4" fill="url(#unionNode)" />
        <Circle cx="45" cy="90" r="4" fill="url(#unionNode)" />
        <Circle cx="45" cy="45" r="5" fill="rgba(0,0,0,0.07)" />
        <Path d="M30,30 L60,60" stroke="rgba(0,0,0,0.025)" strokeWidth="0.8" strokeDasharray="2,2" />
        <Path d="M60,30 L30,60" stroke="rgba(0,0,0,0.025)" strokeWidth="0.8" strokeDasharray="2,2" />
      </Pattern>
    </Defs>
    <Rect width={width} height={height} fill="url(#unionpayPattern)" />
  </Svg>
);

const styles = StyleSheet.create({
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4, // Opacidad global para integración profesional
  },
});

export const CardBackgroundPattern: React.FC<CardPatternProps> = ({ brand, width, height }) => {
  const patterns: Record<CardBrand, React.ComponentType<{ width: number; height: number }>> = {
    visa: VisaPattern,
    mastercard: MastercardPattern,
    amex: AmexPattern,
    discover: DiscoverPattern,
    diners: DinersPattern,
    jcb: JcbPattern,
    maestro: MaestroPattern,
    unionpay: UnionpayPattern,
  };

  const PatternComponent = patterns[brand];
  
  return PatternComponent ? (
    <View style={styles.patternContainer}>
      <PatternComponent width={width} height={height} />
    </View>
  ) : null;
};
