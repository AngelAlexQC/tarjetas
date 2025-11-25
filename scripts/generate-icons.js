const sharp = require('sharp');
const path = require('path');

// Configuración de los iconos a generar
const icons = [
  { name: 'icon.png', width: 1024, height: 1024, bg: 'transparent' },
  { name: 'favicon.png', width: 512, height: 512, bg: 'transparent' },
  { name: 'splash-icon.png', width: 512, height: 512, bg: 'transparent' },
  { name: 'android-icon-foreground.png', width: 1024, height: 1024, bg: 'transparent' },
  { name: 'android-icon-background.png', width: 1024, height: 1024, bg: '#E6F4FE' },
  { name: 'android-icon-monochrome.png', width: 1024, height: 1024, bg: 'transparent', grayscale: true },
];

const inputSvg = path.resolve(process.cwd(), 'assets/images/dragonfly.svg');
const outputDir = path.resolve(process.cwd(), 'assets/images');

async function generateIcons() {
  console.log('🚀 Generando iconos de la aplicación...\n');

  for (const icon of icons) {
    try {
      const outputPath = path.join(outputDir, icon.name);
      
      let pipeline = sharp(inputSvg, { density: 300 })
        .resize(icon.width, icon.height, {
          fit: 'contain',
          background: icon.bg === 'transparent' ? { r: 0, g: 0, b: 0, alpha: 0 } : icon.bg
        });

      // Si es monocromático, convertir a escala de grises
      if (icon.grayscale) {
        pipeline = pipeline.grayscale();
      }

      await pipeline.png({ quality: 100, compressionLevel: 9 }).toFile(outputPath);
      
      console.log(`✅ ${icon.name} (${icon.width}x${icon.height}) - Generado`);
    } catch (error) {
      console.error(`❌ Error generando ${icon.name}:`, error.message);
    }
  }

  console.log('\n✨ ¡Todos los iconos han sido generados exitosamente!');
}

generateIcons();
