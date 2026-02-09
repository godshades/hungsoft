import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

async function main() {
  console.log('🚀 Starting Astro server for Layout Verification...');
  
  // Start Astro dev server
  const astroProcess = spawn('npx', ['astro', 'dev', '--port', PORT.toString()], {
    cwd: projectRoot,
    stdio: 'ignore',
    shell: true,
    detached: true
  });

  console.log('Waiting 10s for server to warm up...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const viewports = [
    { width: 320, height: 568, name: 'mobile-small' },
    { width: 375, height: 667, name: 'mobile-medium' },
    { width: 768, height: 1024, name: 'tablet-portrait' },
    { width: 1024, height: 768, name: 'tablet-landscape' },
    { width: 1440, height: 900, name: 'desktop' }
  ];

  for (const viewport of viewports) {
    console.log(`📸 Verifying layout: ${viewport.name} (${viewport.width}x${viewport.height})...`);
    try {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000); // Allow layout to settle
      
      const screenshotPath = path.join(projectRoot, 'public', 'verify', `${viewport.name}.jpg`);
      
      await page.screenshot({ 
        path: screenshotPath,
        quality: 80,
        type: 'jpeg',
        fullPage: true 
      });
      console.log(`✅ Captured ${viewport.name}`);
    } catch (error) {
      console.error(`❌ Failed to capture ${viewport.name}:`, error);
    }
  }

  await browser.close();
  try { process.kill(-astroProcess.pid); } catch (e) {}
  console.log('🏁 Verification capture complete! Check public/verify/');
  process.exit(0);
}

main().catch(console.error);
