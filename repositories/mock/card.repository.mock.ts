/**
 * Mock Card Repository
 * 
 * Implementación del repositorio de tarjetas con datos mock.
 * Útil para desarrollo sin dependencia del backend.
 */

import { API_CONFIG } from '@/api/config';
import { ICardRepository } from '../interfaces';
import {
  Card,
  CardActionResult,
  BlockCardRequest,
  DeferRequest,
  DeferSimulation,
  CashAdvanceRequest,
  CardLimits,
  ChangePinRequest,
  Statement,
  TravelNotice,
  ReplaceCardRequest,
  Subscription,
  Rewards,
  DynamicCvv,
  NotificationSettings,
  Transaction,
  Account,
} from '../types';

// Helpers para generar datos aleatorios
const generateRandomBalance = () => Math.floor(Math.random() * 5000) + 500;
const generateRandomCreditLimit = () => Math.floor(Math.random() * 8000) + 2000;

// Simula delay de red
const delay = (ms: number = API_CONFIG.MOCK_DELAY) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Datos mock de tarjetas
const MOCK_CARDS: Card[] = [
  // VISA - Crédito
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
  // Mastercard - Débito
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
  // American Express - Virtual
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
  // Discover - Crédito
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

// Transacciones mock
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2025-11-18', description: 'Supermaxi', amount: 156.50, currency: '$', category: 'shopping', canDefer: true },
  { id: '2', date: '2025-11-17', description: 'Uber Trip', amount: 12.25, currency: '$', category: 'transport', canDefer: true },
  { id: '3', date: '2025-11-15', description: 'Netflix', amount: 14.99, currency: '$', category: 'entertainment', canDefer: false },
  { id: '4', date: '2025-11-14', description: 'Amazon', amount: 89.99, currency: '$', category: 'shopping', canDefer: true },
  { id: '5', date: '2025-11-12', description: 'Restaurante El Buen Sabor', amount: 45.00, currency: '$', category: 'food', canDefer: true },
];

// Cuentas mock
const MOCK_ACCOUNTS: Account[] = [
  { id: '1', type: 'savings', number: '****1234', alias: 'Cuenta de Ahorros', bankName: 'Banco Principal' },
  { id: '2', type: 'checking', number: '****5678', alias: 'Cuenta Corriente', bankName: 'Banco Principal' },
];

// Suscripciones mock
const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: '1', name: 'Netflix', plan: 'Premium', amount: 17.99, currency: 'USD', nextBilling: '2025-12-01', status: 'active', category: 'entertainment' },
  { id: '2', name: 'Spotify', plan: 'Family', amount: 14.99, currency: 'USD', nextBilling: '2025-12-05', status: 'active', category: 'entertainment' },
  { id: '3', name: 'Adobe CC', plan: 'All Apps', amount: 54.99, currency: 'USD', nextBilling: '2025-12-10', status: 'active', category: 'software' },
  { id: '4', name: 'Amazon Prime', plan: 'Anual', amount: 12.99, currency: 'USD', nextBilling: '2025-12-15', status: 'paused', category: 'shopping' },
];

export class MockCardRepository implements ICardRepository {
  
  async getCards(): Promise<Card[]> {
    await delay();
    return MOCK_CARDS;
  }

  async getCardById(id: string): Promise<Card | undefined> {
    await delay(300);
    return MOCK_CARDS.find(c => c.id === id);
  }

  async blockCard(request: BlockCardRequest): Promise<CardActionResult> {
    await delay(1000);
    return {
      success: true,
      message: request.type === 'temporary' 
        ? 'Tarjeta pausada temporalmente' 
        : 'Tarjeta bloqueada exitosamente',
    };
  }

  async unblockCard(_cardId: string): Promise<CardActionResult> {
    await delay(1000);
    return {
      success: true,
      message: 'Tarjeta desbloqueada exitosamente',
    };
  }

  async getDeferrableTransactions(_cardId: string): Promise<Transaction[]> {
    await delay();
    return MOCK_TRANSACTIONS.filter(t => t.canDefer);
  }

