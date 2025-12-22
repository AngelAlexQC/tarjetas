import {
    AmexLogo,
    DinersLogo,
    DiscoverLogo,
    GenericCardLogo,
    JcbLogo,
    MaestroLogo,
    MastercardLogo,
    UnionpayLogo,
    VisaLogo,
} from "react-native-payment-card-icons";

/**
 * Mapa de iconos de marcas de tarjetas
 * Usa los logos oficiales de react-native-payment-card-icons
 */
export const CardBrandIcons = {
  visa: VisaLogo,
  mastercard: MastercardLogo,
  amex: AmexLogo,
  discover: DiscoverLogo,
  diners: DinersLogo,
  jcb: JcbLogo,
  maestro: MaestroLogo,
  unionpay: UnionpayLogo,
  generic: GenericCardLogo,
};

export type CardBrandType = keyof typeof CardBrandIcons;
