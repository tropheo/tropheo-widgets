#!/usr/bin/env node

/**
 * Build script for generating browser-ready bundle of @tropheo/embed
 * This creates a standalone bundle that can be loaded via <script> tag
 */

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const buildBundle = async () => {
  console.log('🏗️  Building Tropheo Embed bundle...\n');

  try {
    // Build the bundle
    await esbuild.build({
      entryPoints: ['./packages/embed/src/index.ts'],
      bundle: true,
      format: 'iife',
      globalName: 'TropheoEmbedModule',
      outfile: './dist/tropheo-embed.bundle.js',
      platform: 'browser',
      target: 'es2017',
      minify: false,
      sourcemap: false,
      banner: {
        js: `/* Tropheo Widgets Embed - Browser Bundle */\n`,
      },
      footer: {
        js: `
// Expose to window
if (typeof window !== 'undefined' && TropheoEmbedModule) {
  window.TropheoEmbed = TropheoEmbedModule.TropheoEmbed || TropheoEmbedModule.default;
  window.TropheoWidgets = TropheoEmbedModule.TropheoWidgets;
  
  // Debug log
  console.log('✅ Tropheo Widgets loaded successfully');
  console.log('Available constructors:', {
    TropheoEmbed: typeof window.TropheoEmbed,
    TropheoWidgets: typeof window.TropheoWidgets
  });
}
`,
      },
    });

    console.log('✅ Bundle created successfully!');
    console.log('📦 Output: ./dist/tropheo-embed.bundle.js\n');

    // Copy to test-library for testing
    const distPath = path.join(__dirname, 'dist', 'tropheo-embed.bundle.js');
    const testLibPath = path.join(__dirname, '..', 'test-library', 'tropheo-embed.bundle.js');

    if (fs.existsSync(distPath)) {
      fs.copyFileSync(distPath, testLibPath);
      console.log('✅ Copied bundle to test-library/');
      console.log('📁 Location:', testLibPath, '\n');
    }

    console.log('🎉 Build complete!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
};

buildBundle();
