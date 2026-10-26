const axios = require('axios');

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

function shouldUseMockData() {
  return String(process.env.USE_MOCK_DATA || '').toLowerCase() === 'true';
}

const mockMarketList = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 67200,
    price_change_percentage_24h: 2.3,
    market_cap: 1320000000000,
    total_volume: 58000000000,
    circulating_supply: 19600000,
    total_supply: 21000000,
    market_cap_rank: 1,
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3480,
    price_change_percentage_24h: 1.8,
    market_cap: 418000000000,
    total_volume: 32000000000,
    circulating_supply: 120000000,
    total_supply: null,
    market_cap_rank: 2,
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 154.2,
    price_change_percentage_24h: 3.1,
    market_cap: 71000000000,
    total_volume: 3200000000,
    circulating_supply: 460000000,
    total_supply: null,
    market_cap_rank: 5,
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    current_price: 0.62,
    price_change_percentage_24h: 1.4,
    market_cap: 35000000000,
    total_volume: 2200000000,
    circulating_supply: 56000000000,
    total_supply: 100000000000,
    market_cap_rank: 6,
  },
  {
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    current_price: 0.15,
    price_change_percentage_24h: 2.7,
    market_cap: 22000000000,
    total_volume: 1600000000,
    circulating_supply: 145000000000,
    total_supply: null,
    market_cap_rank: 8,
  },
  {
    id: 'tether',
    symbol: 'usdt',
    name: 'Tether',
    image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    current_price: 1,
    price_change_percentage_24h: 0.02,
    market_cap: 112000000000,
    total_volume: 41000000000,
    circulating_supply: 112000000000,
    total_supply: null,
    market_cap_rank: 3,
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    current_price: 589,
    price_change_percentage_24h: 0.8,
    market_cap: 88000000000,
    total_volume: 1500000000,
    circulating_supply: 149000000,
    total_supply: 200000000,
    market_cap_rank: 4,
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    current_price: 0.7,
    price_change_percentage_24h: 1.1,
    market_cap: 25000000000,
    total_volume: 900000000,
    circulating_supply: 35000000000,
    total_supply: 45000000000,
    market_cap_rank: 7,
  },
];

const mockCoinDetails = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: {
    large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
  },
  description: {
    en: 'Bitcoin is a decentralized digital currency without a central bank or single administrator.',
  },
  market_data: {
    current_price: { usd: 67200 },
    market_cap: { usd: 1320000000000 },
    total_volume: { usd: 58000000000 },
    high_24h: { usd: 68250 },
    low_24h: { usd: 65500 },
    circulating_supply: 19600000,
    total_supply: 21000000,
    max_supply: 21000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.3,
    price_change_percentage_7d: 5.1,
    price_change_percentage_30d: 12.4,
    price_change_percentage_1y: 38.9,
  },
};

const mockCoinDetailsById = {
  bitcoin: mockCoinDetails,
  ethereum: {
    ...mockCoinDetails,
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: {
      large: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
    },
    description: { en: 'Ethereum is a decentralized platform enabling smart contracts and decentralized applications.' },
    market_data: {
      current_price: { usd: 3480 },
      market_cap: { usd: 418000000000 },
      total_volume: { usd: 32000000000 },
      high_24h: { usd: 3560 },
      low_24h: { usd: 3380 },
      circulating_supply: 120000000,
      total_supply: null,
      max_supply: null,
      market_cap_rank: 2,
      price_change_percentage_24h: 1.8,
      price_change_percentage_7d: 4.5,
      price_change_percentage_30d: 11.1,
      price_change_percentage_1y: 65.5,
    },
  },
  solana: {
    ...mockCoinDetails,
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: {
      large: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      thumb: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
    },
    description: { en: 'Solana is a high-performance blockchain designed for decentralized applications and crypto projects.' },
    market_data: {
      current_price: { usd: 154.2 },
      market_cap: { usd: 71000000000 },
      total_volume: { usd: 3200000000 },
      high_24h: { usd: 160.5 },
      low_24h: { usd: 149.7 },
      circulating_supply: 460000000,
      total_supply: null,
      max_supply: null,
      market_cap_rank: 5,
      price_change_percentage_24h: 3.1,
      price_change_percentage_7d: 7.2,
      price_change_percentage_30d: 18.8,
      price_change_percentage_1y: 120.3,
    },
  },
};

const mockChartData = {
  prices: [
    [1725000000000, 66000],
    [1725003600000, 66500],
    [1725007200000, 66800],
  ],
  market_caps: [
    [1725000000000, 1300000000000],
    [1725003600000, 1310000000000],
    [1725007200000, 1320000000000],
  ],
  total_volumes: [
    [1725000000000, 55000000000],
    [1725003600000, 57000000000],
    [1725007200000, 58000000000],
  ],
};

const mockChartDataById = {
  bitcoin: mockChartData,
  ethereum: {
    prices: [[1725000000000, 3380], [1725003600000, 3430], [1725007200000, 3480]],
    market_caps: [[1725000000000, 395000000000], [1725003600000, 410000000000], [1725007200000, 418000000000]],
    total_volumes: [[1725000000000, 30000000000], [1725003600000, 31500000000], [1725007200000, 32000000000]],
  },
  solana: {
    prices: [[1725000000000, 142], [1725003600000, 149], [1725007200000, 154.2]],
    market_caps: [[1725000000000, 67000000000], [1725003600000, 69000000000], [1725007200000, 71000000000]],
    total_volumes: [[1725000000000, 2600000000], [1725003600000, 2900000000], [1725007200000, 3200000000]],
  },
};

