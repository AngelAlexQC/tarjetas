import React, { useCallback, useState } from 'react';
import { EmailLoginScreen } from './email-login-screen';
import { ForgotPasswordScreen } from './forgot-password-screen';
import { LoginScreen } from './login-screen';
import { RegisterScreen } from './register-screen';

type AuthScreen = 'login' | 'register' | 'forgotPassword' | 'emailLogin';

interface AuthScreensContainerProps {
  onLoginSuccess: () => void;
  onRecoverUser?: () => void;
}

/**
 * Contenedor que maneja la navegación entre todas las pantallas de autenticación.
 * 
 * Pantallas disponibles:
 * - Login: Inicio de sesión con usuario y contraseña
 * - Register: Registro de nuevo usuario
 * - ForgotPassword: Recuperación de contraseña
 * - EmailLogin: Inicio de sesión alternativo con email
 */
export function AuthScreensContainer({ onLoginSuccess, onRecoverUser }: AuthScreensContainerProps) {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');

  const navigateToLogin = useCallback(() => setCurrentScreen('login'), []);
  const navigateToRegister = useCallback(() => setCurrentScreen('register'), []);
  const navigateToForgotPassword = useCallback(() => setCurrentScreen('forgotPassword'), []);
  const navigateToEmailLogin = useCallback(() => setCurrentScreen('emailLogin'), []);

  switch (currentScreen) {
    case 'login':
      return (
        <LoginScreen
          onLoginSuccess={onLoginSuccess}
          onForgotPassword={navigateToForgotPassword}
          onRegister={navigateToRegister}
          onEmailLogin={navigateToEmailLogin}
          onRecoverUser={onRecoverUser}
        />
      );
    case 'register':
      return (
        <RegisterScreen
          onBack={navigateToLogin}
          onSuccess={navigateToLogin}
        />
      );
    case 'forgotPassword':
      return (
        <ForgotPasswordScreen
          onBack={navigateToLogin}
          onSuccess={navigateToLogin}
        />
      );
    case 'emailLogin':
      return (
        <EmailLoginScreen
          onBack={navigateToLogin}
          onLoginSuccess={onLoginSuccess}
          onForgotPassword={navigateToForgotPassword}
        />
      );
    default:
      return null;
  }
}
