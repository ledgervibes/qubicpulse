# QubicPulse

**Your watch-only Qubic command center.**

QubicPulse brings Qubic market context, public-address portfolio monitoring,
alerts, QX activity, and staking comparison into one responsive dashboard. It
does not connect to a wallet and never requests a seed phrase or private key.

- **Live:** [qubicpulse.pages.dev](https://qubicpulse.pages.dev)
- **Roadmap:** [ROADMAP.md](ROADMAP.md)
- **License:** [MIT](LICENSE)

## Current Status

The core platform, product experience, staking tools, quality pass, and the
Token Explorer are shipped. The next milestone is **v3.0 Wallet Identity**.

| Area | Status |
| --- | --- |
| Dashboard and Network Pulse | Shipped |
| Watch-only portfolio monitoring | Shipped |
| Price and wallet alerts | Shipped |
| DeFi Market Intelligence | Shipped |
| QEarn and QBond comparison | Shipped |
| Token Explorer | Shipped |
| Wallet Identity | Next |

## Features

- **Network Pulse:** current epoch, tick, progress, and epoch countdown
- **Portfolio:** multiple public Qubic identities, QU balance, estimated USD
  value, token holdings, and recent transaction activity
- **Alerts:** local price targets, browser notifications, and monitored wallet
  activity
- **DeFi Intelligence:** QUBIC market context, reported volume history, and a
  transparent ranking from a recent sample of QX asset-transfer events
- **Token Explorer:** searchable listing of assets issued through QX, asset
  detail routes with verified issuance data and recent transfers, and a
  browser-local watchlist
- **Staking:** QEarn/QBond terms, lock and liquidity tradeoffs, and a reward
  estimator based on currently reported annualized rates
- **Telegram Companion:** `@qubic_pulse_bot` for wallet, transaction, price, and
  QEarn monitoring
- **Product Experience:** dark/light themes, responsive layouts, explicit data
  states, accessible focus behavior, and route-level code splitting

## Data Transparency

QubicPulse uses public or free-tier sources and treats missing data explicitly.

- Qubic RPC provides network, balance, transaction, and contract data.
- Qubic Event Logs provide asset transfer and holdings context.
- CoinGecko is the primary public market source.
- CoinPaprika is a fallback for current price data.
- CoinMarketCap is an optional fallback through a server-side Cloudflare Worker;
  its API key is never exposed to the browser.
- QX activity rankings are based on a recent event sample, not an implied
  24-hour market window.
- Staking rewards are estimates, not guaranteed returns.

Public RPC and free API availability can affect freshness. Existing data may be
kept visible with a stale or partial-failure state instead of being replaced by
an invented value.

## Architecture

- React 19, TypeScript, and Vite
- Tailwind CSS v4
- Zustand with browser-local persistence for watchlists and alerts
- Recharts for market visualizations
- Qubic RPC, Query RPC, Event Logs, QEarn, and QBond contract queries
- Cloudflare Pages for the frontend
- Cloudflare Workers for the optional CoinMarketCap proxy and Telegram bot

The application is route-split so feature pages and chart code are loaded only
when needed.

## Development

Requirements: Node.js 24 and npm.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` only when enabling optional integrations.
Never commit `.env.local` or real credentials.

Optional environment variable:

```text
VITE_CMC_API_URL=https://your-price-proxy.example
```

`VITE_CMC_API_URL` points to the server-side CoinMarketCap proxy. The actual
CoinMarketCap key must only exist as a Cloudflare Worker secret. The same
worker exposes `/orderbook`, a cached QX orderbook proxy, so the token list and
detail pages do not hit `rpc.qubic.org` directly (which rate-limits hard).

## Quality Checks

```bash
npm run lint
npm test -- --maxWorkers=1 --no-file-parallelism
npm run build
```

## Deployment

Production is deployed manually to the existing Cloudflare Pages project after
the quality checks pass:

```bash
npm run build
npx wrangler pages deploy dist --project-name qubicpulse --branch main
```

The GitHub workflow validates lint, tests, and the production build. The
Cloudflare Pages project is not connected to Git-based automatic deployment.

Deploy the optional price API Worker separately:

```bash
npm run worker:deploy
npx wrangler secret put CMC_API_KEY --config worker/wrangler.jsonc
```

## Security and Privacy

- Public Qubic identities only; no signing or custody
- No seed phrase or private-key input
- Alerts and watch-only portfolio preferences are stored in the browser
- Third-party API secrets stay server-side
- External staking, wallet, explorer, and exchange links open outside
  QubicPulse

## Project Links

- [Live dashboard](https://qubicpulse.pages.dev)
- [Product roadmap](ROADMAP.md)
- [Telegram bot](https://t.me/qubic_pulse_bot)
- [Qubic documentation](https://docs.qubic.org)
- [Qubic Explorer](https://explorer.qubic.org)