const mockGlobalStats = {
  data: {
    total_market_cap: { usd: 2500000000000 },
    total_volume: { usd: 98000000000 },
    active_cryptocurrencies: 4200,
    markets: 512,
    market_cap_percentage: { btc: 53.2, eth: 18.7 },
    market_cap_change_percentage_24h_usd: 1.4,
  },
};

const mockSearchResults = {
  coins: [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'btc',
      thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
      market_cap_rank: 1,
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'eth',
      thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
      market_cap_rank: 2,
    },
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'sol',
      thumb: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
      market_cap_rank: 5,
    },
    {
      id: 'ripple',
      name: 'XRP',
      symbol: 'xrp',
      thumb: 'https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png',
      market_cap_rank: 6,
    },
    {
      id: 'dogecoin',
      name: 'Dogecoin',
      symbol: 'doge',
      thumb: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png',
      market_cap_rank: 8,
    },
    {
      id: 'binancecoin',
      name: 'BNB',
      symbol: 'bnb',
      thumb: 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png',
      market_cap_rank: 4,
    },
  ],
};

function ensureApiConfiguration() {
  if (!process.env.COINGECKO_API_KEY && !shouldUseMockData()) {
    const error = new Error('CoinGecko API key is not configured');
    error.statusCode = 500;
    error.code = 'MISSING_API_KEY';
    throw error;
  }
}

function buildClient() {
  const headers = {
    Accept: 'application/json',
  };

  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
  }

  return axios.create({
    baseURL: API_BASE_URL,
    timeout: Number(process.env.REQUEST_TIMEOUT_MS || 15000),
    headers,
  });
}

function normalizeCoinGeckoError(error) {
  const status = error.response?.status;

  if (status === 401) {
    const apiError = new Error('CoinGecko authentication failed');
    apiError.statusCode = 401;
    apiError.code = 'AUTH_FAILED';
    throw apiError;
  }

  if (status === 404) {
    const apiError = new Error('Coin not found');
    apiError.statusCode = 404;
    apiError.code = 'COIN_NOT_FOUND';
    throw apiError;
  }

  if (status === 429) {
    const apiError = new Error('CoinGecko rate limit exceeded');
    apiError.statusCode = 429;
    apiError.code = 'RATE_LIMITED';
    throw apiError;
  }

  if (status === 500 || status === 502 || status === 503) {
    const apiError = new Error('CoinGecko service unavailable');
    apiError.statusCode = status || 503;
    apiError.code = 'COINGECKO_API_ERROR';
    throw apiError;
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || /timeout/i.test(error.message || '')) {
    const apiError = new Error('CoinGecko request timed out');
    apiError.statusCode = 504;
    apiError.code = 'COINGECKO_TIMEOUT';
    throw apiError;
  }

  const apiError = new Error('Unable to fetch cryptocurrency data');
  apiError.statusCode = 502;
  apiError.code = 'COINGECKO_API_ERROR';
  throw apiError;
}

async function withCoinGeckoRequest(request) {
  ensureApiConfiguration();
  const client = buildClient();

  try {
    return await request(client);
  } catch (error) {
    normalizeCoinGeckoError(error);
  }
}

async function fetchMarketList({ currency = 'usd', page = 1, perPage = 50, order = 'market_cap_desc' }) {
  if (shouldUseMockData()) {
    return mockMarketList.slice(0, Number(perPage) || 50);
  }

  return withCoinGeckoRequest(async (client) => {
    const parsedPage = Number(page) || 1;
    const parsedPerPage = Number(perPage) || 50;
    const safePerPage = Math.min(Math.max(parsedPerPage, 1), 100);
    const normalizedCurrency = String(currency || 'usd').toLowerCase();
    const normalizedOrder = String(order || 'market_cap_desc');

    const { data } = await client.get('/coins/markets', {
      params: {
        vs_currency: normalizedCurrency,
        page: parsedPage,
        per_page: safePerPage,
        order: normalizedOrder,
        sparkline: false,
        locale: 'en',
      },
    });

    return data;
  });
}

async function fetchCoinDetails(id) {
  if (shouldUseMockData()) {
    return mockCoinDetailsById[String(id || '').toLowerCase()] || mockCoinDetails;
  }

  return withCoinGeckoRequest(async (client) => {
    const { data } = await client.get(`/coins/${encodeURIComponent(id)}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    });

    return data;
  });
}

async function fetchCoinChart(id, days, currency = 'usd') {
  if (shouldUseMockData()) {
    return mockChartDataById[String(id || '').toLowerCase()] || mockChartData;
  }

  return withCoinGeckoRequest(async (client) => {
    const daysValue = Number(days) || 7;
    const normalizedCurrency = String(currency || 'usd').toLowerCase();

    const { data } = await client.get(`/coins/${encodeURIComponent(id)}/market_chart`, {
      params: {
        vs_currency: normalizedCurrency,
        days: daysValue,
        interval: 'daily',
      },
    });

    return data;
  });
}

async function fetchGlobalMarketStats() {
  if (shouldUseMockData()) {
    return mockGlobalStats;
  }

  return withCoinGeckoRequest(async (client) => {
    const { data } = await client.get('/global');
    return data;
  });
}

async function searchCoins(query) {
  if (shouldUseMockData()) {
    return mockSearchResults;
  }

  return withCoinGeckoRequest(async (client) => {
    const { data } = await client.get('/search', {
      params: {
        query: String(query || '').trim(),
      },
    });

    return data;
  });
}

module.exports = {
  fetchMarketList,
  fetchCoinDetails,
  fetchCoinChart,
  fetchGlobalMarketStats,
  searchCoins,
};
