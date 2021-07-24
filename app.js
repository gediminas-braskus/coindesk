const express = require("express");
const fetch = require("node-fetch");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const app = express();
const port = 3000;

const ALLOWED_IP = ["::ffff:127.0.0.1", "::1", "192.168.1.121", "127.0.0.1"]; // add your ip here

const checkIP = (req, res, next) => {
  if (ALLOWED_IP.includes(req.ip)) {
    next();
  } else {
    console.log(`Your IP address is ${req.ip}`);
    res.status(403).json({
      message: "Your IP is not allowed",
    });
  }
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  delayMs: 0, // disable delaying - user has full speed until the max limit is reached
});

app.use(compression());
app.use("/api/", checkIP); // only applies to requests that begins with /api/
app.use("/api/", apiLimiter); // only applies to requests that begins with /api/

app.get("/", (req, res) => {
  res.send("Hello!");
});

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
        priceHistory[date] = price * 100;
      });

      res.status(200).json(priceHistory);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error_message: "An error occured fetching data",
      });
    }
  };

  getPriceHistory(startDate, endDate);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
