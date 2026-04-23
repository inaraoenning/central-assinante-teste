# Central do Assinante

Portal web moderno para autoatendimento de assinantes de provedores de internet (ISP). Permite que clientes acessem informações financeiras, contratos de serviço, suporte e dados cadastrais de forma autônoma, sem necessidade de contato com a central.

---

## 🚀 Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| [Angular](https://angular.dev) | 21.x | Framework principal (standalone components, signals) |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.x | Linguagem principal |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.x | Utilitários de estilo |
| [DaisyUI](https://daisyui.com/) | 4.x | Componentes de UI |
| [Chart.js](https://www.chartjs.org/) + [ng2-charts](https://valor-software.com/ng2-charts/) | 4.x / 10.x | Gráficos e visualizações |
| [Day.js](https://day.js.org/) | 1.11.x | Manipulação de datas |
| [RxJS](https://rxjs.dev/) | 7.8.x | Programação reativa |
| [ts-md5](https://github.com/cotag/ts-md5) | 2.x | Hashing MD5 (autenticação legada) |

---

## 📦 Módulos da Aplicação

| Rota / Tela | Descrição |
|---|---|
| `/login` | Autenticação híbrida — via domínio do provedor ou seleção manual por CPF/CNPJ |
| `/dashboard` | Painel principal com status do cliente e resumo de conta |
| `/financeiro` | Faturas, boletos e histórico financeiro |
| `/servicos` | Serviços contratados e contratos disponíveis para download |
| `/protocolos` | Consulta de protocolos de atendimento |
| `/meus-dados` | Dados cadastrais do assinante |
| `/suporte` | Canais e solicitações de suporte |
| `/notificacao` | Central de notificações |
| `/settings` | Preferências e configurações da conta |
| `/aplicativo` | Redirecionamento / deep link para o app mobile |

---

## ⚙️ Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v11+
- [Angular CLI](https://angular.dev/tools/cli) v21+

### Passos

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd central-do-assinante

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm start
```

A aplicação estará disponível em `http://localhost:4200/`. O servidor recarrega automaticamente ao salvar alterações nos arquivos fonte.

---

## 🛠️ Scripts Disponíveis

```bash
# Servidor de desenvolvimento
npm start

# Build de produção
npm run build

# Compilar CSS do Tailwind manualmente (se necessário)
npm run build:css

# Build em modo watch (desenvolvimento)
npm run watch

# Executar testes unitários (Vitest)
npm test
```

---

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── screens/              # Telas da aplicação
│   │   ├── telas-login/      # Fluxo de autenticação
│   │   ├── dashboard/        # Painel principal
│   │   ├── financeiro/       # Módulo financeiro
│   │   ├── servicos/         # Serviços e contratos
│   │   ├── protocolos/       # Protocolos de atendimento
│   │   ├── meus-dados/       # Dados cadastrais
│   │   ├── suporte/          # Suporte ao cliente
│   │   ├── notificacao/      # Notificações
│   │   ├── settings/         # Configurações
│   │   └── aplicativo/       # App mobile redirect
│   ├── components/           # Componentes compartilhados (navbar, sidebar, etc.)
│   ├── models/               # Modelos de dados e regras de negócio
│   ├── services/             # Serviços e integração com APIs
│   └── guards/               # Guards de rota (autenticação)
├── styles.css                # Estilos globais + Tailwind
└── assets/                   # Recursos estáticos (imagens, ícones)
```

---

## 🔐 Autenticação

O sistema suporta um **login híbrido** com dois modos:

- **Modo Domínio**: o provedor é identificado automaticamente a partir do domínio de acesso, sem necessidade de seleção manual.
- **Modo Seleção Manual**: o assinante informa seu CPF ou CNPJ para buscar os provedores vinculados e selecionar com qual deseja autenticar.

---

## 📚 Recursos Adicionais

- [Documentação do Angular CLI](https://angular.dev/tools/cli)
- [Guia de componentes DaisyUI](https://daisyui.com/components/)
- [Referência do Tailwind CSS](https://tailwindcss.com/docs)
- [API Chart.js](https://www.chartjs.org/docs/latest/)
