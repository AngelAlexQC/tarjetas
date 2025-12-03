/**
 * Test Utilities
 * 
 * Helpers para testing que simplifican el setup de providers y mocks.
 */

import { TenantThemeProvider } from '@/contexts/tenant-theme-context';
import { AuthProvider } from '@/contexts/auth-context';
import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import React, { ReactElement } from 'react';

/**
 * Wrapper con todos los providers necesarios para tests.
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <TenantThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </TenantThemeProvider>
  );
}

/**
 * Render customizado que incluye providers.
 * Usar en lugar de `render` de @testing-library/react-native.
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

// Re-exportar todo de testing-library
export * from '@testing-library/react-native';

// Sobrescribir render con nuestra versión
export { customRender as render };

/**
 * Crea un mock de Card para tests.
 */
export function createMockCard(overrides = {}) {
  return {
    id: '1',
    cardNumber: '•••• •••• •••• 1234',
    cardHolder: 'Test User',
    expiryDate: '12/27',
    balance: 1500.50,
    cardType: 'credit' as const,
    cardBrand: 'visa' as const,
    status: 'active' as const,
    creditLimit: 10000,
    availableCredit: 8500,
    ...overrides,
  };
}

/**
 * Crea un mock del repositorio de tarjetas.
 */
export function createMockCardRepository() {
  return {
    getCards: jest.fn().mockResolvedValue([createMockCard()]),
    getCardById: jest.fn().mockResolvedValue(createMockCard()),
    blockCard: jest.fn().mockResolvedValue({ success: true, message: 'Blocked' }),
    unblockCard: jest.fn().mockResolvedValue({ success: true, message: 'Unblocked' }),
    getLimits: jest.fn().mockResolvedValue({
      dailyPurchase: 5000,
      dailyAtm: 1000,
      monthlyPurchase: 50000,
      onlinePurchase: 10000,
      internationalPurchase: 5000,
    }),
    updateLimits: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
    changePin: jest.fn().mockResolvedValue({ success: true, message: 'PIN changed' }),
    getStatement: jest.fn().mockResolvedValue(null),
    getDeferrableTransactions: jest.fn().mockResolvedValue([]),
    simulateDefer: jest.fn().mockResolvedValue(null),
    deferPayment: jest.fn().mockResolvedValue({ success: true, message: 'Deferred' }),
    getAccounts: jest.fn().mockResolvedValue([]),
    requestAdvance: jest.fn().mockResolvedValue({ success: true, message: 'Requested' }),
    createTravelNotice: jest.fn().mockResolvedValue({ success: true, message: 'Created' }),
    requestReplacement: jest.fn().mockResolvedValue({ success: true, message: 'Requested' }),
    getSubscriptions: jest.fn().mockResolvedValue([]),
    toggleSubscription: jest.fn().mockResolvedValue({ success: true, message: 'Toggled' }),
    getRewards: jest.fn().mockResolvedValue(null),
    generateDynamicCvv: jest.fn().mockResolvedValue(null),
    updateNotifications: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
  };
}

/**
 * Helper para esperar a que pasen las promesas pendientes.
 */
export async function flushPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Helper para avanzar timers y flush promises.
 */
export async function advanceTimersAndFlush(ms = 0) {
  jest.advanceTimersByTime(ms);
  await flushPromises();
}
