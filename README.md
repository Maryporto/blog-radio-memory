# Radio Memory — Visualizador de Notícias (Cards)

Aplicação Angular que consome a API autenticada de cards da Radio Memory e lista, filtra e exibe as publicações.

## Requisitos

| Ferramenta | Versão | Observação |
| --- | --- | --- |
| Node.js | 20.19+, 22.12+ ou 24+ (recomendado: **24 LTS**) | Já vem com o npm |
| npm | 10+ | Instalado junto com o Node |

As dependências do projeto (o equivalente ao `requirements.txt` do Python) estão no `package.json` e têm as versões travadas no `package-lock.json`. O `npm install` instala tudo. A versão recomendada do Node está no `.nvmrc`.

## Como rodar (quem já tem Node)

```bash
npm install
cp .env.example .env     # preencha API_URL e API_TOKEN
npm start                # http://localhost:4200
```

## Instalando do zero (Windows, sem Node)

Leva uns 10 minutos. Não é preciso Docker nem nenhuma outra ferramenta.

### 1. Instalar o Node.js

**Opção A — pelo site (mais simples):**
1. Acesse <https://nodejs.org> e baixe a versão marcada como **LTS** (24.x).
2. Rode o instalador `.msi` e aceite as opções padrão (Next → Next → Install).
3. Se aparecer a opção "Automatically install the necessary tools" (Chocolatey), **deixe desmarcada**. Não é necessária.

**Opção B — pelo terminal (Windows 10/11):**
```powershell
winget install OpenJS.NodeJS.LTS
```

### 2. Conferir a instalação

**Feche e abra de novo** o terminal (PowerShell ou o terminal do VS Code), porque o terminal que já estava aberto não enxerga o Node recém-instalado. Depois rode:

```powershell
node -v    # deve mostrar v24.x.x (ou v22/v20 compatível)
npm -v     # deve mostrar 10.x ou 11.x
```

### 3. Abrir a pasta do projeto

