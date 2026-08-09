# QubicPulse

**Your Qubic Command Center**

An all-in-one dashboard for the Qubic ecosystem. Track portfolios, set price alerts, monitor wallet transactions, and explore DeFi in one place.

**Live:** https://qubicpulse.pages.dev

**Repository:** https://github.com/ledgervibes/qubicpulse

**License:** MIT

## Features

- **Portfolio Tracking** — Multi-wallet support with real-time balance and USD valuation
- **Price Alerts** — Browser alerts plus bot-managed Telegram alerts
- **Transaction Monitoring** — Real-time notifications for ALL tokens (QUBIC + assets)
- **DeFi Dashboard** — Live market data, volume charts, QX DEX integration
- **Telegram Bot** — @qubic_pulse_bot manages wallets, transaction alerts, price alerts, and QEarn notifications
- **Light/Dark Mode** — Theme toggle with system preference support
- **Mobile Responsive** — Optimized for all screen sizes
- **Glassmorphism UI** — Modern, premium design language

## Tech Stack

- React + TypeScript + Vite
- TailwindCSS (Qubic brand theme)
- Zustand (state management)
- Recharts (data visualization)
- Qubic RPC API + Event Logs API
- CoinGecko + CoinPaprika + CoinMarketCap APIs
- Cloudflare Workers (server-side CoinMarketCap proxy)
- Cloudflare Pages (hosting)

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when enabling optional integrations. Never commit `.env.local` or real credentials.

Environment variables:

- `VITE_CMC_API_URL` — server-side CoinMarketCap proxy URL. The CMC key must only exist as a Cloudflare Worker secret.

CoinMarketCap is an optional server-side integration. CoinGecko and CoinPaprika remain the public price sources. The API Worker exposes `/price` and `/health`.

Telegram is managed independently by `@qubic_pulse_bot`. The website only links to the bot; it does not collect Chat IDs or send Telegram messages from the browser.

## Build

```bash
npm run build
```

## Quality Checks

```bash
npm run lint
npm test -- --maxWorkers=1 --no-file-parallelism
npm run build
```

## Deployment

Production is hosted on Cloudflare Pages at `qubicpulse.pages.dev`. The repository workflow validates lint, tests, and build; deploy the generated `dist` directory through the connected Cloudflare Pages project.

Deploy the optional API Worker and set its encrypted secret interactively:

```bash
npm run worker:deploy
npx wrangler secret put CMC_API_KEY --config worker/wrangler.jsonc
```

Set `VITE_CMC_API_URL` to the deployed Worker base URL in the Cloudflare Pages build environment. Never put the CMC key in a `VITE_*` variable.
