# XPay Labs (xpay) Merchant Dashboard — Vue 3 Admin Panel for Crypto Payment Gateway

English | [中文](README.zh.md)

**XPay Labs (xpay) Merchant Dashboard** is the merchant-facing admin panel for the [XPay Labs](https://www.xpaylabs.com) self-hosted crypto payment gateway. Built with Vue 3 + Element Plus + TypeScript + Vite 6, it provides a full-featured management interface for merchants to monitor orders, manage assets, configure payout addresses, track collections, and handle settlements.

Part of the overall XPay Labs deployment — runs alongside the Java backend and checkout page.

## Features

- **Order Management** — View, filter, and manage collection and payout orders in real-time
- **Asset Dashboard** — Multi-chain balance monitoring (TRON, EVM, SUI) with portfolio overview
- **Deposit Address Management** — Per-order unique address generation and lifecycle tracking
- **Payout Processing** — Initiate and track cryptocurrency payouts to external addresses
- **Settlement Controls** — Configure automated hot-to-cold wallet sweeps
- **Webhook Logs** — View callback delivery history with retry controls
- **API Credentials** — Manage merchant tokens with HMAC-SHA256 signing
- **Fee Configuration** — Platform operators set per-merchant fee structures
- **Multi-language** — Chinese (ZH) and English (EN) UI
- **Role-based Access Control** — Fine-grained permissions via dynamic routes and button-level directives

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Vue 3.5 + TypeScript |
| **UI Library** | Element Plus 2.9 |
| **Build Tool** | Vite 6 + UnoCSS |
| **State** | Pinia 3 |
| **Router** | Vue Router (dynamic routes fetched from backend) |
| **i18n** | vue-i18n (ZH/EN) |
| **API** | Axios with RSA/AES encryption |
| **Blockchain** | ethers, tronweb |

## Architecture Highlights

- **Dynamic Routing**: Routes are not hard-coded. Backend returns a menu tree on login; frontend maps string component paths to lazy-loaded `.vue` files via `import.meta.glob`
- **Encrypted API**: All POST/PUT requests are AES-encrypted with RSA-wrapped keys when `VITE_APP_ENCRYPT=true`
- **Auto-imports**: Vue/Pinia/ElementPlus APIs auto-imported — no manual `import` needed for `ref`, `reactive`, `ElMessage`, etc.
- **Permission System**: Button-level access via `v-hasPermi` / `v-hasRole` custom directives

## Quick Start

```bash
npm install
npm run dev              # Vite dev server (proxied to :8078)
npm run build:prod       # Production build
npm run build:dev        # Development build
npm run lint:eslint      # ESLint check
npm run prettier         # Prettier format
```

## Related Projects

- [XPay Labs Website](https://github.com/yan253319066/XPayLabs-website)
- [Java Backend](https://github.com/yan253319066/XPayLabs-java)
- [Checkout Page](https://github.com/yan253319066/XPayLabs-checkout)
- [Docker Deployment](https://github.com/yan253319066/XPayLabs-docker)

## License

Copyright (C) 2026 XPay Labs

This program is free software under the [GNU General Public License v3.0](LICENSE).
