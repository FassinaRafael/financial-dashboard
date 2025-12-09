const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let lastCachedData = null;

// --- ESTRATÉGIA FINAL: BINANCE.US (Servidores Americanos) ---
async function getCryptoData() {
  try {
    // Usamos a API .US que é permitida no Render
    // Nota: A Binance US usa symbols um pouco diferentes as vezes, mas BTCUSDT padrão funciona
    const response = await axios.get(
      'https://api.binance.us/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]'
    );

    const rawData = response.data;

    const formattedData = {};

    rawData.forEach((item) => {
      let name = "";
      if (item.symbol === "BTCUSDT") name = "bitcoin";
      if (item.symbol === "ETHUSDT") name = "ethereum";
      if (item.symbol === "SOLUSDT") name = "solana";

      if (name) {
        formattedData[name] = {
          usd: parseFloat(item.lastPrice),
          usd_24h_change: parseFloat(item.priceChangePercent),
        };
      }
    });

    return formattedData;
  } catch (error) {
    console.error("Erro na API Binance US:", error.message);
    return null;
  }
}

io.on("connection", (socket) => {
  console.log(`✅ Usuário conectado: ${socket.id}`);
  if (lastCachedData) {
    socket.emit("crypto-update", lastCachedData);
  }
});

// Intervalo de 10 segundos (Rápido e Seguro)
setInterval(async () => {
  const data = await getCryptoData();

  if (data) {
    lastCachedData = data;
    io.emit("crypto-update", data);
    console.log("Dados Binance US enviados:", new Date().toLocaleTimeString());
  }
}, 10000);

// Inicialização
getCryptoData().then((data) => {
  if (data) lastCachedData = data;
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor (Binance US Mode) rodando na porta ${PORT}`);
});
