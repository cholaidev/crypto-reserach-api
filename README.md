# Crypto Research API

A Node.js + Express backend for a Flutter cryptocurrency market research application. It wraps CoinGecko's public market, metadata, search, and chart APIs and exposes a stable JSON API suitable for Dio-based Flutter clients.

## Features

- Health endpoint for status checks
- Coin market list with pagination and sorting
- Coin detail lookup
- Historical price, volume, and market cap charts
- Global market statistics
- Coin search by name or symbol
- Centralized error handling
- In-memory cache for repeated reads
- Request timeout and validation safeguards
- Server-side CoinGecko API key handling

## Prerequisites

- Node.js 18 or later
- npm
- Optional: a CoinGecko demo API key
- Optional: set `USE_MOCK_DATA=true` to run without a key

## Installation

1. Clone the project and open the repository folder.
2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file:

```bash
cp .env.example .env
```

4. Add your CoinGecko demo API key in `.env` if you have one:

```env
PORT=3000
NODE_ENV=development
COINGECKO_API_KEY=your_demo_api_key_here
USE_MOCK_DATA=false
CACHE_TTL_SECONDS=60
REQUEST_TIMEOUT_MS=15000
```

If you do not have a key, set:

```env
USE_MOCK_DATA=true
```

This keeps the backend running locally with sample crypto data while preserving the live CoinGecko path when a real key is provided.

## Running the API

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API listens on:

```text
http://localhost:3000
```

## Base path

All endpoints are mounted under `/api`.

## API endpoints

### 1) Health check

