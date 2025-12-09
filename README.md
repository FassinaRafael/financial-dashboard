# Crypto Analytics Pro

A full-stack real-time cryptocurrency dashboard application. It consists of a React frontend and a Node.js/Express backend that fetches price data from the CoinGecko API and broadcasts it via Socket.io.

## Features

- **Real-time Price Updates**: Live prices for Bitcoin, Ethereum, and Solana.
- **Interactive Charts**: Historical price charts using Chart.js.
- **Theme Support**: Toggle between Dark and Light modes.
- **Connectivity Status**: Visual indicator of WebSocket connection status.
- **Responsive Design**: Optimized for various screen sizes.

## Technologies Used

- **Frontend**: React, Vite, Chart.js, Socket.io Client
- **Backend**: Node.js, Express, Socket.io, Axios

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

## Running the Project

You need to run both the server and the client concurrently.

1.  **Start the Backend Server:**
    Open a terminal and run:
    ```bash
    cd server
    node index.js
    ```
    The server will start on port 3001 (or the port defined in `PORT` env var).

2.  **Start the Frontend Application:**
    Open a *new* terminal window and run:
    ```bash
    cd client
    npm run dev
    ```
    The application will usually be available at `http://localhost:5173`.

## Project Structure

- `client/`: React frontend application source code.
  - `src/App.jsx`: Main dashboard component.
  - `src/main.jsx`: Entry point.
- `server/`: Node.js backend source code.
  - `index.js`: Server entry point with Socket.io setup.
