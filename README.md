# Personal Finance Tracker Mobile

Aplicativo mobile Android desenvolvido com **React Native** e **Expo**, integrado a uma API em produção construída com **Python Flask**. O app permite acompanhar indicadores financeiros, visualizar despesas por categoria e gerenciar transações com operações completas de **CRUD**.

---

## 📱 Sobre o projeto

O **Personal Finance Tracker Mobile** é a versão mobile do sistema de controle financeiro pessoal desenvolvido em Flask.

A aplicação consome dados reais do backend publicado no Render e permite que o usuário visualize, crie, edite e exclua transações diretamente pelo celular.

O objetivo do projeto é demonstrar integração entre aplicativo mobile, API REST, backend Python Flask, banco de dados, deploy em produção e build Android com Expo/EAS.

---

## 🚀 Funcionalidades

- Dashboard financeiro mobile.
- Visualização de saldo atual, receitas e despesas.
- Indicadores de economia.
- Progresso da meta financeira.
- Alerta financeiro baseado na maior categoria de gastos.
- Gráfico simples de despesas por categoria.
- Listagem de transações recentes.
- Listagem completa de transações.
- Criação de novas transações.
- Edição de transações existentes.
- Exclusão de transações.
- Atualização manual dos dados via API.
- Integração com backend Flask em produção.
- APK Android gerado com EAS Build.

---

## 🧩 Tecnologias utilizadas

- React Native
- Expo
- Expo Router
- TypeScript
- JavaScript
- EAS Build
- API REST
- Backend Python Flask
- Render
- Git
- GitHub

---

## 🔗 Integração com o backend

O aplicativo consome a API do projeto **Personal Finance Tracker**, desenvolvido com Python Flask.

Backend em produção:

```text
https://personal-finance-tracker-wrlj.onrender.com
```

Principais endpoints consumidos pelo app:

```text
GET    /api/mobile/demo-dashboard
GET    /api/mobile/transactions
POST   /api/mobile/transactions
PUT    /api/mobile/transactions/<id>
DELETE /api/mobile/transactions/<id>
```

---

## 📊 Dashboard mobile

A tela inicial apresenta um resumo financeiro com:

- Saldo atual
- Receitas do período
- Despesas do período
- Meta de economia
- Taxa de economia
- Maior categoria de gastos
- Progresso da meta
- Alerta financeiro
- Despesas por categoria em barras horizontais
- Transações recentes

O gráfico de despesas por categoria foi implementado diretamente com componentes nativos do React Native, sem biblioteca externa de gráficos.

---

## 💳 Gestão de transações

A aba de transações permite realizar as principais operações do sistema.

### Criar transação

O usuário pode cadastrar uma nova movimentação informando:

- Título
- Valor
- Tipo: receita ou despesa
- Categoria
- Data
- Recorrência
- Descrição

### Editar transação

Cada transação pode ser editada diretamente pelo app. Ao selecionar a opção de edição, o formulário é preenchido automaticamente com os dados existentes.

### Excluir transação

O app permite remover transações de teste ou registros existentes, atualizando a lista após a exclusão.

---

## 📁 Estrutura principal do projeto

```text
personal-finance-tracker-mobile/
│
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx       # Dashboard mobile
│   │   ├── explore.tsx     # Tela de transações com CRUD
│   │   └── _layout.tsx     # Navegação por abas
│   │
│   ├── _layout.tsx
│   └── modal.tsx
│
├── assets/
│   └── images/
│
├── components/
├── constants/
├── hooks/
├── app.json
├── eas.json
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/Eduardo-S-Balbino/personal-finance-tracker-mobile.git
```

### 2. Acesse a pasta do projeto

```bash
cd personal-finance-tracker-mobile
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute o projeto

Para abrir com Expo:

```bash
npx expo start
```

Para abrir no navegador:

```bash
npm run web
```

ou:

```bash
npx expo start --web
```

---

## 📲 Como testar no celular

1. Instale o aplicativo **Expo Go** no celular.
2. Rode o projeto localmente:

```bash
npx expo start
```

3. Escaneie o QR Code exibido no terminal.
4. Teste as telas de Dashboard e Transações.

> O computador e o celular precisam estar conectados à mesma rede Wi-Fi.

---

## 📦 Build Android com EAS

O projeto está configurado para geração de APK Android usando **EAS Build**.

### Configurar build

```bash
eas build:configure
```

### Gerar APK de preview

```bash
eas build -p android --profile preview
```

Após a finalização do build, o Expo fornece um link/QR Code para baixar e instalar o APK no Android.

---

## 🧪 Testes realizados

Foram realizados testes manuais em ambiente local, navegador, Expo Go e APK Android.

Funcionalidades validadas:

- Carregamento do Dashboard.
- Consumo da API em produção.
- Listagem de transações.
- Criação de transações.
- Edição de transações.
- Exclusão de transações.
- Atualização do Dashboard após alterações.
- Exibição de despesas por categoria.
- Instalação e execução do APK em celular Android.

---

## 🧠 Aprendizados do projeto

Durante o desenvolvimento deste app mobile, foram praticados conceitos como:

- Consumo de API REST com React Native.
- Integração entre app mobile e backend Flask.
- Manipulação de estados com React Hooks.
- Criação de formulários mobile.
- Envio de requisições GET, POST, PUT e DELETE.
- Tratamento de erros e mensagens para o usuário.
- Organização de telas com Expo Router.
- Geração de APK Android com EAS Build.
- Fluxo completo de desenvolvimento, teste, versionamento e build.

---

## 🔐 Observação sobre autenticação

Esta versão mobile utiliza endpoints voltados para demonstração e integração com usuário demo. A autenticação completa por usuário pode ser adicionada em versões futuras.

---

## 🛠️ Melhorias futuras

Algumas melhorias planejadas para evolução do projeto:

- Autenticação completa no app mobile.
- Cadastro e login de usuários.
- Filtros por tipo, categoria e período.
- Tela de detalhes da transação.
- Gráficos adicionais.
- Melhorias visuais nas telas.
- Publicação em loja de aplicativos.
- Notificações e lembretes financeiros.

---

## 🌐 Projetos relacionados

Backend / versão web:

```text
https://github.com/Eduardo-S-Balbino/personal-finance-tracker
```

Portfólio:

```text
https://portfolio-ekgq.onrender.com
```

GitHub:

```text
https://github.com/Eduardo-S-Balbino
```

---

## 👨‍💻 Autor

**Eduardo da Silva Balbino**

Estudante de Ciência da Computação, com foco em desenvolvimento Python, Back-end, APIs, automação e integração entre sistemas.

- LinkedIn: https://www.linkedin.com/in/eduardo-da-silva-balbino-1611b3401/
- GitHub: https://github.com/Eduardo-S-Balbino
- Portfólio: https://portfolio-ekgq.onrender.com
