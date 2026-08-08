# QubicPulse

**Your Qubic Command Center**

An all-in-one dashboard for the Qubic ecosystem. Track portfolios, set price alerts, monitor wallet transactions, and explore DeFi in one place.

**Live:** https://qubicpulse.pages.dev

**Repository:** https://github.com/ledgervibes/qubicpulse

**License:** MIT

## Features

- **Portfolio Tracking** — Multi-wallet support with real-time balance and USD valuation
- **Price Alerts** — Browser notifications + Telegram delivery
- **Transaction Monitoring** — Real-time notifications for ALL tokens (QUBIC + assets)
- **DeFi Dashboard** — Live market data, volume charts, QX DEX integration
- **Telegram Notifications** — @qubit_pulse_bot for mobile alerts
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
- Cloudflare Workers (server-side Telegram bot proxy)
- Cloudflare Pages (hosting)

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when enabling optional integrations. Never commit `.env.local` or real credentials.

Environment variables:

- `VITE_TELEGRAM_API_URL` — server-side Telegram proxy URL. The Telegram bot token must only exist as a Cloudflare Worker secret.

CoinMarketCap is disabled in the browser build until a server-side proxy is available. CoinGecko and CoinPaprika remain the public price sources.

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
