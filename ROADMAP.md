# QubicPulse Roadmap

> A watch-only command center for the Qubic ecosystem.

## Product Status

QubicPulse has shipped its core dashboard, multi-address portfolio monitoring,
price and wallet alerts, QX activity intelligence, QEarn/QBond comparison, and
the first product quality pass. The next product milestone is Token Explorer,
which moves QubicPulse from account monitoring into broader Qubic asset
discovery.

| Release | Milestone | Status |
| --- | --- | --- |
| v1.0 | Core Platform | Shipped |
| v1.5 | Product Experience | Shipped |
| v2.0 | Staking & Rewards | Shipped |
| v2.1 | Product Quality Pass | Shipped |
| v2.5 | Token Explorer | Next |
| v3.0 | Wallet Identity | Planned |
| v3.5 | Portfolio Analytics | Planned |
| v4.0 | Automation & AI | Planned |

**Current position:** v2.1 shipped; v2.5 is next.

## Shipped Milestones

### v1.0 - Core Platform

Goal: consolidate essential Qubic monitoring workflows into one interface.

- Dashboard with live QUBIC market data and price history
- Multi-address watch-only portfolio with QU balances and transaction history
- Browser-based price alerts
- Qubic network context, including current epoch and tick
- Public price-source fallback across CoinGecko, CoinPaprika, and an optional
  server-side CoinMarketCap proxy
- Cloudflare Pages production deployment

### v1.5 - Product Experience

Goal: make the platform practical across desktop and mobile without requiring a
wallet connection.

- Dark and light themes
- Responsive navigation and mobile layouts
- Multi-token holdings from Qubic Event Logs
- Telegram companion bot for wallet, transaction, price, and QEarn monitoring
- Loading, empty, error, and watch-only privacy states
- Automated lint, test, and production build validation

### v2.0 - Staking & Rewards

Goal: help users understand Qubic earning options before leaving QubicPulse to
use the underlying products.

- QEarn and QBond side-by-side comparison
- Reward estimator using currently reported annualized rates
- Epoch countdown and Network Pulse on the dashboard
- QEarn reward notifications through the Telegram bot
- Responsive comparison rows with clear lock, liquidity, fee, and exit tradeoffs

QBond maturity notifications remain deferred until a verified contract or API
source can support reliable user-facing delivery.

### v2.1 - Product Quality Pass

Goal: improve correctness, trust, usability, and loading performance across the
shipped product.

- Qubic-specific Network Pulse and refined primary navigation
- DeFi Market Intelligence with transparent QX activity sampling
- Alerts Command Center with reactive notification state and activity history
- Staking calculator correctness and decision-support hierarchy
- Portfolio refresh status, partial RPC failure handling, and asset retry states
- Accessible labels, visible status text, keyboard focus states, and reduced
  motion support
- Route-level code splitting; initial JavaScript reduced from approximately
  706 kB to 245 kB in the production build

## Next Milestone

### v2.5 - Token Explorer

Goal: provide a searchable, transparent view of assets issued and active on
Qubic without inventing unavailable market data.

#### v2.5A - Asset Discovery

- Searchable QX asset listing
- Sorting and filtering by verified available fields
- Asset name and issuer identity
- Issuance supply when available from validated issuance events
- Recent transfer activity
- Recently discovered assets

#### v2.5B - Asset Detail

- Shareable asset detail route
- Issuer and verified issuance information
- Recent transfer activity and network context
- Supply, holder count, price, and historical charts only where a reliable data
  source exists
- Clear unavailable and stale-data states

#### v2.5C - Local Watchlist

- Bookmark favorite assets without an account
- Browser-local persistence
- Watchlist filtering within Token Explorer

Asset alert delivery is not part of v2.5. It remains planned for the later
automation milestone because it requires additional monitoring and delivery
infrastructure.

## Future Milestones

### v3.0 - Wallet Identity

- Shareable watch-only address profile (`/address/:identity`)
- On-chain activity summary based on verifiable data
- Wallet age, transaction, and staking context where supported
- Shareable profile image and pre-filled social post
- Reputation or achievements only after objective scoring criteria are defined

### v3.5 - Portfolio Analytics

- Asset allocation
- Historical portfolio value
- Net worth chart
- Profit and loss tracking where acquisition-cost data is available
- Top mover summaries
- Diversification context with a documented methodology

### v4.0 - Automation & AI

- Large-transaction monitoring using Qubic Event Logs
- Asset watchlist alerts
- Automated portfolio summaries
- Explainable risk signals based on documented inputs
- AI-assisted insights that distinguish facts, estimates, and recommendations

## Delivery Principles

- **Qubic-native:** use epoch, tick, identity, and contract conventions rather
  than applying EVM assumptions.
- **Watch-only by default:** QubicPulse never requests a seed phrase or private
  key.
- **Evidence before claims:** user-facing metrics must map to a verified source;
  unavailable data is labeled rather than estimated silently.
- **Free infrastructure first:** public Qubic services and free hosting/API tiers
  remain the default, with their rate and availability limits documented.
- **Testable delivery:** a milestone is shipped only when its user-facing flow,
  failure states, validation, and production deployment are complete.

## Links

- **Live product:** [qubicpulse.pages.dev](https://qubicpulse.pages.dev)
- **Source code:** [github.com/ledgervibes/qubicpulse](https://github.com/ledgervibes/qubicpulse)
- **Telegram bot:** [@qubic_pulse_bot](https://t.me/qubic_pulse_bot)

**Last updated:** 2026-08-10
