const express = require("express");
const numberService = require("../services/numberService");
const { API_ENDPOINTS } = require("../utils/constants");

const router = express.Router();

router.get("/numbers/:numberid", async (req, res) => {
  const numberId = req.params.numberid;

  if (!API_ENDPOINTS[numberId]) {
    return res.status(400).json({ error: "Invalid number ID. Must be 'p', 'f', 'e', or 'r'." });
  }

  try {
    const data = await numberService.getAverageData(numberId);
    res.json(data);
  } catch (error) {
    console.error(`Error processing request for number ID ${numberId}:`, error);
    res.status(500).json({ error: "Internal server error while calculating average." });
  }
});

module.exports = router;