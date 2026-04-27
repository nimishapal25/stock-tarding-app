// scripts/buildInstrumentMeta.js
require("dotenv").config({ path: "./config.env" });
const fs = require("fs");
const path = require("path");
const { KiteConnect } = require("kiteconnect");

async function build() {
  const kite = new KiteConnect({ api_key: process.env.KITE_API_KEY });
  kite.setAccessToken(process.env.KITE_ACCESS_TOKEN); // or token from your auth flow

  const instruments = await kite.getInstruments(); // full dump

  const filtered = instruments.filter(
    (i) => i.exchange === "NSE" && i.segment === "NSE",
  );

  const instrumentMeta = {};
  for (const i of filtered) {
    instrumentMeta[i.instrument_token] = {
      symbol: i.tradingsymbol,
      exchange: i.exchange,
    };
  }

  const outPath = path.join(__dirname, "../data/instrumentMeta.json");
  fs.writeFileSync(outPath, JSON.stringify(instrumentMeta, null, 2));
  console.log(`Saved ${Object.keys(instrumentMeta).length} instruments`);
}

build().catch(console.error);
