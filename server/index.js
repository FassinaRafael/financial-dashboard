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

// --- NOVA LÓGICA: API DA BINANCE (Mais rápida e estável) ---
async function getCryptoData() {
  try {
    // Busca dados de ticker 24h para BTC, ETH e SOL de uma vez
    const response = await axios.get(
      'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]'
    );

    const rawData = response.data;

    // ADAPTER: Transforma o formato da Binance no formato que seu Frontend espera (CoinGecko style)
    // Binance retorna Array, nós transformamos em Objeto.
    const formattedData = {};

    rawData.forEach((item) => {
      // Mapeia os símbolos da Binance para os nomes do seu app
      let name = "";
      if (item.symbol === "BTCUSDT") name = "bitcoin";
      if (item.symbol === "ETHUSDT") name = "ethereum";
      if (item.symbol === "SOLUSDT") name = "solana";

      if (name) {
        formattedData[name] = {
          usd: parseFloat(item.lastPrice), // Preço atual
          usd_24h_change: parseFloat(item.priceChangePercent), // Variação %
        };
      }
    });

    return formattedData;
  } catch (error) {
    console.error("Erro na API Binance:", error.message);
    return null;
  }
}

io.on("connection", (socket) => {
  console.log(`✅ Usuário conectado: ${socket.id}`);
  if (lastCachedData) {
    socket.emit("crypto-update", lastCachedData);
  }
});

// Agora podemos voltar a atualizar RÁPIDO! 🚀
// A Binance aguenta tranquilamente a cada 5 ou 10 segundos.
setInterval(async () => {
  const data = await getCryptoData();

  if (data) {
    lastCachedData = data;
    io.emit("crypto-update", data);
    console.log("Dados Binance enviados:", new Date().toLocaleTimeString());
  }
}, 10000); // 10 segundos (Muito mais fluido que 60s)

// Inicialização
getCryptoData().then((data) => {
  if (data) lastCachedData = data;
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor (Binance Mode) rodando na porta ${PORT}`);
});
