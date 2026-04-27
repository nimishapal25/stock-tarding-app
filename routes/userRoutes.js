const express = require("express");
const authController = require("./../controllers/authController");
const allStocksController = require("./../controllers/allStocksController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/zerodha-login", authController.zerodhaLogin);
router.get("/zerodha-callback", authController.ZerodhaCallback);
router.get("/all-stocks", allStocksController.getAllStocks);

module.exports = router;
