// src/services/stockDataService.js

const axios = require("axios");
const { TEST_SERVER_BASE_URL, FETCH_TIMEOUT, CACHE_EXPIRY_SECONDS, AUTH_TOKEN } = require("../utils/constants");

// In-memory cache for stock price history.
// Key: "ticker_minutes" (e.g., "NVDA_60")
// Value: { priceHistory: Array<{ price: number, lastUpdatedAt: string }>, fetchedAt: Date }
const stockPriceCache = new Map();

/**
 * Fetches price history for a given ticker and duration from the external API,
 * using an in-memory cache to reduce redundant calls.
 * @param {string} ticker - The stock ticker symbol (e.g., "NVDA").
 * @param {number} minutes - The number of minutes to fetch history for.
 * @returns {Promise<Array<{ price: number, lastUpdatedAt: string }>>} Price history.
 */
async function fetchPriceHistory(ticker, minutes) {
  const cacheKey = `${ticker}_${minutes}`;
  const now = new Date();

  // 1. Check Cache
  if (stockPriceCache.has(cacheKey)) {
    const cachedData = stockPriceCache.get(cacheKey);
    const timeElapsed = (now.getTime() - cachedData.fetchedAt.getTime()) / 1000; // in seconds

    if (timeElapsed < CACHE_EXPIRY_SECONDS) {
      console.log(`[Cache Hit] Using cached data for ${cacheKey}.`);
      return cachedData.priceHistory;
    } else {
      console.log(`[Cache Stale] Cache for ${cacheKey} expired. Refetching.`);
      stockPriceCache.delete(cacheKey); // Clear stale cache entry
    }
  }

  // 2. Fetch from External API
  console.log(`[Fetching] Fetching data for ${cacheKey} from external API.`);
  const apiUrl = `${TEST_SERVER_BASE_URL}/stocks/${ticker}?minutes=${minutes}`;

  try {
    const response = await axios.get(apiUrl, {
      timeout: FETCH_TIMEOUT,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    // The API response is an array of price objects.
    const priceHistory = response.data; // Assuming response.data is directly the array as per example

    // Ensure priceHistory is an array and each item has price and lastUpdatedAt
    if (!Array.isArray(priceHistory) || priceHistory.some(item => typeof item.price !== 'number' || !item.lastUpdatedAt)) {
      console.warn(`Invalid data structure received from ${apiUrl}:`, priceHistory);
      return [];
    }

    // Sort the price history by timestamp in ascending order for consistent processing
    priceHistory.sort((a, b) => new Date(a.lastUpdatedAt).getTime() - new Date(b.lastUpdatedAt).getTime());

    // 3. Store in Cache
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
    return []; // Return empty array on error
  }
}

module.exports = {
  fetchPriceHistory,
};