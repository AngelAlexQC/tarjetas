import Svg, { Path, Rect, Circle } from "react-native-svg";

interface BrandIconProps {
  size?: number;
}

// Logo de Visa
export const VisaIcon = ({ size = 48 }: BrandIconProps) => (
  <Svg width={size} height={size * 0.6} viewBox="0 0 48 32" fill="none">
    <Rect width="48" height="32" rx="4" fill="white" />
    <Path
      d="M20.5 11L17 21H14.5L12.5 13.5C12.5 13.2 12.3 12.9 12 12.8C11.4 12.5 10.6 12.2 10 12V11.5H14.5C15.2 11.5 15.7 12 15.8 12.7L16.8 17.5L19.3 11.5H21.8L20.5 11Z"
      fill="#1A1F71"
    />
    <Path
      d="M28 21L30.5 11H33L30.5 21H28ZM23.5 11L21 21H18.5L21 11H23.5Z"
      fill="#1A1F71"
    />
    <Path
      d="M37 14C37 13.3 36.5 13 35.8 13C35.2 13 34.5 13.2 34 13.5L33.5 11.5C34.2 11.2 35 11 36 11C38.5 11 40 12.2 40 14.2C40 16.5 37 16.5 37 17.5C37 17.8 37.3 18 37.8 18C38.5 18 39.2 17.8 39.8 17.5L40.3 19.5C39.5 19.8 38.7 20 37.8 20C35.5 20 34 18.8 34 17C34 14.5 37 14.5 37 14Z"
      fill="#1A1F71"
    />
  </Svg>
);

// Logo de Mastercard
export const MastercardIcon = ({ size = 48 }: BrandIconProps) => (
  <Svg width={size} height={size * 0.6} viewBox="0 0 48 32" fill="none">
    <Rect width="48" height="32" rx="4" fill="white" />
    <Circle cx="18" cy="16" r="8" fill="#EB001B" />
    <Circle cx="30" cy="16" r="8" fill="#F79E1B" />
    <Path
      d="M24 9.5C22.2 11 21 13.4 21 16C21 18.6 22.2 21 24 22.5C25.8 21 27 18.6 27 16C27 13.4 25.8 11 24 9.5Z"
      fill="#FF5F00"
    />
  </Svg>
);

// Logo de American Express
export const AmexIcon = ({ size = 48 }: BrandIconProps) => (
  <Svg width={size} height={size * 0.6} viewBox="0 0 48 32" fill="none">
    <Rect width="48" height="32" rx="4" fill="#006FCF" />
    <Path
      d="M12 11H15L16.5 14L18 11H21V21H18.5V14.5L16.5 18H15.5L13.5 14.5V21H12V11Z"
      fill="white"
    />
    <Path
      d="M22 11H27V13H24V15H27V17H24V19H27V21H22V11Z"
      fill="white"
    />
    <Path
      d="M28 11H31.5L32.5 13.5L33.5 11H37L34.5 16L37 21H33.5L32.5 18.5L31.5 21H28L30.5 16L28 11Z"
      fill="white"
    />
  </Svg>
);

// Ícono genérico de tarjeta
export const GenericCardIcon = ({ size = 48 }: BrandIconProps) => (
  <Svg width={size} height={size * 0.6} viewBox="0 0 48 32" fill="none">
    <Rect width="48" height="32" rx="4" fill="#E0E0E0" />
    <Rect x="6" y="12" width="12" height="8" rx="2" fill="#BDBDBD" />
    <Rect x="22" y="14" width="20" height="2" rx="1" fill="#BDBDBD" />
    <Rect x="22" y="18" width="16" height="2" rx="1" fill="#BDBDBD" />
  </Svg>
);

export const CardBrandIcons = {
  visa: VisaIcon,
  mastercard: MastercardIcon,
  amex: AmexIcon,
  generic: GenericCardIcon,
};

export type CardBrandType = keyof typeof CardBrandIcons;