  async simulateDefer(_cardId: string, amount: number, months: number): Promise<DeferSimulation> {
    await delay(500);
    const interestRate = 0.0189; // 1.89% mensual
    const totalWithInterest = amount * (1 + interestRate * months);
    
    return {
      originalAmount: amount,
      months,
      interestRate: interestRate * 100,
      monthlyFee: totalWithInterest / months,
      totalWithInterest,
      firstPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  }

  async deferPayment(request: DeferRequest): Promise<CardActionResult> {
    await delay(1500);
    return {
      success: true,
      message: `Compra diferida a ${request.months} meses exitosamente`,
      data: {
        transactionIds: request.transactionIds,
      },
    };
  }

  async getAccounts(): Promise<Account[]> {
    await delay();
    return MOCK_ACCOUNTS;
  }

  async requestAdvance(request: CashAdvanceRequest): Promise<CardActionResult> {
    await delay(1200);
    
    if (request.amount > 500) {
      return {
        success: false,
        message: 'El monto excede tu límite de avance disponible',
      };
    }
    
    return {
      success: true,
      message: 'Avance aprobado exitosamente',
      data: {
        fee: (request.amount * 0.05).toFixed(2),
        total: (request.amount * 1.05).toFixed(2),
        transactionId: `ADV-${Math.floor(Math.random() * 10000)}`,
      },
    };
  }

  async getLimits(_cardId: string): Promise<CardLimits> {
    await delay(600);
    return {
      dailyAtm: 500,
      dailyPos: 2000,
      dailyOnline: 1500,
      monthlyTotal: 10000,
      perTransaction: 1000,
      creditLimit: 5000,
      availableCredit: 3200,
      cashAdvanceLimit: 1000,
      availableCashAdvance: 800,
    };
  }

  async updateLimits(_cardId: string, _limits: Partial<CardLimits>): Promise<CardActionResult> {
    await delay(1000);
    return {
      success: true,
      message: 'Límites actualizados exitosamente',
    };
  }

  async changePin(request: ChangePinRequest): Promise<CardActionResult> {
    await delay(1000);
    
    if (request.newPin.length !== 4) {
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

  async getStatement(_cardId: string, _month?: number, _year?: number): Promise<Statement> {
    await delay(800);
    
    // Generar transacciones mock para el estado de cuenta
    const transactions = Array.from({ length: 50 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        description: `Comercio Ejemplo ${i + 1}`,
        amount: Math.random() > 0.3 ? -(Math.random() * 100) : Math.random() * 200,
      };
    });
    
    const totalSpent = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      transactions,
      totalSpent,
      minPayment: totalSpent * 0.1,
      dueDate: '2025-12-05',
      periodStart: '2025-11-01',
      periodEnd: '2025-11-30',
    };
  }

  async createTravelNotice(notice: TravelNotice): Promise<CardActionResult> {
    await delay(1000);
    return {
      success: true,
      message: `Aviso de viaje a ${notice.destination} registrado exitosamente`,
      data: {
        receiptId: `TRV-${Math.floor(Math.random() * 10000)}`,
      },
    };
  }

  async requestReplacement(request: ReplaceCardRequest): Promise<CardActionResult> {
    await delay(1000);
    return {
      success: true,
      message: 'Tu nueva tarjeta será enviada a tu dirección registrada en 3-5 días hábiles.',
      data: {
        receiptId: `REP-${Math.floor(Math.random() * 10000)}`,
        reason: request.reason,
      },
    };
  }

  async getSubscriptions(_cardId: string): Promise<Subscription[]> {
    await delay();
    return MOCK_SUBSCRIPTIONS;
  }

  async toggleSubscription(_cardId: string, subscriptionId: string): Promise<CardActionResult> {
    await delay(800);
    const sub = MOCK_SUBSCRIPTIONS.find(s => s.id === subscriptionId);
    const newStatus = sub?.status === 'active' ? 'paused' : 'active';
    
    return {
      success: true,
      message: `Suscripción ${newStatus === 'active' ? 'reactivada' : 'pausada'} exitosamente`,
    };
  }

  async getRewards(_cardId: string): Promise<Rewards> {
    await delay();
    return {
      totalPoints: 12500,
      history: [
        { id: 1, description: 'Compra Supermaxi', points: 150, date: '20 Nov' },
        { id: 2, description: 'Uber Eats', points: 45, date: '19 Nov' },
        { id: 3, description: 'Netflix', points: 12, date: '15 Nov' },
        { id: 4, description: 'Bono Bienvenida', points: 5000, date: '01 Nov' },
      ],
    };
  }

  async generateDynamicCvv(_cardId: string): Promise<DynamicCvv> {
    await delay(500);
    return {
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      expiresIn: 300, // 5 minutos
    };
  }

  async updateNotifications(_cardId: string, settings: NotificationSettings): Promise<CardActionResult> {
    await delay(500);
    return {
      success: true,
      message: 'Configuración de notificaciones actualizada',
      data: settings,
    };
  }
}
