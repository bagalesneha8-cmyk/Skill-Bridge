import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('Starting MongoDB Memory Server...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'skillsync'
    }
  });
  const uri = mongod.getUri();
  console.log(`MongoDB Memory Server started at: ${uri}`);

  const env = {
    ...process.env,
    DATABASE_URL: uri,
    PORT: '5000',
    VITE_API_URL: 'http://localhost:5000/api'
  };

  console.log('Seeding database...');
  await runCommand('pnpm', ['--filter', '@workspace/scripts', 'run', 'seed'], env);

  console.log('Starting API Server...');
  const apiProcess = spawn('pnpm', ['--filter', '@workspace/api-server', 'run', 'dev'], {
    env,
    stdio: 'inherit',
    shell: true
  });

  console.log('Starting Frontend...');
  const frontendProcess = spawn('pnpm', ['--filter', '@workspace/skillsync', 'run', 'dev'], {
    env,
    stdio: 'inherit',
    shell: true
  });

  process.on('SIGINT', async () => {
    apiProcess.kill();
    frontendProcess.kill();
    await mongod.stop();
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
