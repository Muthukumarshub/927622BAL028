const axios = require("axios");
const { TEST_SERVER_BASE_URL, FETCH_TIMEOUT, CACHE_EXPIRY_SECONDS, AUTH_TOKEN } = require("../utils/constants");

const stockPriceCache = new Map();

async function fetchPriceHistory(ticker, minutes) {
  const cacheKey = `${ticker}_${minutes}`;
  const now = new Date();

  if (stockPriceCache.has(cacheKey)) {
    const cachedData = stockPriceCache.get(cacheKey);
    const timeElapsed = (now.getTime() - cachedData.fetchedAt.getTime()) / 1000;

    if (timeElapsed < CACHE_EXPIRY_SECONDS) {
      console.log(`[Cache Hit] Using cached data for ${cacheKey}.`);
      return cachedData.priceHistory;
    } else {
      console.log(`[Cache Stale] Cache for ${cacheKey} expired. Refetching.`);
      stockPriceCache.delete(cacheKey);
    }
  }

  console.log(`[Fetching] Fetching data for ${cacheKey} from external API.`);
  const apiUrl = `${TEST_SERVER_BASE_URL}/stocks/${ticker}?minutes=${minutes}`;

  try {
    const response = await axios.get(apiUrl, {
      timeout: FETCH_TIMEOUT,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    const priceHistory = response.data;

    if (!Array.isArray(priceHistory) || priceHistory.some(item => typeof item.price !== 'number' || !item.lastUpdatedAt)) {
      console.warn(`Invalid data structure received from ${apiUrl}:`, priceHistory);
      return [];
    }

    priceHistory.sort((a, b) => new Date(a.lastUpdatedAt).getTime() - new Date(b.lastUpdatedAt).getTime());

    stockPriceCache.set(cacheKey, {
      priceHistory: priceHistory,
      fetchedAt: now,
    });

    return priceHistory;
  } catch (error) {
    console.error(`Error fetching price history for ${cacheKey}:`);
    if (axios.isCancel(error)) {
      console.error('Request cancelled:', error.message);
    } else if (error.code === 'ECONNABORTED') {
      console.error(`Request timed out after ${FETCH_TIMEOUT}ms.`);
    } else if (error.response) {
      console.error(`Status ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return [];
  }
}

module.exports = {
  fetchPriceHistory,
};