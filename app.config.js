module.exports = ({ config }) => {
  // Detectar si estamos en desarrollo local o en CI/producción
  const isProduction = process.env.EAS_BUILD === 'true' || process.env.CI === 'true';
  
  // Configuración dinámica desde variables de entorno
  const appName = process.env.APP_NAME || (isProduction ? 'Tarjetas' : 'Tarjetas Dev');
  const appSlug = process.env.APP_SLUG || (isProduction ? 'tarjetas' : 'tarjetas-dev');
  const bundleIdIOS = process.env.APP_BUNDLE_ID_IOS || (isProduction ? 'com.libelulasoft.tarjetas' : 'com.libelulasoft.tarjetas.dev');
  const bundleIdAndroid = process.env.APP_BUNDLE_ID_ANDROID || (isProduction ? 'com.libelulasoft.tarjetas' : 'com.libelulasoft.tarjetas.dev');
  const scheme = process.env.APP_SCHEME || (isProduction ? 'tarjetas' : 'tarjetas-dev');
  
  // Configuración para desarrollo local
  const devConfig = {
    name: appName,
    slug: appSlug,
    ios: {
      bundleIdentifier: bundleIdIOS,
    },
    android: {
      package: bundleIdAndroid,
    },
    scheme: scheme,
  };
  
  // Configuración para producción (usa las mismas variables)
  const prodConfig = devConfig;
  
  const envConfig = isProduction ? prodConfig : devConfig;
  
  return {
    expo: {
      name: envConfig.name,
      slug: envConfig.slug,
      version: '1.0.0',
      orientation: 'default',
      icon: './assets/images/icon.png',
      scheme: envConfig.scheme,
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      ios: {
        supportsTablet: true,
        infoPlist: {
          NSFaceIDUsageDescription: 'Esta aplicación utiliza Face ID para verificar tu identidad antes de realizar operaciones sensibles.',
          ITSAppUsesNonExemptEncryption: false,
        },
        bundleIdentifier: envConfig.ios.bundleIdentifier,
      },
      android: {
        adaptiveIcon: {
          backgroundColor: '#E6F4FE',
          foregroundImage: './assets/images/android-icon-foreground.png',
          backgroundImage: './assets/images/android-icon-background.png',
          monochromeImage: './assets/images/android-icon-monochrome.png',
        },
        permissions: [
          'android.permission.USE_BIOMETRIC',
          'android.permission.USE_FINGERPRINT',
          'android.permission.READ_CALENDAR',
          'android.permission.WRITE_CALENDAR',
        ],
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: envConfig.android.package,
      },
      web: {
        output: 'static',
        favicon: './assets/images/favicon.png',
        backgroundColor: '#171717',
      },
      splash: {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#171717',
      },
      plugins: [
        'expo-router',
        'expo-local-authentication',
        [
          'expo-calendar',
          {
            calendarPermission: 'The app needs to access your calendar to add payment reminders.',
          },
        ],
        [
          'expo-splash-screen',
          {
            image: './assets/images/splash-icon.png',
            imageWidth: 200,
            resizeMode: 'contain',
            backgroundColor: '#171717',
            dark: {
              backgroundColor: '#171717',
            },
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },
      extra: {
        router: {},
        eas: {
          projectId: '6dff682f-fc0a-45df-8a6d-969cd90f1fa1',
        },
        isProduction,
        tenantId: process.env.TENANT_ID || null,
      },
    },
  };
};