Recomendado: instale o [VS Code](https://code.visualstudio.com), abra a pasta `radio-memory-cards` (File → Open Folder) e use o terminal integrado (menu Terminal → New Terminal). O terminal já abre dentro da pasta certa.

Pelo PowerShell avulso, entre na pasta:
```powershell
cd C:\caminho\para\radio-memory-cards
```

### 4. Instalar as dependências

```powershell
npm install
```

Esse comando baixa tudo que está no `package.json` para a pasta `node_modules` (uns 200 MB, 1 a 3 minutos). Avisos amarelos (`npm warn`) são normais. Só vale se preocupar com uma linha `npm error`.

### 5. Configurar o token

Crie o `.env` a partir do modelo:

```powershell
Copy-Item .env.example .env
```

Abra o `.env` **no VS Code** e troque `cole-o-token-aqui` pelo token recebido no enunciado. Não use o Bloco de Notas: ele pode salvar o arquivo como `.env.txt`, e aí o script não o encontra.

### 6. Rodar

```powershell
npm start
```

Quando aparecer `Local: http://localhost:4200/`, abra esse endereço no navegador. Para parar o servidor, use `Ctrl + C` no terminal.

### Problemas comuns

| Mensagem / sintoma | Causa | Solução |
| --- | --- | --- |
| `'node' não é reconhecido...` | Terminal aberto antes da instalação | Feche e abra o terminal (ou reinicie o VS Code) |
| `npm : O arquivo ...npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada` | Política padrão do PowerShell | Rode uma vez: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e responda `S` |
| `[gerar-env] Defina API_URL e API_TOKEN` | `.env` faltando, vazio ou salvo como `.env.txt` | Refaça o passo 5 e confira o nome do arquivo |
| `Port 4200 is already in use` | Outro `npm start` ainda está rodando | Feche o outro terminal ou rode `npx ng serve --port 4300` |
| `npm warn EBADENGINE` | Versão do Node fora da faixa | Instale o Node 24 LTS (passo 1) |
| A página abre, mas mostra "Não foi possível carregar" | Token errado ou sem internet | Confira o token no `.env` e rode `npm start` de novo |

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm start` | Servidor de desenvolvimento |
| `npm test` | Testes unitários (Vitest) |
| `npm run build` | Build de produção em `dist/radio-memory-cards/browser` |

Os três comandos geram antes o `src/environments/environment.ts` a partir do `.env` (scripts `pre*` do npm).

## Configuração do TOKEN/URL (env)

| Variável | Descrição |
| --- | --- |
| `API_URL` | URL base da API (POST) |
| `API_TOKEN` | Token enviado como `Authorization: Bearer <TOKEN>` |

- O `.env` e o `environment.ts` gerado estão no `.gitignore`: **o token nunca é versionado**.
- Sem `.env`, o script lê as variáveis do sistema. É assim no deploy/CI: cadastre `API_URL` e `API_TOKEN` no painel do provedor.
- **Limitação conhecida:** em um app que roda só no navegador, o token vai no bundle JavaScript e pode ser visto no DevTools. Para mantê-lo secreto seria necessário um backend/proxy (BFF), que o teste coloca fora do escopo.

## Decisões técnicas

### Arquitetura
- **Angular 21** (standalone, signals, zoneless, controle de fluxo `@if`/`@for`). Não usei o 22 porque ele exige Node 24.15+.
- Camadas: `core/` (interceptor, relógio), `shared/` (utilitários), `features/cards/` (modelo → service → regras de domínio → páginas/componentes).
- As **regras de negócio** (`domain/card-rules.ts`) são funções puras, sem Angular, e cobertas por testes.
- Uma única chamada à API, com cache (`shareReplay`) compartilhado entre a lista e o detalhe.

### Sanitização
- O `corpo` é exibido com `[innerHTML]`, que passa pelo **sanitizador nativo do Angular**: ele remove `<script>`, handlers `on*` e URLs `javascript:`. Nunca é usado `bypassSecurityTrustHtml` nesse campo.
- Não usei DOMPurify: o sanitizador nativo cobre o caso e evita uma dependência a mais. Efeito colateral aceito: os `style` inline do corpo são removidos.
- `videoUrl` só é aceita se for `https://www.youtube.com/embed/<id>` (regex). Só depois dessa validação usamos `bypassSecurityTrustResourceUrl` no `<iframe>`.
- `urlPost`/`imgUrl` são validadas com `new URL()` e só http/https passam. Links externos usam `target="_blank" rel="noopener noreferrer"`.
- O interceptor anexa o token **apenas** em requisições para `API_URL`.
- Erros da API são convertidos numa mensagem genérica: stack traces do servidor nunca chegam à tela.

### Roteamento
- `/` → lista; `/post/:id` → detalhe. Escolhi rota em vez de modal porque o link é compartilhável e o "voltar" do navegador funciona.
- Páginas com `loadComponent` (lazy loading).
- **Filtros na querystring** (`?categoria=blog&busca=jabro`), lidos via `withComponentInputBinding`.

### Identidade visual e tema
- Cores da marca (azul `#005a85` e teal `#6ca7b9`), fonte Montserrat (Google Fonts) e logo branca no cabeçalho, como no site da Radio Memory.
- **Modo claro/escuro:** `ThemeService` (signal). Sem escolha salva, o app segue o sistema operacional. A escolha fica no `localStorage` e é aplicada via `data-theme` no `<html>`. Um script inline no `index.html` reaplica o tema antes do Angular subir, para a tela não "piscar".
- **Capa do card:** usa a imagem da API; sem ela, a miniatura do YouTube (montada só a partir de um embed já validado); sem as duas, uma capa com a logo. Cards com vídeo ganham um selo "Vídeo".

### Regras de negócio
- Exibe apenas `status = 1`.
- **Fixado:** `data_fixo` existe e é `>=` agora. A comparação é por instante e o "agora" vem do relógio do navegador, reavaliado a cada minuto.
- **Ordenação** (função única `sortCards`): fixados por `data_fixo` desc e, em seguida, os demais por `data` desc.
- **Busca:** ignora maiúsculas/minúsculas e também acentos, em título e subtítulo.
- **Datas:** `dd/MM/yyyy HH:mm` com locale pt-BR.
- **Categorias:** o seletor é montado a partir dos dados.

### Dados reais tratados
Nos testes da API encontrei casos que o exemplo do PDF não mostra, e todos são tratados na normalização:
- `data_fixo = "0000-00-00"` (data inválida) → `null`
- `""` em vez de `null` para imagem/vídeo → `null`
- `urlPost` com espaço (`"https: //site..."`) → espaço removido e URL validada
- título com espaço sobrando → `trim()`
- a API responde **HTTP 200 com erro** no corpo quando falta o header → o app valida se a resposta é um array
- ação inválida leva ~29s até dar 504 → `timeout` de 10s no cliente

Achados que reportaria ao time da API: o token não é validado (qualquer valor retorna os dados) e a falta do header `Authorization` retorna o stack trace do servidor.

## Casos de teste

`npm test` roda 31 testes, incluindo os casos mínimos do enunciado:

| Caso | Onde |
| --- | --- |
| Fixados (entra e sai conforme "agora") | `card-rules.spec.ts` → `fixados` |
| Ordenação por `data` desc | `card-rules.spec.ts` → `ordenação` |
| Filtro "blog" | `card-rules.spec.ts` |
| Busca "JABRO" | `card-rules.spec.ts` → `busca` |
| Vídeo → player | `card-rules.spec.ts` → `vídeo` + `.video { aspect-ratio: 16/9 }` |
| Token só na API | `auth.interceptor.spec.ts` |
| Erro com HTTP 200 | `cards.service.spec.ts` |

**Demonstrar os fixados:** com os dados atuais nenhum card está fixado. Para ver a seção "Fixados", adicione temporariamente em `app.config.ts`:
`{ provide: NOW, useValue: () => new Date('2025-01-09') }`.

## Build e deploy

```bash
npm run build   # saída: dist/radio-memory-cards/browser
```

É um site estático, então qualquer host estático serve (Vercel, Netlify, GitHub Pages). Configure `API_URL` e `API_TOKEN` como variáveis de ambiente do build e redirecione todas as rotas para `index.html` (SPA).

<!-- Deploy: adicionar o link aqui, se houver. -->
