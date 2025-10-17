# ♻️ EcoCiclo

O EcoCiclo é um aplicativo móvel que otimiza a coleta seletiva em Anápolis por meio de logística inteligente, dados em tempo real e engajamento dos cidadãos.

## � Índice

- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Uso do Sistema](#-uso-do-sistema)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)

## 🚀 Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

### Frontend
- [Next.js 15](https://nextjs.org) - Framework React com renderização híbrida
- [React 19](https://reactjs.org) - Biblioteca para construção de interfaces
- [TypeScript](https://www.typescriptlang.org) - Superset JavaScript com tipagem estática
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS utilitário

### Backend & Database
- [Prisma](https://www.prisma.io) - ORM para Node.js e TypeScript
- [MySQL](https://www.mysql.com) - Sistema de gerenciamento de banco de dados
- [NextAuth.js](https://next-auth.js.org) - Autenticação para Next.js

### UI Components
- [Radix UI](https://www.radix-ui.com) - Componentes acessíveis e não estilizados
- [Lucide React](https://lucide.dev) - Ícones
- [Vaul](https://vaul.emilkowal.ski/) - Drawer component

### Outros
- [AWS SDK S3](https://aws.amazon.com/sdk-for-javascript/) - Upload de arquivos
- [React Hook Form](https://react-hook-form.com) - Gerenciamento de formulários
- [Zod](https://zod.dev) - Validação de schemas
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Criptografia de senhas

## ⚙️ Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:

- [Node.js](https://nodejs.org) (versão 20 ou superior)
- [npm](https://www.npmjs.com) ou [yarn](https://yarnpkg.com)
- [Docker](https://www.docker.com) e [Docker Compose](https://docs.docker.com/compose/) (para o banco de dados)
- [Git](https://git-scm.com)

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/warnerpro/EcoCiclo.git
cd EcoCiclo
```

### 2. Instale as dependências

```bash
npm install
```

## 🔧 Configuração

### 1. Configure o Banco de Dados

Inicie o container MySQL usando Docker Compose:

```bash
docker-compose up -d
```

Isso irá criar um container MySQL com as seguintes configurações padrão:
- **Porta**: 3306
- **Usuário**: my_user
- **Senha**: my_password
- **Database**: my_database

### 2. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL="mysql://my_user:my_password@localhost:3306/my_database"

# NextAuth
NEXTAUTH_SECRET="seu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3 (opcional, apenas se for usar upload de arquivos)
AWS_ACCESS_KEY_ID="sua-access-key"
AWS_SECRET_ACCESS_KEY="sua-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="seu-bucket-name"

# Google Maps API (para funcionalidades de localização e mapas)
GOOGLE_MAPS_API_KEY="sua-api-key-do-google-maps"
```

**⚠️ Importante**: 
- Gere um secret seguro para o `NEXTAUTH_SECRET`. Você pode usar: `openssl rand -base64 32`
- Configure as credenciais AWS apenas se for utilizar upload de arquivos
- Obtenha uma API Key do Google Maps em: https://console.cloud.google.com/

### 3. Execute as Migrações do Banco de Dados

```bash
npx prisma migrate dev
```

Este comando irá:
- Criar as tabelas no banco de dados
- Gerar o Prisma Client

### 4. (Opcional) Popule o Banco com Dados Iniciais

Se houver um arquivo de seed configurado:

```bash
npx prisma db seed
```

## 🚦 Execução

### Modo de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

### Modo de Produção

```bash
# Build da aplicação
npm run build

# Inicia o servidor de produção
npm start
```

## � Uso do Sistema

### Tipos de Usuário

O EcoCiclo possui dois tipos de usuários:

#### 1. **Usuário Comum (USUARIO)**
- Criar pontos de coleta marcando locais no mapa
- Adicionar itens recicláveis aos pontos de coleta
- Fazer upload de fotos dos itens
- Visualizar pontos de coleta próximos
- Acompanhar pontuação e conquistas
- Gerar certificados de contribuição ambiental

#### 2. **Catador (CATADOR)**
- Visualizar pontos de coleta disponíveis
- Criar rotas de coleta
- Marcar itens como coletados
- Gerenciar coletas em andamento
- Acumular pontuação por coletas realizadas

### Funcionalidades Principais

#### 📍 Pontos de Coleta
- **Criar Ponto**: Usuários podem criar novos pontos de coleta informando localização e descrição
- **Adicionar Itens**: Adicionar itens recicláveis com categoria, foto e descrição
- **Visualizar no Mapa**: Todos os pontos são exibidos em um mapa interativo

#### 🗑️ Categorias de Resíduos
O sistema suporta diversas categorias de materiais recicláveis:
- Papel
- Plástico
- Vidro
- Metal
- Eletrônicos
- Orgânicos
- Outros

#### 🏆 Sistema de Gamificação
- **Pontuação**: Ganhe pontos ao criar pontos de coleta e realizar coletas
- **Níveis**: Avance de nível conforme acumula pontos
- **Conquistas**: Desbloqueie conquistas especiais
- **Certificados**: Gere certificados PDF de suas contribuições ambientais

#### 🔐 Autenticação
- Sistema de login seguro com NextAuth
- Cadastro de novos usuários
- Recuperação de senha
- Proteção de rotas privadas

### Navegação

#### Rotas Públicas
- `/` - Página de login
- `/register` - Cadastro de novos usuários

#### Rotas Privadas (requer autenticação)
- `/home` - Dashboard principal
- `/coletas` - Gerenciamento de coletas
- `/perfil` - Perfil do usuário, pontuação e certificados

## 📁 Estrutura do Projeto

```
EcoCiclo_APP/
├── prisma/                    # Configuração do Prisma ORM
│   ├── schema.prisma         # Schema do banco de dados
│   ├── seed.ts               # Dados iniciais
│   └── migrations/           # Migrações do banco
├── public/                    # Arquivos estáticos
│   ├── background-*.jpeg     # Imagens de fundo
│   └── *.svg                 # Ícones e logos
├── src/
│   ├── @types/               # Definições de tipos TypeScript
│   ├── app/                  # App Router do Next.js
│   │   ├── (public)/        # Rotas públicas
│   │   ├── (private)/       # Rotas protegidas
│   │   └── api/             # API Routes
│   ├── components/           # Componentes React
│   │   ├── ui/              # Componentes de UI base
│   │   └── routes/          # Componentes específicos de rotas
│   ├── hooks/                # Custom React Hooks
│   └── lib/                  # Utilitários e configurações
│       ├── auth/            # Configuração de autenticação
│       ├── constants/       # Constantes da aplicação
│       └── db/              # Cliente Prisma
├── .env                      # Variáveis de ambiente (criar)
├── docker-compose.yml        # Configuração do Docker
├── next.config.ts            # Configuração do Next.js
├── package.json              # Dependências do projeto
├── tailwind.config.ts        # Configuração do Tailwind
└── tsconfig.json             # Configuração do TypeScript
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm start            # Inicia servidor de produção

# Lint
npm run lint         # Executa o linter do Next.js

# Prisma
npx prisma studio    # Abre interface visual do banco de dados
npx prisma migrate dev  # Cria e aplica migrações
npx prisma generate  # Gera o Prisma Client
npx prisma db seed   # Popula o banco com dados iniciais
```

## 🐛 Troubleshooting

### Erro de conexão com o banco de dados
- Verifique se o Docker está rodando: `docker ps`
- Verifique se o container MySQL está ativo
- Confirme se as credenciais no `.env` estão corretas

### Erro "Prisma Client não encontrado"
```bash
npx prisma generate
```

### Erro na API do Google Maps
Se você está tendo problemas ao criar pontos de coleta com localização:

1. **Verifique se a API Key está configurada**
   - Certifique-se de que a variável `GOOGLE_MAPS_API_KEY` está no arquivo `.env`
   - A variável deve estar sem `NEXT_PUBLIC_` no início (isso é importante!)

2. **Habilite as APIs necessárias no Google Cloud Console**
   - Acesse: https://console.cloud.google.com/apis/library
   - Habilite as seguintes APIs:
     - **Places API** (para busca de endereços)
     - **Geocoding API** (para conversão de coordenadas em endereços)
     - **Maps JavaScript API** (se estiver usando mapas visuais)

3. **Verifique as restrições da API Key**
   - No Google Cloud Console, vá em "Credentials"
   - Certifique-se de que a API Key não tem restrições de domínio muito rígidas
   - Para desenvolvimento local, você pode remover as restrições temporariamente

4. **Verifique o console do navegador**
   - Abra as ferramentas de desenvolvedor (F12)
   - Vá na aba "Console" para ver mensagens de erro detalhadas
   - Vá na aba "Network" para verificar as requisições para `/api/google-maps`

5. **Reinicie o servidor após configurar a API Key**
   ```bash
   # Pare o servidor (Ctrl+C) e reinicie
   npm run dev
   ```

### Erro de permissão de geolocalização
- O navegador pode bloquear a geolocalização em HTTP (sem HTTPS)
- Para desenvolvimento, use `localhost` ao invés de `127.0.0.1`
- Verifique as permissões de localização nas configurações do navegador

### Porta 3000 já em uso
```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou rode em outra porta
$env:PORT=3001; npm run dev
```

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Contribuindo

Contribuições são sempre bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

Desenvolvido com 💚 para um futuro mais sustentável
