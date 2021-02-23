const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/getPriceHistory/:startDate/:endDate", (req, res) => {
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;

  const getPriceHistory = async () => {
    try {
      const response = await fetch(
        `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`
      );
      const data = await response.json();
      const entries = Object.entries(data.bpi);
      let obj = {};

      entries.map(([date, price]) => {
        obj[date] = price * 1000;
      });
      res.send(obj);
    } catch (error) {
      console.error(error);
    }
  };
  getPriceHistory();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
