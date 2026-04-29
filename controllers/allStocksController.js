const {
  getAllStocks: getAllStocksFromService,
} = require("../services/tickerService");

exports.getAllStocks = (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;

  const stocks = getAllStocksFromService(page, limit);

  res.status(200).json({
    status: "success",
    results: stocks.data.length,
    data: stocks,
  });
};
