import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
console.log(`[env.js] Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
  console.error('[env.js] Error loading .env file:', result.error);
} else {
  console.log('[env.js] .env loaded successfully');
}
