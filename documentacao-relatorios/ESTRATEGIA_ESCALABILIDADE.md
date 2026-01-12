# MEI Guardian - Estratégia de Escalabilidade e Monetização

Este documento detalha o caminho técnico e comercial para levar o MEI Guardian do MVP atual para um produto SaaS robusto e lucrativo.

## 1. Arquitetura: Do MVP à Escala

### Fase 1: MVP (Estado Atual)
- **Infraestrutura**: Backend Node.js em serviço gratuito (Render/Railway), Banco SQLite local.
- **Limitações**: Não suporta múltiplas instâncias (devido ao SQLite), mocks para WhatsApp/CNPJ.
- **Custo**: R$ 0,00.

### Fase 2: Profissionalização (Até 1.000 Usuários)
- **Banco de Dados**: Migrar SQLite para **PostgreSQL** gerenciado (ex: Supabase ou Neon Tech - Free Tiers generosos).
- **Backend**: Container Docker no Railway/Fly.io.
- **Serviços Externos**:
  - **WhatsApp**: Integrar API oficial (WPPConnect ou Twilio se houver budget).
  - **Consulta CNPJ**: Integrar API Brasil ou ReceitaWS (versões gratuitas com limite).
- **Custo Estimado**: < R$ 50,00/mês.

### Fase 3: Escala (Microservices)
- **Separação de Serviços**:
  - `auth-service` (Gestão de usuários)
  - `monitor-service` (Crawler de CNPJ em background jobs)
  - `notification-service` (Filas RabbitMQ/Redis para envio massivo de alertas)
- **Infraestrutura**: Kubernetes ou Amazon ECS.

## 2. Modelos de Monetização

### Plano Freemium (Isca)
- **Foco**: Aquisição de usuários.
- **Recursos**:
  - Monitoramento de 1 CNPJ.
  - Alerta de vencimento APENAS por e-mail.
  - Emissão de até 3 Notas/mês.

### Plano PRO (Recorrente - R$ 29,90/mês)
- **Foco**: O "Pão com Manteiga" do SaaS.
- **Recursos**:
  - Alertas prioritários via **WhatsApp**.
  - Emissão de Notas **Ilimitada**.
  - Dashboard Financeiro completo.
  - Suporte via Chat.

### Plano Contador (B2B - R$ 149,90/mês)
- **Foco**: Escritórios de contabilidade que gerenciam vários MEIs.
- **Recursos**:
  - Painel Multi-Client.
  - Whitelabel (Logotipo do Contador no Dashboard do cliente).
  - Relatórios em Lote.

## 3. Segurança e Compliance (LGPD)
- **Dados Sensíveis**: Criptografar CPFs e Senhas (já implementado bcrypt).
- **Termos de Uso**: Implementar "Aceite" no cadastro.
- **Logs**: Implementar auditoria de quem acessou/gerou notas.

## 4. Próximos Passos Técnicos
1.  Atualizar `prisma.schema` para usar PostgreSQL.
2.  Implementar webhooks de pagamento (Stripe/Mercado Pago) para ativar Planos PRO automaticamente.
3.  Configurar CI/CD (GitHub Actions) para deploy automático.
