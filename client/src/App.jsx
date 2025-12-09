import { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

/**
 * Main application component that displays the cryptocurrency dashboard.
 * Manages the state for real-time data, chart history, theme, and selected coin.
 * Connects to the backend via Socket.io to receive updates.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
function App() {
  const [currentData, setCurrentData] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");

  const [chartHistory, setChartHistory] = useState({
    labels: [],
    bitcoin: [],
    ethereum: [],
    solana: [],
  });

  // --- NOVIDADE 1: TÍTULO DINÂMICO ---
  // Atualiza o nome da aba do navegador com o preço da moeda selecionada
  useEffect(() => {
    if (currentData && currentData[selectedCoin]) {
      const price = currentData[selectedCoin].usd.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      document.title = `${price} | ${selectedCoin.toUpperCase()} - Crypto Pro`;
    } else {
      document.title = "Crypto Analytics Pro";
    }
  }, [currentData, selectedCoin]);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    if (socket.connected) setIsConnected(true);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("crypto-update", (data) => {
      setCurrentData(data);
      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setChartHistory((prev) => {
        const newLabels = [...prev.labels, now].slice(-30);
        return {
          labels: newLabels,
          bitcoin: [...prev.bitcoin, data.bitcoin.usd].slice(-30),
          ethereum: [...prev.ethereum, data.ethereum.usd].slice(-30),
          solana: [...prev.solana, data.solana.usd].slice(-30),
        };
      });
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("crypto-update");
    };
  }, []);

  const theme = darkMode
    ? {
        bg: "#0f172a",
        text: "#f8fafc",
        card: "#1e293b",
        cardBorder: "#334155",
        grid: "#334155",
        footerText: "#94a3b8",
      }
    : {
        bg: "#f1f5f9",
        text: "#0f172a",
        card: "#ffffff",
        cardBorder: "#e2e8f0",
        grid: "#e2e8f0",
        footerText: "#64748b",
      };

  const coinColors = {
    bitcoin: { border: "#f59e0b", bg: "rgba(245, 158, 11, " },
    ethereum: { border: "#6366f1", bg: "rgba(99, 102, 241, " },
    solana: { border: "#14b8a6", bg: "rgba(20, 184, 166, " },
  };

  const activeColor = coinColors[selectedCoin];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: theme.card,
        titleColor: theme.text,
        bodyColor: theme.text,
        borderColor: theme.cardBorder,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? "#94a3b8" : "#64748b", maxRotation: 0 },
      },
      y: {
        position: "right",
        grid: { color: theme.grid, borderDash: [5, 5] },
        ticks: { color: darkMode ? "#94a3b8" : "#64748b" },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  const chartData = {
    labels: chartHistory.labels,
    datasets: [
      {
        fill: true,
        label: selectedCoin.toUpperCase(),
        data: chartHistory[selectedCoin],
        borderColor: activeColor.border,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, activeColor.bg + "0.5)");
          gradient.addColorStop(1, activeColor.bg + "0)");
          return gradient;
        },
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 8,
      },
    ],
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: theme.bg,
        color: theme.text,
      }}
    >
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <div style={styles.logoArea}>
            <div style={{ ...styles.iconBox, background: activeColor.border }}>
              📊
            </div>
            <div>
              <h1 style={styles.title}>Crypto Analytics Pro</h1>
              <p style={styles.subtitle}>Dashboard Full-Screen</p>
            </div>
          </div>

          <div style={styles.controls}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                ...styles.themeBtn,
                borderColor: theme.cardBorder,
                color: theme.text,
              }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <span
              style={{
                ...styles.statusBadge,
                backgroundColor: isConnected
                  ? "rgba(74, 222, 128, 0.1)"
                  : "rgba(248, 113, 113, 0.1)",
                color: isConnected ? "#4ade80" : "#f87171",
                borderColor: isConnected ? "#4ade80" : "#f87171",
              }}
            >
              {isConnected ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
        </header>

        {!currentData ? (
          <div style={styles.loading}>
            <p>Sincronizando dados...</p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              <Card
                title="Bitcoin"
                symbol="BTC"
                price={currentData.bitcoin.usd}
                change={currentData.bitcoin.usd_24h_change}
                theme={theme}
                isActive={selectedCoin === "bitcoin"}
                onClick={() => setSelectedCoin("bitcoin")}
                accentColor={coinColors.bitcoin.border}
              />
              <Card
                title="Ethereum"
                symbol="ETH"
                price={currentData.ethereum.usd}
                change={currentData.ethereum.usd_24h_change}
                theme={theme}
                isActive={selectedCoin === "ethereum"}
                onClick={() => setSelectedCoin("ethereum")}
                accentColor={coinColors.ethereum.border}
              />
              <Card
                title="Solana"
                symbol="SOL"
                price={currentData.solana.usd}
                change={currentData.solana.usd_24h_change}
                theme={theme}
                isActive={selectedCoin === "solana"}
                onClick={() => setSelectedCoin("solana")}
                accentColor={coinColors.solana.border}
              />
            </div>

            <div
              style={{
                ...styles.chartCard,
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              }}
            >
              <div style={styles.chartHeader}>
                <h3
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  Tendência:
                  <span style={{ color: activeColor.border }}>
                    {selectedCoin.charAt(0).toUpperCase() +
                      selectedCoin.slice(1)}
                  </span>
                </h3>
              </div>
              <div style={styles.chartContainer}>
                <Line options={chartOptions} data={chartData} />
              </div>
            </div>
          </>
        )}

        {/* --- NOVIDADE 2: FOOTER --- */}
        <footer
          style={{
            ...styles.footer,
            color: theme.footerText,
            borderColor: theme.cardBorder,
          }}
        >
          <p>
            Desenvolvido por <strong>Rafael Fassina</strong> |
            <a
              href="https://www.linkedin.com/in/rafael-fassina-285316302"
              target="_blank"
              style={{
                color: theme.text,
                marginLeft: "5px",
                textDecoration: "none",
              }}
            >
              LinkedIn
            </a>
          </p>
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            Dados via CoinGecko API
          </span>
        </footer>
      </div>
    </div>
  );
}

