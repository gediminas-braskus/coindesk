const express = require("express");
const fetch = require("node-fetch");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const app = express();
const port = 3000;

const ALLOWED_IP = ["::ffff:127.0.0.1"]; // add your ip here

const checkIP = (req, res, next) => {
  ALLOWED_IP.find(ip => {
    if (ip !== req.ip) {
      console.log(req.ip);
      res.status(403).json({
        message: "You shall not pass"
      })
    } else {
      next();
    }
  })
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  delayMs: 0 // disable delaying - user has full speed until the max limit is reached
});

app.use(compression());
app.use(checkIP);
app.use("/api/", apiLimiter); // only applies to requests that begins with /api/

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
