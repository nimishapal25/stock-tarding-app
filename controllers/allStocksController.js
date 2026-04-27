const { getAllStocks } = require("../services/tickerService");

exports.getAllStocks = (req, res) => {
  const stocks = getAllStocks();
  res.status(200).json({
    status: "success",
    results: stocks.length,
    data: stocks,
  });
};
