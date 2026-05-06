import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple .env parser
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

async function main() {
  const uri = process.env.DATABASE_URL;
  console.log(`Using database at: ${uri}`);

  const env = {
    ...process.env,
    DATABASE_URL: uri,
    PORT: '5000',
    VITE_API_URL: 'http://localhost:5000/api'
  };

  console.log('Seeding database...');
  try {
    await runCommand('pnpm', ['--filter', '@workspace/scripts', 'run', 'seed'], env);
  } catch (err) {
    console.error('Seeding failed, but continuing...', err.message);
  }

  console.log('Starting API Server...');
  const apiProcess = spawn('pnpm', ['--filter', '@workspace/api-server', 'run', 'dev'], {
    env,
    stdio: 'inherit',
    shell: true
  });

  console.log('Starting Frontend...');
  const frontendProcess = spawn('pnpm', ['--filter', '@workspace/skillsync', 'run', 'dev'], {
    env: {
      ...env,
      PORT: '5173',
      BASE_PATH: '/'
    },
    stdio: 'inherit',
    shell: true
  });

  process.on('SIGINT', () => {
    apiProcess.kill();
    frontendProcess.kill();
    process.exit();
  });
}

function runCommand(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: 'inherit', shell: true });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

main().catch(console.error);
