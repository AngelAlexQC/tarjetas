import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

interface DragonflyLogoProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

export const DragonflyLogo = ({ width = 120, height = 120, style, color }: DragonflyLogoProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" style={style}>
      <Defs>
        <LinearGradient id="dragonflyGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#10b981" stopOpacity="1" />
          <Stop offset="1" stopColor="#0ea5e9" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      
      <G>
        <Circle cx="65" cy="35" r="3" fill={color || "url(#dragonflyGrad)"} />
        
        <Path 
          d="M65 38 L60 45" 
          stroke={color || "url(#dragonflyGrad)"} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
        
        <Path 
          d="M60 45 L40 75" 
          stroke={color || "url(#dragonflyGrad)"} 
          strokeWidth="1.5" 
          strokeLinecap="round"
          strokeDasharray="5, 2" 
        />

        <G stroke={color || "url(#dragonflyGrad)"} strokeWidth="1.2" fill="none">
            <Path d="M62 40 C 50 25, 25 15, 20 25 C 18 30, 40 45, 62 40" />
            <Path d="M62 40 L 25 25" strokeWidth="0.5" opacity="0.8" />
            <Path d="M55 35 L 30 30" strokeWidth="0.5" opacity="0.6" />
            <Path d="M50 38 L 35 40" strokeWidth="0.5" opacity="0.6" />

            <Path d="M60 45 C 50 50, 30 60, 25 55 C 22 50, 45 45, 60 45" />
            <Path d="M60 45 L 30 55" strokeWidth="0.5" opacity="0.8" />
            <Path d="M50 48 L 35 52" strokeWidth="0.5" opacity="0.6" />
        </G>
      </G>
    </Svg>
  );
};
