/**
 * Gera src/environments/environment.ts a partir de variáveis de ambiente.
 *
 * Por quê: o Angular não lê .env sozinho, e o teste exige que o token
 * não seja versionado. Este script roda antes de start/build/test
 * (scripts "pre*" do package.json) e escreve um arquivo que está no .gitignore.
 *
 * Ordem de leitura: arquivo .env local (dev) → variáveis do sistema (CI/deploy).
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

if (existsSync('.env')) {
  // Nativo do Node 20.12+: carrega o .env em process.env sem dependência extra.
  process.loadEnvFile('.env');
}

const { API_URL, API_TOKEN } = process.env;

if (!API_URL || !API_TOKEN) {
  console.error('[gerar-env] Defina API_URL e API_TOKEN (copie .env.example para .env).');
  process.exit(1);
}

const conteudo = `// ARQUIVO GERADO por scripts/gerar-env.mjs — não edite e não versione.
export const environment = {
  apiUrl: ${JSON.stringify(API_URL)},
  apiToken: ${JSON.stringify(API_TOKEN)},
} as const;
`;

mkdirSync('src/environments', { recursive: true });
writeFileSync('src/environments/environment.ts', conteudo);
console.log('[gerar-env] src/environments/environment.ts gerado (token não exibido).');
