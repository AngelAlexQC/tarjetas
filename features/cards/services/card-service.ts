/**
 * Servicio centralizado para acciones de tarjetas
 */

import { CardActionType } from '@/constants/card-actions';

export interface Card {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  balance: number;
  cardType: 'credit' | 'debit' | 'virtual';
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners';
  status: 'active' | 'blocked' | 'expired' | 'pending';
  creditLimit?: number;
  availableCredit?: number;
}

export interface CardActionResult {
  success: boolean;
  message: string;
  data?: any;
}

// Simulación de llamadas a API
class CardService {
  // Bloquear tarjeta
  async blockCard(cardId: string): Promise<CardActionResult> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Tarjeta bloqueada exitosamente',
    };
  }

  // Desbloquear tarjeta
  async unblockCard(cardId: string): Promise<CardActionResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Tarjeta desbloqueada exitosamente',
    };
  }

  // Diferir compra
  async deferPayment(cardId: string, amount: number, months: number): Promise<CardActionResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: `Compra de $${amount} diferida a ${months} meses`,
      data: {
        monthlyPayment: (amount / months).toFixed(2),
        totalInterest: (amount * 0.02 * months).toFixed(2),
      },
    };
  }

  // Obtener estado de cuenta
  async getStatement(cardId: string, month?: number, year?: number): Promise<CardActionResult> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      message: 'Estado de cuenta generado',
      data: {
        transactions: [
          { date: '2025-11-15', description: 'Amazon', amount: -150.00 },
          { date: '2025-11-14', description: 'Supermercado', amount: -85.50 },
          { date: '2025-11-13', description: 'Gasolina', amount: -45.00 },
        ],
        totalSpent: 280.50,
        minPayment: 28.05,
        dueDate: '2025-12-05',
      },
    };
  }

  // Solicitar avance
  async requestAdvance(cardId: string, amount: number): Promise<CardActionResult> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    if (amount > 500) {
      return {
        success: false,
        message: 'El monto excede tu límite de avance disponible',
      };
    }
    
    return {
      success: true,
      message: `Avance de $${amount} aprobado`,
      data: {
        fee: (amount * 0.05).toFixed(2),
        total: (amount * 1.05).toFixed(2),
      },
    };
  }

  // Obtener cupos/límites
  async getLimits(cardId: string): Promise<CardActionResult> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      success: true,
      message: 'Información de cupos',
      data: {
        creditLimit: 5000,
        availableCredit: 3200,
        cashAdvanceLimit: 1000,
        availableCashAdvance: 800,
      },
    };
  }

  // Cambiar PIN
  async changePin(cardId: string, oldPin: string, newPin: string): Promise<CardActionResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (newPin.length !== 4) {
      return {
        success: false,
        message: 'El PIN debe tener 4 dígitos',
      };
    }
    
    return {
      success: true,
      message: 'PIN cambiado exitosamente',
    };
  }

  // Configurar notificaciones
  async updateNotifications(
    cardId: string,
    settings: {
      transactionAlerts?: boolean;
      paymentReminders?: boolean;
      securityAlerts?: boolean;
    }
  ): Promise<CardActionResult> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Configuración de notificaciones actualizada',
      data: settings,
    };
  }

  // Ejecutar acción genérica
  async executeAction(
    cardId: string,
    actionType: CardActionType,
    params?: any
  ): Promise<CardActionResult> {
    switch (actionType) {
      case 'block':
        return this.blockCard(cardId);
      case 'unblock':
        return this.unblockCard(cardId);
      case 'defer':
        return this.deferPayment(cardId, params?.amount, params?.months);
      case 'statement':
        return this.getStatement(cardId, params?.month, params?.year);
      case 'advances':
        return this.requestAdvance(cardId, params?.amount);
      case 'limits':
        return this.getLimits(cardId);
      case 'pin':
        return this.changePin(cardId, params?.oldPin, params?.newPin);
      case 'notifications':
        return this.updateNotifications(cardId, params?.settings);
      default:
        return {
          success: false,
          message: 'Acción no soportada',
        };
    }
  }
}

// Exportar instancia singleton
export const cardService = new CardService();
