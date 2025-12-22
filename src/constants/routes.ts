/**
 * Route Constants
 * 
 * Define all route strings here to avoid hardcoded values throughout the app.
 */
export const ROUTES = {
  // Auth & Onboarding
  INITIAL: '/',
  ONBOARDING_SURVEY: '/onboarding-survey',
  
  // Tabs (Main App)
  TABS: '/(tabs)',
  CARDS: '/(tabs)/cards',
  HOME: '/(tabs)/home',
  TRANSFERS: '/(tabs)/transfers',
  PAYMENTS: '/(tabs)/payments',
  MORE: '/(tabs)/more',

  // User
  PROFILE: '/profile',

  // Others
  FAQ: '/faq',
} as const;
