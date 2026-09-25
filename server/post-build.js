const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const assetsSource = path.join(rootDir, 'assets', 'official-store-logo.png');
const manifestSource = path.join(rootDir, 'public', 'manifest.json');

console.log('🔧 Running post-build PWA HD Icon Injection...');

if (fs.existsSync(distDir)) {
  // 1. Copy HD PNG Icons (512x512, 192x192, favicon, etc.)
  if (fs.existsSync(assetsSource)) {
    fs.copyFileSync(assetsSource, path.join(distDir, 'icon-512.png'));
    fs.copyFileSync(assetsSource, path.join(distDir, 'icon-192.png'));
    fs.copyFileSync(assetsSource, path.join(distDir, 'favicon.png'));
    fs.copyFileSync(assetsSource, path.join(distDir, 'apple-touch-icon.png'));
    
    // Also copy to dist/assets if directory exists
    const distAssetsDir = path.join(distDir, 'assets');
    if (!fs.existsSync(distAssetsDir)) {
      fs.mkdirSync(distAssetsDir, { recursive: true });
    }
    fs.copyFileSync(assetsSource, path.join(distAssetsDir, 'official-store-logo.png'));

    console.log('✅ Copied HD official-store-logo.png to dist/ (icon-512.png, icon-192.png, favicon.png, apple-touch-icon.png)');
  }

  // 2. Copy manifest.json
  if (fs.existsSync(manifestSource)) {
    fs.copyFileSync(manifestSource, path.join(distDir, 'manifest.json'));
    console.log('✅ Copied PWA manifest.json to dist/');
  }

  // 3. Inject PWA HD Icon tags into dist/index.html
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf-8');
    if (!html.includes('icon-512.png')) {
      const pwaTags = `
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/icon-512.png" />
    <meta name="theme-color" content="#D91E28" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
  </head>`;
      html = html.replace('</head>', pwaTags);
      fs.writeFileSync(indexPath, html, 'utf-8');
      console.log('✅ Injected HD PWA icon tags into dist/index.html');
    }
  }
}
console.log('🎉 Post-build process completed successfully!');
