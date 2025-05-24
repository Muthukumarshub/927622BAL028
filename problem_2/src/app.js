// src/app.js

const express = require("express");
const stockRoutes = require("./routes/stockRoutes"); // Import the stock routes

const app = express();
const PORT = 9876; // The port on which the microservice will run.

// Middleware to parse JSON bodies from incoming requests.
app.use(express.json());

// Mount the stock routes
app.use("/", stockRoutes); // Use a base path that includes the stock routes

// Basic error handling for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: "Not Found. Please check the URL and parameters." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// Start the Express server.
app.listen(PORT, () => {
  console.log(`Stock Price Aggregation Microservice running on http://localhost:${PORT}`);
  console.log("\nAvailable Endpoints:");
  console.log(`  Average Price:   GET http://localhost:${PORT}/stocks/:ticker?minutes=m&aggregation=average`);
  console.log(`  Correlation:     GET http://localhost:${PORT}/stockcorrelation?minutes=m&ticker=TICKER1&ticker=TICKER2`);
});