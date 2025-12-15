# SSL Pinning - Guía de Implementación

## 📋 Resumen

**Estado Actual:** ⚠️ Configuración preparada, implementación nativa pendiente  
**Prioridad:** 🔴 CRÍTICO para aplicaciones financieras  
**Riesgo OWASP:** M5 - Insecure Communication

---

## 🎯 ¿Qué es SSL Pinning?

SSL/Certificate Pinning es una técnica de seguridad que previene ataques Man-in-the-Middle (MitM) validando que el certificado del servidor coincide exactamente con un certificado conocido y confiable que está "pinneado" (hardcoded) en la aplicación.

**Sin SSL Pinning:**
```
App → Atacante con certificado falso → Servidor Real
     ❌ App confía en cualquier certificado válido
```

**Con SSL Pinning:**
```
App → Atacante con certificado falso → ❌ RECHAZADO
App → Servidor Real con certificado pinneado → ✅ ACEPTADO
```

---

## ⚠️ Limitación Importante: Expo Managed Workflow

**Expo Managed NO soporta SSL Pinning nativo por defecto.**

El `fetch()` de React Native y las APIs de red de Expo no pueden validar certificados a nivel nativo sin acceso al código nativo.

### Soluciones Disponibles:

| Solución | Dificultad | Mantenimiento | Recomendación |
|----------|-----------|---------------|---------------|
| **Development Build** | Media | Bajo | ⭐⭐⭐⭐⭐ RECOMENDADO |
| Bare Workflow | Alta | Medio | ⭐⭐⭐ Si necesitas control total |
| Proxy Backend | Media | Medio | ⭐⭐⭐ Alternativa válida |
| No implementar | Ninguna | Ninguno | ❌ INSEGURO para apps financieras |

---

## ✅ Solución Recomendada: Development Build + Config Plugins

### Paso 1: Instalar expo-dev-client

```bash
npx expo install expo-dev-client
```

### Paso 2: Obtener los Certificate Pins

#### 2.1 Descargar el certificado de tu servidor

```bash
# Conectar y obtener certificados
openssl s_client -connect api.tudominio.com:443 -showcerts < /dev/null 2>/dev/null | openssl x509 -outform PEM > server_cert.pem
```

#### 2.2 Extraer el Public Key

```bash
openssl x509 -in server_cert.pem -pubkey -noout > public_key.pem
```

#### 2.3 Generar el SHA-256 Pin (Base64)

```bash
openssl pkey -pubin -in public_key.pem -outform der | \
  openssl dgst -sha256 -binary | \
  openssl enc -base64
```

**Resultado:** `sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=`

#### 2.4 Actualizar el archivo de configuración

Edita `api/ssl-pinning.config.ts`:

```typescript
export const SSL_PINNING_CONFIG: CertificatePin[] = [
  {
    hostname: 'api.tudominio.com',
    pins: [
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Pin actual
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Pin de backup
    ],
    type: 'public-key',
    includeSubdomains: true,
    expirationDate: '2026-12-31T23:59:59Z', // Fecha del certificado
  },
];
```

### Paso 3: Configuración Android (Network Security Config)

#### 3.1 Crear `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Configuración de producción -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.tudominio.com</domain>
        <pin-set expiration="2026-12-31">
            <!-- Pin principal -->
            <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
            <!-- Pin de backup (importante para rotación) -->
            <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>
        </pin-set>
    </domain-config>

    <!-- Debug/desarrollo: permitir certificados del sistema -->
    <debug-overrides>
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </debug-overrides>
</network-security-config>
```

#### 3.2 Referenciar en AndroidManifest.xml

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

### Paso 4: Configuración iOS (App Transport Security)

#### 4.1 Configurar Info.plist

Crear/editar `ios/[ProjectName]/Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <!-- Bloquear conexiones HTTP por defecto -->
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    
    <!-- Configurar dominio específico con pinning -->
    <key>NSPinnedDomains</key>
    <dict>
        <key>api.tudominio.com</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSPinnedLeafIdentities</key>
            <array>
                <dict>
                    <key>SPKI-SHA256-BASE64</key>
                    <string>AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</string>
                </dict>
                <!-- Pin de backup -->
                <dict>
                    <key>SPKI-SHA256-BASE64</key>
                    <string>BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</string>
                </dict>
            </array>
        </dict>
    </dict>
</dict>
```

### Paso 5: Actualizar app.json con plugins

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "networkSecurityConfig": "./android/app/src/main/res/xml/network_security_config.xml"
          },
          "ios": {
            "infoPlist": {
              "NSAppTransportSecurity": {
                "NSAllowsArbitraryLoads": false,
                "NSPinnedDomains": {
                  "api.tudominio.com": {
                    "NSIncludesSubdomains": true,
                    "NSPinnedLeafIdentities": [
                      {
                        "SPKI-SHA256-BASE64": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
                      },
                      {
                        "SPKI-SHA256-BASE64": "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      ]
    ]
  }
}
```

