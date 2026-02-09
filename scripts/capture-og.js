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
  console.log('🚀 Starting Astro server for OG capture...');
  
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

  // Set viewport to standard OG image size
  await page.setViewportSize({ width: 1200, height: 630 });

  try {
    console.log('📸 Capturing OG image...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for animations
    
    const screenshotPath = path.join(projectRoot, 'public', 'og-image.jpg');
    
    // JPEG quality 85 to balance quality and file size (target <300KB for WhatsApp)
    await page.screenshot({ 
      path: screenshotPath,
      quality: 85,
      type: 'jpeg'
    });
    console.log(`✅ Saved OG image to ${screenshotPath}`);
  } catch (error) {
    console.error('❌ Failed to capture OG image:', error);
  }

  await browser.close();
  try { process.kill(-astroProcess.pid); } catch (e) {}
  console.log('🏁 Capture complete!');
  process.exit(0);
}

main().catch(console.error);
