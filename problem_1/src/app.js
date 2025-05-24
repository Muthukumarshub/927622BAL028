
const express = require("express");
const numbersRouter = require("./routes/numbers"); 

const app = express();
const PORT = 9876; 

app.use(express.json());

app.use("/", numbersRouter);

app.listen(PORT, () => {
  console.log(`Average Calculator Microservice running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log(`  http://localhost:${PORT}/numbers/p (Prime numbers)`);
  console.log(`  http://localhost:${PORT}/numbers/f (Fibonacci numbers)`);
  console.log(`  http://localhost:${PORT}/numbers/e (Even numbers)`);
  console.log(`  http://localhost:${PORT}/numbers/r (Random numbers)`);
});