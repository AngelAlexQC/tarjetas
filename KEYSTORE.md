# 🔐 Información del Keystore de Android

## Credenciales del Keystore

⚠️ **IMPORTANTE**: Este archivo NO debe compartirse públicamente. Las credenciales están configuradas como secrets en GitHub Actions.

### Datos del Keystore

- **Archivo**: `release.jks` (no incluido en git)
- **Alias**: `tarjetas-key`
- **Algoritmo**: RSA 2048 bits
- **Validez**: 10,000 días (≈27 años)
- **Organización**: Libelula

### GitHub Secrets Configurados

Los siguientes secrets están configurados en el repositorio:

1. `ANDROID_KEYSTORE_BASE64` - Keystore codificado en Base64
2. `ANDROID_KEY_ALIAS` - Alias de la clave (`tarjetas-key`)
3. `ANDROID_KEYSTORE_PASSWORD` - Contraseña del keystore
4. `ANDROID_KEY_PASSWORD` - Contraseña de la clave

## 📦 Backup del Keystore

**CRÍTICO**: Guarda una copia segura del archivo `release.jks` en un lugar seguro:

1. En un gestor de contraseñas (1Password, LastPass, Bitwarden, etc.)
2. En almacenamiento cifrado offline
3. En un sistema de backup seguro

### ⚠️ Por qué es importante

- **No se puede regenerar**: Si pierdes el keystore, no podrás actualizar la app en Google Play Store
- **Deberás publicar una nueva app**: Con un package name diferente, perdiendo usuarios y reviews
- **Backup múltiple**: Guarda al menos 3 copias en lugares diferentes

## 🔄 Renovar o Cambiar el Keystore

Si necesitas actualizar los secrets del keystore:

### Windows (PowerShell):
```powershell
.\setup-keystore-secrets.ps1
```

### Linux/Mac (Bash):
```bash
./setup-keystore-secrets.sh
```

## 📝 Datos del Certificado

```
CN=AngelAlexQC
OU=Development
O=Libelula
L=Unknown
ST=Unknown
C=EC
```

## 🔍 Verificar el Keystore

Para verificar que el keystore es válido:

```bash
keytool -list -v -keystore release.jks -alias tarjetas-key
```

---

**Última actualización**: 18 de diciembre de 2025
**Creado por**: GitHub Copilot (Configuración automática)
