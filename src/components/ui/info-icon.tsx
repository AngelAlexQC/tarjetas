/**
 * InfoIcon - Icono de información minimalista
 */

import { useAppTheme } from '@/ui/theming';
import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface InfoIconProps {
  size?: number;
  color?: string;
  opacity?: number;
}

export const InfoIcon: React.FC<InfoIconProps> = ({ 
  size = 16, 
  color,
  opacity = 0.5 
}) => {
  const theme = useAppTheme();
  const iconColor = color || theme.colors.textSecondary;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke={iconColor} 
        strokeWidth="1.5" 
        opacity={opacity}
      />
      <Path
        d="M12 16V12M12 8H12.01"
        stroke={iconColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
    </Svg>
  );
};
