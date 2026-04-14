const fs = require('fs');
const path = require('path');

const nextEnvPath = path.join(__dirname, '.open-next/cloudflare/next-env.mjs');

if (fs.existsSync(nextEnvPath)) {
  let content = fs.readFileSync(nextEnvPath, 'utf-8');

  // Remove linhas duplicadas, mantendo apenas as primeiras
  const lines = content.split('\n');
  const seen = new Set();
  const filtered = lines.filter(line => {
    if (line.startsWith('export const')) {
      if (seen.has(line)) {
        return false; // Remove duplicata
      }
      seen.add(line);
    }
    return true;
  });

  fs.writeFileSync(nextEnvPath, filtered.join('\n'), 'utf-8');
  console.log('✅ Fixed next-env.mjs - removed duplicate exports');
} else {
  console.log('⚠️  next-env.mjs not found');
}
