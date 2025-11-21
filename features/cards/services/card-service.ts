import { CardActionType } from '@/constants/card-actions';

export interface Card {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  balance: number;
  cardType: 'credit' | 'debit' | 'virtual';
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'maestro' | 'unionpay';
  status: 'active' | 'blocked' | 'expired' | 'pending';
  creditLimit?: number;
  availableCredit?: number;
  lastTransactionDate?: string;
}

export interface CardActionResult {
  success: boolean;
  message: string;
  data?: any;
}

// Mock Data Helpers
const generateRandomBalance = () => Math.floor(Math.random() * 5000) + 500;
const generateRandomCreditLimit = () => Math.floor(Math.random() * 8000) + 2000;

const MOCK_CARDS: Card[] = [
  // VISA - Crédito (todas las acciones)
  (() => {
    const creditLimit = generateRandomCreditLimit();
    const availableCredit = Math.floor(Math.random() * creditLimit * 0.8);
    return {
      id: "1",
      cardNumber: "•••• •••• •••• 9010",
      cardHolder: "Juan Pérez",
      expiryDate: "12/27",
      balance: creditLimit - availableCredit,
      cardType: "credit" as const,
      cardBrand: "visa" as const,
      status: "active" as const,
      creditLimit,
      availableCredit,
      lastTransactionDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    };
  })(),
  // Mastercard - Débito (sin diferir ni avances)
  {
    id: "2",
    cardNumber: "•••• •••• •••• 3456",
    cardHolder: "María García",
    expiryDate: "08/28",
    balance: generateRandomBalance(),
    cardType: "debit" as const,
    cardBrand: "mastercard" as const,
    status: "active" as const,
    lastTransactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // American Express - Virtual (sin PIN)
  (() => {
    const creditLimit = generateRandomCreditLimit();
    const availableCredit = Math.floor(Math.random() * creditLimit * 0.8);
    return {
      id: "3",
      cardNumber: "•••• •••••• •0005",
      cardHolder: "Ana Martínez",
      expiryDate: "06/29",
      balance: creditLimit - availableCredit,
      cardType: "virtual" as const,
      cardBrand: "amex" as const,
      status: "active" as const,
      creditLimit,
      availableCredit,
      lastTransactionDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    };
  })(),
  // Discover - Crédito (todas las acciones)
  (() => {
    const creditLimit = generateRandomCreditLimit();
    const availableCredit = Math.floor(Math.random() * creditLimit * 0.9);
    return {
      id: "4",
      cardNumber: "•••• •••• •••• 6789",
      cardHolder: "Carlos López",
      expiryDate: "03/26",
      balance: creditLimit - availableCredit,
      cardType: "credit" as const,
      cardBrand: "discover" as const,
      status: "active" as const,
      creditLimit,
      availableCredit,
      lastTransactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    };
  })(),
];

class CardService {
  getCards(): Card[] {
    return MOCK_CARDS;
  }

  getCardById(id: string): Card | undefined {
    return MOCK_CARDS.find(c => c.id === id);
  }

  async blockCard(cardId: string): Promise<CardActionResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Tarjeta bloqueada exitosamente',
    };
  }

  async unblockCard(cardId: string): Promise<CardActionResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Tarjeta desbloqueada exitosamente',
    };
  }

  async deferPayment(cardId: string, amount: number, months: number): Promise<CardActionResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: `Compra diferida a ${months} meses`,
      data: {
        monthlyPayment: (amount / months).toFixed(2),
        totalInterest: (amount * 0.02 * months).toFixed(2),
      },
    };
  }

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
      message: `Avance aprobado`,
      data: {
        fee: (amount * 0.05).toFixed(2),
        total: (amount * 1.05).toFixed(2),
      },
    };
  }

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

export const cardService = new CardService();
