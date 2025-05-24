const express = require("express");
const stockDataService = require("../services/stockDataService");
const aggregationService = require("../services/aggregationService");

const router = express.Router();

router.get("/stocks/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const minutes = parseInt(req.query.minutes, 10);
  const aggregation = req.query.aggregation;

  if (isNaN(minutes) || minutes <= 0) {
    return res.status(400).json({ error: "Invalid 'minutes' parameter. Must be a positive number." });
  }
  if (aggregation !== "average") {
    return res.status(400).json({ error: "Invalid 'aggregation' parameter. Only 'average' is supported." });
  }

  try {
    const priceHistory = await stockDataService.fetchPriceHistory(ticker, minutes);

    if (priceHistory.length === 0) {
      return res.status(404).json({ error: `No price data found for ${ticker} in the last ${minutes} minutes.` });
    }

    const averagePrice = aggregationService.calculateAverageStockPrice(priceHistory);

    res.json({
      averageStockPrice: parseFloat(averagePrice.toFixed(6)),
      priceHistory: priceHistory.map(p => ({
        price: p.price,
        lastUpdatedAt: p.lastUpdatedAt
      })),
    });
  } catch (error) {
    console.error(`Error processing average stock price for ${ticker}:`, error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/stockcorrelation", async (req, res) => {
  const minutes = parseInt(req.query.minutes, 10);
  const tickers = req.query.ticker;

  if (isNaN(minutes) || minutes <= 0) {
    return res.status(400).json({ error: "Invalid 'minutes' parameter. Must be a positive number." });
  }

  if (!Array.isArray(tickers) || tickers.length !== 2) {
    return res.status(400).json({ error: "Exactly two 'ticker' parameters are required for correlation (e.g., ?ticker=NVDA&ticker=PYPL)." });
  }

  const ticker1 = tickers[0].toUpperCase();
  const ticker2 = tickers[1].toUpperCase();

  if (ticker1 === ticker2) {
    return res.status(400).json({ error: "Cannot correlate a stock with itself. Provide two different tickers." });
  }

  try {
    const correlationData = await aggregationService.getStockCorrelation(ticker1, ticker2, minutes);

    res.json(correlationData);
  } catch (error) {
    console.error(`Error calculating correlation for ${ticker1} and ${ticker2}:`, error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;