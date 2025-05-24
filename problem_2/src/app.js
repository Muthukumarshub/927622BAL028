const express = require("express");
const stockRoutes = require("./routes/stockRoutes");

const app = express();
const PORT = 9876;

app.use(express.json());

app.use("/", stockRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found. Please check the URL and parameters." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Stock Price Aggregation Microservice running on http://localhost:${PORT}`);
  console.log(`Available Endpoints:`);
  console.log(`  Average Price:   GET http://localhost:${PORT}/stocks/:ticker?minutes=m&aggregation=average`);
  console.log(`  Correlation:     GET http://localhost:${PORT}/stockcorrelation?minutes=m&ticker=TICKER1&ticker=TICKER2`);
});