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

// --- NOVA ESTRATÉGIA: COINCAP API (Funciona nos EUA/Render) ---
async function getCryptoData() {
  try {
    // Busca Bitcoin, Ethereum e Solana
    const response = await axios.get(
      "https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,solana"
    );

    const rawData = response.data.data;

    // ADAPTER: Transforma CoinCap Array -> Formato CoinGecko (Frontend)
    const formattedData = {};

    rawData.forEach((item) => {
      // CoinCap usa IDs: 'bitcoin', 'ethereum', 'solana'
      const name = item.id;

      if (name) {
        formattedData[name] = {
          usd: parseFloat(item.priceUsd), // Preço
          usd_24h_change: parseFloat(item.changePercent24Hr), // Variação
        };
      }
    });

    return formattedData;
  } catch (error) {
    console.error("Erro na API CoinCap:", error.message);
    return null;
  }
}

io.on("connection", (socket) => {
  console.log(`✅ Usuário conectado: ${socket.id}`);
  if (lastCachedData) {
    socket.emit("crypto-update", lastCachedData);
  }
});

// Intervalo rápido de 10 segundos (CoinCap aguenta tranquilamente)
setInterval(async () => {
  const data = await getCryptoData();

  if (data) {
    lastCachedData = data;
    io.emit("crypto-update", data);
    console.log("Dados CoinCap enviados:", new Date().toLocaleTimeString());
  }
}, 10000);

// Inicialização
getCryptoData().then((data) => {
  if (data) lastCachedData = data;
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor (CoinCap Mode) rodando na porta ${PORT}`);
});
