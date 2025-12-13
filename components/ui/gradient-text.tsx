import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

interface GradientTextProps {
  text: string;
  colors?: string[];
  fontSize?: number;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

export const GradientText = ({
  text,
  colors = ['#10b981', '#0ea5e9'],
  fontSize = 24,
  width = 200,
  height = 40,
  style,
}: GradientTextProps) => {
  return (
    <View style={[{ width, height, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
            {colors.map((color, index) => (
              <Stop
                key={`gradient-stop-${color}-${index}`}
                offset={`${(index / (colors.length - 1)) * 100}%`}
                stopColor={color}
                stopOpacity="1"
              />
            ))}
          </LinearGradient>
        </Defs>
        <SvgText
          fill="url(#textGrad)"
          stroke="none"
          fontSize={fontSize}
          fontWeight="bold"
          x={width / 2}
          y={height / 2 + fontSize / 3}
          textAnchor="middle"
        >
          {text}
        </SvgText>
      </Svg>
    </View>
  );
};
