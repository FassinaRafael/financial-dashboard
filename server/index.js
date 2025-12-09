const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const server = http.createServer(app);

// Configuração do Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Permite conexões de qualquer lugar (Vercel)
    methods: ["GET", "POST"],
  },
});

// --- VARIÁVEL DE CACHE (MEMÓRIA DO SERVIDOR) ---
let lastCachedData = null;

async function getCryptoData() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true"
    );
    return response.data;
  } catch (error) {
    console.error("Erro na API (provável 429):", error.message);
    return null;
  }
}

io.on("connection", (socket) => {
  console.log(`✅ Usuário conectado: ${socket.id}`);

  if (lastCachedData) {
    socket.emit("crypto-update", lastCachedData);
  }

  socket.on("disconnect", () => {
    console.log("Usuário desconectou");
  });
});

setInterval(async () => {
  const data = await getCryptoData();

  if (data) {
    lastCachedData = data;
    io.emit("crypto-update", data);
    console.log(
      "Dados atualizados (Broadcast):",
      new Date().toLocaleTimeString()
    );
  }
}, 60000);

// Primeira busca ao iniciar o servidor (para não esperar 60s)
getCryptoData().then((data) => {
  if (data) lastCachedData = data;
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
