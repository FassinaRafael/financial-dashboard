const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();

// 1. Configuração do CORS
app.use(cors());

const server = http.createServer(app);

// 2. Configuração do Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// 3. Lógica para buscar dados (Bitcoin e Ethereum)
async function getCryptoData() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true"
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados da API:", error.message);
    return null;
  }
}

// 4. O Ciclo de Vida do Socket
io.on("connection", (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  getCryptoData().then((data) => {
    if (data) socket.emit("crypto-update", data);
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectou");
  });
});

// 5. Automação: Buscar dados a cada 10 segundos
setInterval(async () => {
  const data = await getCryptoData();
  if (data) {
    // 'broadcast' envia para TODOS os conectados
    io.emit("crypto-update", data);
  }
}, 20000);

// 6. Iniciar o servidor
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
