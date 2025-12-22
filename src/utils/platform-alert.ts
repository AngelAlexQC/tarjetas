import { Alert, AlertButton, AlertOptions, Platform } from 'react-native';

/**
 * PlatformAlert
 * 
 * Unifica el manejo de alertas entre Native y Web.
 * - Native: Utiliza Alert.alert de React Native
 * - Web: Utiliza window.alert para mensajes simples y window.confirm para opciones SI/NO
 */
export const PlatformAlert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => {
    if (Platform.OS === 'web') {
      const fullMessage = message ? `${title}\n\n${message}` : title;

      // Caso 1: Alerta simple (sin botones o solo un botón OK/Cancel estilo info)
      if (!buttons || buttons.length === 0 || (buttons.length === 1 && buttons[0].text?.toLowerCase().match(/ok|entendido|aceptar|cancelar/))) {
        window.alert(fullMessage);
        // Si hay callback en ese único botón, ejecutarlo
        if (buttons?.[0]?.onPress) {
          buttons[0].onPress();
        }
        return;
      }

      // Caso 2: Confirmación (2 botones)
      // Asumimos que el último botón es la acción "positiva" o "confirmar" y el primero "cancelar"
      // o tratamos de inferir por el estilo/texto
      const confirmResult = window.confirm(fullMessage);

      if (confirmResult) {
        // En web "Aceptar" es true. Buscamos el botón positivo.
        // Generalmente el positivo es el último en arrays [Cancel, OK]
        // O buscamos uno que NO sea style: 'cancel'
        const positiveButton = buttons.find(b => b.style !== 'cancel') || buttons[buttons.length - 1];
        positiveButton?.onPress?.();
      } else {
        // "Cancelar" es false.
        const cancelButton = buttons.find(b => b.style === 'cancel') || buttons[0];
        cancelButton?.onPress?.();
      }
    } else {
      // Native: Pasamos directo a Alert.alert
      Alert.alert(title, message, buttons, options);
    }
  }
};
