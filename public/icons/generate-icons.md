# Geração de Ícones para PWA

Para completar a configuração do PWA, você precisa gerar os ícones nas seguintes dimensões:

## Ícones Necessários:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Como Gerar:

1. **Crie um ícone base** com o logo do AgroContador (trator) em alta resolução (pelo menos 512x512px)

2. **Use ferramentas online** como:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
   - https://favicon.io/favicon-generator/

3. **Ou use ferramentas de linha de comando** como ImageMagick:
   ```bash
   # Exemplo com ImageMagick
   convert logo.png -resize 72x72 icon-72x72.png
   convert logo.png -resize 96x96 icon-96x96.png
   convert logo.png -resize 128x128 icon-128x128.png
   convert logo.png -resize 144x144 icon-144x144.png
   convert logo.png -resize 152x152 icon-152x152.png
   convert logo.png -resize 192x192 icon-192x192.png
   convert logo.png -resize 384x384 icon-384x384.png
   convert logo.png -resize 512x512 icon-512x512.png
   ```

## Design Recomendado:
- **Fundo**: Verde (#16a34a) ou transparente
- **Ícone**: Trator branco ou símbolo agrícola
- **Estilo**: Minimalista e legível em tamanhos pequenos
- **Formato**: PNG com transparência

## Screenshots (Opcional):
Você também pode adicionar screenshots em:
- `/public/screenshots/desktop-dashboard.png` (1280x720)
- `/public/screenshots/mobile-dashboard.png` (390x844)

Estes screenshots aparecerão na loja de aplicativos quando o PWA for listado.