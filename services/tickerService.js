const { KiteTicker } = require("kiteconnect");
const instrumentMeta = require("../data/instrumentMeta.json");
const { getIo } = require("./socket");
let ticker;
let latestTicksMap = new Map();
let started = false;

exports.startTicker = (apiKey, accessToken, instrumentTokens) => {
  if (started) return;
  started = true;

  const defaultTokens = Object.keys(instrumentMeta).map(Number).slice(0, 200);
  const tokens =
    Array.isArray(instrumentTokens) && instrumentTokens.length
      ? instrumentTokens
      : defaultTokens;

  ticker = new KiteTicker({ api_key: apiKey, access_token: accessToken });
  ticker.connect();

  ticker.on("connect", () => {
    ticker.subscribe(tokens);
    ticker.setMode(ticker.modeFull, tokens);
  });

  ticker.on("ticks", (ticks) => {
    const updates = [];

    for (const t of ticks) {
      const meta = instrumentMeta[t.instrument_token] || {};
      const row = {
        instrument_token: t.instrument_token,
        symbol: meta.symbol || String(t.instrument_token),
        exchange: meta.exchange || "NSE",
        last_price: t.last_price,
        change: t.change, // keep as backend key
        ohlc: t.ohlc,
        volume_traded: t.volume_traded,
        last_trade_time: t.last_trade_time,
        exchange_timestamp: t.exchange_timestamp,
      };
      latestTicksMap.set(t.instrument_token, row);
      updates.push(row); // push row, not map
    }

    getIo().emit("stocks:update", updates);
  });

  ticker.on("error", console.error);
  ticker.on("close", () => {
    started = false;
  });
};

exports.getAllStocks = (page = 1, limit = 5) => {
  const all = Array.from(latestTicksMap.values());
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * limit;
  const data = all.slice(start, start + limit);

  return {
    data,
    pagination: {
      total,
      page: currentPage,
      limit,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
};
