import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface ChipIconProps {
  width?: number;
  height?: number;
}

export const ChipIcon: React.FC<ChipIconProps> = ({ 
  width = 50, 
  height = 40 
}) => {
  return (
    <Svg 
      viewBox="0 0 200 160" 
      width={width} 
      height={height}
    >
      {/* Fondo del chip */}
      <Rect 
        x="0" 
        y="0" 
        width="200" 
        height="160" 
        fill="#d4af37" 
        rx="20" 
        ry="20" 
      />
      
      {/* Contactos del chip (patrón de líneas) */}
      <Path 
        d="M60,0 L100,30 L140,0 M100,30 V45 M70,45 H130 V115 H70 V45 M100,115 V130 M60,160 L100,130 L140,160 M130,45 L145,35 H200 M130,80 H200 M130,115 L145,125 H200 M70,45 L55,35 H0 M70,80 H0 M70,115 L60,125 H0" 
        fill="none" 
        stroke="#8B7023" 
        strokeWidth="3"
      />
    </Svg>
  );
};
