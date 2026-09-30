# Real CoinMarketCap call evidence

`cmc-keyless-response.json` is an actual captured CMC V3 USD quote response, not a fixture or synthetic data. `cmc-request.json` records the request URL, UTC capture time and keyless authentication mode. The client evidence view also shows subsequent live responses.

```bash
curl --fail --show-error 'https://pro-api.coinmarketcap.com/public-api/v3/cryptocurrency/quotes/latest?id=1,1027,5426,3408,825&convert=USD'
```

Application source: `lib/cmc.ts` (server request), `lib/cmc-normalize.ts` (V3 array validation) and `lib/analysis.ts` (operating model).

Own campaign-key evidence is pending. Once CMC_API_KEY is configured, the server uses the authenticated route. Capture its response and sanitized metadata, excluding all key headers, before claiming the hackathon own-key requirement is complete.