Request:

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "message": "Crypto Research API is healthy",
    "timestamp": "2026-10-24T11:12:29.954Z"
  }
}
```

### 2) Market list

Request:

```bash
curl "http://localhost:3000/api/coins?currency=usd&page=1&perPage=10&order=market_cap_desc"
```

Response shape:

```json
{
  "success": true,
  "data": [
    {
      "id": "bitcoin",
      "name": "Bitcoin",
      "symbol": "btc",
      "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      "current_price": 67123,
      "price_change_percentage_24h": 2.5,
      "market_cap": 1300000000000,
      "total_volume": 56000000000,
      "circulating_supply": 19000000,
      "total_supply": 21000000,
      "market_cap_rank": 1
    }
  ]
}
```

Supported query parameters:

- `currency`: default `usd`
- `page`: default `1`
- `perPage`: default `50`, max `100`
- `order`: default `market_cap_desc`

### 3) Coin details

Request:

```bash
curl http://localhost:3000/api/coins/bitcoin
```

Response shape:

```json
{
  "success": true,
  "data": {
    "id": "bitcoin",
    "name": "Bitcoin",
    "symbol": "btc",
    "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    "description": "Bitcoin is a decentralized digital currency ...",
    "current_price": 67000,
    "market_cap": 1300000000000,
    "total_volume": 50000000000,
    "high_24h": 68000,
    "low_24h": 65000,
    "circulating_supply": 19000000,
    "total_supply": 21000000,
    "max_supply": 21000000,
    "market_cap_rank": 1,
    "price_change_percentage_24h": 2.2,
    "price_change_percentage_7d": 5.4,
    "price_change_percentage_30d": 9.1,
    "price_change_percentage_1y": 33.5
  }
}
```

### 4) Historical chart

Request:

```bash
curl "http://localhost:3000/api/coins/bitcoin/chart?days=7&currency=usd"
```

Supported ranges: `1`, `7`, `30`, `90`, `365`.

Response shape:

```json
{
  "success": true,
  "data": {
    "prices": [[1720000000000, 67000], [1720000900000, 67250]],
    "market_caps": [[1720000000000, 1300000000000]],
    "total_volumes": [[1720000000000, 50000000000]]
  }
}
```

Invalid ranges return a 400 response with a clear error code like:

```json
{
  "success": false,
  "message": "Unsupported chart range. Supported values: 1, 7, 30, 90, 365",
  "code": "INVALID_CHART_DAYS"
}
```

### 5) Global market statistics

Request:

```bash
curl http://localhost:3000/api/market/global
```

Response shape:

```json
{
  "success": true,
  "data": {
    "total_market_cap": 2460000000000,
    "total_volume": 98000000000,
    "active_cryptocurrencies": 4200,
    "markets": 512,
    "market_cap_percentage": {
      "btc": 53.2,
      "eth": 18.7
    },
    "market_cap_change_percentage_24h_usd": 1.4
  }
}
```

### 6) Coin search

Request:

```bash
curl "http://localhost:3000/api/coins/search?q=bitcoin"
```

The server also accepts the common alias `query`:

```bash
curl "http://localhost:3000/api/coins/search?query=bitcoin"
```

Response shape:

```json
{
  "success": true,
  "data": [
    {
      "id": "bitcoin",
      "name": "Bitcoin",
      "symbol": "btc",
      "image": "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
      "market_cap_rank": 1
    }
  ]
}
```

Empty queries return 400:

```json
{
  "success": false,
  "message": "Search query is required",
  "code": "INVALID_SEARCH_QUERY"
}
```

## Error contract

The API returns a consistent JSON error envelope:

```json
{
  "success": false,
  "message": "Unable to fetch cryptocurrency data",
  "code": "COINGECKO_API_ERROR"
}
```

Common safe errors include:

- `MISSING_API_KEY`
- `AUTH_FAILED`
- `RATE_LIMITED`
- `COIN_NOT_FOUND`
- `INVALID_CHART_DAYS`
- `INVALID_SEARCH_QUERY`
- `COINGECKO_TIMEOUT`

## Testing

Run the automated test suite:

```bash
npm test
```

Run syntax checks:

```bash
npm run lint
```

## Flutter integration

### Android emulator

For a Flutter app running in the Android emulator, use:

```text
http://10.0.2.2:3000/api
```

This special address routes the emulator to your host machine.

### Physical Android device on the same local network

Use your development machine's local LAN IP address:

```text
http://192.168.1.25:3000/api
```

Example in Flutter:

```dart
final dio = Dio(BaseOptions(
  baseUrl: 'http://192.168.1.25:3000/api',
  connectTimeout: const Duration(seconds: 15),
  receiveTimeout: const Duration(seconds: 15),
));
```

If the device cannot connect, ensure:

- The local machine is not blocking port 3000
- Both devices are on the same Wi-Fi network
- Your firewall is configured to allow local traffic on port 3000
- Your phone and laptop are on the same subnet when testing a local network setup

## Postman or curl examples

### Read health status

```bash
curl http://localhost:3000/api/health
```

### Fetch market list

```bash
curl "http://localhost:3000/api/coins?currency=usd&page=1&perPage=10&order=market_cap_desc"
```

### Fetch coin data

```bash
curl http://localhost:3000/api/coins/bitcoin
```

### Fetch chart data

```bash
curl "http://localhost:3000/api/coins/bitcoin/chart?days=30&currency=usd"
```

### Fetch global market data

```bash
curl http://localhost:3000/api/market/global
```

### Search coins

```bash
curl "http://localhost:3000/api/coins/search?q=bitcoin"
```

Alias also supported:

```bash
curl "http://localhost:3000/api/coins/search?query=bitcoin"
```

## Troubleshooting

### Missing API key

If you see a `MISSING_API_KEY` error, update your `.env` file and restart the server:

```bash
cp .env.example .env
```

Then set:

```env
COINGECKO_API_KEY=your_demo_api_key_here
```

### Rate limit errors

If the API responds with `429`, the upstream CoinGecko service has rate-limited the request. Reduce request frequency and rely on caching.

### Timeouts

If requests time out, increase `REQUEST_TIMEOUT_MS` in `.env`:

```env
REQUEST_TIMEOUT_MS=20000
```

### Connection refused from Flutter app

Check:

- The server is running
- The port is correct
- The emulator/device is using the right address (`10.0.2.2` or LAN IP)
- Your firewall allows traffic on port 3000

## Project structure

```text
.
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── controllers/
│   │   ├── coins.controller.js
│   │   └── health.controller.js
│   ├── middleware/
│   │   └── error.middleware.js
│   ├── routes/
│   │   ├── coins.routes.js
│   │   ├── health.routes.js
│   │   └── market.routes.js
│   ├── services/
│   │   └── coingecko.service.js
│   └── utils/
│       └── cache.js
└── test/
    └── api.test.js
```

## Notes

- The backend never exposes the CoinGecko API key to clients.
- All external API requests are made server-side.
- The app uses a lightweight in-memory cache to reduce duplicate reads.
- Production responses hide internal error details while still returning safe public messages.
