# Generación de Iconos de la Aplicación

Este documento describe cómo se generaron los iconos de la aplicación usando el logo de Libélula.

## 🛠️ Herramienta Utilizada

**Sharp** - Biblioteca de procesamiento de imágenes de alto rendimiento para Node.js que convierte SVG a PNG con máxima calidad.

## 📦 Iconos Generados

El script `scripts/generate-icons.js` genera automáticamente todos los iconos necesarios para la aplicación:

| Archivo | Tamaño | Propósito |
|---------|--------|-----------|
| `icon.png` | 1024x1024px | Icono principal de iOS |
| `favicon.png` | 512x512px | Icono para navegador web |
| `splash-icon.png` | 512x512px | Imagen de splash screen |
| `android-icon-foreground.png` | 1024x1024px | Capa frontal del icono adaptable de Android |
| `android-icon-background.png` | 1024x1024px | Fondo del icono adaptable de Android (#E6F4FE) |
| `android-icon-monochrome.png` | 1024x1024px | Versión monocromática para Android 13+ |

## 🚀 Cómo Usar

### Generar todos los iconos

```bash
npm run generate:icons
```

Este comando ejecuta el script que:
1. Lee el archivo SVG de origen (`assets/images/dragonfly.svg`)
2. Convierte el SVG a PNG en diferentes tamaños
3. Aplica configuraciones específicas (fondo, escala de grises, etc.)
4. Guarda los archivos en `assets/images/`

### Modificar la Configuración

Edita el archivo `scripts/generate-icons.js` para cambiar:

- **Tamaños**: Modifica `width` y `height` en el array `icons`
- **Colores de fondo**: Cambia el valor `bg` (`'transparent'` o código hexadecimal)
- **Calidad**: Ajusta `quality` y `compressionLevel` en el método `.png()`

## 📋 Configuración en app.json

Los iconos están configurados en `app.json`:

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      }
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "splash": {
      "image": "./assets/images/splash-icon.png"
    }
  }
}
```

## 🔄 Regenerar Iconos

Si modificas el SVG de origen (`dragonfly.svg`), simplemente ejecuta:

```bash
npm run generate:icons
```

Y todos los iconos se regenerarán automáticamente.

## 🎨 Recomendaciones de Diseño

### Android Adaptive Icon
- El logo debe estar dentro del "círculo de seguridad" (66% del área total)
- Los bordes pueden recortarse en diferentes dispositivos
- El fondo usa el color corporativo `#E6F4FE`

### iOS Icon
- El logo ocupa ~80% del espacio con padding alrededor
- iOS añade automáticamente bordes redondeados
- Fondo transparente recomendado

### Splash Screen
- Fondo oscuro (`#171717`) configurado en `app.json`
- El logo se muestra centrado con `resizeMode: "contain"`

## 📦 Dependencias

```json
{
  "devDependencies": {
    "sharp": "^0.33.x"
  }
}
```

## 📚 Referencias

- [Expo App Icon Documentation](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Android Adaptive Icons Guide](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
