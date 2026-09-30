# Real CoinMarketCap call evidence

`cmc-authenticated-response.json` is a real HTTP 200 CMC V3 USD quote response for five assets using the participant's existing API key. `cmc-request.json` records the authenticated endpoint, UTC capture time and returned asset IDs. The key header is intentionally excluded. The live client evidence view also shows the endpoint, source and subsequent responses.

`cmc-keyless-response.json` preserves an earlier real response from the public route, used during development before the existing key was connected. It is not a fixture or synthetic data. To reproduce that fallback call:

```bash
curl --fail --show-error 'https://pro-api.coinmarketcap.com/public-api/v3/cryptocurrency/quotes/latest?id=1,1027,5426,3408,825&convert=USD'
```

Application source: `lib/cmc.ts` (server request), `lib/cmc-normalize.ts` (V3 array validation) and `lib/analysis.ts` (operating model).

The deployed server uses the authenticated `/v3/cryptocurrency/quotes/latest` route. `CMC_API_KEY` is configured as a secret in the server runtime and never exposed to the browser or Git. The account showed the Basic plan; campaign issuance and the Startup grant remain unverified. Authenticated own-key usage is demonstrated, but this evidence does not establish every campaign access requirement.
