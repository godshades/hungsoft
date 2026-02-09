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
  console.log('🚀 Starting Astro server for screenshot capture...');
  
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

  // Set viewport for consistent screenshots
  await page.setViewportSize({ width: 1440, height: 900 });

  const demos = [
    'demo-1',
    'demo-2',
    'demo-3',
    'demo-4',
    'demo-5',
    'demo-6'
  ];

  for (const demo of demos) {
    console.log(`📸 Capturing ${demo}...`);
    try {
      const url = `${BASE_URL}/showcase/${demo}`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      const screenshotPath = path.join(projectRoot, 'public', 'images', 'showcase', `${demo}.jpg`);
      await page.screenshot({ 
        path: screenshotPath,
        quality: 80,
        type: 'jpeg'
      });
      console.log(`✅ Saved ${demo}`);
    } catch (error) {
      console.error(`❌ Failed ${demo}:`, error);
    }
  }

  await browser.close();
  try { process.kill(-astroProcess.pid); } catch (e) {}
  console.log('🏁 Capture complete!');
  process.exit(0);
}

main().catch(console.error);
