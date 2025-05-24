// src/services/aggregationService.js

const { mean, pearsonCorrelation } = require("../utils/mathUtils");
const stockDataService = require("./stockDataService");

/**
 * Calculates the average stock price from a given price history.
 * @param {Array<{ price: number, lastUpdatedAt: string }>} priceHistory - An array of stock price data.
 * @returns {number} The average price.
 */
function calculateAverageStockPrice(priceHistory) {
  if (!priceHistory || priceHistory.length === 0) {
    return 0;
  }
  const prices = priceHistory.map(entry => entry.price);
  return mean(prices);
}

/**
 * Aligns two stock price histories based on their timestamps.
 * For each unique timestamp, it finds the most recent price for both stocks at or before that time.
 * If a price is not available at or before a timestamp within the original window, it's considered null/undefined.
 *
 * @param {Array<{ price: number, lastUpdatedAt: string }>} history1 - Price history for ticker 1.
 * @param {Array<{ price: number, lastUpdatedAt: string }>} history2 - Price history for ticker 2.
 * @returns {{ alignedPrices1: number[], alignedPrices2: number[], alignedTimestamps: Date[] }} Aligned price arrays and timestamps.
 */
function alignPriceHistories(history1, history2) {
  // Combine all unique timestamps and sort them
  const allTimestamps = new Set();
  history1.forEach(entry => allTimestamps.add(new Date(entry.lastUpdatedAt).getTime()));
  history2.forEach(entry => allTimestamps.add(new Date(entry.lastUpdatedAt).getTime()));

  const sortedUniqueTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  const alignedPrices1 = [];
  const alignedPrices2 = [];
  const alignedTimestamps = [];

  let lastPrice1 = null;
  let lastPrice2 = null;

  let ptr1 = 0; // Pointer for history1
  let ptr2 = 0; // Pointer for history2

  for (const ts of sortedUniqueTimestamps) {
    const currentTimestamp = new Date(ts);

    // Update lastPrice1 based on history1
    while (ptr1 < history1.length && new Date(history1[ptr1].lastUpdatedAt).getTime() <= ts) {
      lastPrice1 = history1[ptr1].price;
      ptr1++;
    }

    // Update lastPrice2 based on history2
    while (ptr2 < history2.length && new Date(history2[ptr2].lastUpdatedAt).getTime() <= ts) {
      lastPrice2 = history2[ptr2].price;
      ptr2++;
    }

    // Only include data points where both stocks have a value
    if (lastPrice1 !== null && lastPrice2 !== null) {
      alignedPrices1.push(lastPrice1);
      alignedPrices2.push(lastPrice2);
      alignedTimestamps.push(currentTimestamp);
    }
  }

  return { alignedPrices1, alignedPrices2, alignedTimestamps };
}

/**
 * Calculates the correlation between two stock tickers' price movements.
 * @param {string} ticker1 - The first stock ticker.
 * @param {string} ticker2 - The second stock ticker.
 * @param {number} minutes - The duration in minutes for price history.
 * @returns {Promise<object>} An object containing correlation, and detailed stock price histories.
 */
async function getStockCorrelation(ticker1, ticker2, minutes) {
  // Fetch price histories for both stocks
  const priceHistory1 = await stockDataService.fetchPriceHistory(ticker1, minutes);
  const priceHistory2 = await stockDataService.fetchPriceHistory(ticker2, minutes);

  if (priceHistory1.length < 2 || priceHistory2.length < 2) {
    console.warn(`Insufficient data for correlation. Ticker1 has ${priceHistory1.length} points, Ticker2 has ${priceHistory2.length} points.`);
    return {
      correlation: 0,
      stocks: {
        [ticker1]: { averagePrice: calculateAverageStockPrice(priceHistory1), priceHistory: priceHistory1 },
        [ticker2]: { averagePrice: calculateAverageStockPrice(priceHistory2), priceHistory: priceHistory2 },
      }
    };
  }

  // Align the data points by timestamp
  const { alignedPrices1, alignedPrices2 } = alignPriceHistories(priceHistory1, priceHistory2);

  if (alignedPrices1.length < 2) {
    console.warn(`After alignment, insufficient common data points for correlation. Aligned points: ${alignedPrices1.length}`);
    return {
      correlation: 0,
      stocks: {
        [ticker1]: { averagePrice: calculateAverageStockPrice(priceHistory1), priceHistory: priceHistory1 },
        [ticker2]: { averagePrice: calculateAverageStockPrice(priceHistory2), priceHistory: priceHistory2 },
      }
    };
  }

  // Calculate correlation
  const correlationValue = pearsonCorrelation(alignedPrices1, alignedPrices2);

  return {
    correlation: parseFloat(correlationValue.toFixed(4)), // Format to 4 decimal places as per example
    stocks: {
      [ticker1]: {
        averagePrice: calculateAverageStockPrice(priceHistory1),
        priceHistory: priceHistory1,
      },
      [ticker2]: {
        averagePrice: calculateAverageStockPrice(priceHistory2),
        priceHistory: priceHistory2,
      },
    },
  };
}


module.exports = {
  calculateAverageStockPrice,
  getStockCorrelation,
};