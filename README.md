# Crypto Analytics Pro

Este repositório contém o código fonte completo para o **Crypto Analytics Pro**, um dashboard full-stack para monitoramento de criptomoedas em tempo real. O projeto utiliza uma arquitetura moderna com **Node.js** no backend e **React** no frontend, comunicando-se via **WebSockets** para atualizações instantâneas de preços.

## 📋 Sobre o Projeto

O Crypto Analytics Pro foi desenvolvido para demonstrar a aplicação de conceitos avançados de engenharia de software, incluindo:

*   **Comunicação em Tempo Real**: Uso de Socket.io para transmitir variações de preço instantaneamente.
*   **Visualização de Dados**: Gráficos interativos com Chart.js.
*   **Arquitetura Full-Stack**: Separação clara de responsabilidades entre cliente e servidor.
*   **Design Responsivo**: Interface adaptável para diferentes tamanhos de tela.

## 🚀 Tecnologias Utilizadas

### Backend (`server/`)
*   **Node.js**: Ambiente de execução JavaScript.
*   **Express**: Framework web para criar a API e servir o socket.
*   **Socket.io**: Biblioteca para comunicação bidirecional em tempo real.
*   **Axios**: Cliente HTTP para consumir a API da CoinGecko.
*   **Cors**: Middleware para controle de acesso HTTP.

### Frontend (`client/`)
*   **React**: Biblioteca para construção de interfaces de usuário.
*   **Vite**: Ferramenta de build rápida e moderna.
*   **Socket.io-client**: Cliente para conectar ao servidor WebSocket.
*   **Chart.js / React-Chartjs-2**: Bibliotecas para renderização de gráficos.

## 📦 Instalação e Execução

Para rodar o projeto localmente, você precisará de dois terminais: um para o servidor e outro para o cliente.

### Pré-requisitos
*   Node.js (versão 14 ou superior)
*   NPM ou Yarn

### Passo 1: Configurar e Rodar o Servidor

1.  Navegue até a pasta do servidor:
    ```bash
    cd server
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor:
    ```bash
    node index.js
    ```
    *Você verá a mensagem: `🚀 Servidor rodando na porta 3001`*

### Passo 2: Configurar e Rodar o Cliente

1.  Abra um novo terminal e navegue até a pasta do cliente:
    ```bash
    cd client
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie a aplicação de desenvolvimento:
    ```bash
    npm run dev
    ```
4.  Abra o navegador no endereço indicado (geralmente `http://localhost:5173`).

## 🛠️ Estrutura do Projeto

*   **`server/`**: Contém a lógica do backend.
    *   `index.js`: Ponto de entrada, configura o servidor Express e Socket.io, e gerencia o loop de atualização de dados da API CoinGecko.
*   **`client/`**: Contém a aplicação React.
    *   `src/App.jsx`: Componente principal que gerencia o estado da aplicação, conexão com socket e renderização do dashboard.
    *   `src/components/`: (Se houver) Componentes reutilizáveis.


---
**Desenvolvido como parte de um desafio técnico.**