### Paso 6: Rebuild

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

## 🧪 Testing

### 1. Test con Certificado Válido

```bash
curl -X GET https://api.tudominio.com/health
# Debe funcionar normalmente
```

### 2. Test con Proxy MitM (debe FALLAR)

```bash
# Configurar proxy como mitmproxy o Charles
# La app debe rechazar la conexión
```

### 3. Test con Certificado Expirado

```bash
# Usar openssl para simular certificado expirado
# La app debe rechazar la conexión
```

---

## 🔄 Rotación de Certificados

**IMPORTANTE:** Planificar rotación ANTES de que expire el certificado.

### Proceso de Rotación:

1. **30 días antes de expiración:**
   - Obtener el pin del nuevo certificado
   - Agregar como segundo pin en la configuración
   - Liberar nueva versión de la app con AMBOS pins

2. **En la fecha de renovación:**
   - Instalar nuevo certificado en el servidor
   - La app valida contra cualquiera de los 2 pins ✅

3. **Después de que >90% usuarios actualicen:**
   - Remover el pin antiguo
   - Liberar nueva versión solo con el pin nuevo

### Ejemplo de Configuración con Doble Pin:

```typescript
{
  hostname: 'api.tudominio.com',
  pins: [
    'OLD_CERT_PIN=', // Certificado actual (expira 2026-01-01)
    'NEW_CERT_PIN=', // Certificado nuevo (expira 2027-01-01)
  ],
  // ...
}
```

---

## 📊 Monitoreo

### Script de Verificación de Expiración

```typescript
import { checkCertificateExpiration } from '@/api/ssl-pinning.config';

// En App.tsx o similar
useEffect(() => {
  const expirations = checkCertificateExpiration();
  
  expirations.forEach(({ hostname, daysUntilExpiration, expired }) => {
    if (expired) {
      console.error(`🚨 Certificate EXPIRED for ${hostname}`);
      // Alertar a DevOps
    } else if (daysUntilExpiration < 30) {
      console.warn(`⚠️ Certificate expires in ${daysUntilExpiration} days for ${hostname}`);
      // Notificar equipo
    }
  });
}, []);
```

---

## 🐛 Debugging

### Verificar que el pinning está activo

```typescript
import { sslPinningManager } from '@/api/ssl-pinning';

// En desarrollo
const stats = sslPinningManager.getStats();
console.log('SSL Pinning Stats:', stats);

const config = sslPinningManager.exportConfig();
console.log('SSL Pinning Config:', config);
```

### Logs de Android

```bash
adb logcat | grep -i "network\|ssl\|certificate"
```

### Logs de iOS

```bash
# En Xcode, ver Console
# Filtrar por "network" o "ssl"
```

---

## ⚠️ Advertencias Importantes

1. **NO hardcodear certificados completos** (usar pins de public key)
2. **SIEMPRE tener pin de backup** para rotación
3. **Monitorear fechas de expiración** (automatizar alertas)
4. **Probar MitM antes de producción** (usar Charles Proxy o mitmproxy)
5. **Documentar proceso de rotación** para el equipo
6. **Plan de emergencia** si la app no puede conectar después de rotación

---

## 🔗 Referencias

- [OWASP Certificate Pinning](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning)
- [Android Network Security Config](https://developer.android.com/training/articles/security-config)
- [iOS App Transport Security](https://developer.apple.com/documentation/security/preventing_insecure_network_connections)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)

---

## 📝 Checklist Pre-Producción

- [ ] Obtener pins SHA-256 de certificados de producción
- [ ] Actualizar `ssl-pinning.config.ts` con pins reales
- [ ] Configurar `network_security_config.xml` (Android)
- [ ] Configurar Info.plist (iOS)
- [ ] Instalar expo-dev-client
- [ ] Configurar app.json con plugins
- [ ] Rebuild con `npx expo run:android/ios`
- [ ] Test con proxy MitM (debe fallar)
- [ ] Test con certificado válido (debe funcionar)
- [ ] Documentar proceso de rotación
- [ ] Configurar alertas de expiración
- [ ] Planear rollout con doble pin

---

## 🆘 Troubleshooting

### "Network request failed"

- Verificar que los pins sean correctos (SHA-256 Base64)
- Verificar que el hostname coincida exactamente
- Verificar que el certificado del servidor sea el esperado

### "Certificate validation failed"

- Verificar fecha de expiración del certificado
- Verificar que no haya proxy/VPN interceptando
- Verificar logs nativos (adb logcat / Xcode console)

### "App funciona en desarrollo pero falla en producción"

- Verificar que `debug-overrides` solo aplique en builds de debug
- Verificar que la configuración esté en build de producción
- Verificar que EAS Build incluya los archivos de configuración
