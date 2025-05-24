const { mean, pearsonCorrelation } = require("../utils/mathUtils");
const stockDataService = require("./stockDataService");

function calculateAverageStockPrice(priceHistory) {
  if (!priceHistory || priceHistory.length === 0) {
    return 0;
  }
  const prices = priceHistory.map(entry => entry.price);
  return mean(prices);
}

function alignPriceHistories(history1, history2) {
  const allTimestamps = new Set();
  history1.forEach(entry => allTimestamps.add(new Date(entry.lastUpdatedAt).getTime()));
  history2.forEach(entry => allTimestamps.add(new Date(entry.lastUpdatedAt).getTime()));

  const sortedUniqueTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  const alignedPrices1 = [];
  const alignedPrices2 = [];
  const alignedTimestamps = [];

  let lastPrice1 = null;
  let lastPrice2 = null;

  let ptr1 = 0;
  let ptr2 = 0;

  for (const ts of sortedUniqueTimestamps) {
    const currentTimestamp = new Date(ts);

    while (ptr1 < history1.length && new Date(history1[ptr1].lastUpdatedAt).getTime() <= ts) {
      lastPrice1 = history1[ptr1].price;
      ptr1++;
    }

    while (ptr2 < history2.length && new Date(history2[ptr2].lastUpdatedAt).getTime() <= ts) {
      lastPrice2 = history2[ptr2].price;
      ptr2++;
    }

    if (lastPrice1 !== null && lastPrice2 !== null) {
      alignedPrices1.push(lastPrice1);
      alignedPrices2.push(lastPrice2);
      alignedTimestamps.push(currentTimestamp);
    }
  }

  return { alignedPrices1, alignedPrices2, alignedTimestamps };
}

async function getStockCorrelation(ticker1, ticker2, minutes) {
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

  const correlationValue = pearsonCorrelation(alignedPrices1, alignedPrices2);

  return {
    correlation: parseFloat(correlationValue.toFixed(4)),
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