const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello!");
})

app.get("/api/getPriceHistory/:startDate/:endDate", (req, res) => {
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;

  const getPriceHistory = async (startDate, endDate) => {
    try {
      const response = await fetch(
        `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`
      );
      const data = await response.json();
      const entries = Object.entries(data.bpi);
      let priceHistory = {};

      entries.map(([date, price]) => {
        priceHistory[date] = price * 1000;
      });

      return res.status(200).json(priceHistory);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error_message: "An error occured fetching data",
      });
    }
  };

  getPriceHistory(startDate, endDate);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
