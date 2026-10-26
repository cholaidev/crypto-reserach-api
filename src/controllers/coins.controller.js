const {
  fetchMarketList,
  fetchCoinDetails,
  fetchCoinChart,
  searchCoins,
  fetchGlobalMarketStats,
} = require('../services/coingecko.service');
const cache = require('../utils/cache');

const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 60);

function normalizeMarketCoin(coin) {
  return {
    id: coin.id || null,
    name: coin.name || null,
    symbol: coin.symbol || null,
    image: coin.image || null,
    current_price: coin.current_price ?? null,
    price_change_percentage_24h: coin.price_change_percentage_24h ?? null,
    market_cap: coin.market_cap ?? null,
    total_volume: coin.total_volume ?? null,
    circulating_supply: coin.circulating_supply ?? null,
    total_supply: coin.total_supply ?? null,
    market_cap_rank: coin.market_cap_rank ?? null,
  };
}

function normalizeCoinDetails(coin) {
  const marketData = coin.market_data || {};
  return {
    id: coin.id || null,
    name: coin.name || null,
    symbol: coin.symbol || null,
    image: coin.image?.large || coin.image?.thumb || null,
    description: coin.description?.en || '',
    current_price: marketData.current_price?.usd ?? null,
    market_cap: marketData.market_cap?.usd ?? null,
    total_volume: marketData.total_volume?.usd ?? null,
    high_24h: marketData.high_24h?.usd ?? null,
    low_24h: marketData.low_24h?.usd ?? null,
    circulating_supply: marketData.circulating_supply ?? null,
    total_supply: marketData.total_supply ?? null,
    max_supply: marketData.max_supply ?? null,
    market_cap_rank: marketData.market_cap_rank ?? null,
    price_change_percentage_24h: marketData.price_change_percentage_24h ?? null,
    price_change_percentage_7d: marketData.price_change_percentage_7d ?? null,
    price_change_percentage_30d: marketData.price_change_percentage_30d ?? null,
    price_change_percentage_1y: marketData.price_change_percentage_1y ?? null,
  };
}

async function getMarketList(req, res, next) {
  try {
    const currency = String(req.query.currency || 'usd').toLowerCase();
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.perPage || 50);
    const order = String(req.query.order || 'market_cap_desc');

    if (!Number.isInteger(page) || page < 1) {
      const error = new Error('Query parameter "page" must be a positive integer');
      error.statusCode = 400;
      error.code = 'INVALID_PAGE';
      throw error;
    }

    if (!Number.isInteger(perPage) || perPage < 1 || perPage > 100) {
      const error = new Error('Query parameter "perPage" must be between 1 and 100');
      error.statusCode = 400;
      error.code = 'INVALID_PER_PAGE';
      throw error;
    }

    const cacheKey = `market:${currency}:${page}:${perPage}:${order}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const data = await fetchMarketList({ currency, page, perPage, order });
    const normalized = data.map(normalizeMarketCoin);
    cache.set(cacheKey, normalized, CACHE_TTL_SECONDS);

    return res.json({ success: true, data: normalized });
  } catch (error) {
    return next(error);
  }
}

async function getCoinDetails(req, res, next) {
  try {
    const { id } = req.params;
    const cacheKey = `coin:${id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const data = await fetchCoinDetails(id);
    const normalized = normalizeCoinDetails(data);
    cache.set(cacheKey, normalized, CACHE_TTL_SECONDS);

    return res.json({ success: true, data: normalized });
  } catch (error) {
    if (error.response?.status === 404) {
      const HttpError = new Error('Coin not found');
      HttpError.statusCode = 404;
      HttpError.code = 'COIN_NOT_FOUND';
      return next(HttpError);
    }
    return next(error);
  }
}

async function getHistoricalChart(req, res, next) {
  try {
    const { id } = req.params;
    const days = Number(req.query.days ?? 7);
    const currency = String(req.query.currency || 'usd').toLowerCase();
    const supportedDays = [1, 7, 30, 90, 365];

    if (!supportedDays.includes(days)) {
      const error = new Error('Unsupported chart range. Supported values: 1, 7, 30, 90, 365');
      error.statusCode = 400;
      error.code = 'INVALID_CHART_DAYS';
      throw error;
    }

    const cacheKey = `chart:${id}:${days}:${currency}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const data = await fetchCoinChart(id, days, currency);
    const normalized = {
      prices: data.prices || [],
      market_caps: data.market_caps || [],
      total_volumes: data.total_volumes || [],
    };

    cache.set(cacheKey, normalized, CACHE_TTL_SECONDS);
    return res.json({ success: true, data: normalized });
  } catch (error) {
    if (error.response?.status === 404) {
      const HttpError = new Error('Coin not found');
      HttpError.statusCode = 404;
      HttpError.code = 'COIN_NOT_FOUND';
      return next(HttpError);
    }
    return next(error);
  }
}

async function getGlobalMarketStats(req, res, next) {
  try {
    const cacheKey = 'global-market';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const data = await fetchGlobalMarketStats();
    const marketData = data.data || data;
    const normalized = {
      total_market_cap: marketData.total_market_cap?.usd ?? null,
      total_volume: marketData.total_volume?.usd ?? null,
      active_cryptocurrencies: marketData.active_cryptocurrencies ?? null,
      markets: marketData.markets ?? null,
      market_cap_percentage: {
        btc: marketData.market_cap_percentage?.btc ?? null,
        eth: marketData.market_cap_percentage?.eth ?? null,
      },
      market_cap_change_percentage_24h_usd: marketData.market_cap_change_percentage_24h_usd ?? null,
    };

    cache.set(cacheKey, normalized, CACHE_TTL_SECONDS);
    return res.json({ success: true, data: normalized });
  } catch (error) {
    return next(error);
  }
}

async function search(req, res, next) {
  try {
    const q = String(req.query.q ?? req.query.query ?? '').trim();
    if (!q) {
      const error = new Error('Search query is required');
      error.statusCode = 400;
      error.code = 'INVALID_SEARCH_QUERY';
      throw error;
    }

    const cacheKey = `search:${q}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const data = await searchCoins(q);
    const normalized = (data.coins || []).map((coin) => ({
      id: coin.id || null,
      name: coin.name || null,
      symbol: coin.symbol || null,
      image: coin.thumb || coin.large || null,
      market_cap_rank: coin.market_cap_rank ?? null,
    }));

    cache.set(cacheKey, normalized, CACHE_TTL_SECONDS);
    return res.json({ success: true, data: normalized });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMarketList,
  getCoinDetails,
  getHistoricalChart,
  getGlobalMarketStats,
  search,
};
