const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const axios = require('axios');

function clearModuleCache() {
  const modules = [
    '../src/app',
    '../src/server',
    '../src/controllers/health.controller',
    '../src/controllers/coins.controller',
    '../src/routes/health.routes',
    '../src/routes/coins.routes',
    '../src/routes/market.routes',
    '../src/services/coingecko.service',
    '../src/utils/cache',
    '../src/middleware/error.middleware',
  ];

  for (const modulePath of modules) {
    delete require.cache[require.resolve(modulePath)];
  }
}

function loadApp(envOverrides = {}) {
  const originalEnv = { ...process.env };
  process.env.PORT = '3000';
  process.env.NODE_ENV = 'test';
  process.env.COINGECKO_API_KEY = 'demo-api-key';
  process.env.USE_MOCK_DATA = 'false';
  process.env.CACHE_TTL_SECONDS = '60';
  process.env.REQUEST_TIMEOUT_MS = '15000';

  Object.assign(process.env, envOverrides);
  clearModuleCache();
  const app = require('../src/app');

  return {
    app,
    restore() {
      for (const key of Object.keys(process.env)) {
        if (!(key in originalEnv)) {
          delete process.env[key];
        }
      }
      Object.assign(process.env, originalEnv);
      clearModuleCache();
    },
  };
}

function mockCoinGecko({ market, coin, chart, globalStats, searchResults }) {
  const originalCreate = axios.create;
  axios.create = () => ({
    async get(url, config = {}) {
      if (url === '/coins/markets') {
        return { data: market };
      }
      if (url === '/coins/bitcoin') {
        return { data: coin };
      }
      if (url === '/coins/bitcoin/market_chart') {
        return { data: chart };
      }
      if (url === '/global') {
        return { data: globalStats };
      }
      if (url === '/search') {
        return { data: searchResults };
      }
      throw new Error(`Unhandled URL: ${url}`);
    },
  });

  return () => {
    axios.create = originalCreate;
  };
}

test('GET /api/health returns api status', async () => {
  const { app, restore } = loadApp();
  try {
    const response = await request(app).get('/api/health');
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, 'ok');
  } finally {
    restore();
  }
});

test('GET /api/coins returns successful market list', async () => {
  const restoreMock = mockCoinGecko({
    market: [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'btc',
        image: 'https://example.com/btc.png',
        current_price: 67123,
        price_change_percentage_24h: 2.5,
        market_cap: 1300000000000,
        total_volume: 56000000000,
        circulating_supply: 19000000,
        total_supply: 21000000,
        market_cap_rank: 1,
      },
    ],
  });

  const { app, restore } = loadApp();
  try {
    const response = await request(app).get('/api/coins?currency=usd&page=1&perPage=10&order=market_cap_desc');
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data[0].id, 'bitcoin');
    assert.equal(response.body.data[0].current_price, 67123);
  } finally {
    restore();
    restoreMock();
  }
});

test('GET /api/coins/:id returns coin details', async () => {
  const restoreMock = mockCoinGecko({
    coin: {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'btc',
      image: { large: 'https://example.com/bitcoin.png' },
      description: { en: 'Bitcoin description' },
      market_data: {
        current_price: { usd: 67000 },
        market_cap: { usd: 1300000000000 },
        total_volume: { usd: 50000000000 },
        high_24h: { usd: 68000 },
        low_24h: { usd: 65000 },
        circulating_supply: 19000000,
        total_supply: 21000000,
        max_supply: 21000000,
        market_cap_rank: 1,
        price_change_percentage_24h: 2.2,
        price_change_percentage_7d: 5.4,
        price_change_percentage_30d: 9.1,
        price_change_percentage_1y: 33.5,
      },
    },
  });

  const { app, restore } = loadApp();
  try {
    const response = await request(app).get('/api/coins/bitcoin');
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.name, 'Bitcoin');
    assert.equal(response.body.data.current_price, 67000);
    assert.equal(response.body.data.description, 'Bitcoin description');
  } finally {
    restore();
    restoreMock();
  }
});

test('GET /api/coins/:id/chart validates unsupported day ranges', async () => {
  const { app, restore } = loadApp();
  try {
    const response = await request(app).get('/api/coins/bitcoin/chart?days=15');
    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.code, 'INVALID_CHART_DAYS');
  } finally {
    restore();
  }
});

test('GET /api/coins/search accepts query alias', async () => {
  const restoreMock = mockCoinGecko({
    searchResults: {
      coins: [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'btc',
          thumb: 'https://example.com/btc-thumb.png',
          market_cap_rank: 1,
        },
      ],
    },
  });

  const { app, restore } = loadApp();
  try {
    const response = await request(app).get('/api/coins/search?query=bitcoin');
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data[0].id, 'bitcoin');
  } finally {
    restore();
    restoreMock();
  }
});

test('GET /api/coins/search rejects empty queries', async () => {
  const { app, restore } = loadApp();
  try {
    const response = await request(app).get('/api/coins/search?q=');
    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.code, 'INVALID_SEARCH_QUERY');
  } finally {
    restore();
  }
});

test('GET /api/coins handles upstream API failures', async () => {
  const restoreMock = mockCoinGecko({
    market: [],
  });
  const { app, restore } = loadApp();

  const axiosInstance = require('axios');
  const originalCreate = axiosInstance.create;
  axiosInstance.create = () => ({
    async get() {
      const error = new Error('Upstream failure');
      error.response = {
        status: 503,
        data: { error: 'service unavailable' },
      };
      throw error;
    },
  });

  try {
    const response = await request(app).get('/api/coins');
    assert.equal(response.status, 503);
    assert.equal(response.body.success, false);
    assert.equal(response.body.code, 'COINGECKO_API_ERROR');
  } finally {
    axiosInstance.create = originalCreate;
    restore();
    restoreMock();
  }
});

test('GET /api/coins handles rate limit responses', async () => {
  const { app, restore } = loadApp();
  const axiosInstance = require('axios');
  const originalCreate = axiosInstance.create;

  axiosInstance.create = () => ({
    async get() {
      const error = new Error('Rate limited');
      error.response = {
        status: 429,
        data: { error: 'too many requests' },
      };
      throw error;
    },
  });

  try {
    const response = await request(app).get('/api/coins');
    assert.equal(response.status, 429);
    assert.equal(response.body.success, false);
    assert.equal(response.body.code, 'RATE_LIMITED');
  } finally {
    axiosInstance.create = originalCreate;
    restore();
  }
});

test('GET /api/coins returns 500 when CoinGecko key is missing', async () => {
  const { app, restore } = loadApp({ COINGECKO_API_KEY: '' });
  try {
    const response = await request(app).get('/api/coins');
    assert.equal(response.status, 500);
    assert.equal(response.body.success, false);
    assert.equal(response.body.code, 'MISSING_API_KEY');
  } finally {
    restore();
  }
});
