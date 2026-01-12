# MEI Guardian 🛡️

MicroSaaS para automação fiscal e monitoramento de MEI (Microempreendedor Individual).

## 🚀 Funcionalidades (MVP)
> **Nota**: Neste estágio MVP, o sistema utiliza **dados simulados** (Mocks) para demonstração de fluxo. A integração real com a Receita Federal e Bancos será implementada na Fase 2.

- **Monitoramento de Status**: Semáforo visual da saúde do CNPJ (Simulado).
- **Gestão de DAS**: Geração de guias e controle de pagamentos (Simulado).
- **Notas Fiscais**: Emissão simplificada de NFS-e (Gera URL fake).
- **Alertas**: Notificações automáticas (Log no Console).

## 🛠️ Tecnologias
- **Frontend**: Next.js 14, CSS Modules (Design System Premium).
- **Backend**: Node.js, Express, JWT Auth.
- **Banco de Dados**: SQLite (via Prisma ORM).

## 📦 Como Rodar Localmente

### Pré-requisitos
- Node.js (v18+)
- NPM

### 1. Clonar e Instalar
```bash
git clone https://github.com/seu-usuario/mei-guardian.git
cd mei-guardian
```

### 2. Configurar Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init # Cria o banco SQLite
node src/server.js
```
O servidor rodará em `http://localhost:3001`.

### 3. Configurar Frontend
Abra um novo terminal:
```bash
cd frontend
npm install
npm run dev
```
Acesse a aplicação em `http://localhost:3000`.

## 🔑 Credenciais de Teste
Crie uma conta nova na tela de registro para testar o fluxo completo.

## 📄 Licença
MIT
