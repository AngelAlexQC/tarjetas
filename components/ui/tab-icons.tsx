import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

interface TabIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

// Ícono de Home/Inicio
export const HomeIcon = ({ size = 24, color = "#000000", focused = false }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : "none"}
      fillOpacity={focused ? 0.2 : 0}
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Ícono de Tarjetas
export const CardsIcon = ({ size = 24, color = "#000000", focused = false }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="7"
      width="20"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : "none"}
      fillOpacity={focused ? 0.2 : 0}
    />
    <Line
      x1="2"
      y1="12"
      x2="22"
      y2="12"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
    />
    <Path
      d="M2 3H20C21.1046 3 22 3.89543 22 5V6H4V5C4 3.89543 3.1 3 2 3Z"
      stroke={color}
      strokeWidth={focused ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    />
  </Svg>
);

// Ícono de Transacciones/Actividad
export const TransactionsIcon = ({ size = 24, color = "#000000", focused = false }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3V21H21"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 16L11 12L15 15L21 8"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {focused && (
      <>
        <Circle cx="7" cy="16" r="1.5" fill={color} />
        <Circle cx="11" cy="12" r="1.5" fill={color} />
        <Circle cx="15" cy="15" r="1.5" fill={color} />
        <Circle cx="21" cy="8" r="1.5" fill={color} />
      </>
    )}
  </Svg>
);

// Ícono de Perfil/Usuario
export const ProfileIcon = ({ size = 24, color = "#000000", focused = false }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : "none"}
      fillOpacity={focused ? 0.2 : 0}
    />
    <Path
      d="M4 20C4 17.7909 5.79086 16 8 16H16C18.2091 16 20 17.7909 20 20V21H4V20Z"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : "none"}
      fillOpacity={focused ? 0.2 : 0}
    />
  </Svg>
);

// Ícono de Configuración
export const SettingsIcon = ({ size = 24, color = "#000000", focused = false }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : "none"}
      fillOpacity={focused ? 0.2 : 0}
    />
    <Path
      d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Ícono de Notificaciones
export const NotificationsIcon = ({ size = 24, color = "#000000", focused = false }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : "none"}
      fillOpacity={focused ? 0.2 : 0}
    />
    <Path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Ícono de Más/Menu
export const MoreIcon = ({ size = 24, color = "#000000", focused = false }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="2" fill={color} />
    <Circle cx="12" cy="12" r="2" fill={color} />
    <Circle cx="12" cy="19" r="2" fill={color} />
    {focused && (
      <>
        <Circle cx="12" cy="5" r="3" stroke={color} strokeWidth="1.5" fill="none" />
        <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
        <Circle cx="12" cy="19" r="3" stroke={color} strokeWidth="1.5" fill="none" />
      </>
    )}
  </Svg>
);

export const TabIcons = {
  home: HomeIcon,
  cards: CardsIcon,
  transactions: TransactionsIcon,
  profile: ProfileIcon,
  settings: SettingsIcon,
  notifications: NotificationsIcon,
  more: MoreIcon,
};

export type TabIconType = keyof typeof TabIcons;
