# QubicPulse

**Your Qubic Command Center**

An all-in-one dashboard for the Qubic ecosystem. Track portfolios, set price alerts, monitor wallet transactions, and explore DeFi — all in one place.

## Features

- **Portfolio Tracking** — Multi-wallet support with real-time balance and USD valuation
- **Price Alerts** — Browser notifications + Telegram delivery
- **Transaction Monitoring** — Real-time notifications for ALL tokens (QUBIC + assets)
- **DeFi Dashboard** — Live market data, volume charts, QX DEX integration
- **Telegram Bot** — @qubit_pulse_bot for mobile wallet management and notifications
- **Light/Dark Mode** — Theme toggle with system preference support
- **Mobile Responsive** — Optimized for all screen sizes
- **Glassmorphism UI** — Modern, premium design language

## Tech Stack

- React 18 + TypeScript + Vite
- TailwindCSS (Qubic brand theme)
- Zustand (state management)
- Recharts (data visualization)
- Qubic RPC API + Event Logs API
- CoinGecko + CoinPaprika + CoinMarketCap APIs
- Cloudflare Workers (Telegram bot backend)
- Cloudflare Pages (hosting)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Deployed on Cloudflare Pages. Auto-deploys on push to `main`.

## License

MIT