/**
 * Card component to display cryptocurrency statistics.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.title - The name of the cryptocurrency (e.g., "Bitcoin").
 * @param {string} props.symbol - The symbol of the cryptocurrency (e.g., "BTC").
 * @param {number} props.price - The current price of the cryptocurrency in USD.
 * @param {number} props.change - The 24-hour price change percentage.
 * @param {Object} props.theme - The current theme object (containing colors for bg, text, card, etc.).
 * @param {boolean} props.isActive - Whether this card is currently selected/active.
 * @param {function} props.onClick - Handler function called when the card is clicked.
 * @param {string} props.accentColor - The accent color associated with the cryptocurrency.
 * @returns {JSX.Element} The rendered card component.
 */
const Card = ({
  title,
  symbol,
  price,
  change,
  theme,
  isActive,
  onClick,
  accentColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.statCard,
        backgroundColor: theme.card,
        borderColor: isActive || isHovered ? accentColor : theme.cardBorder,
        borderWidth: isActive ? "2px" : "1px",
        cursor: "pointer",
        transform: isActive || isHovered ? "translateY(-5px)" : "none",
        boxShadow: isHovered
          ? `0 10px 20px -5px ${accentColor}30`
          : "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "15px",
        }}
      >
        <span
          style={{ fontWeight: "600", color: theme.text, fontSize: "1.1rem" }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: "0.8rem",
            opacity: 0.6,
            padding: "4px 8px",
            borderRadius: "6px",
            background: "rgba(128,128,128,0.1)",
          }}
        >
          {symbol}
        </span>
      </div>
      <div
        style={{
          fontSize: "2.2rem",
          fontWeight: "700",
          marginBottom: "10px",
          letterSpacing: "-1px",
        }}
      >
        ${price.toLocaleString()}
      </div>
      <div
        style={{
          color: change >= 0 ? "#4ade80" : "#f87171",
          fontSize: "0.95rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    transition: "background-color 0.3s ease, color 0.3s ease",
    padding: "40px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
  },
  wrapper: {
    width: "100%",
    margin: "0 auto",
    flex: 1, // Faz o conteúdo empurrar o footer para baixo
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  logoArea: { display: "flex", alignItems: "center", gap: "15px" },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    color: "#fff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    transition: "background 0.3s",
  },
  title: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  subtitle: { margin: 0, fontSize: "0.9rem", opacity: 0.5 },
  controls: { display: "flex", alignItems: "center", gap: "15px" },
  themeBtn: {
    background: "transparent",
    border: "1px solid",
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    transition: "all 0.2s",
  },
  statusBadge: {
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "700",
    border: "1px solid",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
    marginBottom: "30px",
    width: "100%",
  },
  statCard: {
    padding: "30px",
    borderRadius: "24px",
    border: "1px solid",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  chartCard: {
    padding: "30px",
    borderRadius: "24px",
    border: "1px solid",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    height: "600px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  chartHeader: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
    minHeight: "0",
    overflow: "hidden",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
    fontSize: "1.5rem",
    opacity: 0.5,
    fontWeight: "500",
  },

  // ESTILO DO NOVO FOOTER
  footer: {
    marginTop: "50px",
    paddingTop: "20px",
    borderTop: "1px solid",
    textAlign: "center",
    fontSize: "0.9rem",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};

export default App;
